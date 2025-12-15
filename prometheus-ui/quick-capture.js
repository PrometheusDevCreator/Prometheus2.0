import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'refactor-baseline');
const prefix = process.argv[2] || 'test';

// Resolutions to capture
const RESOLUTIONS = [
  { width: 1920, height: 1080, suffix: '1920' },
  { width: 1536, height: 864, suffix: '1536' }
];

async function captureAtResolution(browser, res) {
  const context = await browser.newContext({ viewport: { width: res.width, height: res.height } });
  const page = await context.newPage();

  try {
    // Login page
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1000);

    // Login
    await page.click('img[alt="Prometheus"]', { force: true });
    await page.waitForTimeout(800);
    await page.fill('input[type="text"]', 'testuser');
    await page.fill('input[type="password"]', 'testpass');
    await page.click('button:has-text("LOGIN")', { force: true });
    await page.waitForTimeout(1500);

    // Define
    await page.click('text="DEFINE"', { force: true });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${prefix}_define_${res.suffix}.png`) });
    console.log(`Captured: define @ ${res.width}x${res.height}`);

  } finally {
    await context.close();
  }
}

async function capture() {
  const browser = await chromium.launch({ headless: true });

  try {
    for (const res of RESOLUTIONS) {
      await captureAtResolution(browser, res);
    }
    console.log('Done!');
  } finally {
    await browser.close();
  }
}

capture();
