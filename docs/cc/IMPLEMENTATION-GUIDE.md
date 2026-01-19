> **Status**: Reference / Non-authoritative
> **Execution**: NOT PERMITTED
> **Scope**: Claude Code optimisation concepts only
> **Does not override**: /CLAUDE.md, /CLAUDE_PROTOCOL.md, project doctrine

---

# Claude Code Universal Optimization — Implementation Guide

## What This Is

A universal configuration for Claude Code that optimizes its behavior across **any** Prometheus ecosystem project. It provides:

- **Context management** — Prevent degradation, clean handoffs
- **Session continuity** — State persistence between sessions
- **Governance compliance** — Auto-discover and respect project docs
- **Code standards** — Consistent patterns across projects
- **Git safety** — Protected branches, sensitive file detection

## Installation

### Quick Install (Copy-Paste)

```bash
# From your project root
cd /path/to/your/project

# Copy the configuration
cp -r /path/to/cc-universal-optimization/.claude .
cp -r /path/to/cc-universal-optimization/.planning .
cp /path/to/cc-universal-optimization/CLAUDE.md ./CLAUDE.md  # Only if no CLAUDE.md exists

# Make hooks executable
chmod +x .claude/hooks/*.sh

# Install git hooks
cp .claude/hooks/pre-commit.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Per-Project Override

If a project already has `CLAUDE.md`, **don't overwrite it**. The project-specific file takes precedence. Instead, just install:

- `.claude/` directory (commands, hooks, rules, settings)
- `.planning/` directory (for STATE.md)

## File Structure

```
your-project/
├── CLAUDE.md                    # Universal or project-specific
├── .claude/
│   ├── settings.json           # Permissions, hooks, git config
│   ├── commands/
│   │   ├── context.md          # /cc:context
│   │   ├── handoff.md          # /cc:handoff
│   │   ├── resume.md           # /cc:resume
│   │   ├── worktree.md         # /cc:worktree
│   │   └── audit.md            # /cc:audit
│   ├── hooks/
│   │   ├── session-start.sh    # Runs on session start
│   │   └── pre-commit.sh       # Git commit safety
│   └── rules/
│       ├── python-files.md     # Loads for *.py
│       ├── typescript-files.md # Loads for *.ts/*.tsx
│       └── html-files.md       # Loads for *.html dashboards
└── .planning/
    └── STATE.md                # Session state (created by /cc:handoff)
```

## Daily Workflow

### Starting a Session

```
1. Open terminal in project directory
2. Run: claude
3. Session start hook shows project status
4. If previous state exists: /cc:resume
5. Otherwise: /cc:audit to discover project docs
```

### During Development

```
- At 60% context: Re-read CLAUDE.md, stay concise
- At 80% context: /cc:handoff then /compact
- Before major changes: Check existing patterns in adjacent files
- Before committing: Git hooks check for protected branches + secrets
```

### Ending a Session

```
1. Run /cc:handoff to save state
2. Commit any work in progress
3. /compact or close terminal
```

### Resuming Later

```
1. Open terminal in project directory
2. Run: claude
3. Run: /cc:resume
4. Continue from where you left off
```

## Custom Commands Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/cc:context` | Check context usage | When responses seem degraded |
| `/cc:handoff` | Save session state | Before compacting or ending |
| `/cc:resume` | Load previous state | Starting a continuation session |
| `/cc:worktree` | Create parallel branch | Need to work on multiple features |
| `/cc:audit` | Scan for project docs | Starting work on unfamiliar project |

## Rules (Auto-Load by File Type)

The `.claude/rules/` directory contains context that loads automatically based on file type:

- **python-files.md** → Loads when editing `*.py`
- **typescript-files.md** → Loads when editing `*.ts`, `*.tsx`, `*.js`, `*.jsx`
- **html-files.md** → Loads when editing `*.html`

This provides relevant standards without consuming context for other languages.

## Git Safety

### Protected Branches
Commits to `main`, `master`, `production`, `staging` are **blocked**. Create feature branches:

```bash
git checkout -b feature/my-feature
```

### Sensitive File Detection
The pre-commit hook warns about:
- `.env` files
- `*.pem`, `*.key` files
- Files with "secret" or "password" in name
- Files larger than 5MB

## Customization

### Adding Project-Specific Commands

Create new `.md` files in `.claude/commands/`:

```markdown
# /cc:your-command — Description

## Purpose
What this command does.

## Execution
1. Step one
2. Step two

## Notes
Any additional context.
```

### Adding Language Rules

Create new `.md` files in `.claude/rules/`:

```markdown
# Language Name Rules
**Applies to**: `*.ext` files

## Standards
- Rule 1
- Rule 2

## Patterns
\`\`\`language
// Example code
\`\`\`
```

### Overriding Settings

Edit `.claude/settings.json` for:
- Permission changes
- Context thresholds
- Protected branch list
- Hook paths

## Troubleshooting

### "Context seems degraded"
1. Run `/cc:context` to check
2. Run `/cc:handoff` to save state
3. Run `/compact` or restart session
4. Run `/cc:resume` in new session

### "Commands not found"
1. Ensure `.claude/commands/` exists
2. Check file names match command names
3. Restart Claude Code session

### "Hooks not running"
1. Check execute permissions: `chmod +x .claude/hooks/*.sh`
2. Verify hook paths in settings.json
3. Manually test: `./.claude/hooks/session-start.sh`

### "Git commit blocked"
1. You're on a protected branch
2. Create feature branch: `git checkout -b feature/name`
3. Or check `.claude/settings.json` to modify protected list

---

## Integration with Existing Projects

### Prometheus2.0 Monorepo
Already has CLAUDE.md, CLAUDE_PROTOCOL.md, STATUS.md, UI_DOCTRINE.md. Install only:
- `.claude/` directory
- `.planning/` directory

The existing CLAUDE.md takes precedence.

### Satellite Apps (Next.js study apps)
No existing Claude config. Install everything:
- `CLAUDE.md`
- `.claude/`
- `.planning/`

### Single-File Dashboards
Typically don't need full config. For active development, install in parent directory.

---

*Built for the Prometheus Ecosystem*
