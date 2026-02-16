import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const LANDING_PAGE = "/";

test("given: any user, should: display correct metadata, logo, navigation, and links", async ({
	page,
}) => {
	await page.goto(LANDING_PAGE);

	await expect(page).toHaveTitle("New React Router App");
	await expect(page.locator('meta[name="description"]')).toHaveAttribute(
		"content",
		"Welcome to React Router!",
	);
	await expect(page.locator("html")).toHaveAttribute("lang", "en");

	const logo = page.getByAltText("React Router");
	await expect(logo.first()).toBeVisible();

	const nav = page.getByRole("navigation");
	await expect(nav).toContainText("What's next?");

	const docsLink = page.getByRole("link", { name: /React Router Docs/i });
	await expect(docsLink).toBeVisible();
	await expect(docsLink).toHaveAttribute(
		"href",
		"https://reactrouter.com/docs",
	);
	await expect(docsLink).toHaveAttribute("target", "_blank");

	const discordLink = page.getByRole("link", { name: /Join Discord/i });
	await expect(discordLink).toBeVisible();
	await expect(discordLink).toHaveAttribute("href", "https://rmx.as/discord");
	await expect(discordLink).toHaveAttribute("target", "_blank");
});

test("given: any user, should: have no accessibility violations", async ({
	page,
}) => {
	await page.goto(LANDING_PAGE);

	const results = await new AxeBuilder({ page }).analyze();
	expect(results.violations).toEqual([]);
});
