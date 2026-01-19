# ============================================================
# REFERENCE ONLY — DO NOT EXECUTE
# ============================================================
# Status: Reference / Non-authoritative
# Execution: NOT PERMITTED
# Scope: Claude Code optimisation concepts only
# Does not override: /CLAUDE.md, /CLAUDE_PROTOCOL.md, project doctrine
# ============================================================

#!/bin/bash
# Pre-commit Hook — prevents unsafe commits

PROTECTED_BRANCHES="main master production staging"
CURRENT_BRANCH=$(git branch --show-current)

# Block commits to protected branches
for branch in $PROTECTED_BRANCHES; do
    if [ "$CURRENT_BRANCH" = "$branch" ]; then
        echo ""
        echo "⛔ BLOCKED: Cannot commit directly to '$branch'"
        echo ""
        echo "Create a feature branch instead:"
        echo "  git checkout -b feature/your-feature-name"
        echo ""
        exit 1
    fi
done

# Check for sensitive files
SENSITIVE_PATTERNS=".env .env.* *.pem *.key *secret* *password* .aws/credentials"
for pattern in $SENSITIVE_PATTERNS; do
    if git diff --cached --name-only | grep -q "$pattern"; then
        echo ""
        echo "⚠️  WARNING: Potentially sensitive file staged: $pattern"
        echo "   Review carefully before committing."
        echo ""
    fi
done

# Check for large files (>5MB)
LARGE_FILES=$(git diff --cached --name-only | while read file; do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        if [ "$size" -gt 5242880 ]; then
            echo "$file ($(($size / 1048576))MB)"
        fi
    fi
done)

if [ -n "$LARGE_FILES" ]; then
    echo ""
    echo "⚠️  WARNING: Large files staged:"
    echo "$LARGE_FILES"
    echo ""
    echo "Consider using Git LFS or .gitignore"
    echo ""
fi

# All checks passed
exit 0
