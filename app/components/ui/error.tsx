import { cn } from "~/lib/utils";

function Error({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="error"
      className={cn(
        "flex flex-col items-center text-center p-3 gap-1",
        className
      )}
      {...props}
    />
  );
}

function ErrorMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="error-icon"
      className={cn(
        "text-destructive-foreground [&>svg]:stroke-[1.5] [&>svg]:shrink-0 [&>svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-7 mb-1",
        className
      )}
      {...props}
    />
  );
}

function ErrorTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="error-title"
      className={cn(
        "text-sm font-semibold text-destructive-foreground",
        className
      )}
      {...props}
    />
  );
}

function ErrorDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="error-description"
      className={cn("text-muted-foreground text-xs leading-snug", className)}
      {...props}
    />
  );
}

function ErrorContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="error-content"
      className={cn(
        "flex w-full max-w-xs min-w-0 flex-col items-center gap-1 text-balance",
        className
      )}
      {...props}
    />
  );
}

function ErrorCode({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="error-code"
      className={cn(
        "mt-0.5 text-[10px] font-mono text-muted-foreground/50",
        className
      )}
      {...props}
    />
  );
}

export {
  Error,
  ErrorMedia,
  ErrorTitle,
  ErrorDescription,
  ErrorContent,
  ErrorCode,
};
