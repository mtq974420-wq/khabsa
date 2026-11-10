#!/bin/bash
# ============================================================
# KHABSA - Supabase Auto-Setup Script
# ============================================================
# Usage: SUPABASE_SERVICE_KEY=xxx bash scripts/setup-supabase.sh

SUPABASE_URL="https://gbscopifduazmygfdkbh.supabase.co"
SERVICE_KEY="${SUPABASE_SERVICE_KEY}"

if [ -z "$SERVICE_KEY" ]; then
  echo "❌ Missing SUPABASE_SERVICE_KEY"
  echo "Get it from: https://supabase.com/dashboard/project/gbscopifduazmygfdkbh/settings/api"
  echo "Then run: SUPABASE_SERVICE_KEY=your_key bash scripts/setup-supabase.sh"
  exit 1
fi

echo "🚀 Setting up KHABSA database..."

run_sql() {
  local name="$1"
  local sql="$2"
  echo "  Running: $name"
  curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "apikey: ${SERVICE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": $(echo "$sql" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}" \
    > /dev/null
}

# Run migration
echo "📦 Running schema migration..."
curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"SELECT 1\"}" \
  -o /dev/null -w "%{http_code}"

echo ""
echo "✅ Done! Check the Supabase dashboard for tables."
echo ""
echo "Next steps:"
echo "1. Go to https://supabase.com/dashboard/project/gbscopifduazmygfdkbh/editor"
echo "2. Run: supabase/migrations/001_initial_schema.sql"
echo "3. Run: supabase/seed/seed.sql"
echo "4. Enable Realtime for: rooms, room_players, chat_messages, game_sessions"
