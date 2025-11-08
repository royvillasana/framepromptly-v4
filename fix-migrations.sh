#!/bin/bash

# Script to fix migration history mismatch between local and remote

echo "🔧 Fixing migration history..."
echo ""

# Step 1: Repair the migration history table to mark remote-only migrations as reverted
echo "Step 1: Repairing migration history table..."
supabase migration repair --status reverted 20250818105526 20250819015641 20250819123942

if [ $? -ne 0 ]; then
    echo "❌ Failed to repair migration history"
    exit 1
fi

echo "✅ Migration history repaired"
echo ""

# Step 2: Pull migrations from remote database to sync
echo "Step 2: Pulling migrations from remote database..."
supabase db pull

if [ $? -ne 0 ]; then
    echo "❌ Failed to pull migrations"
    exit 1
fi

echo "✅ Migrations pulled successfully"
echo ""

# Step 3: Push the new migration we created
echo "Step 3: Pushing new RLS policy migration..."
supabase db push

if [ $? -ne 0 ]; then
    echo "❌ Failed to push migrations"
    exit 1
fi

echo "✅ Migrations pushed successfully"
echo ""

# Step 4: Deploy the fixed Edge Function
echo "Step 4: Deploying accept-project-invitation Edge Function..."
supabase functions deploy accept-project-invitation

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy Edge Function"
    exit 1
fi

echo "✅ Edge Function deployed successfully"
echo ""
echo "🎉 All done! Your invitation system should now work correctly."
