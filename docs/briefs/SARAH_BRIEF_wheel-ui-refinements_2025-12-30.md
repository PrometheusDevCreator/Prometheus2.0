# SARAH BRIEF: Wheel UI Refinements and Design Page Enhancements

**Date:** 2025-12-30
**Author:** Claude Code (CC)
**Authority:** Founder Directive
**Status:** COMPLETE

---

## A. Executive Summary

**Objective:** Refine wheel-based input components on the Define page and enhance the Design page Overview tab with interactive features.

**Status:** Complete - All changes committed and pushed to main.

**Key Achievements:**
- Restructured Define page wheel layout from 3 rows to 2 rows
- Added Semester/Terms toggle functionality
- Reduced wheel sizes and increased text label visibility
- Removed glow effects from dynamic text (green color retained)
- Removed Module Name dropdown from Define page (relocated to Design page TBC)
- Enhanced Design page with rotational wheels, resizable blocks, and timetable bars

---

## B. Define Page - Wheel Layout Changes

### B.1 Layout Restructure

| Previous Layout | New Layout |
|-----------------|------------|
| Row 1: Level, Content, Seniority | Row 1: Level, Content, Seniority (unchanged) |
| Row 2: Duration (centered) | Row 2: Modules, Duration, Semesters/Terms |
| Row 3: Modules, Semesters, Terms | (Removed - consolidated into Row 2) |

### B.2 Wheel Positioning

| Wheel | Position | Horizontal Offset | Vertical Offset |
|-------|----------|-------------------|-----------------|
| Level | Row 1, Left | marginRight: 100px | - |
| Content | Row 1, Center | - | - |
| Seniority | Row 1, Right | marginLeft: 100px | - |
| Modules | Row 2, Left | marginRight: 80px | marginTop: 10px |
| Duration | Row 2, Center | - | - |
| Semesters/Terms | Row 2, Right | marginLeft: 80px | marginTop: 10px |

### B.3 Size Adjustments

| Wheel Type | Previous Size | New Size | Change |
|------------|---------------|----------|--------|
| Duration | 109px | 93px | -15% |
| Level/Content/Seniority | 86px | 86px | (unchanged) |
| Modules/Semesters/Terms | 58px | 58px | (unchanged) |

### B.4 Text Label Size Increases (+15%)

| Component | Element | Previous | New |
|-----------|---------|----------|-----|
| DurationWheel | Label | 1.1vh/0.95vh | 1.25vh/1.1vh |
| LogarithmicDurationWheel | Label | 1.2vh | 1.4vh |
| CategoricalWheel | Label | 1vh/0.85vh | 1.15vh/1vh |
| ContentWheel | Label | 1vh/0.85vh | 1.15vh/1vh |
| DurationWheelPanel | Toggle button | 0.65vh | 0.75vh |
| DurationWheelPanel | Structure summary | 0.7vh | 0.8vh |
| DurationWheelPanel | Summary row | 0.8vh | 0.9vh |
| DurationWheelPanel | Validation message | 0.7vh | 0.8vh |

### B.5 Glow Effect Removal

Dynamic text in wheel centers no longer has text-shadow glow. The luminous green color (#00ff00) is retained for active/selected values.

| File | Line | Change |
|------|------|--------|
| DurationWheel.jsx | 272 | textShadow: 'none' |
| LogarithmicDurationWheel.jsx | 332 | textShadow: 'none' |
| CategoricalWheel.jsx | 263 | textShadow: 'none' |
| ContentWheel.jsx | 332, 355 | textShadow: 'none' (both T% and P%) |

### B.6 Semester/Terms Toggle

A toggle button has been added below the Semesters wheel:
- Default state: Shows SEMESTERS wheel with "↔ TERM" button
- Toggled state: Shows TERMS wheel with "↔ SEM" button
- Terms wheel removed as standalone; now accessible via toggle

### B.7 Module Name Dropdown Removal

The Module Title input (previously appeared when modules > 1) has been removed from Define.jsx (lines 637-743 deleted). This functionality will be relocated to the Design page at a location TBC.

---

## C. Footer Button Adjustments

| Element | Previous | New | Change |
|---------|----------|-----|--------|
| Home button | bottom: 7.34vh | bottom: 9.47vh | +20px up |
| Analytics button | bottom: 7.34vh | bottom: 9.47vh | +20px up |

---

## D. Design Page - Overview Tab Enhancements

### D.1 Rotational Duration Wheels

All duration wheels now support rotational drag interaction:
- Click and drag to rotate wheel and adjust value
- Scroll to increment/decrement value
- Visual rotation animation follows user input
- Upper row wheels: 99px (reduced 10%)
- Lower row wheels: 82px (reduced 25%)

### D.2 Structure Wheel Styling

Structure wheels (Modules, Semesters, Terms) now have:
- Grey default appearance (#555555 border)
- Luminous green on hover/active
- No glow when inactive

### D.3 OVERVIEW Tab Features

| Feature | Description |
|---------|-------------|
| Resizable blocks | Learning blocks have resize handles with dynamic duration readout |
| Editable titles | Double-click blocks to edit title (free text) |
| Color-coded | Blocks maintain color identity across views |

### D.4 TIMETABLE Reference Bars

Colored duration bars now appear below day rows in the timetable view:
- Bars match OVERVIEW block colors
- Visual representation of time allocation
- Synchronized with block durations

---

## E. Git Commits

### Recent Commits (This Session)

| Hash | Message |
|------|---------|
| 29a1779 | fix: Move Home and Analytics buttons up 20px |
| 03415fa | fix: Adjust wheel sizes, text labels, alignment and remove glow effects |

### Related Earlier Commits

| Hash | Message |
|------|---------|
| 35c31da | fix: Adjust vertical positioning of Duration, Content, and Seniority wheels |
| db8a840 | feat: Add Content wheel for Theory/Practical balance |
| d08714b | fix: Adjust wheel panel layout with proper vertical alignment |
| 5273c13 | feat: Add Level/Seniority wheels with 3-column layout |
| 0e5fced | feat: Logarithmic duration wheel with new layout |
| fc82dbb | style: Reduce wheel sizes and row spacing by 10% |
| ffa2144 | feat: Rotational wheels, resizable OVERVIEW blocks, and TIMETABLE reference bars |
| b38cc93 | feat: OVERVIEW tab, duration wheels, button confirmations, and exit function |

---

## F. Files Modified

### This Session

| File | Changes |
|------|---------|
| `components/duration/DurationWheelPanel.jsx` | Layout restructure, alignment, text sizes |
| `components/duration/DurationWheel.jsx` | Glow removal, label size |
| `components/duration/LogarithmicDurationWheel.jsx` | Glow removal, label size |
| `components/duration/CategoricalWheel.jsx` | Glow removal, label size |
| `components/duration/ContentWheel.jsx` | Glow removal, label size |
| `pages/Define.jsx` | Module Name dropdown removed |
| `components/Footer.jsx` | Button positioning |

### Earlier Session (Design Page)

| File | Changes |
|------|---------|
| `components/design/TimetableGrid.jsx` | Duration reference bars |
| `components/design/overview/LearningBlock.jsx` | Resizable blocks, editable titles |
| `components/design/overview/OverviewCanvas.jsx` | Block management |

---

## G. Visual Verification

All changes verified via Playwright at 1890×940 viewport:
- Wheel layout properly aligned
- All wheels visible without scrolling
- Toggle button functional
- Duration wheel pointer at North for 0 value
- Text labels readable at new sizes
- No glow on dynamic values (green color retained)

---

## H. Outstanding Items

| Item | Status | Notes |
|------|--------|-------|
| Module Name input relocation | PENDING | To be added to Design page, location TBC |

---

## I. Doctrinal Compliance

| Frame | Status | Notes |
|-------|--------|-------|
| **Top Frame** (Header) | UNMODIFIED | - |
| **Mid Frame** (Content) | MODIFIED | Wheel layout within Define page |
| **Bottom Frame** (Footer) | MODIFIED | Button positioning (Founder approved) |

---

## J. Recommendations

1. **Module Name Location:** Consider adding Module Name input to the Scalar workspace or a dedicated Module configuration panel on the Design page.

2. **Wheel Accessibility:** The rotational drag interaction works well but may benefit from keyboard accessibility for fine-tuning values.

3. **Text Scaling:** The 15% label increase improves readability. Monitor at different viewport sizes.

---

## Conclusion

The Define page wheel layout has been successfully restructured into a cleaner 2-row format with improved text visibility and consistent styling. The Semester/Terms toggle provides flexible structure configuration. Design page enhancements including rotational wheels and resizable blocks are fully functional.

**Next Steps:**
1. Determine location for Module Name input on Design page
2. Continue with any additional UI refinements as directed

---

*End of Brief*

**Prepared by:** Claude Code (CC)
**Reviewed by:** Pending Sarah Review
**Approved by:** Pending
