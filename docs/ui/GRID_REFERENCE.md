# Prometheus 2.0 — Grid Reference System

**Version:** 1.1
**Last Updated:** 2025-12-21
**Aligned With:** UI_DOCTRINE.md v2.1, PLAYWRIGHT_CONFIG.md v1.2

---

## Coordinate Space

| Axis | Range | Origin |
|------|-------|--------|
| X | −945 → +945 | Centre (0) |
| Y | −470 → +470 | Centre (0) |

**Total Usable Area:** 1890 × 940 pixels

---

## Baseline Configuration

| Parameter | Value | Notes |
|-----------|-------|-------|
| Display Resolution | 1920 × 1080 | Founder's physical monitor |
| Windows Scale | 100% | No DPI scaling |
| Browser Zoom | 100% | No zoom applied |
| **Usable Viewport** | **1890 × 940** | After browser chrome |
| Grid Origin | (945, 470) | Centre of usable viewport |

---

## Coordinate Convention

- **X-axis:** Negative left, positive right (range: −945 to +945)
- **Y-axis:** Positive up, negative down (range: −470 to +470)
- **1 Grid Unit = 1 Pixel** at Implementation Baseline

---

## Unit Conversion (1890×940 Baseline)

| Conversion | Formula | Example |
|------------|---------|---------|
| px → vw | px ÷ 18.9 | 189px = 10vw |
| px → vh | px ÷ 9.4 | 94px = 10vh |
| vw → px | vw × 18.9 | 10vw = 189px |
| vh → px | vh × 9.4 | 10vh = 94px |

---

## Grid Position to CSS Conversion

For element at Grid position (X, Y):

```
left:   ((945 + X) / 1890) × 100 vw
bottom: ((470 + Y) / 940) × 100 vh
```

**Example: Element at X: −875, Y: −375**
```
left   = ((945 − 875) / 1890) × 100 = 3.70vw
bottom = ((470 − 375) / 940) × 100 = 10.11vh
```

---

## Measurement Rules

1. All "±" values are relative to centreline (X = 0, Y = 0)
2. Grid coordinates are for **VERIFICATION only**
3. Implementation uses viewport-relative units (vw/vh)
4. Playwright screenshots must use 1890×940 viewport

---

## Verification Procedure

1. Enable grid overlay (Ctrl+G or DevTools)
2. Set Playwright viewport to exactly 1890×940
3. Take screenshot
4. Verify element positions against grid coordinates
5. If drift detected, stop and assess

---

## Doctrine

The grid is a **reference system**, not a layout mechanism. Elements are positioned using responsive CSS units (vw/vh); the grid validates that those units produce correct pixel positions at the Implementation Baseline.

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-15 | Initial creation (1920×1080) |
| 1.1 | 2025-12-21 | Aligned to 1890×940 Implementation Baseline |
