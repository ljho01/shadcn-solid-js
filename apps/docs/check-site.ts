import { chromium } from '@playwright/test';

async function checkSite() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const pages = [
    { url: 'http://localhost:3001/', name: '01-home' },
    { url: 'http://localhost:3001/docs/button', name: '02-button' },
    { url: 'http://localhost:3001/docs/card', name: '03-card' },
    { url: 'http://localhost:3001/docs/input', name: '04-input' },
    { url: 'http://localhost:3001/docs/accordion', name: '05-accordion' },
    { url: 'http://localhost:3001/docs/dialog', name: '06-dialog' },
    { url: 'http://localhost:3001/docs/tabs', name: '07-tabs' },
    { url: 'http://localhost:3001/docs/table', name: '08-table' },
    { url: 'http://localhost:3001/docs/badge', name: '09-badge' },
    { url: 'http://localhost:3001/docs/alert', name: '10-alert' },
    { url: 'http://localhost:3001/docs/checkbox', name: '11-checkbox' },
    { url: 'http://localhost:3001/docs/progress', name: '12-progress' },
    { url: 'http://localhost:3001/docs/collapsible', name: '15-collapsible' },
    { url: 'http://localhost:3001/docs/select', name: '16-select' },
  ];

  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `screenshots/${p.name}-light.png`, fullPage: true });
    console.log(`✓ ${p.name} light captured`);
  }

  // Dark mode
  await page.goto('http://localhost:3001/docs/button', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  // Toggle dark mode
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/13-button-dark.png', fullPage: true });
  console.log('✓ dark mode captured');

  // Go home in dark mode
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/14-home-dark.png', fullPage: true });
  console.log('✓ home dark captured');

  await browser.close();
  console.log('\nAll screenshots saved to screenshots/');
}

checkSite().catch(console.error);
