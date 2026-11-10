// Перенесення збереженої гри зі старої адреси: старе сховище → сторінка-перенаправлення → новий сайт
//   node tests/startup-migrate-e2e.mjs
import assert from 'node:assert/strict';
import { startServer, launch, newPage, step } from './_harness.mjs';

const server = await startServer(), browser = await launch(), errors = [];
const SAVED = JSON.stringify({ s: null, view: 'dash' });

// 1. «стара адреса»: створюємо гру й беремо її збереження
const old = await browser.newContext(); const a = await newPage(old, errors); a.setDefaultTimeout(10000);
await a.goto(server.url + '/'); await a.evaluate(() => localStorage.clear()); await a.reload(); await a.waitForSelector('.wizard');
await a.click('[data-w="next"]'); await a.click('[data-w="next"]'); await a.fill('[data-w="name"]', 'Олена Перенос'); await a.fill('[data-w="company"]', 'Нова Адреса'); await a.click('[data-w="next"]');
await a.waitForSelector('#main .ws');
await a.evaluate(() => { const S = window.Startup.sim; S.s.cash = 123456; window.Startup.C.save(); });
const raw = await a.evaluate(() => localStorage.getItem('edvault-startup'));
assert.ok(raw && raw.length > 1000, 'збереження є');

let target = '';
await step('сторінка-перенаправлення пакує збереження в адресу нового сайту', async () => {
  const ctx = await browser.newContext(); const p = await ctx.newPage();
  await p.route(/startup\.edvault\.online/, r => r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>new</title>' }));
  await p.goto(server.url + '/startup-check'); // будь-яка сторінка «старого» сервера: кладемо туди збереження
  await p.evaluate(r => localStorage.setItem('edvault-startup', r), raw);
  await p.goto(server.url + '/tests/fixtures/old-redirect.html'); // сторінка лежить на тому ж «старому» сервері
  await p.waitForURL(/startup\.edvault\.online/, { timeout: 8000 });
  target = p.url();
  assert.match(target, /^https:\/\/startup\.edvault\.online\/#perenesennia=[zp]/, target.slice(0, 60));
  await ctx.close();
});

await step('новий сайт відновлює гру з адреси й чистить її', async () => {
  const ctx = await browser.newContext(); const p = await newPage(ctx, errors); p.setDefaultTimeout(10000);
  await p.goto(server.url + '/' + target.slice(target.indexOf('#')));
  await p.waitForSelector('#main .ws');
  const r = await p.evaluate(() => ({ name: window.Startup.sim.s.company.name, cash: window.Startup.sim.s.cash, hash: location.hash, wiz: !!document.querySelector('.wizard') }));
  assert.equal(r.name, 'Нова Адреса'); assert.equal(r.cash, 123456); assert.equal(r.hash, ''); assert.equal(r.wiz, false);
  await p.waitForSelector('#toast.on'); assert.match(await p.locator('#toast').innerText(), /перенесено/);
  await ctx.close();
});

await step('якщо тут уже є збереження, перенесення його не затирає', async () => {
  const ctx = await browser.newContext(); const p = await newPage(ctx, errors); p.setDefaultTimeout(10000);
  await p.goto(server.url + '/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector('.wizard');
  await p.click('[data-w="next"]'); await p.click('[data-w="next"]'); await p.fill('[data-w="name"]', 'Своя Гра'); await p.fill('[data-w="company"]', 'Лишається'); await p.click('[data-w="next"]'); await p.waitForSelector('#main .ws');
  await p.goto(server.url + '/' + target.slice(target.indexOf('#'))); await p.waitForSelector('#main .ws');
  assert.equal(await p.evaluate(() => window.Startup.sim.s.company.name), 'Лишається');
  await ctx.close();
});

await step('сміття в адресі не ламає запуск', async () => {
  const ctx = await browser.newContext(); const p = await newPage(ctx, errors); p.setDefaultTimeout(10000);
  await p.goto(server.url + '/#perenesennia=zAAAA!!'); await p.waitForSelector('.wizard');
  assert.equal(await p.evaluate(() => location.hash), '');
  await ctx.close();
});

await step('жодної помилки в консолі', async () => assert.deepEqual(errors, []));
await browser.close(); server.close();
