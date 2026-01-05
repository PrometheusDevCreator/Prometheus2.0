# UI Verification Checklist - Hierarchy Linking & Numbering

**Date:** 2026-01-03
**Deliverable:** E - UI Verification Checklist
**Status:** Ready for Testing

---

## Pre-Test Setup

1. Start dev server: `cd prometheus-ui && npm run dev`
2. Open browser DevTools Console (F12)
3. Navigate to DESIGN page > SCALAR tab
4. Verify console shows: `CANONICAL_STORE_INITIALIZED` log

---

## Test Sequences

### Test 1: Basic Topic Creation Under LO

**Steps:**
1. Click on LO 1 to select it (should highlight orange)
2. Click `+ Topic` button
3. Observe new topic created

**Expected Results:**
- [ ] Console shows: `ADD_TOPIC_START { loId: 'lo-1', ... }`
- [ ] Console shows: `ADD_TOPIC_CANONICAL { ... computedSerial: '1.X' }`
- [ ] New topic displays with serial `1.1` or `1.{next}` (based on existing topics)
- [ ] New topic appears under LO 1 in SCALAR column

---

### Test 2: Create Unlinked Topic

**Steps:**
1. Click in empty area to deselect LO
2. Click `+ Topic` button
3. Observe new topic created

**Expected Results:**
- [ ] Console shows: `ADD_TOPIC_START { loId: null, ... }`
- [ ] Console shows: `ADD_TOPIC_CANONICAL { ... computedSerial: 'x.X' }`
- [ ] New topic displays with serial `x.1` or `x.{next}`
- [ ] New topic appears in "Unallocated" section (red serial)

---

### Test 3: Link Unlinked Topic to LO via SHIFT+Click

**Steps:**
1. SHIFT+click on an unlinked topic (e.g., `x.1`)
2. SHIFT+click on LO 2

**Expected Results:**
- [ ] Console shows: `TOGGLE_TOPIC_LO_LINK_START`
- [ ] Console shows: `TOGGLE_CANONICAL_LINKED { targetLoId: 'lo-2', newSerial: '2.X' }`
- [ ] Topic moves from Unallocated section to under LO 2
- [ ] Topic serial changes from `x.1` to `2.{next}`
- [ ] Other unlinked topics renumber sequentially (x.2 → x.1)

---

### Test 4: Unlink Topic from LO via SHIFT+Click

**Steps:**
1. SHIFT+click on a linked topic (e.g., `1.1`)
2. SHIFT+click on the same LO it's linked to (LO 1)

**Expected Results:**
- [ ] Console shows: `TOGGLE_TOPIC_LO_LINK_START`
- [ ] Console shows: `TOGGLE_CANONICAL_UNLINKED { previousLoId: 'lo-1', newSerial: 'x.X' }`
- [ ] Topic moves to Unallocated section
- [ ] Topic serial changes from `1.1` to `x.{next}`
- [ ] Other topics in LO 1 renumber (1.2 → 1.1, etc.)

---

### Test 5: Create Subtopic

**Steps:**
1. Click on a topic to expand it
2. Click `+ Subtopic` button
3. Observe new subtopic created

**Expected Results:**
- [ ] Console shows: `ADD_SUBTOPIC_CANONICAL { topicId: ..., computedSerial: '...' }`
- [ ] Subtopic displays with correct serial format:
  - Under linked topic (e.g., 1.2): `1.2.1`
  - Under unlinked topic (e.g., x.1): `x.1.1`

---

### Test 6: Move Topic Between LOs

**Steps:**
1. Note topic `1.1` under LO 1
2. SHIFT+click on topic `1.1`
3. SHIFT+click on LO 3

**Expected Results:**
- [ ] Topic moves from LO 1 to LO 3
- [ ] Topic serial changes from `1.1` to `3.1`
- [ ] Remaining topics in LO 1 renumber (1.2 → 1.1)
- [ ] Subtopics of moved topic update serials accordingly

---

### Test 7: Canonical Store Consistency

**Steps:**
1. Perform several link/unlink operations
2. Check browser console for canonical data

**Verification:**
```javascript
// In browser console, type:
console.log(document.querySelector('...').__reactProps$xxx.canonicalData)
```

**Expected Results:**
- [ ] `canonicalData.topics` contains all topics with correct `loId` values
- [ ] All topics have sequential `order` values within their groups
- [ ] No duplicate topic IDs
- [ ] Subtopics reference valid topic IDs

---

### Test 8: Serial Determinism

**Steps:**
1. Create topic A under LO 1 (serial 1.1)
2. Create topic B under LO 1 (serial 1.2)
3. Unlink topic A (serial x.1)
4. Link topic A back to LO 1

**Expected Results:**
- [ ] Topic A gets serial `1.3` (not `1.1`)
- [ ] Serial is based on order of addition, not original position
- [ ] Topic B remains `1.1` throughout

---

### Test 9: Persistence After Page Navigation

**Steps:**
1. Create several topics and link/unlink them
2. Navigate to DEFINE page
3. Navigate back to DESIGN page > SCALAR tab

**Expected Results:**
- [ ] All topic serials preserved
- [ ] Link relationships preserved
- [ ] Console shows `CANONICAL_STORE_INITIALIZED` with correct counts

---

### Test 10: Lesson Editor Topic Creation

**Steps:**
1. Open Lesson Editor modal
2. Add LO to lesson
3. Add Topic via editor
4. Close modal

**Expected Results:**
- [ ] Console shows topic creation logs
- [ ] Topic appears in SCALAR column with correct serial
- [ ] Topic is linked to the lesson's primary LO

---

## Bug Tracking

| Test # | Status | Bug Description | Fix Applied |
|--------|--------|-----------------|-------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |
| 7 | | | |
| 8 | | | |
| 9 | | | |
| 10 | | | |

---

## Console Debug Commands

```javascript
// View canonical data (requires React DevTools)
// Or add this to DesignContext.jsx temporarily:
window.DEBUG_CANONICAL = canonicalData

// Then in console:
console.table(window.DEBUG_CANONICAL.topics)
console.table(window.DEBUG_CANONICAL.subtopics)
```

---

## Success Criteria

All tests pass when:
1. Topic serials are deterministic (same operations → same results)
2. No serial jumps or duplicates within same LO
3. Unlinked topics always show `x.{order}` format
4. Order recalculates correctly after link/unlink
5. Console logs show expected action sequences

---

*Verification prepared for Founder testing*
