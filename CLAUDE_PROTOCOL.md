# PROMETHEUS CLAUDE CODE PROTOCOL
## Standard Operating Procedure for Autonomous Task Execution

**Version:** 1.0  
**Location:** /CLAUDE_PROTOCOL.md (Project Root)  
**Applies To:** All Claude Code tasks within Prometheus ecosystem  

---

## PURPOSE

This document defines the standard protocol for Claude Code (CC) when executing tasks within the Prometheus Course Generation System. All tasks—regardless of type or complexity—must follow this protocol to ensure quality, prevent infinite loops, and maintain clear communication with the user.

**⚠️ CC MUST read this file before beginning ANY task.**

---

## PROTOCOL OVERVIEW

```
┌────────────────────────────────────────────────────────────┐
│                  CC TASK PROTOCOL                          │
├────────────────────────────────────────────────────────────┤
│ 1. RECEIVE    → Read task fully                            │
│ 2. CONFIRM    → State understanding, ask clarifications    │
│ 3. PLAN       → Generate step-by-step action plan          │
│ 4. AWAIT      → STOP for user approval                     │
│ 5. EXECUTE    → Step → Verify → Fix → Re-verify → Next     │
│ 6. ESCALATE   → STOP if stuck, report to user              │
│ 7. COMPLETE   → Final verification, completion report      │
├────────────────────────────────────────────────────────────┤
│ RETRY LIMITS: Simple=3, Moderate=2, Complex=1 per step     │
│ MANDATORY STOPS: Before starting, when stuck, when done    │
└────────────────────────────────────────────────────────────┘
```

---

## PHASE 1: TASK RECEPTION & UNDERSTANDING

### 1.1 Initial Receipt
Upon receiving a task, CC must:
1. Read the complete task description
2. Identify the task TYPE (see Section 4)
3. Identify all explicit requirements
4. Identify any implicit requirements
5. Note any ambiguities or missing information

### 1.2 Understanding Confirmation
CC must provide a structured confirmation using this exact format:

```
## TASK UNDERSTANDING CONFIRMATION

**Task Summary:** [One sentence description]

**Task Type:** [UI Layout | UI Style | Functionality | Bug Fix | New Feature | Refactor | Data Change]

**Complexity Assessment:** [Simple | Moderate | Complex]

**Explicit Requirements Identified:**
1. [Requirement 1]
2. [Requirement 2]
...

**Implicit Requirements Inferred:**
1. [Inference 1]
2. [Inference 2]
...

**Clarifications Needed:**
1. [Question 1]
2. [Question 2]
...
(or "None - requirements are clear")

**Dependencies/Prerequisites:**
- [Any files, components, or state required]

**Risk Assessment:**
- [Potential issues or side effects]
```

### 1.3 Clarification Resolution
- If clarifications are needed, CC must **STOP** and request them
- CC must **NOT** proceed until clarifications are provided
- CC must **NOT** make assumptions about ambiguous requirements

---

## PHASE 2: ACTION PLAN GENERATION

### 2.1 Plan Structure
After understanding is confirmed, CC must generate an action plan:

```
## ACTION PLAN

**Total Steps:** [N]
**Estimated Scope:** [Small: <5 changes | Medium: 5-15 changes | Large: 15+ changes]
**Retry Limits Applied:** [Per step: X | Total: Y]

### Step-by-Step Plan:

**Step 1: [Title]**
- Action: [What will be done]
- Files affected: [List]
- Success criteria: [How success will be measured]

**Step 2: [Title]**
- Action: [What will be done]
- Files affected: [List]
- Success criteria: [How success will be measured]

[Continue for all steps...]

### Rollback Strategy:
[How to undo changes if task fails catastrophically]

### Final Success Criteria:
[What "done" looks like - measurable outcomes]
```

### 2.2 Approval Gate
After presenting the action plan:
- CC must **STOP** execution
- CC must explicitly state: **"⏸️ AWAITING APPROVAL TO PROCEED"**
- CC must **NOT** begin execution until user confirms
- User responses:
  - "Approved" / "Proceed" / "Go" → Begin execution
  - "Revise [specific item]" → Update plan and re-present
  - "Abort" → Cancel task entirely

---

## PHASE 3: EXECUTION PROTOCOL

### 3.1 Step Execution Cycle
For EACH step in the approved plan, follow this cycle:

```
┌─────────────────────────────────────────────────────────────┐
│  1. EXECUTE STEP                                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  2. POST-STEP VERIFICATION                                  │
│     a) Specific: Does change match requirement?             │
│     b) Functional: Do affected elements still work?         │
│     c) Regression: Did anything else break?                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
          ┌───────┴───────┐
          │               │
          ▼               ▼
    ┌──────────┐    ┌──────────┐
    │   PASS   │    │   FAIL   │
    └────┬─────┘    └────┬─────┘
         │               │
         │               ▼
         │         ┌─────────────────┐
         │         │ Retry count     │
         │         │ within limit?   │
         │         └────────┬────────┘
         │            Yes   │   No
         │         ┌────────┴────────┐
         │         ▼                 ▼
         │    ┌─────────┐    ┌──────────────┐
         │    │  ASSESS │    │   ESCALATE   │
         │    │  & FIX  │    │   TO USER    │
         │    └────┬────┘    └──────────────┘
         │         │
         │         ▼
         │    [Return to VERIFICATION]
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  3. LOG STEP COMPLETION                                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
         [PROCEED TO NEXT STEP]
```

### 3.2 Post-Step Verification Checklist
Run after EVERY step:

| Check Type | What to Verify |
|------------|----------------|
| **Specific** | Does the change match the step's stated requirement exactly? |
| **Functional** | Do affected elements still work? (inputs, buttons, navigation) |
| **Regression** | Do unrelated features still work? Any console errors? |

### 3.3 Step Logging Format
After each step, CC must log:

```
### Step [N]: [Title]
**Status:** ✅ PASS | ❌ FAIL (Attempt X/Y)

- **Action taken:** [What was done]
- **Files modified:** [List]
- **Verification results:**
  - Specific: ✅/❌
  - Functional: ✅/❌
  - Regression: ✅/❌
- **Issues encountered:** [None / Description]
- **Proceeding to:** Step [N+1] | Retry | Escalation
```

---

## PHASE 4: TASK CLASSIFICATION

### 4.1 Task Types

| Type | Description | Examples |
|------|-------------|----------|
| **UI Layout** | Position, size, spacing changes | Move element, resize, align |
| **UI Style** | Colors, fonts, borders | Change color, increase font size |
| **Functionality** | Behavior changes | Button actions, state management |
| **Bug Fix** | Correcting broken behavior | Fix focus loss, fix navigation |
| **New Feature** | Adding new capability | Add component, add page |
| **Refactor** | Code restructuring | Reorganize files, optimize code |
| **Data Change** | Content updates | Dropdown options, label text |

### 4.2 Complexity Assessment Criteria

#### Simple
- Single file affected
- No state management changes
- Isolated change (no dependencies)
- Clear, unambiguous requirement
- **Examples:** Change a color, update text, adjust single spacing value

#### Moderate
- 2-5 files affected
- May involve state changes
- Some dependencies between changes
- Clear requirements with minor inference needed
- **Examples:** Add new component, modify form layout, update multiple related styles

#### Complex
- 5+ files affected
- Significant state management
- Multiple interdependencies
- Requirements need careful interpretation
- **Examples:** Add new page, refactor component architecture, fix systemic bugs

---

## PHASE 5: RETRY LIMITS & ESCALATION

### 5.1 Retry Limits by Complexity

| Complexity | Max Retries Per Step | Max Total Task Retries | Rationale |
|------------|---------------------|------------------------|-----------|
| **Simple** | 3 | 10 | Quick iterations possible |
| **Moderate** | 2 | 6 | Balance speed and caution |
| **Complex** | 1 | 3 | Prevent compounding errors |

### 5.2 Escalation Triggers
CC must **STOP** and escalate to user when ANY of these occur:

1. ❌ **Retry limit reached** for any single step
2. ❌ **Total task retry limit reached**
3. ❌ **Cascading failures** - fixing one thing repeatedly breaks another
4. ❌ **New ambiguity discovered** during execution
5. ❌ **Blocking dependency** - cannot proceed without external input
6. ❌ **Low confidence** - success likelihood assessed as LOW

### 5.3 Success Likelihood Assessment
After a failed step attempt, CC must assess:

```
## STEP FAILURE ANALYSIS

**Step:** [N] - [Title]
**Attempt:** [X of Y allowed]
**Failure type:** [Specific | Functional | Regression]
**Failure description:** [What went wrong]

**Root Cause Analysis:**
- Identified: [Yes/No/Partial]
- Cause: [Description if known]

**Success Likelihood for Retry:**
- 🟢 HIGH (>80%): Clear fix identified, simple error, confident in solution
- 🟡 MEDIUM (40-80%): Fix identified but uncertain, may have side effects
- 🔴 LOW (<40%): Root cause unclear, fix is speculative, or repeated failures

**Decision:**
- 🟢 HIGH → Proceed with retry
- 🟡 MEDIUM → Proceed with retry (final attempt recommended)
- 🔴 LOW → **ESCALATE TO USER**
```

### 5.4 Escalation Report Format
When escalating, CC must provide:

```
## ⚠️ TASK ESCALATION REPORT

**Task:** [Original task summary]
**Status:** 🛑 BLOCKED - Requires User Input

**Progress Summary:**
- Steps completed: [X of Y]
- Current step: [N] - [Title]
- Retry attempts used: [X of Y limit]

**Blocking Issue:**
- **Step:** [N]
- **What was attempted:** [Description]
- **What failed:** [Description]
- **Error/symptom:** [Specific details]

**Root Cause Analysis:**
- Confidence: [High | Medium | Low | Unknown]
- Suspected cause: [Description]

**Options for User:**
1. [Option 1] - [Pros/Cons]
2. [Option 2] - [Pros/Cons]
3. [Option 3] - [Pros/Cons]

**CC Recommendation:** [Suggested path forward with rationale]

**To Proceed, User Must Provide:** [Specific decision or information needed]
```

---

## PHASE 6: COMPLETION & REPORTING

### 6.1 Final Verification Checklist
Before declaring task complete, CC must verify:

**Functionality:**
- [ ] All modified elements function correctly
- [ ] All inputs accept text without issues
- [ ] All buttons perform expected actions
- [ ] All navigation works correctly
- [ ] No console errors

**Visual/Layout:**
- [ ] All alignments correct (left, right, center as specified)
- [ ] All spacing consistent and as specified
- [ ] All colors correct
- [ ] All font sizes correct
- [ ] No overlapping or clipped elements

**Regression:**
- [ ] Unmodified features still work
- [ ] No unintended side effects
- [ ] Application stable

### 6.2 Task Completion Report Format

```
## ✅ TASK COMPLETION REPORT

**Task:** [Summary]
**Status:** COMPLETE

**Execution Summary:**
| Metric | Value |
|--------|-------|
| Total steps | [N] |
| Steps completed | [N] |
| Total retries used | [X] |
| Files modified | [N] |

**Changes Made:**
| Step | Change Description | Files |
|------|-------------------|-------|
| 1 | [Description] | [Files] |
| 2 | [Description] | [Files] |
...

**Final Verification Results:**
- Functionality: ✅ PASS
- Visual/Layout: ✅ PASS
- Regression: ✅ PASS

**Known Limitations or Notes:**
- [Any caveats, edge cases, or items to be aware of]

**Recommended Follow-up:**
- [Any suggested next steps or improvements]
```

### 6.3 Partial Completion Report
If task cannot be fully completed:

```
## ⚠️ TASK PARTIAL COMPLETION REPORT

**Task:** [Summary]
**Status:** PARTIAL - [X of Y steps completed]

**Completed Steps:**
- ✅ Step 1: [Description]
- ✅ Step 2: [Description]
...

**Incomplete Steps:**
- ❌ Step N: [Description] - Reason: [Why not completed]
...

**Current System State:**
- Stability: [Stable | Unstable | Unknown]
- Usability: [Fully usable | Partially usable | Not usable]
- Description: [What works, what doesn't]

**To Complete This Task:**
- [What is needed - user input, different approach, etc.]
```

---

## PHASE 7: SPECIAL PROTOCOLS

### 7.1 UI/Layout Tasks - Additional Checks
- ✓ All specified alignments verified (left edges, right edges, centers)
- ✓ All specified spacing verified (gaps, margins, padding)
- ✓ Responsive behavior if applicable
- ✓ No overflow or clipping
- ✓ Consistent visual rhythm

### 7.2 Functionality Tasks - Additional Checks
- ✓ Happy path tested
- ✓ Edge cases considered (empty input, rapid clicks, etc.)
- ✓ State persistence verified
- ✓ Cross-component communication verified

### 7.3 Bug Fix Tasks - Additional Requirements
- ✓ Root cause identified BEFORE implementing fix
- ✓ Fix addresses root cause, not just symptom
- ✓ Similar code patterns checked for same bug
- ✓ Regression test for the specific bug

---

## INVOCATION METHODS

### Method 1: Explicit Invocation
Include in task prompt:
> "Follow CLAUDE_PROTOCOL.md for this task."

### Method 2: Automatic (Preferred)
CC should automatically follow this protocol when:
- Working in the Prometheus project directory
- CLAUDE.md references this protocol
- Task involves code changes

### Method 3: Quick Tasks
For very simple, single-action tasks, user may specify:
> "Quick task (skip full protocol): [task description]"

CC will still verify the change but skip formal planning/reporting.

---

## APPENDIX A: PROMETHEUS-SPECIFIC CONTEXT

### Project Structure
```
Prometheus2.0/
├── prometheus-ui/          # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── assets/         # Images, icons
│   │   └── App.jsx         # Main app with routing
│   ├── MOCKUP_SPECS.md     # Design specifications
│   └── package.json
├── CLAUDE.md               # Project context for CC
├── CLAUDE_PROTOCOL.md      # This file
└── ui/Mockups/             # Original PowerPoint mockups
```

### Key Files Reference
- **MOCKUP_SPECS.md** - Exact measurements from PowerPoint mockups
- **CLAUDE.md** - Project overview and context
- **src/assets/** - Logo and button images

### Design System Quick Reference
| Element | Value |
|---------|-------|
| Background | #0d0d0d |
| Panel background | #1a1a1a |
| Text primary | #f2f2f2 |
| Text muted | #767171 |
| Accent green | #00FF00 |
| Accent orange | #FF6600 |
| Button gradient | #D65700 → #763000 |
| Border gradient | #767171 → #ffffff |
| PKE gold | #BF9000 |
| Font primary | Candara, Calibri, sans-serif |
| Font mono | Cascadia Code, monospace |

---

## APPENDIX B: COMMON ISSUES & SOLUTIONS

### Issue: React input losing focus
**Cause:** Component re-rendering on every keystroke
**Solution:** Use useCallback for handlers, consolidate state, ensure stable component identity

### Issue: Navigation showing login page
**Cause:** Auth state being reset on navigation
**Solution:** Ensure navigation only changes page state, not auth state

### Issue: Alignment inconsistencies
**Cause:** Mixed units, inconsistent parent containers
**Solution:** Use consistent units (px or rem), verify parent flex/grid settings

### Issue: Styles not applying
**Cause:** CSS specificity, Tailwind purge, caching
**Solution:** Check class names, verify Tailwind config, hard refresh browser

---

*End of Protocol Document*

**Document Control:**
- Created: [Current Date]
- Author: Prometheus Development Team
- Review Cycle: Update as needed based on learnings
