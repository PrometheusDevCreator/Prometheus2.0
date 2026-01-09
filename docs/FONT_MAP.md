# Prometheus 2.0 Font Map

> **Reference Document** - Single source of truth for typography and UI behaviors
>
> **Last Updated:** 2026-01-05
> **Reference Pages:** Landing Page, Navigation Hub, DEFINE Page (LOCKED)

---

## Part 1: Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `FONT_PRIMARY` | `'Candara', 'Calibri', sans-serif` | Most UI text, labels, titles |
| `FONT_MONO` | `'Cascadia Code', 'Consolas', monospace` | Data values, numbers, code-like text |

---

## Part 2: Font Style Categories

### Category A: Page/Section Titles

| Property | Value |
|----------|-------|
| Font | FONT_PRIMARY |
| Size | 18-26px (1.67-2.22vh) |
| Color | `#f0f0f0` (WHITE) or `AMBER` for section names |
| Letter-Spacing | 4.5px - 8px (0.1em - 0.15em) |
| Weight | 300-500 |

### Category B: Field Labels

| Property | Value |
|----------|-------|
| Font | FONT_PRIMARY |
| Size | 13-15px (D.fs15, ~0.68-0.78vw) |
| Color | `TEXT_SECONDARY` (#a0a0a0) → `AMBER` when active |
| Letter-Spacing | 3px |
| Weight | 400 |

### Category C: Input Text / Body Text

| Property | Value |
|----------|-------|
| Font | FONT_PRIMARY |
| Size | 14px (D.fs14, ~0.73vw) |
| Color | `WHITE` (#f0f0f0) |
| Letter-Spacing | 2px |
| Weight | 400 |

### Category D: Data Values (Mono)

| Property | Value |
|----------|-------|
| Font | FONT_MONO |
| Size | 11-12px (1.11vh) |
| Color | `GREEN_BRIGHT` (#00FF00) for values, `#888` for labels |
| Letter-Spacing | 1-2px |
| Weight | 400-600 |

### Category E: Button Text

| Property | Value |
|----------|-------|
| Font | FONT_PRIMARY |
| Size | 14-15px (1.39vh) |
| Color | `TEXT_SECONDARY` → `WHITE` when selected/active |
| Letter-Spacing | 1.5px - 3px (0.16vw) |
| Weight | 400-600 |

### Category F: Small Labels / Helper Text

| Property | Value |
|----------|-------|
| Font | FONT_PRIMARY or FONT_MONO |
| Size | 10-12px (0.93-1.1vh) |
| Color | `TEXT_SECONDARY`, `TEXT_DIM`, or `TEXT_MUTED` |
| Letter-Spacing | 0.09vh - 2px |
| Weight | 400 |

---

## Part 3: Element Reference Table

| Page/Component | Element | Category | Size | Color | Letter-Spacing |
|----------------|---------|----------|------|-------|----------------|
| **Header** | Main Title | A | 2.22vh | #f0f0f0 | 0.15em |
| **Header** | Section Name | A | 1.67vh | AMBER | 0.42vh |
| **Header** | Info Labels | D | 1.11vh | #888 | - |
| **Header** | Info Values | D | 1.11vh | GREEN_BRIGHT | - |
| **Footer** | Info Labels | F | 1.48vh | #f0f0f0 | - |
| **Footer** | Info Values | D | 1.48vh | GREEN_BRIGHT | - |
| **Footer** | Date/Time | D | 1.96vh | GREEN_BRIGHT | 0.09vh |
| **Footer** | Buttons | E | 1.39vh | TEXT_SECONDARY | 0.16vw |
| **Define** | Column Headers | A | D.fs18 | WHITE→AMBER | 4.5px |
| **Define** | Input Labels | B | D.fs15 | TEXT_SECONDARY→AMBER | 3px |
| **Define** | Input Text | C | D.fs14 | WHITE | 2px |
| **Define** | LO Numbers | D | D.fs14 | AMBER→GREEN | - |
| **NavHub** | Wheel Labels | A | 18px | TEXT_SECONDARY→AMBER | 5px |
| **NavHub** | Center Hub | A | 17px | TEXT_DIM→AMBER | 3px |
| **Login** | Main Title | A | 26px | OFF_WHITE | 8px |
| **Login** | Input Labels | B | 18px | #b0b0b0 | 3px |
| **Login** | Input Text | C | 12px | TEXT_PRIMARY | 2px |

---

## Part 4: Behavioral Specifications

### 4.1 Input Field Behaviors

| State | Border Color | Border Width | Box Shadow | Transition |
|-------|--------------|--------------|------------|------------|
| **Default (empty)** | `#1f1f1f` | 1px | none | 0.2s ease |
| **Has Value** | `#767171` | 0.5px | none | 0.2s ease |
| **Hover** | `#FF6600` (Burnt Orange) | 1px | none | 0.2s ease |
| **Focus/Active** | `#FF6600` (Burnt Orange) | 1px | none | 0.2s ease |
| **Invalid** | `#ff3333` (Bright Red) | 1px | `0 0 6px #ff3333` | 0.2s ease |
| **Validation Error Pulse** | `#c0392b` | 1px | `0 0 15px` pulse | 0.3s x 2 |

**Text Color Changes:**
- Default text: `WHITE` (#f0f0f0)
- Placeholder: `#888888` → `#00FF00` (luminous green) on focus
- Input label: `TEXT_SECONDARY` → `AMBER` when field active

### 4.2 Button Behaviors

| State | Background | Border | Text Color | Box Shadow |
|-------|------------|--------|------------|------------|
| **Default** | `transparent` | `1px solid #1f1f1f` | `TEXT_SECONDARY` | none |
| **Hover** | `transparent` or subtle fill | `1px solid AMBER` | `AMBER` or `WHITE` | `0 0 8px rgba(212,115,12,0.4)` |
| **Selected/Active** | `GRADIENT_BUTTON` | `1px solid AMBER` | `WHITE` | `0 0 8px rgba(212,115,12,0.4)` |
| **Disabled** | `transparent` | `1px solid #1f1f1f` | `TEXT_DIM` | none, opacity: 0.4 |

**Transition:** All properties `0.2s ease`

**Toggle Buttons (Delivery/Accreditation):**
- Inactive: `transparent` bg, `BORDER` border, `TEXT_SECONDARY` text
- Active: `GRADIENT_BUTTON` bg, `AMBER` border, `WHITE` text

### 4.3 Navigation Arrow Behaviors

| State | Color | Transform | Filter |
|-------|-------|-----------|--------|
| **Default** | `TEXT_PRIMARY` or `WHITE` | none | none |
| **Hover** | `AMBER` | none | none |
| **Clicked (pulse)** | `AMBER` | none | `drop-shadow(0 0 8px AMBER)` |
| **Disabled** | `TEXT_DIM` | none | none, opacity: 0.4 |

### 4.4 Border & Line Properties

| Element | Color | Gradient | Thickness |
|---------|-------|----------|-----------|
| **Horizontal Divider (Header/Footer)** | `#444` center | `transparent → #444 10% → #444 90% → transparent` | 1px (0.09vh) |
| **Column Border (active)** | `WHITE` | none | 1px |
| **Column Border (inactive)** | `BORDER` (#1f1f1f) | none | 1px |
| **Input Border (inactive)** | `#1f1f1f` | none | 1px |
| **Input Border (has value)** | `#767171` | none | 0.5px |
| **Input Border (active)** | `#FF6600` | none | 1px |

### 4.5 NavWheel Behaviors

| Element | State | Color | Effect |
|---------|-------|-------|--------|
| **Section Label** | Default | `TEXT_SECONDARY` | none |
| **Section Label** | Hover | `AMBER` | Color change only |
| **Arrow Button** | Default | `AMBER_DARK` | Circle border |
| **Arrow Button** | Hover | `AMBER` bg fill, `WHITE` text | `drop-shadow(0 0 8px AMBER)` |
| **Green Arc Indicator** | Hover | `#00FF00` | Dashed stroke, `greenPulse` animation |
| **Center Hub** | Default | `AMBER_DARK` border | `box-shadow: 0 0 20px AMBER(0.2)` |
| **Center Hub** | Hover | `AMBER` border | `box-shadow: 0 0 40px AMBER(0.5)` |

### 4.6 Lesson Card Behaviors

| State | Border | Background | Box Shadow | Accent |
|-------|--------|------------|------------|--------|
| **Idle** | `1px solid rgba(100,100,100,0.5)` | `rgba(25,25,25,0.95)` | none | Type color bar (5px left) |
| **Hover** | `1px solid BORDER_LIGHT` | same | none | same |
| **Selected** | `2px solid AMBER` | gradient panel | `0 0 12px AMBER(0.3)` | same |
| **Editing** | `2px solid AMBER` | gradient panel | `0 0 16px/32px AMBER` | "EDITING" label |
| **No LO Assigned** | `2px solid #ff4444` | same | `0 0 8px rgba(255,68,68,0.3)` | Warning state |

**Text States:**
- Title: `TEXT_PRIMARY` → `WHITE` (selected) → `GREEN_BRIGHT` (editing)
- Time/Duration: `rgba(180,180,180,0.8)` → `#00FF00` (selected)

**Interactions:**
- Single click: Select
- Double click: Enter edit mode
- Drag: Move lesson
- Edge drag: Resize (5-min snap)
- Right-click: Context menu

### 4.7 Day Bar Behaviors

| State | Background | Border |
|-------|------------|--------|
| **Default** | `rgba(30,30,30,0.6)` | `1px solid rgba(120,120,120,0.4)` |
| **Current Day** | `rgba(212,115,12,0.08)` | same |
| **Drag Over** | `rgba(212,115,12,0.15)` | same |
| **Has Selected Lesson** | same | Day number turns `AMBER` |

---

## Part 5: Protected Pages (DO NOT MODIFY)

The following pages and components are **LOCKED**:

1. **Landing Page** (`Login.jsx`)
2. **Navigation Hub** (`Navigate.jsx`)
3. **DEFINE Page** (`Define.jsx`)
4. **Header** (`Header.jsx`) - globally
5. **Footer** (`Footer.jsx`) - globally

No font, button, window, or function changes permitted without Founder approval.

---

## Part 6: Color Reference (Quick Reference)

| Token | Hex | Usage |
|-------|-----|-------|
| `BG_BASE` | `#080808` | Deepest background |
| `BG_DARK` | `#0d0d0d` | Primary background |
| `BG_PANEL` | `#1a1a1a` | Panel/card background |
| `BG_INPUT` | `#0a0a0a` | Input field background |
| `TEXT_PRIMARY` | `#d8d8d8` | Primary text |
| `TEXT_SECONDARY` | `#a0a0a0` | Secondary/label text |
| `TEXT_DIM` | `#6e6e6e` | Dimmed text |
| `TEXT_MUTED` | `#787878` | Muted text |
| `WHITE` | `#f0f0f0` | Bright white text |
| `AMBER` | `#d4730c` | Primary accent |
| `AMBER_GLOW` | `#ff9500` | Amber glow effects |
| `GREEN_BRIGHT` | `#00FF00` | Luminous green (values, confirmed) |
| `BORDER` | `#1f1f1f` | Default border |
| `BORDER_LIGHT` | `#2d2d2d` | Light border |
| `PKE_GOLD` | `#BF9000` | PKE accent |
| `PKE_ACTIVE` | `#FF6600` | PKE active/burnt orange |

---

*Document maintained by Claude Code (CC)*
