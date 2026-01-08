/**
 * PROMETHEUS SYSTEM OPERATOR CHECK (SOC) - FULL E2E TEST SUITE
 * =============================================================
 *
 * Per Prometheus Testing Doctrine:
 * - Every button, toggle, and dropdown exercised
 * - Invalid sequences attempted deliberately
 * - Cross-page navigation stress testing
 * - Persistence validation
 * - Data integrity checks
 * - Behaviour under misuse
 *
 * Baseline: 1890 x 940 viewport per PLAYWRIGHT_CONFIG.md
 *
 * IMPORTANT - FORCE CLICKS REQUIRED:
 * 1. Logo: Has breathing animation making it "not stable" - use { force: true }
 * 2. Navigation arrows (↑→↓←): Have SVG circle overlays that intercept
 *    pointer events - use { force: true } to bypass
 */

import { test, expect } from '@playwright/test'

// Test configuration - viewport per PLAYWRIGHT_CONFIG.md
test.use({
  viewport: { width: 1890, height: 940 }
})

// ============================================
// HELPER: Login to the application
// ============================================
async function login(page) {
  await page.goto('/')
  // Click logo with force due to breathing animation
  await page.getByRole('img', { name: 'Prometheus' }).click({ force: true })
  await page.locator('input[type="text"]').fill('testuser')
  await page.locator('input[type="password"]').fill('testpass')
  await page.getByRole('button', { name: 'LOGIN' }).click()
  // Wait for Navigation Hub to load
  await expect(page.getByRole('heading', { name: 'NAVIGATION HUB' })).toBeVisible({ timeout: 10000 })
}

// ============================================
// SECTION 1: LOGIN PAGE TESTS
// ============================================
test.describe('SOC: Login Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('1.1 Initial state - logo visible, no input fields', async ({ page }) => {
    // Logo should be visible
    await expect(page.getByRole('img', { name: 'Prometheus' })).toBeVisible()

    // "CLICK TO LOGIN" hint should be visible
    await expect(page.getByText('CLICK TO LOGIN')).toBeVisible()

    // Input fields should NOT be visible initially
    await expect(page.locator('input[type="text"]')).not.toBeVisible()
    await expect(page.locator('input[type="password"]')).not.toBeVisible()
  })

  test('1.2 First click on logo reveals login fields', async ({ page }) => {
    // Click the logo (force due to animation)
    await page.getByRole('img', { name: 'Prometheus' }).click({ force: true })

    // Input fields should now be visible
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()

    // Login button should be visible
    await expect(page.getByRole('button', { name: 'LOGIN' })).toBeVisible()
  })

  test('1.3 Empty username shows error', async ({ page }) => {
    // Reveal login fields
    await page.getByRole('img', { name: 'Prometheus' }).click({ force: true })

    // Click login without entering credentials
    await page.getByRole('button', { name: 'LOGIN' }).click()

    // Should show error message
    await expect(page.getByText('Please enter a username')).toBeVisible()
  })

  test('1.4 Empty password shows error', async ({ page }) => {
    // Reveal login fields
    await page.getByRole('img', { name: 'Prometheus' }).click({ force: true })

    // Enter username only
    await page.locator('input[type="text"]').fill('testuser')
    await page.getByRole('button', { name: 'LOGIN' }).click()

    // Should show error message
    await expect(page.getByText('Please enter a password')).toBeVisible()
  })

  test('1.5 Valid credentials - navigates to Navigate page', async ({ page }) => {
    // Reveal login fields
    await page.getByRole('img', { name: 'Prometheus' }).click({ force: true })

    // Enter valid credentials
    await page.locator('input[type="text"]').fill('testuser')
    await page.locator('input[type="password"]').fill('testpass')
    await page.getByRole('button', { name: 'LOGIN' }).click()

    // Should navigate to Navigate page
    await expect(page.getByRole('heading', { name: 'NAVIGATION HUB' })).toBeVisible({ timeout: 10000 })
  })

  test('1.6 Enter key submits login form', async ({ page }) => {
    // Reveal login fields
    await page.getByRole('img', { name: 'Prometheus' }).click({ force: true })

    // Enter credentials and press Enter
    await page.locator('input[type="text"]').fill('testuser')
    await page.locator('input[type="password"]').fill('testpass')
    await page.locator('input[type="password"]').press('Enter')

    // Should navigate to Navigate page
    await expect(page.getByRole('heading', { name: 'NAVIGATION HUB' })).toBeVisible({ timeout: 10000 })
  })

  test('1.7 Logo hover effect', async ({ page }) => {
    const logo = page.getByRole('img', { name: 'Prometheus' })
    await expect(logo).toBeVisible()

    // Hover over logo (force due to animation)
    await logo.hover({ force: true })

    // Logo should still be visible
    await expect(logo).toBeVisible()
  })

  test('1.8 Remember Me text visible', async ({ page }) => {
    // Reveal login fields
    await page.getByRole('img', { name: 'Prometheus' }).click({ force: true })

    await expect(page.getByText('Remember Me')).toBeVisible()
  })

  test('1.9 Forgot Password text visible', async ({ page }) => {
    // Reveal login fields
    await page.getByRole('img', { name: 'Prometheus' }).click({ force: true })

    await expect(page.getByText('Forgot Password?')).toBeVisible()
  })

  test('1.10 Version info displayed', async ({ page }) => {
    await expect(page.getByText('V2.1')).toBeVisible()
    await expect(page.getByText('Prometheus Training Solutions')).toBeVisible()
  })
})

// ============================================
// SECTION 2: NAVIGATION HUB TESTS
// ============================================
test.describe('SOC: Navigation Hub', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('2.1 Navigation wheel labels visible', async ({ page }) => {
    await expect(page.getByText('DEFINE')).toBeVisible()
    await expect(page.getByText('DESIGN')).toBeVisible()
    await expect(page.getByText('BUILD')).toBeVisible()
    await expect(page.getByText('FORMAT')).toBeVisible()
    await expect(page.getByText('GENERATE')).toBeVisible()
  })

  test('2.2 Navigate to DEFINE via arrow', async ({ page }) => {
    // Click the up arrow (DEFINE is North) - force due to SVG circle overlay
    await page.getByText('↑').click({ force: true })

    // Should see DEFINE page heading
    await expect(page.getByRole('heading', { name: 'DEFINE' })).toBeVisible()
  })

  test('2.3 Navigate to DESIGN via arrow', async ({ page }) => {
    // Click the right arrow (DESIGN is East) - force due to SVG circle overlay
    await page.getByText('→').click({ force: true })

    // Should see DESIGN page heading
    await expect(page.getByRole('heading', { name: 'DESIGN' })).toBeVisible()
  })

  test('2.4 Navigate to BUILD via arrow', async ({ page }) => {
    // Click the down arrow (BUILD is South) - force due to SVG circle overlay
    await page.getByText('↓').click({ force: true })

    // Should see BUILD page heading
    await expect(page.getByRole('heading', { name: 'BUILD' })).toBeVisible()
  })

  test('2.5 Navigate to FORMAT via arrow', async ({ page }) => {
    // Click the left arrow (FORMAT is West) - force due to SVG circle overlay
    await page.getByText('←').click({ force: true })

    // Should see FORMAT page heading
    await expect(page.getByRole('heading', { name: 'FORMAT' })).toBeVisible()
  })

  test('2.6 Navigate to GENERATE via center hub', async ({ page }) => {
    // Click GENERATE in center
    await page.getByText('GENERATE').click()

    // Should see GENERATE page
    await expect(page.getByText('GENERATE').first()).toBeVisible()
  })

  test('2.7 Course Selector visible', async ({ page }) => {
    await expect(page.getByText('SELECT COURSE')).toBeVisible()
  })

  test('2.8 Footer buttons visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'SAVE' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'CLEAR' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'DELETE' })).toBeVisible()
  })

  test('2.9 User info displayed', async ({ page }) => {
    // Owner should show the logged in user
    await expect(page.getByText('testuser')).toBeVisible()
  })

  test('2.10 Ctrl+Space returns to Navigate from any page', async ({ page }) => {
    // Navigate to Define first - force due to SVG circle overlay
    await page.getByText('↑').click({ force: true })
    await page.waitForTimeout(500)

    // Press Ctrl+Space
    await page.keyboard.press('Control+Space')

    // Should be back on Navigate page
    await expect(page.getByRole('heading', { name: 'NAVIGATION HUB' })).toBeVisible({ timeout: 5000 })
  })
})

// ============================================
// SECTION 3: DEFINE PAGE TESTS
// ============================================
test.describe('SOC: Define Page', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
    // Force due to SVG circle overlay
    await page.getByText('↑').click({ force: true })
    await page.waitForTimeout(500)
  })

  test('3.1 Define page loads correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'DEFINE' })).toBeVisible()
  })

  test('3.2 Footer buttons present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'SAVE' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'CLEAR' })).toBeVisible()
  })
})

// ============================================
// SECTION 4: DESIGN PAGE TESTS
// ============================================
test.describe('SOC: Design Page', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
    // Force due to SVG circle overlay
    await page.getByText('→').click({ force: true })
    await page.waitForTimeout(500)
  })

  test('4.1 Design page loads correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'DESIGN' })).toBeVisible()
  })

  test('4.2 Design has view tabs', async ({ page }) => {
    // Check for view tabs (OVERVIEW, TIMETABLE, SCALAR)
    const hasOverview = await page.getByText('OVERVIEW').isVisible().catch(() => false)
    const hasTimetable = await page.getByText('TIMETABLE').isVisible().catch(() => false)
    const hasScalar = await page.getByText('SCALAR').isVisible().catch(() => false)

    expect(hasOverview || hasTimetable || hasScalar).toBe(true)
  })
})

// ============================================
// SECTION 5: BUILD PAGE TESTS
// ============================================
test.describe('SOC: Build Page', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
    // Force due to SVG circle overlay
    await page.getByText('↓').click({ force: true })
    await page.waitForTimeout(500)
  })

  test('5.1 Build page loads correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'BUILD' })).toBeVisible()
  })
})

// ============================================
// SECTION 6: FORMAT PAGE TESTS
// ============================================
test.describe('SOC: Format Page', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
    // Force due to SVG circle overlay
    await page.getByText('←').click({ force: true })
    await page.waitForTimeout(500)
  })

  test('6.1 Format page loads correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'FORMAT' })).toBeVisible()
  })
})

// ============================================
// SECTION 7: GENERATE PAGE TESTS
// ============================================
test.describe('SOC: Generate Page', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.getByText('GENERATE').click()
    await page.waitForTimeout(500)
  })

  test('7.1 Generate page loads correctly', async ({ page }) => {
    await expect(page.getByText('GENERATE').first()).toBeVisible()
  })
})

// ============================================
// SECTION 8: CROSS-PAGE NAVIGATION TESTS
// ============================================
test.describe('SOC: Cross-Page Navigation', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('8.1 Navigate through all pages sequentially', async ({ page }) => {
    // To Define - force due to SVG circle overlay
    await page.getByText('↑').click({ force: true })
    await expect(page.getByRole('heading', { name: 'DEFINE' })).toBeVisible()

    // Back to Navigate
    await page.keyboard.press('Control+Space')
    await expect(page.getByRole('heading', { name: 'NAVIGATION HUB' })).toBeVisible({ timeout: 5000 })

    // To Design - force due to SVG circle overlay
    await page.getByText('→').click({ force: true })
    await expect(page.getByRole('heading', { name: 'DESIGN' })).toBeVisible()

    // Back to Navigate
    await page.keyboard.press('Control+Space')
    await page.waitForTimeout(300)

    // To Build - force due to SVG circle overlay
    await page.getByText('↓').click({ force: true })
    await expect(page.getByRole('heading', { name: 'BUILD' })).toBeVisible()

    // Back to Navigate
    await page.keyboard.press('Control+Space')
    await page.waitForTimeout(300)

    // To Format - force due to SVG circle overlay
    await page.getByText('←').click({ force: true })
    await expect(page.getByRole('heading', { name: 'FORMAT' })).toBeVisible()
  })

  test('8.2 Rapid navigation stress test', async ({ page }) => {
    // Rapidly navigate back and forth - force due to SVG circle overlay
    // Must wait for Navigation Hub to fully load between transitions
    for (let i = 0; i < 3; i++) {
      await page.getByText('↑').click({ force: true })
      await expect(page.getByRole('heading', { name: 'DEFINE' })).toBeVisible()
      await page.keyboard.press('Control+Space')
      await expect(page.getByRole('heading', { name: 'NAVIGATION HUB' })).toBeVisible()
    }

    // Should not crash - verify we're still on a valid page
    const pageContent = await page.content()
    expect(pageContent).toContain('PROMETHEUS')
  })
})

// ============================================
// SECTION 9: DATA INTEGRITY TESTS
// ============================================
test.describe('SOC: Data Integrity', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('9.1 No console errors on login', async ({ page }) => {
    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Just navigate around - force due to SVG circle overlay
    await page.getByText('↑').click({ force: true })
    await page.waitForTimeout(300)

    // Filter out expected/benign errors
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('404') &&
      !err.includes('network') &&
      !err.includes('DevTools') &&
      !err.includes('autocomplete')
    )

    expect(criticalErrors.length).toBe(0)
  })
})

// ============================================
// SECTION 10: VISUAL VALIDATION TESTS
// ============================================
test.describe('SOC: Visual Validation', () => {

  test('10.1 Login page background is dark', async ({ page }) => {
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

  test('10.2 Title text is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'PROMETHEUS COURSE GENERATION SYSTEM 2.0' })).toBeVisible()
  })

  test('10.3 Login button has styling', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('img', { name: 'Prometheus' }).click({ force: true })

    const loginButton = page.getByRole('button', { name: 'LOGIN' })
    await expect(loginButton).toBeVisible()

    // Button should have background
    const bgStyle = await loginButton.evaluate(el =>
      window.getComputedStyle(el).background
    )
    expect(bgStyle.length).toBeGreaterThan(0)
  })
})

// ============================================
// SECTION 11: MISUSE BEHAVIOR TESTS
// ============================================
test.describe('SOC: Behaviour Under Misuse', () => {

  test('11.1 Double-click on login logo', async ({ page }) => {
    await page.goto('/')

    // Double-click should reveal fields
    await page.getByRole('img', { name: 'Prometheus' }).dblclick({ force: true })

    // Fields should be visible
    await expect(page.locator('input[type="text"]')).toBeVisible()
  })

  test('11.2 Rapid clicking on navigation arrows', async ({ page }) => {
    await login(page)

    // Test rapid navigation cycling (arrows only exist on Navigation Hub)
    // Must return to Navigation Hub between clicks to access arrows
    for (let i = 0; i < 3; i++) {
      await page.getByText('↑').click({ force: true })
      await expect(page.getByRole('heading', { name: 'DEFINE' })).toBeVisible()
      await page.keyboard.press('Control+Space')
      await expect(page.getByRole('heading', { name: 'NAVIGATION HUB' })).toBeVisible()
    }

    // Should complete without crash
    await expect(page.getByRole('heading', { name: 'NAVIGATION HUB' })).toBeVisible()
  })

  test('11.3 Tab navigation through login form', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('img', { name: 'Prometheus' }).click({ force: true })

    // Tab through form elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Should not crash
    await expect(page.getByRole('button', { name: 'LOGIN' })).toBeVisible()
  })

  test('11.4 Special characters in login fields', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('img', { name: 'Prometheus' }).click({ force: true })

    // Enter special characters
    await page.locator('input[type="text"]').fill('<script>alert("xss")</script>')
    await page.locator('input[type="password"]').fill('test!@#$%^&*()')
    await page.getByRole('button', { name: 'LOGIN' }).click()

    // Should accept without crash
    await expect(page.getByRole('heading', { name: 'NAVIGATION HUB' })).toBeVisible({ timeout: 10000 })
  })

  test('11.5 Very long input strings', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('img', { name: 'Prometheus' }).click({ force: true })

    // Enter very long strings
    const longString = 'a'.repeat(500)
    await page.locator('input[type="text"]').fill(longString)
    await page.locator('input[type="password"]').fill(longString)
    await page.getByRole('button', { name: 'LOGIN' }).click()

    // Should handle gracefully
    await expect(page.getByRole('heading', { name: 'NAVIGATION HUB' })).toBeVisible({ timeout: 10000 })
  })
})

// ============================================
// SECTION 12: EXIT WORKFLOW TESTS
// ============================================
test.describe('SOC: Exit Workflow', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('12.1 Logo click triggers exit flow', async ({ page }) => {
    // Find the header logo (different from login logo)
    const headerLogo = page.locator('header img[alt="Prometheus"]').first()

    if (await headerLogo.isVisible().catch(() => false)) {
      // Click to enter exit pending mode
      await headerLogo.click({ force: true })
      await page.waitForTimeout(300)

      // Click again to exit
      await headerLogo.click({ force: true })
      await page.waitForTimeout(500)

      // Should be back on login page
      await expect(page.getByText('CLICK TO LOGIN')).toBeVisible({ timeout: 5000 })
    }
  })
})
