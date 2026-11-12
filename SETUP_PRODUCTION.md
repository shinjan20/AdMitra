# Production Environment Setup

This guide walks you through setting up your AdMitra production environment variables in Supabase.

## Quick Start

Run the main setup script:

```bash
./scripts/setup-prod-env.sh
```

This will guide you through:
1. Verifying your `.env.local` configuration
2. Choosing between automated or manual setup
3. Setting environment variables in Supabase

## What Gets Configured

The following environment variables are set for your Supabase Edge Functions:

- **GEMINI_API_KEY**: Your Google Gemini API key (for image and text generation)
- **GEMINI_TEXT_MODEL**: Model for ad text generation (defaults to `gemini-1.5-flash`)
- **GEMINI_IMAGE_MODEL**: Model for ad image generation (defaults to `gemini-1.5-flash-vision`)

## Setup Methods

### Option 1: Automated Setup (Recommended)

Requires Supabase CLI installed:

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Run automated setup
./scripts/setup-supabase-env.sh
```

### Option 2: Manual Dashboard Setup

Show setup instructions with your values:

```bash
./scripts/show-supabase-setup.sh
```

Then manually enter the values in your Supabase dashboard:
1. Go to your project → Project Settings → Edge Functions
2. Click "Add New Secret" for each variable
3. Paste the values from the script output

### Option 3: Supabase Dashboard Direct

Go directly to: `https://supabase.com/dashboard`

1. Select your project
2. Navigate to: **Project Settings → Edge Functions**
3. Add these environment variables:
   - `GEMINI_API_KEY`: Your API key from `.env.local`
   - `GEMINI_TEXT_MODEL`: `gemini-1.5-flash`
   - `GEMINI_IMAGE_MODEL`: `gemini-1.5-flash-vision`

## Verification

After setup, verify by:

1. Wait 1-2 minutes for changes to propagate
2. Check your Supabase dashboard to confirm variables are set
3. Try generating an ad in your app
4. Check browser console for errors
5. Check Supabase Edge Function logs if issues persist

## Troubleshooting

### "Supabase CLI not found"
Install it with: `npm install -g supabase`

### Variables not appearing in dashboard
- Wait 1-2 minutes for changes to sync
- Refresh the page
- Try setting again

### Image generation still failing after setup
- Verify variables are set correctly in dashboard
- Check Edge Function logs in Supabase dashboard
- Ensure your Gemini API key is valid
- Verify models exist: `gemini-1.5-flash` and `gemini-1.5-flash-vision`

### "Origin not allowed" errors
Make sure your app origin is configured in the Edge Function:
- Local development: `http://localhost:5173` or `http://localhost:3000`
- Production: Your deployed domain

## Environment Variable Details

### GEMINI_API_KEY
- **Required**: Yes
- **Type**: Secret (server-only)
- **Source**: Google AI Studio
- **Used by**: Text and image generation Edge Functions

### GEMINI_TEXT_MODEL
- **Required**: No (defaults to `gemini-1.5-flash`)
- **Type**: Model identifier
- **Options**: `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash`
- **Used by**: Ad copy generation

### GEMINI_IMAGE_MODEL
- **Required**: No (defaults to `gemini-1.5-flash-vision`)
- **Type**: Model identifier
- **Options**: `gemini-1.5-flash-vision`, `gemini-1.5-pro-vision`
- **Used by**: Ad image generation

## For Development

To test locally with Edge Functions:

1. Set variables in `.env.local` (already done)
2. Run Supabase local instance:
   ```bash
   supabase start
   ```
3. Set local env vars for Edge Functions
4. Test in development

## Security Notes

⚠️ **NEVER**:
- Commit `.env.local` to git (already in `.gitignore`)
- Share your `GEMINI_API_KEY` publicly
- Expose private keys in client-side code

✅ **DO**:
- Store keys only in `.env.local` locally
- Use Supabase secrets for server-side variables
- Use public keys only in frontend code (already following this pattern)

## Support

If you encounter issues:

1. Check Supabase Edge Function logs: Project → Edge Functions → Logs
2. Check browser console for API errors
3. Verify all three environment variables are set
4. Try re-running the setup script
5. Check that model names are current (they may change)

## Related Files

- `.env.local` - Local environment variables
- `supabase/functions/generate-ad/index.ts` - Edge Function that uses these vars
- `src/services/adImage.ts` - Client service for image generation
- `src/services/aiGeneration.ts` - Client service for AI generation
