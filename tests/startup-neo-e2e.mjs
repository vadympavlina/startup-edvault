// Усі 52 вправи мають однакове оформлення: одне пояснення «Про що це» і смужку кроків, що реагує на заповнення.
//   node tests/startup-neo-e2e.mjs
import assert from 'node:assert/strict';
import { startServer, launch, newPage, step } from './_harness.mjs';

const server = await startServer(), browser = await launch(), errors = [];
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const p = await newPage(ctx, errors); p.setDefaultTimeout(10000);
await p.goto(server.url + '/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector('.wizard');
await p.click('[data-w="next"]'); await p.click('[data-w="next"]'); await p.fill('[data-w="name"]', 'Марта'); await p.fill('[data-w="company"]', 'Записатись'); await p.click('[data-w="next"]');
await p.waitForSelector('#main .ws');
await p.evaluate(() => { window.Startup.sim.s.flags.st9 = 8; window.Startup.sim.s.flags.simStarted = true; });

await step('усі вправи: «Про що це», кроки, без старої шапки', async () => {
  const ids = await p.evaluate(async () => (await import('/startupsim/js/ex-core.js')).exAll().map(e => e.id));
  assert.equal(ids.length, 52);
  const bad = [];
  for (const id of ids) {
    await p.evaluate(v => window.Startup.C.go(v), 'ex-' + id); await p.waitForSelector(`.ex[data-ex-root="${id}"]`);
    const r = await p.evaluate(() => ({ neo: document.querySelectorAll('.ex-intro.neo').length, steps: document.querySelectorAll('.ex-steps li').length, old: document.querySelectorAll('.ex-help, .ex-map').length }));
    if (r.neo !== 1 || r.steps < 2 || r.old) bad.push(`${id}: ${JSON.stringify(r)}`);
  }
  assert.deepEqual(bad, []);
});

await step('кроки відмічаються, коли вправу заповнено (приклад: SWOT, ціна, шахраї)', async () => {
  for (const id of ['niche', 'costs', 'price', 'usp', 'pr']) {
    await p.evaluate(async id => { const m = await import('/startupsim/js/ex-core.js'), S = window.Startup.sim; const FILL = (await import('/tests/fill.mjs')).makeFill(m.EX, m.X); FILL[id]?.(S, m.X(S, id)); window.Startup.C.go('ex-' + id); }, id);
    await p.waitForSelector(`.ex[data-ex-root="${id}"]`); await p.waitForTimeout(60);
    const [done, all] = await p.evaluate(() => [document.querySelectorAll('.ex-steps li button.done').length, document.querySelectorAll('.ex-steps li').length]);
    assert.ok(done >= all - 1 && done >= 1, `${id}: виконано ${done} з ${all}`);
  }
});

assert.deepEqual(errors, [], 'помилки консолі: ' + errors.join('; '));
await browser.close(); server.close();
console.log('готово');
