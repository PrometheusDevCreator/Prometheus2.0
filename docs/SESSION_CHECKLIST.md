# Session Checklist

**Version:** 1.0
**Created:** 2025-01-18
**Status:** ACTIVE - MANDATORY FOR ALL SESSIONS
**Authority:** Founder (Matthew)

---

## Purpose

This checklist defines the **mandatory verification gates** that must be passed at the end of every development session. It ensures:

1. No uncommitted work is left behind
2. Documentation remains synchronized
3. State coherence is maintained
4. Technical debt is tracked

**This checklist is embedded in CLAUDE_PROTOCOL.md as mandatory.**

---

## End-of-Session Gate

### 1. Code State Verification

| Check | Command/Action | Pass Criteria |
|-------|----------------|---------------|
| No uncommitted changes | `git status` | Working tree clean OR all changes committed |
| No untracked files of concern | `git status` | No source files untracked (config files OK) |
| Build passes | `npm run build` | Exit code 0, no errors |
| Dev server starts | `npm run dev` | Server starts without errors |
| No console errors | Browser DevTools | Console clear of errors |

### 2. Documentation Verification

| Check | Action | Pass Criteria |
|-------|--------|---------------|
| STATUS.md updated | Review `docs/STATUS.md` | Last session changes documented |
| TODO.md updated | Review `docs/TODO.md` | Completed tasks moved, new tasks added |
| INDEX.md current | Review `docs/INDEX.md` | Any new docs indexed |
| Sarah Brief created (if significant) | Check `docs/briefs/` | Brief created for major changes |

### 3. Data Model Verification

| Check | Action | Pass Criteria |
|-------|--------|---------------|
| Canonical writes only | Code review | All mutations go through DesignContext canonical actions |
| No direct state mutation | Code review | No direct `setState` on canonical data outside actions |
| Views read from derived data | Code review | Components read from selectors, not raw state |

### 4. State Coherence Verification

| Check | Test | Pass Criteria |
|-------|------|---------------|
| CLEAR works | Click CLEAR, navigate away/back | All state remains default |
| Data persists across views | Add data in one view, check in another | Data visible in all relevant views |
| No console errors on navigation | Navigate between all pages | No errors |

### 5. Regression Check

| Check | Test | Pass Criteria |
|-------|------|---------------|
| Login works | Click to login | Navigates to Navigate page |
| Navigation works | All NavWheel sections | All pages load correctly |
| DEFINE inputs work | Type in all fields | Focus maintained, data saved |
| SCALAR displays correctly | Check tree structure | Hierarchy renders correctly |

---

## Quick Checklist (Copy/Paste)

```
## Session End Verification

### Code State
- [ ] `git status` - working tree clean or committed
- [ ] Build passes (`npm run build`)
- [ ] No console errors

### Documentation
- [ ] `docs/STATUS.md` updated with session changes
- [ ] `docs/TODO.md` updated (tasks completed/added)
- [ ] `docs/INDEX.md` current (if new docs created)

### Data Model
- [ ] All writes through canonical actions only
- [ ] No direct state mutation outside actions

### State Coherence
- [ ] CLEAR resets all state
- [ ] Data visible across all views
- [ ] Navigation works without errors

### Session Complete
- [ ] Commit pushed to remote
- [ ] Branch up to date
```

---

## Failure Protocol

If any check fails:

1. **STOP** - Do not end session
2. **DOCUMENT** - Record the failure in ISSUES_LOG.md
3. **FIX or ESCALATE** - Fix immediately if simple, escalate to Founder if complex
4. **RE-VERIFY** - Run full checklist again after fix

---

## Integration with CLAUDE_PROTOCOL.md

This checklist is invoked as follows:

```
## PHASE 6: COMPLETION & REPORTING

Before declaring task complete, CC must:
1. Complete the Session Checklist (docs/SESSION_CHECKLIST.md)
2. Document any failures
3. Include checklist status in completion report
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-18 | CC | Initial creation per Task Order |

---

*This checklist is mandatory per Task Order and CLAUDE_PROTOCOL.md.*
