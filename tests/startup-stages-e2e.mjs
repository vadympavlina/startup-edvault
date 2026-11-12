// Браузерна перевірка етапів симулятора стартапу: маршрут, аркуш етапу, вправи, перетягування, збереження, телефон.
//   node tests/startup-stages-e2e.mjs
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

async function start(page = p) {
  await page.goto(server.url + '/'); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForSelector('.wizard');
  await page.click('[data-w="next"]'); await page.click('[data-w="next"]'); await page.fill('[data-w="name"]', 'Марта'); await page.fill('[data-w="company"]', 'Записатись'); await page.click('[data-w="next"]');
  await page.waitForSelector('#main .ws');
}
await start();

await step('маршрут: дев’ять етапів, закриті не відкриваються, аркуш показує справи й прогрес', async () => {
  assert.equal(await p.locator('.rail .rs').count(), 9);
  assert.equal(await p.locator('.rail button.rs').count(), 1, 'зараз відкритий лише перший етап');
  assert.equal(await p.locator('.rail .rs.lock').count(), 8, 'решту ще закрито');
  assert.match(await p.locator('.ws .k').innerText(), /Етап 1 з 9/i);
  assert.equal(await p.locator('.ws > .steps > .step').count(), 5);
  assert.match(await p.locator('.ws-prog small').innerText(), /0 з 5/);
  assert.match(await p.locator('.ws-next').innerText(), /етап 2 «Аудиторія й бренд»/);
  assert.equal(await p.locator('.ws .topics li').count(), 5);
  assert.equal(await p.locator('.ws-opt .step').count(), 3, 'додаткові справи згорнуто в окремий блок');
  assert.doesNotMatch(await p.locator('#main').innerText(), /[Уу]рок/, 'у тексті немає слова «урок»');
});

await step('вправа: відкривається зі справи, повертається до етапу, зберігає дані й завершується', async () => {
  await p.click('.ws .step:nth-child(1) .btn');
  await p.waitForSelector('.ex[data-ex-root="niche"]');
  assert.match(await p.locator('.pg-h').innerText(), /Чи варта ідея того/);
  assert.match(await p.locator('.ex-foot').innerText(), /Можна завершити й так/, 'пункти вправи необов’язкові');
  assert.match(await p.locator('.ex-foot .btn.primary').innerText(), /Завершити як є/);
  await p.click('.rdot[data-p="me.need"][data-v="4"]'); await p.click('.rdot[data-p="me.size"][data-v="5"]'); await p.click('.rdot[data-p="me.skill"][data-v="2"]');
  assert.equal((await S()).ex.d.niche.me.size, 5);
  assert.match(await p.locator('.big-n').innerText(), /%/, 'є загальна оцінка');
  await p.fill('[data-exi="niche"][data-p="why"]', 'Проблема болить школярам, а конкурентів небагато.');
  assert.match(await p.locator('.ex-foot .btn.primary').innerText(), /Завершити вправу/);
  await p.click('.ex-foot .btn.primary');
  await p.waitForSelector('#main .ws');
  assert.equal(await p.locator('.ws > .steps > .step.ok').count(), 1);
  assert.match(await p.locator('.ws-prog small').innerText(), /1 з 5/);
  assert.match(await p.locator('.rail .rs.cur small').innerText(), /1 з 5/);
  const s = await S();
  assert.ok(s.ex.done.niche && s.ex.done.niche.s >= 1);
  assert.equal(s.ex.d.niche.pickName.length > 2, true, 'назву вибраної ніші збережено');
});

await step('збереження: текст, який щойно набрали, не губиться при перезавантаженні сторінки', async () => {
  await go('ex-market');
  await p.waitForSelector('.ex[data-ex-root="market"]');
  const field = p.locator('[data-exi="market"][data-p="why"]');
  await field.fill('Ми швидші за репетиторів і дешевші за великі платформи.');
  await p.reload();
  await p.waitForSelector('.ex[data-ex-root="market"]');
  assert.match(await p.locator('[data-exi="market"][data-p="why"]').inputValue(), /швидші за репетиторів/);
  assert.equal((await S()).ex.done.niche != null, true, 'виконані вправи теж на місці');
});

await step('конкуренти: додати конкурента, оцінити кружечками, підказка фрази, порівняння', async () => {
  await go('ex-market');
  const n0 = (await S()).ex.d.market.comps.length;
  await p.click('.xchip:has-text("Роблять самі")');
  assert.equal((await S()).ex.d.market.comps.length, n0 + 1);
  await p.fill('#market-new', 'Власний сервіс'); await p.click('[data-do="addComp"]:not(.xchip)');
  assert.equal((await S()).ex.d.market.comps.length, n0 + 2);
  await p.click('.rcard.me .rrow:nth-of-type(1) .rdot >> nth=4');
  assert.equal((await S()).ex.d.market.me.r.price, 5, 'оцінка кружечком');
  assert.match(await p.locator('.cmpv').innerText(), /Ціна для клієнта/);
  await p.click('[data-do="hint"]');
  assert.match((await S()).ex.d.market.why, /^На відміну від «/);
  await p.click('[data-do="delComp"] >> nth=0');
  assert.equal((await S()).ex.d.market.comps.length, n0 + 1);
});

await step('що болить клієнтам: болі з оцінками, спосіб зараз, головна потреба', async () => {
  await go('ex-needs');
  await p.click('.xchip:has-text("Це дорого")'); await p.click('.xchip:has-text("Це забирає багато часу")');
  let d = (await S()).ex.d.needs; assert.equal(d.pains.length, 2);
  await p.click('.pli >> nth=1 >> .rdot >> nth=4'); await p.click('.pli >> nth=1 >> .xp:has-text("Щодня")');
  d = (await S()).ex.d.needs; assert.equal(d.pains[1].s, 5); assert.equal(d.pains[1].f, 'often');
  assert.match(await p.locator('.big-pain').innerText(), /Це забирає багато часу/, 'головна проблема — з найвищою важливістю');
  await p.click('.xp:has-text("списую")'); assert.equal((await S()).ex.d.needs.now.length, 1);
  await p.click('[data-do="fill"]');
  const j = (await S()).ex.d.needs.jtbd; assert.ok(j.when.length > 5 && j.want.length > 5 && j.so.length > 5, 'потреба підставлена');
  assert.match(await p.locator('.jt').innerText(), /Коли .*, я хочу .*, щоб /);
  await p.click('.ex-foot .btn.primary'); await p.waitForSelector('#main .ws');
  assert.ok((await S()).ex.done.needs, 'вправа виконана');
});

await step('канали: клітинки календаря перемикаються, підсумок рахується', async () => {
  await p.evaluate(() => { window.Startup.sim.s.flags.st9 = 8; window.Startup.C.render(); });
  await go('ex-channels');
  await p.click('.xp[data-v="social"]'); await p.click('.xp[data-v="ads"]'); await p.click('.xp[data-v="flyers"]');
  assert.equal(await p.locator('.cal tbody tr').count(), 3);
  const before = await p.locator('.cel.on').count();
  await p.click('.cel:not(.on) >> nth=0');
  assert.equal(await p.locator('.cel.on').count(), before + 1);
  assert.match(await p.locator('.kpis3').first().innerText(), /₴/);
});

await step('SMART-ціль: після завершення з’являється картка прогресу на головній', async () => {
  await go('ex-smart');
  await p.click('.xp[data-p="metric"][data-v="users"]');
  await p.fill('[data-exi="smart"][data-p="why"]', 'Так ми побачимо, чи є попит на продукт.');
  await p.waitForSelector('.ex-foot .btn.primary:not([aria-disabled])');
  await p.click('.ex-foot .btn.primary');
  await p.waitForSelector('.goalcard');
  assert.match(await p.locator('.goalcard').innerText(), /користувачів/);
  assert.ok((await S()).goal.target > 0);
});

await step('логотип: знак потрапляє в шапку гри', async () => {
  await go('ex-logo');
  await p.click('.bs-tabs [data-v="mark"]');
  await p.click('.bs-sh[data-v="hex"]'); await p.click('.sym[data-v="rocket"]');
  await p.click('.bs-tabs [data-v="color"]'); await p.click('.bs-pal >> nth=3');
  await p.click('.bs-tabs [data-v="check"]');
  assert.match(await p.locator('.bs-score').innerText(), /з 100/, 'є оцінка логотипа');
  await p.click('[data-do="saveVar"]');
  assert.equal(await p.locator('.bs-v').count(), 1, 'варіант збережено');
  await p.click('.ex-foot .btn.primary'); await p.waitForSelector('#main .ws');
  assert.equal((await S()).company.mk.shape, 'hex');
  assert.match(await p.locator('.tp-brand .lgm').getAttribute('style'), /clip-path/);
});

await step('логотип: власне зображення завантажується, потрапляє в шапку й зберігається', async () => {
  await go('ex-logo');
  await p.click('.bs-tabs [data-v="mark"]');
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.click('[data-do="pickImg"]')]);
  await fc.setFiles({ name: 'logo.png', mimeType: 'image/png', buffer: png });
  await p.waitForSelector('.imgfr img');
  assert.equal(await p.locator('.imgfr img').getAttribute('src').then(x => x.startsWith('data:image/')), true);
  await p.click('[data-do="rotImg"]'); await p.click('[data-do="flipImg"]');
  assert.equal((await S()).ex.d.logo.ed.rot, 90, 'поворот'); assert.equal((await S()).ex.d.logo.ed.flip, true, 'відзеркалення');
  await range('[data-p="ed.z"]', '200'); assert.equal((await S()).ex.d.logo.ed.z, 200, 'масштаб');
  await p.click('.ex-foot .btn.primary'); await p.waitForSelector('#main .ws');
  const mk = (await S()).company.mk;
  assert.ok(mk.img.startsWith('data:image/'), 'зображення збережено в стані гри');
  assert.equal(await p.locator('.tp-brand .lg-img').count(), 1, 'зображення у шапці гри');
  await go('ex-logo'); await p.click('.bs-tabs [data-v="mark"]');
  await p.click('[data-do="rmImg"]'); await p.click('.ex-foot .btn.primary'); await p.waitForSelector('#main .ws');
  assert.equal((await S()).company.mk.img, '', 'зображення можна прибрати');
});

await step('перший етап пройдено: відкривається другий, розділи наступного етапу доступні', async () => {
  await p.evaluate(() => { const S = window.Startup.sim; S.s.ex ||= { d: {}, done: {} }; for (const id of ['niche', 'market', 'needs', 'mvp']) S.s.ex.done[id] = { w: 0, s: 2 }; S.s.canvas = { problem: 'Учні не розуміють домашку', segment: S.s.target, uvp: 'Пояснення за п’ять хвилин', solution: [Object.keys(S.I.features)[0]], channels: ['ads'] }; window.Startup.C.render(); });
  await go('dash');
  await p.waitForSelector('.md.stage-done');
  assert.match(await p.locator('.md.stage-done').innerText(), /Етап 1 «Ніша й продукт» пройдено[\s\S]*Далі: етап 2/, 'вітання з пройденим етапом');
  await p.click('.md.stage-done [data-md-close]');
  await p.waitForSelector('.md', { state: 'detached' });
  assert.match(await p.locator('.rail .rs.cur').innerText(), /Аудиторія й бренд/);
  assert.equal(await p.locator('.rail .rs.done').count(), 1);
  assert.match(await p.locator('.ws .k').innerText(), /Етап 2 з 9/i, 'аркуш завжди показує поточний етап');
  assert.match(await p.locator('.ws h1').innerText(), /Визначте, кому продаєте/);
  assert.equal(await p.locator('.ws > .steps > .step').count(), 4);
  await p.click('.tab[data-k="market"]');
  assert.equal(await p.locator('.st-it.locked[data-to="brand"]').count(), 0, 'бренд відкрито');
  // смужка етапу на інших сторінках
  assert.match(await p.locator('.stbar').innerText(), /Етап 2 з 9/);
  await p.click('.stbar'); await p.waitForSelector('#main .ws');
});

await step('до пройдених етапів можна повертатися: перегляд, додаткові завдання, гра не перекидає далі', async () => {
  await p.evaluate(() => { window.Startup.sim.s.flags.st9 = 1; window.Startup.C.render(); }); // раніше в цьому файлі етапи відкривали вручну
  assert.equal(await p.locator('.rail button.rs').count(), 2, 'відкриті два етапи: обидва клікаються');
  await p.click('.rail button.rs:nth-child(1), .rail li:nth-child(1) button.rs');
  await p.waitForSelector('.ws .k');
  assert.match(await p.locator('.ws .k').innerText(), /Етап 1 з 9[\s\S]*пройдено[\s\S]*попередній етап/i, 'показано перший етап');
  assert.match(await p.locator('.ws h1').innerText(), /Оберіть нішу/);
  assert.equal(await p.locator('.ws-opt[open]').count(), 1, 'додаткові завдання розгорнуто');
  assert.match(await p.locator('.ws-next').first().innerText(), /Етап пройдено/);
  assert.equal(await p.locator('.ws-next >> text=До етапу 2').count(), 1, 'є кнопка переходу далі');
  // додаткове завдання з пройденого етапу: після нього повертаємося на той самий етап, а не на поточний
  await p.click('.ws-opt .step:nth-child(1) .btn');
  await p.waitForSelector('.ex[data-ex-root="interview"]');
  await p.click('.ex-btns [data-act="exBack"]');
  await p.waitForSelector('#main .ws');
  assert.match(await p.locator('.ws .k').innerText(), /Етап 1 з 9/i, 'після додаткового завдання лишаємось на етапі 1: ' + await p.locator('.ws .k').innerText() + ' ui=' + await p.evaluate(() => window.Startup.C.ui.stage));
  assert.equal(await p.locator('.rail .rs.sel').count(), 1);
  assert.match(await p.locator('.rail .rs.sel').innerText(), /Ніша й продукт/);
  await p.click('.ws-next >> text=До етапу 2'); await p.waitForSelector('#main .ws');
  assert.match(await p.locator('.ws .k').innerText(), /Етап 2 з 9/i, 'повернулись до поточного');
  assert.doesNotMatch(await p.locator('.ws .k').innerText(), /попередній/i);
});

await step('підсумковий звіт показує виконані вправи', async () => {
  await go('report');
  assert.match(await p.locator('.report').innerText(), /Вправи етапів/);
  assert.match(await p.locator('.xrep').innerText(), /Ніша й продукт/);
});

await step('телефон: усі сторінки вправ без горизонтальної прокрутки, маршрут — смужка етапів', async () => {
  const m = await newPage(await browser.newContext({ viewport: { width: 390, height: 844 } }), errors);
  m.setDefaultTimeout(10000);
  await start(m);
  await m.evaluate(() => { window.Startup.sim.s.flags.st9 = 8; window.Startup.C.render(); });
  assert.equal(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, 'головна');
  const rail = await m.locator('.rail').boundingBox(), ws = await m.locator('.ws').boundingBox();
  assert.ok(rail.y < ws.y, 'маршрут над аркушем');
  assert.ok(rail.height < 120, 'маршрут стиснуто в рядок');
  const ids = await m.evaluate(async () => (await import('/startupsim/js/ex-core.js')).exAll().map(e => e.id));
  assert.ok(ids.length >= 36);
  const bad = [];
  for (const id of ids) {
    await m.evaluate(v => window.Startup.C.go(v), 'ex-' + id);
    const w = await m.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    if (w[0] > w[1] + 1) bad.push(`${id}: ${w[0]}`);
  }
  assert.deepEqual(bad, [], 'вправи не виходять за ширину екрана');
});

await step('жодної помилки в консолі', async () => { assert.deepEqual(errors, []); });
await browser.close(); server.close();
