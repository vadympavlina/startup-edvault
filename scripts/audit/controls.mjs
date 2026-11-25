// Усі поля, повзунки, галочки й списки у всіх 52 вправах: кожен елемент реагує, значення потрапляє у стан, нічого не падає.
// npm run audit:controls (код виходу 1, якщо щось не працює)
import { startServer, launch, newPage } from '../../tests/_harness.mjs';
const server = await startServer(), b = await launch(), errors = [];
const p = await newPage(await b.newContext({ viewport: { width: 1366, height: 900 } }), errors); p.setDefaultTimeout(2500);
await p.goto(server.url + '/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector('.wizard');
await p.click('[data-w="next"]'); await p.click('[data-w="next"]'); await p.fill('[data-w="name"]', 'Марта'); await p.fill('[data-w="company"]', 'Записатись'); await p.click('[data-w="next"]');
await p.waitForSelector('#main .ws');
await p.evaluate(() => { window.Startup.sim.s.flags.st9 = 8; window.Startup.sim.s.flags.simStarted = true; });
const only = process.argv.slice(2), ids = (await p.evaluate(async () => (await import('/startupsim/js/ex-core.js')).exAll().map(e => e.id))).filter(x => !only.length || only.includes(x));
const problems = [], stat = { range: 0, text: 0, number: 0, checkbox: 0, select: 0, color: 0, set: 0, tog: 0 };
const getState = (id, path) => p.evaluate(([id, path]) => { let o = window.Startup.sim.s.ex.d[id]; for (const k of path.split('.')) o = o?.[k]; return o; }, [id, path]);
for (const id of ids) {
  await p.evaluate(v => window.Startup.C.go(v), 'ex-' + id); await p.waitForSelector(`.ex[data-ex-root="${id}"]`); await p.waitForTimeout(40);
  // 1. поля, повзунки, галочки, списки
  const list = await p.evaluate(() => [...document.querySelectorAll(`.ex [data-exi]`)].map((el, i) => ({ i, p: el.dataset.p, t: el.type || el.tagName.toLowerCase(), min: el.min, max: el.max, step: el.step, dis: el.disabled, ml: el.maxLength })));
  const seen = new Set();
  for (const c of list) {
    const key = c.p + '|' + c.t; if (seen.has(key) || c.dis) continue; seen.add(key);
    const sel = `.ex [data-exi="${id}"][data-p="${c.p}"]`;
    await p.evaluate(sel => { for (let el = document.querySelector(sel)?.parentElement; el; el = el.parentElement) if (el.tagName === 'DETAILS') el.open = true; }, sel); // поля у згорнутих блоках «Додатково»
    try {
      if (c.t === 'range') {
        const r = await p.evaluate(([sel, c]) => { const el = document.querySelector(sel); const lo = +c.min, hi = +c.max, st = +c.step || 1; let v = lo + Math.round((hi - lo) * .7 / st) * st; if (v === +el.value) v = lo; el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return v; }, [sel, c]);
        await p.waitForTimeout(30); const s = await getState(id, c.p); stat.range++;
        if (Math.abs(+s - r) > 1e-6) problems.push(`${id}: повзунок «${c.p}» поставили ${r}, у стані ${JSON.stringify(s)}`);
        const shown = await p.evaluate(sel => { const el = document.querySelector(sel); return el ? +el.value : null; }, sel);
        if (shown !== null && Math.abs(shown - r) > 1e-6) problems.push(`${id}: повзунок «${c.p}» після перемальовування показує ${shown}, а не ${r}`);
      } else if (c.t === 'text' || c.t === 'textarea') {
        const txt = 'Перевірка поля, що має працювати'.slice(0, c.ml > 0 ? Math.min(c.ml, 32) : 32);
        await p.fill(sel, txt); await p.waitForTimeout(30); const s = await getState(id, c.p); stat.text++;
        if (s !== txt) problems.push(`${id}: поле «${c.p}» — введено «${txt}», у стані ${JSON.stringify(s)}`);
        const keep = await p.inputValue(sel).catch(() => null); if (keep !== null && keep !== txt) problems.push(`${id}: поле «${c.p}» після введення показує «${keep}»`);
      } else if (c.t === 'number') {
        const v = Math.min(+c.max || 1e9, Math.max(+c.min || 0, 123)); await p.fill(sel, String(v)); await p.waitForTimeout(30); const s = await getState(id, c.p); stat.number++;
        if (+s !== v) problems.push(`${id}: число «${c.p}» — введено ${v}, у стані ${JSON.stringify(s)}`);
      } else if (c.t === 'checkbox') {
        const before = await getState(id, c.p); await p.locator(sel).first().evaluate(el => el.click()); await p.waitForTimeout(40); const after = await getState(id, c.p); stat.checkbox++;
        if (!!before === !!after) problems.push(`${id}: галочка «${c.p}» не змінила стан (${before} → ${after})`);
      } else if (c.t.startsWith('select')) {
        const r = await p.evaluate(sel => { const el = document.querySelector(sel); const o = [...el.options].find(x => x.value !== el.value); if (!o) return null; el.value = o.value; el.dispatchEvent(new Event('change', { bubbles: true })); return o.value; }, sel);
        if (r === null) continue; await p.waitForTimeout(30); const s = await getState(id, c.p); stat.select++;
        if (String(s) !== String(r)) problems.push(`${id}: список «${c.p}» — вибрано ${r}, у стані ${JSON.stringify(s)}`);
      } else if (c.t === 'color') {
        await p.evaluate(sel => { const el = document.querySelector(sel); el.value = '#336699'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }, sel); await p.waitForTimeout(30); const s = await getState(id, c.p); stat.color++;
        if (String(s).toLowerCase() !== '#336699') problems.push(`${id}: колір «${c.p}» — у стані ${JSON.stringify(s)}`);
      }
    } catch (e) { problems.push(`${id}: «${c.p}» (${c.t}): ${String(e.message).split('\n')[0]}`); }
  }
  // 2. кнопки-вибори (set) і галочки-набори (tog). Після кожного натискання список читаємо наново: кнопки вкладок і груп змінюють сторінку
  const seenB = new Set(), parseV = (v, t) => t === 'n' ? +v : t === 'b' ? v === '1' || v === 'true' : v;
  for (let n = 0; n < 90; n++) {
    const bt = await p.evaluate(([id, seen]) => {
      for (const el of document.querySelectorAll('.ex [data-act="ex"][data-do="set"], .ex [data-act="ex"][data-do="tog"]')) {
        const key = [el.dataset.do, el.dataset.p, el.dataset.v].join('|');
        if (!seen.includes(key) && !el.disabled && el.dataset.ex === id) return { key, k: el.dataset.do, p: el.dataset.p, v: el.dataset.v, t: el.dataset.t, max: el.dataset.max || '' };
      }
      return null;
    }, [id, [...seenB]]);
    if (!bt) break; seenB.add(bt.key);
    const sel = `.ex [data-act="ex"][data-do="${bt.k}"][data-p="${bt.p}"][data-v="${bt.v.replace(/"/g, '\\"')}"]`;
    try {
      const before = JSON.stringify(await getState(id, bt.p));
      await p.locator(sel).first().evaluate(el => el.click()); await p.waitForTimeout(25);
      const after = JSON.stringify(await getState(id, bt.p)); stat[bt.k]++;
      if (bt.k === 'set' && after === before && JSON.stringify(parseV(bt.v, bt.t)) !== before) problems.push(`${id}: кнопка «${bt.p}=${bt.v}» не поставила значення (${before} → ${after})`);
      if (bt.k === 'tog' && after === before && !bt.max) problems.push(`${id}: набір «${bt.p}» не змінився після натискання «${bt.v}»`);
    } catch (e) { problems.push(`${id}: кнопка ${bt.k} «${bt.p}=${bt.v}»: ${String(e.message).split('\n')[0]}`); }
  }
  // 3. після всіх змін сторінка жива: розділи є, помилок немає
  const ok = await p.evaluate(id => !!document.querySelector(`.ex[data-ex-root="${id}"] .xbox, .ex[data-ex-root="${id}"] .ex-body`) && !/undefined|NaN|\[object/.test(document.querySelector('#main')?.innerText || ''), id);
  if (!ok) problems.push(`${id}: після взаємодії сторінка порожня або містить undefined/NaN`);
}
console.log('перевірено елементів:', JSON.stringify(stat));
console.log(problems.length ? 'ПРОБЛЕМИ (' + problems.length + '):\n  ' + problems.join('\n  ') : 'усі поля, повзунки й галочки працюють');
console.log('помилки в консолі:', errors.slice(0, 5)); if (problems.length || errors.length) process.exitCode = 1;
await b.close(); server.close();
