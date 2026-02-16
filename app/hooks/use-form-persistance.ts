import type { AnyFormApi } from "@tanstack/react-form";
import React from "react";
import { toast } from "sonner";
import SuperJSON from "superjson";

export function useFormPersistence(
  formId: string,
  form: AnyFormApi,
  defaultValue: any
) {
  React.useEffect(() => {
    const subscription = form.store.subscribe(() => {
      localStorage.setItem(formId, SuperJSON.stringify(form.state.values));
    });
    return () => subscription();
  }, [formId, form]);

  React.useEffect(() => {
    const stored = localStorage.getItem(formId);
    if (stored) {
      toast("Zostały wczytane dane formularza", {
        action: {
          label: "Zresetuj",
          onClick: () => {
            form.reset(defaultValue);
            localStorage.removeItem(formId);
          },
        },
      });
    }
  }, [formId, form, defaultValue]);
}

export function getPersistedDefaultValue<T>(
  formId: string,
  defaultValue: T
): T {
  const stored = localStorage.getItem(formId);
  if (stored) {
    try {
      return SuperJSON.parse(stored);
    } catch {
      localStorage.removeItem(formId);
    }
  }
  return defaultValue;
}
