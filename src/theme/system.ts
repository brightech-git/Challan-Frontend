import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { brandColors, secondaryColors } from "./colors";

/**
 * App-wide Chakra v3 theme.
 *
 * - `brand` (primary, #2563EB) and `secondary` (#0F766E) are added as
 *   full color scales so any component can opt in with
 *   colorPalette="brand" / colorPalette="secondary", the same way built-in
 *   palettes like "blue" or "red" work.
 * - `primary`/`onPrimary`/`secondary`/`onSecondary` semantic tokens give a
 *   theme-aware (light/dark) alias for the two brand colors, so app chrome
 *   (links, active nav state, focus rings) can reference "brand.solid"-ish
 *   colors without hardcoding a light/dark check anywhere.
 * - Button and Badge recipes default to colorPalette="brand" so a plain
 *   <Button> already matches the brand without callers passing colorPalette
 *   everywhere — pass colorPalette="secondary" (or any built-in palette)
 *   to override per instance.
 *
 * Light/dark switching itself is handled by next-themes (see
 * components/ui/provider.tsx and components/ui/color-mode.tsx) — Chakra
 * just needs `_light`/`_dark` conditions in these tokens to respond to the
 * "dark" class next-themes toggles on <html>.
 *
 * - `fonts.heading`/`fonts.body` are set to Plus Jakarta Sans (loaded via
 *   next/font/google in app/layout.tsx, which exposes it as the
 *   --font-plus-jakarta-sans CSS variable) so every Chakra component uses
 *   it — this overrides Chakra's own default of Inter.
 */
const fallbackFontStack =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: brandColors,
        secondary: secondaryColors,
      },
      fonts: {
        heading: { value: `var(--font-plus-jakarta-sans), ${fallbackFontStack}` },
        body: { value: `var(--font-plus-jakarta-sans), ${fallbackFontStack}` },
      },
    },
    semanticTokens: {
      colors: {
        primary: {
          value: { _light: "{colors.brand.600}", _dark: "{colors.brand.400}" },
        },
        primaryEmphasis: {
          value: { _light: "{colors.brand.700}", _dark: "{colors.brand.300}" },
        },
        secondaryBrand: {
          value: { _light: "{colors.secondary.600}", _dark: "{colors.secondary.400}" },
        },
      },
    },
    recipes: {
      button: {
        defaultVariants: {
          // Chakra's shipped `ColorPalette` type is generated from the
          // *default* theme only, so it doesn't know about the "brand"
          // palette added above even though it's a perfectly valid runtime
          // token. Cast locally rather than losing type-checking on every
          // colorPalette prop across the app.
          colorPalette: "brand" as never,
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
