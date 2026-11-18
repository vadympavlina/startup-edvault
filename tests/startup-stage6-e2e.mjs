// Браузерна перевірка етапу 6 «Просування»: нове оформлення вправ (одне пояснення, кроки, підказки «?», рядки вибору).
//   node tests/startup-stage6-e2e.mjs
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
await p.evaluate(() => { window.Startup.sim.s.flags.st9 = 5; });

await step('усі шість вправ: одне пояснення й кроки, без старих блоків, без дубля підказок під заголовками', async () => {
  for (const ex of ['channels', 'funnel', 'promomix', 'ad', 'abtest', 'journey']) {
    await go('ex-' + ex); await p.waitForSelector(`.ex[data-ex-root="${ex}"]`);
    assert.equal(await p.locator('.ex-intro.neo').count(), 1, ex);
    assert.equal(await p.locator('.ex-steps li').count(), 3, ex + ': кроки');
    assert.equal(await p.locator('.ex-help, .ex-map').count(), 0, ex + ': старих блоків немає');
    if (ex !== 'journey') assert.equal(await p.locator('.bx-h').count(), 0, ex + ': немає дубльованих підказок під заголовками');   // у «Подорожі» вони пояснюють кожен крок
    assert.ok(await p.locator('.q').count() >= 1, ex + ': є «?»');
  }
});

await step('план просування: галочки каналів, клітинки тижнів, бюджет, пояснення, завершення', async () => {
  await go('ex-channels'); await p.waitForSelector('.srow');
  assert.equal(await p.locator('.slist .srow').count(), 11);
  for (const n of ['Флаєри й афіші', 'Короткі відео', 'Власні соцмережі']) await p.click(`.srow:has-text("${n}") .sbtn`);
  assert.equal((await S()).ex.d.channels.sel.length, 3);
  assert.equal(await p.locator('table.cal tbody tr').count(), 3);
  assert.match(await cls(1), /done/, 'крок «Оберіть канали» зроблено (є онлайн і офлайн)');
  await p.click('.srow:has-text("Короткі відео") .q'); assert.match(await p.locator('.srow:has-text("Короткі відео") .qh').innerText(), /Простими словами/);
  await p.fill('[data-exi="channels"][data-p="why"]', 'Наша аудиторія сидить у соцмережах, а флаєри дешево дістануть сусідів.');
  assert.match(await cls(2), /done/); assert.match(await cls(3), /done/);
  await p.click('.ex-foot .btn.primary'); await p.waitForSelector('#main .ws');
  assert.ok((await S()).ex.done.channels);
});

await step('воронка: слабкий крок видно, зміни обираються галочками (до трьох)', async () => {
  await go('ex-funnel'); await p.waitForSelector('.slist .srow');
  assert.equal(await p.locator('.slist .srow').count(), 10);
  for (const n of ['Сильніший рекламний креатив', 'Швидкий сайт', 'Відгуки й приклади', 'Реєстрація в один клік']) await p.click(`.srow:has-text("${n}") .sbtn`);
  assert.equal((await S()).ex.d.funnel.picks.length, 3, 'не більше трьох');
  assert.match(await p.locator('.slist').evaluate(e => e.previousElementSibling ? e.previousElementSibling.innerText : ''), /Біля кожної/);
  await p.fill('[data-exi="funnel"][data-p="why"]', 'Найслабший крок — перехід на сайт, тому покращую креатив і сайт.');
  assert.match(await cls(3), /done/);
});

await step('акції: дві акції, порівняння, вибір найкращої, пояснення', async () => {
  await go('ex-promomix'); await p.waitForSelector('.promo');
  await p.click('.promo:nth-of-type(2) .xp:has-text("Подарунок до покупки")');
  assert.match(await cls(1), /done/, 'перша й друга акція є');
  await p.click('.nrow .xp >> nth=0');
  await p.fill('[data-exi="promomix"][data-p="why"]', 'Ця акція дає більше прибутку й менше б’є по ціні.');
  assert.match(await cls(3), /done/);
  await p.locator('.xbox:has-text("Порівняння") .q').first().click();
  assert.match(await p.locator('.qh:visible').innerText(), /Простими словами/);
});

await step('креатив: вигляд, текст, чек-лист', async () => {
  await go('ex-ad'); await p.waitForSelector('.poster');
  await p.click('.xp:has-text("Сторіс")');
  assert.match(await cls(1), /done/);
  await p.fill('[data-exi="ad"][data-p="head"]', 'Домашка за 5 хвилин, а не за 2 години');
  await p.fill('[data-exi="ad"][data-p="cta"]', 'Спробуй безкоштовно');
  assert.match(await cls(2), /done/); assert.match(await cls(3), /done/);
});

await step('A/B-тест і подорож клієнта: кроки й підказки', async () => {
  await go('ex-abtest'); await p.waitForSelector('.hl');
  await p.click('.hl:nth-of-type(1) .xp:has-text("Варіант A")'); await p.click('.hl:nth-of-type(4) .xp:has-text("Варіант B")');
  assert.match(await cls(1), /done/);
  await p.click('[data-do="run"]'); await p.waitForTimeout(100);
  assert.match(await cls(2), /done/);
  await go('ex-journey'); await p.waitForSelector('.xbox');
  const names = ['Реклама в соцмережах', 'Сайт із цінами', 'Оплата в один клік', 'Підказки першого запуску', 'Реферальна програма'];
  for (const n of names) await p.click(`.xp:has-text("${n}")`);
  assert.match(await cls(1), /done/);
});

await step('крок у смужці веде до свого розділу', async () => {
  await go('ex-funnel'); await p.click('.ex-steps li:nth-child(3) button'); await p.waitForTimeout(200);
  assert.ok(await p.locator('.ex-body .xbox').nth(2).evaluate(e => e.classList.contains('ex-flash') || e.getBoundingClientRect().top < innerHeight));
});

assert.deepEqual(errors, [], 'помилки консолі: ' + errors.join('; '));
await browser.close(); server.close();
console.log('готово');
