#!/bin/bash
# diff-repos.sh — Show actual code differences between our shared files and Maram's
# Usage: ./scripts/diff-repos.sh [path-to-maram-repo]

set -e

OUR_DIR="/home/himawari/workSpace/tourisme"
MARAM_DIR="${1:-/home/himawari/workSpace/maram/eco-tourism-platform-v2}"

if [ ! -d "$MARAM_DIR" ]; then
  echo "❌ Maram's repo not found at $MARAM_DIR"
  exit 1
fi

echo "═══════════════════════════════════════════════════════"
echo "  DIFF: Our Shared Files vs Maram"
echo "═══════════════════════════════════════════════════════"
echo ""

DIFF_COUNT=0
SAME_COUNT=0

# ── Backend shared modules ──
echo "📦 BACKEND MODULES (shared)"
echo "──────────────────────────────────────────────────────"
for module in admin auth circuit config database eco-traveler follow guide interactions mail messages offer organization place-contribution project-owner provider provider-activity publication questionnaire reports upload users; do
  OUR_MOD="$OUR_DIR/backend/src/$module"
  MARAM_MOD="$MARAM_DIR/eco-tourism-platform-backend/src/$module"
  
  if [ ! -d "$OUR_MOD" ] || [ ! -d "$MARAM_MOD" ]; then
    continue
  fi
  
  for file in $(find "$OUR_MOD" -name "*.ts" -type f | sort); do
    rel=${file#$OUR_DIR/backend/}
    maram_file="$MARAM_DIR/eco-tourism-platform-backend/$rel"
    
    if [ -f "$maram_file" ]; then
      if ! diff -q "$file" "$maram_file" >/dev/null 2>&1; then
        echo "  DIFF: $rel"
        diff --color=always -u "$maram_file" "$file" 2>/dev/null | head -30
        echo "  ..."
        echo ""
        DIFF_COUNT=$((DIFF_COUNT + 1))
      else
        SAME_COUNT=$((SAME_COUNT + 1))
      fi
    fi
  done
done

# ── Summary ──
echo "═══════════════════════════════════════════════════════"
echo "  SUMMARY"
echo "═══════════════════════════════════════════════════════"
echo "  Files identical: $SAME_COUNT"
echo "  Files different: $DIFF_COUNT"
echo ""
echo "Done ✅"
