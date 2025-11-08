#!/bin/bash

# Script to repair migration history and sync local with remote

echo "🔧 Repairing migration history..."
echo ""

# Mark all local migrations as applied in remote database
echo "Marking all local migrations as applied..."

supabase migration repair --status applied 20240101000000
supabase migration repair --status applied 20240828000003
supabase migration repair --status applied 20250108000000
supabase migration repair --status applied 20250112000000
supabase migration repair --status applied 20250113000000
supabase migration repair --status applied 20250818225527
supabase migration repair --status applied 20250819003944
supabase migration repair --status applied 20250819015642
supabase migration repair --status applied 20250824201445
supabase migration repair --status applied 20250828000000
supabase migration repair --status applied 20250830120000
supabase migration repair --status applied 20250830120001
supabase migration repair --status applied 20250831120000
supabase migration repair --status applied 20250906120000
supabase migration repair --status applied 20251101000000
supabase migration repair --status applied 20251101000001
supabase migration repair --status applied 20251101000002
supabase migration repair --status applied 20251101000003

echo ""
echo "✅ Migration history repaired"
echo ""

# Now push the new migration with --include-all flag
echo "Pushing new RLS policy migration..."
supabase db push --include-all

if [ $? -ne 0 ]; then
    echo "❌ Failed to push migrations"
    exit 1
fi

echo "✅ Migrations pushed successfully"
echo ""

# Deploy the fixed Edge Function
echo "Deploying accept-project-invitation Edge Function..."
supabase functions deploy accept-project-invitation

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy Edge Function"
    exit 1
fi

echo "✅ Edge Function deployed successfully"
echo ""
echo "🎉 All done! Your invitation system should now work correctly."
