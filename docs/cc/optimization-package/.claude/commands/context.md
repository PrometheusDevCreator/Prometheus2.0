> **Status**: Reference / Non-authoritative
> **Execution**: NOT PERMITTED
> **Scope**: Claude Code optimisation concepts only
> **Does not override**: /CLAUDE.md, /CLAUDE_PROTOCOL.md, project doctrine

---

# /cc:context — Analyze Context Usage

## Purpose
Check current context window usage and recommend actions.

## Execution

1. **Estimate current usage** by considering:
   - Files currently loaded in context
   - Conversation length
   - Code blocks generated

2. **Provide assessment**:
   ```
   Context Status: [LOW | MODERATE | HIGH | CRITICAL]
   Estimated Usage: ~XX%

   Loaded Context:
   - [list key files/content in context]

   Recommendation: [continue | consider compacting | handoff now]
   ```

3. **If HIGH or CRITICAL**, proactively suggest:
   - Which context can be safely dropped
   - Whether to run `/cc:handoff` before continuing
   - Whether to `/compact` or restart session

## Notes
- This is an estimate — Claude Code doesn't expose exact token counts
- Err on the side of caution for complex sessions
- Long conversations with many code edits degrade faster
