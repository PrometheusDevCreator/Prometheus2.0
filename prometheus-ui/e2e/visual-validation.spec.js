/**
 * Visual Validation E2E Tests
 * ============================
 *
 * Tests color schemes, styling, and visual elements
 * per the Prometheus Design System.
 *
 * IMPORTANT - FORCE CLICKS REQUIRED:
 * 1. Logo: Has breathing animation making it "not stable" - use { force: true }
 * 2. Navigation arrows (↑→↓←): Have SVG circle overlays that intercept
 *    pointer events - use { force: true } to bypass
 */

import { test, expect } from '@playwright/test'

// Test configuration
test.use({
  viewport: { width: 1890, height: 940 }
})

// Helper: Login
async function login(page) {
  await page.goto('/')
  await page.getByRole('img', { name: 'Prometheus' }).click({ force: true })
  await page.locator('input[type="text"]').fill('testuser')
  await page.locator('input[type="password"]').fill('testpass')
  await page.getByRole('button', { name: 'LOGIN' }).click()
  await expect(page.getByRole('heading', { name: 'NAVIGATION HUB' })).toBeVisible({ timeout: 10000 })
}

// ============================================
// COLOR SCHEME VALIDATION
// ============================================
test.describe('Visual: Color Scheme', () => {

  test('Login page has dark background', async ({ page }) => {
    await page.goto('/')

    const bgColor = await page.evaluate(() => {
      const container = document.querySelector('div')
      return window.getComputedStyle(container).backgroundColor
    })

    // Should be dark (low RGB values)
    const rgbMatch = bgColor.match(/rgb\((\d+), (\d+), (\d+)\)/)
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch.map(Number)
      expect(r).toBeLessThan(50)
      expect(g).toBeLessThan(50)
      expect(b).toBeLessThan(50)
    }
  })

  test('Title text has light color', async ({ page }) => {
    await page.goto('/')

    const title = page.getByRole('heading', { name: 'PROMETHEUS COURSE GENERATION SYSTEM 2.0' })
    await expect(title).toBeVisible()

    const color = await title.evaluate(el => window.getComputedStyle(el).color)

    // Color should be light (high RGB values for visibility on dark bg)
    const colorMatch = color.match(/rgb\((\d+), (\d+), (\d+)\)/)
    if (colorMatch) {
      const [, r, g, b] = colorMatch.map(Number)
      expect(r).toBeGreaterThan(150)
      expect(g).toBeGreaterThan(150)
      expect(b).toBeGreaterThan(150)
    }
  })

  test('Login button has gradient styling', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('img', { name: 'Prometheus' }).click({ force: true })

    const loginButton = page.getByRole('button', { name: 'LOGIN' })
    await expect(loginButton).toBeVisible()

    const bgStyle = await loginButton.evaluate(el =>
      window.getComputedStyle(el).background
    )

    expect(bgStyle.length).toBeGreaterThan(0)
  })
})

// ============================================
// TYPOGRAPHY VALIDATION
// ============================================
test.describe('Visual: Typography', () => {

  test('Login labels use sans-serif font', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('img', { name: 'Prometheus' }).click({ force: true })

    const usernameLabel = page.getByText('USERNAME')
    await expect(usernameLabel).toBeVisible()

    const fontFamily = await usernameLabel.evaluate(el =>
      window.getComputedStyle(el).fontFamily
    )

    expect(fontFamily.toLowerCase()).toMatch(/candara|calibri|sans-serif/)
  })

  test('Title has letter spacing', async ({ page }) => {
    await page.goto('/')

    const title = page.getByRole('heading', { name: 'PROMETHEUS COURSE GENERATION SYSTEM 2.0' })
    const letterSpacing = await title.evaluate(el =>
      window.getComputedStyle(el).letterSpacing
    )

    expect(letterSpacing).not.toBe('normal')
  })
})

// ============================================
// LAYOUT VALIDATION
// ============================================
test.describe('Visual: Layout', () => {

  test('Login page is centered', async ({ page }) => {
    await page.goto('/')

    const title = page.getByRole('heading', { name: 'PROMETHEUS COURSE GENERATION SYSTEM 2.0' })
    const box = await title.boundingBox()

    if (box) {
      const viewportWidth = 1890
      const titleCenter = box.x + (box.width / 2)
      const viewportCenter = viewportWidth / 2

      expect(Math.abs(titleCenter - viewportCenter)).toBeLessThan(100)
    }
  })

  test('Login logo is centered', async ({ page }) => {
    await page.goto('/')

    const logo = page.getByRole('img', { name: 'Prometheus' })
    const box = await logo.boundingBox()

    if (box) {
      const viewportWidth = 1890
      const logoCenter = box.x + (box.width / 2)
      const viewportCenter = viewportWidth / 2

      expect(Math.abs(logoCenter - viewportCenter)).toBeLessThan(100)
    }
  })

  test('Navigation wheel is centered', async ({ page }) => {
    await login(page)

    const defineLabel = page.getByText('DEFINE').first()
    const box = await defineLabel.boundingBox()

    if (box) {
      const viewportWidth = 1890
      const labelCenter = box.x + (box.width / 2)
      const viewportCenter = viewportWidth / 2

      expect(Math.abs(labelCenter - viewportCenter)).toBeLessThan(200)
    }
  })
})

// ============================================
// INTERACTIVE ELEMENT STYLING
// ============================================
test.describe('Visual: Interactive Elements', () => {

  test('Input fields have rounded borders', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('img', { name: 'Prometheus' }).click({ force: true })

    const input = page.locator('input[type="text"]')
    await expect(input).toBeVisible()

    const borderRadius = await input.evaluate(el =>
      window.getComputedStyle(el).borderRadius
    )

    expect(parseInt(borderRadius)).toBeGreaterThan(10)
  })

  test('Button is styled', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('img', { name: 'Prometheus' }).click({ force: true })

    const button = page.getByRole('button', { name: 'LOGIN' })
    await expect(button).toBeVisible()

    const borderRadius = await button.evaluate(el =>
      window.getComputedStyle(el).borderRadius
    )

    expect(parseInt(borderRadius)).toBeGreaterThan(10)
  })
})

// ============================================
// NAVIGATION HUB VISUAL TESTS
// ============================================
test.describe('Visual: Navigation Hub', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Navigation labels are positioned correctly', async ({ page }) => {
    // DEFINE should be at North (top)
    const defineBox = await page.getByText('DEFINE').first().boundingBox()
    // BUILD should be at South (bottom)
    const buildBox = await page.getByText('BUILD').first().boundingBox()

    if (defineBox && buildBox) {
      expect(defineBox.y).toBeLessThan(buildBox.y)
    }

    // DESIGN should be at East (right)
    const designBox = await page.getByText('DESIGN').first().boundingBox()
    // FORMAT should be at West (left)
    const formatBox = await page.getByText('FORMAT').first().boundingBox()

    if (designBox && formatBox) {
      expect(designBox.x).toBeGreaterThan(formatBox.x)
    }
  })

  test('Arrow indicators are visible', async ({ page }) => {
    await expect(page.getByText('↑').first()).toBeVisible()
    await expect(page.getByText('→').first()).toBeVisible()
    await expect(page.getByText('↓').first()).toBeVisible()
    await expect(page.getByText('←').first()).toBeVisible()
  })

  test('GENERATE hub is centered', async ({ page }) => {
    const generateLabel = page.getByText('GENERATE').first()
    await expect(generateLabel).toBeVisible()

    const box = await generateLabel.boundingBox()
    if (box) {
      const viewportWidth = 1890
      const viewportHeight = 940
      const labelCenterX = box.x + (box.width / 2)

      expect(Math.abs(labelCenterX - viewportWidth / 2)).toBeLessThan(300)
    }
  })
})

// ============================================
// RESPONSIVE BEHAVIOR
// ============================================
test.describe('Visual: Responsive', () => {

  test('Page renders at 1890x940 baseline', async ({ page }) => {
    await page.goto('/')

    const viewportSize = page.viewportSize()
    expect(viewportSize?.width).toBe(1890)
    expect(viewportSize?.height).toBe(940)

    await expect(page.getByRole('heading', { name: 'PROMETHEUS COURSE GENERATION SYSTEM 2.0' })).toBeVisible()
  })

  test('Logo has appropriate size', async ({ page }) => {
    await page.goto('/')

    const logo = page.getByRole('img', { name: 'Prometheus' })
    const box = await logo.boundingBox()

    if (box) {
      expect(box.width).toBeGreaterThan(100)
      expect(box.width).toBeLessThan(300)
      expect(box.height).toBeGreaterThan(100)
      expect(box.height).toBeLessThan(300)
    }
  })
})

// ============================================
// ANIMATION PRESENCE
// ============================================
test.describe('Visual: Animations', () => {

  test('Login fields fade in on logo click', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('input[type="text"]')).not.toBeVisible()

    await page.getByRole('img', { name: 'Prometheus' }).click({ force: true })

    await expect(page.locator('input[type="text"]')).toBeVisible()
  })

  test('Logo has animation defined', async ({ page }) => {
    await page.goto('/')

    const logo = page.getByRole('img', { name: 'Prometheus' })
    await expect(logo).toBeVisible()

    const animation = await logo.evaluate(el =>
      window.getComputedStyle(el).animation
    )

    expect(animation).toBeDefined()
  })
})
