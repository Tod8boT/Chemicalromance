#!/bin/bash

# Validate all workflows in new_workflows directory
# Usage: ./validate-all.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOWS_DIR="$SCRIPT_DIR/../new_workflows"

echo "🔍 Validating all workflows in: $WORKFLOWS_DIR"
echo ""

total=0
passed=0
failed=0

for workflow in "$WORKFLOWS_DIR"/*.json; do
  if [ -f "$workflow" ]; then
    total=$((total + 1))
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    if node "$SCRIPT_DIR/validate-workflow.js" "$workflow"; then
      passed=$((passed + 1))
    else
      failed=$((failed + 1))
    fi

    echo ""
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "   Total: $total"
echo "   ✅ Passed: $passed"
echo "   ❌ Failed: $failed"
echo ""

if [ $failed -eq 0 ]; then
  echo "✨ All workflows validated successfully!"
  exit 0
else
  echo "⚠️  Some workflows have validation errors"
  exit 1
fi
