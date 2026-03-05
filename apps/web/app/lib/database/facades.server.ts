import { db } from "@workspace/db";
import { desc, eq } from "@workspace/db/operators";
import { verification } from "@workspace/db/schema";

/**
 * Retrieves the most recent verification record from the database by identifier.
 *
 * @param identifier - The identifier of the verification to retrieve.
 * @returns The verification record with expiresAt field or null if not found.
 */
export async function retrieveVerificationFromDatabaseByIdentifier(
  identifier: typeof verification.$inferSelect.identifier,
) {
  const record = await db
    .select({ expiresAt: verification.expiresAt })
    .from(verification)
    .where(eq(verification.identifier, identifier))
    .orderBy(desc(verification.createdAt))
    .limit(1);

  return record[0] ?? null;
}
