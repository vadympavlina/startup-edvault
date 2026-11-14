// Симулятор стартапу · вправи етапу 4 «Ціна й гроші»: собівартість, ціна, фінансовий план, асортимент.
import { esc, term, wideChart } from './ui.js';
import { icon } from './icons.js';
import { reg, xb, xp, xin, xsl, xnum, tip, box, checks, bar, X, clamp, sumOf, pc, money0 } from './ex-core.js';

const len = s => String(s || '').trim().length;
const r10 = n => Math.round(n / 10) * 10;
const noun = S => S.I.kind === 'hardware' ? 'одиниць' : 'платних клієнтів';
const perWord = S => S.I.kind === 'hardware' ? 'одиницю' : 'клієнта';
const gamePrice = S => S.s.price[S.s.target] || 100;

/* ═════════ Собівартість ═════════ */
const costDefaults = S => {
  const I = S.I, hw = I.kind === 'hardware', p = gamePrice(S);
  const unit = hw ? [['Компоненти', .6], ['Складання', .2], ['Упаковка й доставка', .2]].map(([t, k]) => ({ t, v: Math.round((I.unitCost || 400) * k) })) : [['Сервери й сервіси на клієнта', .08], ['Комісія платіжної системи', .03], ['Підтримка клієнта', .06]].map(([t, k]) => ({ t, v: Math.max(1, Math.round(p * k)) }));
  return { unit, fixed: [{ t: 'Інструменти й підписки', v: 3000 }, { t: 'Хостинг і домен', v: 1500 }, { t: 'Реклама', v: 10000 }, { t: 'Бухгалтер', v: 2500 }], price: p, vol: 100, ch: 0, guess: 100, reveal: false };
};
const costTotals = d => { const u = sumOf(d.unit.map(x => +x.v || 0)), f = sumOf(d.fixed.map(x => +x.v || 0)), m = d.price - u; return { u, f, m, be: m > 0 ? Math.ceil(f / m) : Infinity }; };
function costsLive(S, d, t) {
    const max = Math.max(100, Math.min(5000, Math.ceil((t.be === Infinity ? 200 : t.be * 2) / 50) * 50)), n = 11, xs = Array.from({ length: n }, (_, i) => Math.round(max * i / (n - 1)));
    const profit = (d.price - t.u) * d.vol - t.f;
    const gOk = d.reveal && t.be !== Infinity && Math.abs(d.guess - t.be) <= Math.max(5, t.be * .2);
    return `${box('Беззбитковість', `${d.guess != null ? tip(gOk ? `Влучили! Ви вгадали ${d.guess}, а точка беззбитковості — ${t.be.toLocaleString('uk-UA')}.` : t.be === Infinity ? 'За цієї ціни вийти «в нуль» неможливо.' : `Ви вгадали ${d.guess}, а точка беззбитковості — ${t.be.toLocaleString('uk-UA')}. Це нормально: після вправи ви відчуватимете цифри краще.`, gOk ? 'ok' : '') : ''}<div class="kpis3"><div><small>Прибуток із однієї ${S.I.kind === 'hardware' ? 'одиниці' : 'продажі'}</small><b class="${t.m > 0 ? 'pos' : 'neg'}">${money0(t.m)}</b></div><div><small>Беззбитковість</small><b>${t.be === Infinity ? 'недосяжна' : `${t.be.toLocaleString('uk-UA')} ${noun(S)}`}</b></div><div><small>Прибуток на місяць за ${d.vol}</small><b class="${profit >= 0 ? 'pos' : 'neg'}">${money0(profit)}</b></div></div>
      ${wideChart([{ v: xs.map(q => d.price * q), color: '#16a34a', label: 'Виручка' }, { v: xs.map(q => t.f + t.u * q), color: '#ef4444', label: 'Витрати' }], { labels: xs.map(String), fmt: x => (x / 1000).toFixed(0) + ' тис.' })}
      ${t.m <= 0 ? tip('Ціна не покриває змінні витрати: чим більше продаєте, тим більше втрачаєте. Підніміть ціну або зменшіть витрати.', 'bad') : tip(`Після ${t.be.toLocaleString('uk-UA')} ${noun(S)} щомісяця кожна наступна приносить ${money0(t.m)} прибутку.`, 'ok')}`, { ic: 'chart' })}`;
  
}
reg({
  id: 'costs', stage: 3, t: 'Собівартість і витрати', d: 'Порахуйте витрати на одиницю й щомісяця та знайдіть точку беззбитковості.', icon: 'wallet', min: 12,
  intro: `${term('Собівартість', 'Собівартість')} — це скільки коштує один клієнт, плюс витрати, які йдуть щомісяця, навіть якщо продажів немає. Приклади вже заповнено: перевірте цифри, <b>вгадайте</b>, скільки треба продати, щоб вийти «в нуль» (${term('Беззбитковість', 'точка беззбитковості')}), і подивіться, чи вгадали.`,
  data: costDefaults,
  onSet: (S, d, p) => { d.ch = (d.ch || 0) + 1; },
  view(S, d) {
    const row = (kind, x, i) => `<div class="xitem"><span>${xin('costs', `${kind}.${i}.t`, d, { max: 40 })}</span><span class="xnw">${xnum('costs', `${kind}.${i}.v`, d, { min: 0, max: 1e7, step: 1, u: '₴' }).replace('<span class="xf-l"></span>', '')}</span>${xb('costs', 'delRow', '', { a: kind, i, ic: 'trash', cls: 'ib', title: 'Прибрати' })}</div>`;
    const add = kind => `<div class="xrow mt">${xb('costs', 'addRow', 'Своя стаття', { a: kind, ic: 'plus', cls: 'sm' })}</div>`;
    return `<div class="xg c2"><div>${box(`Змінні витрати на ${perWord(S)}`, `<div class="xlist">${d.unit.map((x, i) => row('unit', x, i)).join('')}</div>${add('unit')}`, { ic: 'box', side: `разом ${money0(costTotals(d).u)}` })}</div>
      <div>${box('Постійні витрати на місяць', `<div class="xlist">${d.fixed.map((x, i) => row('fixed', x, i)).join('')}</div>${add('fixed')}`, { ic: 'building', side: `разом ${money0(costTotals(d).f)}` })}</div></div>
    ${box('Ціна й обсяг', `<div class="xg c2">${xsl('costs', 'price', d, { min: Math.max(10, Math.round(gamePrice(S) * .3)), max: Math.max(200, Math.round(gamePrice(S) * 3)), step: 10, label: `Ціна за ${perWord(S)}`, u: ' ₴' })}${xsl('costs', 'vol', d, { min: 10, max: 2000, step: 10, label: `Скільки ${noun(S)} на місяць`, u: '' })}</div>`, { ic: 'coins' })}`;
  },
  live(S, d) {
    const t = costTotals(d);
    if (d.guess == null) d.guess = 100;
    if (!d.reveal) {
      return `${box('Вгадайте', `<p class="sm">Скільки ${noun(S)} на місяць треба продати, щоб вийти «в нуль»? Покладіться на інтуїцію: потім побачите справжню відповідь.</p>
        ${xsl('costs', 'guess', d, { min: 0, max: 1000, step: 10, label: 'Ваша здогадка', u: '' })}
        <div class="xrow mt">${xb('costs', 'reveal', 'Перевірити', { cls: 'primary', ic: 'check' })}${xb('costs', 'reveal', 'Показати без здогадки', { cls: 'ghost' })}</div>`, { ic: 'bulb' })}`;
    }
    return costsLive(S, d, t);
  },
  acts: {
    addRow(S, d, el) { d[el.dataset.a].push({ t: 'Нова стаття', v: 0 }); d.ch++; },
    reveal(S, d) { d.reveal = true; },
    delRow(S, d, el) { d[el.dataset.a].splice(+el.dataset.i, 1); d.ch++; },
  },
  ready(S, d) {
    const t = costTotals(d);
    if (d.unit.filter(x => +x.v > 0).length < 3) return { ok: false, msg: 'Потрібно хоча б три змінні статті витрат' };
    if (d.fixed.filter(x => +x.v > 0).length < 2) return { ok: false, msg: 'Потрібно хоча б дві постійні статті' };
    if (t.m <= 0) return { ok: false, msg: 'Підберіть ціну, за якої є прибуток із одиниці' };
    const hit = d.reveal && t.be !== Infinity && Math.abs(d.guess - t.be) <= Math.max(5, t.be * .2);
    return { ok: true, stars: 1 + (t.be < 400 ? 1 : 0) + ((d.ch || 0) >= 6 || hit ? 1 : 0) };
  },
});

/* ═════════ Ціна й прибутковість ═════════ */
// Скільки з 20 відвідувачів купили б за такою ціною: дешевше 0,6 від «еталона» купують усі, дорожче 1,5 — майже ніхто
const demandRef = (S, d, M, u) => (M.find(m => m.k === 'value')?.p) || (M.find(m => m.k === 'comp')?.p) || Math.max(20, r10(u * 2.2));
const buyShare = (p, ref) => clamp(1 - Math.max(0, p / ref - .6) / .9, .03, 1);
const bestPrice = (S, d) => { const M = priceMethods(S, d), u = costTotals(X(S, 'costs')).u, ref = demandRef(S, d, M, u); let best = Math.ceil(u * 1.05 / 10) * 10, bv = -Infinity; for (let p = best; p <= ref * 1.7; p += 10) { const v = buyShare(p, ref) * (p - u); if (v > bv) { bv = v; best = p; } } return best; };
const STANCE = { low: ['Нижче за конкурентів', -.15], mid: ['На рівні', 0], high: ['Вище за конкурентів', .2] };
const priceMethods = (S, d) => {
  const c = X(S, 'costs'), u = costTotals(c).u, comp = S.I.competitors.filter(x => x.price > 0).map(x => x.price), wtp = S.insight(S.s.target).wtp;
  return [
    { k: 'cost', t: 'Витрати + націнка', p: Math.max(10, r10(u * (1 + d.markup / 100))), note: `Собівартість ${money0(u)} × (1 + ${d.markup}%)` },
    { k: 'comp', t: 'Від конкурентів', p: comp.length ? r10(sumOf(comp) / comp.length * (1 + STANCE[d.stance][1])) : null, note: comp.length ? `Середня ціна конкурентів ${money0(sumOf(comp) / comp.length)}, ${STANCE[d.stance][0].toLowerCase()}` : 'У вашій ніші немає конкурентів із відомою ціною' },
    { k: 'value', t: 'Від цінності для клієнта', p: wtp ? r10(wtp * d.share / 100) : null, note: wtp ? `Клієнти кажуть, що витрачають ≈ ${money0(wtp)}; беремо ${d.share}%` : 'Потрібні інтерв’ю з клієнтами: спитайте, скільки вони витрачають зараз' },
  ];
};
reg({
  id: 'price', stage: 3, t: 'Ціна й прибутковість', d: 'Порахуйте ціну трьома способами й оберіть свою.', icon: 'tag', min: 15,
  intro: `Ціна — це баланс: не надто дешево, щоб заробляти, і не надто дорого, щоб клієнти не пішли. Порахуйте три способи, оберіть ціну повзунком і подивіться, <b>скільки з 20 відвідувачів купили б</b>.`,
  data: S => ({ markup: 80, stance: 'mid', share: 85, final: r10(gamePrice(S)), pick: '', why: '', applied: false, ch: 0 }),
  onSet: (S, d) => { d.ch = (d.ch || 0) + 1; },
  view(S, d) {
    const M = priceMethods(S, d), u = costTotals(X(S, 'costs')).u;
    const card = m => `<article class="pmeth"><h4>${m.t}</h4><b class="pbig">${m.p ? money0(m.p) : '—'}</b><small>${esc(m.note)}</small>${m.p ? `<small>Прибуток із одиниці: <b class="${m.p > u ? 'pos' : 'neg'}">${money0(m.p - u)}</b></small>` : ''}
      ${m.k === 'cost' ? xsl('price', 'markup', d, { min: 10, max: 300, step: 10, label: 'Націнка', u: '%' }) : m.k === 'comp' ? `<div class="xrow">${Object.entries(STANCE).map(([k, s]) => xp('price', 'stance', k, s[0], d.stance === k)).join('')}</div>` : xsl('price', 'share', d, { min: 50, max: 110, step: 5, label: 'Частка від того, що витрачають', u: '%' })}${xp('price', 'pick', m.k, d.pick === m.k ? 'Рахую за цим способом' : 'Взяти за основу', d.pick === m.k, { cls: 'card' })}</article>`;
    return `<div class="xg c3">${M.map(card).join('')}</div>`;
  },
  live(S, d) {
    const M = priceMethods(S, d).filter(m => m.p), c = X(S, 'costs'), t = costTotals(c), u = t.u, f = d.final, m = f - u, be = m > 0 ? Math.ceil(t.f / m) : Infinity, mn = Math.min(...M.map(x => x.p), f), mx = Math.max(...M.map(x => x.p), f), span = Math.max(1, mx - mn);
    return `${box('Ваша ціна', `${xsl('price', 'final', d, { min: Math.max(10, Math.round(u * 1.01)), max: Math.max(400, Math.round(Math.max(mx, f) * 1.6)), step: 10, label: `Ціна за ${perWord(S)}`, u: ' ₴' })}
      <div class="pline" aria-hidden="true">${M.map(x => `<i style="left:${(x.p - mn) / span * 90 + 5}%" title="${x.t}"><b>${x.k === 'cost' ? 'Витрати' : x.k === 'comp' ? 'Конкуренти' : 'Цінність'}</b></i>`).join('')}<em style="left:${(f - mn) / span * 90 + 5}%">ваша</em></div>
      <div class="kpis3"><div><small>Прибуток із одиниці</small><b class="${m > 0 ? 'pos' : 'neg'}">${money0(m)}</b></div><div><small>Націнка</small><b>${u ? pc(m / u) : '—'}</b></div><div><small>Беззбитковість</small><b>${be === Infinity ? 'недосяжна' : `${be.toLocaleString('uk-UA')} ${noun(S)}`}</b></div></div>
      ${(() => { const ref = demandRef(S, d, priceMethods(S, d), u), n = Math.round(20 * buyShare(f, ref)), bp = bestPrice(S, d), near = Math.abs(f - bp) / bp <= .15; return `<div class="ppl-h"><b>Хто купив би за ${money0(f)}</b><span>${n} з 20 відвідувачів</span></div><div class="ppl" role="img" aria-label="${n} з 20 відвідувачів купили б">${Array.from({ length: 20 }, (_, i) => `<i class="${i < n ? 'on' : ''}">${icon('user', 18)}</i>`).join('')}</div><p class="sm muted">Прибуток на 20 відвідувачів: <b class="${n * m > 0 ? 'pos' : 'neg'}">${money0(n * m)}</b></p>${tip(near ? 'Ви в найвигіднішій зоні: ціна й кількість покупців дають максимум прибутку.' : f < bp ? 'Клієнти купили б і дорожче: на цій ціні ви лишаєте гроші на столі.' : 'Ціна надто висока: частина клієнтів іде до конкурентів, і прибуток падає.', near ? 'ok' : '')}`; })()}
      ${xin('price', 'why', d, { label: 'Чому ви обрали саме таку ціну?', area: true, rows: 2, max: 240, ph: 'Ціна така, тому що…', cls: 'mt' })}
      <div class="xrow mt">${xb('price', 'apply', d.applied && S.s.price[S.s.target] === d.final ? 'Ціну застосовано в грі' : 'Застосувати ціну в грі', { cls: 'primary', ic: 'check', dis: S.s.price[S.s.target] === d.final })}<small class="muted">Змінить ціну для сегмента «${esc(S.seg().short)}» у розділі «Ціна».</small></div>`, { ic: 'coins' })}`;
  },
  acts: { apply(S, d, el, C) { S.s.price[S.s.target] = d.final; d.applied = true; C.toast(`Ціну в грі змінено: ${money0(d.final)}`, 'good'); } },
  ready(S, d) {
    const u = costTotals(X(S, 'costs')).u;
    if (!d.pick) return { ok: false, msg: 'Оберіть спосіб, за яким рахуєте основну ціну' };
    if (!priceMethods(S, d).find(m => m.k === d.pick)?.p) return { ok: false, msg: 'За цим способом ще немає даних: оберіть інший або проведіть інтерв’ю' };
    if (d.final <= u) return { ok: false, msg: 'Ціна нижча за собівартість: прибутку не буде' };
    if (len(d.why) < 20) return { ok: false, msg: 'Поясніть свій вибір ціни' };
    const bp = bestPrice(S, d), near = Math.abs(d.final - bp) / bp <= .15;
    return { ok: true, stars: 1 + ((d.final - u) / d.final >= .3 ? 1 : 0) + (d.applied || near ? 1 : 0) };
  },
});

/* ═════════ Фінансовий план ═════════ */
const SCEN = { pess: ['Песимістичний', .5, 1.15, '#ef4444'], real: ['Реалістичний', 1, 1, '#6366f1'], opt: ['Оптимістичний', 1.6, .95, '#16a34a'] };
function plan(d, k) {
  const [, nm, cm] = SCEN[k]; let c = +d.start, cash = +d.cash0, minCash = cash, minM = 0, be = null; const cashes = [], rows = [];
  for (let m = 1; m <= 12; m++) {
    const add = d.newm * nm * Math.pow(1 + d.growth / 100, m - 1); c = c * (1 - d.churn / 100) + add;
    const rev = c * d.price, cost = d.fixed * cm + d.unit * c * cm; cash += rev - cost; cashes.push(Math.round(cash)); rows.push({ m, c, rev, cost, cash });
    if (rev - cost > 0 && be == null) be = m; if (cash < minCash) { minCash = cash; minM = m; }
  }
  return { cashes, rows, be, minCash, minM, end: cash, need: Math.max(0, -minCash) };
}
reg({
  id: 'finplan', stage: 3, t: 'Фінансовий план', d: 'Складіть план грошей на 12 місяців у трьох сценаріях.', icon: 'chart', min: 15,
  intro: `${term('Фінансовий план', 'Фінансовий план')} відповідає на одне питання: чи вистачить грошей на рік? Задайте три головні числа: скільки нових клієнтів, як швидко їх більшає й скільки йде. Побачите три сценарії: поганий, звичайний і гарний. Решту налаштувань можна не чіпати.`,
  data: S => { const c = X(S, 'costs'), t = costTotals(c); return { start: Math.round(S.paidUsers()), newm: 15, growth: 8, churn: 6, price: c.price, unit: t.u, fixed: t.f, cash0: Math.round(S.s.cash), scen: 'real', action: '', ch: 0 }; },
  onSet: (S, d) => { d.ch = (d.ch || 0) + 1; },
  view(S, d) {
    return `${box('Припущення', `<div class="xg c2">${xsl('finplan', 'newm', d, { min: 0, max: 300, step: 5, label: `Нових ${noun(S)} за перший місяць`, u: '' })}${xsl('finplan', 'growth', d, { min: 0, max: 30, step: 1, label: 'Зростання нових клієнтів щомісяця', u: '%' })}${xsl('finplan', 'churn', d, { min: 0, max: 30, step: 1, label: 'Скільки клієнтів іде щомісяця', u: '%' })}</div><details class="nadj mt"><summary>${icon('wrench', 14)} Додатково: ціна, витрати, стартові гроші</summary><div class="xg c2 mt">${xsl('finplan', 'price', d, { min: 10, max: Math.max(500, Math.round(d.price * 3)), step: 10, label: `Ціна за ${perWord(S)}`, u: ' ₴' })}${xnum('finplan', 'unit', d, { min: 0, label: `Змінні витрати на ${perWord(S)}`, u: '₴' })}${xnum('finplan', 'fixed', d, { min: 0, label: 'Постійні витрати на місяць', u: '₴' })}${xnum('finplan', 'cash0', d, { min: 0, label: 'Гроші на старті', u: '₴' })}${xnum('finplan', 'start', d, { min: 0, label: 'Клієнтів на старті', u: '' })}</div></details><p class="sm muted">Витрати й ціну можна підтягнути з вправи про собівартість. Сценарії відрізняються темпом зростання й рівнем витрат.</p>`, { ic: 'wrench' })}`;
  },
  live(S, d) {
    const P = Object.fromEntries(Object.keys(SCEN).map(k => [k, plan(d, k)])), cur = P[d.scen], labels = Array.from({ length: 12 }, (_, i) => String(i + 1));
    return `${box('Гроші на рахунку за 12 місяців', wideChart(Object.entries(SCEN).map(([k, s]) => ({ v: P[k].cashes, color: s[3], label: s[0], dash: k !== d.scen })), { labels, fmt: x => (x / 1000).toFixed(0) + ' тис.' }), { ic: 'trend' })}
    ${box('За яким сценарієм плануєте?', `<div class="xrow">${Object.entries(SCEN).map(([k, s]) => xp('finplan', 'scen', k, s[0], d.scen === k, { sub: P[k].minCash < 0 ? `не вистачить ${money0(P[k].need)}` : `мінімум ${money0(P[k].minCash)}` })).join('')}</div>
      <div class="kpis3 mt"><div><small>Вихід у прибуток</small><b>${cur.be ? `${cur.be}-й місяць` : 'не в цьому році'}</b></div><div><small>Найменше грошей</small><b class="${cur.minCash < 0 ? 'neg' : ''}">${money0(cur.minCash)} (міс. ${cur.minM || 1})</b></div><div><small>Через 12 місяців</small><b class="${cur.end < 0 ? 'neg' : 'pos'}">${money0(cur.end)}</b></div></div>
      ${cur.need > 0 ? tip(`У цьому сценарії гроші закінчаться на ${cur.minM}-му місяці. Щоб дожити, потрібно додатково ≈ ${money0(Math.ceil(cur.need / 10000) * 10000)}. Це число знадобиться у вправі про джерела фінансування.`, 'bad') : tip('Грошей вистачає на весь рік. Перевірте й песимістичний сценарій: чи вистачить там?', 'ok')}
      ${xin('finplan', 'action', d, { label: 'Що ви зробите, якщо гроші почнуть закінчуватися?', area: true, rows: 2, max: 240, ph: 'Скорочу…, залучу…, підніму ціну…', cls: 'mt' })}
      <details class="nadj" style="margin-top:10px"><summary>${icon('plan', 14)} Таблиця за місяцями (${SCEN[d.scen][0].toLowerCase()})</summary><div class="xscroll"><table class="xtable"><thead><tr><th>Міс.</th><th class="num">Клієнти</th><th class="num">Виручка</th><th class="num">Витрати</th><th class="num">Гроші</th></tr></thead><tbody>${cur.rows.map(r => `<tr><td>${r.m}</td><td class="num">${Math.round(r.c)}</td><td class="num">${money0(r.rev)}</td><td class="num">${money0(r.cost)}</td><td class="num ${r.cash < 0 ? 'neg' : ''}">${money0(r.cash)}</td></tr>`).join('')}</tbody></table></div></details>`, { ic: 'flag' })}`;
  },
  ready(S, d) {
    if ((d.ch || 0) < 3) return { ok: false, msg: 'Змініть хоча б три припущення, щоб побачити, як вони впливають' };
    if (len(d.action) < 20) return { ok: false, msg: 'Напишіть, що зробите, коли гроші почнуть закінчуватися' };
    const p = plan(d, 'pess');
    return { ok: true, stars: 1 + (p.minCash >= 0 ? 1 : 0) + (len(d.action) >= 70 ? 1 : 0) };
  },
  finish(S, d) { d.needNow = plan(d, d.scen).need; },
});

/* ═════════ Асортимент ═════════ */
const assortDefaults = S => { const p = gamePrice(S), u = costTotals(X(S, 'costs')).u; return { items: [{ t: 'Базовий', price: r10(p * .6) || 10, cost: Math.round(u * .8), share: 50 }, { t: 'Стандарт', price: r10(p) || 10, cost: Math.round(u), share: 35 }, { t: 'Преміум', price: r10(p * 1.8) || 10, cost: Math.round(u * 1.3), share: 15 }], why: '' }; };
const assortCalc = d => { const tot = sumOf(d.items.map(x => +x.share || 0)) || 1, rows = d.items.map(x => ({ ...x, w: (+x.share || 0) / tot, margin: x.price - x.cost, mp: x.price ? (x.price - x.cost) / x.price : 0 })); return { rows, avgP: sumOf(rows.map(x => x.w * x.price)), avgM: sumOf(rows.map(x => x.w * x.margin)), tot }; };
reg({
  id: 'assort', stage: 3, t: 'Асортимент', d: 'Складіть лінійку з трьох і більше варіантів і перевірте прибуток.', icon: 'cube', min: 12,
  intro: `${term('Асортимент', 'Асортимент')} — це вибір для клієнта. Правило «добре — краще — найкраще»: простий варіант привертає, середній продається найчастіше, преміум робить середній вигіднішим. Підберіть ціни й частки, а собівартість порахується сама.`,
  data: assortDefaults,
  view(S, d) {
    const C = assortCalc(d);
    return `${box('Ваші варіанти', `<div class="xlist">${d.items.map((x, i) => `<div class="xitem asr"><div class="xg c4">${xin('assort', `items.${i}.t`, d, { label: 'Назва', max: 30 })}${xnum('assort', `items.${i}.price`, d, { min: 0, label: 'Ціна', u: '₴' })}<div class="xf"><span class="xf-l">Собівартість</span><b class="xro">${money0(+x.cost || 0)}</b></div>${xsl('assort', `items.${i}.share`, d, { min: 0, max: 100, step: 5, label: 'Частка продажів', u: '%' })}</div>${d.items.length > 2 ? xb('assort', 'del', '', { p: 'items', i, ic: 'trash', cls: 'ib', title: 'Прибрати' }) : ''}</div>`).join('')}</div>
      ${d.items.length < 6 ? xb('assort', 'addItem', 'Додати варіант', { ic: 'plus', cls: 'mt' }) : ''}`, { ic: 'box' })}`;
  },
  live(S, d) {
    const C = assortCalc(d), best = [...C.rows].sort((a, b) => b.w * b.margin - a.w * a.margin)[0], hit = [...C.rows].sort((a, b) => b.w - a.w)[0], asc = d.items.every((x, i) => !i || x.price > d.items[i - 1].price), gaps = d.items.slice(1).every((x, i) => x.price >= d.items[i].price * 1.2);
    return `${box('Що це дає', `<div class="kpis3"><div><small>Середня ціна продажу</small><b>${money0(C.avgP)}</b></div><div><small>Середній прибуток із продажу</small><b class="${C.avgM > 0 ? 'pos' : 'neg'}">${money0(C.avgM)}</b></div><div><small>Хіт продажів</small><b>${esc(hit?.t || '—')}</b></div></div>
      ${C.rows.map(x => `<div class="cmp"><span>${esc(x.t || '…')}</span>${bar(best ? Math.max(0, x.w * x.margin) / Math.max(1, best.w * best.margin) : 0, { color: x === best ? 'var(--ok)' : 'var(--acc)', label: x.t })}<b>${money0(x.w * x.margin)}</b></div>`).join('')}
      <p class="sm muted">Праворуч — внесок кожного варіанта в середній прибуток із одного продажу.</p>
      ${checks([[d.items.length >= 3, 'Є хоча б три варіанти'], [asc, 'Ціни зростають від простого до дорогого'], [gaps, 'Різниця між варіантами помітна (від 20%)', 'Якщо ціни надто близькі, клієнту важко обирати'], [C.rows.every(x => x.margin > 0), 'Кожен варіант приносить прибуток', 'Є варіант, який продається в мінус']])}
      ${xin('assort', 'why', d, { label: 'Який варіант ви хочете продавати найчастіше й чому?', area: true, rows: 2, max: 240, cls: 'mt', ph: 'Основним хочу зробити…, бо…' })}`, { ic: 'chart' })}`;
  },
  acts: { addItem(S, d) { const last = d.items.at(-1); d.items.push({ t: 'Новий варіант', price: Math.round((last?.price || 100) * 1.3), cost: Math.round((last?.cost || 50) * 1.15), share: 10 }); } },
  ready(S, d) {
    const C = assortCalc(d);
    if (d.items.length < 3 || d.items.some(x => len(x.t) < 2)) return { ok: false, msg: 'Потрібно хоча б три варіанти з назвами' };
    if (!d.items.every((x, i) => !i || x.price > d.items[i - 1].price)) return { ok: false, msg: 'Розставте ціни за зростанням' };
    if (C.rows.some(x => x.margin <= 0)) return { ok: false, msg: 'Кожен варіант має приносити прибуток' };
    if (len(d.why) < 20) return { ok: false, msg: 'Поясніть, який варіант хочете продавати найбільше' };
    return { ok: true, stars: 1 + (d.items.slice(1).every((x, i) => x.price >= d.items[i].price * 1.2) ? 1 : 0) + (C.avgM > 0 && C.rows.every(x => x.mp >= .25) ? 1 : 0) };
  },
});
