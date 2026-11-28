// Дві частини гри: спершу підготовка (9 етапів без тижнів), потім запуск симуляції.
//   node tests/startup-launch-e2e.mjs
import assert from 'node:assert/strict';
import { startServer, launch, newPage, step } from './_harness.mjs';

const server = await startServer(), browser = await launch(), errors = [];
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const p = await newPage(ctx, errors); p.setDefaultTimeout(10000);
const S = () => p.evaluate(() => JSON.parse(JSON.stringify(window.Startup.sim.s)));
await p.goto(server.url + '/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector('.wizard');
await p.click('[data-w="next"]'); await p.click('[data-w="next"]'); await p.fill('[data-w="name"]', 'Марта'); await p.fill('[data-w="company"]', 'Записатись'); await p.click('[data-w="next"]');
await p.waitForSelector('#main .ws');

await step('підготовка: кнопки «Завершити тиждень» немає, час не йде', async () => {
  assert.equal(await p.locator('[data-act="endWeek"]').count(), 0);
  assert.match(await p.locator('.end-week.prep').innerText(), /Підготовка: 0 з 9 етапів/);
  assert.match(await p.locator('.tp-brand small').innerText(), /Підготовка · етап 1 з 9/);
  assert.equal((await S()).flags.simStarted, false);
  assert.equal(await p.locator('[data-act="startSim"]').count(), 0, 'запуску ще немає');
});

await step('після 9 етапів з’являється «Запустити симуляцію» зі списком пропущеного', async () => {
  await p.evaluate(async () => {
    const m = await import('/startupsim/js/ex-core.js'), st = await import('/startupsim/js/stages.js'), S = window.Startup.sim;
    const FILL = (await import('/tests/fill.mjs')).makeFill(m.EX, m.X);
    S.s.flags.st9 = 8;
    const { CANVAS } = await import('/startupsim/js/mods.js'); for (const k of Object.keys(CANVAS)) S.s.canvas[k] = Array.isArray(S.s.canvas[k]) ? ['тест'] : k === 'segment' ? S.segIds[0] : 'Достатньо довгий текст для блоку';
    for (const stg of st.STAGES) for (const f of stg.req) { const x = f(S); if (!x?.ex) continue; const d = m.X(S, x.ex); FILL[x.ex]?.(S, d); const r = m.EX[x.ex].ready(S, d); S.s.ex.done[x.ex] = { w: 0, s: r.stars || 2 }; }
    window.Startup.C.render();
  });
  await p.click('[data-act="go"][data-to="dash"] >> nth=0').catch(() => {});
  await p.waitForSelector('[data-act="startSim"]');
  assert.match(await p.locator('.ws h1').innerText(), /готовий до запуску/);
  assert.match(await p.locator('.end-week.prep').innerText(), /9 з 9/);
  for (let i = 0; i < 5 && await p.locator('.md-back').count(); i++) { await p.keyboard.press('Escape'); await p.waitForTimeout(150); }
  await p.click('[data-act="startSim"]'); await p.waitForSelector('.md.simlaunch');
  assert.ok(await p.locator('.miss-list li').count() > 0, 'пропущені додаткові вправи підсвічено');
});

await step('запуск: тижні стартують, кнопка тижня з’являється, підказка «як працює тиждень»', async () => {
  await p.click('[data-launch]');
  await p.waitForSelector('.md.howto');
  assert.equal((await S()).flags.simStarted, true);
  await p.click('.md.howto [data-md-close]');
  assert.equal(await p.locator('[data-act="endWeek"]').count(), 1);
  assert.match(await p.locator('.tp-brand small').innerText(), /Тиждень 1 з 104/);
  const w0 = (await S()).week;
  await p.click('[data-act="endWeek"]');
  await p.waitForFunction(w => window.Startup.sim.s.week > w, w0);
  assert.ok((await S()).week > w0);
});

await step('збереження зі старої версії (без позначки режиму, тиждень 5): без кнопки тижня, є «Продовжити симуляцію», тиждень зберігається', async () => {
  const text = await p.evaluate(async () => { const { serializeGame } = await import('/startupsim/js/file.js'), S = window.Startup.sim; delete S.s.flags.simStarted; S.s.week = 5; return serializeGame(S, { view: 'dash' }); });
  const q = await ctx.newPage(); q.setDefaultTimeout(10000);
  await q.goto(server.url + '/'); await q.waitForSelector('#main .ws');
  // відкриваємо файл так, як це робить учень: меню «···» → «Відкрити гру з файлу» → «Продовжити гру»
  await q.click('[data-act="more"]');
  const [chooser] = await Promise.all([q.waitForEvent('filechooser'), q.click('[data-act="openFile"]')]);
  await chooser.setFiles({ name: 'стара-гра.edvault', mimeType: 'text/plain', buffer: Buffer.from(text) });
  await q.waitForSelector('.md.file-open'); await q.click('[data-f="play"]'); await q.waitForTimeout(300);
  assert.equal(await q.locator('[data-act="endWeek"]').count(), 0, 'кнопки тижня немає');
  assert.equal(await q.locator('.end-week.prep').count(), 1);
  await q.click('[data-act="startSim"]'); await q.waitForSelector('.md.simlaunch'); await q.click('[data-launch]'); await q.waitForSelector('.md.howto'); await q.click('.md.howto [data-md-close]');
  assert.equal(await q.locator('[data-act="endWeek"]').count(), 1);
  assert.equal(await q.evaluate(() => window.Startup.sim.s.week), 5, 'тиждень не збився');
  await q.close();
});

assert.deepEqual(errors, [], 'помилки консолі: ' + errors.join('; '));
await browser.close(); server.close();
console.log('готово');
