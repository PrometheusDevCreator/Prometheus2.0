#!/bin/bash
#
# PROMETHEUS PRE-COMMIT HOOK
# ==========================
#
# Install: cp scripts/pre-commit-hook.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
#
# This hook runs Minor Tests (MT) before each commit per Testing Doctrine.
# Commits are blocked if MT fails.
#

echo "╔════════════════════════════════════════╗"
echo "║  PROMETHEUS PRE-COMMIT TESTING         ║"
echo "║  Running Minor Tests (MT)...           ║"
echo "╚════════════════════════════════════════╝"

cd "$(dirname "$0")/../.." || exit 1

# Check if in prometheus-ui directory or at root
if [ -f "prometheus-ui/package.json" ]; then
  cd prometheus-ui || exit 1
fi

# Run MT via trigger system
node scripts/test-triggers.js --pre-commit
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "╔════════════════════════════════════════╗"
  echo "║  ✗ MT FAILED - COMMIT BLOCKED          ║"
  echo "║                                         ║"
  echo "║  Fix failing tests before committing.  ║"
  echo "║  To bypass: git commit --no-verify     ║"
  echo "╚════════════════════════════════════════╝"
  exit 1
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  ✓ MT PASSED - COMMIT ALLOWED          ║"
echo "╚════════════════════════════════════════╝"

exit 0
