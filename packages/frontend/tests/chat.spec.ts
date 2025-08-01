import { test, expect } from "@playwright/test";

test.describe("Chat Application", () => {
  test("should display chat interface", async ({ page }) => {
    await page.goto("/");

    // Check if the chat interface is displayed
    await expect(page.locator(".chat-container")).toBeVisible();
    await expect(page.locator(".chat-header h1")).toHaveText("AI Chat");
    await expect(page.locator(".message-input")).toBeVisible();
    await expect(page.locator(".send-button")).toBeVisible();
  });

  test("should allow typing and sending messages", async ({ page }) => {
    await page.goto("/");

    // Type a message
    await page.fill(".message-input", "Hello, AI!");

    // Check that the send button is enabled
    await expect(page.locator(".send-button")).toBeEnabled();

    // Send the message
    await page.click(".send-button");

    // Check that the user message appears
    await expect(page.locator(".user-message")).toContainText("Hello, AI!");
  });

  test("should handle empty messages", async ({ page }) => {
    await page.goto("/");

    // Try to send an empty message
    await page.click(".send-button");

    // Check that no message was sent
    await expect(page.locator(".message")).toHaveCount(0);
  });
});
