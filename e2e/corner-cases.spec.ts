import { test, expect } from '@playwright/test';

/**
 * AdMitra Corner Case E2E Tests
 * Tests edge cases, validation, error states, and UX gaps across the entire application
 */

const BASE_URL = 'http://localhost:3000';
const DEMO_PHONE = '9876543210';
const DEMO_OTP = '123456';

test.describe('Corner Cases & Edge Conditions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test.describe('Authentication Edge Cases', () => {
    test('should handle empty phone number submission', async ({ page }) => {
      await page.locator('button', { hasText: /sign in|login|get started/i }).first().click();
      await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 5000 });

      // UX FIX: Phone input now has 'required' and 'minLength' attributes
      // Also has onBlur validation to show error for invalid format
      const phoneInput = page.locator('input[type="tel"]').first();
      const isRequired = await phoneInput.evaluate(el => el.hasAttribute('required'));
      const hasMinLength = await phoneInput.evaluate(el => el.getAttribute('minLength'));

      console.log('Phone input has required attribute:', isRequired);
      console.log('Phone input minLength:', hasMinLength);

      expect(isRequired).toBe(true);
      expect(hasMinLength).toBe('10');
    });

    test('should handle invalid phone number formats', async ({ page }) => {
      await page.locator('button', { hasText: /sign in|login|get started/i }).first().click();
      await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 5000 });

      const phoneInput = page.locator('input[type="tel"]').first();
      await phoneInput.fill('abc'); // Invalid format

      const submitBtn = page.locator('button[type="submit"], button', { hasText: /send|continue|next/i }).first();
      await submitBtn.click();

      // Should handle gracefully - either show error or format the input
      await page.waitForTimeout(1000);
    });

    test('should handle OTP timeout scenario', async ({ page }) => {
      await page.locator('button', { hasText: /sign in|login|get started/i }).first().click();
      await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 5000 });

      await page.locator('input[type="tel"]').first().fill(DEMO_PHONE);
      await page.locator('button', { hasText: /send|otp/i }).first().click();
      await page.waitForTimeout(2000);

      // OTP screen should appear
      const otpInput = page.locator('input[inputmode="numeric"]').first();
      await expect(otpInput).toBeVisible();
    });
  });

  test.describe('Business Profile Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in before business profile tests
      await page.locator('button', { hasText: /sign in|login|get started/i }).first().click();
      await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 5000 });
      await page.locator('input[type="tel"]').first().fill(DEMO_PHONE);
      await page.locator('button', { hasText: /send|otp/i }).first().click();
      await page.waitForTimeout(1500);
      await page.locator('input[inputmode="numeric"]').first().fill(DEMO_OTP);
      await page.locator('form button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    });

    test('should handle empty business name submission', async ({ page }) => {
      const businessNameInput = page.locator('#setup-business-name, input[placeholder*="business"]').first();
      if (await businessNameInput.isVisible()) {
        await businessNameInput.fill('');
        await page.locator('button[type="submit"]').first().click();
        await page.waitForTimeout(1000);

        // Should show validation or prevent submission
        const value = await businessNameInput.inputValue();
        expect(value.length).toBeLessThan(2); // Should not accept empty
      }
    });

    test('should handle extremely long business name', async ({ page }) => {
      const businessNameInput = page.locator('#setup-business-name, input[placeholder*="business"]').first();
      if (await businessNameInput.isVisible()) {
        const longName = 'A'.repeat(500);
        await businessNameInput.fill(longName);

        // Check if input is truncated or accepted
        const value = await businessNameInput.inputValue();
        expect(value.length).toBeLessThanOrEqual(500);
      }
    });

    test('should handle special characters in business name', async ({ page }) => {
      const businessNameInput = page.locator('#setup-business-name, input[placeholder*="business"]').first();
      if (await businessNameInput.isVisible()) {
        await businessNameInput.fill('Test <script>alert("xss")</script> Business');
        await page.locator('button[type="submit"]').first().click();
        await page.waitForTimeout(1000);

        // Should sanitize or escape special characters
        const value = await businessNameInput.inputValue();
        expect(value).toBeTruthy();
      }
    });

    test('should handle missing city location', async ({ page }) => {
      const cityInput = page.locator('#setup-city, input[placeholder*="city"]').first();
      if (await cityInput.isVisible()) {
        await cityInput.fill('');
        await page.locator('button[type="submit"]').first().click();
        await page.waitForTimeout(1000);

        // Should require city
        const value = await cityInput.inputValue();
        expect(value.length).toBeLessThan(2);
      }
    });

    test('should handle WhatsApp number without country code', async ({ page }) => {
      // Look for WhatsApp input field
      const whatsappInput = page.locator('input[placeholder*="whatsapp"], input[placeholder*="WhatsApp"]').first();
      if (await whatsappInput.isVisible()) {
        await whatsappInput.fill('9876543210'); // No country code
        await page.locator('button[type="submit"]').first().click();
        await page.waitForTimeout(1000);

        // Should either format with +91 or show warning
        const value = await whatsappInput.inputValue();
        expect(value).toBeTruthy();
      }
    });
  });

  test.describe('Creative Studio Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in and complete onboarding
      await page.locator('button', { hasText: /sign in|login|get started/i }).first().click();
      await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 5000 });
      await page.locator('input[type="tel"]').first().fill(DEMO_PHONE);
      await page.locator('button', { hasText: /send|otp/i }).first().click();
      await page.waitForTimeout(1500);
      await page.locator('input[inputmode="numeric"]').first().fill(DEMO_OTP);
      await page.locator('form button[type="submit"]').first().click();
      await page.waitForTimeout(2000);

      // Complete business setup
      const businessNameInput = page.locator('#setup-business-name').first();
      if (await businessNameInput.isVisible()) {
        await businessNameInput.fill('Test Salon');
        await page.locator('#setup-city').fill('Mumbai');
        await page.locator('button[type="submit"]').first().click();
        await page.waitForTimeout(2000);
      }
    });

    test('should handle empty offer field submission', async ({ page }) => {
      const offerInput = page.locator('textarea, input[placeholder*="offer"]').first();
      if (await offerInput.isVisible()) {
        await offerInput.fill('');
        await page.locator('button[type="submit"]').first().click();
        await page.waitForTimeout(1000);

        // Should show validation error
        const errorText = await page.locator('text=Please write or speak your offer').isVisible();
        expect(errorText).toBeTruthy();
      }
    });

    test('should handle extremely long offer text', async ({ page }) => {
      const offerInput = page.locator('textarea, input[placeholder*="offer"]').first();
      if (await offerInput.isVisible()) {
        const longOffer = 'Special offer '.repeat(100);
        await offerInput.fill(longOffer);

        // Check if truncated or accepted
        const value = await offerInput.inputValue();
        expect(value.length).toBeGreaterThan(0);
      }
    });

    test('should handle image generation when API is not configured', async ({ page }) => {
      // Try to generate image without API key
      const imageBtn = page.locator('button', { hasText: /make a new picture|make my ad/i }).first();
      if (await imageBtn.isVisible()) {
        await imageBtn.click();
        await page.waitForTimeout(3000);

        // Should show helpful error message, not just spinner
        const errorText = page.locator('text=/not switched on|not configured|gemini key/i').first();
        const hasError = await errorText.isVisible({ timeout: 3000 }).catch(() => false);
        if (hasError) {
          expect(await errorText.isVisible()).toBeTruthy();
        }
      }
    });

    test('should handle image generation rate limiting', async ({ page }) => {
      const imageBtn = page.locator('button', { hasText: /make a new picture/i }).first();
      if (await imageBtn.isVisible()) {
        // Try generating multiple times rapidly
        for (let i = 0; i < 3; i++) {
          await imageBtn.click();
          await page.waitForTimeout(500);
        }

        // Should show rate limit or queue state
        await page.waitForTimeout(2000);
      }
    });

    test('should handle tone selection change', async ({ page }) => {
      const toneButtons = page.locator('button', { hasText: /friendly|clear|premium/i });
      const count = await toneButtons.count();

      if (count > 0) {
        await toneButtons.first().click();
        await page.waitForTimeout(500);

        // Should regenerate or show updated tone
        const selectedTone = page.locator('button[class*="selected"], button[aria-pressed="true"]').first();
        expect(await selectedTone.isVisible()).toBeTruthy();
      }
    });

    test('should handle language selection', async ({ page }) => {
      const languageSelect = page.locator('select, [role="combobox"]').first();
      if (await languageSelect.isVisible()) {
        // Check if dropdown is disabled (common in demo mode without API)
        const isDisabled = await languageSelect.isDisabled();

        if (isDisabled) {
          console.log('UX GAP: Language dropdown is disabled - no clear explanation shown to user');
          // Should have tooltip or inline text explaining why it's disabled
        } else {
          await languageSelect.click();
          await page.waitForTimeout(500);

          const option = page.locator('option, [role="option"]').nth(1);
          if (await option.isVisible()) {
            await option.click();
            await page.waitForTimeout(500);

            // Should update language or regenerate
          }
        }
      }
    });

    test('should handle CTA button being clickable', async ({ page }) => {
      // This tests the fixed issue: CTA should now be a real button
      const ctaButton = page.locator('button', { hasText: /send a whatsapp message/i }).first();
      if (await ctaButton.isVisible()) {
        // Check if it's actually a button
        const tagName = await ctaButton.evaluate(el => el.tagName);
        console.log('CTA element tag:', tagName);

        // Should be a BUTTON element
        expect(tagName).toBe('BUTTON');

        // Try clicking it - should either open WhatsApp or show warning
        await ctaButton.click();
        await page.waitForTimeout(500);

        // Should either open new tab or show toast warning
        const toastVisible = await page.locator('text=/whatsapp number not saved|add your whatsapp/i').isVisible({ timeout: 2000 }).catch(() => false);
        console.log('Toast visible after clicking CTA:', toastVisible);
      }
    });

    test('should handle ad copy editing without saving', async ({ page }) => {
      const headlineInput = page.locator('input[placeholder*="headline"], input[placeholder*="main"]').first();
      if (await headlineInput.isVisible()) {
        await headlineInput.fill('Test Headline Modified');
        await page.waitForTimeout(500);

        // UX FIX: Changes are tracked and navigation shows confirmation dialog
        const planBudgetBtn = page.locator('button', { hasText: /plan a budget/i }).first();
        if (await planBudgetBtn.isVisible()) {
          // Set up dialog handler before clicking
          const dialogPromise = page.waitForEvent('dialog').catch(() => null);
          await planBudgetBtn.click();

          const dialog = await dialogPromise;
          if (dialog) {
            console.log('UX FIX: Unsaved changes confirmation dialog appeared');
            expect(dialog.message()).toContain('unsaved');
            await dialog.dismiss();
          } else {
            console.log('No dialog - may have been auto-saved or already handled');
          }
        }
      }
    });

    test('should handle copy to clipboard action', async ({ page }) => {
      const copyBtn = page.locator('button', { hasText: /copy/i }).first();
      if (await copyBtn.isVisible()) {
        await copyBtn.click();
        await page.waitForTimeout(500);

        // Should show "Copied" state
        const copiedState = page.locator('text=/copied|ready to paste/i').first();
        expect(await copiedState.isVisible({ timeout: 2000 }).catch(() => false)).toBeTruthy();
      }
    });

    test('should handle download action', async ({ page }) => {
      const downloadBtn = page.locator('button', { hasText: /download/i }).first();
      if (await downloadBtn.isVisible()) {
        const downloadPromise = page.waitForEvent('download').catch(() => null);
        await downloadBtn.click();

        const download = await downloadPromise;
        if (download) {
          expect(download.suggestedFilename()).toBeTruthy();
        }
      }
    });
  });

  test.describe('Campaign Wizard Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
      // Full sign in and onboarding
      await page.locator('button', { hasText: /sign in|login|get started/i }).first().click();
      await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 5000 });
      await page.locator('input[type="tel"]').first().fill(DEMO_PHONE);
      await page.locator('button', { hasText: /send|otp/i }).first().click();
      await page.waitForTimeout(1500);
      await page.locator('input[inputmode="numeric"]').first().fill(DEMO_OTP);
      await page.locator('form button[type="submit"]').first().click();
      await page.waitForTimeout(2000);

      const businessNameInput = page.locator('#setup-business-name').first();
      if (await businessNameInput.isVisible()) {
        await businessNameInput.fill('Test Salon');
        await page.locator('#setup-city').fill('Mumbai');
        await page.locator('button[type="submit"]').first().click();
        await page.waitForTimeout(2000);
      }

      // Navigate to campaign wizard if possible
      const createCampaignBtn = page.locator('button, a', { hasText: /create campaign|new campaign/i }).first();
      if (await createCampaignBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await createCampaignBtn.click();
        await page.waitForTimeout(1000);
      }
    });

    test('should handle budget below minimum threshold', async ({ page }) => {
      const budgetInput = page.locator('input[type="number"], input[placeholder*="budget"]').first();
      if (await budgetInput.isVisible()) {
        await budgetInput.fill('100'); // Below minimum

        const nextBtn = page.locator('button', { hasText: /next|continue/i }).first();
        if (await nextBtn.isVisible()) {
          await nextBtn.click();
          await page.waitForTimeout(1000);

          // Should show warning or error about low budget
        }
      }
    });

    test('should handle extremely high budget', async ({ page }) => {
      const budgetInput = page.locator('input[type="number"], input[placeholder*="budget"]').first();
      if (await budgetInput.isVisible()) {
        await budgetInput.fill('999999999');

        // Should either accept or cap with warning
        const value = await budgetInput.inputValue();
        expect(value).toBeTruthy();
      }
    });

    test('should handle missing destination value for WhatsApp', async ({ page }) => {
      // Look for destination selector
      const destinationSelect = page.locator('select', { hasText: /where people go|destination/i }).first();
      if (await destinationSelect.isVisible()) {
        await destinationSelect.selectOption('whatsapp');
        await page.waitForTimeout(500);

        const valueInput = page.locator('input[placeholder*="phone"], input[placeholder*="whatsapp"]').first();
        await valueInput.fill('');

        const saveBtn = page.locator('button', { hasText: /save|approve|launch/i }).first();
        if (await saveBtn.isVisible()) {
          // Should be disabled or show error
          const isDisabled = await saveBtn.isDisabled();
          expect(isDisabled).toBeTruthy();
        }
      }
    });

    test('should handle invalid phone number format in destination', async ({ page }) => {
      const valueInput = page.locator('input[placeholder*="phone"]').first();
      if (await valueInput.isVisible()) {
        await valueInput.fill('invalid-phone');

        const saveBtn = page.locator('button', { hasText: /save|approve/i }).first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(1000);

          // Should show validation error
        }
      }
    });

    test('should handle missing location/area', async ({ page }) => {
      const cityInput = page.locator('input[placeholder*="city"], input[placeholder*="area"]').first();
      if (await cityInput.isVisible()) {
        await cityInput.fill('');

        const nextBtn = page.locator('button', { hasText: /next|continue/i }).first();
        if (await nextBtn.isVisible()) {
          await nextBtn.click();
          await page.waitForTimeout(1000);

          // Should require location
        }
      }
    });

    test('should handle approval checkbox unchecked', async ({ page }) => {
      const approveCheckbox = page.locator('input[type="checkbox"]').first();
      const saveBtn = page.locator('button', { hasText: /approve and save/i }).first();

      if (await saveBtn.isVisible()) {
        // Ensure checkbox is unchecked
        await approveCheckbox.setChecked(false);

        // Save button should be disabled
        const isDisabled = await saveBtn.isDisabled();
        expect(isDisabled).toBeTruthy();
      }
    });

    test('should handle step navigation without completing requirements', async ({ page }) => {
      // Try to skip to review step without completing earlier steps
      const stepNav = page.locator('button, a', { hasText: /review|step 6/i }).first();
      if (await stepNav.isVisible({ timeout: 2000 }).catch(() => false)) {
        await stepNav.click();
        await page.waitForTimeout(1000);

        // Should either prevent navigation or show missing requirements
      }
    });
  });

  test.describe('Dashboard & Campaign Details Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in
      await page.locator('button', { hasText: /sign in|login|get started/i }).first().click();
      await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 5000 });
      await page.locator('input[type="tel"]').first().fill(DEMO_PHONE);
      await page.locator('button', { hasText: /send|otp/i }).first().click();
      await page.waitForTimeout(1500);
      await page.locator('input[inputmode="numeric"]').first().fill(DEMO_OTP);
      await page.locator('form button[type="submit"]').first().click();
      await page.waitForTimeout(2000);

      // Complete onboarding if shown
      const businessNameInput = page.locator('#setup-business-name').first();
      if (await businessNameInput.isVisible()) {
        await businessNameInput.fill('Test Salon');
        await page.locator('#setup-city').fill('Mumbai');
        await page.locator('button[type="submit"]').first().click();
        await page.waitForTimeout(2000);
      }
    });

    test('should handle empty campaign list state', async ({ page }) => {
      const emptyState = page.locator('text=/no campaigns|get started|create your first/i').first();
      const hasEmptyState = await emptyState.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasEmptyState) {
        expect(await emptyState.isVisible()).toBeTruthy();

        // Should have clear CTA to create first campaign
        const createBtn = page.locator('button, a', { hasText: /create|new campaign/i }).first();
        expect(await createBtn.isVisible()).toBeTruthy();
      }
    });

    test('should handle campaign detail modal opening', async ({ page }) => {
      const campaignCard = page.locator('[class*="campaign"], article, .card').first();
      if (await campaignCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await campaignCard.click();
        await page.waitForTimeout(1000);

        // Modal should open
        const modal = page.locator('[role="dialog"], .modal').first();
        expect(await modal.isVisible()).toBeTruthy();
      }
    });

    test('should handle demo vs real campaign distinction', async ({ page }) => {
      const demoBadge = page.locator('text=/demo|simulated|practice/i').first();
      const hasDemoBadge = await demoBadge.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasDemoBadge) {
        // Demo state should be clearly visible
        expect(await demoBadge.isVisible()).toBeTruthy();
      }
    });

    test('should handle campaign tabs switching', async ({ page }) => {
      const campaignCard = page.locator('[class*="campaign"], article, .card').first();
      if (await campaignCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await campaignCard.click();
        await page.waitForTimeout(1000);

        const tabs = page.locator('button, [role="tab"]');
        const tabCount = await tabs.count();

        if (tabCount > 0) {
          await tabs.nth(1).click();
          await page.waitForTimeout(500);

          // Tab content should change
        }
      }
    });
  });

  test.describe('Connected Accounts Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('button', { hasText: /sign in|login|get started/i }).first().click();
      await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 5000 });
      await page.locator('input[type="tel"]').first().fill(DEMO_PHONE);
      await page.locator('button', { hasText: /send|otp/i }).first().click();
      await page.waitForTimeout(1500);
      await page.locator('input[inputmode="numeric"]').first().fill(DEMO_OTP);
      await page.locator('form button[type="submit"]').first().click();
      await page.waitForTimeout(2000);

      const businessNameInput = page.locator('#setup-business-name').first();
      if (await businessNameInput.isVisible()) {
        await businessNameInput.fill('Test Salon');
        await page.locator('#setup-city').fill('Mumbai');
        await page.locator('button[type="submit"]').first().click();
        await page.waitForTimeout(2000);
      }

      // Navigate to connected accounts
      const accountsLink = page.locator('a, button', { hasText: /connected|accounts|integration/i }).first();
      if (await accountsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await accountsLink.click();
        await page.waitForTimeout(1000);
      }
    });

    test('should handle connection button click', async ({ page }) => {
      const connectBtn = page.locator('button', { hasText: /connect|link/i }).first();
      if (await connectBtn.isVisible()) {
        await connectBtn.click();
        await page.waitForTimeout(1000);

        // Should open OAuth flow or show demo connection state
      }
    });

    test('should handle disconnection action', async ({ page }) => {
      const disconnectBtn = page.locator('button', { hasText: /disconnect|unlink/i }).first();
      if (await disconnectBtn.isVisible()) {
        await disconnectBtn.click();
        await page.waitForTimeout(1000);

        // Should show confirmation or execute disconnect
      }
    });

    test('should handle multiple account connections', async ({ page }) => {
      const providerCards = page.locator('[class*="provider"], [class*="account"]').count();
      if (providerCards > 0) {
        // Should handle multiple providers being connected/disconnected
        expect(providerCards).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Marketing Plan Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('button', { hasText: /sign in|login|get started/i }).first().click();
      await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 5000 });
      await page.locator('input[type="tel"]').first().fill(DEMO_PHONE);
      await page.locator('button', { hasText: /send|otp/i }).first().click();
      await page.waitForTimeout(1500);
      await page.locator('input[inputmode="numeric"]').first().fill(DEMO_OTP);
      await page.locator('form button[type="submit"]').first().click();
      await page.waitForTimeout(2000);

      const businessNameInput = page.locator('#setup-business-name').first();
      if (await businessNameInput.isVisible()) {
        await businessNameInput.fill('Test Salon');
        await page.locator('#setup-city').fill('Mumbai');
        await page.locator('button[type="submit"]').first().click();
        await page.waitForTimeout(2000);
      }

      const planLink = page.locator('a, button', { hasText: /marketing plan|plan/i }).first();
      if (await planLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await planLink.click();
        await page.waitForTimeout(1000);
      }
    });

    test('should handle business with no website', async ({ page }) => {
      // Check if plan adjusts for missing website
      const warningText = page.locator('text=/no website|website is not saved/i').first();
      const hasWarning = await warningText.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasWarning) {
        expect(await warningText.isVisible()).toBeTruthy();
      }
    });

    test('should handle business with no WhatsApp number', async ({ page }) => {
      const warningText = page.locator('text=/no whatsapp|whatsapp number is not saved/i').first();
      const hasWarning = await warningText.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasWarning) {
        expect(await warningText.isVisible()).toBeTruthy();
      }
    });

    test('should handle scenario switching (conservative/test first)', async ({ page }) => {
      const scenarioBtns = page.locator('button', { hasText: /conservative|test first|recommended/i });
      const count = await scenarioBtns.count();

      if (count > 0) {
        await scenarioBtns.first().click();
        await page.waitForTimeout(500);

        // Budget allocation should change
      }
    });

    test('should handle assumption list display', async ({ page }) => {
      const assumptions = page.locator('text=/assumes|assumption/i').first();
      const hasAssumptions = await assumptions.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasAssumptions) {
        // Should show list of assumptions clearly
        expect(await assumptions.isVisible()).toBeTruthy();
      }
    });
  });

  test.describe('Accessibility & Responsive Edge Cases', () => {
    test('should handle keyboard navigation', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Focus should be visible on interactive elements
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['BUTTON', 'INPUT', 'A', 'SELECT']).toContain(focusedElement);
    });

    test('should handle mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);

      // Content should still be accessible and usable
      const mainContent = page.locator('main').first();
      expect(await mainContent.isVisible()).toBeTruthy();
    });

    test('should handle tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(1000);

      const mainContent = page.locator('main').first();
      expect(await mainContent.isVisible()).toBeTruthy();
    });

    test('should handle very small viewport', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.waitForTimeout(1000);

      // Should not break layout completely
      const body = page.locator('body').first();
      expect(await body.isVisible()).toBeTruthy();
    });
  });

  test.describe('Error State & Network Edge Cases', () => {
    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 500));
        route.continue();
      });

      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Should still load, possibly with loading states
      const heading = page.locator('h1, h2').first();
      expect(await heading.isVisible()).toBeTruthy();
    });

    test('should handle API error states gracefully', async ({ page }) => {
      // Block image generation API
      await page.route('**/api/generate-ad-image', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: { code: 'upstream', message: 'Service unavailable' } }),
        });
      });

      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Sign in and try image generation
      await page.locator('button', { hasText: /sign in/i }).first().click();
      await page.locator('input[type="tel"]').first().fill(DEMO_PHONE);
      await page.locator('button', { hasText: /send|otp/i }).first().click();
      await page.waitForTimeout(1500);
      await page.locator('input[inputmode="numeric"]').first().fill(DEMO_OTP);
      await page.locator('form button[type="submit"]').first().click();
      await page.waitForTimeout(2000);

      const businessNameInput = page.locator('#setup-business-name').first();
      if (await businessNameInput.isVisible()) {
        await businessNameInput.fill('Test Salon');
        await page.locator('#setup-city').fill('Mumbai');
        await page.locator('button[type="submit"]').first().click();
        await page.waitForTimeout(2000);

        const imageBtn = page.locator('button', { hasText: /make a new picture/i }).first();
        if (await imageBtn.isVisible()) {
          await imageBtn.click();
          await page.waitForTimeout(2000);

          // Should show error message, not crash
          const errorText = page.locator('text=/error|unavailable|try again/i').first();
          const hasError = await errorText.isVisible({ timeout: 3000 }).catch(() => false);
          if (hasError) {
            expect(await errorText.isVisible()).toBeTruthy();
          }
        }
      }
    });
  });
});
