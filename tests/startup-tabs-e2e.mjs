// Надійність: дві вкладки з однією грою не затирають одна одну, а резервна копія тижня рятує пошкоджене збереження.
//   node tests/startup-tabs-e2e.mjs
import assert from 'node:assert/strict';
import { startServer, launch, newPage, step } from './_harness.mjs';

const server = await startServer(), browser = await launch(), errors = [];
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const a = await newPage(ctx, errors); a.setDefaultTimeout(10000);
await a.goto(server.url + '/'); await a.evaluate(() => localStorage.clear()); await a.reload(); await a.waitForSelector('.wizard');
await a.click('[data-w="next"]'); await a.click('[data-w="next"]'); await a.fill('[data-w="name"]', 'Марта'); await a.fill('[data-w="company"]', 'Записатись'); await a.click('[data-w="next"]');
await a.waitForSelector('#main .ws'); await a.evaluate(() => { window.Startup.sim.s.flags.simStarted = true; window.Startup.C.render(); });

await step('друга вкладка змінює гру: перша не пише й питає, що робити', async () => {
  const b = await ctx.newPage(); await b.goto(server.url + '/'); await b.waitForSelector('#main .ws');
  await b.evaluate(() => { window.Startup.sim.s.cash += 1234; window.Startup.C.save(); });
  await a.waitForSelector('.stale-bar');
  const before = await a.evaluate(() => localStorage.getItem('edvault-startup'));
  await a.evaluate(() => { window.Startup.sim.s.cash += 7; window.Startup.C.save(); });
  assert.equal(await a.evaluate(() => localStorage.getItem('edvault-startup')), before, 'збереження заблоковано');
  await a.click('[data-stale="keep"]');
  assert.equal(await a.locator('.stale-bar').count(), 0);
  await a.evaluate(() => { window.Startup.sim.s.cash += 1; window.Startup.C.save(); });
  assert.notEqual(await a.evaluate(() => localStorage.getItem('edvault-startup')), before, 'після вибору знову зберігає');
  await b.close();
});

await step('резервна копія створюється на початку тижня й відновлює гру', async () => {
  await a.click('[data-act="endWeek"]');
  await a.waitForSelector('.md, .md-back', { timeout: 5000 }).catch(() => {});
  assert.ok(await a.evaluate(() => !!localStorage.getItem('edvault-startup-prev')), 'копію записано');
  await a.evaluate(() => localStorage.setItem('edvault-startup', '{ломаний'));
  const c = await ctx.newPage(); await c.goto(server.url + '/'); await c.waitForSelector('.recovery');
  await c.click('[data-rec="backup"]');
  await c.waitForSelector('#main .ws');
  await c.close();
});

assert.deepEqual(errors, [], 'помилки консолі: ' + errors.join('; '));
await browser.close(); server.close();
console.log('готово');
