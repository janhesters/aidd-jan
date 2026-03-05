import { configureForms } from "@conform-to/react/future";
import type { Input } from "@workspace/ui/components/input";
import type { InputOTP } from "@workspace/ui/components/input-otp";
import type { ComponentProps } from "react";

export const { FormProvider, useField, useForm, useFormMetadata, useIntent } =
  configureForms({
    extendFieldMetadata(metadata) {
      return {
        get inputProps() {
          return {
            "aria-describedby": metadata.ariaDescribedBy,
            "aria-invalid": metadata.ariaInvalid,
            id: metadata.id,
            name: metadata.name,
          } satisfies Partial<ComponentProps<typeof Input>>;
        },
        get otpInputProps() {
          return {
            "aria-describedby": metadata.ariaDescribedBy,
            "aria-invalid": metadata.ariaInvalid,
            id: metadata.id,
            name: metadata.name,
          } satisfies Partial<ComponentProps<typeof InputOTP>>;
        },
      };
    },
    shouldRevalidate: "onBlur",
    shouldValidate: "onSubmit",
  });
