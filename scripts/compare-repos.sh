#!/bin/bash
# compare-repos.sh — Compare our project with Maram's eco-tourism-platform-v2
# Usage: ./scripts/compare-repos.sh [path-to-maram-repo]

set -e

OUR_DIR="/home/himawari/workSpace/tourisme"
MARAM_DIR="${1:-/home/himawari/workSpace/maram/eco-tourism-platform-v2}"

if [ ! -d "$MARAM_DIR" ]; then
  echo "❌ Maram's repo not found at $MARAM_DIR"
  exit 1
fi

echo "═══════════════════════════════════════════════════════"
echo "  REPO COMPARISON: Us vs Maram"
echo "═══════════════════════════════════════════════════════"
echo ""

# ── Backend modules ──
echo "📦 BACKEND MODULES"
echo "──────────────────────────────────────────────────────"
OUR_MODULES=$(ls -d "$OUR_DIR/backend/src"/*/ 2>/dev/null | xargs -I{} basename {} | sort)
MARAM_MODULES=$(ls -d "$MARAM_DIR/eco-tourism-platform-backend/src"/*/ 2>/dev/null | xargs -I{} basename {} | sort)

echo "Only in OUR repo:"
comm -23 <(echo "$OUR_MODULES") <(echo "$MARAM_MODULES") | sed 's/^/  + /'
echo ""
echo "Only in MARAM's repo:"
comm -13 <(echo "$OUR_MODULES") <(echo "$MARAM_MODULES") | sed 's/^/  + /'
echo ""

# ── Backend entities ──
echo "📋 BACKEND ENTITIES"
echo "──────────────────────────────────────────────────────"
OUR_ENTITIES=$(find "$OUR_DIR/backend/src" -name "*.entity.ts" -exec basename {} \; | sort)
MARAM_ENTITIES=$(find "$MARAM_DIR/eco-tourism-platform-backend/src" -name "*.entity.ts" -exec basename {} \; | sort)

echo "Only in OUR repo:"
comm -23 <(echo "$OUR_ENTITIES") <(echo "$MARAM_ENTITIES") | sed 's/^/  + /'
echo ""
echo "Only in MARAM's repo:"
comm -13 <(echo "$OUR_ENTITIES") <(echo "$MARAM_ENTITIES") | sed 's/^/  + /'
echo ""

# ── Frontend pages ──
echo "🌐 FRONTEND PAGES"
echo "──────────────────────────────────────────────────────"
OUR_PAGES=$(find "$OUR_DIR/frontend/app" -name "page.tsx" | sed "s|$OUR_DIR/frontend||" | sort)
MARAM_PAGES=$(find "$MARAM_DIR/eco-tourism-platform-front/app" -name "page.tsx" | sed "s|$MARAM_DIR/eco-tourism-platform-front||" | sort)

echo "Only in OUR repo:"
comm -23 <(echo "$OUR_PAGES") <(echo "$MARAM_PAGES") | sed 's/^/  + /'
echo ""
echo "Only in MARAM's repo:"
comm -13 <(echo "$OUR_PAGES") <(echo "$MARAM_PAGES") | sed 's/^/  + /'
echo ""

# ── Docker services ──
echo "🐳 DOCKER SERVICES"
echo "──────────────────────────────────────────────────────"
echo "Our services:"
grep -E "^\s+\w+:$" "$OUR_DIR/docker-compose.yml" 2>/dev/null | sed 's/://;s/^/  /'
echo ""
echo "Maram's services:"
grep -E "^\s+\w+:$" "$MARAM_DIR/docker-compose.yml" 2>/dev/null | sed 's/://;s/^/  /'
echo ""

# ── Summary ──
echo "═══════════════════════════════════════════════════════"
echo "  SUMMARY"
echo "═══════════════════════════════════════════════════════"
OUR_MOD_COUNT=$(echo "$OUR_MODULES" | grep -c . || true)
MARAM_MOD_COUNT=$(echo "$MARAM_MODULES" | grep -c . || true)
OUR_ENT_COUNT=$(echo "$OUR_ENTITIES" | grep -c . || true)
MARAM_ENT_COUNT=$(echo "$MARAM_ENTITIES" | grep -c . || true)
OUR_PAGE_COUNT=$(echo "$OUR_PAGES" | grep -c . || true)
MARAM_PAGE_COUNT=$(echo "$MARAM_PAGES" | grep -c . || true)

echo "  Backend modules:    Us=$OUR_MOD_COUNT  Maram=$MARAM_MOD_COUNT"
echo "  Backend entities:   Us=$OUR_ENT_COUNT  Maram=$MARAM_ENT_COUNT"
echo "  Frontend pages:     Us=$OUR_PAGE_COUNT  Maram=$MARAM_PAGE_COUNT"
echo ""
echo "Done ✅"
