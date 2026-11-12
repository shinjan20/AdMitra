# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-flows.spec.ts >> CampaignPilot Core E2E Tests >> 1. Landing Page & Authentication >> should allow demo sign-in with phone number
- Location: e2e/core-flows.spec.ts:43:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button').filter({ hasText: /sign in|login|get started/i }).first()

```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * CampaignPilot E2E Tests - Core User Flows
  5   |  * Based on the PRD requirements for MVP scope
  6   |  */
  7   | 
  8   | const BASE_URL = 'http://localhost:3003';
  9   | const DEMO_EMAIL = '9876543210';  // Demo phone number for testing
  10  | const TEST_PASSWORD = 'password123';
  11  | 
  12  | test.describe('CampaignPilot Core E2E Tests', () => {
  13  |   test.beforeEach(async ({ page }) => {
  14  |     await page.goto(BASE_URL);
  15  |     // Wait for page to load
  16  |     await page.waitForLoadState('networkidle');
  17  |   });
  18  | 
  19  |   test.describe('1. Landing Page & Authentication', () => {
  20  |     test('should display landing page with sign-in and create campaign CTAs', async ({ page }) => {
  21  |       // Check for landing page elements
  22  |       const heading = page.locator('h1, h2, h3').first();
  23  |       await expect(heading).toBeVisible();
  24  |       
  25  |       // Check for sign-in button
  26  |       const signInBtn = page.locator('button', { hasText: /sign in|login|get started/i }).first();
  27  |       await expect(signInBtn).toBeVisible();
  28  |       
  29  |       console.log('✓ Landing page displays correctly');
  30  |     });
  31  | 
  32  |     test('should open auth modal when sign-in is clicked', async ({ page }) => {
  33  |       const signInBtn = page.locator('button', { hasText: /sign in|login|get started/i }).first();
  34  |       await signInBtn.click();
  35  |       
  36  |       // Auth modal should appear
  37  |       const authModal = page.locator('[role="dialog"], .modal, .auth-modal').first();
  38  |       await expect(authModal).toBeVisible({ timeout: 5000 });
  39  |       
  40  |       console.log('✓ Auth modal opens on sign-in click');
  41  |     });
  42  | 
  43  |     test('should allow demo sign-in with phone number', async ({ page }) => {
  44  |       // Click sign-in
  45  |       const signInBtn = page.locator('button', { hasText: /sign in|login|get started/i }).first();
> 46  |       await signInBtn.click();
      |                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
  47  |       
  48  |       // Wait for auth modal
  49  |       const authModal = page.locator('[role="dialog"], .modal, .auth-modal').first();
  50  |       await expect(authModal).toBeVisible({ timeout: 5000 });
  51  |       
  52  |       // Enter demo phone
  53  |       const phoneInput = page.locator('input[type="tel"], input[placeholder*="phone"], input[placeholder*="Phone"]').first();
  54  |       if (phoneInput) {
  55  |         await phoneInput.fill(DEMO_EMAIL);
  56  |       }
  57  |       
  58  |       // Submit auth
  59  |       const submitBtn = page.locator('button', { hasText: /submit|continue|next|sign in/i }).nth(1);
  60  |       if (await submitBtn.isVisible()) {
  61  |         await submitBtn.click();
  62  |         await page.waitForLoadState('networkidle');
  63  |       }
  64  |       
  65  |       console.log('✓ Demo sign-in attempt completed');
  66  |     });
  67  |   });
  68  | 
  69  |   test.describe('2. Business Onboarding Flow', () => {
  70  |     test('should complete business profile setup', async ({ page }) => {
  71  |       // Navigate to business profile setup or check if shop setup appears
  72  |       const businessInputs = page.locator('input[placeholder*="business"], input[placeholder*="Business"]');
  73  |       const inputCount = await businessInputs.count();
  74  |       
  75  |       if (inputCount > 0) {
  76  |         // Try filling out business details if form exists
  77  |         const businessNameInput = page.locator('input[placeholder*="name"], input[placeholder*="Name"]').first();
  78  |         if (await businessNameInput.isVisible()) {
  79  |           await businessNameInput.fill('Test Beauty Salon');
  80  |           console.log('✓ Business name entered');
  81  |         }
  82  |         
  83  |         // Check for category/type field
  84  |         const categorySelect = page.locator('select, [role="combobox"]').first();
  85  |         if (await categorySelect.isVisible()) {
  86  |           await categorySelect.click();
  87  |           const option = page.locator('option, [role="option"]').first();
  88  |           await option.click();
  89  |           console.log('✓ Business category selected');
  90  |         }
  91  |       } else {
  92  |         console.log('⊘ Business form not found on page');
  93  |       }
  94  |     });
  95  | 
  96  |     test('should handle business economics input', async ({ page }) => {
  97  |       // Look for economic inputs (budget, transaction value, CAC)
  98  |       const economicsInputs = page.locator('input[type="number"], input[placeholder*="budget"], input[placeholder*="Budget"]');
  99  |       const count = await economicsInputs.count();
  100 |       
  101 |       if (count > 0) {
  102 |         // Fill first economic input
  103 |         const firstInput = economicsInputs.first();
  104 |         await firstInput.fill('5000');
  105 |         console.log('✓ Economics field filled');
  106 |       } else {
  107 |         console.log('⊘ Economics inputs not found');
  108 |       }
  109 |     });
  110 |   });
  111 | 
  112 |   test.describe('3. Marketing Plan & Channel Recommendation', () => {
  113 |     test('should display marketing plan section', async ({ page }) => {
  114 |       // Look for marketing plan navigation or section
  115 |       const marketingPlanLink = page.locator('a, button', { hasText: /marketing plan|plan|strategy/i }).first();
  116 |       
  117 |       if (await marketingPlanLink.isVisible()) {
  118 |         await marketingPlanLink.click();
  119 |         await page.waitForLoadState('networkidle');
  120 |         
  121 |         const planContainer = page.locator('[data-test="marketing-plan"], .marketing-plan, main').first();
  122 |         await expect(planContainer).toBeVisible({ timeout: 5000 });
  123 |         console.log('✓ Marketing plan section loaded');
  124 |       } else {
  125 |         console.log('⊘ Marketing plan link not found');
  126 |       }
  127 |     });
  128 | 
  129 |     test('should show channel recommendations', async ({ page }) => {
  130 |       // Look for channel recommendation UI
  131 |       const channelTexts = ['Google', 'Meta', 'Facebook', 'Instagram', 'WhatsApp'];
  132 |       let foundChannels = 0;
  133 |       
  134 |       for (const channel of channelTexts) {
  135 |         const element = page.locator(`text="${channel}"`).first();
  136 |         if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
  137 |           foundChannels++;
  138 |         }
  139 |       }
  140 |       
  141 |       if (foundChannels > 0) {
  142 |         console.log(`✓ Found ${foundChannels} channel recommendations`);
  143 |       } else {
  144 |         console.log('⊘ Channel recommendations not visible');
  145 |       }
  146 |     });
```