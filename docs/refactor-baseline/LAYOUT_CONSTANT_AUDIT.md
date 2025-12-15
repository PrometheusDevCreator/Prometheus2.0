# Layout Constant Audit — Phase 3

**Date:** 2025-12-16
**Auditor:** Claude Code (CC)
**Branch:** `refactor/responsive-ui`

---

## CRITICAL FINDING

**The Phase 3 objective cannot be achieved as designed.**

### Assumption vs Reality

| Aspect | Assumption | Reality |
|--------|------------|---------|
| Define.jsx uses LAYOUT constants | Yes | **NO** |
| Converting layout.js affects Define.jsx | Yes | **NO** |
| Define.jsx dimensions | From constants | **Hardcoded inline** |

### Evidence

**Define.jsx imports:**
```javascript
import { THEME, LEVEL_OPTIONS, SENIORITY_OPTIONS, DELIVERY_OPTIONS } from '../constants/theme'
```

**Define.jsx does NOT import:**
```javascript
// NOT PRESENT:
import { LAYOUT } from '../constants/layout'
```

**LAYOUT is only imported by deprecated files:**
- `src/deprecated/Design.jsx`
- `src/deprecated/Describe.jsx`

**No active pages use LAYOUT constants.**

---

## layout.js Constant Usage Analysis

| Constant | Current Value | Used In | Safe to Convert? | Impact on Define.jsx |
|----------|---------------|---------|------------------|---------------------|
| GRID_SPACING | 95 | deprecated only | N/A | NONE |
| CENTERLINE | '50%' | deprecated only | N/A | NONE |
| LEFT_FORM_RIGHT_EDGE | -95 | deprecated only | N/A | NONE |
| RIGHT_FORM_LEFT_EDGE | 95 | deprecated only | N/A | NONE |
| INPUT_WIDTH | 477 | deprecated only | N/A | NONE |
| INPUT_HEIGHT | 39 | deprecated only | N/A | NONE |
| DURATION_WIDTH | 135 | deprecated only | N/A | NONE |
| FORM_TOP_OFFSET | 58 | deprecated only | N/A | NONE |
| FORM_LEFT_OFFSET | 76 | deprecated only | N/A | NONE |
| LABEL_WIDTH | 115 | deprecated only | N/A | NONE |
| ROW_GAP | 16 | deprecated only | N/A | NONE |
| DEVELOPER_SELECT_GAP | 19 | deprecated only | N/A | NONE |
| PKE_WIDTH | 908 | PKEInterface.jsx (converted in Phase 2) | Already done | NONE |
| PKE_HEIGHT | 76 | PKEInterface.jsx (converted in Phase 2) | Already done | NONE |
| PKE_BORDER_RADIUS | 38 | PKEInterface.jsx (converted in Phase 2) | Already done | NONE |
| NAV_LEFT_OFFSET | -15 | deprecated only | N/A | NONE |
| STATUS_BAR_CONTENT_OFFSET | -15 | deprecated only | N/A | NONE |
| HEADER_HEIGHT | 90 | deprecated only | N/A | NONE |
| CONTENT_START_Y | 100 | deprecated only | N/A | NONE |
| DESCRIPTION_WIDTH | 477 | deprecated only | N/A | NONE |
| DESCRIPTION_MIN_HEIGHT | 250 | deprecated only | N/A | NONE |
| CONTENT_ZONE_TOP | 180 | deprecated only | N/A | NONE |
| CONTENT_ZONE_BOTTOM | 780 | deprecated only | N/A | NONE |
| DESIGN_* | various | deprecated only | N/A | NONE |

---

## theme.js Analysis

### Constants with pixel values:

| Constant | Value | Used In Define.jsx? | Notes |
|----------|-------|---------------------|-------|
| FONT_SIZE_BODY | '14px' | **NO** | Define uses hardcoded '14px' |
| FONT_SIZE_LABEL | '12px' | **NO** | Define uses hardcoded values |
| FONT_SIZE_BUTTON | '14px' | **NO** | Define uses hardcoded values |
| FONT_SIZE_TITLE | '18px' | **NO** | Define uses hardcoded '18px' |
| FONT_SIZE_HEADING | '24px' | **NO** | Not used in Define |
| ANIMATION.WHEEL_COLLAPSED_SIZE | 70 | **NO** | Used in NavWheel (Phase 2 converted) |
| ANIMATION.WHEEL_EXPANDED_SIZE | 280 | **NO** | Used in NavWheel (Phase 2 converted) |
| ANIMATION.WHEEL_NODE_SIZE | 40 | **NO** | Used in NavWheel |
| ANIMATION.WHEEL_RADIUS | 100 | **NO** | Used in NavWheel |
| LAYOUT_THEME.* | various | **NO** | Not imported by Define |

---

## Define.jsx Hardcoded Dimensions

The following pixel values are hardcoded directly in Define.jsx and cannot be changed without editing the file:

### Container/Layout
- `top: '730px'` (PKE button position)
- `gap: '40px'` (column gap)
- `padding: '40px 60px 120px 60px'` (main content padding)

### Typography
- `fontSize: '18px'` (column headers)
- `fontSize: '15px'` (labels)
- `fontSize: '14px'` (inputs, LO text)
- `fontSize: '13px'` (content type labels)
- `fontSize: '11px'` (Bloom's categories)
- `letterSpacing: '4.5px'` (headers)
- `letterSpacing: '3px'` (labels)
- `letterSpacing: '2px'` (inputs)

### Spacing
- `gap: '16px'` (form row gaps)
- `gap: '12px'` (LO list gap)
- `gap: '8px'` (module controls)
- `marginTop: '-5px'`, `'15px'`, `'20px'`, `'60px'`, etc.
- `marginBottom: '8px'`, `'9px'`, `'12px'`
- `paddingBottom: '8px'`

### Element Sizes
- `width: '28px'`, `height: '28px'` (PKE button)
- `width: '24px'`, `height: '24px'` (content type thumb)
- `width: '54px'`, `height: '24px'` (toggles)
- `width: '18px'`, `height: '18px'` (toggle knob)
- `minHeight: '200px'` (description textarea)
- `minWidth: '24px'` (module number)
- `width: '320px'` (sliders)
- `borderRadius: '20px'`, `'16px'`, `'12px'`

---

## Impact Assessment

### What converting layout.js would achieve:
- **Nothing for Define.jsx** - it doesn't use these constants
- Deprecated files would work differently (but they're deprecated)
- PKE constants already converted in Phase 2

### What is actually needed to make Define.jsx responsive:
1. **Edit Define.jsx directly** (forbidden in Phase 3)
2. Or refactor Define.jsx to use layout constants (also requires editing)

---

## Recommendations

### Option A: Acknowledge Phase 3 Cannot Proceed As Designed

The architectural assumption that Define.jsx uses LAYOUT constants is incorrect. Phase 3 cannot achieve its objective without violating the "Do NOT modify Define.jsx" constraint.

**Recommendation:** Document finding, close Phase 3 as "Blocked - Architectural Mismatch", and create a separate Phase 3B task to refactor Define.jsx to use constants (which would require lifting the edit restriction).

### Option B: Proceed with Partial Conversion

Convert layout.js and theme.js constants anyway for:
1. Future code that might use them
2. Any components that DO use them
3. Consistency with Phase 2 work

**Impact:** Zero improvement to Define.jsx responsiveness, but cleaner codebase for future work.

### Option C: Request Permission to Edit Define.jsx

Escalate to Controller/Founder for permission to:
1. Refactor Define.jsx to use LAYOUT constants
2. Then convert those constants to viewport units

**This is the only way to achieve the Phase 3 objective.**

---

## Verification Commands Used

```bash
# Check layout.js imports across active codebase
grep -rn "from.*layout\|import.*layout" src/ --include="*.jsx" --include="*.js"

# Check LAYOUT usage in pages
grep -rn "LAYOUT\." src/pages/

# Check THEME usage in Define.jsx
grep -rn "THEME\." src/pages/Define.jsx
```

---

*Audit completed by Claude Code (CC) — 2025-12-16*
