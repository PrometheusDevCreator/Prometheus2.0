# PIXEL_MAP.md - Current Dimension Reference

**Generated:** 2025-12-15
**Purpose:** Baseline reference for UI architecture refactor
**Source Files:** App.jsx, Header.jsx, Footer.jsx, NavWheel.jsx, PKEInterface.jsx, layout.js, theme.js

---

## 1. STAGE CONTAINER (App.jsx)

| Property | Value | Notes |
|----------|-------|-------|
| BASE_W | 1920px | Fixed stage width |
| BASE_H | 1080px | Fixed stage height |
| Scale Formula | `Math.min(vw/1920, vh/1080)` | Maintains aspect ratio |
| Transform Origin | center center | Scale from center |
| Outer Container | 100vw × 100vh | Full viewport wrapper |

**Current Implementation:**
```javascript
const BASE_W = 1920
const BASE_H = 1080
const newScale = Math.min(vw / BASE_W, vh / BASE_H)
// Stage: width: 1920px, height: 1080px, transform: scale(${scale})
```

---

## 2. HEADER (Header.jsx)

| Element | Property | Value |
|---------|----------|-------|
| Container | height | 120px |
| Logo | position | absolute, top: 10px, left: 20px |
| Logo | height | 66px |
| Title | position | absolute, top: 30px, left: 50%, transform: translateX(-50%) |
| Section Name | position | absolute, top: 60px |
| Info Cluster | position | absolute, top: 15px, right: 20px |
| Gradient Line 1 | position | absolute, top: 85px |
| Gradient Line 1 | height | 1px |
| Section Label Line | position | absolute, top: 102px |

---

## 3. FOOTER (Footer.jsx)

| Element | Property | Value |
|---------|----------|-------|
| Controls Area | height | 120px |
| NavWheel Container | position | absolute, bottom: 0px |
| Analytics Button | position | absolute, bottom: 5px |
| Analytics Button | height | 45px (analyticsSize) |
| PKE Interface | position | absolute, left: 50%, transform: translateX(-50%) |
| PKE Interface | bottom | 15px |
| Bottom Line | height | 1px |
| Status Bar | position | relative |
| Progress Bar | height | 8px |

---

## 4. NAVWHEEL (NavWheel.jsx + theme.js)

| State | Property | Value |
|-------|----------|-------|
| Collapsed | size | 70px (WHEEL_COLLAPSED_SIZE) |
| Collapsed | centerSize | 54px |
| Collapsed | position | absolute, bottom: 30px, left: 30px |
| Expanded | size | 280px (WHEEL_EXPANDED_SIZE) |
| Expanded | centerSize | 70px |
| Expanded | position | fixed, bottom: 50%, left: 50%, transform: translate(-50%, 50%) |
| Node | size | 40px (WHEEL_NODE_SIZE) |
| Logo (collapsed) | size | 38px × 38px |
| Logo (expanded) | size | 50px × 50px |

---

## 5. PKE INTERFACE (PKEInterface.jsx + layout.js)

| Property | Value | Notes |
|----------|-------|-------|
| Width | 908px | PKE_WIDTH (454px × 2) |
| Height | 76px | PKE_HEIGHT (38px × 2) |
| Border Radius | 38px | Half of height for lozenge shape |
| Position | centered horizontally | left: 50%, transform: translateX(-50%) |

---

## 6. LAYOUT CONSTANTS (layout.js)

### Grid System
| Constant | Value | Notes |
|----------|-------|-------|
| GRID_SPACING | 95px | 25mm at 96 DPI |
| CENTERLINE | 50% | Horizontal center reference |

### Form Elements
| Constant | Value |
|----------|-------|
| INPUT_WIDTH | 477px |
| INPUT_HEIGHT | 39px |
| DURATION_WIDTH | 135px |
| FORM_TOP_OFFSET | 58px |
| FORM_LEFT_OFFSET | 76px |
| LABEL_WIDTH | 115px |
| ROW_GAP | 16px |

### Vertical References
| Constant | Value |
|----------|-------|
| HEADER_HEIGHT | 90px |
| CONTENT_START_Y | 100px |

### Description Textarea
| Constant | Value |
|----------|-------|
| DESCRIPTION_WIDTH | 477px |
| DESCRIPTION_MIN_HEIGHT | 250px |

### Design Page
| Constant | Value |
|----------|-------|
| CONTENT_ZONE_TOP | 180px |
| CONTENT_ZONE_BOTTOM | 780px |
| DESIGN_COLUMN_WIDTH | 242px |
| DESIGN_COLUMN_HEIGHT | 29px |
| DESIGN_COLUMN_GAP | 19px |
| DESIGN_CONTENT_HEIGHT | 346px |

---

## 7. CRITICAL DOCTRINAL ANCHORS

These elements must maintain exact visual positioning during refactor:

| Anchor | Current Position | Reference |
|--------|-----------------|-----------|
| Top Frame (Header) | height: 120px, gradient line at Y:85px | UI_DOCTRINE.md |
| Bottom Navigation Band | Controls area: 120px height | UI_DOCTRINE.md |
| PKE Interface | Centered, 908×76px lozenge | Footer.jsx |
| NavWheel Center | Collapsed: 70px at bottom-left; Expanded: 280px at screen center | NavWheel.jsx |
| Content Zone | Y: 180px to 780px (600px usable) | layout.js |

---

## 8. CONVERSION REFERENCE

For viewport-relative conversion at 1920×1080 base:

| Pixels | vw | vh | Notes |
|--------|----|----|-------|
| 19.2px | 1vw | - | 1% of 1920 |
| 10.8px | - | 1vh | 1% of 1080 |
| 95px | 4.948vw | 8.796vh | Grid spacing |
| 120px | 6.25vw | 11.11vh | Header height |
| 477px | 24.84vw | - | Input width |
| 908px | 47.29vw | - | PKE width |
| 280px | 14.58vw | 25.93vh | NavWheel expanded |

---

## 9. FILES TO MODIFY IN REFACTOR

| File | Contains | Priority |
|------|----------|----------|
| App.jsx | Stage container, scale logic | HIGH |
| constants/layout.js | All dimension constants | HIGH |
| constants/theme.js | NavWheel sizes | MEDIUM |
| Header.jsx | Header dimensions | MEDIUM |
| Footer.jsx | Footer dimensions | MEDIUM |
| NavWheel.jsx | Wheel dimensions | MEDIUM |
| PKEInterface.jsx | Lozenge dimensions | MEDIUM |

---

*Document generated for Phase 0 baseline*
