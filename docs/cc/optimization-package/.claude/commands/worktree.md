> **Status**: Reference / Non-authoritative
> **Execution**: NOT PERMITTED
> **Scope**: Claude Code optimisation concepts only
> **Does not override**: /CLAUDE.md, /CLAUDE_PROTOCOL.md, project doctrine

---

# /cc:worktree — Create Parallel Development Branch

## Purpose
Set up a git worktree for parallel Claude Code sessions working on different features without conflicts.

## Execution

1. **Get feature name from user** or generate from context

2. **Create worktree**:
   ```bash
   # Generate branch name
   BRANCH="feature/[description]"
   WORKTREE_PATH="../$(basename $PWD)-$BRANCH"

   # Create worktree
   git worktree add -b "$BRANCH" "$WORKTREE_PATH" main
   ```

3. **Set up worktree** (if needed):
   ```bash
   cd "$WORKTREE_PATH"

   # For Node projects
   npm install  # or yarn/pnpm

   # For Python projects
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Document in `.planning/WORKTREES.md`**:
   ```markdown
   # Active Worktrees

   | Branch | Path | Purpose | Created |
   |--------|------|---------|---------|
   | feature/auth-refactor | ../project-feature-auth-refactor | Refactoring auth module | 2026-01-18 |
   ```

5. **Report**:
   ```
   ✓ Worktree created

   Branch: feature/[name]
   Path: [path]

   To work in parallel:
   1. Open new terminal
   2. cd [path]
   3. Start new Claude Code session: claude

   Current session remains on: [current branch]
   ```

## Cleanup (when done)
```bash
git worktree remove ../[worktree-path]
git branch -d feature/[name]  # after merge
```

## Notes
- Each worktree needs its own npm install / venv
- Worktrees share git history but have independent working directories
- Good for: parallel features, testing ideas, long-running experiments
