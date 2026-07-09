# E2E Test Examples

E2ETest {
  Tests full user flows in a real browser via Playwright.

  Constraints {
    Import `test`, `expect` from `@playwright/test`.
    Use `test.describe` to group by page or feature.
    Use nested `test.describe` to group by role or scenario.
    Use `test` string pattern: `"given: [condition], should: [behavior]"`.
    Query by accessible role first (`getByRole`), then label (`getByLabel`),
    then text (`getByText`). Avoid `getByTestId` unless no alternative.
    Each test creates its own data via setup helpers and tears it down after.
    Verify both UI state and database state after actions.
    Use `test.step` for logical sub-steps within a longer test.
    Use `test.each` for parameterized role/variant tests.
    Include an accessibility test per page using `@axe-core/playwright`.
  }
}

## Simple Example

```ts
import { expect, test } from "@playwright/test";

test.describe("Wikipedia Search", () => {
  test("given: a search term, should: render the matching article", async ({
    page,
  }) => {
    await page.goto("https://www.wikipedia.org/");

    const searchInput = page.getByRole("searchbox", {
      name: "Search Wikipedia",
    });
    await searchInput.fill("Playwright");

    const searchButton = page.getByRole("button", { name: "Search" });
    await searchButton.click();

    await expect(page).toHaveTitle(/Playwright/);

    const firstHeading = page.getByRole("heading", {
      level: 1,
      name: "Playwright",
    });
    await expect(firstHeading).toHaveText("Playwright");
  });
});
```

## Realistic Example with Setup/Teardown

```ts
import { expect, test } from "@playwright/test";

import {
  setupOrganizationAndLoginAsMember,
  teardownOrganizationAndMember,
} from "../../utils";
import { createPopulatedOrganization } from "~/features/organizations/organizations-factories.server";
import {
  deleteOrganizationFromDatabaseById,
  saveOrganizationToDatabase,
} from "~/features/organizations/organizations-model.server";
import { createPopulatedUserAccount } from "~/features/user-accounts/user-accounts-factories.server";
import { deleteUserAccountFromDatabaseById } from "~/features/user-accounts/user-accounts-model.server";
import { OrganizationMembershipRole } from "~/generated/client";

test.describe("organization settings members page", () => {
  test("given: a logged out user, should: redirect to login page", async ({
    page,
  }) => {
    const { slug } = createPopulatedOrganization();
    await page.goto(`/organizations/${slug}/settings/members`);

    expect(page.url()).toContain("/login?redirectTo=");
  });

  test("given: a user who is NOT a member, should: show 404 page", async ({
    page,
  }) => {
    const { organization, user } =
      await setupOrganizationAndLoginAsMember({ page });
    const otherOrg = createPopulatedOrganization();
    await saveOrganizationToDatabase(otherOrg);

    await page.goto(`/organizations/${otherOrg.slug}/settings/members`);

    await expect(
      page.getByRole("heading", { level: 1, name: /page not found/i }),
    ).toBeVisible();

    await teardownOrganizationAndMember({ organization, user });
    await deleteOrganizationFromDatabaseById(otherOrg.id);
  });
});
```

## Role-Based Testing Pattern

```ts
test.describe("as Admin", () => {
  test("given: an admin, should: show invite cards and allow role changes", async ({
    page,
  }) => {
    const data = await setupMultipleMembers({
      otherMemberRoles: [
        OrganizationMembershipRole.member,
        OrganizationMembershipRole.owner,
      ],
      page,
      requestingUserRole: OrganizationMembershipRole.admin,
    });

    await page.goto(getMembersPagePath(data.organization.slug));

    await test.step("verify invite cards are visible", async () => {
      await expect(page.getByText(/invite by email/i)).toBeVisible();
      await expect(page.getByText(/share an invite link/i)).toBeVisible();
    });

    await test.step("verify admin can change member role", async () => {
      const table = page.getByRole("table");
      const memberRow = table.getByRole("row", { name: memberUser.email });
      await memberRow.getByRole("button", { name: /member/i }).click();
      await page.getByRole("button", { name: /admin/i }).click();

      // Verify DB
      const updated = await retrieveMembershipFromDatabase({
        organizationId: data.organization.id,
        userId: memberUser.id,
      });
      expect(updated?.role).toEqual(OrganizationMembershipRole.admin);
    });

    await teardownMultipleMembers(data);
  });
});
```

## Accessibility Test Pattern

```ts
import AxeBuilder from "@axe-core/playwright";

test("given: the page is loaded, should: lack automatically detectable accessibility issues", async ({
  page,
}) => {
  const data = await setupMultipleMembers({
    activeInviteLink: true,
    otherMemberRoles: [OrganizationMembershipRole.member],
    page,
    requestingUserRole: OrganizationMembershipRole.owner,
  });

  await page.goto(getMembersPagePath(data.organization.slug));

  const results = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();

  expect(results.violations).toEqual([]);

  await teardownMultipleMembers(data);
});
```

## Patterns

SetupTeardown {
  Create helper functions that set up real data in the database.
  Each test calls its own setup and teardown — no shared state.
  Teardown deletes in reverse dependency order (org first, then users).
  Pass `page` into setup helpers for login/session management.
}

DatabaseVerification {
  After UI actions, query the database directly to confirm persistence.
  Assert both UI state (`toBeVisible`, `toBeDisabled`) and DB state.
}

NestedDescribe {
  Group tests by role or feature section using nested `test.describe`.
  Keeps related authorization/permission tests together.
}

ParameterizedRoles {
  Use `test.each(["member", "admin", "owner"] as const)` to test
  the same behavior across multiple roles without duplicating tests.
}
