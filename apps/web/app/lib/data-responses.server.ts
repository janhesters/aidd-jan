import { data } from "react-router";

export type DataWithResponseInit<Data> = ReturnType<typeof data<Data>>;

/**
 * Returns a 400 Bad Request response with optional data and headers.
 *
 * @param responseData - The data to return in the response body
 * @param init - Optional response init (headers, etc.) - status is always set to 400
 * @returns A Response object with status 400
 *
 * @example
 * ```ts
 * // Return validation errors
 * return badRequest({
 *   errors: {
 *     email: { message: "Invalid email" }
 *   }
 * });
 *
 * // Return with custom headers
 * return badRequest(
 *   { error: "Invalid request" },
 *   { headers: { "X-Custom": "value" } }
 * );
 * ```
 */
export function badRequest<T>(
  responseData: T,
  init?: Omit<ResponseInit, "status">,
): DataWithResponseInit<T>;
export function badRequest(
  responseData?: undefined,
  init?: Omit<ResponseInit, "status">,
): DataWithResponseInit<Record<string, never>>;
export function badRequest<T>(
  responseData?: T,
  init?: Omit<ResponseInit, "status">,
) {
  return data(responseData ?? {}, { ...init, status: 400 });
}

/**
 * Returns a 403 Forbidden response with optional data and headers.
 *
 * @param responseData - The data to return in the response body
 * @param init - Optional response init (headers, etc.) - status is always set to 403
 * @returns A Response object with status 403
 *
 * @example
 * ```ts
 * // Return forbidden error
 * return forbidden({
 *   errors: {
 *     message: "Insufficient permissions"
 *   }
 * });
 *
 * // Return with custom headers
 * return forbidden(
 *   { error: "Access denied" },
 *   { headers: { "X-Custom": "value" } }
 * );
 * ```
 */
export function forbidden<T>(
  responseData: T,
  init?: Omit<ResponseInit, "status">,
): DataWithResponseInit<T>;
export function forbidden(
  responseData?: undefined,
  init?: Omit<ResponseInit, "status">,
): DataWithResponseInit<Record<string, never>>;
export function forbidden<T>(
  responseData?: T,
  init?: Omit<ResponseInit, "status">,
) {
  return data(responseData ?? {}, { ...init, status: 403 });
}

/**
 * Returns a 404 Not Found response with optional data and headers.
 *
 * @param responseData - The data to return in the response body
 * @param init - Optional response init (headers, etc.) - status is always set to 404
 * @returns A Response object with status 404
 *
 * @example
 * ```ts
 * // Return not found error
 * return notFound({
 *   error: "Resource not found"
 * });
 *
 * // Return with custom headers
 * return notFound(
 *   { error: "User not found" },
 *   { headers: { "X-Custom": "value" } }
 * );
 * ```
 */
export function notFound<T>(
  responseData: T,
  init?: Omit<ResponseInit, "status">,
): DataWithResponseInit<T>;
export function notFound(
  responseData?: undefined,
  init?: Omit<ResponseInit, "status">,
): DataWithResponseInit<Record<string, never>>;
export function notFound<T>(
  responseData?: T,
  init?: Omit<ResponseInit, "status">,
) {
  return data(responseData ?? {}, { ...init, status: 404 });
}
