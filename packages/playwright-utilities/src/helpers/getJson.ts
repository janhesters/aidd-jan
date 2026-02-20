import type { APIResponse } from "@playwright/test";

/**
 * Defines valid JSON data structures for type-safe parsing.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

/**
 * Converts a Buffer into a JavaScript object by parsing its JSON string.
 *
 * @param buffer - The Buffer containing JSON data.
 * @returns The parsed JavaScript object.
 */
const butterToJson = (buffer: Buffer): Json =>
  JSON.parse(buffer.toString()) as Json;

/**
 * Extracts and parses JSON from the APIResponse's body.
 *
 * @param response - The APIResponse to parse.
 * @returns A promise resolving to the parsed JSON object.
 */
export const getJson = (response: APIResponse) =>
  response.body().then(butterToJson);
