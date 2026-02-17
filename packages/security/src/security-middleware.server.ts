import { generalSecurity } from "@nichtsam/helmet/general";
import type { MiddlewareFunction } from "react-router";

export const securityMiddleware: MiddlewareFunction = async (
  _args,
  next,
) => {
  const response = (await next()) as Response;
  generalSecurity(response.headers);
  return response;
};
