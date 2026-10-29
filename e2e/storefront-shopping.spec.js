import { test, expect } from '@playwright/test';

test.describe('Storefront Browsing, Cart & Checkout Flow', () => {
  test('homepage loads properly with brand header and navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/JAB LEATHER/i);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByRole('link', { name: /shop/i }).first()).toBeVisible();
  });

  test('unauthenticated user clicking add to bag redirects to sign-in page', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('h1')).toContainText(/Leather Products|Shop/i);

    // Click on the first product card or link
    const firstProduct = page.locator('a[href^="/product/"]').first();
    await expect(firstProduct).toBeVisible({ timeout: 10000 });
    await firstProduct.click();

    // Verify product detail page
    await expect(page).toHaveURL(/\/product\//);
    const addToBagButton = page.locator('button:has-text("Add to Bag")').first();
    await expect(addToBagButton).toBeVisible({ timeout: 10000 });
    await addToBagButton.click();

    // Verify redirect to login page because strict sign-in is required
    await expect(page).toHaveURL(/\/account\/login/, { timeout: 10000 });
    await expect(page.locator('h1')).toContainText(/Sign In/i);
  });

  test('sandbox payment simulation: handles decline and success paths', async ({ page }) => {
    // Navigate directly to sandbox payment page with simulated order
    await page.goto('/sandbox-payment?order=JAB-TEST-E2E&amount=350.00&currency=USD');
    await expect(page.getByText('JAB-TEST-E2E', { exact: true })).toBeVisible();
    await expect(page.getByText('$350.00', { exact: true })).toBeVisible();

    // 1. Simulate Card Decline
    const declineButton = page.getByRole('button', { name: /simulate payment decline/i });
    await declineButton.click();
    await expect(page.getByText(/Authorization Failed/i)).toBeVisible();

    // 2. Simulate Success
    const successButton = page.getByRole('button', { name: /simulate successful payment/i });
    await successButton.click();

    // Should redirect to order success page
    await expect(page).toHaveURL(/\/checkout\/success/, { timeout: 10000 });
    await expect(page.getByText(/Thank you for your order/i)).toBeVisible();
  });

  test('checkout form validates phone and required fields', async ({ page }) => {
    // Seed authenticated session and customer cart before navigating to checkout
    await page.addInitScript(() => {
      localStorage.setItem('sb-ivusbfzbxoqvllxkyzcf-auth-token', JSON.stringify({
        access_token: 'fake-e2e-token',
        user: { id: 'c1000000-0000-0000-0000-000000000001', email: 'hamza@example.pk', role: 'authenticated', app_metadata: { role: 'customer' } }
      }));
      localStorage.setItem('jab_cart_c1000000-0000-0000-0000-000000000001', JSON.stringify([
        {
          productId: 'b1000000-0000-0000-0000-000000000001',
          name: 'Heritage Leather Biker Jacket',
          price: 349.0,
          quantity: 1,
          size: 'M',
        }
      ]));
    });

    await page.goto('/checkout');
    await expect(page.locator('h1')).toContainText(/Checkout/i);

    // Fill form using accessible labels
    await page.getByLabel(/First Name/i).fill('Hamza');
    await page.getByLabel(/Last Name/i).fill('Khan');
    await page.getByLabel(/Email Address/i).fill('hamza@example.pk');
    await page.getByLabel(/Phone Number/i).fill('+92 300 7654321');
    await page.getByLabel(/Street Address/i).fill('Kashmir Road, Atelier #4');
    await page.getByLabel(/City/i).fill('Sialkot');
    await page.getByLabel(/State/i).fill('Punjab');
    await page.getByLabel(/Postal/i).fill('51310');

    // Phone field value contains +92
    const phoneInput = page.getByLabel(/Phone Number/i);
    await expect(phoneInput).toHaveValue('+92 300 7654321');
  });
});
