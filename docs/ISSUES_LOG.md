# Prometheus 2.0 - Issues Log

**Purpose:** Track visual/functional issues discovered during UI development for traceability.

---

## Issue #001: Mouse Coordinates Off-Screen
**Date Reported:** 2025-12-10
**Status:** RESOLVED

### Problem
Mouse coordinate display in DebugGrid rendered at bottom of viewport where browser chrome consumes ~60-80px, making it invisible.

### Root Cause
Original position used `bottom-2` (bottom: 0.5rem) which placed the element at the edge of the viewport, but browser UI elements obscure this area.

### Solution
Repositioned to:
- Horizontal: Centerline (`left: 50%`, `transform: translateX(-50%)`)
- Vertical: Y=40px from top (`top: 40px`)

### Files Modified
- `prometheus-ui/src/components/DebugGrid.jsx` (lines 191-210)

---

## Issue #002: Thick/Bevelled Borders on Input Fields
**Date Reported:** 2025-12-10
**Status:** RESOLVED

### Problem
Despite GradientBorder using 1px padding for border effect, input fields appeared to have thick, bevelled borders.

### Root Cause
1. `index.css` contained `input:focus { box-shadow: 0 0 0 1px rgba(217, 119, 6, 0.3); }` which added a secondary ring on focus
2. Browser default borders and outlines on input/select/textarea elements

### Solution
1. Modified `index.css` to set `box-shadow: none; outline: none;` for all focus states
2. Added explicit inline styles to each input element: `style={{ border: 'none', boxShadow: 'none', outline: 'none' }}`

### Files Modified
- `prometheus-ui/src/index.css` (lines 66-71)
- `prometheus-ui/src/pages/Describe.jsx` (all input, select, textarea elements)

### Note
Hover/focus burnt orange color change is preserved - handled by GradientBorder `isActive` prop, not by browser focus styles.

---

## Issue #003: Labels Not Vertically Aligned with Inputs
**Date Reported:** 2025-12-10
**Status:** RESOLVED

### Problem
Form labels were not vertically centered with their corresponding input fields, causing visual misalignment.

### Root Cause
Original layout used two separate columns (labels column, inputs column) with spacer divs to maintain alignment. This approach was fragile and could drift.

### Solution
Refactored to row-based flexbox layout:
- Each form row is a `flex items-center` container
- Label and input are siblings in the same row
- `items-center` ensures vertical alignment
- Row gaps controlled by parent `flex-col` with `gap` property

### Files Modified
- `prometheus-ui/src/pages/Describe.jsx` (lines 187-413)

### Structure
```jsx
<div className="flex flex-col" style={{ gap: `${LAYOUT.ROW_GAP}px` }}>
  {/* Each row */}
  <div className="flex items-center">
    <label style={{ width: `${LAYOUT.LABEL_WIDTH}px` }}>Label:</label>
    <GradientBorder><input /></GradientBorder>
  </div>
</div>
```

---

## Verification Checklist

### Issue #001 - Mouse Coordinates
- [x] Display visible at Y=40px from top
- [x] Horizontally centered on viewport
- [x] Shows X relative to centerline (+ for right, - for left)
- [x] Shows Y from top of viewport
- [x] Only visible when DebugGrid is ON (Ctrl+G)

### Issue #002 - Borders
- [x] All input field borders are flat 1px
- [x] No box-shadow on any input element
- [x] No browser outline visible
- [x] Hover still triggers burnt orange border (via GradientBorder)
- [x] Focus still triggers burnt orange border (via GradientBorder)
- [x] Gradient visible: #767171 at edges, #FFFFFF at center

### Issue #003 - Label Alignment
- [x] Title label vertically centered with Title input
- [x] Level label vertically centered with Level dropdown
- [x] Thematic label vertically centered with Thematic dropdown
- [x] Duration label vertically centered with Duration input
- [x] Developer label vertically centered with Developer input
- [x] Select Course label vertically centered with Select Course dropdown

---

*Log maintained by Claude Code (CC) following CLAUDE_PROTOCOL.md*
