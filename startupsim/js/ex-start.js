// Симулятор стартапу · вправи етапу 1: «Оцініть нішу» і «Що в першу версію». Покрокові, з простими запитаннями й прикладами.
import { esc, term } from './ui.js';
import { icon } from './icons.js';
import { reg, xb, xp, xin, xsl, tip, box, checks, bar, radar, clamp, sumOf, pc } from './ex-core.js';

const len = s => String(s || '').trim().length;
const eg = t => `<p class="ex-eg"><b>Приклад.</b> ${t}</p>`;
const step = (n, t) => `<span class="ex-n">${n}</span>${t}`;
const dots = (id, p, cur, label) => `<span class="rdots" role="radiogroup" aria-label="${esc(label)}">${[1, 2, 3, 4, 5].map(v => `<button type="button" class="rdot ${v <= cur ? 'on' : ''}" role="radio" aria-checked="${v === cur}" aria-label="${v} з 5" data-act="ex" data-ex="${id}" data-do="set" data-p="${p}" data-v="${v}" data-t="n"></button>`).join('')}</span>`;

/* ═════════ Оцініть нішу ═════════ */
// [ключ, коротка назва, запитання, значення 1, значення 5, як з'ясувати]
const CRIT = [
  ['need', 'Потреба', 'Чи є в людей справжня проблема?', '1 — майже не помічають', '5 — болить дуже', 'Спитайте кількох людей: «Коли востаннє ви з цим стикалися?»'],
  ['size', 'Розмір ринку', 'Скільки людей можуть стати вашими клієнтами?', '1 — зовсім мало', '5 — дуже багато', 'Прикиньте, скільки таких людей у вашому місті чи школі.'],
  ['comp', 'Вільне місце', 'Чи вже багато сильних конкурентів?', '1 — дуже багато', '5 — майже немає', 'Пошукайте в інтернеті, скільки є схожих рішень.'],
  ['skill', 'Ваші сили', 'Чи вмієте ви це робити?', '1 — не вмію', '5 — вмію добре', 'Врахуйте досвід, знайомства, вільний час і команду.'],
  ['money', 'Заробіток', 'Чи готові люди за це платити?', '1 — навряд чи', '5 — так, охоче', 'Подивіться, чи платять за це зараз і скільки.'],
];
const ALTS = [
  { id: 'shoes', t: 'Догляд за взуттям із доставкою', s: { need: 3, size: 3, comp: 3, skill: 2, money: 3 } },
  { id: 'code', t: 'Курси програмування для підлітків', s: { need: 4, size: 4, comp: 2, skill: 3, money: 4 } },
  { id: 'tours', t: 'Екскурсії від місцевих для туристів', s: { need: 3, size: 3, comp: 3, skill: 4, money: 3 } },
  { id: 'pets', t: 'Корисні смаколики для домашніх улюбленців', s: { need: 4, size: 4, comp: 2, skill: 2, money: 4 } },
];
const score = s => sumOf(CRIT.map(([k]) => s[k] || 3)) / 25;
const verdict = sc => sc >= .72 ? ['сильна', 'ok', 'Ніша виглядає перспективною. Перевірте її розмовами з клієнтами.'] : sc >= .52 ? ['середня', '', 'Є над чим подумати: підсильте найслабше місце або оберіть іншу нішу.'] : ['слабка', 'bad', 'Поки що ніша слабка. Подумайте, чи є кращий варіант, або змініть ідею.'];
const fixN = d => { d.me ||= { need: 3, size: 3, comp: 3, skill: 3, money: 3 }; d.alt ||= Object.fromEntries(ALTS.map(a => [a.id, { ...a.s }])); d.own ||= []; d.cmp ||= []; d.touched ||= 0; d.pick ||= 'me'; d.why ||= ''; return d; };
const rowsOf = (S, d) => [{ id: 'me', t: S.I.t, s: d.me, mine: true }, ...ALTS.filter(a => d.cmp.includes(a.id)).map(a => ({ ...a, s: d.alt[a.id] })), ...d.own.map((o, i) => ({ id: 'own' + i, i, t: o.t, s: o.s, own: true }))];
reg({
  id: 'niche', stage: 0, ord: 1, cols: true, t: 'Чи варта ідея того?', d: 'Відповідайте на п’ять простих запитань про свою нішу й порівняйте з іншою ідеєю.', icon: 'compass', min: 12,
  intro: `${term('Ніша', 'Ніша')} — вузька частина ринку, де ви хочете стати найкращим. Перш ніж братися за проєкт, варто чесно відповісти на п’ять запитань: чи є справжня проблема, чи багато клієнтів, чи вільне місце, чи вмієте ви це й чи заплатять люди. «Правильних» цифр немає: головне, щоб ви могли пояснити свою оцінку.`,
  data: () => ({ me: { need: 3, size: 3, comp: 3, skill: 3, money: 3 }, alt: Object.fromEntries(ALTS.map(a => [a.id, { ...a.s }])), own: [], cmp: [], w: [], touched: 0, pick: 'me', why: '' }),
  onSet: (S, d, p) => { if (/^(me|own)\./.test(p)) d.touched = (d.touched || 0) + 1; },
  view(S, d) {
    fixN(d); const rows = rowsOf(S, d);
    return `${box(step(1, 'Ваша ідея'), `<p class="sub">«${esc(S.I.t)}»: ${esc(S.I.pitch)}</p><p class="sm">Нижче п’ять запитань. Для кожного натисніть на кружечок від 1 до 5: що правее, то краще для вашої ідеї. Під запитанням є підказка, як це з’ясувати.</p>`, { ic: 'bulb' })}
    ${box(step(2, 'П’ять запитань про нішу'), CRIT.map(([k, t, q, lo, hi, how]) => `<div class="qrow"><div class="qh"><b>${q}</b><small>${t}</small></div>${dots('niche', `me.${k}`, d.me[k] || 3, q)}<div class="qs"><span>${lo}</span><span>${hi}</span></div><p class="how">Як з’ясувати: ${how}</p></div>`).join('') + eg('для ідеї «домашка з поясненням»: проблема болить школярам на 4 з 5, клієнтів багато (4), але конкурентів теж багато (2).'), { ic: 'target' })}
    ${box(step(3, 'Порівняйте з іншою ідеєю'), `<p class="sub">Це необов’язково, але допомагає зрозуміти, чи ваша ніша найкраща. Додайте готову ідею для порівняння або свою.</p><div class="xrow">${ALTS.map(a => xp('niche', 'cmp', a.id, esc(a.t), d.cmp.includes(a.id), { set: 'tog', max: 3 })).join('')}</div>
      ${d.own.map((o, i) => `<div class="ownn"><div class="plh"><b>${esc(o.t)}</b>${xb('niche', 'delOwn', '', { i, ic: 'trash', cls: 'ib', title: 'Прибрати' })}</div>${CRIT.map(([k, t, q]) => `<div class="rrow"><span>${t}</span>${dots('niche', `own.${i}.s.${k}`, o.s[k] || 3, `${o.t}: ${t}`)}</div>`).join('')}</div>`).join('')}
      ${d.own.length < 2 ? `<div class="xadd" style="margin-top:12px"><input class="inp" id="niche-new" maxlength="240" placeholder="Своя ідея для порівняння, наприклад «майстер-класи з кераміки»" aria-label="Своя ідея">${xb('niche', 'addOwn', 'Додати', { ic: 'plus' })}</div>` : ''}`, { ic: 'chart' })}
    ${box(step(4, 'Ваш вибір'), `<p class="sub">Яку ідею ви берете в роботу? Вона може відрізнятися від тієї, де оцінка вища: цифри лише допомагають.</p><div class="xrow">${rows.map(r => xp('niche', 'pick', r.id, esc(r.t), d.pick === r.id)).join('')}</div>${xin('niche', 'why', d, { label: 'Чому саме ця?', area: true, rows: 3, max: 300, ph: 'Я обираю її, тому що проблема справді болить і я вмію це робити.', hint: 'Назвіть хоча б дві причини.', cls: 'mt' })}`, { ic: 'check' })}`;
  },
  live(S, d) {
    fixN(d); const rows = rowsOf(S, d).map(r => ({ ...r, sc: score(r.s) })), me = rows[0], v = verdict(me.sc), vals = CRIT.map(([k]) => d.me[k] || 3);
    const weak = CRIT.reduce((m, c) => (d.me[c[0]] || 3) < (d.me[m[0]] || 3) ? c : m, CRIT[0]);
    return `${box('Ваша оцінка', `<div class="xc">${radar(vals, ['Потреба', 'Ринок', 'Вільне місце', 'Ваші сили', 'Гроші'])}<b class="big-n">${pc(me.sc)}</b><small>ніша ${v[0]}</small></div>${tip(v[2], v[1])}${(d.me[weak[0]] || 3) <= 2 ? `<p class="sm muted">Найслабше місце: <b>${weak[1].toLowerCase()}</b>. ${weak[5]}</p>` : ''}`, { ic: 'target' })}
      ${rows.length > 1 ? box('Порівняння', `<div class="cmpv">${rows.map(r => `<div class="cpr"><span>${esc(r.t)}${r.mine ? ' <span class="xtag">ваша</span>' : ''}</span><div class="cpb"><i class="${r.mine ? 'me' : 'av'}" style="width:${r.sc * 100}%"></i><b>${Math.round(r.sc * 100)}%</b></div></div>`).join('')}</div>`, { ic: 'chart' }) : ''}
      ${box('Чи все зроблено', checks([[(d.touched || 0) >= 3, 'Відповіли на запитання (змінили хоча б три оцінки)', 'Натискайте на кружечки в кроці 2'], [len(d.why) >= 25, 'Пояснили свій вибір', 'Напишіть хоча б одне речення'], [d.cmp.length + d.own.length >= 1, 'Порівняли з іншою ідеєю (необов’язково)']]), { ic: 'check' })}`;
  },
  acts: {
    addOwn(S, d) { const el = document.getElementById('niche-new'), v = (el?.value || '').trim(); if (!v) { el?.focus(); return false; } d.own.push({ t: v, s: { need: 3, size: 3, comp: 3, skill: 3, money: 3 } }); },
    delOwn(S, d, el) { const i = +el.dataset.i; d.own.splice(i, 1); if (d.pick === 'own' + i) d.pick = 'me'; },
  },
  ready(S, d) {
    fixN(d);
    if ((d.touched || 0) < 3) return { ok: false, msg: 'відповідайте на запитання: змініть хоча б три оцінки' };
    if (len(d.why) < 25) return { ok: false, msg: 'поясніть свій вибір хоча б одним реченням' };
    return { ok: true, stars: 1 + (d.cmp.length + d.own.length ? 1 : 0) + (len(d.why) >= 90 ? 1 : 0), pick: rowsOf(S, d).find(r => r.id === d.pick)?.t };
  },
  finish(S, d) { fixN(d); d.pickName = rowsOf(S, d).find(r => r.id === d.pick)?.t || ''; },
});

/* ═════════ Що в першу версію ═════════ */
const work = c => c <= 6 ? [1, 'невелика'] : c <= 12 ? [2, 'середня'] : [3, 'велика'];
reg({
  id: 'mvp', stage: 0, ord: 4, cols: true, t: 'Що в першу версію', d: 'Оберіть найважливіші функції для першої версії й поставте їх у розробку.', icon: 'box', min: 15,
  intro: `${term('MVP', 'Перша версія (MVP)')} — це найпростіше, що вже можна дати людям, щоб перевірити ідею. Вона не має бути ідеальною: у неї входить лише те, без чого продукт не працює. Усе інше чекає на потім. Оберіть функції для першої версії й подивіться, чи вистачить на них роботи.`,
  data: () => ({ cls: {}, budget: 30, applied: false }),
  view(S, d) {
    const feats = Object.entries(S.I.features), K = S.insight(S.s.target), asked = new Map(K.feats);
    d.cls ||= {}; d.budget ||= 30;
    const inV = id => d.cls[id] === 'must';
    const card = ([id, f]) => { const [w, wt] = work(f.cost); return `<article class="feat2 ${inV(id) ? 'in' : ''}"><div class="fh"><b>${esc(f.t)}</b>${f.core ? '<span class="xtag ok">головна</span>' : ''}${f.pay ? '<span class="xtag warn">для оплат</span>' : ''}${asked.get(id) ? '<span class="xtag ok" title="Клієнти просили це в інтерв’ю">просили клієнти</span>' : ''}${S.has(id) ? '<span class="xtag">вже готово</span>' : ''}</div><p>${esc(f.desc)}</p>
      <div class="fw"><span class="wk" aria-label="Обсяг роботи: ${wt}">Робота: ${[1, 2, 3].map(i => `<i class="${i <= w ? 'on' : ''}"></i>`).join('')} ${wt}</span>${xp('mvp', `cls.${id}`, inV(id) ? 'could' : 'must', inV(id) ? 'У першій версії' : 'Взяти в першу версію', inV(id), { cls: 'tgl' })}</div></article>`; };
    return `${box(step(1, 'Що найважливіше для клієнта?'), `<p class="sub">Подумайте: без чого людина не отримає користі, заради якої прийшла? Це головна функція. Додайте ще лише те, що справді потрібне першим клієнтам.</p>
      <div class="xrow" style="margin-bottom:10px">${xb('mvp', 'suggest', 'Підказати: головне й оплата', { ic: 'bulb', cls: 'sm' })}<small class="muted">Позначить головну функцію та функцію для оплат.</small></div>
      <div class="feats2">${feats.map(card).join('')}</div>${eg('для «домашки з поясненням» у першу версію входять: «Фото умови → розв’язок» (головна) і «Оплата в застосунку»; а «Серії днів і нагороди» чекають на потім.')}`, { ic: 'cube', side: `обрано ${feats.filter(([id]) => inV(id)).length} з ${feats.length}` })}
    ${box(step(2, 'Скільки роботи готові вкласти?'), `<p class="sub">Кожна функція потребує роботи (у грі це «бали»). Чим більше функцій, тим довше розробка. Оберіть, скільки балів готові вкласти в першу версію.</p>${xsl('mvp', 'budget', d, { min: 10, max: 80, step: 1, label: 'Обсяг роботи для першої версії', u: ' балів' })}`, { ic: 'wrench' })}
    ${box(step(3, 'Поставте в розробку'), `<p class="sub">Коли перший список готовий, натисніть кнопку: ці функції з’являться в розділі «Продукт» → «У роботі».</p><div class="xrow">${xb('mvp', 'apply', d.applied ? 'Оновити чергу розробки' : 'Поставити в розробку', { cls: 'primary', ic: 'rocket', dis: !feats.some(([id]) => inV(id)) })}</div>`, { ic: 'rocket' })}`;
  },
  live(S, d) {
    const feats = Object.entries(S.I.features), must = feats.filter(([id]) => d.cls?.[id] === 'must'), cost = sumOf(must.map(([, f]) => f.cost)), over = cost > d.budget;
    const hasPay = must.some(([, f]) => f.pay), hasCore = must.some(([, f]) => f.core);
    return `${box('Перша версія', `<div class="mvpbar"><div class="x-bar"><i style="width:${clamp(cost / Math.max(d.budget, 1), 0, 1) * 100}%;background:${over ? '#d33' : 'var(--ok)'}"></i></div><b>${cost} з ${d.budget}</b></div>
      ${must.length ? `<ul class="mvpl">${must.map(([, f]) => `<li>${icon('check', 14)} ${esc(f.t)}</li>`).join('')}</ul>` : '<p class="muted">Поки що порожньо. Оберіть функції ліворуч.</p>'}
      ${over ? tip('Роботи більше, ніж ви готові вкласти. Приберіть щось або збільште обсяг роботи.', 'bad') : must.length ? tip('Обсяг вміщується. Для першої версії це добре.', 'ok') : ''}`, { ic: 'flag' })}
      ${box('Чи все зроблено', checks([[must.length > 0, 'Є хоча б одна функція в першій версії', 'Натисніть «Взяти в першу версію»'], [hasCore, 'Є головна функція: те, заради чого продукт беруть', 'Додайте функцію з позначкою «головна»'], [hasPay, 'Є оплата: інакше гроші не надходитимуть', 'Додайте функцію з позначкою «для оплат»'], [!over && must.length > 0, 'Усе вміщується в обсяг роботи', 'Приберіть щось або збільште обсяг'], [d.applied || S.s.product.queue.length > 0 || S.s.product.built.length > 0, 'Функції поставлено в розробку', 'Натисніть «Поставити в розробку»']]), { ic: 'check' })}`;
  },
  acts: {
    suggest(S, d) { Object.entries(S.I.features).forEach(([id, f]) => { if (f.core || f.pay) d.cls[id] = 'must'; }); },
    apply(S, d, el, C) { const ids = Object.entries(d.cls).filter(([, v]) => v === 'must').map(([id]) => id); ids.forEach(id => S.queue(id)); d.applied = true; C?.toast?.(`У розробку поставлено функцій: ${ids.length}`, 'good'); },
  },
  ready(S, d) {
    const feats = Object.keys(S.I.features), must = feats.filter(id => d.cls?.[id] === 'must');
    if (!must.length) return { ok: false, msg: 'оберіть хоча б одну функцію для першої версії' };
    if (!d.applied && !S.s.product.queue.length && !S.s.product.built.length) return { ok: false, msg: 'поставте обрані функції в розробку' };
    const cost = sumOf(must.map(id => S.I.features[id].cost));
    return { ok: true, stars: 1 + (cost <= d.budget ? 1 : 0) + (must.some(id => S.I.features[id].core) && must.some(id => S.I.features[id].pay) ? 1 : 0) };
  },
});
