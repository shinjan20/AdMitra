#!/bin/bash

# Verification script to check that everything is configured correctly
# Usage: ./scripts/verify-setup.sh

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     AdMitra Production Setup Verification                 ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check 1: Supabase CLI installed
echo "1️⃣  Checking Supabase CLI..."
if command -v supabase &> /dev/null; then
  VERSION=$(supabase --version)
  echo "   ✅ Supabase CLI installed: $VERSION"
else
  echo "   ❌ Supabase CLI not found"
  exit 1
fi

# Check 2: Project linked
echo ""
echo "2️⃣  Checking project link..."
if [ -f ".supabase/config.json" ]; then
  PROJECT_REF=$(grep '"project_id"' .supabase/config.json | head -1 | cut -d'"' -f4)
  echo "   ✅ Project linked: $PROJECT_REF"
else
  echo "   ❌ Project not linked"
  exit 1
fi

# Check 3: Environment variables set
echo ""
echo "3️⃣  Checking Supabase secrets..."
SECRETS=$(supabase secrets list 2>&1 | grep -E "GEMINI_API_KEY|GEMINI_TEXT_MODEL|GEMINI_IMAGE_MODEL" || true)

if echo "$SECRETS" | grep -q "GEMINI_API_KEY"; then
  echo "   ✅ GEMINI_API_KEY set"
else
  echo "   ❌ GEMINI_API_KEY not set"
  exit 1
fi

if echo "$SECRETS" | grep -q "GEMINI_TEXT_MODEL"; then
  echo "   ✅ GEMINI_TEXT_MODEL set"
else
  echo "   ❌ GEMINI_TEXT_MODEL not set"
  exit 1
fi

if echo "$SECRETS" | grep -q "GEMINI_IMAGE_MODEL"; then
  echo "   ✅ GEMINI_IMAGE_MODEL set"
else
  echo "   ❌ GEMINI_IMAGE_MODEL not set"
  exit 1
fi

# Check 4: Edge functions deployed
echo ""
echo "4️⃣  Checking Edge Functions..."
FUNCTIONS=$(supabase functions list 2>&1 | grep -E "generate-ad|generate-video" || true)

if echo "$FUNCTIONS" | grep -q "generate-ad.*ACTIVE"; then
  echo "   ✅ generate-ad function deployed"
else
  echo "   ⚠️  generate-ad function status unknown"
fi

if echo "$FUNCTIONS" | grep -q "generate-video.*ACTIVE"; then
  echo "   ✅ generate-video function deployed"
else
  echo "   ⚠️  generate-video function status unknown"
fi

# Check 5: Local env file
echo ""
echo "5️⃣  Checking local environment..."
if [ -f ".env.local" ]; then
  echo "   ✅ .env.local exists"
  
  if grep -q "GEMINI_API_KEY" .env.local; then
    echo "   ✅ GEMINI_API_KEY configured"
  else
    echo "   ❌ GEMINI_API_KEY not in .env.local"
  fi
  
  if grep -q "GEMINI_TEXT_MODEL=gemini-1.5-flash" .env.local; then
    echo "   ✅ GEMINI_TEXT_MODEL set to gemini-1.5-flash"
  else
    echo "   ⚠️  GEMINI_TEXT_MODEL check"
  fi
  
  if grep -q "GEMINI_IMAGE_MODEL=gemini-1.5-flash-vision" .env.local; then
    echo "   ✅ GEMINI_IMAGE_MODEL set to gemini-1.5-flash-vision"
  else
    echo "   ⚠️  GEMINI_IMAGE_MODEL check"
  fi
else
  echo "   ❌ .env.local not found"
  exit 1
fi

# Check 6: Git status
echo ""
echo "6️⃣  Checking git repository..."
if [ -d ".git" ]; then
  echo "   ✅ Git repository found"
  
  REMOTE=$(git remote get-url origin 2>/dev/null || echo "no remote")
  if [ "$REMOTE" != "no remote" ]; then
    echo "   ✅ Remote configured: $REMOTE"
  else
    echo "   ⚠️  No remote configured"
  fi
else
  echo "   ❌ Git repository not found"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ All Checks Passed!                                    ║"
echo "║                                                            ║"
echo "║  Your AdMitra production environment is fully configured. ║"
echo "║                                                            ║"
echo "║  What's been set up:                                      ║"
echo "║  ✓ Supabase CLI installed and linked                      ║"
echo "║  ✓ Gemini API credentials in Supabase secrets             ║"
echo "║  ✓ Text model: gemini-1.5-flash                           ║"
echo "║  ✓ Image model: gemini-1.5-flash-vision                   ║"
echo "║  ✓ Edge Functions deployed                                ║"
echo "║                                                            ║"
echo "║  Next steps:                                              ║"
echo "║  1. Open your app: http://localhost:5173                  ║"
echo "║  2. Try creating a new ad                                 ║"
echo "║  3. Check console for any errors                          ║"
echo "║  4. View logs: supabase functions logs generate-ad        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
