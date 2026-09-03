"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  Button,
  Checkbox,
  Field,
  Grid,
  GridItem,
  HStack,
  Input,
  NativeSelect,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import { useForm, Controller, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldConfig, FormValues } from "./types";
import { buildSchema } from "./buildSchema";

export interface DynamicFormProps {
  /** Declarative field list — drives both the UI and validation. */
  fields: FieldConfig[];
  /**
   * Existing values when editing; omit/leave undefined for a create form.
   * Accepts any plain entity object (e.g. a Company or MetalMast record) —
   * callers don't need to cast their domain type to FormValues.
   */
  defaultValues?: object | null;
  /** Called with validated values on submit. */
  onSubmit: (values: FormValues) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  /** Surface a server-side error above the actions row. */
  formError?: string | null;
  /** Number of columns in the layout grid (fields can span via colSpan). Default 2. */
  columns?: 1 | 2 | 3;
}

/**
 * react-hook-form (and buildSchema's zod string schemas) expect a string
 * or undefined for text-like fields — never null. API records commonly
 * come back with null for an unset optional column (e.g. Company.gstNo),
 * and feeding that straight into `defaultValues`/`reset` leaves it stuck
 * in the form's internal state as null: submitting then fails validation
 * with a confusing "Expected string, received null", and because that
 * field never has a valid string default, RHF can flip it between
 * controlled/uncontrolled across renders — which is what makes fields
 * appear to clear themselves. Coercing null to "" up front (checkboxes
 * excepted, where null is simply falsy/unchecked) avoids all of that.
 */
function sanitizeDefaultValues(
  fields: FieldConfig[],
  values?: object | null
): DefaultValues<FormValues> {
  const source = (values ?? {}) as FormValues;
  const result: FormValues = { ...source };

  for (const field of fields) {
    if (field.type !== "checkbox" && result[field.name] == null) {
      result[field.name] = "";
    }
  }

  return result as DefaultValues<FormValues>;
}

/**
 * Schema-driven form: pass a list of field descriptions and get a fully
 * validated Chakra form wired to react-hook-form + zod. Supports text,
 * number, password, email, select, date, checkbox and textarea inputs.
 *
 * Used for every create/edit form in the app (Company, Metal Master,
 * Challan Format, TranWt, Users, Login) so all forms share the same
 * layout, validation, and error/loading behavior.
 */
export function DynamicForm({
  fields,
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isSubmitting = false,
  formError,
  columns = 2,
}: DynamicFormProps) {
  const [schema] = useState(() => buildSchema(fields));

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: sanitizeDefaultValues(fields, defaultValues),
  });

  // Re-initialize the form only when we're handed a genuinely different
  // record to edit — not on every render. Callers commonly pass a fresh
  // fallback object for "create" mode (e.g. `editing ?? { active: true }`),
  // which is a new reference on every render; keying off JSON content
  // instead of reference means typing into the form never gets clobbered
  // by a spurious reset while the dialog is still open.
  const defaultValuesKey = defaultValues ? JSON.stringify(defaultValues) : "";
  const lastResetKey = useRef(defaultValuesKey);

  useEffect(() => {
    if (defaultValuesKey !== lastResetKey.current) {
      lastResetKey.current = defaultValuesKey;
      reset(sanitizeDefaultValues(fields, defaultValues));
    }
  }, [defaultValuesKey, defaultValues, fields, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const formRef = useRef<HTMLFormElement>(null);

  // Enter moves to the next field instead of submitting, matching how most
  // desktop data-entry forms behave — the exceptions are: a <textarea>
  // (Enter should insert a newline there) and the *last* focusable field,
  // where Enter still submits the form as usual.
  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter") return;

    const target = event.target as HTMLElement;
    if (target.tagName === "TEXTAREA") return;
    // A <select>'s native open/close and a submit button's own activation
    // both already do the right thing with Enter — don't intercept those.
    if (target.tagName === "SELECT" || (target as HTMLButtonElement).type === "submit") {
      return;
    }

    const form = formRef.current;
    if (!form) return;

    // Only cycle through actual data-entry controls — not the Cancel/Submit
    // buttons — so Enter on the last field falls through and submits the
    // form (focusing/activating Create) instead of jumping to Cancel.
    const focusable = Array.from(
      form.querySelectorAll<HTMLElement>(
        'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled)'
      )
    ).filter((el) => el.tabIndex !== -1);

    const currentIndex = focusable.indexOf(target);
    if (currentIndex === -1) return;

    const next = focusable[currentIndex + 1];
    if (next) {
      event.preventDefault();
      next.focus();
      if (next instanceof HTMLInputElement) {
        next.select();
      }
    }
    // No next field: let Enter fall through and submit the form normally.
  };

  return (
    <form ref={formRef} onSubmit={submit} onKeyDown={handleKeyDown} noValidate autoComplete="off">
      <Stack gap={5}>
        <Grid templateColumns={`repeat(${columns}, 1fr)`} gap={4}>
          {fields.map((field) => {
            const error = errors[field.name]?.message as string | undefined;
            const span = Math.min(field.colSpan ?? 1, columns);

            return (
              <GridItem key={field.name} colSpan={span}>
                <Field.Root invalid={!!error} disabled={field.disabled}>
                  {field.type !== "checkbox" && (
                    <Field.Label>
                      {field.label}
                      {field.required && <Field.RequiredIndicator />}
                    </Field.Label>
                  )}

                  {renderControl(field, control, register)}

                  {field.helperText && !error && (
                    <Field.HelperText>{field.helperText}</Field.HelperText>
                  )}
                  <Field.ErrorText>{error}</Field.ErrorText>
                </Field.Root>
              </GridItem>
            );
          })}
        </Grid>

        {formError && (
          <Field.Root invalid>
            <Field.ErrorText>{formError}</Field.ErrorText>
          </Field.Root>
        )}

        <HStack justify="flex-end" gap={3}>
          <Button type="submit" loading={isSubmitting}>
            {submitLabel}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              {cancelLabel}
            </Button>
          )}
        </HStack>
      </Stack>
    </form>
  );
}

function renderControl(
  field: FieldConfig,
  control: ReturnType<typeof useForm<FormValues>>["control"],
  register: ReturnType<typeof useForm<FormValues>>["register"]
) {
  switch (field.type) {
    case "select":
      return (
        <NativeSelect.Root>
          <NativeSelect.Field
            {...register(field.name)}
            placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}`}
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      );

    case "checkbox":
      return (
        <Controller
          control={control}
          name={field.name}
          render={({ field: rhfField }) => (
            <Checkbox.Root
              checked={!!rhfField.value}
              onCheckedChange={(details) => rhfField.onChange(!!details.checked)}
              disabled={field.disabled}
            >
              <Checkbox.HiddenInput onBlur={rhfField.onBlur} />
              <Checkbox.Control />
              <Checkbox.Label>{field.label}</Checkbox.Label>
            </Checkbox.Root>
          )}
        />
      );

    case "textarea":
      return (
        <Textarea
          {...register(field.name)}
          placeholder={field.placeholder}
          rows={4}
          autoComplete="off"
        />
      );

    case "date":
      return <Input type="date" autoComplete="off" {...register(field.name)} />;

    case "number":
      return (
        <Input
          type="number"
          step="any"
          placeholder={field.placeholder}
          autoComplete="off"
          {...register(field.name)}
        />
      );

    case "password":
      return (
        <Input
          type="password"
          placeholder={field.placeholder}
          // "new-password" stops the browser from suggesting/auto-filling a
          // previously *saved* password into this field. It's the right
          // choice for both create forms and "set a new password" fields;
          // a real sign-in form should pass its own field.schema/autoComplete
          // override if it specifically wants "current-password" behavior.
          autoComplete="new-password"
          {...register(field.name)}
        />
      );

    case "email":
      return (
        <Input
          type="email"
          placeholder={field.placeholder}
          autoComplete="off"
          {...register(field.name)}
        />
      );

    default:
      return (
        <Input
          type="text"
          placeholder={field.placeholder}
          autoComplete="off"
          {...register(field.name)}
        />
      );
  }
}
