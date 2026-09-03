/**
 * Brand color scales, generated from the two brand colors:
 *   primary (brand)  #2563EB
 *   secondary        #0F766E
 *
 * Both scales anchor the exact brand hex at the 600 step (matching
 * Chakra's own convention — e.g. their default blue.600 is also the
 * "base" shade), with 50 the lightest tint and 950 the darkest shade.
 * Referenced as colorPalette="brand" / colorPalette="secondary" anywhere
 * in the app (buttons, badges, spinners, etc.) and in the semantic
 * tokens in ./system.ts.
 */
export const brandColors = {
  50: { value: "#f2f6fe" },
  100: { value: "#e0e9fc" },
  200: { value: "#bed0f9" },
  300: { value: "#92b1f5" },
  400: { value: "#628ff1" },
  500: { value: "#3f76ed" },
  600: { value: "#2563eb" }, // primary
  700: { value: "#1e51c1" },
  800: { value: "#183f96" },
  900: { value: "#112e6c" },
  950: { value: "#0b1e46" },
};

export const secondaryColors = {
  50: { value: "#f1f7f6" },
  100: { value: "#ddeceb" },
  200: { value: "#b7d6d4" },
  300: { value: "#87bab6" },
  400: { value: "#529c97" },
  500: { value: "#2c867f" },
  600: { value: "#0f766e" }, // secondary
  700: { value: "#0c615a" },
  800: { value: "#0a4c46" },
  900: { value: "#073633" },
  950: { value: "#042321" },
};
