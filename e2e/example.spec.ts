import { test, expect } from '@playwright/test';
import { internal } from "../convex/_generated/api"
import { ConvexClient } from 'convex/browser';

test('join game and submit answer', async ({ page }) => {
  const client = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  (client as any).setAdminAuth(process.env.CONVEX_ADMIN_KEY)
  // Can call internal mutations since we have `CONVEX_ADMIN_KEY`
  await page.goto(process.env.PLAYWRIGHT_TEST_BASE_URL ?? "http://localhost:3000");
  await client.mutation(internal.seed.default as any, {})

  const joinGameButton = page.getByText("Join game").first()
  await joinGameButton.click();

  await expect(page.getByText("tolerate it")).not.toBeVisible();

  const guessBox = page.getByPlaceholder("Type your guess…");
  await guessBox.click();
  await guessBox.fill("tolerate it")

  await expect(page.getByText("tolerate it")).toBeVisible();
});