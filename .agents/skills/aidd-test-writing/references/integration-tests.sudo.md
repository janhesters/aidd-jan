# Integration Test Examples

IntegrationTest {
  Tests a unit integrated with real external systems (database, filesystem, API).
  Uses real dependencies — no mocking of the system being integrated with.

  Constraints {
    Use a local `setup()` function per describe block for test-specific state.
    Use `onTestFinished` inside `setup()` for cleanup — never `afterEach`/`afterAll`.
    Each test must be self-contained: creates its own data, cleans up after itself.
    No shared mutable state between tests.
    Factory functions create realistic test data — invoke them per test.
  }
}

## Vitest Example

```ts
import { describe, expect, onTestFinished, test } from "vitest";

import { createPopulatedUserAccount } from "~/features/user-account/user-account-factories.server";
import { requireUserExists } from "~/features/user-account/user-account-helpers.server";
import {
  deleteUserAccountFromDatabaseById,
  saveUserAccountToDatabase,
} from "~/features/user-account/user-account-model.server";

async function setup() {
  const user = createPopulatedUserAccount();
  await saveUserAccountToDatabase(user);

  onTestFinished(async () => {
    await deleteUserAccountFromDatabaseById(user.id);
  });

  return { user };
}

describe("requireUserExists()", () => {
  test("given a user ID for an existing user: returns the user", async () => {
    const { user } = await setup();

    const actual = await requireUserExists(user.id);
    const expected = user;

    expect(actual).toEqual(expected);
  });

  test("given a user ID for a non-existing user: throws a 404 error", async () => {
    expect.assertions(1);

    const userId = "non-existing-user-id";

    try {
      await requireUserExists(userId);
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(404);
      }
    }
  });
});
```

## Key Patterns

SetupPattern {
  Define `async function setup()` at the top of each `describe` block.
  Create data, register cleanup with `onTestFinished`, return what tests need.
  Each test destructures only what it uses from `setup()`.
}

FactoryPattern {
  Use `createPopulated*` factories to build realistic test entities.
  Factories return complete, valid objects — override only what the test cares about.
  Never share factory output across tests as mutable state.
}

ErrorTestPattern {
  Use `expect.assertions(n)` to guarantee the assertion runs.
  Wrap the throwing call in try/catch.
  Assert on the error's properties inside the catch block.
}

MSWPattern {
  Use `setupMockServerLifecycle` for external API mocking (e.g. Stripe, Resend).
  This is an acceptable use of lifecycle hooks — it's global infra, not test state.
  Verify side effects via MSW event listeners when needed:

  ```ts
  let stripeUpdateCalled = false;
  const listener = ({ request }: { request: Request }) => {
    if (new URL(request.url).pathname.startsWith("/v1/subscriptions/")) {
      stripeUpdateCalled = true;
    }
  };
  server.events.on("response:mocked", listener);
  onTestFinished(() => {
    server.events.removeListener("response:mocked", listener);
  });
  // ... perform action ...
  expect(stripeUpdateCalled).toEqual(true);
  ```
}

ParameterizedIntegrationTest {
  Use `test.each` with objects for multi-case integration tests:

  ```ts
  test.each([
    {
      given: "no email",
      body: { intent, role: "member" },
      expected: badRequest({ ... }),
    },
    {
      given: "invalid email",
      body: { email: "not-an-email", intent, role: "member" },
      expected: badRequest({ ... }),
    },
  ])("given: invalid form data ($given), should: return 400", async ({
    body,
    expected,
  }) => {
    // ...
    expect(actual).toMatchObject({ data: expected.data });
  });
  ```
}

RequestHelperPattern {
  Extract repeated request setup into a helper function per describe block.
  The helper handles authentication, URL construction, and request creation.
  Tests call the helper with only the varying parts (formData, user, slug).
}
