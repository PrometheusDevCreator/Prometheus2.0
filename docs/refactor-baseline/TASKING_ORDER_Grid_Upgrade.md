# TASKING ORDER: UI Grid Functionality Upgrade

**Document ID:** TO-2025-1217-GRID  
**Priority:** URGENT  
**Issued By:** Founder (Matthew) via Claude Opus  
**Date:** 17 December 2025  
**Status:** APPROVED FOR IMMEDIATE IMPLEMENTATION

---

## 1. EXECUTIVE SUMMARY

Complete overhaul of the Prometheus 2.0 UI debug grid system to provide precision coordinate-based positioning capabilities. The grid will use a 1:1 pixel-to-grid-unit mapping with origin at screen centre, supporting pin placement, distance measurement, and floating coordinate display.

---

## 2. BASELINE REFERENCE

All specifications assume the following immutable baseline:

| Parameter | Value |
|-----------|-------|
| Display Resolution | 1920 × 1080 |
| Windows Display Scale | 100% |
| Browser Zoom | 100% |
| Grid Display Units | Pixels (1 Grid Unit = 1 Pixel) |
| Code Implementation Units | Viewport-relative (vw, vh) per codebase conventions |

### 2.1 Unit System Clarification

The Prometheus UI codebase uses **viewport-relative units** (`vw`, `vh`) and **CSS variables** for responsive layout. The Grid system displays coordinates in **pixels** for the Founder's visual reference, but all code implementations must use the appropriate viewport-relative units.

**Grid Display (What Founder Sees):**
- 1 Grid Unit = 1 Pixel
- Origin (0, 0) at viewport centre
- X-axis: approximately ±960 from centre
- Y-axis: approximately ±455 from centre (content area)

**Code Implementation (What CC Writes):**
- Horizontal positions: `vw` units or CSS variables
- Vertical positions: `vh` units or CSS variables
- Must maintain existing codebase conventions

### 2.2 Conversion Factors (at 1920×1080 baseline)

| Direction | Conversion | Example |
|-----------|------------|---------|
| Horizontal | 1px = 0.052083vw | 192px = 10vw |
| Vertical | 1px = 0.092593vh | 108px = 10vh |
| Reverse (H) | 1vw = 19.2px | 10vw = 192px |
| Reverse (V) | 1vh = 10.8px | 10vh = 108px |

**Quick Reference:**
- 100px horizontal = 5.208vw
- 100px vertical = 9.259vh
- 50vw = 960px (half viewport width)
- 50vh = 540px (half viewport height)

### 2.3 Affirmation Protocol

**DOCTRINE:** Any positional values provided by the Founder will always be in Grid Units (pixels). All implementations must:

1. Receive and acknowledge the Grid Unit value
2. Convert to appropriate viewport-relative unit (vw/vh)
3. Confirm with the following affirmation format at the end of any response segment relating to UI element positions:

> **"Grid conversion applied: [X Grid Units]px → [calculated]vw, [Y Grid Units]px → [calculated]vh"**

Example:
> "Grid conversion applied: 192px → 10vw, -108px → -10vh"

---

## 3. PRE-IMPLEMENTATION TASKS

### 3.1 Locate Existing Grid Code

Search the `prometheus-ui` directory for:
- Existing grid overlay component(s)
- Grid toggle functionality
- Any coordinate display logic
- CSS/styling related to grid lines

Likely locations:
- `/prometheus-ui/src/components/` (look for Grid, Debug, Overlay, or DevTools named files)
- `/prometheus-ui/src/utils/` or `/prometheus-ui/src/helpers/`
- Check `App.jsx` or main layout components for grid toggle state

**Report findings before proceeding.**

### 3.2 Assess Current Implementation

Document:
1. Current grid component structure
2. How grid visibility is toggled (keyboard shortcut? UI button?)
3. Current coordinate display mechanism (the "Mouse: X: +759 | Y: 1" display visible in screenshots)
4. How the red X origin marker is rendered
5. Any existing measurement or pin functionality

---

## 4. IMPLEMENTATION SPECIFICATIONS

### 4.1 Coordinate System

```
                    Y: +[contentHeight/2]
                           ↑
                           |
    X: -960 ←————————————— 0 —————————————→ X: +960
                           |
                           ↓
                    Y: -[contentHeight/2]
```

- **Origin (0, 0):** Centre of the viewport content area (where red X is currently placed)
- **X-axis:** Negative values to the left, positive to the right
- **Y-axis:** Negative values downward, positive values upward (standard Cartesian)
- **Range:** Dynamically calculated based on actual viewport dimensions

### 4.2 Grid Origin Marker

- **Visual:** Red X (retain current appearance)
- **Position:** Exact centre of content area
- **Label:** Small label "ORIGIN" or "(0,0)" nearby (subtle, perhaps on hover)
- **Lock Function:** Origin position must not be accidentally movable

### 4.3 Axis Labels and Markers

#### Primary Labels (every 100 units):
- **X-axis:** Display values at Y=0 line: ..., -400, -300, -200, -100, 0, +100, +200, +300, +400, ...
- **Y-axis:** Display values at X=0 line: ..., -400, -300, -200, -100, 0, +100, +200, +300, +400, ...
- **Font:** Monospace, small (10-12px), colour matching current grid aesthetic (cyan/teal)
- **Position:** Labels should not obscure the origin or overlap excessively

#### Secondary Markers (every 50 units):
- Small tick marks (no numerical label)
- Visually distinct from primary (shorter length or different opacity)

### 4.4 Gridlines

#### Standard Mode:
- Lines every 100 units on both axes
- Colour: Current grid line colour (appears to be dark cyan/teal)
- Opacity: Adjustable (see 4.8)

#### Fine Grid Mode:
- Lines every 50 units on both axes
- Toggle between Standard and Fine mode
- Fine grid lines may be slightly lighter/thinner than standard

### 4.5 Grid Toggle Controls

Implement or enhance existing toggle with these modes:
1. **Grid OFF** - No grid visible
2. **Grid ON (Standard)** - 100-unit gridlines
3. **Grid ON (Fine)** - 50-unit gridlines

**Toggle Method:** Keyboard shortcut (recommend: `G` for grid toggle, `Shift+G` for fine grid toggle, or cycle through modes)

### 4.6 Floating Coordinate Display Panel

**Appearance:**
- Semi-transparent dark background with border (consistent with UI aesthetic)
- Draggable to any position on screen
- Default position: Top-right area (near existing status display)
- Compact size, expandable if needed

**Contents:**
```
┌─────────────────────────────────┐
│ GRID COORDINATES          [≡] │ ← Drag handle
├─────────────────────────────────┤
│ Mouse:    X: +350   Y: -120    │
│ Pin 1:    X: +100   Y: +200    │ ← Only shows if pin placed
│ Pin 2:    X: +400   Y: +200    │ ← Only shows if pin placed  
│ Distance: X: 300    Y: 0       │ ← Only shows if 2 pins
│           D: 300               │ ← Euclidean distance
├─────────────────────────────────┤
│ [Standard Grid ▼] [Opacity: ●●●○○] │
└─────────────────────────────────┘
```

**Features:**
- Real-time mouse coordinate update
- Pin coordinates (when placed)
- Distance calculations (when 2 pins placed)
- Grid mode dropdown/toggle
- Opacity slider/buttons
- Collapse/minimize option

### 4.7 Pin System

#### Single Pin (Click):
- **Action:** Single-click anywhere on the grid
- **Visual:** Small marker (crosshair, dot, or pin icon) at click location
- **Display:** Pin coordinates shown in Coordinate Panel
- **Adjustment:** Arrow keys move pin 1 pixel at a time; Shift+Arrow moves 10 pixels
- **Removal:** Press `Escape` or `Delete` key

#### Pin & String (Double-Click):
- **First Double-Click:** Places Pin 1, green connecting line attaches from Pin 1 to cursor
- **Line Display:** Shows X and Y distance values along/parallel to the line
- **Second Double-Click:** Places Pin 2, line freezes between Pin 1 and Pin 2
- **Distance Display:** Both pins show coordinates; distance (X, Y, and Euclidean) shown in panel and optionally near the line

#### Pin Removal Sequence:
- First `Escape`/`Delete`: Removes Pin 1, line reattaches to cursor (if Pin 2 exists, it becomes Pin 1)
- Second `Escape`/`Delete`: Removes remaining pin
- When no pins: `Escape`/`Delete` has no effect on grid

#### Right-Click Context Menu on Pin:
- **Copy Coordinates:** Copies `X: +350, Y: -120` format to clipboard
- **Delete Pin:** Removes this specific pin
- **Set as Origin Reference:** (Future consideration - not required for Phase 1)

### 4.8 Grid Opacity Control

- Slider or stepped buttons (e.g., 5 levels: 20%, 40%, 60%, 80%, 100%)
- Affects gridlines and axis labels
- Does NOT affect pins, connecting lines, or Coordinate Panel
- Default: 60% opacity

### 4.9 Origin Lock

- Prevent any accidental modification of the (0,0) origin point
- Origin is always calculated as viewport centre
- No user interaction should move the origin

### 4.10 Measurement Mode

- **Toggle:** Keyboard shortcut (recommend: `M`)
- **Function:** When active, hovering over UI elements shows their bounding box
- **Display:** Element boundaries highlighted, coordinates shown:
  - Top-left corner: (X, Y)
  - Dimensions: Width × Height
  - Centre point (optional)
- **Note:** This may require integration with React DevTools concepts or custom overlay

### 4.11 Browser Zoom Scaling

- Grid, pins, lines, labels must scale proportionally with browser zoom
- Coordinate values remain consistent (represent actual pixel positions at 100% zoom)
- Test at 75%, 100%, 125%, 150% zoom levels

### 4.12 Unit Display Toggle (Optional Enhancement)

- Toggle between "Grid Units" and "Pixels" label in display
- Since 1:1 ratio, values are identical
- Purpose: Documentation clarity and future-proofing if ratio ever changes

---

## 5. TECHNICAL IMPLEMENTATION NOTES

### 5.1 Suggested Component Structure

```
/prometheus-ui/src/components/DevTools/
├── GridOverlay.jsx          # Main grid rendering
├── GridOverlay.css          # Grid styling
├── CoordinatePanel.jsx      # Floating panel component
├── PinSystem.jsx            # Pin placement and management
├── MeasurementMode.jsx      # Element measurement overlay
└── index.js                 # Exports
```

Or integrate into existing structure if grid components already exist.

### 5.2 State Management

Grid state should include:
```javascript
{
  gridVisible: boolean,
  gridMode: 'off' | 'standard' | 'fine',
  gridOpacity: number (0-1),
  mousePosition: { x: number, y: number },
  pins: [
    { id: 1, x: number, y: number } | null,
    { id: 2, x: number, y: number } | null
  ],
  activePin: number | null,  // Which pin is selected for arrow key movement
  measurementMode: boolean,
  panelPosition: { x: number, y: number },
  panelCollapsed: boolean
}
```

### 5.3 Coordinate Calculation

#### Grid Display Coordinates (Pixels - for visual display)

```javascript
// Convert screen coordinates to grid coordinates (pixels)
const screenToGrid = (screenX, screenY, viewportWidth, viewportHeight) => {
  const originX = viewportWidth / 2;
  const originY = viewportHeight / 2;
  return {
    x: Math.round(screenX - originX),
    y: Math.round(originY - screenY)  // Invert Y for Cartesian
  };
};

// Convert grid coordinates to screen coordinates (pixels)
const gridToScreen = (gridX, gridY, viewportWidth, viewportHeight) => {
  const originX = viewportWidth / 2;
  const originY = viewportHeight / 2;
  return {
    x: originX + gridX,
    y: originY - gridY  // Invert Y for screen
  };
};
```

#### Code Implementation Coordinates (Viewport Units - for CSS)

```javascript
// Convert pixel value to viewport width units
const pxToVw = (px) => {
  return (px / 19.2).toFixed(4);  // At 1920px viewport width
};

// Convert pixel value to viewport height units
const pxToVh = (px) => {
  return (px / 10.8).toFixed(4);  // At 1080px viewport height
};

// Convert viewport units back to pixels (for reference)
const vwToPx = (vw) => {
  return Math.round(vw * 19.2);
};

const vhToPx = (vh) => {
  return Math.round(vh * 10.8);
};

// Example usage for position from centre:
// Founder specifies: X: +192, Y: -108
// Code implements: left: calc(50vw + 10vw), top: calc(50vh + 10vh)
// Or using CSS variables: left: calc(var(--viewport-center-x) + 10vw)
```

#### Important Notes for Implementation

1. **Grid Overlay Display:** The grid overlay itself should calculate and display pixel values for the Founder's reference. These calculations happen in real-time based on mouse position.

2. **Code Changes:** When CC implements position changes based on Founder's Grid Unit specifications, CC must convert pixels to vw/vh units before writing code.

3. **Existing CSS Variables:** Check for existing CSS variables in the codebase (likely in a `layout.js`, `variables.css`, or similar file) that may already define viewport-relative positioning helpers. Use these where they exist.

4. **Consistency:** All new positional code must follow the same unit conventions as existing code. Do not mix px and vw/vh units for layout positioning.

### 5.4 Keyboard Event Handling

Ensure keyboard shortcuts don't conflict with existing functionality:
- `G` - Toggle grid (off → standard → fine → off)
- `M` - Toggle measurement mode
- `Arrow Keys` - Move active pin (when pin is selected)
- `Shift + Arrow Keys` - Move active pin 10 pixels
- `Escape` - Remove pin / exit modes
- `Delete` - Remove pin

### 5.5 Performance Considerations

- Grid rendering should use CSS Grid or SVG for efficiency
- Throttle/debounce mouse position updates (e.g., 60fps max)
- Avoid re-rendering entire grid on mouse move
- Consider using `requestAnimationFrame` for smooth updates

---

## 6. ACCEPTANCE CRITERIA

### 6.1 Must Have (Phase 1)

- [ ] Grid displays with origin at screen centre (0,0)
- [ ] X/Y coordinates display correctly relative to origin
- [ ] 1:1 pixel-to-grid-unit mapping confirmed
- [ ] Grid labels every 100 units, markers every 50 units
- [ ] Toggle between Off/Standard/Fine grid modes
- [ ] Single-click pin placement with coordinate display
- [ ] Arrow key pin adjustment (1px and 10px increments)
- [ ] Double-click Pin & String functionality
- [ ] Distance display between two pins
- [ ] Floating, draggable Coordinate Panel
- [ ] Grid opacity adjustment
- [ ] Pin removal via Escape/Delete
- [ ] Right-click copy coordinates
- [ ] Grid scales with browser zoom

### 6.2 Should Have (Phase 1 if feasible)

- [ ] Measurement mode for UI elements
- [ ] Origin lock indicator
- [ ] Unit display toggle (Grid Units / Pixels label)
- [ ] Panel collapse/minimize

### 6.3 Testing Checklist

- [ ] Test at 1920×1080, 100% scale, 100% browser zoom (baseline)
- [ ] Test at different browser zoom levels (75%, 125%, 150%)
- [ ] Verify coordinates at known positions (corners, edges)
- [ ] Confirm pin placement accuracy
- [ ] Confirm distance calculations (use known distances)
- [ ] Verify grid toggle cycles correctly
- [ ] Test keyboard shortcuts don't conflict
- [ ] Verify panel drag functionality
- [ ] Test on Navigation Hub, Login, Define, Design pages
- [ ] **Verify pixel-to-viewport conversion accuracy** (e.g., 192px should equal 10vw, 108px should equal 10vh)
- [ ] **Confirm grid displays pixel values while codebase uses vw/vh**

---

## 7. POST-IMPLEMENTATION

### 7.1 Report Required

Upon completion, provide:
1. List of files created/modified
2. Any deviations from specification (with rationale)
3. Known limitations or issues
4. Keyboard shortcut summary
5. Screenshot or description of final implementation

### 7.2 Documentation Updates (Separate Task)

After Founder approval of implementation:
- Update CLAUDE_PROTOCOL.md with grid conversion affirmation requirement
- Create UI_SPEC_SHEET.md (new document)
- Update UI_DOCTRINE.md with baseline reference

---

## 8. REFERENCE MATERIALS

### 8.1 Current UI Screenshots

The following pages have been captured showing current grid state:
- Navigation Hub (Image 2)
- Login (Image 3)
- Define (Image 4)
- Design > Overview (Image 5)
- Design > Scalar (Image 6)
- Build (Image 7)

### 8.2 UI Mockup Specifications

Refer to the attached `UI_MOCKUP_SPECIFICATIONS.md` document for element positioning reference (extracted from original PowerPoint mockups).

### 8.3 Baseline Display Settings

- Windows Display: 1920×1080, 100% scale, Landscape (Image 1)
- Browser Zoom: 100% (Image 8)

---

## 9. APPROVAL

**This Tasking Order is APPROVED for immediate implementation.**

**Pre-Implementation Instruction:** Stop the local development server before beginning work. Restart after implementation is complete.

**Implementation Authority:** Claude Code (CC)  
**Review Authority:** Founder (Matthew)  
**Oversight:** Sarah (Controller), Claude Opus (Architecture)

---

*End of Tasking Order*
