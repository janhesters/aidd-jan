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
}

const headingByType = {
  "change-email": "Change your email",
  "email-verification": "Verify your email",
  "forget-password": "Reset your password",
  "sign-in": "Sign in to your account",
} as const;

const descriptionByType = {
  "change-email": "Enter the following code to confirm your new email address.",
  "email-verification":
    "Enter the following code to verify your email address.",
  "forget-password": "Enter the following code to reset your password.",
  "sign-in": "Enter the following code to sign in to your account.",
} as const;

export function OtpEmail({ otp, type }: OtpEmailProps) {
  const heading = headingByType[type];
  const description = descriptionByType[type];

  return (
    <Html>
      <Head />
      <Preview>{heading}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>{heading}</Heading>
          <Text style={text}>{description}</Text>
          <Section style={codeContainer}>
            <Text style={code}>{otp}</Text>
          </Section>
          <Text style={text}>
            This code expires in 5 minutes. If you didn&apos;t request this, you
            can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  borderRadius: "5px",
  margin: "40px auto",
  padding: "20px",
  width: "465px",
};

const h1 = {
  color: "#1d1c1d",
  fontSize: "24px",
  fontWeight: "700" as const,
  margin: "30px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#484848",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "16px 0",
};

const codeContainer = {
  background: "#f4f4f4",
  borderRadius: "4px",
  margin: "16px auto",
  padding: "10px 0",
  textAlign: "center" as const,
  width: "280px",
};

const code = {
  color: "#1d1c1d",
  display: "inline-block",
  fontSize: "32px",
  fontWeight: "700" as const,
  letterSpacing: "6px",
  lineHeight: "40px",
};
