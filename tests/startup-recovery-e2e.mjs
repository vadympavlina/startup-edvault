// Надійність: пошкоджене збереження не дає порожньої сторінки, розділ із поганими даними не валить гру.
//   node tests/startup-recovery-e2e.mjs
import assert from 'node:assert/strict';
import { startServer, launch, newPage, step } from './_harness.mjs';

const server = await startServer(), browser = await launch(), errors = [];
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const p = await newPage(ctx, errors); p.setDefaultTimeout(10000);
await p.goto(server.url + '/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector('.wizard');

await step('сміття замість збереження: екран відновлення, копія збережена', async () => {
  await p.evaluate(() => localStorage.setItem('edvault-startup', '{ломаний json'));
  await p.reload(); await p.waitForSelector('.recovery');
  assert.equal(await p.evaluate(() => localStorage.getItem('edvault-startup-broken')), '{ломаний json');
  assert.equal(await p.locator('[data-rec]').count(), 3);
  await p.click('[data-rec="new"]'); await p.waitForSelector('.wizard');
});

await step('збереження з пошкодженими полями відкривається й виправляється', async () => {
  await p.click('[data-w="next"]'); await p.click('[data-w="next"]'); await p.fill('[data-w="name"]', 'Марта'); await p.fill('[data-w="company"]', 'Записатись'); await p.click('[data-w="next"]'); await p.waitForSelector('#main .ws');
  await p.evaluate(() => { const k = 'edvault-startup', d = JSON.parse(localStorage.getItem(k)); d.s.candidates = 'ой'; d.s.team = [null, { name: 5, role: 'xx' }]; d.s.landing.test = 'рядок'; d.s.founder.bg = 'нема'; d.s.sprint = {}; localStorage.setItem(k, JSON.stringify(d)); });
  await p.reload(); await p.waitForSelector('#main');
  for (const v of ['dash', 'team', 'marketing', 'product', 'report']) { await p.evaluate(v => window.Startup.C.go(v), v); await p.waitForTimeout(60); }
  assert.equal(await p.locator('.fail-card').count(), 0, 'розділи показані без картки помилки');
  assert.equal(await p.locator('.recovery').count(), 0);
});

await step('розділ, що кидає помилку, замінюється карткою, решта гри працює', async () => {
  await p.evaluate(() => { const S = window.Startup.sim; S.s.ex = { d: { niche: { pick: { a: 1 } } }, done: {} }; window.__orig = S.seg; S.seg = () => { throw new Error('тест'); }; window.Startup.C.go('product'); });
  await p.waitForTimeout(100);
  assert.ok(await p.locator('#main .fail-card').count() >= 1, 'є картка помилки');
  await p.evaluate(() => { const S = window.Startup.sim; delete S.seg; window.Startup.C.go('dash'); });
  await p.waitForTimeout(100);
  assert.equal(await p.locator('#main .fail-card').count(), 0);
});

await step('переповнене сховище: гра не падає, показує підказку один раз', async () => {
  await p.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('quota', 'QuotaExceededError'); }; window.Startup.C.render(); window.Startup.C.render(); });
  await p.waitForTimeout(200);
  assert.equal(await p.locator('.toast', { hasText: 'не зберіг прогрес' }).count(), 1);
});

const real = errors.filter(e => !/тест|quota|QuotaExceeded|Failed to load resource/.test(e));
await browser.close(); server.close();
assert.deepEqual(real, [], 'помилки сторінки');
console.log('усе гаразд');
