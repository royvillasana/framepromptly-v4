#!/bin/bash

# Test the send-project-invitation function
echo "Testing send-project-invitation function..."

# Create a simple JWT token for testing (this will likely fail auth but give us the database error)
MOCK_JWT="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNjkzNTI2NDAwLCJpYXQiOjE2OTM0NDAwMDAsInN1YiI6InRlc3QtdXNlci1pZCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJhdXRoZW50aWNhdGVkIn0.fake-signature"

curl -X POST "https://drfaomantrtmtydbelxe.supabase.co/functions/v1/send-project-invitation" \
  -H "Authorization: $MOCK_JWT" \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyZmFvbWFudHJ0bXR5ZGJlbHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MDM1NjQsImV4cCI6MjA1MTA3OTU2NH0.e4MWyGsheLgGgJfGnUfTASkiLVyX7Y4avPGBUhTKy_Y" \
  -d '{
    "projectId": "test-project-id",
    "projectName": "Test Project", 
    "invitedEmail": "invite@example.com",
    "role": "viewer"
  }' \
  -v