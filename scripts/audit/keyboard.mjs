// Клавіатура й дотик: видимість фокусу, пастка фокусу в модальному вікні, Esc, масштаб 200 %, розміри цілей. npm run audit:keyboard
import { startServer, launch, newPage } from '../../tests/_harness.mjs';
const server = await startServer(), b = await launch(), errors = [];
const p = await newPage(await b.newContext({ viewport: { width: 1366, height: 900 } }), errors); p.setDefaultTimeout(10000);
await p.goto(server.url + '/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector('.wizard');
await p.click('[data-w="next"]'); await p.click('[data-w="next"]'); await p.fill('[data-w="name"]', 'Марта'); await p.fill('[data-w="company"]', 'Записатись'); await p.click('[data-w="next"]'); await p.waitForSelector('#main .ws');
await p.evaluate(() => { window.Startup.sim.s.flags.st9 = 8; window.Startup.C.render(); window.Startup.C.go('dash'); });
// 1. розміри цілей натискання
const small = await p.evaluate(() => { const out = {}; for (const el of document.querySelectorAll('button, a[href], [role=button], input[type=checkbox], input[type=radio], select')) { const r = el.getBoundingClientRect(); if (!r.width || el.closest('[hidden]')) continue; if (r.width < 44 || r.height < 44) { const k = (el.className || el.tagName).toString().split(' ')[0]; out[k] = (out[k] || 0) + 1; } } return out; });
console.log('цілі <44px (головна):', JSON.stringify(small));
// 2. фокус: чи видно кільце, порядок
const fo = await p.evaluate(async () => { const res = []; for (let i = 0; i < 6; i++) { }; return null; });
let visible = 0, total = 0, none = [];
for (let i = 0; i < 25; i++) { await p.keyboard.press('Tab'); const r = await p.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; const cs = getComputedStyle(e), has = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none'; return { tag: e.tagName + '.' + String(e.className).split(' ')[0], has }; }); if (r) { total++; if (r.has) visible++; else none.push(r.tag); } }
console.log(`фокус після Tab: видимий у ${visible} з ${total}; без видимого кільця: ${[...new Set(none)].slice(0, 6).join(', ') || '—'}`);
// 3. модальне вікно: Esc, пастка фокусу
await p.evaluate(() => window.Startup.C.go('customers')); await p.waitForTimeout(150); await p.click('[data-act="interview"]'); await p.waitForSelector('.md');
let inside = 0; for (let i = 0; i < 12; i++) { await p.keyboard.press('Tab'); if (await p.evaluate(() => !!document.activeElement.closest('.md'))) inside++; }
console.log(`модальне: фокус лишається всередині ${inside} з 12 Tab`);
await p.keyboard.press('Escape'); await p.waitForTimeout(300); console.log('Esc закриває модальне:', !(await p.locator('.md').count()));
// 4. aria-live / toast; zoom 200%
await p.setViewportSize({ width: 683, height: 450 }); await p.evaluate(() => window.Startup.C.go('dash')); await p.waitForTimeout(200);
console.log('масштаб 200% (вікно 683px): горизонтальна прокрутка:', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1));
console.log('помилки', errors.slice(0, 2)); if (visible < total || inside < 10 || errors.length) process.exitCode = 1;
await b.close(); server.close();
