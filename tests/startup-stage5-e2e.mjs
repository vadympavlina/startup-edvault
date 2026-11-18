// Браузерна перевірка етапу 5 «Гроші на старт»: нове оформлення вправ (одне пояснення, смужка кроків, підказки «?», рядки вибору).
//   node tests/startup-stage5-e2e.mjs
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
const range = (sel, v) => p.evaluate(([sel, v]) => { const el = document.querySelector(sel); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }, [sel, v]);

await p.goto(server.url + '/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector('.wizard');
await p.click('[data-w="next"]'); await p.click('[data-w="next"]'); await p.fill('[data-w="name"]', 'Марта'); await p.fill('[data-w="company"]', 'Записатись'); await p.click('[data-w="next"]');
await p.waitForSelector('#main .ws');
await p.evaluate(() => { window.Startup.sim.s.flags.st9 = 4; });

await step('кожна вправа етапу має одне пояснення й кроки, без старих блоків «Що робити» та «Що зробити»', async () => {
  for (const [ex, n] of [['sources', 3], ['equity', 3], ['grants', 3], ['pitch', 3], ['negotiate', 3]]) {
    await go('ex-' + ex); await p.waitForSelector(`.ex[data-ex-root="${ex}"]`);
    assert.equal(await p.locator('.ex-intro.neo').count(), 1, ex);
    assert.match(await p.locator('.ex-intro.neo p').innerText(), /^Про що це\./, ex);
    assert.equal(await p.locator('.ex-steps li').count(), n, ex + ': кроки');
    assert.equal(await p.locator('.ex-help, .ex-map').count(), 0, ex + ': старих блоків немає');
    assert.equal(await p.locator('.x-tip', { hasText: /^Підказка:/ }).count(), 0, ex + ': немає повторної «Підказки» над роботою');
  }
});

await step('джерела: галочка вмикає джерело й суми, кнопки сум рахують набір, кроки позначаються зробленими', async () => {
  await go('ex-sources'); await p.waitForSelector('.srow');
  assert.equal(await p.locator('.slist .srow').count(), 7, 'сім джерел');
  assert.match(await p.locator('.ex-steps li:nth-child(1) button').getAttribute('class') || '', /on/, 'перший крок активний');
  await p.click('.srow:has-text("Власні гроші") .sbtn');
  assert.equal(await p.locator('.srow:has-text("Власні гроші") .sbtn').getAttribute('aria-checked'), 'true');
  assert.equal((await S()).ex.d.sources.mix.own, 100000, 'типова сума');
  await p.click('.srow:has-text("Власні гроші") .xp:has-text("200 тис.")');
  assert.equal((await S()).ex.d.sources.mix.own, 200000);
  await p.click('.srow:has-text("Родина й друзі") .sbtn');
  assert.match(await p.locator('.sumb .sb-t b').innerText(), /%/);
  await p.click('.srow:has-text("Родина й друзі") .xp:has-text("100 тис.")');
  assert.match(await p.locator('.ex-steps li:nth-child(2) button').getAttribute('class') || '', /done/, 'крок «Звідки взяти» зроблено');
  await p.click('.srow:has-text("Родина й друзі") .sbtn');
  assert.equal((await S()).ex.d.sources.mix.fff, 0, 'повторний клік знімає галочку');
  await p.click('.srow:has-text("Родина й друзі") .sbtn');
});

await step('підказка «?»: відкривається на місці, пам’ятається після перемальовування, закривається', async () => {
  const q = p.locator('.srow:has-text("Краудфандинг") .q');
  assert.equal(await q.getAttribute('aria-expanded'), 'false');
  assert.equal(await p.locator('.srow:has-text("Краудфандинг") .qh').isVisible(), false);
  await q.click();
  assert.equal(await q.getAttribute('aria-expanded'), 'true');
  assert.match(await p.locator('.srow:has-text("Краудфандинг") .qh').innerText(), /Простими словами/);
  await p.click('.srow:has-text("Власні гроші") .xp:has-text("300 тис.")');   // перемальовування
  assert.equal(await p.locator('.srow:has-text("Краудфандинг") .qh').isVisible(), true, 'лишилась відкритою');
  await p.locator('.srow:has-text("Краудфандинг") .q').click();
  assert.equal(await p.locator('.srow:has-text("Краудфандинг") .qh').isVisible(), false);
  await p.click('.srow:has-text("Власні гроші") .xp:has-text("200 тис.")');
});

await step('джерела: крок «Підсумок» і завершення вправи', async () => {
  await p.fill('[data-exi="sources"][data-p="why"]', 'Починаємо зі своїх грошей і допомоги родини, без кредитів.');
  assert.match(await p.locator('.ex-foot .btn.primary').innerText(), /Завершити вправу/);
  assert.match(await p.locator('.ex-steps li:nth-child(3) button').getAttribute('class') || '', /done/);
  await p.click('.ex-foot .btn.primary'); await p.waitForSelector('#main .ws');
  assert.ok((await S()).ex.done.sources);
});

await step('гроші від інвестора: повзунки, пояснення суми й частки, три питання', async () => {
  await go('ex-equity'); await p.waitForSelector('.ex[data-ex-root="equity"]');
  await range('[data-exi="equity"][data-p="pct"]', 20);
  assert.match(await p.locator('.ex-steps li:nth-child(2) button').getAttribute('class') || '', /done/);
  await p.locator('.q').first().click();
  assert.match(await p.locator('.qh:visible').innerText(), /Простими словами/);
  for (const [i, k] of [[0, 0], [1, 1], [2, 1]]) await p.click(`.quiz:nth-of-type(${i + 1}) .xp >> nth=${k}`);
  assert.match(await p.locator('.ex-steps li:nth-child(3) button').getAttribute('class') || '', /done/);
});

await step('гранти: конкурси вибираються як рядки-«радіо», умови, заявка й подання', async () => {
  await go('ex-grants'); await p.waitForSelector('.srow.pick');
  assert.equal(await p.locator('.srow.pick').count(), 4);
  await p.click('.srow.pick:has-text("Шкільний конкурс") .sbtn');
  assert.equal((await S()).ex.d.grants.prog, 'school');
  assert.equal(await p.locator('.srow.pick:has-text("Шкільний конкурс") .sbtn').getAttribute('aria-checked'), 'true');
  const text = 'Школярі витрачають по 2 години на домашку й не розуміють пояснень учителя, тому втрачають інтерес до навчання.';
  for (const k of ['problem', 'solution', 'team', 'plan']) await p.fill(`[data-exi="grants"][data-p="a.school.${k}"]`, k === 'plan' ? 'Реклама 40%, розробка 60%. За 6 місяців 500 користувачів і 50 платних клієнтів.' : text);
  assert.match(await p.locator('.ex-steps li:nth-child(2) button').getAttribute('class') || '', /done/);
  await p.click('[data-do="submit"]');
  await p.waitForSelector('.jury');
  assert.match(await p.locator('.ex-steps li:nth-child(3) button').getAttribute('class') || '', /done/);
});

await step('пітч і переговори: підказки біля частин, кроки', async () => {
  await go('ex-pitch'); await p.waitForSelector('.ex[data-ex-root="pitch"]');
  assert.equal(await p.locator('.xbox .q').count(), 6, 'біля кожної частини пітчу є «?»');
  await p.locator('.xbox .q').nth(3).click(); assert.match(await p.locator('.qh:visible').innerText(), /Приклад/);
  await go('ex-negotiate'); await p.waitForSelector('.ex[data-ex-root="negotiate"]');
  await p.click('.xp:has-text("Є працюючий прототип")');
  assert.match(await p.locator('.ex-steps li:nth-child(1) button').getAttribute('class') || '', /done/);
  await p.click('[data-do="offer"]'); await p.waitForTimeout(100);
  assert.match(await p.locator('.ex-steps li:nth-child(2) button').getAttribute('class') || '', /done/);
});

await step('крок у смужці веде до свого розділу', async () => {
  await go('ex-sources'); await p.waitForSelector('.ex-steps');
  await p.click('.ex-steps li:nth-child(3) button'); await p.waitForTimeout(200);
  assert.ok(await p.locator('.ex-body .xbox').nth(2).evaluate(e => e.classList.contains('ex-flash') || e.getBoundingClientRect().top < innerHeight));
});

assert.deepEqual(errors, [], 'помилки консолі: ' + errors.join('; '));
await browser.close(); server.close();
console.log('готово');
