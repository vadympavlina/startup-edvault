// Браузерна перевірка етапу 8 «Фриланс»: нове оформлення вправ (одне пояснення, кроки, підказки «?»).
//   node tests/startup-stage8-e2e.mjs
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
await p.evaluate(() => { window.Startup.sim.s.flags.st9 = 7; });

await step('усі п’ять вправ: одне пояснення й кроки, без старих блоків', async () => {
  for (const ex of ['exchanges', 'resume', 'client', 'fop', 'rate']) {
    await go('ex-' + ex); await p.waitForSelector(`.ex[data-ex-root="${ex}"]`);
    assert.equal(await p.locator('.ex-intro.neo').count(), 1, ex);
    assert.equal(await p.locator('.ex-steps li').count(), 3, ex + ': кроки');
    assert.equal(await p.locator('.ex-help, .ex-map').count(), 0, ex + ': старих блоків немає');
    assert.equal(await p.locator('.bx-h:not(:has-text("Список умов"))').count(), 0, ex + ': немає дубльованих підказок');
    assert.ok(await p.locator('.hl5').count() >= 1, ex + ': є пояснення біля розділів');
  }
});

await step('біржі: профіль, вибір майданчика, шахраї', async () => {
  await go('ex-exchanges'); await p.waitForSelector('.srcard');
  await p.click('[data-exi="exchanges"][data-p="port"] >> xpath=..');
  assert.match(await cls(1), /done/);
  await p.click('.srcard >> nth=1 >> .xp');
  await p.fill('[data-exi="exchanges"][data-p="why"]', 'Українською, менше конкуренції й є безпечна угода.');
  assert.match(await cls(2), /done/);
});

await step('ФОП: форма й кроки', async () => {
  await go('ex-fop'); await p.waitForSelector('.srcard');
  await p.click('.srcard >> nth=0 >> .xp');
  assert.match(await cls(1), /done/);
});

await step('Ціна години: кроки реагують на назви пакетів', async () => {
  await go('ex-rate'); await p.waitForSelector('.pkrow');
  const names = ['Старт', 'Стандарт', 'Преміум'];
  for (let i = 0; i < 3; i++) await p.fill(`[data-exi="rate"][data-p="pk.${i}.n"]`, names[i]);
  assert.match(await cls(1), /done/);
});

assert.deepEqual(errors, [], 'помилки консолі: ' + errors.join('; '));
await browser.close(); server.close();
console.log('готово');
