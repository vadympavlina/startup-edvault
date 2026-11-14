// Симулятор стартапу · вправи етапу 6 «Просування»: канали й календар, воронка продажів, стимулювання збуту, рекламний креатив.
import { FONTS, SYMBOLS } from './mods.js';
import { esc, term, wideChart } from './ui.js';
import { icon } from './icons.js';
import { logo } from './ui.js';
import { reg, xb, xp, xin, xsl, xnum, xcol, tip, box, checks, bar, X, clamp, sumOf, pc, money0 } from './ex-core.js';

const len = s => String(s || '').trim().length;
const price0 = S => S.s.price[S.s.target] || 100;
const lerp = (a, b, t) => a + (b - a) * t;

/* ═════════ План просування ═════════ */
const CHN = [
  { k: 'flyers', t: 'Флаєри й афіші', on: false, cost: 800, reach: 600, fit: 'events', ctr: .015, note: 'У школах, під’їздах, кав’яднях. Дешево, але охоплення місцеве.' },
  { k: 'events', t: 'Виступи й заходи', on: false, cost: 1500, reach: 400, fit: 'events', ctr: .06, note: 'Людей мало, але вони зацікавлені й можуть спробувати одразу.' },
  { k: 'partners', t: 'Партнерство зі школами й магазинами', on: false, cost: 500, reach: 900, fit: 'sales', ctr: .03, note: 'Партнер розповідає про вас своїй аудиторії: довіра вища.' },
  { k: 'press', t: 'Місцева преса й радіо', on: false, cost: 3500, reach: 5000, fit: 'ads', ctr: .008, note: 'Велике охоплення, але важко виміряти результат.' },
  { k: 'word', t: 'Сарафанне радіо й реферали', on: false, cost: 300, reach: 300, fit: 'referral', ctr: .08, note: 'Найвища довіра: друзі радять друзям. Потрібен хороший продукт.' },
  { k: 'social', t: 'Власні соцмережі', on: true, cost: 0, reach: 700, fit: 'social', ctr: .02, note: 'Безкоштовно, але потрібні години на контент.' },
  { k: 'ads', t: 'Таргетована реклама', on: true, cost: 4000, reach: 9000, fit: 'ads', ctr: .012, note: 'Швидко й масштабно. Платите за кожен показ.' },
  { k: 'blog', t: 'Реклама в блогерів', on: true, cost: 6000, reach: 12000, fit: 'bloggers', ctr: .01, note: 'Сплеск відвідувачів, якщо аудиторія блогера — ваша.' },
  { k: 'email', t: 'Email-розсилка', on: true, cost: 200, reach: 800, fit: 'seo', ctr: .04, note: 'Дешево й добре повертає тих, хто вже знає вас.' },
  { k: 'seo', t: 'Статті й пошук (SEO)', on: true, cost: 500, reach: 500, fit: 'seo', ctr: .03, note: 'Ефект накопичується тижнями й місяцями.' },
  { k: 'video', t: 'Короткі відео', on: true, cost: 700, reach: 3000, fit: 'social', ctr: .015, note: 'Може «злетіти», якщо ролик вдалий.' },
];
const WEEKS6 = 6;
function chCalc(S, d) {
  const g = S.seg(), perWeek = Array.from({ length: WEEKS6 }, () => ({ cost: 0, reach: 0, n: 0, vis: 0 }));
  for (const k of d.sel) {
    const c = CHN.find(x => x.k === k), fit = clamp(g.fit?.[c.fit] ?? .8, .3, 1.5);
    (d.grid[k] || []).forEach((on, i) => { if (!on) return; const w = perWeek[i]; w.n++; w.cost += c.cost; const eff = c.reach * fit; w.reach += eff; w.vis += eff * c.ctr; });
  }
  perWeek.forEach(w => { const ov = 1 - .07 * Math.max(0, w.n - 1); w.reach *= ov; w.vis *= ov; });
  const cost = sumOf(perWeek.map(w => w.cost)), reach = sumOf(perWeek.map(w => w.reach)), vis = sumOf(perWeek.map(w => w.vis)), signups = vis * (g.sr || .05) * 3, payers = signups * .2;
  return { perWeek, cost, reach, vis, signups, payers, cac: payers > .5 ? cost / payers : null, cells: sumOf(d.sel.map(k => (d.grid[k] || []).filter(Boolean).length)) };
}
const fitLabel = (S, c) => { const f = S.seg().fit?.[c.fit]; return f == null ? ['—', ''] : f >= 1.05 ? ['добре', 'ok'] : f >= .6 ? ['так собі', 'warn'] : ['слабко', 'bad']; };
reg({
  id: 'channels', stage: 5, t: 'План просування', d: 'Оберіть канали й розплануйте шість тижнів.', icon: 'megaphone', min: 18,
  intro: `${term('Канал', 'Канали')} просування бувають <b>офлайн</b> (флаєри, заходи, партнери) й <b>онлайн</b> (соцмережі, реклама, блогери). Кожен має ціну, охоплення й підходить вашій аудиторії по-різному. Оберіть набір, розставте його по тижнях і подивіться, скільки коштуватиме клієнт.`,
  data: () => ({ sel: [], grid: {}, budget: 25000, why: '' }),
  view(S, d) {
    const card = c => { const on = d.sel.includes(c.k), [fw, fc] = fitLabel(S, c); return `<div class="chcard ${on ? 'on' : ''}">${xp('channels', 'sel', c.k, esc(c.t), on, { set: 'chn', cls: 'card' })}<small>${c.on ? 'онлайн' : 'офлайн'} · ${c.cost ? `${money0(c.cost)} / тиждень` : 'безкоштовно'} · охоплення ≈ ${c.reach.toLocaleString('uk-UA')}</small><small>Для вашої аудиторії: <span class="xtag ${fc}">${fw}</span></small><p>${esc(c.note)}</p></div>`; };
    return `${box('1. Оберіть канали', `<div class="xg c2">${CHN.map(card).join('')}</div>`, { ic: 'compass', side: `обрано ${d.sel.length}` })}
    ${box('2. Розплануйте шість тижнів', d.sel.length ? `<div class="xscroll"><table class="cal"><thead><tr><th>Канал</th>${Array.from({ length: WEEKS6 }, (_, i) => `<th>Тиж. ${i + 1}</th>`).join('')}</tr></thead><tbody>${d.sel.map(k => { const c = CHN.find(x => x.k === k); return `<tr><th scope="row">${esc(c.t)}</th>${Array.from({ length: WEEKS6 }, (_, i) => `<td><button type="button" class="cel ${d.grid[k]?.[i] ? 'on' : ''}" aria-pressed="${!!d.grid[k]?.[i]}" aria-label="${esc(c.t)}, тиждень ${i + 1}" data-act="ex" data-ex="channels" data-do="flip" data-a="${k}" data-i="${i}">${d.grid[k]?.[i] ? icon('check', 14) : ''}</button></td>`).join('')}</tr>`; }).join('')}</tbody></table></div><p class="sm muted">Натискайте клітинки, щоб увімкнути канал на тиждень.</p>` : '<p class="sm muted">Спершу оберіть канали вище.</p>', { ic: 'calendar' })}
    ${box('3. Бюджет', xsl('channels', 'budget', d, { min: 5000, max: 150000, step: 5000, label: 'Скільки готові витратити за шість тижнів', u: ' ₴' }), { ic: 'wallet' })}`;
  },
  live(S, d) {
    const c = chCalc(S, d), on = d.sel.filter(k => CHN.find(x => x.k === k).on).length, off = d.sel.length - on;
    return `${box('Що це дасть', `<div class="kpis3"><div><small>Витрати за 6 тижнів</small><b class="${c.cost > d.budget ? 'neg' : ''}">${money0(c.cost)}</b></div><div><small>Охоплення (людей)</small><b>${Math.round(c.reach).toLocaleString('uk-UA')}</b></div><div><small>Вартість платного клієнта (CAC)</small><b>${c.cac ? money0(c.cac) : '—'}</b></div></div>
      ${wideChart([{ v: c.perWeek.map(w => Math.round(w.reach)), color: '#6366f1', label: 'Охоплення за тиждень', area: true }, { v: c.perWeek.map(w => Math.round(w.cost)), color: '#ef4444', label: 'Витрати за тиждень' }], { labels: c.perWeek.map((_, i) => String(i + 1)), fmt: x => Math.round(x).toLocaleString('uk-UA') })}
      <p class="sm muted">Очікувані переходи на сайт: ≈ ${Math.round(c.vis)} · реєстрації ≈ ${Math.round(c.signups)} · платні клієнти ≈ ${Math.round(c.payers)}. Це оцінка: у грі результат залежить ще й від продукту. Канали одночасно частково «перетинаються» в аудиторії, тому охоплення не складається просто.</p>
      ${checks([[on >= 1 && off >= 1, 'Є і онлайн-, і офлайн-канали', 'Змішайте: різні канали бачать різні люди'], [d.sel.length >= 3, 'Обрано хоча б три канали'], [c.cells >= 6, 'Заплановано хоча б шість «клітинок»', 'Розставте канали по тижнях'], [c.cost > 0 && c.cost <= d.budget, 'Витрати вкладаються в бюджет', 'Зменште кількість тижнів чи приберіть дорогий канал']])}
      ${xin('channels', 'why', d, { label: 'Чому саме такий набір каналів?', area: true, rows: 2, max: 240, ph: 'Ми обрали ці канали, бо наша аудиторія…', cls: 'mt' })}`, { ic: 'chart' })}`;
  },
  acts: {
    flip(S, d, el) { const k = el.dataset.a, i = +el.dataset.i; (d.grid[k] ||= Array(WEEKS6).fill(false))[i] = !d.grid[k][i]; },
    chn(S, d, el) { const k = el.dataset.v, i = d.sel.indexOf(k); if (i >= 0) { d.sel.splice(i, 1); delete d.grid[k]; } else if (d.sel.length < 6) { d.sel.push(k); d.grid[k] = [true, true, true, true, false, false]; } },
  },
  ready(S, d) {
    const c = chCalc(S, d), on = d.sel.filter(k => CHN.find(x => x.k === k).on).length;
    if (d.sel.length < 3 || !on || d.sel.length === on) return { ok: false, msg: 'Оберіть хоча б три канали: і онлайн, і офлайн' };
    if (c.cells < 6) return { ok: false, msg: 'Розставте канали по тижнях: хоча б шість клітинок' };
    if (c.cost > d.budget) return { ok: false, msg: 'Витрати перевищують бюджет' };
    if (len(d.why) < 20) return { ok: false, msg: 'Поясніть вибір каналів' };
    return { ok: true, stars: 1 + (c.cac && c.cac < price0(S) * 6 ? 1 : 0) + (d.sel.length >= 4 ? 1 : 0) };
  },
});
/* ═════════ Воронка продажів ═════════ */
const FS = [['Побачили', null], ['Зайшли на сайт', [20, 40]], ['Зареєструвалися', [35, 60]], ['Спробували продукт', [40, 70]], ['Заплатили', [10, 25]]];
const IMP = [
  { k: 'creative', st: 0, t: 'Сильніший рекламний креатив', up: .3, cost: 3000 }, { k: 'more', st: 0, t: 'Додати ще один канал', up: .3, cost: 6000, reach: true },
  { k: 'site', st: 1, t: 'Швидкий сайт і зрозумілий заголовок', up: .3, cost: 2000 }, { k: 'proof', st: 1, t: 'Відгуки й приклади на сайті', up: .2, cost: 1500 },
  { k: 'reg', st: 2, t: 'Реєстрація в один клік', up: .25, cost: 2500 }, { k: 'demo', st: 2, t: 'Показати продукт без реєстрації', up: .2, cost: 3500 },
  { k: 'onb', st: 3, t: 'Підказки для першого запуску', up: .3, cost: 4000 }, { k: 'trial', st: 3, t: 'Пробний період із нагадуваннями', up: .35, cost: 3000 },
  { k: 'pay', st: 4, t: 'Більше способів оплати', up: .2, cost: 1500 }, { k: 'offer', st: 4, t: 'Персональна пропозиція після пробного', up: .25, cost: 2000 },
];
function fCalc(S, d, picks = []) {
  const up = [0, 0, 0, 0, 0]; let reach = d.reach, extra = 0;
  for (const k of picks) { const m = IMP.find(x => x.k === k); extra += m.cost; if (m.reach) reach *= 1 + m.up; else up[m.st] += m.up; }
  const rates = d.rates.map((r, i) => clamp(r * (1 + (up[i + 1] || 0)), 0, 100)); rates[0] = clamp(d.rates[0] * (1 + up[0]), 0, 100);
  const n = [reach]; for (let i = 0; i < 4; i++) n.push(n[i] * rates[i] / 100);
  const payers = n[4], cost = d.adcost + extra, cac = payers >= .5 ? cost / payers : null, ltv = price0(S) * (100 / Math.max(1, d.churn)), rev = payers * price0(S);
  return { n, rates, payers, cost, cac, ltv, ratio: cac ? ltv / cac : 0, rev };
}
const bottle = d => { const r = d.rates.map((x, i) => (FS[i + 1][1] ? x / ((FS[i + 1][1][0] + FS[i + 1][1][1]) / 2) : 1)); return r.indexOf(Math.min(...r)); };
reg({
  id: 'funnel', stage: 5, t: 'Воронка продажів', d: 'Знайдіть вузьке місце воронки й оберіть, що покращити.', icon: 'chart', min: 15,
  intro: `${term('Воронка', 'Воронка')} показує, як люди «відсіюються» на шляху до оплати: побачили → зайшли → зареєструвались → спробували → заплатили. Знайдіть найслабший крок і покращуйте його: це дає більше, ніж просто більше реклами. Порахуйте також, чи окупається клієнт (${term('LTV', 'LTV')} проти ${term('CAC', 'CAC')}).`,
  data: S => ({ reach: 20000, rates: [3, 25, 40, 12], adcost: 30000, churn: 8, picks: [], why: '', ch: 0 }),
  onSet: (S, d, p) => { if (p !== 'picks') d.ch = (d.ch || 0) + 1; },
  view(S, d) {
    return `${box('Ваша воронка зараз', `<div class="xg c2">${xsl('funnel', 'reach', d, { min: 1000, max: 200000, step: 1000, label: 'Скільки людей побачили вас', u: '' })}${xsl('funnel', 'adcost', d, { min: 0, max: 300000, step: 5000, label: 'Витрати на просування', u: ' ₴' })}${xsl('funnel', 'churn', d, { min: 2, max: 30, step: 1, label: 'Скільки платних клієнтів іде щомісяця', u: '%' })}</div>
      <div class="xg c2 mt">${d.rates.map((r, i) => xsl('funnel', `rates.${i}`, d, { min: 0, max: 100, step: 1, label: `${FS[i][0]} → ${FS[i + 1][0].toLowerCase()}`, u: '%', v: r })).join('')}</div>`, { ic: 'wrench' })}`;
  },
  live(S, d) {
    const A = fCalc(S, d), B = fCalc(S, d, d.picks), b = bottle(d), max = A.n[0];
    return `${box('Воронка', `<div class="fun">${FS.map(([t], i) => `<div class="fst ${i - 1 === b ? 'weak' : ''}"><span>${t}</span><div class="fb"><i style="width:${Math.max(2, A.n[i] / max * 100)}%"></i><b>${Math.round(A.n[i]).toLocaleString('uk-UA')}</b></div>${i ? `<small>${(A.rates[i - 1]).toFixed(0)}% ${FS[i][1] ? `· норма ${FS[i][1][0]}–${FS[i][1][1]}%` : ''}</small>` : '<small></small>'}</div>`).join('')}</div>
      <div class="kpis3 mt"><div><small>Платних клієнтів</small><b>${A.payers.toFixed(1).replace('.', ',')}</b></div><div><small>CAC: вартість клієнта</small><b>${A.cac ? money0(A.cac) : '—'}</b></div><div><small>LTV: скільки клієнт принесе за весь час</small><b>${money0(A.ltv)}</b></div></div>
      ${A.cac ? (A.ratio >= 3 ? tip(`LTV / CAC = ${A.ratio.toFixed(1).replace('.', ',')}. Клієнт окупається з запасом (орієнтир — від 3).`, 'ok') : A.ratio >= 1 ? tip(`LTV / CAC = ${A.ratio.toFixed(1).replace('.', ',')}. Клієнт ледве окупається. Орієнтир — від 3.`, 'warn') : tip(`LTV / CAC = ${A.ratio.toFixed(1).replace('.', ',')}. Клієнт коштує більше, ніж приносить: так компанія втрачає гроші.`, 'bad')) : ''}
      <p class="sm muted">Найслабший крок порівняно з нормою: <b>«${FS[b][0]} → ${FS[b + 1][0].toLowerCase()}»</b>.</p>`, { ic: 'chart' })}
    ${box('Що покращимо? Оберіть до трьох змін', `<div class="xg c2">${IMP.map(m => `<div class="chcard ${d.picks.includes(m.k) ? 'on' : ''}">${xp('funnel', 'picks', m.k, esc(m.t), d.picks.includes(m.k), { set: 'tog', max: 3, cls: 'card' })}<small>Крок: ${FS[m.st][0]}${m.st < 4 ? ' → ' + FS[m.st + 1][0].toLowerCase() : ''} · ${m.reach ? 'охоплення +' : 'ефект +'}${Math.round(m.up * 100)}% · ${money0(m.cost)}</small></div>`).join('')}</div>
      ${d.picks.length ? `<div class="kpis3 mt"><div><small>Платних клієнтів: було → стало</small><b>${A.payers.toFixed(1).replace('.', ',')} → ${B.payers.toFixed(1).replace('.', ',')}</b></div><div><small>CAC: було → стало</small><b>${A.cac ? money0(A.cac) : '—'} → ${B.cac ? money0(B.cac) : '—'}</b></div><div><small>LTV / CAC</small><b class="${B.ratio >= 3 ? 'pos' : ''}">${B.ratio.toFixed(1).replace('.', ',')}</b></div></div>` : ''}
      ${xin('funnel', 'why', d, { label: 'Чому ви обрали саме ці зміни?', area: true, rows: 2, max: 240, ph: 'Найслабший крок — …, тому я покращую…', cls: 'mt' })}`, { ic: 'rocket', side: `обрано ${d.picks.length} з 3` })}`;
  },
  ready(S, d) {
    const b = bottle(d), A = fCalc(S, d), B = fCalc(S, d, d.picks);
    if (d.picks.length < 2) return { ok: false, msg: 'Оберіть хоча б дві зміни' };
    if (len(d.why) < 20) return { ok: false, msg: 'Поясніть, чому обрали саме ці зміни' };
    const hit = d.picks.some(k => IMP.find(x => x.k === k).st === b + 1);
    return { ok: true, stars: 1 + (hit ? 1 : 0) + (B.ratio >= 3 || B.payers > A.payers * 1.3 ? 1 : 0) };
  },
});

/* ═════════ Стимулювання збуту ═════════ */
const MECH = {
  disc: { t: 'Знижка', up: d => 1 + 1.8 * Math.pow(d, .8), eff: (d) => d, setup: 0, dip: .15, p: 'Розмір знижки', min: 5, max: 50, def: 20, note: 'Швидко піднімає продажі, але привчає чекати знижок.' },
  bogo: { t: '2 за ціною 1', up: () => 1.9, eff: () => .5, setup: 0, dip: .2, p: null, note: 'Продаєте вдвічі більше одиниць, але кожну вдвічі дешевше.' },
  gift: { t: 'Подарунок до покупки', up: () => 1.35, eff: d => d, setup: 0, dip: .05, p: 'Вартість подарунка, % від ціни', min: 5, max: 25, def: 10, note: 'Менше б’є по ціні, ніж знижка, і виглядає щедро.' },
  loyal: { t: 'Бонуси за повторні покупки', up: () => 1.15, eff: d => d, setup: 2000, dip: 0, p: 'Бонус, % від ціни', min: 3, max: 15, def: 5, note: 'Повертає клієнтів, ефект повільний, але стійкий.' },
  ref: { t: 'Бонус за друга', up: () => 1.3, eff: d => d, setup: 1000, dip: 0, p: 'Бонус, % від ціни', min: 5, max: 30, def: 15, note: 'Нових клієнтів приводять ваші ж клієнти: дешево й довіра висока.' },
  trial: { t: 'Безкоштовний пробний період', up: () => 1.6, eff: () => .3, setup: 3000, dip: .1, p: null, note: 'Знімає страх спробувати. Частина людей так і не заплатить.' },
  contest: { t: 'Конкурс у соцмережах', up: () => 1.25, eff: () => 0, setup: 3000, dip: .05, p: null, note: 'Дає охоплення й увагу; ефект короткий.' },
};
const pmx = (S, d, s) => {
  const M = MECH[s.mech]; if (!M) return null; const pr = d.price, u = d.unit, base = d.base, par = (s.par ?? M.def ?? 0) / 100, up = M.up(par), eff = M.eff(par);
  const baseProfit = base * (pr - u), wk = s.weeks, promoWk = base * up * (pr * (1 - eff) - u), dip = base * M.dip * 2 * (pr - u);
  const delta = (promoWk - baseProfit) * wk - M.setup - dip, need = (pr * (1 - eff) - u) > 0 ? (pr - u) / (pr * (1 - eff) - u) : Infinity;
  return { up, eff, delta, need, promoWk, baseProfit, M };
};
reg({
  id: 'promomix', stage: 5, t: 'Стимулювання збуту', d: 'Сконструюйте до трьох акцій і порівняйте їхній прибуток.', icon: 'tag', min: 15,
  intro: `${term('Стимулювання збуту', 'Стимулювання збуту')} — це тимчасові стимули купити зараз. Акція завжди коштує: ви віддаєте частину прибутку або платите за подарунок. Вона вигідна, лише якщо продажі зростуть сильніше, ніж упаде прибуток із кожного. Сконструюйте кілька акцій і порівняйте.`,
  data: S => { const c = X(S, 'costs'), u = c.unit.reduce((a, x) => a + (+x.v || 0), 0); return { base: 40, price: price0(S), unit: Math.round(u), s: [{ mech: 'disc', par: 20, weeks: 2 }, { mech: null, weeks: 2 }, { mech: null, weeks: 2 }], pick: -1, why: '' }; },
  view(S, d) {
    return `${box('Умови', `<div class="xg c3">${xnum('promomix', 'base', d, { min: 1, max: 100000, label: 'Скільки продажів на тиждень без акцій', u: '' })}${xnum('promomix', 'price', d, { min: 1, label: 'Ціна', u: '₴' })}${xnum('promomix', 'unit', d, { min: 0, label: 'Собівартість', u: '₴' })}</div>`, { ic: 'wrench' })}
    <div class="xg c3">${d.s.map((s, i) => { const M = MECH[s.mech]; return `<article class="xbox promo ${d.pick === i ? 'pk' : ''}"><header><h3>Акція ${'ABC'[i]}</h3></header><div class="xcol1">${Object.entries(MECH).map(([k, m]) => xp('promomix', `s.${i}.mech`, k, m.t, s.mech === k)).join('')}</div>
      ${M ? `<p class="sm muted">${esc(M.note)}</p>${M.p ? xsl('promomix', `s.${i}.par`, d, { min: M.min, max: M.max, step: 1, label: M.p, u: '%', v: s.par ?? M.def }) : ''}${xsl('promomix', `s.${i}.weeks`, d, { min: 1, max: 8, step: 1, label: 'Тривалість', u: ' тиж.' })}` : '<p class="sm muted">Оберіть механіку акції.</p>'}</article>`; }).join('')}</div>`;
  },
  live(S, d) {
    const R = d.s.map(s => pmx(S, d, s)), ok = R.filter(Boolean), best = ok.length ? Math.max(...ok.map(r => r.delta)) : 0;
    return `${box('Порівняння', ok.length ? `<div class="xlist">${R.map((r, i) => r ? `<div class="nrow ${r.delta === best && r.delta > 0 ? 'best' : ''}"><div class="nh"><b>Акція ${'ABC'[i]}: ${esc(r.M.t)}</b><span class="ns ${r.delta >= 0 ? 'pos' : 'neg'}">${r.delta >= 0 ? '+' : '−'}${money0(Math.abs(r.delta))}</span></div>${bar(Math.max(0, r.delta) / Math.max(1, best), { color: r.delta > 0 ? 'var(--ok)' : '#d33', label: 'Прибуток' })}<p class="sm muted">Продажі зростуть у ×${r.up.toFixed(2).replace('.', ',')}; щоб акція окупилась, потрібно хоча б ×${r.need === Infinity ? '∞' : r.need.toFixed(2).replace('.', ',')}. ${r.M.dip ? 'Після акції буде короткий спад (люди вже купили наперед).' : ''}</p>${xp('promomix', 'pick', i, d.pick === i ? 'Це моя найкраща акція' : 'Обрати як найкращу', d.pick === i, { t: 'n', cls: 'card' })}</div>` : '').join('')}</div><p class="sm muted">Число справа — зміна прибутку порівняно з тижнями без акції (з урахуванням витрат на запуск і спаду після).</p>` : '<p class="sm muted">Сконструюйте хоча б дві акції.</p>', { ic: 'chart' })}
    ${xin('promomix', 'why', d, { label: 'Чому ця акція найкраща? Коли її краще запускати?', area: true, rows: 2, max: 240, ph: 'Ця акція вигідніша, бо…', cls: 'mt' })}
    <div class="xrow mt">${xb('promomix', 'sync', 'Взяти ціну й собівартість з гри', { ic: 'refresh' })}${xb('promomix', 'toGame', 'Відкрити розділ «Акції» в грі', { ic: 'right' })}</div>`;
  },
  acts: { toGame(S, d, el, C) { C.go('promo'); return false; },
    sync(S, d, el, C) { const c = X(S, 'costs'); d.price = price0(S); d.unit = Math.round(c.unit.reduce((a, x) => a + (+x.v || 0), 0)); C.toast('Ціну й собівартість взято з гри', 'good'); } },
  ready(S, d) {
    const R = d.s.map(s => pmx(S, d, s)), ok = R.filter(Boolean);
    if (ok.length < 2) return { ok: false, msg: 'Сконструюйте хоча б дві акції' };
    if (d.pick < 0 || !R[d.pick]) return { ok: false, msg: 'Оберіть найкращу акцію' };
    if (len(d.why) < 20) return { ok: false, msg: 'Поясніть свій вибір' };
    const best = Math.max(...ok.map(r => r.delta));
    return { ok: true, stars: 1 + (R[d.pick].delta === best ? 1 : 0) + (d.s.some(s => s.mech && s.mech !== 'disc' && s.mech !== 'bogo') ? 1 : 0) };
  },
});

/* ═════════ Рекламний креатив ═════════ */
const FMT = { sq: ['Пост 1:1', '1 / 1'], st: ['Сторіс 9:16', '9 / 16'], pos: ['Афіша 3:4', '3 / 4'], ban: ['Банер 16:9', '16 / 9'] };
const LAY = { big: 'Великий заголовок', offer: 'Акційна позначка', split: 'Дві частини', quote: 'Відгук' };
const DECO = { none: 'Без прикрас', circ: 'Кола', stripe: 'Смуги', dots: 'Крапки' };
const lumA = h => { const n = parseInt(String(h).replace('#', '').padEnd(6, '0').slice(0, 6), 16), f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(n >> 16) + .7152 * f((n >> 8) & 255) + .0722 * f(n & 255); };
const ctr = (a, b) => { const x = lumA(a), y = lumA(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const CTAV = /^(спробу|завантаж|замов|купу|дізна|зареєс|приєдн|отрима|почн|скористай|переглян|запиши|забер|встанови|вибер|перевір)/i;
const adCheck = d => {
  const hw = d.head.trim().split(/\s+/).filter(Boolean).length, txt = d.head + ' ' + d.sub, tc = ctr(d.tx, d.bg);
  return [[hw >= 2 && hw <= 8, 'Заголовок короткий: 2–8 слів', 'Люди читають рекламу за секунди'], [tc >= 4.5, `Текст читається: контраст ${tc.toFixed(1).replace('.', ',')} : 1`, 'Світліший текст на темному тлі або навпаки'], [CTAV.test(d.cta.trim()), 'Заклик до дії починається з дієслова («Спробуй», «Замов»)', 'Скажіть людині, що зробити'], [/\d/.test(txt) || len(d.badge) > 0, 'Є конкретна пропозиція: цифра, знижка чи термін', 'Додайте цифру або позначку'], [txt.length <= 130, 'Не забагато тексту (до 130 символів)', 'Скоротіть: реклама — не стаття'], [d.logo, 'Є логотип компанії']];
};
reg({
  id: 'ad', stage: 5, cols: true, t: 'Рекламний креатив', d: 'Створіть оголошення в потрібному форматі й перевірте його.', icon: 'palette', min: 15,
  intro: `${term('Креатив', 'Креатив')} — це готове оголошення: заголовок, картинка, заклик до дії. Хороший креатив зрозумілий за три секунди: що пропонують, кому й що робити далі. Оберіть формат, оформте й пройдіться чек-листом.`,
  data: S => ({ fmt: 'sq', lay: 'big', head: '', sub: '', cta: '', badge: '', bg: S.s.company.color, ac: '#ffd43b', deco: 'circ', sym: S.s.company.sym || 'spark', font: 'modern', logo: true, t: 0 }),
  onSet: (S, d, p) => { d.t = (d.t || 0) + 1; },
  ctx(S, d) {
    const tx = d.bg && lumA(d.bg) > .45 ? '#1d2433' : '#ffffff', c = { ...d, tx }, F = FONTS[d.font], ck = adCheck(c), score = Math.round(ck.filter(x => x[0]).length / ck.length * 100);
    const mark = d.logo ? `<div class="pl">${logo(S.s.company, 26)}<span>${esc(S.s.company.name)}</span></div>` : '';
    const poster = `<div class="posterw"><div class="poster lay-${d.lay} deco-${d.deco}" style="--ar:${FMT[d.fmt][1]};--bg:${d.bg};--ac:${d.ac};--tx:${tx};font-family:${F.css}">${d.deco !== 'none' ? '<i class="d1"></i><i class="d2"></i>' : ''}${mark}${d.badge ? `<span class="pb">${esc(d.badge)}</span>` : ''}<div class="pbody">${d.lay === 'quote' ? `<span class="qm">“</span>` : ''}<h3 style="font-weight:${F.w}">${esc(d.head || 'Ваш заголовок')}</h3>${d.sub ? `<p>${esc(d.sub)}</p>` : ''}${d.cta ? `<span class="pc">${esc(d.cta)}</span>` : ''}</div>${d.lay !== 'split' && d.lay !== 'quote' ? `<span class="psy">${icon(d.sym, 56)}</span>` : ''}</div></div>`;
    return { poster, score, ck };
  },
  view(S, d) {
    return `      ${box('Формат і вигляд', `<div class="xrow">${Object.entries(FMT).map(([k, f]) => xp('ad', 'fmt', k, f[0], d.fmt === k)).join('')}</div><div class="xrow mt">${Object.entries(LAY).map(([k, t]) => xp('ad', 'lay', k, t, d.lay === k)).join('')}</div><div class="xrow mt">${Object.entries(DECO).map(([k, t]) => xp('ad', 'deco', k, t, d.deco === k)).join('')}</div>
        <div class="xrow mt">${xcol('ad', 'bg', d, { label: 'Тло' })}${xcol('ad', 'ac', d, { label: 'Акцент' })}${Object.entries(FONTS).map(([k, f]) => `<button type="button" class="xp ${d.font === k ? 'on' : ''}" data-act="ex" data-ex="ad" data-do="set" data-p="font" data-v="${k}" data-t="s" style="font-family:${f.css};font-weight:${f.w}">${f.t}</button>`).join('')}</div>
        <div class="syms">${SYMBOLS.map(sy => `<button type="button" class="sym ${d.sym === sy ? 'on' : ''}" data-act="ex" data-ex="ad" data-do="set" data-p="sym" data-v="${sy}" data-t="s" aria-label="Символ ${sy}">${icon(sy, 20)}</button>`).join('')}</div>`, { ic: 'palette' })}
      ${box('Текст', `${xin('ad', 'head', d, { label: 'Заголовок', max: 60, ph: 'Домашка за 5 хвилин, а не за 2 години' })}${xin('ad', 'sub', d, { label: 'Другий рядок', max: 90, ph: 'Пояснення кожного кроку — на кожен предмет', cls: 'mt' })}<div class="xg c2 mt">${xin('ad', 'cta', d, { label: 'Заклик до дії', max: 24, ph: 'Спробуй безкоштовно' })}${xin('ad', 'badge', d, { label: 'Позначка (необов’язково)', max: 14, ph: '−20%' })}</div><label class="switch mt"><input type="checkbox" data-exi="ad" data-p="logo" ${d.logo ? 'checked' : ''}><span></span>Показати логотип</label>`, { ic: 'pen' })}`;
  },
  live(S, d) {
    const { poster, score, ck } = this.ctx(S, d);
    return `${box('Ваш креатив', poster, { ic: 'eye' })}${box('Чек-лист', `<div class="uscore"><b>${score}</b><span>з 100</span></div>${checks(ck.map(x => [x[0], x[1], x[2]]))}`, { ic: 'check' })}`;
  },
  ready(S, d) {
    const tx = d.bg && lumA(d.bg) > .45 ? '#1d2433' : '#ffffff', ck = adCheck({ ...d, tx }), n = ck.filter(x => x[0]).length;
    if (len(d.head) < 8) return { ok: false, msg: 'Напишіть заголовок' };
    if (len(d.cta) < 3) return { ok: false, msg: 'Додайте заклик до дії' };
    if ((d.t || 0) < 1) return { ok: false, msg: 'Оформте креатив під свій бренд: змініть хоча б одне налаштування' };
    if (n < 4) return { ok: false, msg: `Креатив проходить лише ${n} з ${ck.length} перевірок: потрібно хоча б 4` };
    return { ok: true, stars: n === ck.length ? 3 : n >= 5 ? 2 : 1 };
  },
});
