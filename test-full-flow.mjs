import { chromium } from 'playwright';
import fs from 'fs';

const URL = 'https://elnwaka.github.io/fightos/';
const USER = 'testboxer' + Date.now();
const PASS = 'test123456';
const SCREENSHOT_DIR = 'C:/Users/e.nwaka/fightos/test-screenshots';

// Create screenshot dir
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const findings = [];
let screenshotIdx = 0;

function log(category, severity, message, detail) {
  const entry = { category, severity, message, detail: detail || '' };
  findings.push(entry);
  const icon = severity === 'BUG' ? '🐛' : severity === 'UX' ? '⚠️' : severity === 'OK' ? '✅' : 'ℹ️';
  console.log(`${icon} [${category}] ${message}${detail ? ' — ' + detail : ''}`);
}

async function screenshot(page, name) {
  screenshotIdx++;
  const path = `${SCREENSHOT_DIR}/${String(screenshotIdx).padStart(2,'0')}_${name}.png`;
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function getVisibleText(page) {
  return page.evaluate(() => document.body.innerText);
}

async function getConsoleErrors(page) {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  return errors;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push('PAGE ERROR: ' + err.message));

  console.log('=== FIGHTOS FULL APP TEST ===');
  console.log('User:', USER, '| Resolution: 1440x900');
  console.log('URL:', URL);
  console.log('');

  // ============================================================
  // 1. AUTH SCREEN
  // ============================================================
  console.log('\n━━━ 1. AUTH SCREEN ━━━');
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Clear any existing session
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  await screenshot(page, 'auth_screen');

  const authVisible = await page.locator('#auth-screen.active').isVisible().catch(() => false);
  if (authVisible) {
    log('AUTH', 'OK', 'Auth screen is visible');

    // Check branding
    const logoText = await page.locator('.auth-logo').textContent().catch(() => '');
    log('AUTH', logoText.includes('FIGHT') ? 'OK' : 'BUG', 'Logo text: ' + logoText);

    const subText = await page.locator('.auth-sub').textContent().catch(() => '');
    log('AUTH', 'INFO', 'Subtitle: ' + subText);

    // Check form labels
    const loginLabels = await page.locator('#auth-login .form-label').allTextContents();
    log('AUTH', 'INFO', 'Login form labels: ' + loginLabels.join(', '));

    // Check placeholder text
    const loginPlaceholder = await page.locator('#login-user').getAttribute('placeholder');
    log('AUTH', 'INFO', 'Username placeholder: ' + loginPlaceholder);

    // Test empty submit
    await page.locator('#auth-login .btn-red, #auth-login .submit-btn').click();
    await page.waitForTimeout(500);
    const emptyMsg = await page.locator('#auth-msg').textContent().catch(() => '');
    log('AUTH', emptyMsg ? 'OK' : 'UX', 'Empty submit message: ' + (emptyMsg || 'NONE - should show error'));

  } else {
    log('AUTH', 'BUG', 'Auth screen NOT visible on fresh load');
  }

  // ============================================================
  // 2. REGISTRATION
  // ============================================================
  console.log('\n━━━ 2. REGISTRATION ━━━');
  const regTab = page.locator('button.auth-tab', { hasText: 'Registrieren' });
  await regTab.click();
  await page.waitForTimeout(300);
  log('AUTH', 'OK', 'Switched to Register tab');

  await page.fill('#reg-user', USER);
  await page.fill('#reg-pass', PASS);
  await page.locator('#auth-register .btn-red, #auth-register .submit-btn').click();
  await page.waitForTimeout(5000);

  const afterRegAuth = await page.locator('#auth-screen.active').isVisible().catch(() => false);
  if (afterRegAuth) {
    const regMsg = await page.locator('#auth-msg').textContent().catch(() => '');
    log('AUTH', 'BUG', 'Still on auth screen after registration', regMsg);
  } else {
    log('AUTH', 'OK', 'Left auth screen after registration');
  }

  // ============================================================
  // 3. ONBOARDING WIZARD
  // ============================================================
  console.log('\n━━━ 3. ONBOARDING WIZARD ━━━');
  const obVisible = await page.locator('#onboarding-screen.active').isVisible().catch(() => false);

  if (obVisible) {
    log('ONBOARDING', 'OK', 'Onboarding wizard is showing');
    await screenshot(page, 'onboarding_step1');

    // Step 1: Who are you
    const step1Label = await page.locator('#ob-step-label').textContent().catch(() => '');
    log('ONBOARDING', 'INFO', 'Step 1: ' + step1Label);

    // Fill nickname
    const nicknameInput = page.locator('#onboarding-screen input[type="text"], #onboarding-screen input[placeholder*="Name"], #onboarding-screen input[placeholder*="nennen"]');
    if (await nicknameInput.count() > 0) {
      await nicknameInput.first().fill('TestChamp');
      log('ONBOARDING', 'OK', 'Filled nickname: TestChamp');
    } else {
      log('ONBOARDING', 'UX', 'Cannot find nickname input');
    }

    // Select birth year
    const birthSelect = page.locator('#onboarding-screen select').first();
    if (await birthSelect.count() > 0) {
      await birthSelect.selectOption('2000');
      log('ONBOARDING', 'OK', 'Selected birth year: 2000');
    }

    // Click WEITER through all steps
    for (let step = 1; step <= 7; step++) {
      const nextBtn = page.locator('#ob-next');
      if (await nextBtn.isVisible()) {
        await screenshot(page, 'onboarding_step' + step);

        // Read current step content
        const stepContent = await page.locator('#onboarding-screen').innerText().catch(() => '');
        const stepTitle = stepContent.split('\n').find(l => l.length > 5 && !l.includes('SCHRITT') && !l.includes('FIGHTOS') && !l.includes('WEITER') && !l.includes('ZURÜCK')) || '';
        log('ONBOARDING', 'INFO', 'Step ' + step + ' title: ' + stepTitle.trim().substring(0, 60));

        // Check for required fields and fill them
        const inputs = page.locator('#onboarding-screen input:visible, #onboarding-screen select:visible');
        const inputCount = await inputs.count();
        if (inputCount > 0) {
          for (let i = 0; i < inputCount; i++) {
            const input = inputs.nth(i);
            const tag = await input.evaluate(el => el.tagName);
            const type = await input.getAttribute('type').catch(() => '');
            const placeholder = await input.getAttribute('placeholder').catch(() => '');
            const id = await input.getAttribute('id').catch(() => '');
            const value = await input.inputValue().catch(() => '');

            if (tag === 'SELECT' && !value) {
              const options = await input.locator('option').allTextContents();
              if (options.length > 1) {
                await input.selectOption({ index: 1 });
              }
            } else if (type === 'number' && !value) {
              // Check min/max to fill appropriate value
              const min = parseInt(await input.getAttribute('min') || '0');
              const max = parseInt(await input.getAttribute('max') || '999');
              const fillVal = min >= 100 ? '175' : '75'; // height vs weight
              await input.fill(fillVal);
            } else if (type === 'time' && !value) {
              await input.fill('18:00');
            } else if (type === 'date' && !value) {
              // Skip optional date
            } else if (type === 'text' && !value) {
              await input.fill('TestValue');
            }
          }
        }

        // Check for clickable options (cards)
        const optionCards = page.locator('#onboarding-screen .ob-option:visible');
        if (await optionCards.count() > 0 && !(await optionCards.first().evaluate(el => el.classList.contains('selected')))) {
          await optionCards.first().click();
          log('ONBOARDING', 'INFO', 'Selected first option card');
        }

        // Click next
        const btnText = await nextBtn.textContent().catch(() => '');
        await nextBtn.click();
        await page.waitForTimeout(800);

        // Check if we got an error
        const obMsg = await page.locator('#ob-msg').textContent().catch(() => '');
        if (obMsg) {
          log('ONBOARDING', 'UX', 'Step ' + step + ' validation: ' + obMsg);
          // Try selecting an option if we missed one
          const opts = page.locator('#onboarding-screen .ob-option:visible');
          if (await opts.count() > 0) {
            await opts.first().click();
            await page.waitForTimeout(200);
            await nextBtn.click();
            await page.waitForTimeout(800);
          }
        }
      } else {
        break;
      }
    }

    await page.waitForTimeout(2000);
  } else {
    log('ONBOARDING', 'BUG', 'Onboarding wizard NOT showing after registration');
    await screenshot(page, 'no_onboarding');
  }

  // ============================================================
  // 4. 8-SÄULEN INTRO
  // ============================================================
  console.log('\n━━━ 4. 8-SÄULEN INTRO ━━━');
  const introVisible = await page.evaluate(() => {
    const el = document.getElementById('saeulen-intro');
    return el && getComputedStyle(el).display !== 'none';
  });

  if (introVisible) {
    log('INTRO', 'OK', '8-Säulen intro is showing');
    await screenshot(page, 'saeulen_intro');

    // Try to close it
    const closeBtn = page.locator('#saeulen-intro button, .si-btn');
    if (await closeBtn.count() > 0) {
      // Scroll to bottom to find close button
      await page.evaluate(() => {
        const scroll = document.getElementById('si-scroll');
        if (scroll) scroll.scrollTop = scroll.scrollHeight;
      });
      await page.waitForTimeout(1000);
      const startBtn = page.locator('.si-btn', { hasText: 'STARTEN' });
      if (await startBtn.isVisible()) {
        await startBtn.click();
        await page.waitForTimeout(1000);
        log('INTRO', 'OK', 'Closed 8-Säulen intro');
      }
    }
  } else {
    log('INTRO', 'INFO', '8-Säulen intro not visible (may have been skipped)');
  }

  // ============================================================
  // 5. DASHBOARD
  // ============================================================
  console.log('\n━━━ 5. DASHBOARD ━━━');
  await page.waitForTimeout(2000);
  await screenshot(page, 'dashboard');

  const dashText = await getVisibleText(page);

  // Check welcome banner
  const hasWelcome = dashText.includes('WILLKOMMEN') || dashText.includes('Willkommen');
  log('DASHBOARD', hasWelcome ? 'OK' : 'UX', 'Welcome banner: ' + (hasWelcome ? 'present' : 'MISSING for new user'));

  // Check hero section
  const hasHero = await page.locator('.db-hero').isVisible().catch(() => false);
  log('DASHBOARD', 'INFO', 'Hero section: ' + (hasHero ? 'visible' : 'not visible'));

  // Check stats
  const hasScore = dashText.includes('SCORE');
  const hasSessions = dashText.includes('SESSIONS');
  log('DASHBOARD', 'INFO', 'Stats visible: SCORE=' + hasScore + ', SESSIONS=' + hasSessions);

  // Check "Next Session" block
  const hasNextSession = dashText.includes('NÄCHSTE SESSION') || dashText.includes('Alle Blöcke');
  log('DASHBOARD', hasNextSession ? 'OK' : 'UX', 'Next session: ' + (hasNextSession ? 'visible' : 'missing'));

  // Check today section
  const hasToday = dashText.includes('HEUTE');
  log('DASHBOARD', hasToday ? 'OK' : 'UX', 'Today section: ' + (hasToday ? 'visible' : 'missing'));

  // Check week strip
  const weekRings = await page.locator('.db-week-day').count();
  log('DASHBOARD', weekRings === 7 ? 'OK' : 'UX', 'Week strip days: ' + weekRings + '/7');

  // Check quick links
  const hasQuickLinks = dashText.includes('Training loggen') || dashText.includes('Test machen');
  log('DASHBOARD', 'INFO', 'Quick links: ' + (hasQuickLinks ? 'visible' : 'not found'));

  // Check for empty/zero data display
  const hasZeros = dashText.includes('0/0');
  log('DASHBOARD', hasZeros ? 'UX' : 'OK', 'Shows 0/0: ' + hasZeros, hasZeros ? 'Empty data should show guidance, not zeros' : '');

  // ============================================================
  // 6. WOCHENPLAN (PLAN TAB)
  // ============================================================
  console.log('\n━━━ 6. WOCHENPLAN ━━━');
  await page.locator('.nav-btn[data-page="wochenplan"], .btab[data-page="wochenplan"]').first().click();
  await page.waitForTimeout(2000);
  await screenshot(page, 'wochenplan');

  const planText = await getVisibleText(page);

  const hasPlanTitle = planText.includes('WOCHENPLAN');
  log('PLAN', hasPlanTitle ? 'OK' : 'BUG', 'Plan title: ' + (hasPlanTitle ? 'visible' : 'MISSING'));

  // Check if plan was generated
  const hasAutoGenHint = planText.includes('automatisch erstellt');
  log('PLAN', hasAutoGenHint ? 'OK' : 'UX', 'Auto-generated hint: ' + (hasAutoGenHint ? 'visible' : 'missing'));

  // Check day columns
  const dayCols = await page.locator('.day-col').count();
  log('PLAN', dayCols === 7 ? 'OK' : 'UX', 'Day columns: ' + dayCols + '/7');

  // Check if blocks exist
  const dayBlocks = await page.locator('.day-block').count();
  log('PLAN', dayBlocks > 0 ? 'OK' : 'UX', 'Training blocks: ' + dayBlocks, dayBlocks === 0 ? 'Plan might be empty' : '');

  // Check block types
  const blockTypes = await page.evaluate(() => {
    const blocks = document.querySelectorAll('.day-block');
    const types = {};
    blocks.forEach(b => {
      ['strength','boxing','cardio','recovery','meta','off'].forEach(t => {
        if (b.classList.contains(t)) types[t] = (types[t]||0) + 1;
      });
    });
    return types;
  });
  log('PLAN', 'INFO', 'Block types: ' + JSON.stringify(blockTypes));

  // Check for Monday/Montag labels
  const hasDayLabels = planText.includes('Montag') || planText.includes('MO');
  log('PLAN', hasDayLabels ? 'OK' : 'UX', 'Day labels: ' + (hasDayLabels ? 'visible' : 'missing'));

  // Click on first block to test detail view
  const firstBlock = page.locator('.day-block').first();
  if (await firstBlock.isVisible()) {
    await firstBlock.click();
    await page.waitForTimeout(1000);
    await screenshot(page, 'block_detail');
    const detailVisible = await page.locator('#page-block-detail.active').isVisible().catch(() => false);
    log('PLAN', detailVisible ? 'OK' : 'INFO', 'Block detail view: ' + (detailVisible ? 'opens' : 'does not open (might use different mechanism)'));

    // Go back
    const backBtn = page.locator('.back-link, [onclick*="wochenplan"]').first();
    if (await backBtn.isVisible()) await backBtn.click();
    await page.waitForTimeout(500);
  }

  // ============================================================
  // 7. TRAINING PAGE (merged hub)
  // ============================================================
  console.log('\n━━━ 7. TRAINING PAGE ━━━');
  await page.locator('.nav-btn[data-page="training"]').click();
  await page.waitForTimeout(2000);
  await screenshot(page, 'training_page');

  const trainingText = await getVisibleText(page);
  const hasTrainingTitle = trainingText.includes('TRAINING');
  log('TRAINING', hasTrainingTitle ? 'OK' : 'BUG', 'Training page title');

  // Check sub-tabs exist
  const subTabs = await page.locator('.sub-tab').allTextContents();
  log('TRAINING', subTabs.length > 0 ? 'OK' : 'BUG', 'Sub-tabs: ' + subTabs.join(', '));

  // Test each sub-tab
  const expectedTabs = ['Übungen', 'Tests', 'Log', 'Ernährung', 'Periodisierung', 'Recovery'];
  for (const tabName of expectedTabs) {
    const tab = page.locator('.sub-tab', { hasText: tabName });
    if (await tab.isVisible()) {
      await tab.click();
      await page.waitForTimeout(1500);
      await screenshot(page, 'training_' + tabName.toLowerCase().replace(/ä/g,'ae').replace(/ü/g,'ue'));

      const tabContent = await page.locator('#training-content').innerText().catch(() => '');
      const hasContent = tabContent.length > 50;
      log('TRAINING', hasContent ? 'OK' : 'UX', tabName + ' tab: ' + (hasContent ? tabContent.length + ' chars of content' : 'EMPTY or very little content'));

      // Check for specific content per tab
      if (tabName === 'Tests') {
        const hasTestHint = tabContent.includes('Baseline') || tabContent.includes('LEISTUNGSTEST');
        log('TRAINING', hasTestHint ? 'OK' : 'UX', 'Tests empty state hint: ' + (hasTestHint ? 'present' : 'missing'));
      }
      if (tabName === 'Log') {
        const hasLogForm = tabContent.includes('Datum') || tabContent.includes('TRAINING LOG');
        log('TRAINING', hasLogForm ? 'OK' : 'UX', 'Log form: ' + (hasLogForm ? 'present' : 'missing'));
      }
      if (tabName === 'Ernährung') {
        const hasNutrition = tabContent.includes('KOHLENHYDRAT') || tabContent.includes('PROTEIN') || tabContent.includes('GRUNDLAGEN') || tabContent.includes('Ernähr');
        log('TRAINING', hasNutrition ? 'OK' : 'UX', 'Nutrition content: ' + (hasNutrition ? 'present' : 'missing'));
      }
    } else {
      log('TRAINING', 'BUG', tabName + ' tab NOT found');
    }
  }

  // ============================================================
  // 8. KÄMPFE PAGE
  // ============================================================
  console.log('\n━━━ 8. KÄMPFE PAGE ━━━');
  await page.locator('.nav-btn[data-page="fights"]').click();
  await page.waitForTimeout(2000);
  await screenshot(page, 'kaempfe_page');

  const fightsText = await getVisibleText(page);
  const hasFightsTitle = fightsText.includes('KÄMPFE');
  log('KÄMPFE', hasFightsTitle ? 'OK' : 'BUG', 'Fights page title');

  // Check empty state
  const hasEmptyState = fightsText.includes('NOCH KEINE KÄMPFE') || fightsText.includes('KAMPF EINTRAGEN');
  log('KÄMPFE', hasEmptyState ? 'OK' : 'UX', 'Empty state: ' + (hasEmptyState ? 'present with CTA' : 'MISSING - new user sees nothing helpful'));

  // ============================================================
  // 9. PROFIL PAGE
  // ============================================================
  console.log('\n━━━ 9. PROFIL PAGE ━━━');
  await page.locator('.nav-btn[data-page="profil"]').click();
  await page.waitForTimeout(2000);
  await screenshot(page, 'profil_page');

  const profilText = await getVisibleText(page);
  const hasProfilTitle = profilText.includes('PROFIL');
  log('PROFIL', hasProfilTitle ? 'OK' : 'BUG', 'Profil page title');

  // Check sub-tabs
  const profilTabs = await page.locator('.sub-tab').allTextContents();
  log('PROFIL', profilTabs.length > 0 ? 'OK' : 'BUG', 'Profil sub-tabs: ' + profilTabs.join(', '));

  // Test Account tab
  const accTab = page.locator('.sub-tab', { hasText: 'Account' });
  if (await accTab.isVisible()) {
    await accTab.click();
    await page.waitForTimeout(1500);
    await screenshot(page, 'profil_account');

    const accContent = await page.locator('#profil-content').innerText().catch(() => '');
    const hasWeight = accContent.includes('Gewicht') || accContent.includes('kg');
    const hasSchedule = accContent.includes('Arbeitszeit') || accContent.includes('Trainingszeit');
    const hasFightDate = accContent.includes('Kampf') || accContent.includes('Nächster');
    const hasProgram = accContent.includes('Programm') || accContent.includes('10-Wochen');
    log('PROFIL', hasWeight ? 'OK' : 'UX', 'Weight setting: ' + (hasWeight ? 'visible' : 'missing'));
    log('PROFIL', hasSchedule ? 'OK' : 'UX', 'Schedule setting: ' + (hasSchedule ? 'visible' : 'missing'));
    log('PROFIL', hasFightDate ? 'OK' : 'UX', 'Fight date setting: ' + (hasFightDate ? 'visible' : 'missing'));
    log('PROFIL', hasProgram ? 'OK' : 'UX', 'Program selector: ' + (hasProgram ? 'visible' : 'missing'));
  }

  // Test 8 Säulen tab
  const saeulenTab = page.locator('.sub-tab', { hasText: '8 Säulen' });
  if (await saeulenTab.isVisible()) {
    await saeulenTab.click();
    await page.waitForTimeout(1500);
    await screenshot(page, 'profil_saeulen');

    const saeulenContent = await page.locator('#profil-content').innerText().catch(() => '');
    const hasKraft = saeulenContent.includes('KRAFT');
    const hasMetabol = saeulenContent.includes('METABOL');
    log('PROFIL', hasKraft ? 'OK' : 'UX', '8 Säulen - Kraft pillar: ' + (hasKraft ? 'visible' : 'missing'));
    log('PROFIL', hasMetabol ? 'OK' : 'UX', '8 Säulen - Metabolisch pillar: ' + (hasMetabol ? 'visible' : 'missing'));
  }

  // Test FAQ tab
  const faqTab = page.locator('.sub-tab', { hasText: 'FAQ' });
  if (await faqTab.isVisible()) {
    await faqTab.click();
    await page.waitForTimeout(1500);
    const faqContent = await page.locator('#profil-content').innerText().catch(() => '');
    const hasFAQ = faqContent.length > 100;
    log('PROFIL', hasFAQ ? 'OK' : 'UX', 'FAQ content: ' + (hasFAQ ? faqContent.length + ' chars' : 'empty or missing'));
  }

  // ============================================================
  // 10. MOBILE VIEW
  // ============================================================
  console.log('\n━━━ 10. MOBILE VIEW (375x812) ━━━');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);

  // Go to dashboard
  await page.locator('.btab[data-page="dashboard"]').click();
  await page.waitForTimeout(2000);
  await screenshot(page, 'mobile_dashboard');

  // Check bottom bar
  const bottomBarVisible = await page.locator('.bottom-bar').isVisible();
  log('MOBILE', bottomBarVisible ? 'OK' : 'BUG', 'Bottom bar: ' + (bottomBarVisible ? 'visible' : 'HIDDEN'));

  const btabCount = await page.locator('.btab').count();
  log('MOBILE', btabCount === 5 ? 'OK' : 'UX', 'Bottom tabs: ' + btabCount + '/5');

  const btabLabels = await page.locator('.btab span').allTextContents();
  log('MOBILE', 'INFO', 'Tab labels: ' + btabLabels.join(', '));

  // Check topbar on mobile
  const topbarHeight = await page.evaluate(() => {
    const tb = document.querySelector('.topbar');
    return tb ? tb.offsetHeight : 0;
  });
  log('MOBILE', 'INFO', 'Topbar height: ' + topbarHeight + 'px');

  // Check each mobile tab
  for (const tabLabel of ['Plan', 'Training', 'Kämpfe', 'Profil']) {
    const mTab = page.locator('.btab', { hasText: tabLabel });
    if (await mTab.isVisible()) {
      await mTab.click();
      await page.waitForTimeout(1500);
      await screenshot(page, 'mobile_' + tabLabel.toLowerCase().replace(/ä/g,'ae'));

      // Check for horizontal overflow
      const hasOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
      if (hasOverflow) log('MOBILE', 'BUG', tabLabel + ': horizontal overflow detected');
    }
  }

  // ============================================================
  // 11. GENERAL QUALITY CHECKS
  // ============================================================
  console.log('\n━━━ 11. GENERAL QUALITY ━━━');

  // Reset to desktop
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('.nav-btn[data-page="dashboard"]').click();
  await page.waitForTimeout(1000);

  // Check for console errors
  if (consoleErrors.length > 0) {
    log('QUALITY', 'BUG', 'Console errors: ' + consoleErrors.length);
    consoleErrors.forEach((e, i) => log('QUALITY', 'BUG', 'Error ' + (i+1) + ': ' + e.substring(0, 200)));
  } else {
    log('QUALITY', 'OK', 'No console errors');
  }

  // Check for broken images
  const brokenImages = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    return Array.from(imgs).filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src);
  });
  if (brokenImages.length > 0) {
    log('QUALITY', 'BUG', 'Broken images: ' + brokenImages.join(', '));
  } else {
    log('QUALITY', 'OK', 'No broken images');
  }

  // Check for text overflow / truncation issues
  const overflowElements = await page.evaluate(() => {
    const els = document.querySelectorAll('*');
    const issues = [];
    for (const el of els) {
      if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== 'auto' && getComputedStyle(el).overflow !== 'scroll' && getComputedStyle(el).overflowX !== 'auto' && getComputedStyle(el).overflowX !== 'scroll' && el.clientWidth > 0) {
        const text = el.innerText?.substring(0, 50) || '';
        if (text.length > 10) issues.push(text);
      }
    }
    return issues.slice(0, 5);
  });
  if (overflowElements.length > 0) {
    log('QUALITY', 'UX', 'Possible text overflow in: ' + overflowElements.join(' | '));
  }

  // Check theme toggle
  const themeBtn = page.locator('#theme-toggle-btn');
  if (await themeBtn.isVisible()) {
    await themeBtn.click();
    await page.waitForTimeout(500);
    await screenshot(page, 'light_mode');
    const isLight = await page.evaluate(() => document.body.parentElement.getAttribute('data-theme'));
    log('QUALITY', isLight === 'light' ? 'OK' : 'UX', 'Light mode toggle: ' + (isLight || 'no theme attribute'));
    // Toggle back
    await themeBtn.click();
    await page.waitForTimeout(300);
  }

  // ============================================================
  // REPORT
  // ============================================================
  console.log('\n\n' + '='.repeat(60));
  console.log('FINDINGS REPORT');
  console.log('='.repeat(60));

  const bugs = findings.filter(f => f.severity === 'BUG');
  const ux = findings.filter(f => f.severity === 'UX');
  const ok = findings.filter(f => f.severity === 'OK');

  console.log(`\n🐛 BUGS: ${bugs.length}`);
  bugs.forEach(f => console.log(`   [${f.category}] ${f.message}${f.detail ? ' — ' + f.detail : ''}`));

  console.log(`\n⚠️  UX ISSUES: ${ux.length}`);
  ux.forEach(f => console.log(`   [${f.category}] ${f.message}${f.detail ? ' — ' + f.detail : ''}`));

  console.log(`\n✅ PASSED: ${ok.length}`);

  console.log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`);
  console.log(`Total findings: ${findings.length} (${bugs.length} bugs, ${ux.length} UX, ${ok.length} OK)`);

  // Write report file
  const report = findings.map(f => `[${f.severity}] [${f.category}] ${f.message}${f.detail ? ' — ' + f.detail : ''}`).join('\n');
  fs.writeFileSync('C:/Users/e.nwaka/fightos/test-report.txt', report);
  console.log('Report saved to: test-report.txt');

  await browser.close();
})();
