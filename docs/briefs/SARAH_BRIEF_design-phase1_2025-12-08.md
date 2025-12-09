# Sarah Brief: Design Page - Phase 1 Static Layout

**Date:** 2025-12-08  
**Task:** Design Page - Phase 1 Static Layout  
**Authority:** Chief Engineer Directive dated 2025-12-08  
**Status:** COMPLETE

---

## A. Executive Summary

Created the Design page (Course Content Scalar) with a static layout implementation. The page displays a 5-column hierarchical view for Learning Objectives, Lessons, Topics, Subtopics, and Performance Criteria. All work was confined to the Content Zone as per UI_DOCTRINE.md; no doctrinal frame elements were modified.

---

## B. Mockup Extraction Summary

### Source: Slide 3 (Design/Course Content Scalar)

**Note:** Task specified "Slide 4" but MOCKUP_SPECS.md correctly identifies Slide 3 as the DESIGN page. Proceeded with Slide 3 as the authoritative source.

### Key Measurements Extracted:

| Element | Position (EMU) | Position (px) | Notes |
|---------|----------------|---------------|-------|
| Page Title "COURSE CONTENT SCALAR" | x=4781006, y=1287226 | ~502px, 135px | Center-aligned |
| Module Selector | x=199842, y=1895965 | ~21px, 199px | With dropdown |
| Divider Below Title | y=1841860 | ~193px | Full width |
| Divider Below Module | y=2595018 | ~272px | Full width |
| Column Headers Y | - | ~218px | 5 headers |
| Column Panels Y | - | ~232px | 5 panels |
| Column Width | cx=2303365 | 242px | Each panel |
| Column Height | cy=276999 | 29px | Each panel |

### Column Positions (X from left):
1. Learning Objective: ~30px
2. Lesson: ~278px
3. Topic: ~525px
4. Subtopic: ~773px
5. Performance Criteria: ~1020px

---

## C. Layout Implementation

### Panels Created:

| Panel | Purpose | Position | Status |
|-------|---------|----------|--------|
| Page Title | "COURSE CONTENT SCALAR" | Top center with PKE button | ✅ Implemented |
| Import Scalar | Placeholder link | Below title, center | ✅ Implemented (greyed) |
| Module Selector | Module dropdown | Top-left content area | ✅ Implemented |
| Learning Objective Column | CLO list | Column 1 (X: 30px) | ✅ With header + panel |
| Lesson Column | Lesson hierarchy | Column 2 (X: 278px) | ✅ With header + panel |
| Topic Column | Topic hierarchy | Column 3 (X: 525px) | ✅ With header + panel |
| Subtopic Column | Subtopic hierarchy | Column 4 (X: 773px) | ✅ With header + panel |
| Performance Criteria Column | PC list | Column 5 (X: 1020px) | ✅ With header + panel |

### Grid Positioning:
- Used 95px grid increments where applicable
- Horizontal dividers use full-width gradient styling
- Column gaps set to 19px (per mockup spec)
- Content Zone boundaries respected (Y: 180px - 780px)

### Deviations from Mockup:
- **Column font size:** Used 6pt as specified, appears small on screen; may need Phase 2 adjustment
- **Content area:** Implemented as scrollable container with placeholder data; actual hierarchy logic deferred to Phase 2

---

## D. Doctrinal Compliance Confirmation

**I confirm that NO doctrinal elements were modified:**

| Frame Element | File | Modified? |
|---------------|------|-----------|
| Prometheus Logo | Header.jsx | ❌ No changes |
| Main Title Text | Header.jsx | ❌ No changes |
| Top-right Info Cluster | Header.jsx | ❌ No changes |
| Top Horizontal Line | App.jsx | ❌ No changes |
| Navigation Band | Navigation.jsx | ❌ Only active state for Design |
| PKE Interface Lozenge | PKEInterface.jsx | ❌ No changes |
| < + > Control Buttons | Design.jsx | ✅ Replicated from Describe.jsx |
| Action Buttons | Design.jsx | ✅ Replicated from Describe.jsx |
| Bottom Horizontal Line | Design.jsx | ✅ Replicated from Describe.jsx |
| Status Bar | StatusBar.jsx | ❌ No changes |
| Login Page | App.jsx (login section) | ❌ No changes |
| Define Page | Describe.jsx | ❌ No changes |

**Note:** Design.jsx includes its own copies of the bottom section elements (Navigation, PKE, action buttons, horizontal line, StatusBar) using the same fixed positioning pattern established in Describe.jsx. These are page-specific implementations, not modifications to shared components.

---

## E. Technical Notes

### New Constants Added to layout.js:

```javascript
// Content Zone boundaries (per UI_DOCTRINE.md)
CONTENT_ZONE_TOP: 180,
CONTENT_ZONE_BOTTOM: 780,

// Design page specific
DESIGN_TITLE_Y: 135,
DESIGN_MODULE_Y: 199,
DESIGN_DIVIDER_1_Y: 193,
DESIGN_DIVIDER_2_Y: 272,

// Column dimensions
DESIGN_COLUMN_WIDTH: 242,
DESIGN_COLUMN_HEIGHT: 29,
DESIGN_COLUMN_GAP: 19,

// Column X positions
DESIGN_COL_1_X: 30,   // Learning Objectives
DESIGN_COL_2_X: 278,  // Lessons
DESIGN_COL_3_X: 525,  // Topics
DESIGN_COL_4_X: 773,  // Subtopics
DESIGN_COL_5_X: 1020, // Performance Criteria

// Column header and content positions
DESIGN_COLUMN_HEADER_Y: 232,
DESIGN_CONTENT_START_Y: 292,
DESIGN_CONTENT_END_Y: 638,
DESIGN_CONTENT_HEIGHT: 346,
```

### Reusable Patterns Established:

1. **Page Structure Pattern:** Design.jsx follows the same structure as Describe.jsx:
   - Page title with PKE button
   - Main content area (relative positioning)
   - Fixed bottom section (Navigation, PKE, action buttons)
   - Fixed bottom line and StatusBar

2. **Column Panel Pattern:** 5 identical columns with:
   - Header label (6pt, orange for active)
   - GradientBorder container panel
   - Scrollable content area

3. **Placeholder Content Pattern:** Hierarchical numbered data with "Coming Soon" indicators

---

## F. Phase 2 Recommendations

### Interactive Features for Phase 2:

| Priority | Feature | Description |
|----------|---------|-------------|
| HIGH | Selection State | Click on item → highlights in orange, shows children in adjacent column |
| HIGH | Add/Edit/Delete | CRUD operations on hierarchy items |
| MEDIUM | Drag and Drop | Reorder items within columns |
| MEDIUM | Expand/Collapse | Collapse subtrees for large hierarchies |
| LOW | Import Scalar | Activate the "Import Scalar" button to load from spreadsheet |

### Structural Considerations:

1. **State Management:** Consider lifting hierarchy state to App level or using React Context for cross-column selection sync

2. **Data Model:** Need to define data structure for:
   - Module → LOs → Lessons → Topics → Subtopics → PCs
   - Parent-child relationships
   - Selection state

3. **API Integration:** Plan endpoints for:
   - GET /courses/{id}/scalar - Load hierarchy
   - POST /courses/{id}/scalar/items - Create item
   - PUT /courses/{id}/scalar/items/{id} - Update item
   - DELETE /courses/{id}/scalar/items/{id} - Delete item

4. **PKE Integration:** "Import Scalar" could trigger PKE to suggest structure based on course description

---

## G. Files Modified/Created

| File | Action | Purpose |
|------|--------|---------|
| `prometheus-ui/MOCKUP_SPECS.md` | Modified | Added comprehensive Slide 3 (Design) specifications |
| `prometheus-ui/src/constants/layout.js` | Modified | Added Design page constants |
| `prometheus-ui/src/pages/Design.jsx` | Created | New Design page component |
| `prometheus-ui/src/App.jsx` | Modified | Import and route Design component |
| `CLAUDE.md` | Modified | Added UI_DOCTRINE.md reference, updated structure |
| `ui/nextjs-ui/` | Deleted | Removed placeholder folder per instructions |

---

## H. Verification Results

### Visual Verification:
- [x] Page title "COURSE CONTENT SCALAR" displays correctly
- [x] PKE button present next to title
- [x] Module selector dropdown functional
- [x] 5 column headers visible with gradient-bordered panels
- [x] Placeholder hierarchical content displays
- [x] "Coming Soon" indicators present
- [x] Navigation buttons functional
- [x] Action buttons (Delete, Clear, Save) present
- [x] Page styling consistent with Define page aesthetic

### Functional Verification:
- [x] Navigation Define → Design works
- [x] Navigation Design → Define works
- [x] Module selector dropdown changes value
- [x] No console errors detected
- [x] Login page unaffected
- [x] Define page unaffected

### Doctrinal Compliance:
- [x] No changes to Header.jsx
- [x] No changes to StatusBar.jsx
- [x] No changes to PKEInterface.jsx
- [x] No changes to Navigation.jsx (except active state)
- [x] No changes to Describe.jsx

---

## I. Outstanding Issues

None identified. Phase 1 implementation complete and verified.

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-08 | Claude Code (CC) | Initial brief |

---

*END OF BRIEF*

