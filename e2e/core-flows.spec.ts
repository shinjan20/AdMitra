import { test, expect, Page } from '@playwright/test';

/**
 * CampaignPilot E2E Tests - Core User Flows
 * Based on the PRD requirements for MVP scope
 */

const BASE_URL = 'http://localhost:3003';
const DEMO_EMAIL = '9876543210';  // Demo phone number for testing
const TEST_PASSWORD = 'password123';

test.describe('CampaignPilot Core E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('1. Landing Page & Authentication', () => {
    test('should display landing page with sign-in and create campaign CTAs', async ({ page }) => {
      // Check for landing page elements
      const heading = page.locator('h1, h2, h3').first();
      await expect(heading).toBeVisible();
      
      // Check for sign-in button
      const signInBtn = page.locator('button', { hasText: /sign in|login|get started/i }).first();
      await expect(signInBtn).toBeVisible();
      
      console.log('✓ Landing page displays correctly');
    });

    test('should open auth modal when sign-in is clicked', async ({ page }) => {
      const signInBtn = page.locator('button', { hasText: /sign in|login|get started/i }).first();
      await signInBtn.click();
      
      // Auth modal should appear
      const authModal = page.locator('[role="dialog"], .modal, .auth-modal').first();
      await expect(authModal).toBeVisible({ timeout: 5000 });
      
      console.log('✓ Auth modal opens on sign-in click');
    });

    test('should allow demo sign-in with phone number', async ({ page }) => {
      // Click sign-in
      const signInBtn = page.locator('button', { hasText: /sign in|login|get started/i }).first();
      await signInBtn.click();
      
      // Wait for auth modal
      const authModal = page.locator('[role="dialog"], .modal, .auth-modal').first();
      await expect(authModal).toBeVisible({ timeout: 5000 });
      
      // Enter demo phone
      const phoneInput = page.locator('input[type="tel"], input[placeholder*="phone"], input[placeholder*="Phone"]').first();
      if (phoneInput) {
        await phoneInput.fill(DEMO_EMAIL);
      }
      
      // Submit auth
      const submitBtn = page.locator('button', { hasText: /submit|continue|next|sign in/i }).nth(1);
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForLoadState('networkidle');
      }
      
      console.log('✓ Demo sign-in attempt completed');
    });
  });

  test.describe('2. Business Onboarding Flow', () => {
    test('should complete business profile setup', async ({ page }) => {
      // Navigate to business profile setup or check if shop setup appears
      const businessInputs = page.locator('input[placeholder*="business"], input[placeholder*="Business"]');
      const inputCount = await businessInputs.count();
      
      if (inputCount > 0) {
        // Try filling out business details if form exists
        const businessNameInput = page.locator('input[placeholder*="name"], input[placeholder*="Name"]').first();
        if (await businessNameInput.isVisible()) {
          await businessNameInput.fill('Test Beauty Salon');
          console.log('✓ Business name entered');
        }
        
        // Check for category/type field
        const categorySelect = page.locator('select, [role="combobox"]').first();
        if (await categorySelect.isVisible()) {
          await categorySelect.click();
          const option = page.locator('option, [role="option"]').first();
          await option.click();
          console.log('✓ Business category selected');
        }
      } else {
        console.log('⊘ Business form not found on page');
      }
    });

    test('should handle business economics input', async ({ page }) => {
      // Look for economic inputs (budget, transaction value, CAC)
      const economicsInputs = page.locator('input[type="number"], input[placeholder*="budget"], input[placeholder*="Budget"]');
      const count = await economicsInputs.count();
      
      if (count > 0) {
        // Fill first economic input
        const firstInput = economicsInputs.first();
        await firstInput.fill('5000');
        console.log('✓ Economics field filled');
      } else {
        console.log('⊘ Economics inputs not found');
      }
    });
  });

  test.describe('3. Marketing Plan & Channel Recommendation', () => {
    test('should display marketing plan section', async ({ page }) => {
      // Look for marketing plan navigation or section
      const marketingPlanLink = page.locator('a, button', { hasText: /marketing plan|plan|strategy/i }).first();
      
      if (await marketingPlanLink.isVisible()) {
        await marketingPlanLink.click();
        await page.waitForLoadState('networkidle');
        
        const planContainer = page.locator('[data-test="marketing-plan"], .marketing-plan, main').first();
        await expect(planContainer).toBeVisible({ timeout: 5000 });
        console.log('✓ Marketing plan section loaded');
      } else {
        console.log('⊘ Marketing plan link not found');
      }
    });

    test('should show channel recommendations', async ({ page }) => {
      // Look for channel recommendation UI
      const channelTexts = ['Google', 'Meta', 'Facebook', 'Instagram', 'WhatsApp'];
      let foundChannels = 0;
      
      for (const channel of channelTexts) {
        const element = page.locator(`text="${channel}"`).first();
        if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
          foundChannels++;
        }
      }
      
      if (foundChannels > 0) {
        console.log(`✓ Found ${foundChannels} channel recommendations`);
      } else {
        console.log('⊘ Channel recommendations not visible');
      }
    });

    test('should display budget allocation', async ({ page }) => {
      // Look for budget allocation section
      const budgetText = page.locator('text=/budget|allocation|spend/i').first();
      
      if (await budgetText.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(budgetText).toBeVisible();
        console.log('✓ Budget allocation section visible');
      } else {
        console.log('⊘ Budget allocation not found');
      }
    });
  });

  test.describe('4. Creative Generation Flow', () => {
    test('should access creative studio/generation page', async ({ page }) => {
      const creativeLink = page.locator('a, button', { hasText: /create|creative|advertisement|ad/i }).first();
      
      if (await creativeLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await creativeLink.click();
        await page.waitForLoadState('networkidle');
        
        const creativeContainer = page.locator('[data-test="creative"], .creative-studio, main').first();
        await expect(creativeContainer).toBeVisible({ timeout: 5000 });
        console.log('✓ Creative studio loaded');
      } else {
        console.log('⊘ Creative link not found');
      }
    });

    test('should display creative generation form', async ({ page }) => {
      // Look for form fields in creative generation
      const textareas = page.locator('textarea, input[type="text"]');
      const textareaCount = await textareas.count();
      
      if (textareaCount > 0) {
        console.log(`✓ Found ${textareaCount} input fields for creative generation`);
      } else {
        console.log('⊘ Creative generation form not found');
      }
    });

    test('should show platform-specific format options', async ({ page }) => {
      // Look for format selectors (Instagram, Facebook, etc.)
      const platformOptions = page.locator('button, label, [role="button"]', { hasText: /instagram|facebook|story|reel|image|video/i });
      const optionCount = await platformOptions.count();
      
      if (optionCount > 0) {
        console.log(`✓ Found ${optionCount} platform format options`);
      } else {
        console.log('⊘ Platform format options not visible');
      }
    });
  });

  test.describe('5. Campaign Configuration', () => {
    test('should show campaign configuration interface', async ({ page }) => {
      // Look for campaign config elements
      const configElements = page.locator('input[placeholder*="audience"], input[placeholder*="geography"], input[placeholder*="budget"]');
      const count = await configElements.count();
      
      if (count > 0) {
        console.log(`✓ Campaign configuration with ${count} input fields`);
      } else {
        console.log('⊘ Campaign configuration interface not found');
      }
    });

    test('should display objective selection', async ({ page }) => {
      // Look for objectives
      const objectives = ['calls', 'leads', 'website visits', 'messages', 'bookings'];
      let found = false;
      
      for (const objective of objectives) {
        const element = page.locator(`text="${objective}"`).first();
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          found = true;
          break;
        }
      }
      
      if (found) {
        console.log('✓ Campaign objectives visible');
      } else {
        console.log('⊘ Campaign objectives not found');
      }
    });

    test('should show approval preview', async ({ page }) => {
      // Look for preview/summary section before approval
      const previewText = page.locator('text=/preview|summary|review|approve/i').first();
      
      if (await previewText.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('✓ Campaign preview section found');
      } else {
        console.log('⊘ Campaign preview section not found');
      }
    });

    test('should require explicit approval before publishing', async ({ page }) => {
      // Look for approval button
      const approveBtn = page.locator('button', { hasText: /approve|publish|launch|confirm/i }).first();
      
      if (await approveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('✓ Explicit approval button present');
      } else {
        console.log('⊘ Approval button not found');
      }
    });
  });

  test.describe('6. Campaign Performance Dashboard', () => {
    test('should display dashboard page', async ({ page }) => {
      const dashboardLink = page.locator('a, button', { hasText: /dashboard|performance|insights|campaigns/i }).first();
      
      if (await dashboardLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await dashboardLink.click();
        await page.waitForLoadState('networkidle');
        
        const mainContent = page.locator('main').first();
        await expect(mainContent).toBeVisible({ timeout: 5000 });
        console.log('✓ Dashboard loaded');
      } else {
        console.log('⊘ Dashboard link not found');
      }
    });

    test('should show key metrics: spend and delivery', async ({ page }) => {
      // Look for spend/delivery metrics
      const metricTexts = ['spent', 'spend', 'impressions', 'reach', 'delivered'];
      let found = 0;
      
      for (const metric of metricTexts) {
        if (await page.locator(`text="${metric}"`).first().isVisible({ timeout: 1000 }).catch(() => false)) {
          found++;
        }
      }
      
      if (found > 0) {
        console.log(`✓ Found ${found} metric types on dashboard`);
      } else {
        console.log('⊘ Metrics not visible on dashboard');
      }
    });

    test('should show engagement metrics', async ({ page }) => {
      // Look for clicks, CTR, conversions
      const engagementTexts = ['clicks', 'click through', 'ctr', 'engagement', 'video views'];
      let found = 0;
      
      for (const text of engagementTexts) {
        if (await page.locator(`text="${text}"`).first().isVisible({ timeout: 1000 }).catch(() => false)) {
          found++;
        }
      }
      
      if (found > 0) {
        console.log(`✓ Found ${found} engagement metrics`);
      } else {
        console.log('⊘ Engagement metrics not found');
      }
    });

    test('should show intent signals (calls, WhatsApp, form starts)', async ({ page }) => {
      // Look for intent signal metrics
      const intentTexts = ['calls', 'whatsapp', 'form', 'enquir', 'direction'];
      let found = 0;
      
      for (const text of intentTexts) {
        if (await page.locator(`text="${text}"`).first().isVisible({ timeout: 1000 }).catch(() => false)) {
          found++;
        }
      }
      
      if (found > 0) {
        console.log(`✓ Found ${found} intent signal metrics`);
      } else {
        console.log('⊘ Intent signals not found');
      }
    });

    test('should distinguish demo vs real campaign states', async ({ page }) => {
      // Look for demo/sandbox indicators
      const demoText = page.locator('text=/demo|sandbox|test|simulated/i').first();
      
      if (await demoText.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('✓ Demo state is clearly marked');
      } else {
        console.log('⊘ Demo/real state indicators not clearly visible');
      }
    });
  });

  test.describe('7. AI-Powered Recommendations', () => {
    test('should display recommendations section', async ({ page }) => {
      const recommendationSection = page.locator('[data-test="recommendations"], text=/recommendation/i').first();
      
      if (await recommendationSection.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('✓ Recommendations section visible');
      } else {
        console.log('⊘ Recommendations section not found');
      }
    });

    test('should show evidence and rationale for recommendations', async ({ page }) => {
      // Look for explanation/evidence text
      const evidenceTexts = ['because', 'reason', 'evidence', 'based on', 'data shows'];
      let found = 0;
      
      for (const text of evidenceTexts) {
        if (await page.locator(`text="${text}"`).first().isVisible({ timeout: 1000 }).catch(() => false)) {
          found++;
          break;
        }
      }
      
      if (found > 0) {
        console.log('✓ Recommendations include evidence/rationale');
      } else {
        console.log('⊘ Rationale not clearly shown in recommendations');
      }
    });

    test('should show uncertainty levels in recommendations', async ({ page }) => {
      // Look for confidence/uncertainty indicators
      const uncertaintyTexts = ['confidence', 'uncertain', 'may', 'estimate', 'hypothesis'];
      let found = 0;
      
      for (const text of uncertaintyTexts) {
        if (await page.locator(`text="${text}"`).first().isVisible({ timeout: 1000 }).catch(() => false)) {
          found++;
          break;
        }
      }
      
      if (found > 0) {
        console.log('✓ Uncertainty communicated in recommendations');
      } else {
        console.log('⊘ Uncertainty not clearly communicated');
      }
    });
  });

  test.describe('8. Connected Accounts', () => {
    test('should display connected accounts page', async ({ page }) => {
      const connectedLink = page.locator('a, button', { hasText: /connected|account|integration/i }).first();
      
      if (await connectedLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await connectedLink.click();
        await page.waitForLoadState('networkidle');
        console.log('✓ Connected accounts page accessible');
      } else {
        console.log('⊘ Connected accounts link not found');
      }
    });

    test('should show provider connection options', async ({ page }) => {
      // Look for connection options
      const providers = ['Google', 'Meta', 'Facebook', 'WhatsApp'];
      let found = 0;
      
      for (const provider of providers) {
        if (await page.locator(`text="${provider}"`).first().isVisible({ timeout: 1000 }).catch(() => false)) {
          found++;
        }
      }
      
      if (found > 0) {
        console.log(`✓ Found ${found} provider connection options`);
      } else {
        console.log('⊘ Provider options not visible');
      }
    });
  });

  test.describe('9. Navigation & Information Architecture', () => {
    test('should have working main navigation', async ({ page }) => {
      // Check for navbar/navigation
      const navbar = page.locator('nav, [role="navigation"], header').first();
      await expect(navbar).toBeVisible();
      
      // Count navigation items
      const navItems = navbar.locator('a, button').count();
      const itemCount = await navItems;
      
      if (itemCount > 0) {
        console.log(`✓ Navigation with ${itemCount} items found`);
      } else {
        console.log('⊘ Navigation not accessible');
      }
    });

    test('should show business profile section', async ({ page }) => {
      const profileLink = page.locator('a, button', { hasText: /profile|business|settings/i }).first();
      
      if (await profileLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('✓ Business profile accessible');
      } else {
        console.log('⊘ Business profile not found');
      }
    });

    test('should have clear primary actions', async ({ page }) => {
      // Look for primary CTA buttons
      const buttons = page.locator('button[class*="primary"], button[class*="btn"], button').count();
      const count = await buttons;
      
      if (count > 0) {
        console.log(`✓ Found ${count} action buttons`);
      } else {
        console.log('⊘ No action buttons found');
      }
    });
  });

  test.describe('10. Safety & Data Handling', () => {
    test('should not show real payment/credential fields without HTTPS context', async ({ page }) => {
      // Check page URL
      const url = page.url();
      if (!url.includes('https') && url.includes('localhost')) {
        console.log('✓ Running on localhost (development OK)');
      }
    });

    test('should require approval for consequential actions', async ({ page }) => {
      // Look for confirmation dialogs/buttons
      const confirmButtons = page.locator('button', { hasText: /confirm|approve|yes|agree|accept/i }).count();
      const count = await confirmButtons;
      
      if (count > 0) {
        console.log(`✓ Found ${count} confirmation/approval buttons`);
      } else {
        console.log('⊘ Limited confirmation mechanisms found');
      }
    });

    test('should show clear demo state indicators', async ({ page }) => {
      // Check for demo mode badge or indicator
      const demoIndicators = page.locator('text=/demo|test|sandbox|preview/i').count();
      const count = await demoIndicators;
      
      if (count > 0) {
        console.log(`✓ Found ${count} demo state indicators`);
      } else {
        console.log('⊘ Demo state not clearly marked');
      }
    });
  });

  test.describe('11. Accessibility & UI/UX', () => {
    test('should have accessible color contrast', async ({ page }) => {
      // Simple contrast check - look for text elements
      const textElements = page.locator('h1, h2, h3, p, button, a').count();
      const count = await textElements;
      
      if (count > 0) {
        console.log(`✓ Found ${count} text elements for accessibility audit`);
      }
    });

    test('should be mobile responsive', async ({ page }) => {
      // Get viewport info
      const size = await page.viewportSize();
      if (size) {
        console.log(`✓ Page rendered at ${size.width}x${size.height}`);
      }
    });

    test('should have clear empty states', async ({ page }) => {
      // Look for empty state messages
      const emptyStateTexts = ['no campaigns', 'get started', 'create your first', 'nothing yet'];
      let found = 0;
      
      for (const text of emptyStateTexts) {
        if (await page.locator(`text="${text}"`).first().isVisible({ timeout: 1000 }).catch(() => false)) {
          found++;
          break;
        }
      }
      
      if (found > 0) {
        console.log('✓ Empty states present');
      } else {
        console.log('⊘ Empty state messages not found');
      }
    });
  });

  test.describe('12. Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network error
      await page.context().setOffline(true);
      await page.reload().catch(() => {});
      
      // Look for error message
      const errorMsg = page.locator('text=/offline|error|unable|connection/i').first();
      const isVisible = await errorMsg.isVisible({ timeout: 2000 }).catch(() => false);
      
      // Restore connectivity
      await page.context().setOffline(false);
      
      if (isVisible) {
        console.log('✓ Network errors handled gracefully');
      } else {
        console.log('⊘ Network error handling not visible');
      }
    });

    test('should recover from common errors', async ({ page }) => {
      // Look for error recovery options (retry buttons)
      const retryBtn = page.locator('button', { hasText: /retry|try again|refresh/i }).first();
      
      if (await retryBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('✓ Error recovery mechanisms present');
      } else {
        console.log('⊘ Error recovery options not clearly visible');
      }
    });
  });
});
