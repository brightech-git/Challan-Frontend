"use client";

import { useCallback, useLayoutEffect, useSyncExternalStore } from "react";
import { IconButton, Skeleton, type IconButtonProps } from "@chakra-ui/react";
import { LuMoon, LuSun } from "react-icons/lu";
import {
  applyColorMode,
  colorModeStore,
  setStoredColorMode,
  type ColorMode,
} from "@/lib/theme-storage";

export type { ColorMode };

/**
 * Keeps <html>'s class in sync with the color-mode store. The initial
 * class is already applied before hydration by the inline script in
 * app/layout.tsx — this effect re-applies it (a) whenever the store
 * changes after mount (toggle, cross-tab storage event, OS theme change)
 * and (b) after React's dev Strict Mode remount, which otherwise resets
 * <html>'s class to whatever the layout's JSX manages. See
 * node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md.
 *
 * Mounted once in components/ui/provider.tsx.
 */
export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const colorMode = useSyncExternalStore(
    colorModeStore.subscribe,
    colorModeStore.getSnapshot,
    colorModeStore.getServerSnapshot
  );

  useLayoutEffect(() => {
    applyColorMode(colorMode);
  }, [colorMode]);

  return <>{children}</>;
}

/**
 * Reads/writes the shared color-mode store (lib/theme-storage.ts) via
 * useSyncExternalStore — the server snapshot is always "light" (no
 * localStorage/matchMedia on the server), so hydration never mismatches.
 * Same pattern as useAuth, for the same reason.
 */
export function useColorMode() {
  const colorMode = useSyncExternalStore(
    colorModeStore.subscribe,
    colorModeStore.getSnapshot,
    colorModeStore.getServerSnapshot
  );

  const setColorMode = useCallback((mode: ColorMode) => {
    setStoredColorMode(mode);
  }, []);

  const toggleColorMode = useCallback(() => {
    setStoredColorMode(colorMode === "dark" ? "light" : "dark");
  }, [colorMode]);

  return { colorMode, setColorMode, toggleColorMode };
}

export function useColorModeValue<T>(light: T, dark: T): T {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? dark : light;
}

const noopSubscribe = () => () => {};

/**
 * True once the client has taken over from the server-rendered HTML.
 * Uses the useSyncExternalStore "always false on the server, always true
 * on the client" trick instead of a state+effect flag, since there's
 * nothing to subscribe to — the value never changes back to false.
 */
function useHasMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

/**
 * Sun/moon icon button that flips between light and dark mode. Renders a
 * skeleton until the client has mounted: the store's real value is already
 * correct on the very first client render (no hydration risk either way,
 * since useSyncExternalStore reconciles this safely on its own), but
 * gating on mount avoids a one-frame flash of the wrong icon for users
 * whose stored preference differs from the "light" server default.
 */
export const ColorModeButton = (props: Omit<IconButtonProps, "aria-label">) => {
  const { toggleColorMode, colorMode } = useColorMode();
  const hasMounted = useHasMounted();

  if (!hasMounted) {
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
