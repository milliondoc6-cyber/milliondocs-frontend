import { env } from "@/lib/env";

/**
 * Central HTTP client. Every feature's `api.ts` calls THROUGH this — never
 * `fetch` directly. One place to handle auth headers, base URL, and errors.
 *
 * Pattern: feature api.ts -> apiClient -> fetch. See features/contacts/api.ts.
 */

const BASE_URL = env.NEXT_PUBLIC_API_URL;

const TOKEN_KEY = "token";

/** Read the auth token (client-side only). */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

/** A typed error so callers can branch on `status` (e.g. 401 -> logout). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** The HTTP status of an error, or null if it wasn't an HTTP error. */
export function getErrorStatus(error: unknown): number | null {
  return error instanceof ApiError ? error.status : null;
}

/**
 * Turn any thrown value into a clear, user-facing message — covers network
 * failures (offline / server down), HTTP errors (with the backend's detail),
 * and anything unexpected. Never returns a raw stack or "[object Object]".
 */
export function getErrorMessage(error: unknown): string {
  // Network / offline / unreachable — fetch() rejects with a TypeError.
  if (error instanceof TypeError) {
    return "Can't reach the server. Check your internet connection and try again.";
  }
  if (error instanceof ApiError) {
    const isGeneric =
      !error.message ||
      error.message === `Request failed with status ${error.status}`;
    if (!isGeneric) return error.message; // prefer the backend's own message
    switch (error.status) {
      case 400:
        return "Some of the information you entered is invalid.";
      case 401:
        return "Invalid email or password.";
      case 403:
        return "Your email isn't verified yet.";
      case 404:
        return "We couldn't find what you were looking for.";
      case 409:
        return "An account with these details already exists.";
      case 422:
        return "Please double-check the form and try again.";
      case 429:
        return "Too many attempts. Please wait a moment and try again.";
      default:
        return error.status >= 500
          ? "The server had a problem. Please try again in a moment."
          : "Something went wrong. Please try again.";
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}

// `object` lets us accept named-interface payloads (e.g. RegisterPayload), which
// don't structurally match Record<string, unknown>. Non-FormData bodies are JSON-encoded.
type Body = BodyInit | Record<string, unknown> | object | undefined;

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: Body;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, ...rest } = options;
  const headers = new Headers(rest.headers);

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const isFormData = body instanceof FormData;
  let finalBody: BodyInit | undefined;

  if (isFormData) {
    finalBody = body; // let the browser set the multipart boundary
  } else if (body !== undefined) {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    finalBody = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...rest,
    headers,
    body: finalBody,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let parsedBody: unknown;
    try {
      parsedBody = await response.json();
      const detail =
        (parsedBody as { detail?: string })?.detail ?? JSON.stringify(parsedBody);
      if (detail) message = detail;
    } catch {
      // non-JSON error body — keep the default message
    }
    throw new ApiError(response.status, message, parsedBody);
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: Body, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST", body }),
  patch: <T>(endpoint: string, body?: Body, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PATCH", body }),
  put: <T>(endpoint: string, body?: Body, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PUT", body }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
