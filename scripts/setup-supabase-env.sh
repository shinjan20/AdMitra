#!/bin/bash

# Script to set Supabase Edge Function environment variables for Gemini API
# Usage: ./scripts/setup-supabase-env.sh

set -e

echo "🔧 Supabase Edge Function Environment Setup"
echo "=============================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local not found in project root"
  echo "Please create .env.local with your Gemini API key"
  exit 1
fi

# Extract values from .env.local
GEMINI_API_KEY=$(grep "^GEMINI_API_KEY=" .env.local | cut -d'=' -f2)
GEMINI_TEXT_MODEL=$(grep "^GEMINI_TEXT_MODEL=" .env.local | cut -d'=' -f2)
GEMINI_IMAGE_MODEL=$(grep "^GEMINI_IMAGE_MODEL=" .env.local | cut -d'=' -f2)

if [ -z "$GEMINI_API_KEY" ]; then
  echo "❌ Error: GEMINI_API_KEY not found in .env.local"
  exit 1
fi

echo "📝 Values to set in Supabase:"
echo "   GEMINI_API_KEY: ${GEMINI_API_KEY:0:20}..."
echo "   GEMINI_TEXT_MODEL: ${GEMINI_TEXT_MODEL:-gemini-1.5-flash}"
echo "   GEMINI_IMAGE_MODEL: ${GEMINI_IMAGE_MODEL:-gemini-1.5-flash-vision}"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "⚠️  Supabase CLI not found. Please install it:"
  echo "   npm install -g supabase"
  echo ""
  echo "Or set these manually in your Supabase dashboard:"
  echo "   Project Settings → Edge Functions → Environment Variables"
  exit 1
fi

echo "🚀 Setting environment variables via Supabase CLI..."
echo ""

# Set environment variables
supabase secrets set \
  GEMINI_API_KEY="$GEMINI_API_KEY" \
  GEMINI_TEXT_MODEL="${GEMINI_TEXT_MODEL:-gemini-1.5-flash}" \
  GEMINI_IMAGE_MODEL="${GEMINI_IMAGE_MODEL:-gemini-1.5-flash-vision}"

echo ""
echo "✅ Environment variables set successfully!"
echo ""
echo "Note: Changes may take a few minutes to apply to Edge Functions."
echo "Visit your Supabase dashboard to verify they're set correctly:"
echo "   Project Settings → Edge Functions → Environment Variables"
