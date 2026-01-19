> **Status**: ACTIVE
> **Scope**: Prometheus PCGS 2.0
> **Governance**: Per CLAUDE_PROTOCOL.md

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

3. **Set up worktree** (for Prometheus):
   ```bash
   cd "$WORKTREE_PATH"

   # Frontend setup
   cd prometheus-ui
   npm install

   # Return to root
   cd ..
   ```

4. **Document in `.planning/WORKTREES.md`**:
   ```markdown
   # Active Worktrees

   | Branch | Path | Purpose | Created |
   |--------|------|---------|---------|
   | feature/auth-refactor | ../Prometheus2.0-feature-auth-refactor | Refactoring auth | 2025-01-19 |
   ```

5. **Report**:
   ```
   Worktree created

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
- Each worktree needs its own npm install
- Worktrees share git history but have independent working directories
- Good for: parallel features, testing ideas, long-running experiments
