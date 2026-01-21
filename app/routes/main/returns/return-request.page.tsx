import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { StepIndicator } from "~/components/ui/step-indicator";

import { cn, formatCurrency, priceFromGrosz } from "~/lib/utils";

const returnSchema = z.object({
  orderVerification: z.object({
    orderNumber: z.string().min(1, "Numer zamówienia jest wymagany"),
    email: z.string().email("Nieprawidłowy adres e-mail"),
  }),
  orderItemIds: z
    .array(z.string())
    .min(1, "Wybierz przynajmniej jeden przedmiot"),
  email: z.string().email("Nieprawidłowy adres e-mail"),
});

type OrderForReturn = {
  id: string;
  orderNumber: string;
  items: Array<{
    id: string;
    pieceId: string;
    pieceName: string;
    pieceImage: string | null;
    unitPriceInGrosz: number;
    lineTotalInGrosz: number;
    discountAmountInGrosz: number;
  }>;
};

type OrderFetcherData = {
  success: boolean;
  order?: OrderForReturn;
  error?: string;
};

type SubmitFetcherData = {
  success: boolean;
  returnNumber?: string;
  error?: string;
};

export default function ReturnRequestPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [order, setOrder] = useState<OrderForReturn | null>(null);

  const orderFetcher = useFetcher<OrderFetcherData>();
  const submitFetcher = useFetcher<SubmitFetcherData>();

  const form = useForm({
    defaultValues: {
      orderVerification: { orderNumber: "", email: "" },
      orderItemIds: [] as string[],
      email: "",
    },
    validators: {
      onSubmit: returnSchema,
    },
    onSubmit: async ({ value }) => {
      if (!order) return;

      const formData = new FormData();
      formData.append("orderId", order.id);
      formData.append("email", value.email);
      value.orderItemIds.forEach((id) => formData.append("orderItemIds", id));

      submitFetcher.submit(formData, {
        method: "post",
        action: "/api/create-return",
      });
    },
  });

  // Handle order fetch response
  useEffect(() => {
    if (orderFetcher.data?.success && orderFetcher.data.order) {
      setOrder(orderFetcher.data.order);
      setStep(2);
    } else if (
      orderFetcher.data &&
      !orderFetcher.data.success &&
      orderFetcher.data.error
    ) {
      toast.error(orderFetcher.data.error);
    }
  }, [orderFetcher.data]);

  // Handle submit response
  useEffect(() => {
    if (submitFetcher.data?.success && submitFetcher.data.returnNumber) {
      toast.success("Wniosek o zwrot został utworzony");
      navigate(`/zwroty/sukces/${submitFetcher.data.returnNumber}`);
    } else if (
      submitFetcher.data &&
      !submitFetcher.data.success &&
      submitFetcher.data.error
    ) {
      toast.error(submitFetcher.data.error);
    }
  }, [submitFetcher.data, navigate]);

  const validateOrder = () => {
    const { orderNumber, email } = form.state.values.orderVerification;
    if (!orderNumber || !email) {
      toast.error("Wypełnij wszystkie pola");
      return;
    }
    orderFetcher.load(
      `/api/return-order?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`
    );
  };

  const goToStep3 = () => {
    const selectedItems = form.state.values.orderItemIds;
    if (selectedItems.length === 0) {
      toast.error("Wybierz przynajmniej jeden przedmiot do zwrotu");
      return;
    }
    setStep(3);
  };

  const isLoading =
    orderFetcher.state === "loading" || submitFetcher.state === "submitting";

  const selectedTotal = order
    ? order.items
        .filter((item) => form.state.values.orderItemIds.includes(item.id))
        .reduce((sum, item) => sum + item.lineTotalInGrosz, 0)
    : 0;

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
              { label: "Wybór przedmiotów" },
              { label: "Potwierdzenie" },
            ]}
            className="mx-auto w-3/4"
          />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex flex-col gap-6 max-w-2xl mx-auto w-full"
      >
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Weryfikacja zamówienia</CardTitle>
              <CardDescription>
                Wprowadź dane zamówienia, aby rozpocząć proces zwrotu
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <form.Field
                name="orderVerification.orderNumber"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Numer zamówienia
                      </FieldLabel>
                      <Input
                        id={field.name}
                        placeholder="ABC1234567"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.value.toUpperCase())
                        }
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
                name="orderVerification.email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Adres e-mail</FieldLabel>
                      <Input
                        id={field.name}
                        type="email"
                        placeholder="jan.kowalski@example.com"
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

              <Button
                type="button"
                onClick={validateOrder}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Weryfikuję..." : "Weryfikuj zamówienie"}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && order && (
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
                        {order.items.map((item) => {
                          const isSelected = field.state.value.includes(
                            item.id
                          );

                          const handleToggle = () => {
                            if (isSelected) {
                              const index = field.state.value.indexOf(item.id);
                              if (index > -1) {
                                field.removeValue(index);
                              }
                            } else {
                              field.pushValue(item.id);
                            }
                          };

                          return (
                            <div
                              key={item.id}
                              className={cn(
                                "flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors",
                                isSelected && "border-primary bg-primary/5"
                              )}
                              onClick={handleToggle}
                            >
                              <Field
                                orientation="horizontal"
                                data-invalid={isInvalid}
                              >
                                <Checkbox
                                  id={`item-${item.id}`}
                                  name={field.name}
                                  checked={isSelected}
                                  aria-invalid={isInvalid}
                                  onClick={(e) => e.stopPropagation()}
                                  onCheckedChange={handleToggle}
                                />
                              </Field>
                              <img
                                src={item.pieceImage ?? "/placeholder.svg"}
                                alt={item.pieceName}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">
                                  {item.pieceName}
                                </h4>
                                {item.discountAmountInGrosz > 0 && (
                                  <p className="text-sm text-muted-foreground line-through">
                                    {formatCurrency(
                                      priceFromGrosz(item.unitPriceInGrosz)
                                    )}
                                  </p>
                                )}
                              </div>
                              <span className="font-medium">
                                {formatCurrency(
                                  priceFromGrosz(item.lineTotalInGrosz)
                                )}
                              </span>
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
                  <span className="text-muted-foreground">Suma do zwrotu:</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(priceFromGrosz(selectedTotal))}
                  </span>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep(1);
                    setOrder(null);
                    form.setFieldValue("orderItemIds", []);
                  }}
                >
                  Powrót
                </Button>
                <Button
                  type="button"
                  onClick={goToStep3}
                  disabled={form.state.values.orderItemIds.length === 0}
                  className="flex-1"
                >
                  Dalej
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && order && (
          <Card>
            <CardHeader>
              <CardTitle>Potwierdzenie zwrotu</CardTitle>
              <CardDescription>
                Podaj adres e-mail do potwierdzenia wniosku o zwrot
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="space-y-2">
                <h4 className="font-medium">
                  Przedmioty do zwrotu ({form.state.values.orderItemIds.length})
                </h4>
                <div className="space-y-2">
                  {order.items
                    .filter((item) =>
                      form.state.values.orderItemIds.includes(item.id)
                    )
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 text-sm"
                      >
                        <img
                          src={item.pieceImage ?? "/placeholder.svg"}
                          alt={item.pieceName}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <span className="flex-1 truncate">
                          {item.pieceName}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            priceFromGrosz(item.lineTotalInGrosz)
                          )}
                        </span>
                      </div>
                    ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-muted-foreground">Suma:</span>
                  <span className="font-bold">
                    {formatCurrency(priceFromGrosz(selectedTotal))}
                  </span>
                </div>
              </div>

              <form.Field
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        E-mail do potwierdzenia
                      </FieldLabel>
                      <Input
                        id={field.name}
                        type="email"
                        placeholder="jan.kowalski@example.com"
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

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  disabled={isLoading}
                >
                  Powrót
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Wysyłanie..." : "Wyślij wniosek o zwrot"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </main>
  );
}
