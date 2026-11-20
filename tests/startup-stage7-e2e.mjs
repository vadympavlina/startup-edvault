// Браузерна перевірка етапу 7 «Команда»: нове оформлення вправ (одне пояснення, кроки, підказки «?»).
//   node tests/startup-stage7-e2e.mjs
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
await p.evaluate(() => { window.Startup.sim.s.flags.st9 = 6; });

await step('усі шість вправ: одне пояснення й кроки, без старих блоків', async () => {
  for (const ex of ['leadership', 'roles', 'agile', 'hiring', 'remote', 'conflict']) {
    await go('ex-' + ex); await p.waitForSelector(`.ex[data-ex-root="${ex}"]`);
    assert.equal(await p.locator('.ex-intro.neo').count(), 1, ex);
    assert.equal(await p.locator('.ex-steps li').count(), 3, ex + ': кроки');
    assert.equal(await p.locator('.ex-help, .ex-map').count(), 0, ex + ': старих блоків немає');
    assert.equal(await p.locator('.bx-h').count(), 0, ex + ': немає дубльованих підказок під заголовками');
  }
});

await step('Agile: крок «Kanban» перемикає вкладку', async () => {
  await go('ex-agile'); await p.waitForSelector('.ex-steps');
  await p.click('.ex-steps li:nth-child(2) button');
  assert.ok(await p.locator('.xbox:has-text("Kanban-дошка")').count() >= 1);
  await p.click('.ex-steps li:nth-child(3) button');
  assert.ok(await p.locator('.xbox:has-text("Коли що обирати")').count() >= 1);
});

await step('лідерство: вісім відповідей, профіль, стиль і правило', async () => {
  await go('ex-leadership'); await p.waitForSelector('.xbox');
  assert.equal(await p.locator('.ex-body .xbox').count(), 8);
  for (let i = 0; i < 8; i++) await p.locator('.ex-body .xbox').nth(i).locator('.xp').first().click();
  assert.match(await cls(1), /done/);
  await p.waitForSelector('.xbox:has-text("Ваш профіль")');
  await p.click('.xbox:has-text("Ваш профіль") .xp >> nth=0');
  await p.fill('[data-exi="leadership"][data-p="rule"]', 'У кризі рішення приймаю я, у спокійний час радимось.');
  assert.match(await cls(3), /done/);
  await p.click('.q >> nth=0'); assert.ok(await p.locator('.qh:visible').count() >= 1);
});

await step('ролі: перед розподілом немає аналізу, вибір найму галочками', async () => {
  await go('ex-roles'); await p.waitForSelector('.xbox');
  assert.equal(await p.locator('.slist .srow').count(), 0);
  assert.equal(await p.locator('.xbox:has-text("Аналіз")').count(), 0);
});

assert.deepEqual(errors, [], 'помилки консолі: ' + errors.join('; '));
await browser.close(); server.close();
console.log('готово');
