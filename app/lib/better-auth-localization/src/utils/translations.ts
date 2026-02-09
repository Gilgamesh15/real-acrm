import type {
  AvailableLocales,
  ErrorCodesType,
  PartialErrorCodesType,
  Translations,
} from "../types";

export const getTranslation = <
  TCustomTranslations extends Record<string, PartialErrorCodesType>,
>(
  code: keyof ErrorCodesType,
  locale: AvailableLocales<TCustomTranslations>,
  fallbackLocale: AvailableLocales<TCustomTranslations>,
  mergedTranslations: Translations<TCustomTranslations>,
  originalMessage?: string
) => {
  if (locale === "default") return originalMessage || code;

  const translation = mergedTranslations[locale]?.[code];
  if (translation) return translation;

  if (fallbackLocale !== locale && fallbackLocale !== "default") {
    const fallbackTranslation = mergedTranslations[fallbackLocale]?.[code];
    if (fallbackTranslation) return fallbackTranslation;
  }

  return originalMessage || code;
};
