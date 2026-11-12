#!/bin/bash

# Script to display Supabase environment setup instructions
# Usage: ./scripts/show-supabase-setup.sh

set -e

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  SUPABASE EDGE FUNCTION ENVIRONMENT SETUP"
echo "════════════════════════════════════════════════════════════"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local not found"
  exit 1
fi

# Extract values
GEMINI_API_KEY=$(grep "^GEMINI_API_KEY=" .env.local | cut -d'=' -f2)
GEMINI_TEXT_MODEL=$(grep "^GEMINI_TEXT_MODEL=" .env.local | cut -d'=' -f2 || echo "gemini-1.5-flash")
GEMINI_IMAGE_MODEL=$(grep "^GEMINI_IMAGE_MODEL=" .env.local | cut -d'=' -f2 || echo "gemini-1.5-flash-vision")

echo "📋 COPY THESE VALUES:"
echo ""
echo "Variable Name        | Value"
echo "─────────────────────┼──────────────────────────────────"
echo "GEMINI_API_KEY       | $GEMINI_API_KEY"
echo "GEMINI_TEXT_MODEL    | $GEMINI_TEXT_MODEL"
echo "GEMINI_IMAGE_MODEL   | $GEMINI_IMAGE_MODEL"
echo ""

echo "🌐 MANUAL SETUP STEPS:"
echo ""
echo "1. Go to: https://supabase.com/dashboard"
echo ""
echo "2. Select your project: AdMitra"
echo ""
echo "3. Navigate to: Project Settings → Edge Functions"
echo ""
echo "4. Click 'Add New Secret' and add these three variables:"
echo ""
echo "   First Secret:"
echo "   ├─ Name: GEMINI_API_KEY"
echo "   └─ Value: $GEMINI_API_KEY"
echo ""
echo "   Second Secret:"
echo "   ├─ Name: GEMINI_TEXT_MODEL"
echo "   └─ Value: $GEMINI_TEXT_MODEL"
echo ""
echo "   Third Secret:"
echo "   ├─ Name: GEMINI_IMAGE_MODEL"
echo "   └─ Value: $GEMINI_IMAGE_MODEL"
echo ""

echo "5. Click 'Save' after each entry"
echo ""
echo "6. Wait 1-2 minutes for changes to propagate"
echo ""
echo "7. Test by creating a new ad in your app"
echo ""

echo "✨ AUTOMATION ALTERNATIVE:"
echo ""
echo "If you have Supabase CLI installed, run:"
echo "   ./scripts/setup-supabase-env.sh"
echo ""

echo "════════════════════════════════════════════════════════════"
echo ""
