import * as plugins from "../translations/plugins";
import type {
  AuthErrorCodesType,
  BuiltInLocales,
  ErrorCodesType,
} from "../types";

/**
 * Global utility function to create translation objects by automatically discovering and combining plugin translations
 * @param locale - The locale to extract translations for
 * @returns Combined translation object for the specified locale
 */
export function createTranslationObject(
  locale: BuiltInLocales,
  authTranslations: AuthErrorCodesType
): ErrorCodesType & AuthErrorCodesType {
  let result: ErrorCodesType = {
    ...authTranslations,
  };

  // Gather all exported plugin translation objects into a list
  const pluginTranslations = Object.values(plugins);
  for (const pluginTranslation of pluginTranslations) {
    const translations =
      pluginTranslation?.[locale as keyof typeof pluginTranslation];
    if (translations) {
      result = {
        ...result,
        ...translations,
      };
    }
  }

  return result;
}
