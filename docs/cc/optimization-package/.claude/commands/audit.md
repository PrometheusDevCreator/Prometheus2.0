> **Status**: Reference / Non-authoritative
> **Execution**: NOT PERMITTED
> **Scope**: Claude Code optimisation concepts only
> **Does not override**: /CLAUDE.md, /CLAUDE_PROTOCOL.md, project doctrine

---

# /cc:audit — Discover Project Governance Docs

## Purpose
Scan current project for existing documentation and configuration that should inform how Claude Code operates.

## Execution

1. **Scan for governance docs**:
   ```bash
   # Check for Claude-specific docs
   ls -la CLAUDE.md CLAUDE_PROTOCOL.md STATUS.md UI_DOCTRINE.md 2>/dev/null

   # Check for planning state
   ls -la .planning/STATE.md .planning/ROADMAP.md 2>/dev/null

   # Check for standard docs
   ls -la README.md CONTRIBUTING.md .editorconfig .prettierrc 2>/dev/null

   # Check for existing Claude Code config
   ls -la .claude/settings.json .claude/commands/*.md 2>/dev/null
   ```

2. **Report findings**:
   ```
   ═══════════════════════════════════════════
   PROJECT AUDIT: [project name]
   ═══════════════════════════════════════════

   Governance Docs Found:
   ✓ CLAUDE.md — [brief summary if readable]
   ✓ STATUS.md — [current status]
   ✗ UI_DOCTRINE.md — not found

   Planning State:
   ✓ .planning/STATE.md — last updated [date]

   Code Style Config:
   ✓ .prettierrc
   ✓ .editorconfig
   ✗ .eslintrc — not found

   Claude Code Config:
   ✓ .claude/settings.json
   ✓ 3 custom commands found

   Recommendations:
   - READ CLAUDE.md before proceeding
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
   - Key constraints/rules
   - Current status/priorities
   - Coding standards to follow

## Notes
- Run this when starting work on an unfamiliar project
- Governance docs in the project override the universal CLAUDE.md
- Always respect project-specific rules over defaults
