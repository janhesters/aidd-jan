import { useEffect } from "react";
import { toast as showToast } from "sonner";

import type { Toast } from "./toast.server";

export function useToast(toast?: Toast | null) {
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => {
        if (toast.type === "message") {
          showToast(toast.title, {
            description: toast.description,
            id: toast.id,
          });
        } else {
          showToast[toast.type](toast.title, {
            description: toast.description,
            id: toast.id,
          });
        }
      }, 0);
      return () => clearTimeout(id);
    }
  }, [toast]);
}
