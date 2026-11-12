#!/bin/bash

# Main setup script for production environment configuration
# Usage: ./scripts/setup-prod-env.sh

set -e

clear

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     AdMitra Production Environment Setup                  ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local not found in project root"
  echo ""
  echo "Please create .env.local first with:"
  echo "   VITE_SUPABASE_URL=your_supabase_url"
  echo "   VITE_SUPABASE_ANON_KEY=your_anon_key"
  echo "   GEMINI_API_KEY=your_gemini_api_key"
  echo "   GEMINI_TEXT_MODEL=gemini-1.5-flash"
  echo "   GEMINI_IMAGE_MODEL=gemini-1.5-flash-vision"
  echo ""
  exit 1
fi

echo "✅ .env.local found"
echo ""

# Show what will be set
echo "📋 Configuration to deploy:"
echo ""

GEMINI_API_KEY=$(grep "^GEMINI_API_KEY=" .env.local | cut -d'=' -f2)
GEMINI_TEXT_MODEL=$(grep "^GEMINI_TEXT_MODEL=" .env.local | cut -d'=' -f2 || echo "gemini-1.5-flash")
GEMINI_IMAGE_MODEL=$(grep "^GEMINI_IMAGE_MODEL=" .env.local | cut -d'=' -f2 || echo "gemini-1.5-flash-vision")

echo "   GEMINI_API_KEY:       ${GEMINI_API_KEY:0:25}..."
echo "   GEMINI_TEXT_MODEL:    $GEMINI_TEXT_MODEL"
echo "   GEMINI_IMAGE_MODEL:   $GEMINI_IMAGE_MODEL"
echo ""

# Ask user for preferred method
echo "Choose setup method:"
echo ""
echo "1️⃣  Automated setup (Supabase CLI)"
echo "2️⃣  Manual setup (Dashboard)"
echo "3️⃣  Show instructions only"
echo "4️⃣  Exit"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
  1)
    echo ""
    if ! command -v supabase &> /dev/null; then
      echo "❌ Supabase CLI not found. Install with:"
      echo "   npm install -g supabase"
      echo ""
      exit 1
    fi
    echo "🚀 Running automated setup..."
    ./scripts/setup-supabase-env.sh
    ;;
  2)
    echo ""
    ./scripts/show-supabase-setup.sh
    ;;
  3)
    echo ""
    ./scripts/show-supabase-setup.sh
    ;;
  4)
    echo "Exiting..."
    exit 0
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Setup Complete! Your app is ready for production.        ║"
echo "║                                                            ║"
echo "║  Next steps:                                              ║"
echo "║  1. Deploy your changes: git push                         ║"
echo "║  2. Wait for Supabase to sync env vars (1-2 minutes)      ║"
echo "║  3. Test ad generation in your production app             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
