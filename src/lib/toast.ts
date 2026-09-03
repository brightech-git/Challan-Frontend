import { toaster } from "@/components/ui/toaster";

/**
 * Thin, opinionated wrappers around the app's toaster (components/ui/toaster.tsx).
 * Use these instead of calling toaster.create(...) directly so every toast
 * in the app gets consistent titles/durations/colors for its type.
 *
 * Typical usage in a mutation:
 *
 *   const createCompany = useCreateCompany();
 *   await createCompany.mutateAsync(input);
 *   toast.success("Company created");
 *
 *   // or, to also show the backend's error message on failure:
 *   try {
 *     await createCompany.mutateAsync(input);
 *     toast.success("Company created");
 *   } catch (err) {
 *     toast.error("Couldn't create company", getErrorMessage(err));
 *   }
 */
export const toast = {
  success(title: string, description?: string) {
    return toaster.create({
      title,
      description,
      type: "success",
      duration: 4000,
    });
  },

  error(title: string, description?: string) {
    return toaster.create({
      title,
      description,
      type: "error",
      duration: 6000,
    });
  },

  info(title: string, description?: string) {
    return toaster.create({
      title,
      description,
      type: "info",
      duration: 4000,
    });
  },

  warning(title: string, description?: string) {
    return toaster.create({
      title,
      description,
      type: "warning",
      duration: 5000,
    });
  },

  loading(title: string, description?: string) {
    return toaster.create({
      title,
      description,
      type: "loading",
    });
  },

  dismiss(id: string) {
    toaster.dismiss(id);
  },
};

/** Pulls a readable message out of anything a catch block might hand us. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return fallback;
}
