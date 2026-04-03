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

import { authClient } from "~/lib/auth-client";
import { auth } from "~/lib/auth.server";
import { useForm } from "~/lib/conform";
import { validateFormData } from "~/lib/validate-form-data";
import { getInstance } from "~/middleware/i18next";

import { setEmailCookie } from "./+/email-otp-cookie.server";
import { GoogleIcon } from "./+/google-icon";
import type { Route } from "./+types/register";

z.config({ jitless: true });
export const schema = z.object({
  email: z.email({ message: "auth:register.errors.invalidEmail" }),
});

export async function loader({ context }: Route.LoaderArgs) {
  const i18next = getInstance(context);
  const t = i18next.getFixedT(null, "auth", "register.meta");
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

  const { email } = result.data;

  await auth.api.sendVerificationOTP({
    body: { email, type: "sign-in" },
  });

  return redirect(href("/verify"), { headers: await setEmailCookie(email) });
}

export default function RegisterRoute({ actionData }: Route.ComponentProps) {
  const { t } = useTranslation("auth", { keyPrefix: "register" });
  const { form, fields } = useForm(schema, {
    lastResult: actionData?.result,
  });
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <FieldSet disabled={isSubmitting}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{t("title")}</h1>

          <p className="text-muted-foreground text-sm text-balance">
            {t("subtitle")}
          </p>
        </div>

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
              <Button type="submit">
                {isSubmitting ? (
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

        <Field>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              authClient.signIn.social({
                provider: "google",
                callbackURL: "/onboarding",
              })
            }
          >
            <GoogleIcon /> {t("googleButton")}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-muted-foreground text-sm">
            <Trans
              components={{
                pp: (
                  <Link
                    className={cn(
                      buttonVariants({ variant: "link" }),
                      "text-muted-foreground hover:text-primary max-h-min p-0 underline underline-offset-4",
                    )}
                    to={href("/privacy")}
                  />
                ),
                tos: (
                  <Link
                    className={cn(
                      buttonVariants({ variant: "link" }),
                      "text-muted-foreground hover:text-primary max-h-min p-0 underline underline-offset-4",
                    )}
                    to={href("/terms")}
                  />
                ),
              }}
              i18nKey="register.legal"
              ns="auth"
            />
          </FieldDescription>
        </Field>

        <FieldSeparator />

        <Field>
          <FieldDescription className="text-center">
            <Trans
              components={{
                login: (
                  <Link
                    className={cn(
                      buttonVariants({ variant: "link" }),
                      "text-muted-foreground hover:text-primary max-h-min p-0",
                    )}
                    to={href("/login")}
                  />
                ),
              }}
              i18nKey="register.loginCta"
              ns="auth"
            />
          </FieldDescription>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
