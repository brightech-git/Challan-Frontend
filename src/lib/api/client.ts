import axios, { AxiosError, AxiosInstance } from "axios";
import { ApiResponse } from "@/types";
import { getStoredUser } from "@/lib/auth-storage";

// The Spring Boot app pins its context-path to /api/v1 and defaults to
// port 8125 locally (see application.properties). Override via
// NEXT_PUBLIC_API_BASE_URL for other environments.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8125/api/v1";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the logged-in user's id as the `userId` header the backend's
// UserIdInterceptor requires on every POST/PUT (except /login). Harmless
// to send on GET/DELETE too.
apiClient.interceptors.request.use((config) => {
  const user = getStoredUser();
  if (user?.userId != null) {
    config.headers.set("userId", String(user.userId));
  }
  return config;
});

// Normalize errors: the backend always responds with { success, message,
// data } even on failure (see ApiResponse.java), so surface `message`
// as the Error's message wherever possible.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const backendMessage = error.response?.data?.message;
    const message =
      backendMessage ||
      error.message ||
      "Something went wrong talking to the server.";
    return Promise.reject(new Error(message));
  }
);

/**
 * Unwraps the backend's { success, message, data } envelope and returns
 * just `data`. Every service function should route through this so
 * callers deal in plain domain types, not the envelope.
 */
export async function unwrap<T>(
  promise: Promise<{ data: ApiResponse<T> }>
): Promise<T> {
  const response = await promise;
  return response.data.data;
}
