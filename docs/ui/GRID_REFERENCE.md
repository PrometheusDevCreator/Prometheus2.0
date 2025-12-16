# Prometheus 2.0 — Grid Reference System

## Coordinate Space

| Axis | Range | Centreline |
|------|-------|------------|
| X | −950 → +950 | X = 0 |
| Y | 0 → 855 | N/A |

## Baseline Configuration

- Resolution: 1920 × 1080
- Browser zoom: 100%
- Grid: ON, scaled to 100%

## Measurement Rules

1. All "±" values are relative to centreline (X = 0)
2. "±285px" means span from X: −285 to X: +285 (total 570px, centred)
3. Grid coordinates are for VERIFICATION only
4. Implementation uses viewport-relative units (vw/vh/rem/clamp)

## Verification Procedure

1. Enable grid overlay (Ctrl+G or equivalent)
2. Set viewport to exactly 1920×1080
3. Take screenshot
4. Verify element positions against grid coordinates
5. If drift detected, stop and assess

## Doctrine

The grid is a reference system, not a layout mechanism. Elements are positioned using responsive CSS units; the grid validates that those units produce correct pixel positions at baseline.
