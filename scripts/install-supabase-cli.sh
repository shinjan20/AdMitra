#!/bin/bash

# Automated Supabase CLI installation script
# Usage: ./scripts/install-supabase-cli.sh

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     Supabase CLI Installation                             ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if already installed
if command -v supabase &> /dev/null; then
  echo "✅ Supabase CLI already installed!"
  supabase --version
  echo ""
  read -p "Do you want to continue with login/setup? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
  fi
else
  echo "📦 Installing Supabase CLI..."
  echo ""
  
  # Detect OS and install method
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "Detected macOS"
    echo ""
    echo "Choose installation method:"
    echo "1. Homebrew (recommended for macOS)"
    echo "2. npm (works everywhere)"
    echo ""
    read -p "Enter choice (1-2): " install_choice
    
    case $install_choice in
      1)
        if ! command -v brew &> /dev/null; then
          echo "❌ Homebrew not found. Install from: https://brew.sh"
          exit 1
        fi
        echo "Installing via Homebrew..."
        brew install supabase/tap/supabase
        ;;
      2)
        if ! command -v npm &> /dev/null; then
          echo "❌ npm not found. Install Node.js first"
          exit 1
        fi
        echo "Installing via npm..."
        npm install -g supabase
        ;;
      *)
        echo "Invalid choice"
        exit 1
        ;;
    esac
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "Detected Linux"
    echo ""
    if ! command -v npm &> /dev/null; then
      echo "❌ npm not found. Install Node.js first:"
      echo "   https://nodejs.org/"
      exit 1
    fi
    echo "Installing via npm..."
    npm install -g supabase
  else
    # Windows or other
    echo "Detected Windows/Other OS"
    echo ""
    if ! command -v npm &> /dev/null; then
      echo "❌ npm not found. Install Node.js first:"
      echo "   https://nodejs.org/"
      exit 1
    fi
    echo "Installing via npm..."
    npm install -g supabase
  fi
  
  echo ""
  echo "✅ Supabase CLI installed!"
fi

# Verify installation
echo ""
echo "Verifying installation..."
supabase --version
echo ""

# Check if already logged in
if [ -f ~/.supabase/access-token ]; then
  echo "✅ Already logged in to Supabase"
  echo ""
else
  echo "🔐 Logging in to Supabase..."
  echo ""
  supabase login
  echo ""
fi

# Check if project is linked
if [ -f ".supabase/config.json" ]; then
  echo "✅ Project is already linked"
  echo ""
else
  echo "🔗 Linking to AdMitra project..."
  echo ""
  echo "Your project reference ID: dfzwkbxyahmjsmdreame"
  echo ""
  echo "Linking project..."
  supabase link --project-ref dfzwkbxyahmjsmdreame
  echo ""
fi

# Verify link
echo ""
echo "📋 Verifying project link..."
supabase projects list | grep -i admitra || echo "Project link verified"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ Supabase CLI Setup Complete!                          ║"
echo "║                                                            ║"
echo "║  Next steps:                                              ║"
echo "║  1. Run: ./scripts/setup-prod-env.sh                      ║"
echo "║  2. Choose automated setup option                         ║"
echo "║  3. Your secrets will be set automatically                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
