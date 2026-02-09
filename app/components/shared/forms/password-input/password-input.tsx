import { EyeClosedIcon, EyeIcon } from "lucide-react";
import React from "react";

import { PASSWORD_CONDITIONS_COUNT, PasswordSchema } from "~/lib/schemas";
import { cn } from "~/lib/utils";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../../../ui/input-group";
import { StatusBar, StatusSegment } from "../../../ui/status-bar";

export const PasswordInput = ({
  className,
  value,
  onValueChange: setValue,
  variant = "new-password",
  ...inputProps
}: Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange"
> & {
  value: string;
  onValueChange: (value: string) => void;
  variant?: "new-password" | "current-password";
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const strength = getPasswordStrength(value);
  const hasValue = value.length > 0;

  return (
    <div className={cn("flex flex-col", className)}>
      <InputGroup>
        <InputGroupInput
          type={showPassword ? "text" : "password"}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete={variant}
          {...inputProps}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            data-show-password={showPassword}
            size="icon-sm"
            onClick={() => setShowPassword(!showPassword)}
            className="hover:bg-transparent data-[show-password=true]:text-accent-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeIcon /> : <EyeClosedIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {variant === "new-password" && (
        <>
          <StatusBar className="mt-2">
            {Array.from({ length: PASSWORD_CONDITIONS_COUNT }).map(
              (_, index) => (
                <StatusSegment
                  key={index}
                  variant={
                    index < strength && hasValue
                      ? getPasswordStrengthVariant(strength)
                      : "inactive"
                  }
                />
              )
            )}
          </StatusBar>
          <p
            className={cn(
              "text-sm ml-auto mt-1 text-muted-foreground relative h-0",
              hasValue ? "opacity-100" : "opacity-0",
              className
            )}
          >
            {getPasswordStrengthText(strength)}
          </p>
        </>
      )}
    </div>
  );
};

const getPasswordStrength = (value: string) => {
  const result = PasswordSchema.safeParse(value);

  if (result.success) {
    return PASSWORD_CONDITIONS_COUNT;
  }

  return PASSWORD_CONDITIONS_COUNT - (result.error.issues.length || 0);
};

const PASSWORD_STRENGTH_LABELS = {
  0: "Bardzo słabe",
  1: "Słabe",
  2: "Słabe",
  3: "Średnie",
  4: "Silne",
  5: "Silne",
  6: "Bardzo silne",
} as const;

const getPasswordStrengthText = (strength: number) => {
  return PASSWORD_STRENGTH_LABELS[
    Math.min(
      strength,
      PASSWORD_CONDITIONS_COUNT
    ) as keyof typeof PASSWORD_STRENGTH_LABELS
  ];
};

const getPasswordStrengthVariant = (
  strength: number
): React.ComponentProps<typeof StatusSegment>["variant"] => {
  if (strength === 0) return "error";
  if (strength === PASSWORD_CONDITIONS_COUNT) return "success";

  const ratio = strength / PASSWORD_CONDITIONS_COUNT;
  if (ratio <= 0.25) return "error";
  if (ratio <= 0.5) return "warning";
  if (ratio <= 0.75) return "info";
  return "success";
};
