// Браузерна перевірка етапу 9 «Платежі й капітал»: нове оформлення вправ (одне пояснення, кроки, підказки «?»).
//   node tests/startup-stage9-e2e.mjs
import assert from 'node:assert/strict';
import { startServer, launch, newPage, step } from './_harness.mjs';

const server = await startServer();
const browser = await launch();
const errors = [];
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const p = await newPage(ctx, errors);
p.setDefaultTimeout(10000);
const S = () => p.evaluate(() => JSON.parse(JSON.stringify(window.Startup.sim.s)));
const go = v => p.evaluate(v => window.Startup.C.go(v), v);
const cls = n => p.locator(`.ex-steps li:nth-child(${n}) button`).getAttribute('class').then(c => c || '');

await p.goto(server.url + '/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector('.wizard');
await p.click('[data-w="next"]'); await p.click('[data-w="next"]'); await p.fill('[data-w="name"]', 'Марта'); await p.fill('[data-w="company"]', 'Записатись'); await p.click('[data-w="next"]');
await p.waitForSelector('#main .ws');
await p.evaluate(() => { window.Startup.sim.s.flags.st9 = 8; });

await step('усі шість вправ: одне пояснення й кроки, без старих блоків', async () => {
  for (const ex of ['paytools', 'money', 'portfolio', 'trading', 'scam', 'compound']) {
    await go('ex-' + ex); await p.waitForSelector(`.ex[data-ex-root="${ex}"]`);
    assert.equal(await p.locator('.ex-intro.neo').count(), 1, ex);
    assert.equal(await p.locator('.ex-steps li').count(), 3, ex + ': кроки');
    assert.equal(await p.locator('.ex-help, .ex-map').count(), 0, ex + ': старих блоків немає');
    assert.equal(await p.locator('.bx-h:not(:has-text("Список умов"))').count(), 0, ex + ': немає дубльованих підказок');
    assert.ok(await p.locator('.hl5').count() >= 1, ex + ': є пояснення біля розділів');
    assert.ok(await p.locator('.q').count() >= 1, ex + ': є «?»');
  }
});

await step('шахрайство: оцінка повідомлень і правила', async () => {
  await go('ex-scam'); await p.waitForSelector('.quiz');
  const n = await p.locator('.quiz').count();
  for (let i = 0; i < n; i++) await p.locator('.quiz').nth(i).locator('.xp').first().click();
  assert.match(await cls(1), /done/);
  await p.locator('.xbox:has-text("Мої правила безпеки") .xp').nth(0).click();
  await p.locator('.xbox:has-text("Мої правила безпеки") .xp').nth(1).click();
  await p.locator('.xbox:has-text("Мої правила безпеки") .xp').nth(2).click();
  assert.match(await cls(3), /done/);
});

await step('час і відсотки: підказка «?» розкривається', async () => {
  await go('ex-compound'); await p.waitForSelector('.q');
  await p.click('.q >> nth=0');
  assert.match(await p.locator('.qh:visible').innerText(), /Простими словами/);
});

assert.deepEqual(errors, [], 'помилки консолі: ' + errors.join('; '));
await browser.close(); server.close();
console.log('готово');
