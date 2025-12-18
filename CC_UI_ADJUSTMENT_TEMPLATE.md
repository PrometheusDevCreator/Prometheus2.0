# CC UI ADJUSTMENT BATCH TEMPLATE

**Project:** Prometheus 2.0  
**Baseline:** 1920×1080 | Scale 100% | Browser Zoom 100%  
**Grid System:** 1 Grid Unit = 1 Pixel | Origin (0,0) at viewport centre  
**Code Units:** vw/vh (convert using: 1px = 0.052083vw horizontal, 1px = 0.092593vh vertical)

---

## BATCH HEADER (Copy and complete for each batch)

```
═══════════════════════════════════════════════════════════════════
UI ADJUSTMENT BATCH
═══════════════════════════════════════════════════════════════════
BATCH ID:       [e.g., BATCH-001]
DATE:           [DD/MM/YYYY]
TARGET PAGE(S): [e.g., Navigation Hub / Login / Define / Design > Overview / Design > Scalar / Build]
PRIORITY:       [URGENT / STANDARD]

PRE-IMPLEMENTATION: Stop dev server before changes
POST-IMPLEMENTATION: Restart dev server, verify all items, report completion
═══════════════════════════════════════════════════════════════════
```

---

## ADJUSTMENT ENTRY FORMAT (Copy for each element)

```
───────────────────────────────────────────────────────────────────
ITEM [N]: [Brief Element Name]
───────────────────────────────────────────────────────────────────
ELEMENT:      [Precise name or description of the UI element]
LOCATION:     [Page and section where element is found]
COMPONENT:    [If known - e.g., Header.jsx, NavWheel.jsx - or "UNKNOWN"]

┌─ POSITION ─────────────────────────────────────────────────────┐
│ ACTION:     [MOVE / RETAIN / CENTRE / ALIGN TO]               │
│ CURRENT:    X: [±value]  Y: [±value]  (or "UNKNOWN")          │
│ REQUIRED:   X: [±value]  Y: [±value]                          │
│ REFERENCE:  [Optional - e.g., "Align left edge with Element X"]│
└────────────────────────────────────────────────────────────────┘

┌─ SIZE ─────────────────────────────────────────────────────────┐
│ ACTION:     [RESIZE / RETAIN / MATCH]                          │
│ CURRENT:    W: [value]  H: [value]  (or "UNKNOWN")            │
│ REQUIRED:   W: [value]  H: [value]                            │
│ REFERENCE:  [Optional - e.g., "Match width of PKE Interface"] │
└────────────────────────────────────────────────────────────────┘

┌─ APPEARANCE ───────────────────────────────────────────────────┐
│ ACTION:     [MODIFY / RETAIN]                                  │
│ PROPERTY:   [e.g., colour / opacity / border / font / shadow] │
│ CURRENT:    [Current value or "UNKNOWN"]                       │
│ REQUIRED:   [New value - use hex codes, px, % as appropriate] │
│ NOTES:      [Any additional styling context]                   │
└────────────────────────────────────────────────────────────────┘

┌─ BEHAVIOUR ────────────────────────────────────────────────────┐
│ ACTION:     [MODIFY / ADD / REMOVE / RETAIN]                   │
│ TRIGGER:    [e.g., onClick / onHover / onFocus / onLoad]      │
│ CURRENT:    [Current behaviour or "NONE"]                      │
│ REQUIRED:   [Desired behaviour]                                │
│ NOTES:      [Any interaction context]                          │
└────────────────────────────────────────────────────────────────┘

┌─ ANNOTATION ───────────────────────────────────────────────────┐
│ ACTION:     [ADD / MODIFY / REMOVE / RETAIN]                   │
│ TYPE:       [Tooltip / Label / Placeholder / aria-label]      │
│ CURRENT:    [Current text or "NONE"]                           │
│ REQUIRED:   [New text]                                         │
└────────────────────────────────────────────────────────────────┘

┌─ ADDITIONAL NOTES ─────────────────────────────────────────────┐
│ [Any other context, dependencies, or special instructions]     │
└────────────────────────────────────────────────────────────────┘
───────────────────────────────────────────────────────────────────
```

---

## BATCH FOOTER (Copy and include at end of each batch)

```
═══════════════════════════════════════════════════════════════════
END OF BATCH [BATCH-ID]
═══════════════════════════════════════════════════════════════════
TOTAL ITEMS: [N]

COMPLETION REQUIREMENTS:
1. Implement all items as specified
2. For each POSITION change, confirm: "Grid conversion applied: Xpx → Xvw, Ypx → Yvh"
3. Report any items that could not be implemented as specified (with rationale)
4. List all files modified
5. Note any dependencies or side effects discovered

VERIFICATION: Founder will restart server and visually verify all items.
═══════════════════════════════════════════════════════════════════
```

---

## QUICK REFERENCE - SECTION SHORTCUTS

Not every element needs all sections. Use these shortcuts for simple adjustments:

### Position Only
```
ITEM [N]: [Element Name]
ELEMENT:  [Description]
LOCATION: [Page]
POSITION: MOVE from X: [±val] Y: [±val] → X: [±val] Y: [±val]
```

### Appearance Only
```
ITEM [N]: [Element Name]
ELEMENT:  [Description]
LOCATION: [Page]
APPEARANCE: [property] from [current] → [required]
```

### Multiple Quick Changes
```
ITEM [N]: [Element Name]
ELEMENT:  [Description]
LOCATION: [Page]
CHANGES:
  - POSITION: X: [±val] Y: [±val]
  - SIZE: W: [val] H: [val]
  - COLOUR: [hex code]
  - OPACITY: [%]
```

---

## EXAMPLE BATCH

```
═══════════════════════════════════════════════════════════════════
UI ADJUSTMENT BATCH
═══════════════════════════════════════════════════════════════════
BATCH ID:       BATCH-001
DATE:           17/12/2025
TARGET PAGE(S): Navigation Hub
PRIORITY:       STANDARD

PRE-IMPLEMENTATION: Stop dev server before changes
POST-IMPLEMENTATION: Restart dev server, verify all items, report completion
═══════════════════════════════════════════════════════════════════

───────────────────────────────────────────────────────────────────
ITEM 1: Main Title
───────────────────────────────────────────────────────────────────
ELEMENT:      "PROMETHEUS COURSE GENERATION SYSTEM 2.0" title text
LOCATION:     Navigation Hub, Header area
COMPONENT:    UNKNOWN

POSITION:     MOVE from X: 0 Y: +380 → X: 0 Y: +420
APPEARANCE:   letter-spacing from 2px → 3px
───────────────────────────────────────────────────────────────────

───────────────────────────────────────────────────────────────────
ITEM 2: PKE Interface Bar
───────────────────────────────────────────────────────────────────
ELEMENT:      PKE Interface input bar
LOCATION:     Navigation Hub, bottom centre
COMPONENT:    UNKNOWN

POSITION:     RETAIN
SIZE:         RESIZE from W: UNKNOWN H: UNKNOWN → W: 600 H: 44
APPEARANCE:   border-radius from UNKNOWN → 22px (pill shape)
BEHAVIOUR:    ADD onFocus → subtle glow effect (0 0 8px rgba(0,255,255,0.3))
ANNOTATION:   Placeholder text from "PKE INTERFACE" → "Ask PKE anything..."
───────────────────────────────────────────────────────────────────

───────────────────────────────────────────────────────────────────
ITEM 3: SAVE Button
───────────────────────────────────────────────────────────────────
ELEMENT:      SAVE button (bottom right action buttons)
LOCATION:     Navigation Hub, Footer area
COMPONENT:    UNKNOWN

POSITION:     MOVE to X: +870 Y: -400
APPEARANCE:   RETAIN
BEHAVIOUR:    RETAIN
───────────────────────────────────────────────────────────────────

═══════════════════════════════════════════════════════════════════
END OF BATCH BATCH-001
═══════════════════════════════════════════════════════════════════
TOTAL ITEMS: 3

COMPLETION REQUIREMENTS:
1. Implement all items as specified
2. For each POSITION change, confirm: "Grid conversion applied: Xpx → Xvw, Ypx → Yvh"
3. Report any items that could not be implemented as specified (with rationale)
4. List all files modified
5. Note any dependencies or side effects discovered

VERIFICATION: Founder will restart server and visually verify all items.
═══════════════════════════════════════════════════════════════════
```

---

## COLOUR QUICK REFERENCE (Prometheus Palette)

| Name | Hex | Usage |
|------|-----|-------|
| Background Dark | #0d0d0d | Main background |
| Text Light | #f2f2f2 | Primary text |
| Grey Medium | #767171 | Borders, inactive |
| Grey Dark | #3b3838 | Border endpoints |
| Orange Primary | #FF6600 | Active states, highlights |
| Orange Button | #D65700 | Button gradient mid |
| Orange Dark | #763000 | Button gradient end |
| Cyan/Teal | #00FFFF | Data values, status, grid |
| Green | #00FF00 | Status indicators |

---

## FONT QUICK REFERENCE

| Element | Font | Size | Spacing |
|---------|------|------|---------|
| Main Title | Candara | 20pt | 3pt |
| Section Headers | Candara | 11pt | 3pt |
| Labels | Candara | 8pt | 1.5pt |
| Small Labels | Candara | 6pt | 1.5pt |
| Button Text | Candara | 11pt | 2pt |
| Code/Status | Cascadia Code | 5-6pt | 1.5-2pt |

---

*End of Template*
