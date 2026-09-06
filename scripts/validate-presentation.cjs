// Run against a fresh development server; the diagnostic bridge is stripped from production.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const outputDir = process.env.PRESENTATION_OUTPUTS || 'presentation-evidence';
fs.mkdirSync(outputDir, { recursive: true });
const output = (name) => path.join(outputDir, name);
let browser;
(async () => {
  browser = await chromium.launch({
    executablePath: process.env.CHROME_EXECUTABLE || undefined,
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage(),
    errors = [],
    checks = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const check = (name, details) => checks.push({ name, result: 'PASS', details });
  const read = (fn) => page.evaluate(fn);
  await page.goto(process.env.PRESENTATION_URL || 'http://127.0.0.1:4303/CROWNMIND/');
  await page.getByRole('textbox', { name: 'World seed' }).fill('sovereign-table');
  await page.getByRole('button', { name: 'Awaken CROWNMIND' }).click();
  await page.waitForFunction(() => !!window.__crownmindPresentation);
  await read(async () => {
    const { useGameStore } = await import('/CROWNMIND/src/stores/gameStore.ts');
    useGameStore.getState().setSpeed(0);
    window.__testGame = useGameStore;
    const code = await (await fetch('/CROWNMIND/src/render/PixiApp.ts')).text();
    const url = code.match(/import \{ useUIStore \} from "([^"]+)"/)[1];
    const { useUIStore } = await import(url);
    window.__testUI = useUIStore;
  });
  assert.equal(await page.locator('canvas').count(), 1);
  check('StrictMode starts one live canvas');
  await page.waitForTimeout(500);
  const before = await read(() => {
    const a = window.__crownmindPresentation;
    return {
      x: a.camera.x,
      y: a.camera.y,
      width: a.app.screen.width,
      height: a.app.screen.height,
      anim: a.animationRenderer.getContainer().parent.label,
    };
  });
  assert.equal(before.anim, 'effects');
  await page.screenshot({ path: output('world-1920.png') });
  // All workspaces must open from one shortcut, render real content, and close with Escape.
  for (const [key, title] of [
    ['e', 'Economy'],
    ['t', 'Technology'],
    ['j', 'Objectives'],
    ['s', 'Squads'],
    ['q', 'Equipment'],
    ['k', 'Skills'],
    ['f', 'Factions'],
    ['d', 'Diplomacy'],
    ['g', 'Dungeons'],
    ['v', 'Rivals'],
    ['c', 'Cognition'],
    ['l', 'Chronicle'],
  ]) {
    await page.keyboard.press(key);
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    await page.waitForFunction(
      () => !document.body.textContent.includes('Opening the instrument…')
    );
    assert.match(await dialog.getAttribute('aria-label'), new RegExp(title));
    assert.ok((await dialog.innerText()).length > 40);
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
  }
  check('All 12 workspaces and keyboard shortcuts');
  await page.getByRole('button', { name: 'Open Sovereign cognition' }).click();
  const firstFocus = await read(() => document.activeElement.getAttribute('aria-label'));
  await page.keyboard.press('Shift+Tab');
  assert.equal(await read(() => !!document.activeElement.closest('[role="dialog"]')), true);
  await page.keyboard.press('Tab');
  assert.equal(await read(() => document.activeElement.getAttribute('aria-label')), firstFocus);
  await page.keyboard.press('Escape');
  assert.equal(
    await read(() => document.activeElement.getAttribute('aria-label')),
    'Open Sovereign cognition'
  );
  check('Modal focus wraps and restores the invoking button');
  await read(() => {
    window.__presentationStable = {
      terrain: window.__crownmindPresentation.sceneManager.terrainLayer.children[0],
      entity: window.__crownmindPresentation.sceneManager.entityLayer.children[1],
      activity: window.__crownmindPresentation.animationRenderer.getContainer(),
      state: JSON.stringify(window.__testGame.getState().state),
    };
  });
  await page.waitForTimeout(500);
  assert.equal(
    await read(
      () => JSON.stringify(window.__testGame.getState().state) === window.__presentationStable.state
    ),
    true
  );
  for (const speed of [1, 2, 4]) {
    const clock = await read(
      () =>
        window.__testGame.getState().state.day * 100 + window.__testGame.getState().state.timeOfDay
    );
    await page.evaluate((speed) => window.__testGame.getState().setSpeed(speed), speed);
    await page.waitForTimeout(1200);
    assert.ok(
      (await read(
        () =>
          window.__testGame.getState().state.day * 100 +
          window.__testGame.getState().state.timeOfDay
      )) > clock
    );
  }
  await read(() => window.__testGame.getState().setSpeed(0));
  assert.equal(
    await read(() => {
      const a = window.__crownmindPresentation,
        s = window.__presentationStable;
      return (
        a.sceneManager.terrainLayer.children[0] === s.terrain &&
        a.sceneManager.entityLayer.children[1] === s.entity &&
        a.animationRenderer.getContainer() === s.activity
      );
    }),
    true
  );
  check('Pause and 1×/2×/4× updates preserve persistent scene objects');
  // A selected hero opens context without resizing the world. Exact displayed coordinates avoid interpolation races.
  const hero = await read(() => {
    const s = window.__testGame.getState().state;
    const id = Number(Object.keys(s.world.entities).find((id) => s.world.entities[id].HeroAI));
    const a = window.__crownmindPresentation,
      p = a.entityRenderer.position(id),
      screen = a.camera.worldToScreen(p.x, p.y),
      rect = a.app.canvas.getBoundingClientRect();
    return {
      id,
      name: s.world.entities[id].Name.name,
      x: screen.x + rect.left,
      y: screen.y + rect.top,
    };
  });
  await page.mouse.click(hero.x, hero.y);
  await page.getByRole('complementary', { name: 'Contextual inspector' }).waitFor();
  assert.equal(await read(() => window.__testUI.getState().selection.entityId), hero.id);
  assert.equal(await read(() => window.__crownmindPresentation.app.screen.width), before.width);
  check('Map hit testing and inspector preserve canvas size', hero.name);
  await page.screenshot({ path: output('presentation-inspector.png') });
  await page.getByRole('button', { name: 'Close inspector', exact: true }).click();
  await page.getByRole('button', { name: 'Follow selected', exact: true }).click();
  await read(() => {
    const g = window.__testGame.getState();
    g.setSpeed(4);
  });
  await page.waitForTimeout(1300);
  const follow = await read(() => {
    const a = window.__crownmindPresentation,
      id = window.__testUI.getState().selection.entityId,
      p = a.entityRenderer.position(id);
    return {
      distance: Math.hypot(a.camera.x - p.x, a.camera.y - p.y),
      active: window.__testUI.getState().followSelected,
    };
  });
  assert.equal(follow.active, true);
  assert.ok(follow.distance < 1.5);
  check('Follow tracks the moving entity', follow);
  await page.mouse.move(1000, 600);
  await page.mouse.down();
  await page.mouse.move(1100, 650, { steps: 8 });
  await page.mouse.up();
  assert.equal(await read(() => window.__testUI.getState().followSelected), false);
  check('Manual drag releases follow and suspends director');
  await read(() => window.__testGame.getState().setSpeed(0));
  await page.getByRole('button', { name: 'Recenter on Pyahhold' }).click();
  await page.waitForTimeout(1800);
  const centered = await read(() => {
    const a = window.__crownmindPresentation,
      s = window.__testGame.getState().state,
      p = s.world.entities[s.townHallEntityId].Position;
    return Math.hypot(a.camera.x - p.x - 0.5, a.camera.y - p.y - 0.5);
  });
  assert.ok(centered < 0.2);
  check('Recenter returns to Pyahhold');
  for (const mode of [
    'threat',
    'bounties',
    'heroes',
    'fog',
    'resources',
    'sovereign',
    'diplomacy',
    'dungeons',
    'none',
  ])
    await page.getByRole('combobox', { name: 'Map overlay' }).selectOption(mode);
  check('All nine overlay modes');
  // Inspect stored world without advancing the simulation; stage a documented presentation-only weather/Spire fixture.
  await read(() => {
    const g = window.__testGame.getState(),
      s = structuredClone(g.state);
    s.config = g.state.config;
    s.weather.current = 'storm';
    s.timeOfDay = 85;
    const id = s.spireEntityId;
    s.world.entities[id].Lair.isDiscovered = true;
    s.sovereignMind.phase = 'spirePreparation';
    const p = s.world.entities[id].Position;
    for (let x = Math.max(0, p.x - 7); x < Math.min(s.mapSize, p.x + 8); x++)
      for (let y = Math.max(0, p.y - 7); y < Math.min(s.mapSize, p.y + 8); y++)
        s.grid[x][y].isExplored = true;
    window.__testGame.setState({ state: s });
    window.__testUI.getState().setCameraTarget({ x: p.x, y: p.y });
  });
  await page.waitForTimeout(2000);
  const spire = await read(() => {
    const a = window.__crownmindPresentation,
      s = window.__testGame.getState().state,
      p = s.world.entities[s.spireEntityId].Position;
    return {
      distance: Math.hypot(a.camera.x - p.x, a.camera.y - p.y),
      emitters: a.animationRenderer.emitters.filter((e) => e.kind === 'Spire').length,
    };
  });
  assert.ok(spire.distance < 0.2);
  assert.equal(spire.emitters, 1);
  await page.screenshot({ path: output('presentation-spire.png') });
  check('Storm, night lighting, discovered Spire and phase contamination fixture', spire);
  for (const weather of ['rain', 'snow', 'fog', 'clear']) {
    await read(async () => {});
    await page.evaluate((weather) => {
      const g = window.__testGame.getState();
      window.__testGame.setState({
        state: { ...g.state, weather: { ...g.state.weather, current: weather } },
      });
    }, weather);
    await page.waitForTimeout(150);
  }
  check('All weather types render');
  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.getByRole('radio', { name: 'Low', exact: true }).click();
  const saveSettings = page.getByRole('dialog').getByRole('button', { name: /save/i });
  await saveSettings.click();
  await page.waitForTimeout(500);
  const low = await read(() => window.__crownmindPresentation.diagnostics());
  assert.equal(low.resolution, 1);
  assert.ok(low.motes <= 24);
  check('Low quality applies immediately', low);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  const reduced = await read(() => window.__crownmindPresentation.diagnostics());
  assert.equal(reduced.motes, 0);
  check('Reduced motion removes traveling ambient motes', reduced);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 2560, height: 1440 },
  ]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(200);
    const overflow = await read(() => ({
      w: document.documentElement.scrollWidth,
      h: document.documentElement.scrollHeight,
      iw: innerWidth,
      ih: innerHeight,
    }));
    assert.equal(overflow.w, overflow.iw);
    assert.equal(overflow.h, overflow.ih);
    await page.screenshot({ path: output(`world-${viewport.width}.png`) });
    await page.getByRole('button', { name: 'Open Sovereign cognition' }).click();
    await page.screenshot({ path: output(`mind-${viewport.width}.png`) });
    await page.keyboard.press('Escape');
  }
  check('1280×720 through 2560×1440 layout without page overflow');
  await page.setViewportSize({ width: 1600, height: 900 });
  // Repeated transitions preserve one canvas and dispose old GPU applications/listeners.
  for (let i = 0; i < 3; i++) {
    await read(() => window.__testGame.getState().resetToSetup());
    await page.getByRole('button', { name: 'Awaken CROWNMIND' }).waitFor();
    assert.equal(await page.locator('canvas').count(), 0);
    await page.getByRole('button', { name: 'Awaken CROWNMIND' }).click();
    await page.waitForFunction(() => !!window.__crownmindPresentation);
    await read(() => window.__testGame.getState().setSpeed(0));
    assert.equal(await page.locator('canvas').count(), 1);
  }
  check('Three setup / run lifecycle cycles');
  // A fresh scene has no manual-camera lease; a real discovery transition must drive a shot.
  await read(() => {
    const g = window.__testGame.getState(),
      s = structuredClone(g.state);
    s.config = g.state.config;
    s.world.entities[s.spireEntityId].Lair.isDiscovered = true;
    window.__testGame.setState({ state: s });
  });
  await page.waitForTimeout(2400);
  const directed = await read(() => {
    const a = window.__crownmindPresentation,
      s = window.__testGame.getState().state,
      p = s.world.entities[s.spireEntityId].Position;
    return Math.hypot(a.camera.x - p.x, a.camera.y - p.y);
  });
  assert.ok(directed < 0.2);
  check('Discovery event drives an automatic Director shot', { distance: directed });
  await read(() => {
    const a = window.__crownmindPresentation;
    a.camera.easeTo(a.camera.x - 10, a.camera.y, true);
  });
  await page.waitForTimeout(100);
  await page.getByRole('button', { name: 'Director mode', exact: true }).click();
  await page.waitForTimeout(100);
  const stopped = await read(() => window.__crownmindPresentation.camera.x);
  await page.waitForTimeout(400);
  assert.equal(await read(() => window.__crownmindPresentation.camera.x), stopped);
  check('Disabling Director cancels an in-flight shot');
  // Save serializer and IndexedDB round trip, followed by app reload and setup loading.
  await read(async () => {
    const { serializeSave } = await import('/CROWNMIND/src/persistence/SaveSerializer.ts');
    const { saveToDB } = await import('/CROWNMIND/src/persistence/IndexedDBAdapter.ts');
    const s = structuredClone(window.__testGame.getState().state);
    s.gameSpeed = 0;
    const saved = serializeSave(s, 'Presentation validation');
    window.__savedString = JSON.stringify(s);
    await saveToDB(saved);
  });
  const savedString = await read(() => window.__savedString);
  await page.reload();
  await page.getByRole('button', { name: 'Load saved game' }).click();
  await page.getByRole('button', { name: /Load save Presentation validation/ }).click();
  await page.waitForFunction(() => !!window.__crownmindPresentation);
  const loaded = await read(async () => {
    const { useGameStore } = await import('/CROWNMIND/src/stores/gameStore.ts');
    window.__testGame = useGameStore;
    return JSON.stringify(useGameStore.getState().state);
  });
  assert.equal(loaded, savedString);
  check('IndexedDB save survives reload and loads without schema changes');
  await page.waitForTimeout(3500);
  const final = await read(() => window.__crownmindPresentation.diagnostics());
  assert.ok(final.persistentAnimationAttached);
  check('Persistent effects root survives state updates and reload', final);
  assert.deepEqual(errors, []);
  check('No browser page errors');
  fs.writeFileSync(
    output('runtime-validation.json'),
    JSON.stringify({ browser: 'Chrome headless with WebGL', checks, errors, final }, null, 2)
  );
  console.log(JSON.stringify({ checks: checks.length, errors, final }));
  await browser.close();
})().catch(async (error) => {
  fs.writeFileSync(output('runtime-validation-failure.txt'), error.stack);
  console.error(error);
  await browser?.close();
  process.exitCode = 1;
});
