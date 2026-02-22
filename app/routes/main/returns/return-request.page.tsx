import { useForm } from "@tanstack/react-form";
import * as schema from "db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { redirect, useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

import {
  ProductCardContent,
  ProductCardImage,
  ProductCardInfo,
  ProductCardMedia,
  ProductCardPrice,
  ProductCardRoot,
  ProductCardToggle,
} from "~/components/features/product-card/product-card-primitives";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { StepIndicator } from "~/components/ui/step-indicator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { db } from "~/lib/db";
import {
  cn,
  formatCurrency,
  groupOrderItems,
  orderStatusFromOrder,
  priceDataToDisplayData,
  priceFromGrosz,
} from "~/lib/utils";

import type { Route } from "./+types/return-request.page";

const PAGE_TITLE = "Zwrot zamówienia | ACRM";

export const meta: Route.MetaFunction = () => [{ title: PAGE_TITLE }];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const orderNumber = url.searchParams.get("orderNumber");
  const email = url.searchParams.get("email");

  if (!orderNumber || !email) {
    return { order: null };
  }

  const order = await db.query.orders.findFirst({
    where: and(
      eq(schema.orders.orderNumber, orderNumber.toUpperCase()),
      eq(schema.orders.email, email.toLowerCase())
    ),
    with: {
      events: { orderBy: desc(schema.orderTimelineEvents.timestamp) },
      items: {
        with: {
          product: {
            with: {
              images: { limit: 1, orderBy: asc(schema.images.displayOrder) },
            },
          },
          piece: {
            with: {
              images: { limit: 1, orderBy: asc(schema.images.displayOrder) },
              brand: true,
              size: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw redirect("/zwroty");
  }

  const status = orderStatusFromOrder(order);
  if (status === "pending" || status === "cancelled") {
    throw redirect("/zwroty");
  }

  const hasEligibleItems = order.items.some(
    (item) => item.piece.status === "sold"
  );
  if (!hasEligibleItems) {
    throw redirect("/zwroty");
  }

  return {
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      deliveryName: order.deliveryName,
      phoneNumber: order.phoneNumber,
      email: order.email,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        pieceId: item.pieceId,
        product: item.product
          ? {
              id: item.product.id,
              name: item.product.name,
              images: item.product.images,
            }
          : null,
        piece: {
          id: item.piece.id,
          name: item.piece.name,
          status: item.piece.status,
          images: item.piece.images,
          brand: item.piece.brand,
          size: item.piece.size,
        },
        unitPriceInGrosz: item.unitPriceInGrosz,
        lineTotalInGrosz: item.lineTotalInGrosz,
        discountAmountInGrosz: item.discountAmountInGrosz,
        taxInGrosz: item.taxInGrosz,
      })),
    },
  };
}

type OrderForReturn = {
  id: string;
  orderNumber: string;
  deliveryName: string | null;
  phoneNumber: string | null;
  email: string;
  items: Array<{
    id: string;
    productId: string | null;
    pieceId: string;
    product: {
      id: string;
      name: string;
      images: Array<{ url: string; alt: string | null }>;
    } | null;
    piece: {
      id: string;
      name: string;
      status: string;
      images: Array<{ url: string; alt: string | null }>;
      brand: { id: string; name: string } | null;
      size: { id: string; name: string } | null;
    };
    unitPriceInGrosz: number;
    lineTotalInGrosz: number;
    discountAmountInGrosz: number;
    taxInGrosz: number;
  }>;
};

type SubmitFetcherData = {
  success: boolean;
  error?: string;
};

const returnFormSchema = z.object({
  customerInfo: z.object({
    name: z.string().min(1, "Imię i nazwisko jest wymagane"),
    phoneNumber: z.string().min(1, "Numer telefonu jest wymagany"),
    email: z.string().email("Nieprawidłowy adres e-mail"),
  }),
  orderItemIds: z
    .array(z.string())
    .min(1, "Wybierz przynajmniej jeden przedmiot"),
});

export default function ReturnRequestPage({
  loaderData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const order = loaderData.order as OrderForReturn | null;
  const step: 1 | 2 = order ? 2 : 1;

  const [orderNumberInput, setOrderNumberInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const submitFetcher = useFetcher<SubmitFetcherData>();

  const form = useForm({
    defaultValues: {
      customerInfo: {
        name: order?.deliveryName ?? "",
        phoneNumber: order?.phoneNumber ?? "",
        email: order?.email ?? "",
      },
      orderItemIds: [] as string[],
    },
    validators: {
      onSubmit: returnFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!order) return;

      const formData = new FormData();
      formData.append("orderId", order.id);
      formData.append("customerName", value.customerInfo.name);
      formData.append("customerPhone", value.customerInfo.phoneNumber);
      formData.append("customerEmail", value.customerInfo.email);
      value.orderItemIds.forEach((id) => formData.append("orderItemIds", id));

      submitFetcher.submit(formData, {
        method: "post",
        action: "/api/create-return",
      });
    },
  });

  useEffect(() => {
    if (submitFetcher.data?.success) {
      toast.success("Zgłoszenie zwrotu zostało przyjęte");
      navigate("/zwroty/sukces");
    } else if (
      submitFetcher.data &&
      !submitFetcher.data.success &&
      submitFetcher.data.error
    ) {
      toast.error(submitFetcher.data.error);
    }
  }, [submitFetcher.data, navigate]);

  const isSubmitting = submitFetcher.state === "submitting";

  const handleVerifyOrder = () => {
    if (!orderNumberInput || !emailInput) {
      toast.error("Wypełnij wszystkie pola");
      return;
    }
    navigate(
      `/zwroty?orderNumber=${encodeURIComponent(orderNumberInput)}&email=${encodeURIComponent(emailInput)}`
    );
  };

  const selectedTotal = order
    ? order.items
        .filter((item) => form.state.values.orderItemIds.includes(item.id))
        .reduce((sum, item) => sum + item.lineTotalInGrosz, 0)
    : 0;

  const grouped = order ? groupOrderItems(order.items) : null;

  return (
    <main className={cn("flex flex-col h-full flex-1 px-4 md:px-8 py-6")}>
      <div>
        <div className="flex flex-col items-center mb-12 gap-2">
          <h1 className="text-4xl font-bold leading-tight text-center tracking-tight">
            Zwrot zamówienia
          </h1>
          <p className="text-sm text-muted-foreground text-center max-w-2xl mb-2">
            Postępuj zgodnie z poniższymi krokami, aby złożyć wniosek o zwrot
          </p>

          <StepIndicator
            step={step}
            steps={[
              { label: "Weryfikacja zamówienia" },
              { label: "Zgłoszenie zwrotu" },
            ]}
            className="mx-auto w-3/4"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Weryfikacja zamówienia</CardTitle>
              <CardDescription>
                Wprowadź dane zamówienia, aby rozpocząć proces zwrotu
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <Field>
                <FieldLabel htmlFor="orderNumber">Numer zamówienia</FieldLabel>
                <Input
                  id="orderNumber"
                  placeholder="ABC1234567"
                  value={orderNumberInput}
                  onChange={(e) =>
                    setOrderNumberInput(e.target.value.toUpperCase())
                  }
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Adres e-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="jan.kowalski@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </Field>

              <Button
                type="button"
                onClick={handleVerifyOrder}
                className="w-full"
              >
                Weryfikuj zamówienie
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && order && grouped && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="flex flex-col gap-6"
          >
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Dane kontaktowe</CardTitle>
                <CardDescription>
                  Zweryfikuj swoje dane kontaktowe
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <form.Field
                  name="customerInfo.name"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Imię i nazwisko
                        </FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <form.Field
                  name="customerInfo.phoneNumber"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Numer telefonu
                        </FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <form.Field
                  name="customerInfo.email"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Adres e-mail
                        </FieldLabel>
                        <Input
                          id={field.name}
                          type="email"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </CardContent>
            </Card>

            {/* Item Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Wybierz przedmioty do zwrotu</CardTitle>
                <CardDescription>
                  Zaznacz, które przedmioty z zamówienia {order.orderNumber}{" "}
                  chcesz zwrócić
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <form.Field
                  name="orderItemIds"
                  mode="array"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <>
                        <FieldGroup data-slot="checkbox-group">
                          {grouped.products.map((product) => {
                            const orderItem = order.items.find(
                              (i) => i.product?.id === product.id
                            );
                            if (!orderItem) return null;

                            const pricing = priceDataToDisplayData(product);
                            const pieceStatus = orderItem.piece.status;
                            const isDisabled =
                              pieceStatus === "return_requested" ||
                              pieceStatus === "returned";
                            const isSelected = field.state.value.includes(
                              orderItem.id
                            );

                            const tooltipMessage =
                              pieceStatus === "return_requested"
                                ? "Zwrot tego przedmiotu został już zgłoszony"
                                : pieceStatus === "returned"
                                  ? "Ten przedmiot został już zwrócony"
                                  : "";

                            const handleToggle = () => {
                              if (isDisabled) return;
                              if (isSelected) {
                                const index = field.state.value.indexOf(
                                  orderItem.id
                                );
                                if (index > -1) field.removeValue(index);
                              } else {
                                field.pushValue(orderItem.id);
                              }
                            };

                            const card = (
                              <ProductCardRoot size="sm" key={product.id}>
                                {isDisabled ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center">
                                        <ProductCardToggle
                                          checked={false}
                                          onCheckedChange={() => {}}
                                          ariaInvalid={isInvalid}
                                        />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {tooltipMessage}
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <ProductCardToggle
                                    checked={isSelected}
                                    onCheckedChange={handleToggle}
                                    ariaInvalid={isInvalid}
                                  />
                                )}
                                <ProductCardMedia size="md">
                                  <ProductCardImage
                                    size="md"
                                    url={
                                      product.images?.[0]?.url ||
                                      orderItem.piece.images[0]?.url ||
                                      ""
                                    }
                                    alt={
                                      product.images?.[0]?.alt ||
                                      orderItem.piece.images[0]?.alt ||
                                      ""
                                    }
                                  />
                                </ProductCardMedia>
                                <ProductCardContent>
                                  <ProductCardInfo
                                    name={product.name}
                                    brand={orderItem.piece.brand?.name}
                                    size={orderItem.piece.size?.name}
                                  />
                                  <ProductCardPrice pricing={pricing} />
                                </ProductCardContent>
                              </ProductCardRoot>
                            );

                            return (
                              <div
                                key={product.id}
                                className={cn(
                                  "cursor-pointer transition-colors",
                                  isDisabled && "opacity-50 cursor-not-allowed",
                                  isSelected && "*:data-size:border-primary"
                                )}
                                onClick={handleToggle}
                              >
                                {card}
                              </div>
                            );
                          })}

                          {grouped.pieces.map((piece) => {
                            const orderItem = order.items.find(
                              (i) => i.pieceId === piece.id
                            );
                            if (!orderItem) return null;

                            const pricing = priceDataToDisplayData(piece);
                            const pieceStatus = orderItem.piece.status;
                            const isDisabled =
                              pieceStatus === "return_requested" ||
                              pieceStatus === "returned";
                            const isSelected = field.state.value.includes(
                              orderItem.id
                            );

                            const tooltipMessage =
                              pieceStatus === "return_requested"
                                ? "Zwrot tego przedmiotu został już zgłoszony"
                                : pieceStatus === "returned"
                                  ? "Ten przedmiot został już zwrócony"
                                  : "";

                            const handleToggle = () => {
                              if (isDisabled) return;
                              if (isSelected) {
                                const index = field.state.value.indexOf(
                                  orderItem.id
                                );
                                if (index > -1) field.removeValue(index);
                              } else {
                                field.pushValue(orderItem.id);
                              }
                            };

                            const card = (
                              <ProductCardRoot size="sm" key={piece.id}>
                                {isDisabled ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center">
                                        <ProductCardToggle
                                          checked={false}
                                          onCheckedChange={() => {}}
                                          ariaInvalid={isInvalid}
                                        />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {tooltipMessage}
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <ProductCardToggle
                                    checked={isSelected}
                                    onCheckedChange={handleToggle}
                                    ariaInvalid={isInvalid}
                                  />
                                )}
                                <ProductCardMedia size="md">
                                  <ProductCardImage
                                    size="md"
                                    url={piece.images?.[0]?.url || ""}
                                    alt={piece.images?.[0]?.alt || ""}
                                  />
                                </ProductCardMedia>
                                <ProductCardContent>
                                  <ProductCardInfo
                                    name={piece.name}
                                    brand={orderItem.piece.brand?.name}
                                    size={orderItem.piece.size?.name}
                                  />
                                  <ProductCardPrice pricing={pricing} />
                                </ProductCardContent>
                              </ProductCardRoot>
                            );

                            return (
                              <div
                                key={piece.id}
                                className={cn(
                                  "cursor-pointer transition-colors",
                                  isDisabled && "opacity-50 cursor-not-allowed",
                                  isSelected && "*:data-size:border-primary"
                                )}
                                onClick={handleToggle}
                              >
                                {card}
                              </div>
                            );
                          })}
                        </FieldGroup>

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </>
                    );
                  }}
                />

                {form.state.values.orderItemIds.length > 0 && (
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-muted-foreground">
                      Wybrano przedmiotów:{" "}
                      {form.state.values.orderItemIds.length}
                    </span>
                    <span className="font-bold text-lg">
                      {formatCurrency(priceFromGrosz(selectedTotal))}
                    </span>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/zwroty")}
                  >
                    Powrót
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      form.state.values.orderItemIds.length === 0 ||
                      isSubmitting
                    }
                    className="flex-1"
                  >
                    {isSubmitting
                      ? "Wysyłanie..."
                      : "Wyślij zgłoszenie zwrotu"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}

        {/* Return Policy Section - always visible */}
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Polityka zwrotów</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-1 mt-2 text-sm text-muted-foreground">
              <li>
                Masz prawo odstąpić od umowy w ciągu 14 dni kalendarzowych od
                daty otrzymania towaru, bez podawania przyczyny.
              </li>
              <li>
                Aby złożyć zwrot, wypełnij powyższy formularz lub wyślij
                wiadomość na adres{" "}
                <a
                  href="mailto:kontakt@acrm.pl"
                  className="underline font-medium text-foreground"
                >
                  kontakt@acrm.pl
                </a>
                .
              </li>
              <li>
                Zwrot płatności nastąpi niezwłocznie, nie później niż 14 dni
                kalendarzowych od otrzymania oświadczenia o odstąpieniu,
                za pośrednictwem oryginalnej metody płatności. Możemy wstrzymać
                zwrot do momentu otrzymania towaru lub potwierdzenia jego nadania.
              </li>
              <li>Koszty zwrotu towaru ponosi konsument.</li>
              <li>
                Adres do zwrotu: ul. Nad Sudołem 24/22, 31-228 Kraków.
              </li>
              <li>
                Pełna treść regulacji dostępna jest na stronie{" "}
                <a
                  href="/odstapienie-od-umowy"
                  className="underline font-medium text-foreground"
                >
                  Prawo odstąpienia od umowy
                </a>
                .
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </main>
  );
}
