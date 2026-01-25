import { AlertCircleIcon, SearchIcon } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import {
  Error,
  ErrorContent,
  ErrorDescription,
  ErrorMedia,
  ErrorTitle,
} from "~/components/ui/error";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import { Spinner } from "~/components/ui/spinner";

import { useSearch } from "~/hooks/use-search";
import { calculateProductPrice, priceFromGrosz } from "~/lib/utils";

import {
  ProductCardContent,
  ProductCardImage,
  ProductCardInfo,
  ProductCardMedia,
  ProductCardPrice,
  ProductCardRoot,
} from "../product-card/product-card-primitives";

function NavSearch({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const { search, setSearch, data, isLoading, error, isError, hasSearch } =
    useSearch();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={className}
          variant="ghost"
          size="icon"
          aria-label="Szukaj"
        >
          <SearchIcon />
        </Button>
      </DialogTrigger>

      <DialogContent className="overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Szukaj</DialogTitle>
          <DialogDescription>Szukaj ubrań i projektów</DialogDescription>
        </DialogHeader>
        <div>
          <InputGroup className="flex h-12 border-0 border-b">
            <InputGroupAddon align="inline-start">
              <SearchIcon className="size-4 opacity-50" />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              placeholder="Szukaj..."
              onChange={(e) => setSearch(e.target.value)}
              className="outline-hidden"
            />
          </InputGroup>

          <div className="max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto">
            {isError ? (
              <div className="flex-1 size-full flex items-center justify-center p-4">
                <Error>
                  <ErrorMedia>
                    <AlertCircleIcon />
                  </ErrorMedia>
                  <ErrorContent>
                    <ErrorTitle>Wystąpił błąd</ErrorTitle>
                    <ErrorDescription>{error?.message}</ErrorDescription>
                  </ErrorContent>
                </Error>
              </div>
            ) : isLoading ? (
              <div className="space-y-1 flex items-center justify-center h-[300px]">
                <Spinner className="size-10" />
              </div>
            ) : !hasSearch ? (
              <div className="flex-1 size-full flex items-center justify-center p-4">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SearchIcon />
                    </EmptyMedia>
                    <EmptyTitle>Zacznij szukać</EmptyTitle>
                    <EmptyDescription>
                      Wpisz słowa kluczowe do wyszukiwania, aby znaleźć ubrania
                      i projekty
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            ) : data && data.length === 0 && hasSearch ? (
              <div className="flex-1 size-full flex items-center justify-center p-4">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SearchIcon />
                    </EmptyMedia>
                    <EmptyTitle>Brak wyników</EmptyTitle>
                    <EmptyDescription>
                      Nie znaleziono żadnych produktów pasujących do
                      wyszukiwania
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            ) : data && data.length > 0 ? (
              <div className="space-y-1">
                {data.map((item) => {
                  if (item._type === "piece") {
                    const [primaryImage] = item.images;
                    return (
                      <ProductCardRoot size="sm">
                        <ProductCardMedia size="md">
                          <ProductCardImage
                            url={primaryImage?.url || ""}
                            alt={primaryImage?.alt || ""}
                            onClick={() => {
                              navigate(`/ubrania/${item.slug}`);
                              setOpen(false);
                            }}
                          />
                        </ProductCardMedia>
                        <ProductCardContent orientation="horizontal">
                          <ProductCardInfo
                            orientation="vertical"
                            name={item.name}
                            onClick={() => {
                              navigate(`/ubrania/${item.slug}`);
                              setOpen(false);
                            }}
                            brand={item.brand.name}
                            size={item.size.name}
                          />
                          <ProductCardPrice
                            price={priceFromGrosz(item.priceInGrosz)}
                          />
                        </ProductCardContent>
                      </ProductCardRoot>
                    );
                  }
                  const [primaryImage] = item.images;
                  return (
                    <ProductCardRoot size="sm">
                      <ProductCardMedia size="md">
                        <ProductCardImage
                          url={primaryImage?.url || ""}
                          alt={primaryImage?.alt || ""}
                          onClick={() => {
                            navigate(`/projekty/${item.slug}`);
                            setOpen(false);
                          }}
                        />
                      </ProductCardMedia>
                      <ProductCardContent orientation="horizontal">
                        <ProductCardInfo
                          orientation="vertical"
                          name={item.name}
                          onClick={() => {
                            navigate(`/projekty/${item.slug}`);
                            setOpen(false);
                          }}
                          textSize="default"
                        />
                        <ProductCardPrice
                          price={priceFromGrosz(
                            calculateProductPrice(item).lineTotalInGrosz
                          )}
                        />
                      </ProductCardContent>
                    </ProductCardRoot>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { NavSearch };
