const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function captureScreenshots() {
  const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Launching browser for high-resolution screenshot capture...');
  const browser = await chromium.launch({ headless: true });

  const mockAdminUser = {
    id: 'a0000000-0000-0000-0000-000000000001',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'admin@jableather.com',
    app_metadata: { role: 'admin' },
    user_metadata: { name: 'Master Artisan Admin' },
    created_at: new Date().toISOString()
  };

  const mockAdminSession = {
    access_token: 'mock-admin-token-jwt',
    token_type: 'bearer',
    expires_in: 7200,
    expires_at: Math.floor(Date.now() / 1000) + 7200,
    refresh_token: 'mock-refresh-token',
    user: mockAdminUser
  };

  // Helper to wait for network and fonts
  const waitForReady = async (page) => {
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
  };

  // 1. Desktop Context
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // HiDPI / Retina crispness
  });

  const desktopPage = await desktopContext.newPage();

  // Setup auth mock for admin routes
  await desktopPage.route('**/auth/v1/**', async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockAdminUser)
    });
  });

  // Inject session for admin
  await desktopPage.addInitScript((session) => {
    window.localStorage.setItem('sb-ivusbfzbxoqvllxkyzcf-auth-token', JSON.stringify(session));
    window.localStorage.setItem('supabase.auth.token', JSON.stringify(session));
  }, mockAdminSession);

  console.log('1. Capturing Storefront Homepage...');
  await desktopPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await waitForReady(desktopPage);
  await desktopPage.screenshot({
    path: path.join(screenshotsDir, '01-storefront-home.png'),
    fullPage: false
  });

  console.log('2. Capturing Storefront Mega Menu...');
  // Find "Shop" or hover over shop dropdown
  const shopNav = desktopPage.locator('nav button, nav a').filter({ hasText: /^Shop$/i }).first();
  if (await shopNav.isVisible()) {
    await shopNav.hover();
    await desktopPage.waitForTimeout(500);
  }
  await desktopPage.screenshot({
    path: path.join(screenshotsDir, '02-mega-menu.png'),
    fullPage: false
  });

  console.log('3. Capturing Shop Catalog Page...');
  await desktopPage.goto('http://localhost:5173/shop', { waitUntil: 'networkidle' });
  await waitForReady(desktopPage);
  await desktopPage.screenshot({
    path: path.join(screenshotsDir, '03-shop-catalog.png'),
    fullPage: false
  });

  console.log('4. Capturing Product Detail Page...');
  await desktopPage.goto('http://localhost:5173/product/heritage-leather-biker-jacket', { waitUntil: 'networkidle' });
  await waitForReady(desktopPage);
  await desktopPage.screenshot({
    path: path.join(screenshotsDir, '04-product-detail.png'),
    fullPage: false
  });

  console.log('5. Capturing Admin Dashboard...');
  await desktopPage.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });
  await waitForReady(desktopPage);
  await desktopPage.screenshot({
    path: path.join(screenshotsDir, '05-admin-dashboard.png'),
    fullPage: false
  });

  console.log('6. Capturing Admin Products Table...');
  await desktopPage.goto('http://localhost:5173/admin/products', { waitUntil: 'networkidle' });
  await waitForReady(desktopPage);
  await desktopPage.screenshot({
    path: path.join(screenshotsDir, '06-admin-products.png'),
    fullPage: false
  });

  console.log('7. Capturing Admin Product Editor (Populated 8 Shopify Sections)...');
  await desktopPage.goto('http://localhost:5173/admin/products/b1000000-0000-0000-0000-000000000001', { waitUntil: 'networkidle' });
  await waitForReady(desktopPage);
  await desktopPage.screenshot({
    path: path.join(screenshotsDir, '07-admin-product-editor.png'),
    fullPage: false
  });

  console.log('7b. Capturing Admin Product Variants & SEO SERP Snippet Preview...');
  await desktopPage.evaluate(() => {
    window.scrollTo(0, 1150);
  });
  await desktopPage.waitForTimeout(500);
  await desktopPage.screenshot({
    path: path.join(screenshotsDir, '07b-admin-variants-seo.png'),
    fullPage: false
  });

  console.log('8. Capturing Admin Categories Management...');
  await desktopPage.goto('http://localhost:5173/admin/categories', { waitUntil: 'networkidle' });
  await waitForReady(desktopPage);
  await desktopPage.screenshot({
    path: path.join(screenshotsDir, '08-admin-categories.png'),
    fullPage: false
  });

  // 2. Mobile Context (iPhone 14 / Pro equivalent 390x844)
  console.log('9. Capturing Mobile Storefront...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await waitForReady(mobilePage);
  await mobilePage.screenshot({
    path: path.join(screenshotsDir, '09-mobile-storefront.png'),
    fullPage: false
  });

  await browser.close();
  console.log('All screenshots captured successfully in docs/screenshots/!');
}

captureScreenshots().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
