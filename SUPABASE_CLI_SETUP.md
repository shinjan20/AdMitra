# Supabase CLI Setup Guide

Complete guide to install and configure Supabase CLI for managing your AdMitra project.

## Installation

### Option 1: Using npm (Recommended)

```bash
npm install -g supabase
```

### Option 2: Using Homebrew (macOS)

```bash
brew install supabase/tap/supabase
```

### Option 3: Using Docker

```bash
docker pull supabase/cli:latest
docker run --rm supabase --version
```

### Verify Installation

```bash
supabase --version
```

You should see output like: `supabase version 1.x.x`

## Login to Supabase

Link your CLI to your Supabase account:

```bash
supabase login
```

This will:
1. Open your browser
2. Ask you to authorize the CLI
3. Generate an access token
4. Save it locally for future use

## Link Your Project

Navigate to your AdMitra project directory:

```bash
cd /Users/shinjanpatra/AdMitra
```

Link to your Supabase project:

```bash
supabase link --project-ref dfzwkbxyahmjsmdreame
```

Replace `dfzwkbxyahmjsmdreame` with your actual Supabase project reference ID.

### Find Your Project Reference ID

1. Go to: https://supabase.com/dashboard
2. Select your AdMitra project
3. Go to: **Project Settings → General**
4. Look for **Project Reference ID** (e.g., `dfzwkbxyahmjsmdreame`)

## Verify Link

Check that your project is linked:

```bash
supabase projects list
```

You should see your AdMitra project listed.

## Set Environment Variables

Now you can set the Gemini API secrets:

```bash
supabase secrets set \
  GEMINI_API_KEY="your_api_key_here" \
  GEMINI_TEXT_MODEL="gemini-1.5-flash" \
  GEMINI_IMAGE_MODEL="gemini-1.5-flash-vision"
```

Or use the setup script we provided:

```bash
./scripts/setup-supabase-env.sh
```

## View Set Secrets

List all environment variables:

```bash
supabase secrets list
```

## Common CLI Commands

### Pull Configuration
```bash
supabase pull
```
Downloads schema, migrations, and functions from your project.

### Push Configuration
```bash
supabase push
```
Uploads schema and functions to your project.

### Deploy Edge Functions
```bash
supabase functions deploy
```

### View Edge Function Logs
```bash
supabase functions logs generate-ad
```

### Local Development
Start a local Supabase instance:
```bash
supabase start
```

Stop it:
```bash
supabase stop
```

## Troubleshooting

### "Command not found: supabase"

Make sure CLI is installed:
```bash
npm install -g supabase
```

Add npm to PATH if needed. Then restart your terminal.

### "Not logged in"

Login again:
```bash
supabase login
```

Or login with access token:
```bash
supabase login --token your_token_here
```

### "Project not linked"

Link your project:
```bash
supabase link --project-ref your_project_ref
```

### "Permission denied"

Make sure you have:
- Logged in with correct account
- Access to the project
- Correct project reference ID

Try:
```bash
supabase logout
supabase login
supabase link --project-ref your_project_ref
```

## Next Steps

After CLI is set up:

1. **Run the setup script**:
   ```bash
   ./scripts/setup-prod-env.sh
   ```
   Choose option 1 (Automated setup)

2. **Verify secrets were set**:
   ```bash
   supabase secrets list
   ```

3. **Deploy any changes**:
   ```bash
   supabase functions deploy
   ```

4. **Check logs**:
   ```bash
   supabase functions logs generate-ad --limit 20
   ```

## Project Configuration

Your Supabase project details:

- **Project URL**: https://dfzwkbxyahmjsmdreame.supabase.co
- **Project Reference**: dfzwkbxyahmjsmdreame
- **Dashboard**: https://supabase.com/dashboard

## Additional Resources

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Environment Variables Guide](https://supabase.com/docs/guides/functions/secrets)
- [Edge Functions](https://supabase.com/docs/guides/functions)

## Automation Scripts

We've created helper scripts to make this easier:

- **`./scripts/setup-prod-env.sh`** - Interactive setup with menu
- **`./scripts/setup-supabase-env.sh`** - Automated secret setting (requires CLI)
- **`./scripts/show-supabase-setup.sh`** - Manual setup instructions

Run any of these after CLI is installed!
