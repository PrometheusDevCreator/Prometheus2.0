# PROMETHEUS TESTING FRAMEWORK

## Quick Reference

| Test Level | Command | When |
|------------|---------|------|
| Minor Tests (MT) | `npm run test:mt` | During development |
| Implementation Tests (IT) | `npm run test:it` | After task/phase completion |
| System Operator Check (SOC) | `npm run test:soc` | By Founder order |
| Full SOC | `npm run test:soc:full` | Before releases/demos |

---

## Installation

```bash
cd prometheus-ui
npm install
```

Dependencies are already included:
- **Vitest** - Unit/component testing
- **Playwright** - E2E browser testing
- **Testing Library** - React component testing

---

## Test Commands

### Development Testing (MT Level)
```bash
# Run all unit tests
npm run test

# Run with UI
npm run test:ui

# Run once (no watch)
npm run test:run

# Run with coverage report
npm run test:coverage
```

### E2E Testing
```bash
# Run E2E tests
npm run test:e2e

# Run with browser visible
npm run test:e2e:headed

# Run with Playwright UI
npm run test:e2e:ui
```

### Doctrine-Level Testing
```bash
# Minor Tests (MT)
npm run test:mt

# Implementation Tests (IT)
npm run test:it

# System Operator Check (SOC)
npm run test:soc

# Full SOC (exhaustive)
npm run test:soc:full

# All tests
npm run test:all
```

---

## Automated Triggers

### File Change Threshold
The system tracks file changes. After **10 changes**, IT is recommended:

```bash
# Check current threshold status
node scripts/test-triggers.js --status

# Manually record a file change
node scripts/test-triggers.js --record-change

# Check if IT is needed
node scripts/test-triggers.js --check-threshold
```

### Pre-Commit Hook
To automatically run MT before each commit:

```bash
# Install the pre-commit hook
cp scripts/pre-commit-hook.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

This will:
1. Run Minor Tests before allowing commit
2. Block commit if tests fail
3. Track commit count for IT threshold

---

## Test Structure

### Directory Layout
```
prometheus-ui/
├── src/
│   └── test/
│       ├── setup.js                    # Test setup/mocks
│       └── data-relationships.test.js  # Unit tests
├── e2e/
│   ├── soc-full.spec.js               # Full SOC E2E tests
│   └── visual-validation.spec.js      # Visual tests
├── scripts/
│   ├── run-soc.js                     # SOC runner
│   ├── test-triggers.js               # Trigger system
│   └── pre-commit-hook.sh             # Git hook
├── test-results/                       # Generated reports
├── vitest.config.js                   # Vitest config
└── playwright.config.js               # Playwright config
```

### Test Categories

#### 1. Unit Tests (Vitest)
Location: `src/**/*.test.js`

Tests:
- Data structure validation
- State management logic
- Data relationships
- Utility functions

#### 2. E2E Tests (Playwright)
Location: `e2e/*.spec.js`

Tests:
- Login flow
- Navigation
- Page interactions
- Cross-page behavior
- Visual validation
- Misuse scenarios

---

## SOC Coverage

Per the Testing Doctrine, a full SOC covers:

### UI & Interaction
- [x] Login page flow
- [x] Navigation wheel interactions
- [x] Button clicks
- [x] Input field behavior
- [x] Hover effects
- [x] Keyboard shortcuts

### State & Logic
- [x] Cross-page navigation
- [x] Exit workflow
- [x] Data persistence
- [x] State reset (CLEAR)

### Data Integrity
- [x] Course data structure
- [x] Timetable data structure
- [x] Lesson relationships
- [x] Learning objective links

### Visual Validation
- [x] Color scheme
- [x] Typography
- [x] Layout/centering
- [x] Interactive element styling

### Behaviour Under Misuse
- [x] Rapid clicking
- [x] Double-clicks
- [x] Special characters
- [x] Long input strings
- [x] Tab navigation

---

## Reports

### SOC Reports
Generated in `test-results/`:

```
test-results/
├── soc-report-latest.json    # Latest SOC results (JSON)
├── soc-report-latest.txt     # Latest SOC report (text)
├── soc-report-{timestamp}.json
├── soc-report-{timestamp}.txt
├── playwright-report/        # Playwright HTML report
└── vitest-results.json       # Vitest results
```

### Viewing Reports
```bash
# View Playwright HTML report
npx playwright show-report test-results/playwright-report

# View latest SOC report
cat test-results/soc-report-latest.txt
```

---

## Configuration

### Viewport Baseline
Per `PLAYWRIGHT_CONFIG.md`: **1890 x 940 pixels**

This is enforced in `playwright.config.js`:
```javascript
use: {
  viewport: { width: 1890, height: 940 }
}
```

### Test Timeouts
- Vitest default: 5000ms
- Playwright default: 30000ms
- SOC total timeout: 600000ms (10 min)

---

## Trigger System

### Thresholds
| Metric | Threshold | Action |
|--------|-----------|--------|
| File changes | 10 | Recommend IT |
| Commits | 5 | Recommend IT |

### Manual Commands
```bash
# View current state
node scripts/test-triggers.js --status

# Reset counters
node scripts/test-triggers.js --reset

# Run specific test level
node scripts/test-triggers.js --run-mt
node scripts/test-triggers.js --run-it
node scripts/test-triggers.js --run-soc
node scripts/test-triggers.js --run-soc-full
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Prometheus Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd prometheus-ui
          npm ci

      - name: Install Playwright browsers
        run: |
          cd prometheus-ui
          npx playwright install --with-deps chromium

      - name: Run MT (Minor Tests)
        run: |
          cd prometheus-ui
          npm run test:mt

      - name: Run E2E Tests
        run: |
          cd prometheus-ui
          npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: prometheus-ui/test-results/
```

---

## Compliance

Per **Prometheus Testing Doctrine**:

> Testing is not optional.
> Testing scales with system maturity.
> Failure to adhere to this doctrine is a defect.

All contributors must:
1. Understand this framework
2. Run appropriate tests before commits
3. Address failing tests before merging

---

## Troubleshooting

### Common Issues

**Tests won't run:**
```bash
# Ensure dependencies installed
npm install

# Install Playwright browsers
npx playwright install chromium
```

**E2E tests fail to start:**
```bash
# Ensure dev server is running or let Playwright start it
npm run dev
```

**Timeout errors:**
```bash
# Increase timeout in playwright.config.js
# Or run with more time:
npx playwright test --timeout=60000
```

**Visual tests fail:**
```bash
# Ensure viewport is correct (1890x940)
# Check PLAYWRIGHT_CONFIG.md for baseline
```

---

*Last Updated: 7 January 2026*
*Framework Version: 1.0*
*Per Prometheus Testing Doctrine v1.0*
