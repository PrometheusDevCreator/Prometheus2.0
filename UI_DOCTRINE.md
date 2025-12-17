# PROMETHEUS UI FRAME DOCTRINE

**Version:** 2.1
**Authority:** Sarah, Architect & Controller
**Effective Date:** 2025-12-17
**Supersedes:** Version 2.0 (2025-12-17)  
**Status:** ACTIVE - IMMUTABLE WITHOUT FOUNDER APPROVAL  

---

## 1. Purpose

This document defines the **immutable UI frame elements** of Prometheus 2.0. These elements constitute the **Prometheus Global UI Shell Doctrine** and may NOT be repositioned, resized, recoloured, re-aligned, or functionally altered without explicit approval from Founder Matthew.

**All engineering work must respect these boundaries.**

---

## 2. Baseline Reference

### 2.1 Display Configuration

| Parameter | Value | Notes |
|-----------|-------|-------|
| Display Resolution | 1920 × 1080 | Founder's physical monitor |
| Windows Display Scale | 100% | No DPI scaling |
| Browser Zoom | 100% | No zoom applied |
| Browser | Chrome (maximised) | Standard viewing mode |

### 2.2 Implementation Viewport Baseline

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Viewport Width** | 1890px | Usable width after browser chrome |
| **Viewport Height** | 940px | Usable height after browser chrome |
| **Grid Origin** | (945, 470) | Centre of usable viewport |

**Note:** Browser chrome (tabs, address bar) consumes approximately 140px vertically. The Implementation Viewport Baseline represents the actual rendering area. All coordinate calculations use this baseline.

### 2.3 Coordinate System

```
                        Y: +470
                           ↑
                           |
    X: -945  ←-------------+-------------→  X: +945
                           |
                           ↓
                        Y: -470

         Origin (0,0) at viewport centre
```

| Axis | Direction | Range |
|------|-----------|-------|
| X | Positive right, negative left | -945 to +945 |
| Y | Positive up, negative down | -470 to +470 |

**Grid Unit Definition:** 1 Grid Unit = 1 Pixel (at Implementation Baseline)

### 2.4 Unit Conversion (1890×940 Baseline)

| Conversion | Formula | Example |
|------------|---------|---------|
| px → vw | px ÷ 18.9 | 189px = 10vw |
| px → vh | px ÷ 9.4 | 94px = 10vh |
| vw → px | vw × 18.9 | 10vw = 189px |
| vh → px | vh × 9.4 | 10vh = 94px |

### 2.5 Grid Position to CSS Conversion

For element at Grid position (X, Y):

```
left:   ((945 + X) / 1890) × 100 vw
bottom: ((470 + Y) / 940) × 100 vh
```

**Example: Element at X: -875, Y: -375**
```
left   = ((945 - 875) / 1890) × 100 = 3.70vw
bottom = ((470 - 375) / 940) × 100 = 10.11vh
```

### 2.6 Affirmation Protocol

When implementing positional changes, CC must confirm:

```
Grid conversion applied: X:[value] → [value]vw, Y:[value] → [value]vh
Implementation baseline: 1890×940
```

---

## 3. Immutable Frame Definitions

### 3.1 TOP FRAME

The Top Frame contains the application header, branding, and global status information.

| Element | Description | Position (Grid Units) | Specifications |
|---------|-------------|----------------------|----------------|
| Prometheus Logo | Application branding | X: -900, Y: +400 (approx) | Enlarged 30% from original, 1mm gap to line below |
| Main Title | "PROMETHEUS COURSE GENERATION SYSTEM 2.0" | Centred horizontally, Y: +380 (approx) | Two-line layout option, Candara font |
| Top-Right Info Cluster | Course Loaded, Duration, Level, Thematic | X: +700 to +900, Y: +400 (approx) | Green (#00FF00) values, Cascadia Code font |
| Top Horizontal Line | Grey→White gradient divider | Full width, Y: +360 (approx) | 1px height, gradient left to right |

**Frame Boundary:** Top edge of viewport to bottom of Top Horizontal Line

---

### 3.2 NAVIGATION BAND

The Navigation Band provides primary section navigation via the NavWheel or equivalent navigation component.

| Element | Description | Position (Grid Units) | Specifications |
|---------|-------------|----------------------|----------------|
| NavWheel | Circular navigation interface | Centred (0, 0) | Contains: DEFINE, FORMAT, GENERATE, DESIGN, BUILD |
| Navigation Labels | Section identifiers | Positioned around NavWheel | Candara font, active state orange (#FF6600) |
| Navigation Arrows | Previous/Next indicators | Flanking NavWheel | Left arrow (←), Right arrow (→) |

**Note:** NavWheel is displayed on Navigation Hub page. Inner pages may display a condensed navigation indicator.

---

### 3.3 MID FRAME (Lower Control Band)

The Mid Frame contains the PKE Interface and primary action controls.

| Element | Description | Position (Grid Units) | Specifications |
|---------|-------------|----------------------|----------------|
| `< + >` Controls | Navigation/pagination symbols | Centred, Y: -350 (approx) | 6px above PKE Interface |
| PKE Interface Lozenge | AI assistant activation window | Centred, Y: -400 (approx) | 908px × 76px, pill shape, gradient border |
| Action Buttons | DELETE, CLEAR, SAVE | X: +700 to +900, Y: -400 (approx) | Right-aligned, pill shape buttons |
| Analytics Button | Analytics access | X: -850, Y: -400 (approx) | Left side, icon button |

**Frame Boundary:** Horizontal band containing PKE Interface and action buttons

---

### 3.4 BOTTOM FRAME

The Bottom Frame contains the status bar and global application state.

| Element | Description | Position (Grid Units) | Specifications |
|---------|-------------|----------------------|----------------|
| Bottom Horizontal Line | Grey→White gradient divider | Full width, Y: -430 (approx) | 1px height, gradient left to right |
| Status Bar Labels | OWNER, START DATE, STATUS, PROGRESS | Y: -460 (approx) | Grey (#767171) text, Cascadia Code |
| Status Bar Values | Dynamic values for each label | Y: -460 (approx) | Green (#00FF00) text, Cascadia Code |
| Date/Time Display | DD/MM/YY HH:MM:SS | Centred, Y: -460 (approx) | Green (#00FF00), Cascadia Code |
| Approval Indicator | APPROVED Y/N | X: +800, Y: -460 (approx) | Right side status |

**Frame Boundary:** Bottom Horizontal Line to bottom edge of viewport

---

## 4. Content Zone

The **Content Zone** is the area available for page-specific content (forms, panels, hierarchies, tables, etc.).

| Boundary | Position (Grid Units) | Notes |
|----------|----------------------|-------|
| **Top Edge** | Y: +350 (approx) | Below Top Horizontal Line |
| **Bottom Edge** | Y: -340 (approx) | Above `< + >` controls |
| **Left Edge** | X: -940 | Near left viewport edge |
| **Right Edge** | X: +940 | Near right viewport edge |

**Usable Content Area:** Approximately 1880px × 690px at baseline

### 4.1 Content Zone Principles

1. All page-specific content must remain within Content Zone boundaries
2. Content must not overlap or obscure frame elements
3. Scrollable content areas are permitted within the Content Zone
4. Modal overlays may extend beyond Content Zone but must not permanently obscure frame elements

---

## 5. Colour Reference (Immutable)

### 5.1 Background Colours

| Element | Hex | RGB | Usage |
|---------|-----|-----|-------|
| Background Primary | #0d0d0d | 13, 13, 13 | Main application background |
| Background Panel | #1a1a1a | 26, 26, 26 | Panel backgrounds, cards |
| Background Input | #0d0d0d | 13, 13, 13 | Input field backgrounds |

### 5.2 Text Colours

| Element | Hex | RGB | Usage |
|---------|-----|-----|-------|
| Text Primary | #f2f2f2 | 242, 242, 242 | Main body text |
| Text Muted | #767171 | 118, 113, 113 | Secondary text, labels |
| Text Active | #00FF00 | 0, 255, 0 | Status values, data display |
| Text Highlight | #FF6600 | 255, 102, 0 | Active states, selections |

### 5.3 Accent Colours

| Element | Hex | RGB | Usage |
|---------|-----|-----|-------|
| Accent Orange | #FF6600 | 255, 102, 0 | Active states, highlights |
| Accent Cyan | #00FFFF | 0, 255, 255 | Grid lines, data accents |
| Accent Green | #00FF00 | 0, 255, 0 | Status values, success states |
| PKE Gold | #BF9000 | 191, 144, 0 | PKE active border |

### 5.4 Button Colours

| Element | Hex | RGB | Usage |
|---------|-----|-----|-------|
| Button Gradient Start | #D65700 | 214, 87, 0 | Primary button gradient |
| Button Gradient End | #763000 | 118, 48, 0 | Primary button gradient |
| Button Secondary | #767171 | 118, 113, 113 | Secondary/inactive buttons |

### 5.5 Border Colours

| Element | Hex | RGB | Usage |
|---------|-----|-----|-------|
| Border Gradient Start | #767171 | 118, 113, 113 | Frame line gradients |
| Border Gradient End | #ffffff | 255, 255, 255 | Frame line gradients |
| Border Input Default | #404040 | 64, 64, 64 | Input field borders |
| Border Input Focus | #00FFFF | 0, 255, 255 | Input field focus state |

---

## 6. Typography Reference (Immutable)

### 6.1 Font Families

| Category | Primary | Fallback | Usage |
|----------|---------|----------|-------|
| UI Text | Candara | Calibri, sans-serif | All UI labels, titles, buttons |
| Monospace | Cascadia Code | Consolas, monospace | Status values, code, data |

### 6.2 Font Sizes

| Element | Size (pt) | Size (px) | Letter Spacing |
|---------|-----------|-----------|----------------|
| Main Title | 20pt | 27px | 3pt |
| Page Title | 11pt | 15px | 3pt |
| Section Header | 11pt | 15px | 3pt |
| Form Labels | 8pt | 11px | 1.5pt |
| Small Labels | 6pt | 8px | 1.5pt |
| Button Text | 11pt | 15px | 2pt |
| Status Text | 5-6pt | 7-8px | 1.5pt |

### 6.3 Font Weights

| Usage | Weight |
|-------|--------|
| Body Text | 400 (Regular) |
| Labels | 400 (Regular) |
| Buttons | 400 (Regular) |
| Emphasis | 600 (Semi-bold) |
| Headings | 400 (Regular) with letter-spacing |

---

## 7. Change Control

### 7.1 Permitted Without Approval

The following changes may be made without Founder approval:

- Content Zone layouts (page-specific panels, forms, hierarchies)
- New components within Content Zone
- Interactive behaviours within Content Zone
- Data binding and state management
- Bug fixes that restore documented behaviour
- Performance optimisations that do not alter appearance

### 7.2 Requires Founder Approval

The following changes **require explicit Founder approval**:

- ANY change to Top Frame elements
- ANY change to Navigation Band elements
- ANY change to Mid Frame elements
- ANY change to Bottom Frame elements
- Changes to immutable colours
- Changes to immutable typography
- Changes to frame element coordinates
- Changes to baseline reference specifications
- Addition of new frame-level elements

### 7.3 Approval Process

1. Document proposed change with rationale
2. Include before/after specifications (with Grid Unit coordinates)
3. Submit to Sarah for architectural review
4. Sarah escalates to Matthew for approval
5. Only proceed with explicit written approval
6. Update this Doctrine document upon implementation

---

## 8. Enforcement

### 8.1 Pre-Task Requirements

All Claude Code task briefs involving UI work must:

1. Reference this document: `UI_DOCTRINE.md`
2. Explicitly state that doctrinal elements are NOT to be modified
3. Specify which frame(s) may be affected, if any
4. Flag any potential conflicts for escalation before implementation

### 8.2 Post-Task Verification

Upon completion of UI tasks, verification must confirm:

1. No doctrinal elements were altered without approval
2. Content Zone boundaries were respected
3. Colour and typography standards were maintained
4. Grid conversion was correctly applied (where applicable)

### 8.3 Violation Protocol

If a doctrinal violation is discovered:

1. Immediately halt further changes
2. Document the violation with screenshots
3. Revert to last known compliant state
4. Report to Sarah for assessment
5. Obtain Founder guidance before proceeding

---

## 9. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-08 | Sarah (via Claude) | Initial doctrine establishment |
| 2.0 | 2025-12-17 | Sarah (via Claude Opus) | Added baseline reference, grid system integration, coordinate system, unit conversion, expanded colour/typography specs, improved structure |
| 2.1 | 2025-12-17 | Founder/Claude Opus | Revised to 1890×940 Implementation Baseline |

---

## Annexes

### Annex A: Layout Mapping

*[PLACEHOLDER - To be populated with precise Grid Unit coordinates for all frame elements following Founder visual verification]*

### Annex B: Page-Specific Content Zones

*[PLACEHOLDER - To be populated with Content Zone specifications for each page: Login, Navigation Hub, Define, Design > Overview, Design > Scalar, Format, Generate, Build]*

### Annex C: Component Library Reference

*[PLACEHOLDER - To be populated with reusable component specifications: buttons, inputs, dropdowns, sliders, toggles, etc.]*

---

*This document is referenced by CLAUDE.md and CLAUDE_PROTOCOL.md. It must be read by Claude Code before any UI-related task.*

**END OF DOCTRINE**
