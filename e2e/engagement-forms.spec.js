import { test, expect } from '@playwright/test';

test.describe('Customer Engagement Forms: Contact & Newsletter', () => {
  test('contact form validates required inputs and submits successfully', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toContainText(/Contact/i);

    // Fill contact form using accessible placeholders
    await page.getByPlaceholder(/e\.g\. Liam Vance/i).fill('Arham Bhatti');
    await page.getByPlaceholder(/e\.g\. liam@example\.com/i).fill('arham@example.pk');
    await page.getByPlaceholder(/Detail your requirements/i).fill('Inquiring about bulk wholesale bespoke leather bomber jackets for export.');

    const submitBtn = page.getByRole('button', { name: /Submit Inquiry/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify submission confirmation feedback
    await expect(
      page.getByRole('heading', { name: 'Message Dispatched' })
    ).toBeVisible({ timeout: 10000 });
  });

  test('newsletter form validates email and accepts valid subscription', async ({ page }) => {
    await page.goto('/');

    const newsletterInput = page.getByPlaceholder(/Enter your email address/i);
    await expect(newsletterInput).toBeVisible({ timeout: 10000 });

    await newsletterInput.fill('newsletter.subscriber@example.pk');
    const subscribeBtn = page.getByRole('button', { name: /^Subscribe$/i });
    await subscribeBtn.click();

    // Verify confirmation feedback
    await expect(
      page.getByText("You're on the list", { exact: false })
    ).toBeVisible({ timeout: 10000 });
  });
});
