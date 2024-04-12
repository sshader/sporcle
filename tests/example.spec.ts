import { test, expect } from '@playwright/test';

test('join game and submit answer', async ({ page }) => {
  await page.goto(process.env.PLAYWRIGHT_TEST_BASE_URL ?? "http://localhost:3000");

  const joinGameButton = page.getByText("Join game")
  await joinGameButton.click();

  await expect(page.getByText("tolerate it")).not.toBeVisible();

  const guessBox = page.getByPlaceholder("Type your guess…");
  await guessBox.click();
  await guessBox.fill("tolerate it")

  await expect(page.getByText("tolerate it")).toBeVisible();
});
