"use client";

import { IconButton, Skeleton, type IconButtonProps } from "@chakra-ui/react";
import { ThemeProvider, useTheme, type ThemeProviderProps } from "next-themes";
import { LuMoon, LuSun } from "react-icons/lu";

export type ColorModeProviderProps = ThemeProviderProps;

/**
 * Wraps next-themes' ThemeProvider with the attribute/props Chakra expects
 * (a "dark"/"light" class on <html>, matching the semantic tokens defined
 * in theme/system.ts). Mounted once in components/ui/provider.tsx.
 */
export function ColorModeProvider(props: ColorModeProviderProps) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
  );
}

export type ColorMode = "light" | "dark";

/**
 * Thin wrapper around next-themes' useTheme() that resolves "system" down
 * to an actual "light"/"dark" value and exposes a simple toggle — the one
 * hook every themed component in the app should use instead of reaching
 * into next-themes directly.
 *
 * `resolvedTheme` is genuinely `undefined` until next-themes has read the
 * real preference client-side (it withholds it during SSR to avoid a
 * hydration mismatch) — callers that need to distinguish "not yet known"
 * from "light" should check `resolvedTheme` directly rather than
 * `colorMode`, which always defaults unresolved to "light".
 */
export function useColorMode() {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const colorMode = (resolvedTheme ?? "light") as ColorMode;

  const toggleColorMode = () => {
    setTheme(colorMode === "dark" ? "light" : "dark");
  };

  return { colorMode, resolvedTheme, setColorMode: setTheme, toggleColorMode, theme };
}

export function useColorModeValue<T>(light: T, dark: T): T {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? dark : light;
}

/**
 * Sun/moon icon button that flips between light and dark mode. Renders a
 * skeleton until the real theme is known client-side (next-themes
 * intentionally withholds `resolvedTheme` during SSR/first paint to avoid
 * a hydration mismatch) — no extra mount-tracking state needed, since
 * `resolvedTheme` itself already goes from undefined to a real value.
 */
export const ColorModeButton = (props: Omit<IconButtonProps, "aria-label">) => {
  const { toggleColorMode, colorMode, resolvedTheme } = useColorMode();

  if (!resolvedTheme) {
    return <Skeleton boxSize="8" borderRadius="md" />;
  }

  return (
    <IconButton
      onClick={toggleColorMode}
      variant="ghost"
      size="sm"
      aria-label="Toggle color mode"
      {...props}
    >
      {colorMode === "dark" ? <LuSun /> : <LuMoon />}
    </IconButton>
  );
};
