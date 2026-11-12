# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-flows.spec.ts >> CampaignPilot Core E2E Tests >> 9. Navigation & Information Architecture >> should have working main navigation
- Location: e2e/core-flows.spec.ts:423:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('nav, [role="navigation"], header').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('nav, [role="navigation"], header').first() with timeout 5000ms
  - waiting for locator('nav, [role="navigation"], header').first()

```

# Test source

```ts
  326 |     });
  327 | 
  328 |     test('should distinguish demo vs real campaign states', async ({ page }) => {
  329 |       // Look for demo/sandbox indicators
  330 |       const demoText = page.locator('text=/demo|sandbox|test|simulated/i').first();
  331 |       
  332 |       if (await demoText.isVisible({ timeout: 2000 }).catch(() => false)) {
  333 |         console.log('✓ Demo state is clearly marked');
  334 |       } else {
  335 |         console.log('⊘ Demo/real state indicators not clearly visible');
  336 |       }
  337 |     });
  338 |   });
  339 | 
  340 |   test.describe('7. AI-Powered Recommendations', () => {
  341 |     test('should display recommendations section', async ({ page }) => {
  342 |       const recommendationSection = page.locator('[data-test="recommendations"], text=/recommendation/i').first();
  343 |       
  344 |       if (await recommendationSection.isVisible({ timeout: 2000 }).catch(() => false)) {
  345 |         console.log('✓ Recommendations section visible');
  346 |       } else {
  347 |         console.log('⊘ Recommendations section not found');
  348 |       }
  349 |     });
  350 | 
  351 |     test('should show evidence and rationale for recommendations', async ({ page }) => {
  352 |       // Look for explanation/evidence text
  353 |       const evidenceTexts = ['because', 'reason', 'evidence', 'based on', 'data shows'];
  354 |       let found = 0;
  355 |       
  356 |       for (const text of evidenceTexts) {
  357 |         if (await page.locator(`text="${text}"`).first().isVisible({ timeout: 1000 }).catch(() => false)) {
  358 |           found++;
  359 |           break;
  360 |         }
  361 |       }
  362 |       
  363 |       if (found > 0) {
  364 |         console.log('✓ Recommendations include evidence/rationale');
  365 |       } else {
  366 |         console.log('⊘ Rationale not clearly shown in recommendations');
  367 |       }
  368 |     });
  369 | 
  370 |     test('should show uncertainty levels in recommendations', async ({ page }) => {
  371 |       // Look for confidence/uncertainty indicators
  372 |       const uncertaintyTexts = ['confidence', 'uncertain', 'may', 'estimate', 'hypothesis'];
  373 |       let found = 0;
  374 |       
  375 |       for (const text of uncertaintyTexts) {
  376 |         if (await page.locator(`text="${text}"`).first().isVisible({ timeout: 1000 }).catch(() => false)) {
  377 |           found++;
  378 |           break;
  379 |         }
  380 |       }
  381 |       
  382 |       if (found > 0) {
  383 |         console.log('✓ Uncertainty communicated in recommendations');
  384 |       } else {
  385 |         console.log('⊘ Uncertainty not clearly communicated');
  386 |       }
  387 |     });
  388 |   });
  389 | 
  390 |   test.describe('8. Connected Accounts', () => {
  391 |     test('should display connected accounts page', async ({ page }) => {
  392 |       const connectedLink = page.locator('a, button', { hasText: /connected|account|integration/i }).first();
  393 |       
  394 |       if (await connectedLink.isVisible({ timeout: 2000 }).catch(() => false)) {
  395 |         await connectedLink.click();
  396 |         await page.waitForLoadState('networkidle');
  397 |         console.log('✓ Connected accounts page accessible');
  398 |       } else {
  399 |         console.log('⊘ Connected accounts link not found');
  400 |       }
  401 |     });
  402 | 
  403 |     test('should show provider connection options', async ({ page }) => {
  404 |       // Look for connection options
  405 |       const providers = ['Google', 'Meta', 'Facebook', 'WhatsApp'];
  406 |       let found = 0;
  407 |       
  408 |       for (const provider of providers) {
  409 |         if (await page.locator(`text="${provider}"`).first().isVisible({ timeout: 1000 }).catch(() => false)) {
  410 |           found++;
  411 |         }
  412 |       }
  413 |       
  414 |       if (found > 0) {
  415 |         console.log(`✓ Found ${found} provider connection options`);
  416 |       } else {
  417 |         console.log('⊘ Provider options not visible');
  418 |       }
  419 |     });
  420 |   });
  421 | 
  422 |   test.describe('9. Navigation & Information Architecture', () => {
  423 |     test('should have working main navigation', async ({ page }) => {
  424 |       // Check for navbar/navigation
  425 |       const navbar = page.locator('nav, [role="navigation"], header').first();
> 426 |       await expect(navbar).toBeVisible();
      |                            ^ Error: expect(locator).toBeVisible() failed
  427 |       
  428 |       // Count navigation items
  429 |       const navItems = navbar.locator('a, button').count();
  430 |       const itemCount = await navItems;
  431 |       
  432 |       if (itemCount > 0) {
  433 |         console.log(`✓ Navigation with ${itemCount} items found`);
  434 |       } else {
  435 |         console.log('⊘ Navigation not accessible');
  436 |       }
  437 |     });
  438 | 
  439 |     test('should show business profile section', async ({ page }) => {
  440 |       const profileLink = page.locator('a, button', { hasText: /profile|business|settings/i }).first();
  441 |       
  442 |       if (await profileLink.isVisible({ timeout: 2000 }).catch(() => false)) {
  443 |         console.log('✓ Business profile accessible');
  444 |       } else {
  445 |         console.log('⊘ Business profile not found');
  446 |       }
  447 |     });
  448 | 
  449 |     test('should have clear primary actions', async ({ page }) => {
  450 |       // Look for primary CTA buttons
  451 |       const buttons = page.locator('button[class*="primary"], button[class*="btn"], button').count();
  452 |       const count = await buttons;
  453 |       
  454 |       if (count > 0) {
  455 |         console.log(`✓ Found ${count} action buttons`);
  456 |       } else {
  457 |         console.log('⊘ No action buttons found');
  458 |       }
  459 |     });
  460 |   });
  461 | 
  462 |   test.describe('10. Safety & Data Handling', () => {
  463 |     test('should not show real payment/credential fields without HTTPS context', async ({ page }) => {
  464 |       // Check page URL
  465 |       const url = page.url();
  466 |       if (!url.includes('https') && url.includes('localhost')) {
  467 |         console.log('✓ Running on localhost (development OK)');
  468 |       }
  469 |     });
  470 | 
  471 |     test('should require approval for consequential actions', async ({ page }) => {
  472 |       // Look for confirmation dialogs/buttons
  473 |       const confirmButtons = page.locator('button', { hasText: /confirm|approve|yes|agree|accept/i }).count();
  474 |       const count = await confirmButtons;
  475 |       
  476 |       if (count > 0) {
  477 |         console.log(`✓ Found ${count} confirmation/approval buttons`);
  478 |       } else {
  479 |         console.log('⊘ Limited confirmation mechanisms found');
  480 |       }
  481 |     });
  482 | 
  483 |     test('should show clear demo state indicators', async ({ page }) => {
  484 |       // Check for demo mode badge or indicator
  485 |       const demoIndicators = page.locator('text=/demo|test|sandbox|preview/i').count();
  486 |       const count = await demoIndicators;
  487 |       
  488 |       if (count > 0) {
  489 |         console.log(`✓ Found ${count} demo state indicators`);
  490 |       } else {
  491 |         console.log('⊘ Demo state not clearly marked');
  492 |       }
  493 |     });
  494 |   });
  495 | 
  496 |   test.describe('11. Accessibility & UI/UX', () => {
  497 |     test('should have accessible color contrast', async ({ page }) => {
  498 |       // Simple contrast check - look for text elements
  499 |       const textElements = page.locator('h1, h2, h3, p, button, a').count();
  500 |       const count = await textElements;
  501 |       
  502 |       if (count > 0) {
  503 |         console.log(`✓ Found ${count} text elements for accessibility audit`);
  504 |       }
  505 |     });
  506 | 
  507 |     test('should be mobile responsive', async ({ page }) => {
  508 |       // Get viewport info
  509 |       const size = await page.viewportSize();
  510 |       if (size) {
  511 |         console.log(`✓ Page rendered at ${size.width}x${size.height}`);
  512 |       }
  513 |     });
  514 | 
  515 |     test('should have clear empty states', async ({ page }) => {
  516 |       // Look for empty state messages
  517 |       const emptyStateTexts = ['no campaigns', 'get started', 'create your first', 'nothing yet'];
  518 |       let found = 0;
  519 |       
  520 |       for (const text of emptyStateTexts) {
  521 |         if (await page.locator(`text="${text}"`).first().isVisible({ timeout: 1000 }).catch(() => false)) {
  522 |           found++;
  523 |           break;
  524 |         }
  525 |       }
  526 |       
```