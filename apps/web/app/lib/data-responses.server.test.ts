import { describe, expect, test } from "bun:test";

import { badRequest, forbidden, notFound } from "./data-responses.server";

const HTTP_BAD_REQUEST = 400;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;

describe("badRequest()", () => {
  test("given: no arguments, should: return a 400 status with an empty object", () => {
    const response = badRequest();

    expect(response.init?.status).toEqual(HTTP_BAD_REQUEST);
    expect(response.data).toMatchObject({});
  });

  test("given: custom error object, should: return a 400 status with the custom error object", () => {
    const customErrors = { input: "invalid-input" };
    const response = badRequest(customErrors);

    expect(response.init?.status).toEqual(HTTP_BAD_REQUEST);
    expect(response.data).toEqual(customErrors);
  });

  test("given: custom data and headers, should: return a 400 status with the custom data and the headers", () => {
    const headers = new Headers({ "X-Custom-Header": "TestValue" });
    const customErrors = { input: "invalid-input" };
    const response = badRequest(customErrors, { headers });

    expect(response.init?.status).toEqual(HTTP_BAD_REQUEST);
    expect(response.data).toEqual(customErrors);
    expect((response.init?.headers as Headers).get("X-Custom-Header")).toEqual(
      "TestValue",
    );
  });
});

describe("forbidden()", () => {
  test("given: no arguments, should: return a 403 status with an empty object", () => {
    const response = forbidden();

    expect(response.init?.status).toEqual(HTTP_FORBIDDEN);
    expect(response.data).toMatchObject({});
  });

  test("given: custom error object, should: return a 403 status with the custom error object", () => {
    const customErrors = { reason: "insufficient-permissions" };
    const response = forbidden(customErrors);

    expect(response.init?.status).toEqual(HTTP_FORBIDDEN);
    expect(response.data).toEqual(customErrors);
  });

  test("given: custom data and headers, should: return a 403 status with the custom data and the headers", () => {
    const headers = new Headers({ "X-Forbidden-Reason": "No Access" });
    const customErrors = { resource: "admin-panel" };
    const response = forbidden(customErrors, { headers });

    expect(response.init?.status).toEqual(HTTP_FORBIDDEN);
    expect(response.data).toEqual(customErrors);
    expect(
      (response.init?.headers as Headers).get("X-Forbidden-Reason"),
    ).toEqual("No Access");
  });
});

describe("notFound()", () => {
  test("given: no arguments, should: return a 404 status with an empty object", () => {
    const response = notFound();

    expect(response.init?.status).toEqual(HTTP_NOT_FOUND);
    expect(response.data).toMatchObject({});
  });

  test("given: custom error object, should: return a 404 status with the custom error object", () => {
    const customErrors = { resource: "user" };
    const response = notFound(customErrors);

    expect(response.init?.status).toEqual(HTTP_NOT_FOUND);
    expect(response.data).toEqual(customErrors);
  });

  test("given: custom data and headers, should: return a 404 status with the custom data and the headers", () => {
    const headers = new Headers({ "X-Resource-Type": "User" });
    const customErrors = { id: "123", resource: "user" };
    const response = notFound(customErrors, { headers });

    expect(response.init?.status).toEqual(HTTP_NOT_FOUND);
    expect(response.data).toEqual(customErrors);
    expect((response.init?.headers as Headers).get("X-Resource-Type")).toEqual(
      "User",
    );
  });
});
