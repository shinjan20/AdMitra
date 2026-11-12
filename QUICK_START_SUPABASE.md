# Quick Start: Supabase CLI Setup

Get Supabase CLI installed and configured in 3 steps.

## Step 1: Run the Install Script

```bash
./scripts/install-supabase-cli.sh
```

This will:
- ✅ Check if CLI is already installed
- 📦 Install it if needed (npm or Homebrew)
- 🔐 Log you in to Supabase
- 🔗 Link your AdMitra project
- ✨ Verify everything works

## Step 2: Verify Installation

Check that everything is set up:

```bash
supabase --version
supabase projects list
```

You should see your AdMitra project listed.

## Step 3: Set Environment Variables

Run the production setup script:

```bash
./scripts/setup-prod-env.sh
```

Choose option **1 (Automated setup)** and it will:
- 🔑 Set your Gemini API key
- 📝 Set text generation model
- 🖼️ Set image generation model

That's it! Your Supabase Edge Functions now have all the configuration they need.

---

## Verification

Verify that secrets were set:

```bash
supabase secrets list
```

You should see:
```
GEMINI_API_KEY        ****...
GEMINI_TEXT_MODEL     gemini-1.5-flash
GEMINI_IMAGE_MODEL    gemini-1.5-flash-vision
```

## What Just Happened

1. **Installed Supabase CLI** - Command-line tool to manage your Supabase project
2. **Logged in** - Connected CLI to your Supabase account
3. **Linked project** - Connected to your AdMitra project
4. **Set secrets** - Configured Gemini API keys for Edge Functions

## Next: Deploy and Test

Now your Edge Functions have the credentials they need. To verify:

1. **Check logs**:
   ```bash
   supabase functions logs generate-ad --limit 10
   ```

2. **Test in your app**:
   - Open http://localhost:5173 (or your deployment)
   - Try creating a new ad
   - Check if images generate successfully

3. **View errors if any**:
   ```bash
   supabase functions logs generate-ad --limit 20
   ```

## Troubleshooting

### "Command not found: supabase"
- Restart your terminal
- Make sure npm is in your PATH
- Reinstall: `npm install -g supabase`

### "Not logged in"
```bash
supabase login
```

### "Project not linked"
```bash
supabase link --project-ref dfzwkbxyahmjsmdreame
```

### Still having issues?
See full guide: [SUPABASE_CLI_SETUP.md](./SUPABASE_CLI_SETUP.md)

## One More Thing

Your `.env.local` already has these values configured for local development. The CLI commands sync these to Supabase so your production Edge Functions can use them.

✅ You're all set!
