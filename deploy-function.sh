#!/bin/bash

echo "🚀 Deploying accept-project-invitation Edge Function..."
echo ""

supabase functions deploy accept-project-invitation

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to deploy Edge Function"
    echo ""
    echo "If you see authentication errors, make sure you're logged in:"
    echo "  supabase login"
    echo ""
    echo "Then link your project:"
    echo "  supabase link --project-ref drfaomantrtmtydbelxe"
    echo ""
    exit 1
fi

echo ""
echo "✅ Edge Function deployed successfully!"
echo ""
echo "🎉 Your invitation system is now fully working!"
echo ""
echo "Test it by:"
echo "1. Sharing a project with someone"
echo "2. They'll receive an email with an invitation link"
echo "3. When they click the link, they can accept and access the project"
