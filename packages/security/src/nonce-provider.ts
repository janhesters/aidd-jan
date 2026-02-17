import { createContext, use } from "react";

const NonceContext = createContext<string>("");

export const NonceProvider = NonceContext.Provider;

export function useNonce() {
  return use(NonceContext);
}
