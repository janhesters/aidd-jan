import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const LANDING_PAGE = "/";

test("given: any user, should: display correct metadata, header, hero, logo cloud, features, and footer", async ({
  page,
}) => {
  await page.goto(LANDING_PAGE);

  await expect(page).toHaveTitle("React SaaS Template");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /Ship your SaaS faster/,
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  const nav = page.getByRole("navigation");
  await expect(nav).toBeVisible();

  const heading = page.getByRole("heading", {
    level: 1,
    name: /React Router SaaS Template/,
  });
  await expect(heading).toBeVisible();

  const getStartedButton = page.getByRole("link", { name: /Get Started/i });
  await expect(getStartedButton.first()).toBeVisible();

  const heroImage = page.getByAltText(/Application dashboard preview/i);
  await expect(heroImage.first()).toBeVisible();

  const trustedByHeading = page.getByRole("heading", {
    level: 2,
    name: /Trusted by/,
  });
  await expect(trustedByHeading).toBeVisible();

  const featureHeading = page.getByRole("heading", {
    level: 3,
    name: /2 Minutes Setup/,
  });
  await expect(featureHeading).toBeVisible();

  const faqHeading = page.getByRole("heading", {
    level: 2,
    name: /Frequently asked questions/,
  });
  await expect(faqHeading).toBeVisible();

  const footer = page.getByRole("contentinfo");
  await expect(footer).toBeVisible();
});

test("given: any user on mobile, should: open and close mobile navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(LANDING_PAGE);

  const menuButton = page.getByRole("button", { name: /Toggle menu/i });
  await expect(menuButton).toBeVisible();

  await menuButton.click();

  const mobileNav = page.getByRole("navigation", { name: /Mobile/i });
  await expect(mobileNav).toBeVisible();

  const navLinks = mobileNav.getByRole("listitem");
  await expect(navLinks).toHaveCount(3);

  const closeButton = page.getByRole("button", { name: /Close/i });
  await closeButton.click();

  await expect(mobileNav).toBeHidden();
});

test("given: any user, should: let the user switch the theme", async ({
  page,
}) => {
  await page.goto(LANDING_PAGE);

  const htmlElement = page.locator("html");
  await expect(htmlElement).not.toHaveClass("dark");

  await page.getByRole("button", { name: /open theme menu/i }).click();
  await page.getByRole("menuitem", { name: /dark/i }).click();

  await expect(htmlElement).toHaveClass(/dark/);

  await page.getByRole("button", { name: /open theme menu/i }).click();
  await expect(
    page.getByRole("menuitem", { name: /dark/i }),
  ).toHaveAttribute("aria-disabled", "true");

  await page.reload();
  await expect(htmlElement).toHaveClass(/dark/);

  await page.getByRole("button", { name: /open theme menu/i }).click();
  await page.getByRole("menuitem", { name: /light/i }).click();

  await expect(htmlElement).toHaveClass(/light/);
  await expect(htmlElement).not.toHaveClass(/dark/);
});

test("given: any user, should: filter FAQ items by search and category", async ({
  page,
}) => {
  await page.goto(LANDING_PAGE);

  const faqHeading = page.getByRole("heading", {
    level: 2,
    name: /Frequently asked questions/,
  });
  await expect(faqHeading).toBeVisible();
  await faqHeading.scrollIntoViewIfNeeded();

  await expect(
    page.getByRole("button", { name: /Is aidd free\?/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /How does authentication work\?/ }),
  ).toBeVisible();

  const searchInput = page.getByPlaceholder(/Search questions/);
  await searchInput.fill("Drizzle");
  await expect(
    page.getByRole("button", { name: /What database does this use\?/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Is aidd free\?/ }),
  ).toBeHidden();

  await searchInput.fill("xyznonexistent");
  await expect(page.getByText(/No questions found/)).toBeVisible();

  await searchInput.clear();

  const supportTab = page.getByRole("button", { name: /^Support$/ });
  await supportTab.click();
  await expect(
    page.getByRole("button", { name: /Where can I get help\?/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Is aidd free\?/ }),
  ).toBeHidden();

  await page.getByRole("button", { name: /^All$/ }).click();
  await expect(
    page.getByRole("button", { name: /Is aidd free\?/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Where can I get help\?/ }),
  ).toBeVisible();

  await page.getByRole("button", { name: /Where can I get help\?/ }).click();
  await expect(page.getByText(/GitHub Discussions/)).toBeVisible();
});

test("given: any user, should: have no accessibility violations", async ({
  page,
}) => {
  await page.goto(LANDING_PAGE);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
