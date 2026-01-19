> **Status**: ACTIVE
> **Scope**: Prometheus PCGS 2.0
> **Governance**: Per CLAUDE_PROTOCOL.md

---

# /cc:handoff — Create Session State for Continuation

## Purpose
Capture current session state so work can continue in a fresh context without losing progress or decisions made.

## Execution

1. **Create/update `.planning/STATE.md`** with this structure:

```markdown
# Session State
**Updated**: [ISO timestamp]
**Context**: Prometheus PCGS 2.0
**Branch**: [current git branch]

## Goal
[What we were working toward this session]

## Completed
- [List of completed tasks/changes]

## In Progress
- [Current task and its state]
- [Any partial work that needs continuation]

## Files Modified
- `path/to/file.py` — [brief description of changes]
- `path/to/component.tsx` — [brief description]

## Decisions Made
- [Key architectural or implementation decisions]
- [Why we chose X over Y]

## Blockers / Open Questions
- [Anything unresolved]
- [Questions for Founder]

## Next Steps
1. [Immediate next action]
2. [Following action]
3. [...]

## Context to Reload
[List any files the next session should read first]
```

2. **Run `git status`** and include uncommitted changes

3. **Confirm handoff created**:
   ```
   Handoff complete. Session state saved to .planning/STATE.md

   To continue in new session:
   1. Start fresh Claude Code session
   2. Run /cc:resume

   Safe to /compact or close.
   ```

## Important
- Always run this BEFORE context gets critical
- Include enough detail that a fresh session can continue without re-reading entire codebase
- Capture the "why" behind decisions, not just the "what"

## Prometheus-Specific
- Also update `docs/STATUS.md` with significant changes
- Reference relevant Sarah Briefs in Context to Reload if applicable
