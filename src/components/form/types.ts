import { ZodTypeAny } from "zod";

export type FieldType =
  | "text"
  | "number"
  | "password"
  | "email"
  | "select"
  | "date"
  | "checkbox"
  | "textarea";

export interface SelectOption {
  label: string;
  value: string;
}

/**
 * Declarative description of one form field. DynamicForm renders the
 * right Chakra control for `type` and wires it into react-hook-form.
 */
export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  options?: SelectOption[]; // required when type === "select"
  // Fraction of the row this field occupies (1 = full width, 2 = half, 3 = third).
  colSpan?: 1 | 2 | 3;
  // Optional per-field zod override; otherwise a sensible default is inferred from `type`.
  schema?: ZodTypeAny;
}

export type FormValues = Record<string, unknown>;
