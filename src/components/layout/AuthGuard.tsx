"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Center, Spinner } from "@chakra-ui/react";
import { useAuth } from "@/hooks";

/**
 * Wrap any protected route tree with this. Since the backend has no
 * server-side session to check against, "protected" just means: is there
 * a user object in localStorage (read via useAuth's useSyncExternalStore).
 *
 * The server snapshot is always "logged out" (no localStorage on the
 * server), so the very first client render after a hard refresh briefly
 * reports isAuthenticated=false too, before React swaps in the real
 * client snapshot. Redirecting off of that first render — as this used
 * to do — could fire router.replace("/login") on an already-logged-in
 * user during a plain page refresh. Gating the redirect on `hasMounted`
 * (only flips true in an effect, i.e. after the client snapshot has been
 * read) defers the decision until we actually know the localStorage
 * state, so a refresh no longer bounces a logged-in user back to /login.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hasMounted, isAuthenticated, router]);

  if (!hasMounted || !isAuthenticated) {
    return (
      <Center minH="100vh">
        <Spinner size="lg" />
      </Center>
    );
  }

  return <>{children}</>;
}
