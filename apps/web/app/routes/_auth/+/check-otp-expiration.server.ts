import { retrieveVerificationFromDatabaseByIdentifier } from "~/lib/database/facades.server";

export async function getIsOTPExpired(email: string) {
  const identifier = `sign-in-otp-${email}`;
  const record = await retrieveVerificationFromDatabaseByIdentifier(identifier);

  if (!record) {
    return true;
  }

  return Date.now() > record.expiresAt.getTime();
}
