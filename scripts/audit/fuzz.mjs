// Надійність: випадково пошкоджуємо поля збереження й дивимось, чи відмальовування падає. npm run audit:fuzz (код виходу 1, якщо є падіння)
const R = new URL('../../startupsim/js/', import.meta.url).href;
for (const m of ['ex1','ex-need','ex-start','ex1b','ex-aud','ex-brand','ex-bbook','ex2','ex3','ex3b','ex4','ex5','ex6','ex7','ex8','ex9']) await import(R + m + '.js');
const { newGame, okState, Sim } = await import(R + 'sim.js');
const { exAll, exPage, X } = await import(R + 'ex-core.js');
const { coreViews } = await import(R + 'v-core.js'), { marketViews } = await import(R + 'v-market.js'), { moneyViews } = await import(R + 'v-money.js'), { peopleViews } = await import(R + 'v-people.js');
const { stageRail, stageSheet, stageBar, goalCard } = await import(R + 'v-stages.js'); const { stageInfo } = await import(R + 'stages.js');
const { unpackGame, packGame } = await import(R + 'file.js');
const VIEWS = { ...coreViews, ...marketViews, ...moneyViews, ...peopleViews };
const base = () => { const S = newGame({ idea: 'homework', founder: 'Т', company: 'Т', seed: 5 }); for (let i = 0; i < 12; i++) S.endWeek(); exAll().forEach(e => X(S, e.id)); return S; };
const clone = o => JSON.parse(JSON.stringify(o));
const state0 = clone(base().s);
const leaves = []; (function walk(o, path) { if (o && typeof o === 'object') { for (const k of Object.keys(o)) walk(o[k], [...path, k]); } else leaves.push(path); })(state0, []);
console.log('листків у стані:', leaves.length);
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const MUT = [['видалено', () => undefined], ['null', () => null], ['рядок', () => 'x'], ['-1', () => -1], ['1e300', () => 1e300], ['{}', () => ({})], ['[]', () => []], ['0', () => 0]];
const errs = new Map(); let tested = 0, rejected = 0, crashed = 0;
const renderAll = S => {
  const ui = { view: 'dash' };
  for (const [k, v] of Object.entries(VIEWS)) { try { String(v.render(S, ui)); } catch (e) { return `${k}: ${e.message}`; } }
  for (const def of exAll()) { try { String(exPage(def)(S, ui)); } catch (e) { return `ex-${def.id}: ${e.message}`; } }
  try { const info = stageInfo(S); stageRail(S, ui, info); stageSheet(S, ui, info); stageBar(S, info); goalCard(S); } catch (e) { return `stage: ${e.message}`; }
  return null;
};
const N = 700;
for (let i = 0; i < N; i++) {
  const path = leaves[Math.floor(rnd() * leaves.length)], [mn, mf] = MUT[Math.floor(rnd() * MUT.length)];
  const st = clone(state0); let o = st; for (const k of path.slice(0, -1)) o = o[k];
  const v = mf(); if (v === undefined) { if (Array.isArray(o)) o.splice(+path.at(-1), 1); else delete o[path.at(-1)]; } else o[path.at(-1)] = v;
  tested++;
  if (!okState(st)) { rejected++; continue; }
  let S, msg; try { S = new Sim(st); msg = renderAll(S); try { S.endWeek(); } catch (e) { msg = msg || 'endWeek: ' + e.message; } } catch (e) { msg = 'Sim: ' + e.message; }
  if (msg) { crashed++; const key = msg.replace(/\s+/g, ' ').slice(0, 90); const r = errs.get(key) || { n: 0, ex: [] }; r.n++; if (r.ex.length < 2) r.ex.push(`${path.slice(0, 4).join('.')}=${mn}`); errs.set(key, r); }
}
console.log(`перевірено ${tested}, відхилено okState ${rejected}, падінь ${crashed}`);
[...errs].sort((a, b) => b[1].n - a[1].n).slice(0, 14).forEach(([k, r]) => console.log(String(r.n).padStart(3), k, '|', r.ex.join('; ')));
if (crashed) process.exitCode = 1;
