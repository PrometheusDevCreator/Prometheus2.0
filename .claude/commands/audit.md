> **Status**: ACTIVE
> **Scope**: Prometheus PCGS 2.0
> **Governance**: Per CLAUDE_PROTOCOL.md

---

# /cc:audit — Discover Project Governance Docs

## Purpose
Scan current project for existing documentation and configuration that should inform how Claude Code operates.

## Execution

1. **Scan for governance docs**:
   ```bash
   # Check for Claude-specific docs (Prometheus standard locations)
   ls -la CLAUDE.md CLAUDE_PROTOCOL.md UI_DOCTRINE.md PLAYWRIGHT_CONFIG.md 2>/dev/null

   # Check for status and planning
   ls -la docs/STATUS.md docs/TODO.md docs/IDEAS.md .planning/STATE.md 2>/dev/null

   # Check for existing Claude Code config
   ls -la .claude/settings.local.json .claude/commands/*.md .claude/rules/*.md 2>/dev/null
   ```

2. **Report findings**:
   ```
   ═══════════════════════════════════════════
   PROJECT AUDIT: Prometheus PCGS 2.0
   ═══════════════════════════════════════════

   Governance Docs Found:
   ✓ CLAUDE.md — [brief summary if readable]
   ✓ CLAUDE_PROTOCOL.md — Task execution protocol
   ✓ UI_DOCTRINE.md — Immutable frame definitions
   ✓ PLAYWRIGHT_CONFIG.md — Viewport standards

   Status Docs:
   ✓ docs/STATUS.md — [current status]
   ✓ docs/TODO.md — [active tasks]
   ✓ docs/INDEX.md — Master documentation index

   Planning State:
   ✓ .planning/STATE.md — last updated [date]

   Claude Code Config:
   ✓ .claude/settings.local.json
   ✓ [N] custom commands found
   ✓ [N] rules files found

   Recommendations:
   - READ CLAUDE.md and CLAUDE_PROTOCOL.md before proceeding
   - STATUS.md indicates [status]
   - [any other recommendations]
   ═══════════════════════════════════════════
   ```

3. **Offer to read key docs**:
   ```
   Shall I read and summarize the governance docs?
   [Y/n]
   ```

4. **If yes**, read and provide condensed summary of:
   - Project purpose
   - Key constraints/rules (UI_DOCTRINE immutables)
   - Current status/priorities
   - Testing doctrine (MT/IT/SOC)

## Notes
- Run this when starting work on an unfamiliar project
- CLAUDE.md in the project root is authoritative
- Always respect project-specific rules over defaults
