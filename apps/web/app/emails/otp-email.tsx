import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OtpEmailProps {
  otp: string;
  type: "change-email" | "email-verification" | "forget-password" | "sign-in";
  locale?: "de" | "en";
}

const translations = {
  en: {
    "sign-in": {
      preview: "Your sign-in code",
      heading: "Sign in to your account",
    },
    "email-verification": {
      preview: "Verify your email address",
      heading: "Verify your email",
    },
    "forget-password": {
      preview: "Reset your password",
      heading: "Reset your password",
    },
    "change-email": {
      preview: "Confirm your new email address",
      heading: "Confirm your new email",
    },
    codeLabel: "Your verification code is:",
    expiry: "This code expires in 5 minutes.",
    ignore: "If you didn't request this, you can safely ignore this email.",
  },
  de: {
    "sign-in": {
      preview: "Dein Anmeldecode",
      heading: "Bei deinem Konto anmelden",
    },
    "email-verification": {
      preview: "E-Mail-Adresse bestätigen",
      heading: "Bestätige deine E-Mail",
    },
    "forget-password": {
      preview: "Passwort zurücksetzen",
      heading: "Setze dein Passwort zurück",
    },
    "change-email": {
      preview: "Neue E-Mail-Adresse bestätigen",
      heading: "Bestätige deine neue E-Mail",
    },
    codeLabel: "Dein Bestätigungscode lautet:",
    expiry: "Dieser Code läuft in 5 Minuten ab.",
    ignore:
      "Falls du das nicht angefordert hast, kannst du diese E-Mail ignorieren.",
  },
} as const;

export function OtpEmail({ otp, type, locale = "en" }: OtpEmailProps) {
  const t = translations[locale];
  const typeText = t[type];

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{typeText.preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>{typeText.heading}</Heading>
          <Text style={text}>{t.codeLabel}</Text>
          <Section style={codeSection}>
            <Text style={code}>{otp}</Text>
          </Section>
          <Text style={text}>{t.expiry}</Text>
          <Text style={muted}>{t.ignore}</Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  borderRadius: "8px",
  margin: "40px auto",
  padding: "40px",
  maxWidth: "480px",
};

const heading = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600" as const,
  lineHeight: "1.3",
  margin: "0 0 24px",
};

const text = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "0 0 16px",
};

const codeSection = {
  backgroundColor: "#f6f9fc",
  borderRadius: "6px",
  margin: "24px 0",
  padding: "16px",
  textAlign: "center" as const,
};

const code = {
  color: "#1a1a1a",
  fontSize: "36px",
  fontWeight: "700" as const,
  letterSpacing: "0.3em",
  margin: "0",
};

const muted = {
  color: "#999",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "24px 0 0",
};
