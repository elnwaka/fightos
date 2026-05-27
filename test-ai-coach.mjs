import { chromium } from 'playwright';

const URL = 'https://elnwaka.github.io/fightos/';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('=== AI COACH TEST ===\n');

  // Load page and login with existing user or create new
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Clear and create fresh user
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Register
  const USER = 'coachtest' + Date.now();
  console.log('Registering as:', USER);
  await page.locator('button.auth-tab', { hasText: 'Registrieren' }).click();
  await page.waitForTimeout(300);
  await page.fill('#reg-user', USER);
  await page.fill('#reg-pass', 'test123456');
  await page.locator('#auth-register .btn-red, #auth-register .submit-btn').click();
  await page.waitForTimeout(5000);

  // Complete onboarding quickly
  const onboardingVisible = await page.locator('#onboarding-screen.active').isVisible().catch(() => false);
  if (onboardingVisible) {
    console.log('Completing onboarding...');
    for (let step = 0; step < 8; step++) {
      // Fill any visible inputs
      const inputs = page.locator('#onboarding-screen input:visible, #onboarding-screen select:visible');
      const count = await inputs.count();
      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const tag = await input.evaluate(el => el.tagName);
        const type = await input.getAttribute('type').catch(() => '');
        const value = await input.inputValue().catch(() => '');
        const min = parseInt(await input.getAttribute('min') || '0');
        if (tag === 'SELECT' && !value) await input.selectOption({ index: 1 }).catch(() => {});
        else if (type === 'number' && !value) await input.fill(min >= 100 ? '180' : '75').catch(() => {});
        else if (type === 'time' && !value) await input.fill('18:00').catch(() => {});
        else if (type === 'text' && !value) await input.fill('TestChamp').catch(() => {});
      }
      // Click option cards if needed
      const opts = page.locator('#onboarding-screen .ob-option:visible');
      if (await opts.count() > 0 && !(await opts.first().evaluate(el => el.classList.contains('selected')).catch(() => false))) {
        await opts.first().click().catch(() => {});
      }
      const nextBtn = page.locator('#ob-next');
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(800);
      }
    }
    await page.waitForTimeout(2000);
  }

  // Close 8-Säulen intro if showing
  const introVisible = await page.evaluate(() => {
    const el = document.getElementById('saeulen-intro');
    return el && getComputedStyle(el).display !== 'none';
  });
  if (introVisible) {
    console.log('Closing intro...');
    await page.evaluate(() => { const s = document.getElementById('si-scroll'); if(s) s.scrollTop = s.scrollHeight; });
    await page.waitForTimeout(500);
    const startBtn = page.locator('.si-btn', { hasText: 'STARTEN' });
    if (await startBtn.isVisible()) await startBtn.click();
    await page.waitForTimeout(1000);
  }

  // Wait for dashboard
  await page.waitForTimeout(2000);
  console.log('On dashboard.\n');

  // ===== TEST 1: Check FAB button exists =====
  console.log('--- TEST 1: FAB Button ---');
  const fabExists = await page.locator('#ai-coach-fab').isVisible();
  console.log('FAB button visible:', fabExists);
  if (!fabExists) {
    console.log('FAIL: AI Coach FAB not found!');
    await page.screenshot({ path: 'C:/Users/e.nwaka/fightos/test-screenshots/ai_no_fab.png' });
    await browser.close();
    return;
  }

  // ===== TEST 2: Open coach panel =====
  console.log('\n--- TEST 2: Open Panel ---');
  await page.locator('#ai-coach-fab').click();
  await page.waitForTimeout(500);
  const panelOpen = await page.locator('#ai-coach-panel.open').isVisible();
  console.log('Panel opened:', panelOpen);

  // Check welcome message
  const messages = await page.locator('#ai-coach-messages').innerText().catch(() => '');
  console.log('Welcome message:', messages.substring(0, 100));
  await page.screenshot({ path: 'C:/Users/e.nwaka/fightos/test-screenshots/ai_panel_open.png' });

  // ===== TEST 3: Quick prompt "Heute trainieren?" =====
  console.log('\n--- TEST 3: Quick Prompt "Heute trainieren?" ---');
  await page.locator('.ai-quick-btn', { hasText: 'Heute' }).click();
  console.log('Clicked quick prompt, waiting for AI response...');

  // Wait for response (typing indicator appears then disappears)
  await page.waitForTimeout(15000); // Give Gemini time to respond

  const afterQuick = await page.locator('#ai-coach-messages').innerText().catch(() => '');
  const responseLines = afterQuick.split('\n').filter(l => l.trim().length > 0);
  const lastMessages = responseLines.slice(-5).join('\n');
  console.log('Response received:', afterQuick.length > messages.length ? 'YES' : 'NO');
  console.log('Last lines:\n' + lastMessages);
  await page.screenshot({ path: 'C:/Users/e.nwaka/fightos/test-screenshots/ai_quick_response.png', fullPage: false });

  // Check for errors
  const hasError = afterQuick.includes('Fehler') || afterQuick.includes('Error');
  if (hasError) {
    console.log('\n⚠️ ERROR detected in response!');
    console.log('Full response:', afterQuick);
  }

  // ===== TEST 4: Manual message =====
  console.log('\n--- TEST 4: Manual Message ---');
  await page.fill('#ai-coach-input', 'Wie verbessere ich meine Schlagkraft? Kurze Antwort bitte.');
  await page.locator('.ai-send-btn').click();
  console.log('Sent manual message, waiting...');
  await page.waitForTimeout(15000);

  const afterManual = await page.locator('#ai-coach-messages').innerText().catch(() => '');
  console.log('Response grew:', afterManual.length > afterQuick.length ? 'YES' : 'NO');
  const manualResponse = afterManual.substring(afterQuick.length).trim();
  console.log('New content (first 300 chars):\n' + manualResponse.substring(0, 300));
  await page.screenshot({ path: 'C:/Users/e.nwaka/fightos/test-screenshots/ai_manual_response.png', fullPage: false });

  // ===== TEST 5: Gameplan =====
  console.log('\n--- TEST 5: Gameplan ---');
  await page.fill('#ai-coach-input', 'Gameplan gegen einen großen Southpaw Distanzkämpfer');
  await page.locator('.ai-send-btn').click();
  console.log('Sent gameplan request, waiting...');
  await page.waitForTimeout(20000);

  const afterGameplan = await page.locator('#ai-coach-messages').innerText().catch(() => '');
  const gameplanResponse = afterGameplan.substring(afterManual.length).trim();
  console.log('Gameplan response (first 500 chars):\n' + gameplanResponse.substring(0, 500));
  await page.screenshot({ path: 'C:/Users/e.nwaka/fightos/test-screenshots/ai_gameplan.png', fullPage: false });

  // ===== SUMMARY =====
  console.log('\n\n=== SUMMARY ===');
  console.log('FAB button:', fabExists ? '✅' : '❌');
  console.log('Panel opens:', panelOpen ? '✅' : '❌');
  console.log('Welcome message:', messages.length > 20 ? '✅' : '❌');
  console.log('Quick prompt response:', afterQuick.length > messages.length ? '✅' : '❌');
  console.log('Manual message response:', afterManual.length > afterQuick.length ? '✅' : '❌');
  console.log('Gameplan response:', afterGameplan.length > afterManual.length ? '✅' : '❌');
  console.log('API errors:', hasError ? '❌ YES' : '✅ NONE');

  await browser.close();
  console.log('\nDone.');
})();
