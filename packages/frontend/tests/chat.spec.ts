import { test, expect } from "@playwright/test";

test.describe("Chat Application", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the API calls
    await page.route("**/chat/agent-types", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(["default", "research", "secure"]),
      });
    });

    await page.route("**/chat", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: {
              role: "assistant",
              content: "This is a mocked response.",
            },
          }),
        });
      }
    });
  });
  test("should display chat interface", async ({ page }) => {
    await page.goto("/");

    // Check if the chat interface is displayed
    await expect(page.locator(".chat-container")).toBeVisible();
    await expect(page.locator(".chat-header h1")).toHaveText("AI Assistant");
    await expect(page.locator(".message-textarea")).toBeVisible();
    await expect(page.locator(".send-button")).toBeVisible();
  });

  test("should allow typing and sending messages", async ({ page }) => {
    await page.goto("/");

    // Type a message
    await page.fill(".message-textarea", "Hello, AI!");

    // Check that the send button is enabled
    await expect(page.locator(".send-button")).toBeEnabled();

    // Send the message
    await page.click(".send-button");

    // Check that the user message appears
    await expect(page.locator(".user-group .message-text")).toContainText(
      "Hello, AI!",
    );
  });

  test("should handle empty messages", async ({ page }) => {
    await page.goto("/");

    // Check that the send button is disabled initially
    await expect(page.locator(".send-button")).toBeDisabled();

    // Check that only the initial AI message is present
    await expect(page.locator(".message-group")).toHaveCount(1);
  });
});
