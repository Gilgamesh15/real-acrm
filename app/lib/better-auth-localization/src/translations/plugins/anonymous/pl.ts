import type { AnonymousErrorCodesType } from "../../../types";

export const PL_PL = {
  // Anonymous related errors
  COULD_NOT_CREATE_SESSION: "Nie można utworzyć sesji",
  ANONYMOUS_USERS_CANNOT_SIGN_IN_AGAIN_ANONYMOUSLY:
    "Anonimowi użytkownicy nie mogą ponownie zalogować się anonimowo",
} satisfies AnonymousErrorCodesType;

export const LOCALES = {
  "pl-PL": PL_PL,
} as const;
