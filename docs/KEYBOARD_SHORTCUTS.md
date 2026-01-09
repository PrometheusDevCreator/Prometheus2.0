# Prometheus 2.0 Keyboard Shortcuts

> **Global Keyboard Rules** - Consistent behavior across all pages
>
> **Last Updated:** 2026-01-05

---

## Core Keys

### ENTER Key

| Context | Behavior |
|---------|----------|
| **Course metadata inputs** (Title, Thematic, Code, Description) | Saves current field value |
| **Any text input** | Moves cursor to next user text entry window or button; invokes border color change (`#FF6600`) to indicate Active status |
| **Learning Objectives** (DEFINE page) | Confirms current LO (border turns green); generates new empty LO row |
| **Topics/Subtopics** (Lesson Editor) | Saves current item; generates new Topic/Subtopic row |
| **Scalar cells** | Saves current cell; generates new row if at end |
| **OVERVIEW tab** | Saves current state of overview blocks |
| **Lesson Editor modal** | Saves lesson data and closes editor |
| **Login form** | Submits login credentials |

### DELETE / BACKSPACE Keys

| Context | Behavior |
|---------|----------|
| **Text input with cursor** | Deletes text at cursor position (standard text editing) |
| **Selected item** (LO, Lesson Card, Block) | Initiates delete workflow; triggers PKE warning if item has dependencies |
| **Highlighted text** | Deletes highlighted/selected text |
| **Empty LO row** | Removes the empty row |
| **Selected Scalar cell** | Clears cell content |

### ESCAPE Key

| Context | Behavior |
|---------|----------|
| **Active input field** | Exits field, deactivates focus, reverts unsaved changes |
| **Lesson Editor modal** | Closes modal without saving changes |
| **Edit mode** (Lesson Block) | Cancels edits, exits edit mode, reverts to previous state |
| **Selection active** | Clears current selection |
| **Any modal/dropdown** | Closes modal or dropdown menu |
| **PKE Interface active** | Closes PKE panel |
| **Debug Grid active** (Ctrl+G, no pins) | Returns to Navigation Hub |
| **Context menu open** | Closes context menu |

### SHIFT + CLICK

| Context | Behavior |
|---------|----------|
| **Scalar cells** | Selects multiple cells (multi-select mode); creates contiguous selection |
| **Timetable lessons** | Selects multiple lesson blocks for batch operations |
| **Overview blocks** | Selects multiple learning blocks (TERM, MODULE, WEEK, DAY, LESSON) |
| **BUILD page elements** | Multi-select for batch content operations |
| **Second click on selected item** | Deselects that item from the current selection |

---

## Navigation Keys

| Key | Context | Behavior |
|-----|---------|----------|
| **Tab** | Any form | Move to next focusable element |
| **Shift + Tab** | Any form | Move to previous focusable element |
| **Arrow Keys** | NavWheel | Navigate between sections |
| **Arrow Keys** | Scalar grid | Navigate between cells |
| **Arrow Keys** | Timetable (with selection) | Nudge selected lesson in time |

---

## Debug & Development Keys

| Key Combination | Behavior |
|-----------------|----------|
| **Ctrl + G** | Toggle Debug Grid overlay |
| **Ctrl + G** (with no pins, press again) | Return to Navigation Hub |

---

## Page-Specific Shortcuts

### DEFINE Page

| Key | Behavior |
|-----|----------|
| **Enter** (in LO field) | Confirm LO, add new row |
| **+** button or Enter (empty LO) | Add new Learning Objective |
| **Delete** (on empty LO) | Remove empty LO row |

### DESIGN Page - OVERVIEW Tab

| Key | Behavior |
|-----|----------|
| **Enter** | Save current block state |
| **Delete** | Delete selected block (with confirmation for lessons) |
| **Escape** | Deselect all blocks |

### DESIGN Page - TIMETABLE Tab

| Key | Behavior |
|-----|----------|
| **Enter** (editing lesson) | Save lesson edits |
| **Escape** (editing lesson) | Cancel edits |
| **Delete** (lesson selected) | Unschedule or delete lesson |

### DESIGN Page - SCALAR Tab

| Key | Behavior |
|-----|----------|
| **Enter** | Save cell, move to next row or create new |
| **Tab** | Move to next column |
| **Shift + Tab** | Move to previous column |
| **Delete/Backspace** | Clear cell content |

### Lesson Editor Modal

| Key | Behavior |
|-----|----------|
| **Enter** (in Topic/Subtopic) | Add new Topic/Subtopic |
| **Escape** | Close without saving |
| **Ctrl + S** (future) | Save and close |

---

## Visual Feedback

When keyboard actions trigger state changes, the following visual feedback applies:

| Action | Visual Feedback |
|--------|-----------------|
| **Focus gained** | Border changes to `#FF6600` (Burnt Orange) |
| **Focus lost** | Border returns to `#767171` (if has value) or `#1f1f1f` (if empty) |
| **Item selected** | Border `2px solid AMBER`, subtle glow |
| **Multi-select active** | Each selected item shows selection border |
| **Validation error** | Border `#ff3333`, red glow pulse animation |
| **Save confirmed** | Brief green flash or border color change |

---

## Implementation Notes

These keyboard behaviors should be implemented consistently across all pages. When adding new features:

1. **ENTER** should always save/confirm the current action
2. **ESCAPE** should always provide a safe exit without changes
3. **DELETE/BACKSPACE** should respect context (text editing vs. item deletion)
4. **SHIFT+CLICK** should enable multi-select where applicable

For modal dialogs, ensure ESCAPE always closes the modal and focus returns to the triggering element.

---

*Document maintained by Claude Code (CC)*
