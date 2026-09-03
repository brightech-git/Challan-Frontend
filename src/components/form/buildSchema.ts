import { z, ZodTypeAny } from "zod";
import { FieldConfig } from "./types";

/**
 * Builds a zod object schema from a FieldConfig[] so DynamicForm gets
 * sensible validation for free (required text, numeric coercion, etc.)
 * without every caller having to hand-write it. Pass `schema` on a field
 * to override.
 */
export function buildSchema(fields: FieldConfig[]) {
  const shape: Record<string, ZodTypeAny> = {};

  for (const field of fields) {
    if (field.schema) {
      shape[field.name] = field.schema;
      continue;
    }

    let schema: ZodTypeAny;

    switch (field.type) {
      case "number": {
        let numberSchema = z.coerce
          .number({ message: `${field.label} must be a number` })
          .optional();
        if (field.required) {
          numberSchema = z.coerce.number({
            message: `${field.label} is required`,
          }) as unknown as typeof numberSchema;
        }
        schema = numberSchema as ZodTypeAny;
        break;
      }
      case "checkbox": {
        schema = z.boolean().optional();
        break;
      }
      case "email": {
        schema = field.required
          ? z.string().min(1, `${field.label} is required`).email("Invalid email")
          : z.string().email("Invalid email").optional().or(z.literal(""));
        break;
      }
      default: {
        schema = field.required
          ? z.string().min(1, `${field.label} is required`)
          : z.string().optional().or(z.literal(""));
      }
    }

    shape[field.name] = schema;
  }

  return z.object(shape);
}
