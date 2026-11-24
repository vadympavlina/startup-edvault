// Власна ідея: заготовки в майстрі й вправи без чужих прикладів.
//   node tests/startup-custom-e2e.mjs
import assert from 'node:assert/strict';
import { startServer, launch, newPage, step } from './_harness.mjs';

const server = await startServer(), browser = await launch(), errors = [];
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const p = await newPage(ctx, errors); p.setDefaultTimeout(10000);
await p.goto(server.url + '/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector('.wizard');

await step('заготовка заповнює майстер, її можна пройти до кінця', async () => {
  await p.click('[data-w="next"]');                       // привітання → ніша
  await p.click('[data-w="idea"][data-v="custom"]'); await p.click('[data-w="next"]');
  await p.waitForSelector('.wz-ex');
  assert.equal(await p.locator('.wz-ex .chip-btn').count(), 4);
  await p.click('.wz-ex [data-v="candles"]');
  assert.equal(await p.inputValue('[data-c="name"]'), 'Свічки ручної роботи');
  await p.click('[data-w="next"]'); await p.waitForSelector('[data-c="segments.0.name"]');
  assert.equal(await p.inputValue('[data-c="segments.0.name"]'), 'Студенти');
  await p.click('[data-w="next"]'); await p.waitForSelector('[data-c="features.0.name"]');
  await p.click('[data-w="next"]'); await p.waitForSelector('[data-w="company"]');
  await p.fill('[data-w="name"]', 'Марта'); await p.fill('[data-w="company"]', 'Світло'); await p.click('[data-w="next"]');
  await p.waitForSelector('#main .ws');
  const s = await p.evaluate(() => JSON.parse(JSON.stringify(window.Startup.sim.s)));
  assert.equal(s.idea, 'custom');
});

await step('вправи власної ідеї без прикладів про домашку', async () => {
  await p.evaluate(() => { window.Startup.sim.s.flags.st9 = 8; });
  for (const ex of ['strategy', 'needs', 'usp', 'bbook', 'market', 'niche', 'mvp', 'logo', 'ad', 'abtest', 'pr', 'grants', 'pitch']) {
    await p.evaluate(v => window.Startup.C.go(v), 'ex-' + ex); await p.waitForTimeout(80);
    assert.equal(await p.locator('.ex[data-ex-root="' + ex + '"]').count(), 1, ex + ': сторінку відкрито');
    await p.waitForTimeout(80);
    const bad = await p.evaluate(() => { const m = document.querySelector('#main'); if (!m) return ''; const c = m.cloneNode(true); c.querySelectorAll('.ex-eg, .qh').forEach(e => e.remove()); const t = c.innerText + [...c.querySelectorAll('[placeholder]')].map(e => e.placeholder).join(' '); const r = t.match(/.{0,30}(домашк|школяр).{0,30}/i); return r ? r[0] : ''; });
    assert.equal(bad, '', ex + ': ' + bad);
  }
});

assert.deepEqual(errors, [], 'помилки консолі: ' + errors.join('; '));
await browser.close(); server.close();
console.log('готово');
