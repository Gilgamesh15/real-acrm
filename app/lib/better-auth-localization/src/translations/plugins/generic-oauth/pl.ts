import type { GenericOAuthErrorCodesType } from "../../../types";

export const PL_PL = {
  // Generic OAuth related errors
  INVALID_OAUTH_CONFIGURATION: "Nieprawidłowa konfiguracja OAuth",
} satisfies GenericOAuthErrorCodesType;

export const LOCALES = {
  "pl-PL": PL_PL,
} as const;
