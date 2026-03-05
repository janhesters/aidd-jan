import { report } from "@conform-to/react/future";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@workspace/ui/components/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";
import { Spinner } from "@workspace/ui/components/spinner";
import { APIError } from "better-auth";
import { TriangleAlertIcon } from "lucide-react";
import { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { data, Form, href, redirect, useNavigation } from "react-router";
import { promiseHash } from "remix-utils/promise";
import * as z from "zod";

import { auth } from "~/lib/auth.server";
import { combineHeaders } from "~/lib/combine-headers.server";
import { useForm } from "~/lib/conform";
import { badRequest, forbidden } from "~/lib/data-responses.server";
import { createToastHeaders, redirectWithToast } from "~/lib/toast.server";
import { validateFormData } from "~/lib/validate-form-data";
import { getInstance } from "~/middleware/i18next";

import { getIsOTPExpired } from "./+/check-otp-expiration.server";
import {
  destroyEmailCookie,
  getEmailFromCookie,
  setEmailCookie,
} from "./+/email-otp-cookie.server";
import { useCountdown } from "./+/use-countdown";
import type { Route } from "./+types/verify";

export async function loader({ request, context }: Route.LoaderArgs) {
  const i18next = getInstance(context);
  const t = i18next.getFixedT(null, "auth", "verify");

  const email = await getEmailFromCookie(request);

  if (!email) {
    return await redirectWithToast("/login", {
      description: t("otpExpiredDescription"),
      title: t("otpExpired"),
      type: "error",
    });
  }

  const isOTPExpired = await getIsOTPExpired(email);

  if (isOTPExpired) {
    return await redirectWithToast(
      "/login",
      {
        description: t("otpExpiredDescription"),
        title: t("otpExpired"),
        type: "error",
      },
      { headers: await destroyEmailCookie() },
    );
  }

  const tMeta = i18next.getFixedT(null, "auth", "verify.meta");
  return { title: tMeta("title") };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  return [{ title: loaderData.title }];
};

export const SEND_VERIFICATION_OTP_INTENT = "sendVerificationOtp" as const;
export const SIGN_IN_EMAIL_OTP_INTENT = "signInEmailOtp" as const;

const OTP_LENGTH = 6;

z.config({ jitless: true });
const otpSchema = z.object({
  intent: z.literal(SIGN_IN_EMAIL_OTP_INTENT),
  otp: z.string().length(OTP_LENGTH, {
    message: "auth:verify.errors.wrongLength",
  }),
});

const schema = z.discriminatedUnion("intent", [
  z.object({ intent: z.literal(SEND_VERIFICATION_OTP_INTENT) }),
  otpSchema,
]);

export async function action({ request, context }: Route.ActionArgs) {
  const i18next = getInstance(context);
  const t = i18next.getFixedT(null, "auth", "verify");
  const result = await validateFormData(request, schema);

  if (!result.success) {
    return result.response;
  }

  const email = await getEmailFromCookie(request);

  if (!email) {
    return await redirectWithToast("/login", {
      description: t("otpExpiredDescription"),
      title: t("otpExpired"),
      type: "error",
    });
  }

  switch (result.data.intent) {
    case SIGN_IN_EMAIL_OTP_INTENT: {
      try {
        const { headers, destroyEmailCookieHeaders } = await promiseHash({
          destroyEmailCookieHeaders: destroyEmailCookie(),
          headers: auth.api
            .signInEmailOTP({
              body: { email, otp: result.data.otp },
              returnHeaders: true,
            })
            .then((result) => result.headers),
        });

        return redirect(href("/onboarding"), {
          headers: combineHeaders(headers, destroyEmailCookieHeaders),
        });
      } catch (error) {
        if (error instanceof APIError) {
          const isTooManyAttempts = error.body?.code === "TOO_MANY_ATTEMPTS";

          const errorMessage = isTooManyAttempts
            ? "auth:verify.errors.tooManyAttempts"
            : "auth:verify.errors.invalid";

          const errorData = {
            result: report(result.submission, {
              error: { fieldErrors: { otp: [errorMessage] } },
            }),
          };

          if (isTooManyAttempts) {
            return forbidden(errorData, {
              headers: await destroyEmailCookie(),
            });
          }

          return badRequest(errorData);
        }

        throw error;
      }
    }
    case SEND_VERIFICATION_OTP_INTENT: {
      const [toastHeaders] = await Promise.all([
        createToastHeaders({
          description: t("newOtpSentDescription"),
          title: t("newOtpSent"),
          type: "success",
        }),
        auth.api.sendVerificationOTP({ body: { email, type: "sign-in" } }),
      ]);

      return data(
        { lastReset: new Date().toISOString(), result: undefined },
        { headers: combineHeaders(toastHeaders, await setEmailCookie(email)) },
      );
    }
  }
}

export default function VerifyRoute({ actionData }: Route.ComponentProps) {
  const { t } = useTranslation("auth", { keyPrefix: "verify" });

  const { secondsLeft, reset } = useCountdown(60);

  const lastReset = (actionData as { lastReset: string } | undefined)
    ?.lastReset;

  useEffect(() => {
    if (lastReset) {
      reset();
    }
  }, [lastReset, reset]);

  const waitingToResend = secondsLeft !== 0;

  const navigation = useNavigation();
  const isResending =
    navigation.formData?.get("intent") === SEND_VERIFICATION_OTP_INTENT;
  const isVerifying =
    navigation.formData?.get("intent") === SIGN_IN_EMAIL_OTP_INTENT;
  const isSubmitting = isResending || isVerifying;

  const { form, fields } = useForm(otpSchema, {
    lastResult: actionData?.result,
  });

  return (
    <div className="grid gap-4">
      <Form method="POST" {...form.props}>
        <FieldSet disabled={isSubmitting}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-2xl font-bold">{t("title")}</h1>

              <p className="text-muted-foreground text-sm text-balance">
                {t("subtitle")}
              </p>
            </div>

            <Field data-invalid={fields.otp.ariaInvalid}>
              <FieldLabel className="sr-only" htmlFor={fields.otp.id}>
                {t("fieldLabel")}
              </FieldLabel>

              <div className="flex w-full justify-center">
                <InputOTP {...fields.otp.otpInputProps} maxLength={OTP_LENGTH}>
                  <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                  </InputOTPGroup>

                  <InputOTPSeparator />

                  <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>

                  <InputOTPSeparator />

                  <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <FieldDescription
                className="text-center"
                id={fields.otp.descriptionId}
              >
                {t("description")}
              </FieldDescription>

              <FieldError errors={fields.otp.errors} id={fields.otp.errorId} />
            </Field>

            <Button
              name="intent"
              type="submit"
              value={SIGN_IN_EMAIL_OTP_INTENT}
            >
              {t("verifyButton")}
            </Button>
          </FieldGroup>
        </FieldSet>
      </Form>

      <FieldSeparator />

      <Form method="POST" onSubmit={() => reset()}>
        <FieldSet disabled={waitingToResend || isSubmitting}>
          <Alert>
            <TriangleAlertIcon />

            <AlertDescription>{t("alertDescription")}</AlertDescription>
          </Alert>

          <FieldDescription className="text-muted-foreground text-xs">
            <Trans
              components={{ 1: <b /> }}
              count={secondsLeft}
              i18nKey="verify.countdownMessage"
              ns="auth"
            />
          </FieldDescription>

          <Button
            className="w-full"
            name="intent"
            type="submit"
            value={SEND_VERIFICATION_OTP_INTENT}
          >
            {isResending ? (
              <>
                <Spinner />
                {t("resendButtonSubmitting")}
              </>
            ) : (
              t("resendButton")
            )}
          </Button>
        </FieldSet>
      </Form>
    </div>
  );
}
