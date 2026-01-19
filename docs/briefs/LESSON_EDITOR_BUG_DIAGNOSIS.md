# Lesson Editor Bug Diagnosis

**Date:** 2025-01-19
**Tester:** Claude Code (CC)
**Phase:** A - Reproduce & Diagnose
**Status:** DIAGNOSIS COMPLETE

---

## 1. Bug Reproduction Path

### Test Scenario (Per Task Order)

1. **DEFINE:** Create course with 3 LOs using Bloom verb dropdown + ENTER
2. **DESIGN → TIMETABLE:** Add lesson, rename via Lesson Card
3. **Open Lesson Editor** with lesson active
4. **Observe bugs**

### Actual Results

| Issue | Expected | Actual | Screenshot |
|-------|----------|--------|------------|
| LO dropdown labels | "1. IDENTIFY the key components..." | "1. undefined undefined" | lo-undefined-bug.png |
| Lesson title editable | Double-click enables edit | Textbox IS editable (works) | N/A |
| + Topic edit mode | Creates + immediately editable | Creates but NO edit mode | topic-no-edit-mode.png |
| + Subtopic edit mode | Creates + immediately editable | Creates but NO edit mode | (same pattern) |

### Console Evidence

After clicking + Topic:
```
[LOG] Data: {loId: undefined, topicId: topic-1768806359043, action: Creating new topic}
[LOG] [CANONICAL] ADD_TOPIC: {topicId: topic-1768806359043, loId: undefined, order: 1, serial: x.1}
[LOG] [CANONICAL] DERIVE_COMPLETE: {moduleCount: 1, loCount: 0, topicCount: 1, subtopicCount: 0}
```

**Critical observation:** `loCount: 0` even though 3 LOs were created in DEFINE!

---

## 2. Root Cause Analysis

### Bug 1: LO Dropdown Shows "undefined undefined"

**Location:** `LessonEditorModal.jsx:455, 448-460`

**Code (line 455):**
```javascript
options={courseData.learningObjectives || []}
```

**Code (line 448-460):**
```javascript
{selectedLO
  ? `${selectedLO.order || 1}. ${selectedLO.verb} ${selectedLO.description}`
  : 'Select Learning Objective'
}
...
renderOption={(lo) => `${lo.order || 1}. ${lo.verb} ${lo.description}`}
```

**Problem:**
- `courseData.learningObjectives` is an **array of strings** (from Define page)
- Example: `["IDENTIFY the key components...", "EXPLAIN the principles...", "APPLY risk assessment..."]`
- But render function expects **objects** with `.verb` and `.description` properties
- When rendering a string, `lo.verb` and `lo.description` return `undefined`

**Comparison with working code:**
```javascript
// Topics (WORKS - line 280):
const canonicalTopics = Object.values(canonicalData?.topics || {})

// LOs (BROKEN - line 455):
options={courseData.learningObjectives || []}  // Strings, not objects!
```

---

### Bug 2: LOs Not Reaching canonicalData

**Location:** `DesignContext.jsx:481-561, 766-779`

**Initial sync (line 481-561):**
- Runs ONCE on mount
- Migrates from `scalarData.modules[].learningObjectives` to `canonicalData.los`
- But at mount time, courseData may not have LOs yet (user hasn't created them)

**Update sync (line 766-779):**
```javascript
useEffect(() => {
  if (courseData?.learningObjectives?.length > 0) {
    const newLOs = convertCourseDataLOs(courseData.learningObjectives)
    // ... syncs to scalarData.modules[].learningObjectives
  }
}, [courseData?.learningObjectives, convertCourseDataLOs])
```

**Problem:**
- This effect syncs to `scalarData`, NOT to `canonicalData`
- M4 migration made `canonicalData` the source of truth
- New LOs from DEFINE never reach `canonicalData.los`

---

### Bug 3: + Topic/Subtopic Doesn't Enter Edit Mode

**Location:** `DesignContext.jsx:2077-2087`

**Code:**
```javascript
const addTopic = useCallback((loId) => {
  const topicId = `topic-${Date.now()}`

  // Write to canonical store
  setCanonicalData(prev => canonicalAddTopic(prev, {
    id: topicId,
    loId: loId,
    title: 'New Topic'
  }))

  // Returns topicId but NO edit mode trigger
  return topicId
}, [])
```

**Problem:**
- Function creates topic in canonical store
- Returns topicId (could be used for auto-selection)
- But **no mechanism to**:
  1. Set an "editing" state
  2. Auto-focus an input field
  3. Convert the dropdown item to inline edit mode

**LessonEditorModal doesn't have:**
- Inline edit mode for dropdown items
- Auto-focus after creation
- Edit state management for topics/subtopics

---

### Bug 4: loId is undefined When Creating Topic

**Console evidence:**
```
Data: {loId: undefined, topicId: topic-1768806359043, action: Creating new topic}
```

**Problem:**
- When + Topic is clicked in Lesson Editor, no LO is selected first
- `addTopic(loId)` is called with `loId = undefined`
- Topic is created as "unlinked" (not associated with any LO)

---

## 3. Data Structure Comparison

### courseData.learningObjectives (DEFINE page)
```javascript
// Type: string[]
["IDENTIFY the key components of system architecture",
 "EXPLAIN the principles of secure communication",
 "APPLY risk assessment methodologies"]
```

### canonicalData.los (Canonical store)
```javascript
// Type: { [loId]: LOObject }
{
  "lo-define-1": {
    id: "lo-define-1",
    moduleId: "module-1",
    verb: "IDENTIFY",
    description: "the key components of system architecture",
    order: 1
  },
  // ...
}
```

### scalarData.modules[].learningObjectives (Legacy derived)
```javascript
// Type: LOObject[]
[{
  id: "lo-define-1",
  verb: "IDENTIFY",
  description: "the key components of system architecture",
  order: 1,
  expanded: true,
  topics: []
}]
```

---

## 4. Function/File Reference

| Issue | File | Line(s) | Function |
|-------|------|---------|----------|
| LO dropdown source | LessonEditorModal.jsx | 455 | (JSX props) |
| LO render pattern | LessonEditorModal.jsx | 448-460 | (JSX render) |
| LO sync to scalar | DesignContext.jsx | 766-779 | useEffect |
| LO canonical init | DesignContext.jsx | 481-561 | useEffect (mount) |
| convertCourseDataLOs | DesignContext.jsx | 404-421 | convertCourseDataLOs |
| addTopic | DesignContext.jsx | 2077-2087 | addTopic |
| addSubtopic | DesignContext.jsx | 2133+ | addSubtopic |

---

## 5. Proposed Fixes (Phase B-D Preview)

### Fix 1: LO Dropdown Data Source (Phase B)

**Change LessonEditorModal.jsx line 455:**
```javascript
// FROM:
options={courseData.learningObjectives || []}

// TO:
options={Object.values(canonicalData?.los || {})}
```

**Also update selectedLO lookup (line 275-277).**

### Fix 2: LO Canonical Sync (Phase B)

**Add sync effect in DesignContext.jsx:**
```javascript
// Sync courseData LOs to canonicalData.los when they change
useEffect(() => {
  if (courseData?.learningObjectives?.length > 0) {
    const converted = convertCourseDataLOs(courseData.learningObjectives)
    const losMap = {}
    converted.forEach(lo => { losMap[lo.id] = { ...lo, moduleId: 'module-1' } })
    setCanonicalData(prev => ({ ...prev, los: losMap }))
  }
}, [courseData?.learningObjectives])
```

### Fix 3: Immediate Edit Mode (Phase C)

**Option A: Add editingTopicId state**
```javascript
const [editingTopicId, setEditingTopicId] = useState(null)

const handleAddTopic = () => {
  const newId = addTopic(selectedLO?.id)
  setEditingTopicId(newId) // Enter edit mode for this topic
}
```

**Option B: Auto-focus after creation using ref + useEffect**

### Fix 4: Lesson Title Edit Persistence (Phase C)

- Verify `updateLesson` writes to canonical
- Ensure title change reflects in Lesson Card, Scalar, Library

---

## 6. Screenshots

Evidence files in `.playwright-mcp/`:
- `lo-undefined-bug.png` - LO dropdown showing "1. undefined undefined"
- `topic-no-edit-mode.png` - Topic dropdown after + click (no edit mode)

---

## 7. Conclusion

**Primary Root Cause:** Data source mismatch between Define (strings) and Lesson Editor (expects objects), compounded by M4 canonical migration not syncing courseData LOs.

**Secondary Issues:**
1. No "edit mode" UI pattern for newly created items
2. Topics created without LO association due to missing selection

**Recommended Phase B Scope:**
1. Fix LO dropdown to read from `canonicalData.los`
2. Add canonical sync for courseData.learningObjectives
3. Ensure LO object shape includes verb + description

---

*Generated: 2025-01-19*
*Verified by: Claude Code (CC)*
