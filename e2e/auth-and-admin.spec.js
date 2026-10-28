import { test, expect } from '@playwright/test';

test.describe('Auth Protection & Administrative Route Guards', () => {
  test('unauthenticated visitor accessing /admin is redirected to /admin/login', async ({ page }) => {
    await page.goto('/admin');
    // AdminLayout redirects to /admin/login
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
    await expect(page.getByText(/Admin Portal|Sign In|Administrator/i).first()).toBeVisible();
  });

  test('unauthenticated visitor accessing /account is redirected to /account/login', async ({ page }) => {
    await page.goto('/account');
    // AccountLayout redirects to /account/login
    await expect(page).toHaveURL(/\/account\/login/, { timeout: 10000 });
    await expect(page.getByText(/Customer Login|Sign In/i).first()).toBeVisible();
  });

  test('admin login form renders necessary email and password fields', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /access admin portal/i })).toBeVisible();
  });

  test('customer login and registration forms render properly', async ({ page }) => {
    await page.goto('/account/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Navigate to customer signup
    await page.goto('/account/signup');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account|sign up/i })).toBeVisible();
  });
});
