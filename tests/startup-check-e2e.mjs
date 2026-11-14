// Сторінка перевірки для викладача: відкриття файлу, перегляд без змін
//   node tests/startup-check-e2e.mjs
import assert from 'node:assert/strict';
import { startServer, launch, newPage, step } from './_harness.mjs';

const server = await startServer();
const browser = await launch();
const errors = [];
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const g = await newPage(ctx, errors);
g.setDefaultTimeout(10000);

// учень проходить початок гри й заповнює кілька вправ, потім зберігає файл
await g.goto(server.url + '/'); await g.evaluate(() => localStorage.clear()); await g.reload(); await g.waitForSelector('.wizard');
await g.click('[data-w="next"]'); await g.click('[data-w="next"]'); await g.fill('[data-w="name"]', 'Марта Коваль'); await g.fill('[data-w="company"]', 'Записатись');
await g.click('[data-w="next"]'); await g.waitForSelector('#main .ws').catch(() => {});
const text = await g.evaluate(async () => {
  const S = window.Startup.sim, { serializeGame } = await import('/startupsim/js/file.js');
  S.s.ex = { d: {}, done: { niche: { w: 0, s: 2 } } }; (await import('/startupsim/js/ex-core.js')).X(S, 'niche').why = 'Люди довго шукають майстра';
  S.s.flags.st9 = 8;
  S.s.interviews = [{ w: 0, name: 'Оксана', who: 'власниця салону', seg: Object.keys(S.s.know)[0], log: [{ q: 'Як ви зараз ведете записи?', a: 'У зошиті, часто плутаю.' }], bad: 0 }];
  return serializeGame(S, { view: 'dash' });
});
assert.match(text, /^EDVAULT-STARTUP/);

const p = await newPage(await browser.newContext({ viewport: { width: 1366, height: 900 } }), errors);
p.setDefaultTimeout(10000);
await p.goto(server.url + '/startup-check');

await step('порожня сторінка просить файл', async () => {
  assert.match(await p.locator('.ck-drop').innerText(), /Відкрийте файл збереження/);
});

await step('файл .edvault відкривається: підсумок і вкладки', async () => {
  await p.evaluate(async t => window.Checker.open(new File([t], 'a.edvault')), text);
  await p.waitForSelector('.ck-who');
  assert.match(await p.locator('.ck-who').innerText(), /Марта Коваль/);
  assert.match(await p.locator('.ck-sum').innerText(), /Записатись/);
  assert.equal(await p.locator('.ck-warn').count(), 0);
  assert.equal(await p.locator('.ck-tabs button').count(), 6);
});

await step('вправи: відповіді учня видно, але змінити їх неможливо', async () => {
  await p.click('[data-tab="ex"]');
  const det = p.locator('.ck-ex[data-ex="niche"]'); await det.locator('summary').click();
  await p.waitForSelector('.ck-ex[data-ex="niche"] .ck-ro');
  assert.ok(await det.evaluate(el => [...el.querySelectorAll('textarea,input')].some(i => /Люди довго шукають майстра/.test(i.value))), 'відповідь учня видно');
  assert.ok(await p.evaluate(() => [...document.querySelectorAll('.ck-ro textarea, .ck-ro input')].every(e => e.disabled)));
  assert.equal(await p.locator('.ck-ro').first().getAttribute('inert'), '');
  assert.equal(await p.locator('.ex-foot, .ex-ai, [data-act="exDone"]').count(), 0, 'жодних кнопок завершення');
  const before = await p.evaluate(() => JSON.stringify(window.Checker.S.s.ex.d.niche));
  await p.locator('.ck-ex[data-ex="niche"] textarea').first().fill('змінено', { force: true, timeout: 1500 }).catch(() => {});
  assert.equal(await p.evaluate(() => JSON.stringify(window.Checker.S.s.ex.d.niche)), before);
});

await step('план, інтерв’ю, звіт відкриваються; своя гра не чіпається', async () => {
  await p.click('[data-tab="plan"]'); await p.waitForSelector('.ck-ro');
  const ov = await p.evaluate(() => { const r = [...document.querySelectorAll('.bp-b')].map(e => e.getBoundingClientRect()); let n = 0; for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) if (r[i].left < r[j].right - 1 && r[j].left < r[i].right - 1 && r[i].top < r[j].bottom - 1 && r[j].top < r[i].bottom - 1) n++; return [r.length, n]; });
  assert.deepEqual(ov, [9, 0], 'блоки бізнес-плану не накладаються');
  await p.click('[data-tab="iv"]'); assert.match(await p.locator('.ck-view').innerText(), /Оксана/);
  await p.locator('.ck-iv summary').click(); assert.match(await p.locator('.ck-view').innerText(), /У зошиті/);
  await p.click('[data-tab="rep"]'); await p.waitForSelector('.ck-ro');
  assert.equal(await p.evaluate(() => localStorage.length), 0, 'у localStorage нічого не записано');
});

await step('кілька файлів: таблиця класу, перемикання, фільтри й пошук', async () => {
  const second = text.replace('Марта Коваль', 'Марта Коваль');
  const other = await g.evaluate(async () => { const S = window.Startup.sim, { serializeGame } = await import('/startupsim/js/file.js'); S.s.founder.name = 'Іван Шевчук'; S.s.company.name = 'Свічка'; return serializeGame(S, {}); });
  await p.evaluate(async ([a, b]) => window.Checker.openMany([new File([a], 'a.edvault'), new File([b], 'b.edvault')]), [second, other]);
  await p.waitForSelector('.ck-tbl');
  assert.equal(await p.locator('.ck-tbl tbody tr').count(), 2);
  await p.click('[data-sort="name"]');
  await p.click('.ck-tbl .ck-lnk >> text=Іван Шевчук'); await p.waitForSelector('.ck-att');
  assert.match(await p.locator('.ck-who').innerText(), /Іван Шевчук/);
  await p.selectOption('#who', { label: 'Марта Коваль · Записатись' });
  assert.match(await p.locator('.ck-who').innerText(), /Марта Коваль/);
  assert.match(await p.locator('.ck-att').innerText(), /Зараз на етапі/);
  await p.click('[data-tab="ex"]'); await p.click('[data-flt="done"]');
  assert.equal(await p.locator('.ck-ex:not([hidden])').count(), 1);
  await p.click('[data-flt="all"]'); await p.fill('#q', 'довго шукають');
  assert.equal(await p.locator('.ck-ex:not([hidden])').count(), 1);
  await p.fill('#q', 'абракадабра'); assert.equal(await p.locator('.ck-none').isVisible(), true);
  await p.click('[data-tab="brand"]'); assert.match(await p.locator('.ck-view').innerText(), /бренд/);
});

await step('клас: показники, матриця вправ, відкриття вправи з матриці, позначки викладача, клавіші, таблиця для Excel', async () => {
  await p.click('[data-tab="class"]'); await p.waitForSelector('.ck-kpis');
  assert.match(await p.locator('.ck-kpis').innerText(), /Учнів[\s\S]*2/);
  assert.equal(await p.locator('.ck-mx .ck-dot').count(), 2 * (await p.evaluate(async () => (await import('/startupsim/js/ex-core.js')).exAll().length)), 'матриця: учні × вправи');
  assert.equal(await p.locator('.ck-tbl tbody tr').count(), 2);
  await p.fill('#cq', 'Іван'); assert.equal(await p.locator('.ck-tbl tbody tr').count(), 1, 'пошук учня'); await p.fill('#cq', '');
  // вправа з матриці відкривається в роботі учня
  await p.locator('.ck-mx tr', { hasText: 'Марта Коваль' }).locator('.ck-dot[data-jump="niche"]').click();
  await p.waitForSelector('#ckx-niche[open]');
  assert.match(await p.locator('.ck-who').innerText(), /Марта Коваль/);
  // позначки
  await p.click('#ckx-niche [data-mark="ok"]');
  assert.equal(await p.locator('#ckx-niche [data-mark="ok"]').getAttribute('aria-pressed'), 'true');
  assert.equal(await p.locator('#ckx-niche').getAttribute('data-mark-v'), 'ok');
  assert.equal(await p.locator('#ckx-niche[open]').count(), 1, 'позначка не згортає вправу');
  await p.click('[data-tab="over"]'); assert.match(await p.locator('.ck-kpis').innerText(), /Позначки\s*1 \/ 0/);
  await p.click('[data-tab="ex"]'); await p.click('[data-flt="unmarked"]');
  assert.equal(await p.locator('.ck-ex:not([hidden])[data-mark-v="ok"]').count(), 0, 'позначені не показуються у «Без позначки»');
  await p.click('[data-flt="all"]');
  await p.click('[data-next="1"]'); // усі вправи цього учня вже позначено: кнопка нічого не ламає
  // клавіші
  await p.click('.ck-head'); const who0 = await p.locator('.ck-who h1').innerText();
  await p.keyboard.press('ArrowRight'); assert.notEqual(await p.locator('.ck-who h1').innerText(), who0, 'стрілка перемикає учня');
  await p.keyboard.press('1'); await p.waitForSelector('.ck-kpis .ck-kpi');
  assert.equal(await p.locator('.ck-tabs button.on').innerText(), 'Клас', 'клавіша 1 — вкладка «Клас»');
  const dl = p.waitForEvent('download'); await p.click('#csv'); const f = await dl;
  const csvText = await (await import('node:fs/promises')).readFile(await f.path(), 'utf8');
  assert.match(csvText, /Зараховано \(позначки\)/); assert.match(csvText, /Марта Коваль/);
  assert.equal(await p.evaluate(() => localStorage.length), 0, 'позначки не записуються в localStorage');
});

await step('змінений файл і сміття: попередження чи помилка', async () => {
  const bad = text.replace(/DATA\n./, m => m.slice(0, -1) + (m.endsWith('A') ? 'B' : 'A'));
  await p.evaluate(async t => window.Checker.open(new File([t], 'b.edvault')), bad);
  await p.waitForSelector('.ck-err');
  await p.evaluate(async () => window.Checker.open(new File(['просто текст'], 'c.txt')));
  assert.match(await p.locator('.ck-err').innerText(), /не файл збереження/);
  const json = JSON.stringify({ app: 'edvault-startup', format: 1, state: await g.evaluate(() => window.Startup.sim.s), integrity: 'zzz' });
  await p.evaluate(async t => window.Checker.open(new File([t], 'd.json')), json);
  await p.waitForSelector('.ck-warn');
});

await step('жодної помилки в консолі', async () => { assert.deepEqual(errors, []); });
await browser.close(); server.close();
