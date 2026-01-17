import { createFormHook } from "@tanstack/react-form";
import { createFormHookContexts } from "@tanstack/react-form";

import { ComboboxField } from "./combobox-field";
import { ImageField } from "./image-field";
import { ImagesField } from "./images-field";
import { MeasurementsField } from "./measurements-field";
import { MultiComboboxField } from "./multi-combobox-field";
import { NumberField } from "./number-field";
import { RichTextField } from "./rich-text-field";
import { SelectField } from "./select-field";
import { TagsField } from "./tag-field";
import { TextField } from "./text-field";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    SelectField,
    ComboboxField,
    MultiComboboxField,
    TagsField,
    ImageField,
    ImagesField,
    RichTextField,
    MeasurementsField,
    NumberField,
  },
  formComponents: {},
});
