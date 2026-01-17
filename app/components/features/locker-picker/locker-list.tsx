import { AlertCircleIcon, ChevronRight } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Error,
  ErrorCode,
  ErrorDescription,
  ErrorMedia,
  ErrorTitle,
} from "~/components/ui/error";
import { Skeleton } from "~/components/ui/skeleton";

import type { InpostApiLocker } from "~/lib/types";
import { cn } from "~/lib/utils";

import { LockerInfo } from "./locker-info";

const LockerList = ({
  className,
  onLockerClick,
  selectedLocker,
  lockers,
  isLoading,
  error,
}: React.ComponentProps<"div"> & {
  onLockerClick: (locker: InpostApiLocker) => void;
  selectedLocker?: InpostApiLocker;
  lockers: InpostApiLocker[];
  isLoading: boolean;
  error?: string;
}) => {
  if (error) {
    return (
      <Error>
        <ErrorMedia>
          <AlertCircleIcon />
        </ErrorMedia>
        <ErrorCode>
          <ErrorTitle>Wystąpił błąd</ErrorTitle>
          <ErrorDescription>{error}</ErrorDescription>
        </ErrorCode>
      </Error>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("overflow-y-auto divide-y", className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="h-[140px] p-2 flex flex-col gap-2" key={index}>
            <Skeleton className="h-[20px] w-[160px]" />
            <div className="flex items-center gap-3">
              <Skeleton className="size-[64px]" />
              <div className="flex-1 space-y-2">
                <div className="flex flex-col gap-0.5">
                  <Skeleton className="h-[10px] w-3/4" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Skeleton className="h-[10px] w-full" />
                  <Skeleton className="h-[10px] w-1/6" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Skeleton className="h-[10px] w-7/8" />
                  <Skeleton className="h-[10px] w-4/5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (lockers.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col gap-4 items-center justify-center p-8",
          className
        )}
      >
        <p className="text-sm text-gray-400 text-center">
          Brak punktów odbioru w okolicy
        </p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-y-auto divide-y", className)}>
      {lockers.map((locker) => (
        <Button
          type="button"
          variant={locker.name === selectedLocker?.name ? "secondary" : "ghost"}
          key={locker.name}
          className="h-auto whitespace-normal w-full justify-between"
          onClick={() => onLockerClick(locker)}
        >
          <LockerInfo locker={locker} />

          <ChevronRight />
        </Button>
      ))}
    </div>
  );
};

export { LockerList };
