import { Fragment } from "react";
import { cn } from "~/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: { label: string }[];
  step: number;
  className?: string;
}

export const StepIndicator = ({
  step,
  steps,
  className,
}: StepIndicatorProps) => {
  return (
    <div className={cn("w-full mb-8", className)}>
      <div className="flex items-center justify-evenly relative">
        {steps.map((stepItem, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < step;
          const isActive = stepNumber === step;
          const isUpcoming = stepNumber > step;
          const isLast = index === steps.length - 1;

          return (
            <Fragment key={index}>
              <div className="flex flex-col items-center relative z-10">
                {/* Step Circle */}
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium transition-all duration-300",
                    {
                      "bg-primary border-primary text-primary-foreground":
                        isActive || isCompleted,
                      "bg-background border-muted-foreground/25 text-muted-foreground":
                        isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-3 text-center absolute top-full">
                  <p
                    className={cn(
                      "text-xs sm:text-sm font-medium transition-colors duration-300",
                      {
                        "text-primary": isActive,
                        "text-foreground": isCompleted,
                        "text-muted-foreground": isUpcoming,
                      }
                    )}
                  >
                    {stepItem.label}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-2">
                  <div className="relative h-full">
                    <div className="absolute inset-0 bg-muted-foreground/25" />
                    <div
                      className={cn(
                        "absolute inset-0 bg-primary transition-all duration-500 ease-out",
                        {
                          "w-full": stepNumber < step,
                          "w-0": stepNumber >= step,
                        }
                      )}
                    />
                  </div>
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};
