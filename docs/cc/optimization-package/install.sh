# ============================================================
# REFERENCE ONLY — DO NOT EXECUTE
# ============================================================
# Status: Reference / Non-authoritative
# Execution: NOT PERMITTED
# Scope: Claude Code optimisation concepts only
# Does not override: /CLAUDE.md, /CLAUDE_PROTOCOL.md, project doctrine
# ============================================================

#!/bin/bash
# Claude Code Universal Optimization Installer
# Usage: ./install.sh [target-directory]

set -e

TARGET="${1:-.}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "═══════════════════════════════════════════"
echo "Claude Code Universal Optimization Installer"
echo "═══════════════════════════════════════════"
echo ""
echo "Target: $TARGET"
echo ""

# Create target if it doesn't exist
mkdir -p "$TARGET"

# Install .claude directory
echo "Installing .claude/ configuration..."
if [ -d "$TARGET/.claude" ]; then
    echo "  ⚠️  .claude/ exists — merging (existing files preserved)"
    cp -rn "$SCRIPT_DIR/.claude/"* "$TARGET/.claude/" 2>/dev/null || true
else
    cp -r "$SCRIPT_DIR/.claude" "$TARGET/"
fi

# Install .planning directory
echo "Installing .planning/ directory..."
mkdir -p "$TARGET/.planning"
if [ ! -f "$TARGET/.planning/STATE.md" ]; then
    cp "$SCRIPT_DIR/.planning/STATE.md" "$TARGET/.planning/"
fi

# Install CLAUDE.md only if not present
echo "Checking CLAUDE.md..."
if [ -f "$TARGET/CLAUDE.md" ]; then
    echo "  ✓ CLAUDE.md already exists — preserving project-specific version"
else
    echo "  Installing universal CLAUDE.md"
    cp "$SCRIPT_DIR/CLAUDE.md" "$TARGET/"
fi

# Make hooks executable
echo "Setting hook permissions..."
chmod +x "$TARGET/.claude/hooks/"*.sh 2>/dev/null || true

# Install git hooks if in a git repo
if [ -d "$TARGET/.git" ]; then
    echo "Installing git hooks..."
    cp "$TARGET/.claude/hooks/pre-commit.sh" "$TARGET/.git/hooks/pre-commit"
    chmod +x "$TARGET/.git/hooks/pre-commit"
    echo "  ✓ pre-commit hook installed"
else
    echo "  ⚠️  Not a git repo — skipping git hooks"
fi

echo ""
echo "═══════════════════════════════════════════"
echo "✓ Installation complete"
echo ""
echo "Installed:"
echo "  - .claude/commands/ (5 custom commands)"
echo "  - .claude/hooks/ (session-start, pre-commit)"
echo "  - .claude/rules/ (python, typescript, html)"
echo "  - .claude/settings.json"
echo "  - .planning/STATE.md (template)"
if [ ! -f "$TARGET/CLAUDE.md" ] || [ "$SCRIPT_DIR/CLAUDE.md" -nt "$TARGET/CLAUDE.md" ]; then
    echo "  - CLAUDE.md"
fi
echo ""
echo "Next steps:"
echo "  1. cd $TARGET"
echo "  2. claude"
echo "  3. Run /cc:audit to verify setup"
echo "═══════════════════════════════════════════"
