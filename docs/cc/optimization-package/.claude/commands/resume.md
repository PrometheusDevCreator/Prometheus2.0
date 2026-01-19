> **Status**: Reference / Non-authoritative
> **Execution**: NOT PERMITTED
> **Scope**: Claude Code optimisation concepts only
> **Does not override**: /CLAUDE.md, /CLAUDE_PROTOCOL.md, project doctrine

---

# /cc:resume — Resume Previous Session

## Purpose
Load previous session state and continue work seamlessly.

## Execution

1. **Check for state file**:
   ```bash
   cat .planning/STATE.md
   ```

2. **If found**, read and summarize:
   ```
   ═══════════════════════════════════════════
   RESUMING SESSION
   ═══════════════════════════════════════════

   Last Updated: [timestamp]
   Branch: [branch name]

   Previous Goal:
   [goal from STATE.md]

   Completed Last Session:
   - [items]

   In Progress:
   - [current work]

   Next Steps:
   1. [from STATE.md]

   ═══════════════════════════════════════════

   Ready to continue. Shall I proceed with [next step]?
   ```

3. **If NOT found**:
   ```
   No .planning/STATE.md found.

   Options:
   1. Start fresh — tell me what you'd like to work on
   2. Run /cc:audit — scan project for context docs
   3. Check git log — see recent commits for context
   ```

4. **Load recommended context files** listed in STATE.md

5. **Check git status** for any uncommitted changes from last session

## Notes
- Always verify branch matches expected state
- If STATE.md is stale (>24h), confirm goals are still relevant
- Offer to run `/cc:audit` if project seems unfamiliar
