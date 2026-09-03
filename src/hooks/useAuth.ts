"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services";
import { authStore, clearStoredUser, setStoredUser } from "@/lib/auth-storage";
import { AuthUser, LoginInput } from "@/types";
import { toast } from "@/lib/toast";

/**
 * Auth state for a backend that has no tokens or sessions (see
 * UserIdInterceptor.java) — "logged in" just means we remember which
 * active user the browser is acting as, and replay their userId header
 * on every request via the axios interceptor in lib/api/client.ts.
 *
 * `user` is read via useSyncExternalStore against the localStorage-backed
 * store in lib/auth-storage.ts. That's the correct primitive for reading
 * mutable state that lives outside React: the server snapshot is always
 * "logged out" (no localStorage on the server), so hydration never
 * mismatches, and every consumer of useAuth() re-renders automatically
 * when login()/logout() change the stored user — no prop drilling, no
 * manual "mounted" flags.
 */
export function useAuth() {
  const router = useRouter();
  const user = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getServerSnapshot
  );
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const login = useCallback(
    async (input: LoginInput) => {
      setIsLoggingIn(true);
      setLoginError(null);
      try {
        const loggedInUser = await userService.login(input);
        const authUser: AuthUser = {
          userId: loggedInUser.userId,
          name: loggedInUser.name,
          active: loggedInUser.active,
        };
        setStoredUser(authUser);
        toast.success("Welcome back", authUser.name);
        router.push("/dashboard");
        return authUser;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        setLoginError(message);
        toast.error("Login failed", message);
        throw err;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    clearStoredUser();
    router.push("/login");
  }, [router]);

  return {
    user,
    isAuthenticated: user != null,
    login,
    isLoggingIn,
    loginError,
    logout,
  };
}
