// Симуляція як «живе» життя компанії: час іде, перемотування зупиняється на листах, є застереження перед місяцем.
//   node tests/startup-live-e2e.mjs
import assert from 'node:assert/strict';
import { startServer, launch, newPage, step } from './_harness.mjs';

const server = await startServer(), browser = await launch(), errors = [];
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const p = await newPage(ctx, errors); p.setDefaultTimeout(15000);
const S = () => p.evaluate(() => JSON.parse(JSON.stringify(window.Startup.sim.s)));
await p.goto(server.url + '/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector('.wizard');
await p.click('[data-w="next"]'); await p.click('[data-w="next"]'); await p.fill('[data-w="name"]', 'Марта'); await p.fill('[data-w="company"]', 'Записатись'); await p.click('[data-w="next"]');
await p.waitForSelector('#main .ws');
await p.evaluate(() => { const s = window.Startup.sim.s; s.flags.simStarted = true; s.flags.st9 = 8; s.company.form = 'fop'; window.Startup.C.render(); });

await step('головна в симуляції: живий офіс, керування часом, застереження', async () => {
  assert.equal(await p.locator('.lv .lv-scene').count(), 1);
  assert.equal(await p.locator('.speed button').count(), 4);
  assert.match(await p.locator('.lv-warn').innerText(), /зупиниться саме/);
  assert.match(await p.locator('#lv-run').innerText(), /Пауза/);
  assert.equal(await p.locator('.lv .lv-scene text:has-text("Записатись")').count() >= 1, true, 'вивіска з назвою компанії');
});

await step('«Грати»: час іде (годинник міняється), «Пауза» зупиняє', async () => {
  const c0 = await p.locator('#lv-clock').innerText();
  await p.click('[data-act="liveToggle"]');
  await p.waitForFunction(c => document.querySelector('#lv-clock')?.textContent !== c, c0);
  assert.match(await p.locator('#lv-run').innerText(), /Іде час/);
  await p.click('[data-act="liveToggle"]');
  assert.match(await p.locator('#lv-run').innerText(), /Пауза/);
  const t = await p.locator('#lv-clock').innerText(); await p.waitForTimeout(1500);
  assert.equal(await p.locator('#lv-clock').innerText(), t, 'на паузі час стоїть');
});

await step('«Тиждень»: перемотується, показується підсумок, тиждень збільшився', async () => {
  const w0 = (await S()).week;
  await p.click('[data-act="endWeek"]');
  await p.waitForSelector('.md.week');
  assert.equal((await S()).week, w0 + 1);
  await p.keyboard.press('Escape');
});

await step('«Місяць»: застереження з прогнозом, потім чотири тижні й підсумок місяця', async () => {
  const w0 = (await S()).week;
  await p.click('[data-act="liveFf"][data-n="month"]');
  await p.waitForSelector('.md');
  assert.match(await p.locator('.md').innerText(), /зупиниться сама[\s\S]*близько/);
  await p.click('.md [data-v="1"], .md .btn.primary');
  // місяць закінчується підсумком, а якщо раніше прийшов лист чи мало грошей, то зупиняється з поясненням
  await p.waitForFunction(() => document.querySelector('.md.week')?.innerText.includes('Місяць позаду') || (document.querySelector('#lv-note')?.innerText || '').includes('зупинено'), null, { timeout: 60000 });
  assert.ok((await S()).week > w0, 'пройшло кілька тижнів');
  await p.keyboard.press('Escape');
});

await step('лист, що чекає рішення, зупиняє перемотування й не дає пустити час', async () => {
  await p.evaluate(() => { const S = window.Startup.sim; S.s.product.launched = true; S.trigger('competitor'); S.s.inbox.filter(m => m.choices && m.chosen == null).forEach(m => { m.until = S.s.week; }); window.Startup.C.render(); });
  assert.ok(await p.evaluate(() => window.Startup.sim.s.inbox.some(m => m.choices && m.chosen == null && m.until === window.Startup.sim.s.week)));
  await p.click('[data-act="liveToggle"]');
  assert.match(await p.locator('#lv-note').innerText(), /лист/i);
  assert.match(await p.locator('#lv-run').innerText(), /Пауза/);
  assert.ok(await p.locator('#lv-note [data-act="go"]').count() >= 1, 'є кнопка до пошти');
});

await step('сцена показує команду й канали: нова людина з’являється за столом', async () => {
  await p.evaluate(() => { const S = window.Startup.sim; S.s.team.push({ id: 'm9', name: 'Оксана Бойко', role: 'dev', skill: 3, salary: 40000, morale: 80, joined: 0, fem: true }); window.Startup.C.render(); });
  const txt = await p.locator('.lv-scene').evaluate(e => e.textContent);
  assert.match(txt, /Оксана/);
  assert.match(txt, /Соцмережі|Блогери|Пошук|Рекомендації|Реклама/);
});

assert.deepEqual(errors, [], 'помилки консолі: ' + errors.join('; '));
await browser.close(); server.close();
console.log('готово');
