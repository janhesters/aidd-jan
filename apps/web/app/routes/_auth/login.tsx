import { Button, buttonVariants } from "@workspace/ui/components/button";
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";
import { MailIcon } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { Form, href, Link, redirect, useNavigation } from "react-router";
import * as z from "zod";

import { auth } from "~/lib/auth.server";
import { useForm } from "~/lib/conform";
import { validateFormData } from "~/lib/validate-form-data";
import { getInstance } from "~/middleware/i18next";

import { setEmailCookie } from "./+/email-otp-cookie.server";
import { GoogleIcon } from "./+/google-icon";
import type { Route } from "./+types/login";

export const LOGIN_WITH_EMAIL_INTENT = "loginWithEmail" as const;
export const LOGIN_WITH_GOOGLE_INTENT = "loginWithGoogle" as const;

const loginWithEmailSchema = z.object({
  email: z.email({ message: "auth:login.errors.invalidEmail" }),
  intent: z.literal(LOGIN_WITH_EMAIL_INTENT),
});
const loginWithGoogleSchema = z.object({
  intent: z.literal(LOGIN_WITH_GOOGLE_INTENT),
});

z.config({ jitless: true });
const schema = z.discriminatedUnion("intent", [
  loginWithEmailSchema,
  loginWithGoogleSchema,
]);

export async function loader({ context }: Route.LoaderArgs) {
  const i18next = getInstance(context);
  const t = i18next.getFixedT(null, "auth", "login.meta");
  return { title: t("title") };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  return [{ title: loaderData.title }];
};

export async function action({ request }: Route.ActionArgs) {
  const result = await validateFormData(request, schema);

  if (!result.success) {
    return result.response;
  }

  switch (result.data.intent) {
    case LOGIN_WITH_EMAIL_INTENT: {
      const { email } = result.data;
      await auth.api.sendVerificationOTP({
        body: { email, type: "sign-in" },
      });
      return redirect(href("/verify"), {
        headers: await setEmailCookie(email),
      });
    }
    case LOGIN_WITH_GOOGLE_INTENT: {
      const { response, headers } = await auth.api.signInSocial({
        body: {
          provider: "google",
          callbackURL: "/onboarding",
          disableRedirect: true,
        },
        headers: request.headers,
        returnHeaders: true,
      });
      if (!response.url)
        throw new Error("Google OAuth: no redirect URL returned");
      return redirect(response.url, { headers });
    }
  }
}

export default function LoginRoute({ actionData }: Route.ComponentProps) {
  const { t } = useTranslation("auth", { keyPrefix: "login" });
  const { form, fields } = useForm(schema, {
    lastResult: actionData?.result,
  });
  const navigation = useNavigation();
  const isLoggingInWithEmail =
    navigation.formData?.get("intent") === LOGIN_WITH_EMAIL_INTENT;
  const isLoggingInWithGoogle =
    navigation.formData?.get("intent") === LOGIN_WITH_GOOGLE_INTENT;
  const isSubmitting = isLoggingInWithEmail || isLoggingInWithGoogle;

  return (
    <FieldSet disabled={isSubmitting}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{t("title")}</h1>

          <p className="text-muted-foreground text-sm text-balance">
            {t("subtitle")}
          </p>
        </div>

        {/* Email Login Form */}
        <Form method="POST" {...form.props}>
          <FieldGroup>
            <Field data-invalid={fields.email.ariaInvalid}>
              <FieldLabel htmlFor={fields.email.id}>
                {t("emailLabel")}
              </FieldLabel>

              <InputGroup>
                <InputGroupInput
                  {...fields.email.inputProps}
                  autoComplete="email"
                  placeholder={t("emailPlaceholder")}
                  type="email"
                />

                <InputGroupAddon>
                  <MailIcon />
                </InputGroupAddon>
              </InputGroup>

              <FieldError
                errors={fields.email.errors}
                id={fields.email.errorId}
              />
            </Field>

            <Field>
              <Button
                name="intent"
                type="submit"
                value={LOGIN_WITH_EMAIL_INTENT}
              >
                {isLoggingInWithEmail ? (
                  <>
                    <Spinner /> {t("submitButtonSubmitting")}
                  </>
                ) : (
                  t("submitButton")
                )}
              </Button>
            </Field>
          </FieldGroup>
        </Form>

        <FieldSeparator>{t("separator")}</FieldSeparator>

        {/* Google Login Form */}
        <Form method="POST">
          <Field>
            <Button
              name="intent"
              type="submit"
              value={LOGIN_WITH_GOOGLE_INTENT}
              variant="outline"
            >
              {isLoggingInWithGoogle ? (
                <>
                  <Spinner /> {t("googleButton")}
                </>
              ) : (
                <>
                  <GoogleIcon /> {t("googleButton")}
                </>
              )}
            </Button>
          </Field>
        </Form>

        <Field>
          <FieldDescription className="text-center">
            <Trans
              components={{
                signup: (
                  <Link
                    className={cn(
                      buttonVariants({ variant: "link" }),
                      "text-muted-foreground hover:text-primary max-h-min p-0",
                    )}
                    to={href("/register")}
                  />
                ),
              }}
              i18nKey="login.signupCta"
              ns="auth"
            />
          </FieldDescription>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
