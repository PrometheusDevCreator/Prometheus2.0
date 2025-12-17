# PLAYWRIGHT CONFIGURATION STANDARD
## Prometheus 2.0 - Viewport Settings

**Document ID:** CONFIG-PLAYWRIGHT-001
**Version:** 1.2
**Status:** AUTHORITATIVE
**Last Updated:** 2025-12-17

---

## 1. Baseline Definitions

| Term | Value | Description |
|------|-------|-------------|
| **Display Resolution** | 1920 × 1080 | Founder's physical monitor setting |
| **Windows Scale** | 100% | No DPI scaling applied |
| **Browser Zoom** | 100% | No zoom applied |
| **Usable Viewport** | 1890 × 940 | Actual rendering area after browser chrome |
| **Implementation Baseline** | 1890 × 940 | CC uses this for all coordinate work |

---

## 2. Understanding the Viewport

When the Founder views the application in Chrome (maximised, not fullscreen):
- Browser chrome (tabs, address bar, bookmarks bar) consumes ~140px vertically
- The remaining **usable viewport** is approximately 1890 × 940

The UI uses viewport-relative units (vw, vh) which scale proportionally. This means:
- Elements maintain correct proportional positions across different viewport sizes
- The UI works correctly on different monitors, zoom levels, and resolutions
- CC and Founder see the same visual result despite different viewport dimensions

---

## 3. Playwright Configuration

### 3.1 Standard Viewport Setting

For all Playwright operations, use the usable viewport dimensions:

```javascript
await page.setViewportSize({ width: 1890, height: 940 });
```

Or via MCP:

```xml
<invoke name="mcp__playwright__browser_resize">
  <parameter name="width">1890</parameter>
  <parameter name="height">940</parameter>
</invoke>
```

### 3.2 Verification

Before screenshots or coordinate measurements:

```javascript
const viewport = page.viewportSize();
if (viewport.width !== 1890 || viewport.height !== 940) {
  console.warn(`Viewport: ${viewport.width}×${viewport.height} (expected 1890×940)`);
}
```

### 3.3 Post-Screenshot Reporting

After every screenshot, report:

```
SCREENSHOT CAPTURED
-------------------
Viewport: 1890 × 940
Baseline Match: YES
File: [filename]
```

---

## 4. Coordinate System

### 4.1 Grid Origin

The origin (0, 0) is at the **centre of the usable viewport**:
- Centre X: 945px from left edge
- Centre Y: 470px from top edge

### 4.2 Axis Directions

| Axis | Positive Direction | Range |
|------|-------------------|-------|
| X | Right (+) | -945 to +945 |
| Y | Up (+) | -470 to +470 |

### 4.3 Conversion Factors (1890×940 Baseline)

| Conversion | Formula | Example |
|------------|---------|---------|
| px → vw | px ÷ 18.9 | 189px = 10vw |
| px → vh | px ÷ 9.4 | 94px = 10vh |
| vw → px | vw × 18.9 | 10vw = 189px |
| vh → px | vh × 9.4 | 10vh = 94px |

### 4.4 Grid Position to CSS Conversion

For element at Grid position (X, Y):

**Positioning from left:**
```
left = ((945 + X) / 1890) × 100 vw
```

**Positioning from bottom:**
```
bottom = ((470 + Y) / 940) × 100 vh
```

**Example: Collapsed NavWheel at X: -875, Y: -375**
```
left   = ((945 - 875) / 1890) × 100 = 3.70vw
bottom = ((470 - 375) / 940) × 100 = 10.11vh
```

---

## 5. Session Protocol

The viewport setting is per-session. CC must:

1. Set viewport to 1890×940 at start of each Playwright session
2. Verify viewport before any coordinate-sensitive work
3. Re-apply after browser context recreation
4. Report viewport dimensions with every screenshot

---

## 6. Consistency Requirement

The critical requirement is **consistency**, not a specific number. All coordinate work must use the same baseline:

- CC screenshots: 1890×940
- Coordinate calculations: 1890×940
- Grid system reference: 1890×940

This ensures measurements are comparable across sessions.

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-17 | Founder/Claude Opus | Initial creation (1920×1080) |
| 1.1 | 2025-12-17 | Founder/Claude Opus | Clarified virtual viewport |
| 1.2 | 2025-12-17 | Founder/Claude Opus | Revised to 1890×940 usable viewport baseline |
