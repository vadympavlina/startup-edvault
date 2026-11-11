// Баланс гри: ботами проходимо всі ідеї. Розважливий засновник має вижити, бездіяльний чи необачний — ні.
// npm run audit:balance (код виходу 1, якщо порушено межі)
const R = new URL('../../startupsim/js/', import.meta.url).href;
const { newGame, WEEKS } = await import(R + 'sim.js'); const bots = await import(R + 'bots.js');
const ideas = ['homework', 'plant', 'english', 'booking'], SEEDS = 20;
// боти самі завершують тиждень
const run = (idea, seed, bot) => { const S = newGame({ idea, founder: 'Т', company: 'Т', seed }); for (let w = 0; w < WEEKS + 2 && !S.s.over; w++) { if (bot) bot(S); else S.endWeek(); } const h = S.s.history.slice(-12); return { over: S.s.over?.kind || 'time', week: S.s.week, rev: sum(h.map(x => x.rev)) / Math.max(1, h.length), offer: S.s.inbox.some(m => m.ev === 'acquire'), val: S.valuation() }; };
const sum = a => a.reduce((x, y) => x + y, 0);
const med = a => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1] ?? 0; };
// розважливий із примусовим вибором сегмента: ботові важко вгадати правильну аудиторію, тому беремо найкращу з досяжних
const forced = k => S => { if (S.s.week === 4 && S.s.target !== k) { S.setTarget(k); const w = S.insight(k).wtp; if (w) S.setPrice(k, Math.round(w * .75 / (S.seg(k).units || 1))); } return bots.smartWeek(S); };
const segsOf = idea => Object.keys(newGame({ idea, seed: 1 }).I.segments);
const rows = [], problems = [];
for (const [name, bot, expect] of [['нічого не робити', null, 'idle'], ['розважливий (найкращий сегмент)', 'best', 'smart'], ['необачний', bots.recklessWeek, 'reckless']]) {
  for (const idea of ideas) {
    let rs; if (bot === 'best') { const per = segsOf(idea).map(k => { const r = []; for (let seed = 1; seed <= SEEDS; seed++) r.push(run(idea, seed, forced(k))); return r; }); rs = per.sort((a, b) => med(b.map(x => x.rev)) - med(a.map(x => x.rev)))[0]; } else { rs = []; for (let seed = 1; seed <= SEEDS; seed++) rs.push(run(idea, seed, bot)); }
    const crash = rs.filter(r => r.over === 'bankrupt').length, sold = rs.filter(r => r.over === 'sold').length, alive = SEEDS - crash - sold;
    rows.push({ стратегія: name, ідея: idea, 'крах': crash, 'продано': sold, 'доживає': alive, 'виручка/тиж. мед.': Math.round(med(rs.map(r => r.rev))), 'пропозицій купити': rs.filter(r => r.offer).length, 'оцінка мед.': Math.round(med(rs.map(r => r.val))) });
    if (expect === 'idle' && crash < SEEDS * .8) problems.push(`${idea}: бездіяльний гравець не банкрутує (${crash} з ${SEEDS})`);
    if (expect === 'smart' && crash > SEEDS * .35) problems.push(`${idea}: розважливий банкрутує надто часто (${crash} з ${SEEDS})`);
    if (expect === 'reckless' && crash < SEEDS * .6) problems.push(`${idea}: необачний майже не банкрутує (${crash} з ${SEEDS})`);
  }
}
console.table(rows);
const smart = rows.filter(r => r.стратегія.startsWith('розважливий'));
for (const r of smart) if (r['виручка/тиж. мед.'] < 3000) problems.push(`${r.ідея}: навіть у найкращого сегмента виручка ${r['виручка/тиж. мед.']} ₴/тиж. (мінімум 3000, інакше гра не окупається)`);
const withOffer = smart.filter(r => r['пропозицій купити'] > 0).length;
console.log(`ідей, де розважливий отримує пропозицію купити компанію: ${withOffer} з ${smart.length}`);
if (withOffer < 3) problems.push('кінцівка «продано» досяжна менш ніж у трьох ідей з чотирьох');
console.log(problems.length ? 'БАЛАНС: ' + problems.join('\n  ') : 'баланс у межах');
if (problems.length) process.exitCode = 1;
