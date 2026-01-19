# ============================================================
# REFERENCE ONLY — DO NOT EXECUTE
# ============================================================
# Status: Reference / Non-authoritative
# Execution: NOT PERMITTED
# Scope: Claude Code optimisation concepts only
# Does not override: /CLAUDE.md, /CLAUDE_PROTOCOL.md, project doctrine
# ============================================================

#!/bin/bash
# Session Start Hook — runs when Claude Code session begins

echo "═══════════════════════════════════════════"
echo "PROMETHEUS DEV SESSION"
echo "═══════════════════════════════════════════"
echo ""

# Show current directory and git info
echo "📁 Directory: $(pwd)"
if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "🌿 Branch: $(git branch --show-current)"
    echo "📊 Status:"
    git status --short
else
    echo "⚠️  Not a git repository"
fi
echo ""

# Check for governance docs
echo "📋 Governance Docs:"
for doc in CLAUDE.md CLAUDE_PROTOCOL.md STATUS.md UI_DOCTRINE.md; do
    if [ -f "$doc" ]; then
        echo "   ✓ $doc"
    fi
done

# Check for session state
if [ -f ".planning/STATE.md" ]; then
    echo ""
    echo "📌 Previous session state found. Run /cc:resume to continue."
fi

echo ""
echo "═══════════════════════════════════════════"
echo "Commands: /cc:context | /cc:handoff | /cc:resume | /cc:audit"
echo "═══════════════════════════════════════════"
