// Сторінка викладача відкриває роботи всього класу з одного ZIP-архіву. У грі учня архіви не відкриваються.
//   node tests/startup-check-zip-e2e.mjs
import assert from 'node:assert/strict';
import { startServer, launch, newPage, step } from './_harness.mjs';
import { makeZip } from './_zip.mjs';

const server = await startServer(), browser = await launch(), errors = [];
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const g = await newPage(ctx, errors); g.setDefaultTimeout(10000);
await g.goto(server.url + '/'); await g.evaluate(() => localStorage.clear()); await g.reload(); await g.waitForSelector('.wizard');
await g.click('[data-w="next"]'); await g.click('[data-w="next"]'); await g.fill('[data-w="name"]', 'Марта Коваль'); await g.fill('[data-w="company"]', 'Записатись'); await g.click('[data-w="next"]');
await g.waitForSelector('#main .ws');
const save = name => g.evaluate(async n => { const S = window.Startup.sim, { serializeGame } = await import('/startupsim/js/file.js'); S.s.founder.name = n; S.s.company.name = 'Фірма ' + n; return serializeGame(S, { view: 'dash' }); }, name);
const a = await save('Марта Коваль'), b = await save('Олег Шевчук');
const zip = makeZip([{ name: '9-Б/Марта.edvault', data: a }, { name: '9-Б/Олег.edvault', data: b }, { name: '9-Б/нотатки.txt', data: 'не робота' }]);
const bad = makeZip([{ name: 'порожньо.txt', data: 'x' }]);

const p = await newPage(ctx, errors); p.setDefaultTimeout(10000);
await p.goto(server.url + '/startup-check');
await step('на сторінці викладача сказано про ZIP', async () => { assert.match(await p.locator('.ck-drop').innerText(), /ZIP-архівом/); });

await step('один архів відкриває весь клас: два учні, таблиця класу', async () => {
  await p.evaluate(async bytes => window.Checker.open(new File([new Uint8Array(bytes)], 'клас-9Б.zip')), [...zip]);
  await p.waitForFunction(() => window.Checker.list.length === 2);
  assert.equal(await p.evaluate(() => window.Checker.list.length), 2);
  assert.match(await p.locator('body').innerText(), /Олег Шевчук/);
  assert.match(await p.locator('body').innerText(), /Марта Коваль/);
});

await step('архів без збережень і не-архів дають зрозуміле повідомлення', async () => {
  await p.evaluate(async bytes => window.Checker.open(new File([new Uint8Array(bytes)], 'порожній.zip')), [...bad]);
  assert.match(await p.locator('body').innerText(), /немає файлів збереження/);
  await p.evaluate(async () => window.Checker.open(new File(['не архів'], 'клас.zip')));
  assert.match(await p.locator('body').innerText(), /не схоже на ZIP/);
});

await step('у грі учня архіви не приймаються', async () => {
  const acc = await g.evaluate(() => { const orig = HTMLInputElement.prototype.click; let accept = ''; HTMLInputElement.prototype.click = function () { accept = this.accept; }; window.Startup.C.openFile?.(); document.querySelector('[data-act="openFile"]')?.click(); HTMLInputElement.prototype.click = orig; return accept; });
  assert.doesNotMatch(acc, /zip/i);
});

assert.deepEqual(errors, [], 'помилки консолі: ' + errors.join('; '));
await browser.close(); server.close();
console.log('готово');
