# PROMETHEUS UI FRAME DOCTRINE

**Authority:** Sarah, Architect & Controller  
**Effective Date:** 2025-12-08  
**Status:** ACTIVE - IMMUTABLE WITHOUT FOUNDER APPROVAL  

---

## Purpose

This document defines the **immutable UI frame elements** of Prometheus 2.0. These elements constitute the **Prometheus Global UI Shell Doctrine** and may NOT be repositioned, resized, recolored, re-aligned, or functionally altered without explicit approval from Founder Matthew.

**All engineering work must respect these boundaries.**

---

## Immutable Frame Definitions

### 1. TOP FRAME

**Elements:**
| Element | Description | Coordinates/Specs |
|---------|-------------|-------------------|
| Prometheus Logo | Top-left, enlarged 30% | Top-left corner, 1mm gap to line below |
| Main Title | "PROMETHEUS COURSE GENERATION SYSTEM 2.0" | Two-line layout, right of logo |
| Top-Right Info Cluster | Course Loaded, Duration, Level, Thematic | Green (#00FF00) values, Cascadia Code font |
| Top Horizontal Line | Grey→White gradient | Full width (100%), below header elements |
| Navigation Band | DEFINE, DESIGN, BUILD, EXPORT, FORMAT | Bottom edge at Y = 860px |

**Boundary:** Everything from Y = 0 to the bottom of Navigation buttons (Y = 860px top edge region)

---

### 2. MID FRAME (Lower Control Band)

**Elements:**
| Element | Description | Coordinates/Specs |
|---------|-------------|-------------------|
| `< + >` Buttons | Navigation/control symbols | 6px above PKE Interface |
| PKE Interface Lozenge | Center-aligned activation window | 908px × 76px, bottom edge at Y = 860px |
| Action Buttons | DELETE, CLEAR, SAVE | Right section, bottom edge at Y = 860px |

**Boundary:** The horizontal band containing PKE and action buttons, immediately above the bottom line

---

### 3. BOTTOM FRAME

**Elements:**
| Element | Description | Coordinates/Specs |
|---------|-------------|-------------------|
| Bottom Horizontal Line | Grey→White gradient | Full width (100%), Y = 875px |
| Status Bar Labels | OWNER, START DATE, STATUS, PROGRESS, APPROVED | Y = 915px plane |
| Status Bar Values | Green (#00FF00) text values | Y = 915px plane |
| Date/Time Display | DD/MM/YY HH:MM:SS format | Y = 915px, TIME left edge on centerline |

**Boundary:** Everything from Y = 875px (bottom line) to bottom of viewport

---

## Content Zone

The **Content Zone** is the area available for page-specific content (forms, panels, hierarchies, etc.).

| Boundary | Y Coordinate | Notes |
|----------|--------------|-------|
| **Top** | ~180px | Below top horizontal line |
| **Bottom** | ~780px | Above PKE Interface and action buttons |
| **Left** | 0px | UI left edge |
| **Right** | 100% | UI right edge |

**Horizontal Reference:**
- Centerline at X = 0 (50% of viewport)
- Left content zone: X = -95px to X = -285px (typical)
- Right content zone: X = +95px to X = +285px (typical)

---

## Color Reference (Immutable)

| Element | Color | Hex |
|---------|-------|-----|
| Background | Near black | #0d0d0d |
| Panel background | Dark grey | #1a1a1a |
| Text primary | Off-white | #f2f2f2 |
| Text muted | Grey | #767171 |
| Accent green | Bright green | #00FF00 |
| Accent orange | Burnt orange | #FF6600 |
| Button gradient start | Orange | #D65700 |
| Button gradient end | Dark orange | #763000 |
| Border gradient start | Grey | #767171 |
| Border gradient end | White | #ffffff |
| PKE active border | Gold | #BF9000 |
| Input border default | Dark grey | #404040 |
| Input background | Near black | #0d0d0d |

---

## Typography Reference (Immutable)

| Element | Font Family | Size |
|---------|-------------|------|
| Primary UI text | Candara, Calibri, sans-serif | Various |
| Monospace/Status | Cascadia Code, Consolas, monospace | 12px |
| Page titles | Candara | ~24px |
| Form labels | Candara | 15px |
| Navigation buttons | Candara | As established |

---

## Change Control

### Permitted Without Approval
- Content zone layouts (page-specific panels, forms, hierarchies)
- New components within content zone
- Interactive behaviors within content zone
- Data binding and state management

### Requires Founder Approval
- ANY change to Top Frame elements
- ANY change to Mid Frame elements
- ANY change to Bottom Frame elements
- Changes to immutable colors
- Changes to immutable typography
- Changes to frame element coordinates

### Approval Process
1. Document proposed change with rationale
2. Submit to Sarah for architectural review
3. Sarah escalates to Matthew for approval
4. Only proceed with explicit written approval

---

## Enforcement

All Claude Code task briefs involving UI work must:

1. Reference this document: `UI_DOCTRINE.md`
2. Explicitly state that doctrinal elements are NOT to be modified
3. Include verification step confirming no doctrinal elements were altered
4. Flag any potential conflicts for escalation

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-08 | Sarah (via Claude) | Initial doctrine establishment |

---

*This document is referenced by CLAUDE.md and must be read by Claude Code before any UI-related task.*

**END OF DOCTRINE**
