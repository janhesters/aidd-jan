# Test Data Factories

Factory {
  A function that creates a fully populated test entity with realistic defaults.
  Every field has a sensible default; callers override only what the test cares about.

  Constraints {
    Name factories `createPopulated[Entity]`.
    Accept a single optional object parameter with defaults for every field.
    Use faker for realistic values, cuid2 for IDs, date-fns for date math.
    Return a plain object matching the entity's type.
    Sort object keys alphabetically in the return value.
    Import a shared `Factory<T>` utility type: `(params?: Partial<T>) => T`.
    Never share factory output as mutable state between tests — invoke per test.
  }
}

## Base Factory Example

```ts
import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { addDays } from "date-fns";

import { slugify } from "~/utils/slugify.server";
import type { Factory } from "~/utils/types";
import type { Organization } from "~/generated/client";

export const createPopulatedOrganization: Factory<Organization> = ({
  id = createId(),
  name = faker.company.name(),
  slug = slugify(name),
  updatedAt = faker.date.recent({ days: 10 }),
  createdAt = faker.date.past({ refDate: updatedAt, years: 1 }),
  imageUrl = faker.image.url(),
  billingEmail = faker.internet.email(),
  stripeCustomerId = `cus_${createId()}`,
  trialEnd = addDays(createdAt, 14),
} = {}) => ({
  billingEmail,
  createdAt,
  id,
  imageUrl,
  name,
  slug,
  stripeCustomerId,
  trialEnd,
  updatedAt,
});
```

## Compound Factory Example

Compose base factories for complex shapes with nested relations.

```ts
import { faker } from "@faker-js/faker";

import { createPopulatedOrganization } from "./organization-factories.server";
import { createPopulatedStripeSubscriptionWithScheduleAndItemsWithPriceAndProduct } from "../billing/billing-factories.server";
import type { OrganizationWithMembershipsAndSubscriptions } from "../onboarding/onboarding-helpers.server";

export const createOrganizationWithMembershipsAndSubscriptions = ({
  organization = createPopulatedOrganization(),
  memberCount = faker.number.int({ max: 10, min: 1 }),
  stripeSubscriptions = [
    createPopulatedStripeSubscriptionWithScheduleAndItemsWithPriceAndProduct(),
  ],
} = {}): OrganizationWithMembershipsAndSubscriptions => ({
  ...organization,
  _count: { memberships: memberCount },
  stripeSubscriptions,
});
```

## Patterns

CompoundFactory {
  Composes base factories for entities with relations.
  Spreads the base entity and adds computed/nested fields.
  Each nested relation uses its own factory as a default.
}

FactoryFileConvention {
  Colocate factory files with the feature they serve.
  Name: `[feature]-factories.server.ts` or `[feature]-factories.ts`.
}
