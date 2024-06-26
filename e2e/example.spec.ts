import { test, expect } from '@playwright/test';
import { internal } from "../convex/_generated/api"
import { ConvexClient } from 'convex/browser';
import { ConvexTestingHelper } from "convex-helpers/testing"

test('join game and submit answer', async ({ page }) => {
  const t = new ConvexTestingHelper({
    adminKey: process.env.CONVEX_ADMIN_KEY,
    backendUrl: process.env.NEXT_PUBLIC_CONVEX_URL
  });
  await t.withIdentity(t.newIdentity({})).mutation(internal.seed.default as any, {})
  // Can call internal mutations since we have `CONVEX_ADMIN_KEY`
  await page.goto(process.env.PLAYWRIGHT_TEST_BASE_URL ?? "http://localhost:3000");

  const joinGameButton = page.getByText("Join game").first()
  await joinGameButton.click();

  await expect(page.getByText("tolerate it")).not.toBeVisible();

  const guessBox = page.getByPlaceholder("Type your guess…");
  await guessBox.click();
  await guessBox.fill("tolerate it")

  await expect(page.getByText("tolerate it")).toBeVisible();
});