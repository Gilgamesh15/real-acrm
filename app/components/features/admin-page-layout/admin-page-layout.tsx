import React from "react";

import { ButtonGroup } from "~/components/ui/button-group";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";

import { cn } from "~/lib/utils";

const AdminLayoutWrapper = ({ children }: { children?: React.ReactNode }) => {
  return <div className="flex min-h-dvh w-full  ">{children}</div>;
};

const AdminPageContainer = ({ children }: { children?: React.ReactNode }) => {
  return <div className="flex flex-1 flex-col">{children}</div>;
};

const AdminPageHeader = ({
  children,
  className,
  ...props
}: React.ComponentProps<"header">) => {
  return (
    <header
      className={cn("bg-card sticky top-0 z-50 border-b", className)}
      {...props}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="[&_svg]:size-5!" />
          <Separator orientation="vertical" className="hidden h-4! sm:block" />
        </div>
        {children}
      </div>
    </header>
  );
};

const AdminPageActions = ({
  className,
  ...props
}: React.ComponentProps<typeof ButtonGroup>) => {
  return (
    <div
      className={cn("flex items-center gap-1.5 md:gap-2", className)}
      {...props}
    />
  );
};

const AdminPageContent = ({
  children,
  className,
  ...props
}: React.ComponentProps<"main">) => {
  return (
    <main
      className={cn(
        "mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6",
        className
      )}
      {...props}
    >
      <div className="h-full flex flex-col gap-4">{children}</div>
    </main>
  );
};

const AdminPageFooter = ({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <footer className="h-fit py-4 border-t">
      <div
        className={cn(
          "mx-auto size-full max-w-7xl px-4 sm:px-6 flex w-full gap-4 flex-row items-center justify-between",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </footer>
  );
};

export {
  AdminLayoutWrapper,
  AdminPageActions,
  AdminPageContainer,
  AdminPageContent,
  AdminPageFooter,
  AdminPageHeader,
};
