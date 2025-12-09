# SARAH BRIEF: Debug Grid System & Layout Fixes

**Date:** 2025-12-08  
**Author:** Claude Code (CC)  
**Type:** Infrastructure + UI Layout  
**Status:** Complete  

---

## A. Grid System Implementation Summary

### Purpose
The Debug Grid System provides a visual coordinate overlay to enable precise UI positioning. It transforms subjective "looks about right" positioning into objective coordinate-based placement.

### Components Created

| File | Purpose |
|------|---------|
| `prometheus-ui/src/components/DebugGrid.jsx` | Visual grid overlay component |
| `prometheus-ui/src/constants/layout.js` | Centralized layout constants |

### How to Use the Grid

**Toggle:** Press `Ctrl+G` to show/hide the grid overlay

**What You'll See:**
- **Cyan centerline** at exactly 50% of viewport width (labeled "0")
- **Vertical gridlines** every 95px (≈25mm) from center
  - Left of center: -95, -190, -285, -380...
  - Right of center: +95, +190, +285, +380...
- **Horizontal gridlines** every 95px from top (Y:95, Y:190, Y:285...)
- **"GRID: ON"** indicator in top-right corner
- **Reference info** in bottom-left corner

**Grid Does NOT:**
- Interfere with mouse clicks (pointer-events: none)
- Render in production builds
- Affect any existing functionality

### Using Grid for Future Positioning

**Before:**
```
"Move the element 25mm left of center"
→ Calculate → Apply margin → Hope it's right → Iterate
```

**After:**
```
"Right edge should be on the -95px line"
→ Set: right: calc(50% + 95px)
→ Toggle grid → Verify visually → Done
```

---

## B. Layout Constants File

All positioning values are now centralized in `prometheus-ui/src/constants/layout.js`:

```javascript
export const LAYOUT = {
  // Grid reference
  GRID_SPACING: 95,              // 25mm in pixels
  
  // Horizontal offsets from centerline
  LEFT_FORM_RIGHT_EDGE: -95,     // Right edge of left-side inputs
  RIGHT_FORM_LEFT_EDGE: 95,      // Left edge of Description
  
  // Input dimensions
  INPUT_WIDTH: 477,
  INPUT_HEIGHT: 39,
  DURATION_WIDTH: 135,
  
  // PKE Interface (100% increase)
  PKE_WIDTH: 908,
  PKE_HEIGHT: 76,
  PKE_BORDER_RADIUS: 38,
  
  // Navigation
  NAV_LEFT_OFFSET: -15,
  
  // Status bar
  STATUS_BAR_CONTENT_OFFSET: -15,
}
```

**Benefits:**
- Single source of truth for measurements
- Easy to adjust globally
- Self-documenting code
- Grid-aligned values

---

## C. Layout Fixes Made

### Before/After Positions

| Element | Before | After | Grid Reference |
|---------|--------|-------|----------------|
| **Left form inputs** | Relative margins | Right edge at calc(50% + 95px) | Right edge on -95px line |
| **Description textarea** | Relative margins | Left edge at calc(50% + 95px) | Left edge on +95px line |
| **Description top** | Offset from title | Top: 0 (same as Title) | Aligned horizontally |
| **Description label** | Above textarea | Below textarea | Consistent with form pattern |
| **PKE Interface** | 454×38px | 908×76px | 100% increase |
| **Status bar content** | Normal position | marginTop: -15px | 15px higher |
| **Date/time** | Center below line | Same row as status | Horizontally aligned |
| **Navigation buttons** | Normal position | marginLeft: -15px | 15px left |
| **Upper horizontal line** | mx-[2%] (margins) | w-full (full width) | Edge to edge |

### Positioning Method Change

**Previous approach:** Nested relative positioning with margins
```jsx
<div className="mt-[58px] ml-[136px]">
  <div style={{ marginRight: '94px' }}>
```

**New approach:** Absolute positioning from centerline
```jsx
<div 
  className="absolute"
  style={{ 
    right: `calc(50% - ${LEFT_FORM_RIGHT_EDGE}px)`,
    top: 0
  }}
>
```

This eliminates cumulative drift from nested margins.

---

## D. Files Modified

| File | Changes |
|------|---------|
| `prometheus-ui/src/components/DebugGrid.jsx` | **NEW** - Grid overlay |
| `prometheus-ui/src/constants/layout.js` | **NEW** - Layout constants |
| `prometheus-ui/src/App.jsx` | Grid toggle (Ctrl+G), full-width header line |
| `prometheus-ui/src/pages/Describe.jsx` | Absolute positioning from centerline, B4 label move |
| `prometheus-ui/src/components/PKEInterface.jsx` | 100% size increase (908×76) |
| `prometheus-ui/src/components/StatusBar.jsx` | Content up 15px, date/time same row |

---

## E. Recommendation: Grid Retention

**Recommendation:** KEEP the grid system for future development

**Reasons:**
1. **Design, Build, Export, Format pages** not yet implemented - will need same precise positioning
2. **Future adjustments** can be verified instantly
3. **Zero overhead** when toggled off
4. **Removable** - simply delete DebugGrid.jsx and remove import if no longer needed

**To Remove (if desired later):**
1. Delete `prometheus-ui/src/components/DebugGrid.jsx`
2. Remove DebugGrid import and state from `App.jsx`
3. Remove keyboard event listener from `App.jsx`
4. (Optional) Keep `layout.js` for constants

---

## F. Verification Instructions

### Visual Verification with Grid

1. Start dev server: `npm run dev`
2. Log in to reach Describe page
3. Press `Ctrl+G` to show grid
4. Verify:
   - [ ] Left form inputs: right edges touch -95px line
   - [ ] Description textarea: left edge touches +95px line
   - [ ] Description top edge aligned with Title top edge
   - [ ] PKE Interface visibly larger (spans roughly -450px to +450px)
   - [ ] Navigation shifted slightly left
   - [ ] Status bar content closer to bottom line

### Without Grid

1. Press `Ctrl+G` to hide grid
2. Verify UI looks clean without overlay artifacts
3. Verify all interactions still work:
   - [ ] Hover/focus orange effects on inputs
   - [ ] PKE activation/deactivation
   - [ ] Navigation between pages
   - [ ] Form input/clear/save functions

---

## G. Current Status

### Grid System
- ✅ DebugGrid component created
- ✅ Layout constants file created
- ✅ Ctrl+G toggle working
- ✅ Grid doesn't block interaction
- ✅ Coordinate labels visible

### Layout Fixes
- ✅ B1: Left form right edges at -95px
- ✅ B2: Description left edge at +95px
- ✅ B3: Description top aligned with Title
- ✅ B4: Description label below textarea
- ✅ B5: PKE Interface 100% larger (908×76)
- ✅ B6: Status bar content up 15px
- ✅ B7: Date/time horizontally aligned
- ✅ B8: Navigation left 15px
- ✅ B9: Upper line full width

### Housekeeping
- ✅ nextjs-ui placeholder removed (from previous task)

---

## H. Known Considerations

1. **Absolute positioning** means form elements don't flow naturally - this is intentional for precise placement but means the layout is more "fixed"

2. **Grid values are hardcoded to 95px** - if measurement system changes, update GRID_SPACING constant

3. **Status bar negative margin** (-15px) may need adjustment based on visual review

4. **Tailwind dynamic classes** with template literals (e.g., `h-[${LAYOUT.INPUT_HEIGHT}px]`) - verified working but these don't get Tailwind's purge optimization

---

## I. Next Steps

### Immediate
1. **Visual verification** - Toggle grid (Ctrl+G) and verify all positions
2. **Interaction testing** - Verify hover/focus/PKE still work correctly

### Short-term
1. **Implement Design page** - Use grid system for consistent positioning
2. **Apply grid-based layout** to remaining pages (Build, Export, Format)

### Long-term
1. **Consider removing grid** once all pages are finalized
2. **Keep layout.js** as single source of truth regardless

---

*End of Brief*

**Filed:** `docs/briefs/SARAH_BRIEF_grid-system_2025-12-08.md`

