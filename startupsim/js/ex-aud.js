// Симулятор стартапу · вправи етапу 2: сегменти клієнтів (5W), маркетингова стратегія, SMART-ціль. Покроково, з прикладами.
import { CHANNELS } from './data.js';
import { esc, term } from './ui.js';
import { icon } from './icons.js';
import { reg, xb, xp, xin, xsl, tip, box, checks, bar, hash, clamp, sumOf, money0, goalMetrics } from './ex-core.js';

const len = s => String(s || '').trim().length;
const eg = t => `<p class="ex-eg"><b>Приклад.</b> ${t}</p>`;
const step = (n, t) => `<span class="ex-n">${n}</span>${t}`;
const chips = (id, p, opts, cur, o = {}) => opts.map(v => xp(id, p, v, esc(v), cur === v, o)).join('');
const dots = (id, p, cur, label) => `<span class="rdots" role="radiogroup" aria-label="${esc(label)}">${[1, 2, 3, 4, 5].map(v => `<button type="button" class="rdot ${v <= cur ? 'on' : ''}" role="radio" aria-checked="${v === cur}" aria-label="${v} з 5" data-act="ex" data-ex="${id}" data-do="set" data-p="${p}" data-v="${v}" data-t="n"></button>`).join('')}</span>`;

/* ═════════ Сегменти клієнтів (5W) ═════════ */
const W5 = [
  ['what', 'Що вони купують?', ['Готовий продукт', 'Послугу', 'Підписку', 'Окрему функцію']],
  ['who', 'Хто вирішує купувати?', ['Сам користувач', 'Батьки', 'Керівник', 'Друзі й знайомі']],
  ['why', 'Навіщо їм це?', ['Заощадити час', 'Заощадити гроші', 'Отримати результат', 'Виглядати добре', 'Почуватися спокійно']],
  ['when', 'Коли виникає потреба?', ['Щодня', 'Раз на тиждень', 'Сезонно', 'Коли щось пішло не так']],
  ['where', 'Де вони шукають і купують?', ['В інтернеті', 'У соцмережах', 'У магазині', 'Через знайомих', 'На заходах']],
];
const segScore = s => Math.round(((s.size || 3) * (s.pay || 3) * (s.reach || 3)) / 125 * 100);
const filled = s => W5.filter(([k]) => len(s.a?.[k]) >= 3).length;
const fixW = d => { d.segs ||= []; d.segs.forEach(s => { s.a ||= {}; s.size ||= 3; s.pay ||= 3; s.reach ||= 3; }); d.cur = d.segs.some(s => s.id === d.cur) ? d.cur : d.segs[0]?.id || ''; d.main ||= ''; d.next ||= 1; return d; };
reg({
  id: 'w5', stage: 1, ord: 1, cols: true, t: 'Кому ми продаємо: сегменти', d: 'Опишіть групи клієнтів п’ятьма простими запитаннями й оберіть головну групу.', icon: 'target', min: 20,
  intro: `${term('Сегмент', 'Сегмент')} — це група людей зі схожою потребою. «Усі» — не сегмент: для всіх неможливо придумати зрозумілу рекламу, продукт і ціну. Тому спершу знайдіть 2–3 групи, опишіть кожну п’ятьма запитаннями (метод <b>5W</b>: що, хто, навіщо, коли, де) і оберіть <b>головну</b>, з якої почнете.`,
  data: S => ({ segs: S.segIds.map(k => ({ id: k, link: k, name: S.seg(k).short, a: {}, size: 3, pay: 3, reach: 3 })), main: '', next: 1, cur: '' }),
  view(S, d) {
    fixW(d); const s = d.segs.find(x => x.id === d.cur), i = d.segs.indexOf(s);
    return `${box(step(1, 'Які у вас групи клієнтів?'), `<p class="sub">Це групи, які можуть користуватися вашим продуктом чи платити за нього. Деякі вже додано з гри. Додайте ще одну, якщо хочете.</p>
      <div class="xrow">${d.segs.map(x => `<span class="segc ${x.id === d.cur ? 'on' : ''}">${xp('w5', 'cur', x.id, esc(x.name), x.id === d.cur)}${d.segs.length > 1 ? xb('w5', 'delSeg', '', { i: d.segs.indexOf(x), ic: 'x', cls: 'ib', title: 'Прибрати сегмент' }) : ''}</span>`).join('')}</div>
      ${d.segs.length < 4 ? `<div class="xadd" style="margin-top:12px"><input class="inp" id="w5-new" maxlength="160" placeholder="Ще одна група, наприклад «студенти» чи «вчителі»" aria-label="Нова група">${xb('w5', 'addSeg', 'Додати', { ic: 'plus' })}</div>` : ''}
      ${eg('для «домашки з поясненням»: «школярі» (користуються), «батьки» (платять), «школи» (купують для всього класу).')}`, { ic: 'users' })}
    ${s ? `${box(step(2, `Опишіть групу «${esc(s.name)}»`), `<p class="sub">Відповідайте на п’ять запитань: оберіть варіант або впишіть своє. Не ідеально, головне, щоб ви уявляли цю людину. Для інших груп перемикайтесь угорі.</p>
      ${W5.map(([k, q, opts]) => `<div class="w5r"><b>${q}</b><div class="xrow">${chips('w5', `segs.${i}.a.${k}`, opts, s.a[k])}</div>${xin('w5', `segs.${i}.a.${k}`, d, { ph: 'або своя відповідь…', max: 60 })}</div>`).join('')}`, { ic: 'target', side: `${filled(s)} з 5` })}
    ${box(step(3, 'Наскільки ця група вигідна?'), `<p class="sub">Оцініть від 1 до 5. Це допоможе порівняти групи й обрати найкращу.</p>
      <div class="rrow"><span>Скільки таких людей?<small>1 — мало, 5 — дуже багато</small></span>${dots('w5', `segs.${i}.size`, s.size, 'Скільки таких людей')}</div>
      <div class="rrow"><span>Чи готові платити?<small>1 — навряд чи, 5 — охоче</small></span>${dots('w5', `segs.${i}.pay`, s.pay, 'Чи готові платити')}</div>
      <div class="rrow"><span>Чи легко до них достукатись?<small>1 — дуже важко, 5 — легко</small></span>${dots('w5', `segs.${i}.reach`, s.reach, 'Чи легко достукатись')}</div>`, { ic: 'chart' })}` : ''}
    ${box(step(4, 'Оберіть головну групу'), `<p class="sub">Одна група, для якої ви говоритимете в рекламі й будуватимете продукт першою. Інші нікуди не діваються, просто чекають своєї черги.</p><div class="xrow">${d.segs.map(x => xp('w5', 'main', x.id, esc(x.name), d.main === x.id)).join('')}</div>`, { ic: 'flag' })}`;
  },
  live(S, d) {
    fixW(d); const best = [...d.segs].sort((a, b) => segScore(b) - segScore(a))[0], main = d.segs.find(s => s.id === d.main), a = main?.a || {};
    const portrait = main && filled(main) >= 3 ? `<p class="portr">Це <b>${esc(main.name.toLowerCase())}</b>${a.why ? `, яким важливо <b>${esc(a.why.toLowerCase())}</b>` : ''}. ${a.what ? `Вони купують <b>${esc(a.what.toLowerCase())}</b>` : ''}${a.who ? `, а рішення ухвалює <b>${esc(a.who.toLowerCase())}</b>` : ''}. ${a.when ? `Потреба виникає: <b>${esc(a.when.toLowerCase())}</b>.` : ''} ${a.where ? `Шукають: <b>${esc(a.where.toLowerCase())}</b>.` : ''}</p>` : `<p class="muted">Оберіть головну групу й опишіть її хоча б трьома запитаннями, і тут з’явиться її портрет.</p>`;
    return `${box('Портрет головного клієнта', portrait, { ic: 'user' })}
      ${box('Порівняння груп', `<div class="cmpv">${d.segs.map(s => `<div class="cpr"><span>${esc(s.name)}${s.id === d.main ? ' <span class="xtag ok">головна</span>' : ''}</span><div class="cpb"><i class="${s.id === best.id ? 'me' : 'av'}" style="width:${segScore(s)}%"></i><b>${segScore(s)}%</b></div></div>`).join('')}</div><p class="sm muted">Вигідність = скільки людей × чи платять × чи легко достукатись. Це лише підказка: головну групу обираєте ви.</p>
        ${main?.link ? `<div class="xrow">${xb('w5', 'target', S.s.target === main.link ? 'Ця група вже цільова в грі' : `Зробити «${esc(main.name)}» цільовою в грі`, { cls: 'primary sm', dis: S.s.target === main.link })}</div>` : ''}`, { ic: 'chart' })}
      ${box('Чи все зроблено', checks([[d.segs.length >= 2, 'Є хоча б дві групи клієнтів', 'Додайте ще одну групу'], [d.segs.filter(s => filled(s) >= 4).length >= 2, 'Дві групи описано майже повністю (4 з 5 запитань)', 'Опишіть другу групу'], [!!main, 'Обрано головну групу', 'Крок 4']]), { ic: 'check' })}`;
  },
  acts: {
    addSeg(S, d) { const el = document.getElementById('w5-new'), v = (el?.value || '').trim(); if (!v) { el?.focus(); return false; } const id = 'c' + (d.next++); d.segs.push({ id, link: null, name: v, a: {}, size: 3, pay: 3, reach: 3 }); d.cur = id; },
    delSeg(S, d, el) { const i = +el.dataset.i, s = d.segs[i]; if (d.main === s.id) d.main = ''; d.segs.splice(i, 1); },
    target(S, d, el, C) { const m = d.segs.find(s => s.id === d.main); if (m?.link) { S.s.target = m.link; C?.toast?.(`Цільова група: «${m.name}»`, 'good'); } },
  },
  ready(S, d) {
    fixW(d);
    const ok = d.segs.filter(s => filled(s) >= 4);
    if (ok.length < 2) return { ok: false, msg: 'опишіть щонайменше дві групи: хоча б чотири запитання з п’яти' };
    const m = d.segs.find(s => s.id === d.main);
    if (!m) return { ok: false, msg: 'оберіть головну групу' };
    return { ok: true, stars: 1 + (filled(m) === 5 ? 1 : 0) + (d.segs.length >= 3 ? 1 : 0) };
  },
});

/* ═════════ Маркетингова стратегія ═════════ */
const GOALS = ['Щоб про нас дізналися', 'Перші продажі', 'Більше зареєстрованих користувачів', 'Утримати тих, хто вже є', 'Запуск нової функції'];
const MET = ['Охоплення', 'Переходи на сайт', 'Реєстрації', 'Оплати', 'Відгуки й оцінки', 'Скільки коштує клієнт'];
const MSG = ['Ми допомагаємо [кому] [що зробити] без [болю]', 'Замість [старий спосіб] — [наша вигода] за [час чи гроші]', '[Результат], а не [процес]'];
const ONLINE = new Set(['ads', 'bloggers', 'social', 'seo', 'referral']);
const fitWord = f => f == null ? ['—', ''] : f >= 1.05 ? ['добре підходить', 'ok'] : f >= .6 ? ['так собі', 'warn'] : ['слабко', 'bad'];
const fixS = d => { d.ch ||= []; d.w ||= {}; d.met ||= []; d.goal ||= ''; d.msg ||= ''; d.budget ??= 20000; return d; };
reg({
  id: 'strategy', stage: 1, ord: 2, cols: true, t: 'Маркетингова стратегія', d: 'Складіть план із п’яти кроків: мета, повідомлення, канали, бюджет і показники.', icon: 'megaphone', min: 20,
  intro: `${term('Маркетингова стратегія', 'Стратегія')} — це план, як про вас дізнаються потрібні люди. Вона відповідає на п’ять питань: <b>навіщо</b> ми просуваємося, <b>що</b> кажемо клієнту, <b>де</b> його шукаємо, <b>за які гроші</b> і <b>як зрозуміємо, що працює</b>. Усе поміститься на одному аркуші, який праворуч заповнюється сам.`,
  data: () => ({ goal: '', msg: '', ch: [], budget: 20000, w: {}, met: [] }),
  view(S, d) {
    fixS(d); const g = S.seg(), chs = Object.entries(CHANNELS), wt = sumOf(d.ch.map(k => d.w[k] ?? 50)) || 1;
    return `${box(step(1, 'Навіщо? Яка мета?'), `<p class="sub">Що ви хочете отримати від просування найближчим часом? Оберіть одну мету або сформулюйте свою.</p><div class="xrow">${chips('strategy', 'goal', GOALS, d.goal, { cls: 'card' })}</div>${xin('strategy', 'goal', d, { ph: 'або сформулюйте свою мету', max: 80, cls: 'mt' })}`, { ic: 'flag' })}
    ${box(step(2, 'Що ми кажемо клієнту?'), `<p class="sub">Група клієнтів з гри: <b>${esc(g.t)}</b>. Напишіть одне речення, яке ця людина запам’ятає. Говоріть про її вигоду, а не про вашу технологію.</p>
      <div class="xrow sg"><small class="muted">Шаблони:</small>${MSG.map(t => `<button type="button" class="xchip" data-act="ex" data-ex="strategy" data-do="tpl" data-a="${esc(t)}">${esc(t)}</button>`).join('')}</div>
      ${xin('strategy', 'msg', d, { area: true, rows: 2, max: 160, ph: 'Ми пояснюємо домашку за 5 хвилин, а не за 2 години', cls: 'mt' })}${eg('«Не розумієш домашку? Сфотографуй, і за хвилину отримаєш пояснення крок за кроком».')}`, { ic: 'mic' })}
    ${box(step(3, 'Де ми шукаємо клієнтів?'), `<p class="sub">Оберіть до трьох каналів. Біля кожного написано, наскільки він підходить вашій групі клієнтів.</p><div class="chlist">${chs.map(([k, c]) => { const [w, cl] = fitWord(g.fit?.[k]), on = d.ch.includes(k); return `<div class="chrow ${on ? 'on' : ''}">${xp('strategy', 'ch', k, `${icon(c.icon, 15)} ${esc(c.t)}`, on, { set: 'tog', max: 3, cls: 'card' })}<span class="xtag">${ONLINE.has(k) ? 'онлайн' : 'офлайн'}</span><span class="xtag ${cl}">${w}</span><small>${esc(c.desc)}</small></div>`; }).join('')}</div>`, { ic: 'compass', side: `обрано ${d.ch.length} з 3` })}
    ${box(step(4, 'Скільки грошей на місяць?'), `<p class="sub">Визначте бюджет і розподіліть його між обраними каналами.</p>${xsl('strategy', 'budget', d, { min: 0, max: 100000, step: 1000, label: 'Бюджет на місяць', u: ' ₴' })}
      ${d.ch.length ? `<div class="xlist" style="margin-top:8px">${d.ch.map(k => `<div class="xitem chw"><div class="xrow"><b>${esc(CHANNELS[k].t)}</b><b style="margin-left:auto">${money0(d.budget * (d.w[k] ?? 50) / wt)}</b></div>${xsl('strategy', `w.${k}`, d, { min: 0, max: 100, step: 5, label: 'Частка бюджету', u: '%', v: d.w[k] ?? 50 })}</div>`).join('')}</div>` : '<p class="sm muted">Спершу оберіть канали в кроці 3.</p>'}`, { ic: 'coins' })}
    ${box(step(5, 'Як зрозуміємо, що це працює?'), `<p class="sub">Оберіть показники, за якими стежитимете. Хоча б два.</p><div class="xrow">${MET.map(m => xp('strategy', 'met', m, m, d.met.includes(m), { set: 'tog' })).join('')}</div>`, { ic: 'chart' })}`;
  },
  live(S, d) {
    fixS(d); const g = S.seg(), done = [len(d.goal) >= 4, len(d.msg) >= 15, d.ch.length >= 2, d.budget > 0, d.met.length >= 2];
    return `${box(`Аркуш стратегії · ${esc(S.s.company.name)}`, `<dl class="sheetl"><dt>Мета</dt><dd>${esc(d.goal) || '<i>ще не обрано</i>'}</dd><dt>Кому</dt><dd>${esc(g.t)}</dd><dt>Повідомлення</dt><dd>${d.msg ? `«${esc(d.msg)}»` : '<i>ще не написано</i>'}</dd><dt>Канали</dt><dd>${d.ch.map(k => esc(CHANNELS[k].t)).join(', ') || '<i>не обрано</i>'}</dd><dt>Бюджет</dt><dd>${money0(d.budget)} на місяць</dd><dt>Показники</dt><dd>${d.met.join(', ') || '<i>не обрано</i>'}</dd></dl>`, { ic: 'plan' })}
      ${box('Чи все зроблено', checks([[done[0], 'Є мета', 'Крок 1'], [done[1], 'Є головне повідомлення', 'Напишіть хоча б одне речення'], [done[2], 'Обрано хоча б два канали', 'Крок 3'], [done[3], 'Задано бюджет', 'Крок 4'], [done[4], 'Обрано хоча б два показники', 'Крок 5']]), { ic: 'check' })}`;
  },
  acts: { tpl(S, d, el) { d.msg = el.dataset.a; } },
  ready(S, d) {
    fixS(d);
    if (len(d.goal) < 4) return { ok: false, msg: 'оберіть або напишіть мету' };
    if (len(d.msg) < 15) return { ok: false, msg: 'напишіть головне повідомлення' };
    if (d.ch.length < 2) return { ok: false, msg: 'оберіть хоча б два канали' };
    if (!(d.budget > 0)) return { ok: false, msg: 'задайте бюджет' };
    if (d.met.length < 2) return { ok: false, msg: 'оберіть хоча б два показники' };
    const fit = d.ch.filter(k => (S.seg().fit?.[k] ?? 0) >= 1.05).length;
    return { ok: true, stars: 1 + (len(d.msg) >= 40 ? 1 : 0) + (fit >= 2 ? 1 : 0) };
  },
});

/* ═════════ SMART-ціль ═════════ */
const SM_BASE = { paid: 5, users: 30, mrr: 5000, cash: 0 };
const SL = [['S', 'Конкретна', 'Зрозуміло, що саме потрібно досягти'], ['M', 'Вимірна', 'Є число, яке можна порахувати'], ['A', 'Досяжна', 'Не надто легка й не нереальна'], ['R', 'Важлива', 'Ви знаєте, навіщо вона'], ['T', 'Обмежена в часі', 'Є кінцева дата']];
reg({
  id: 'smart', stage: 1, ord: 3, cols: true, t: 'SMART-ціль', d: 'Поставте ціль, яка проходить усі п’ять перевірок SMART, і складіть кроки до неї.', icon: 'flag', min: 12,
  intro: `${term('SMART', 'SMART')}-ціль — це ціль, яку можна перевірити. Вона <b>конкретна, вимірна, досяжна, важлива й обмежена в часі</b>. «Хочу більше клієнтів» — побажання, а «30 платних клієнтів до тижня 20» — ціль. Складіть її у трьох кроках, а гра стежитиме за прогресом на головній.`,
  data: () => ({ metric: 'paid', target: 30, weeks: 12, why: '', steps: ['', '', ''] }),
  onSet: (S, d, p) => { if (p === 'metric') d.target = goalMetrics()[d.metric].def; },
  view(S, d) {
    d.steps ||= ['', '', '']; d.why ||= '';
    const M = goalMetrics(), cur = M[d.metric].now(S);
    return `${box(step(1, 'Що ми вимірюємо?'), `<p class="sub">Оберіть число, яке покаже, що справи йдуть добре. Під кожним варіантом написано, скільки зараз.</p><div class="xrow">${Object.entries(M).map(([k, m]) => xp('smart', 'metric', k, m.t, d.metric === k, { sub: `зараз: ${m.fmt(m.now(S))}` })).join('')}</div>`, { ic: 'chart' })}
    ${box(step(2, 'Скільки й до коли?'), `<p class="sub">Визначте число й термін. Ціль має бути трохи складнішою за те, що є зараз, але реалістичною.</p><div class="xg c2">${xsl('smart', 'target', d, { min: M[d.metric].min, max: M[d.metric].max, step: M[d.metric].step, label: 'Цільове значення', u: M[d.metric].u })}${xsl('smart', 'weeks', d, { min: 4, max: 40, step: 1, label: 'Скільки тижнів на це', u: ' тиж.' })}</div>
      <p class="sm muted">Зараз: ${M[d.metric].fmt(cur)}.</p>${eg('«Мати 30 платних клієнтів до тижня 20»: є що, скільки й коли.')}`, { ic: 'calendar' })}
    ${box(step(3, 'Навіщо і як досягнете?'), `<p class="sub">Поясніть, чому ціль важлива, і назвіть три кроки.</p>${xin('smart', 'why', d, { label: 'Чому ця ціль важлива саме зараз?', area: true, rows: 2, max: 200, ph: 'Ця ціль важлива, бо без перших платних клієнтів ми не доведемо, що продукт потрібен.' })}<div class="xg" style="margin-top:8px">${d.steps.map((_, i) => xin('smart', `steps.${i}`, d, { label: `Крок ${i + 1}`, ph: ['Поговорити з клієнтами', 'Запустити рекламу', 'Додати функцію оплати'][i], max: 120 })).join('')}</div>`, { ic: 'bulb' })}`;
  },
  live(S, d) {
    const q = SM(S, d), M = goalMetrics()[d.metric];
    return `${box('Ваша ціль', `<p class="goalline">${esc(q.text)}</p><p class="sm muted">Зараз: ${M.fmt(M.now(S))}. ${q.note}</p>`, { ic: 'flag' })}
      ${box('Перевірка SMART', `<div class="smt">${SL.map(([l, t, h], i) => `<div class="sm-i ${q.list[i][0] ? 'ok' : ''}"><b>${l}</b><span>${t}<small>${q.list[i][0] ? h : (q.list[i][2] || h)}</small></span>${icon(q.list[i][0] ? 'check' : 'minus', 16)}</div>`).join('')}</div>`, { ic: 'check', cls: q.all ? 'ok' : '' })}`;
  },
  ready(S, d) { const q = SM(S, d); return q.all ? { ok: true, stars: 1 + (q.ratio >= 1.2 && q.ratio <= 3 ? 1 : 0) + ((d.steps || []).filter(len).length >= 3 ? 1 : 0) } : { ok: false, msg: `ціль ще не проходить перевірку: ${q.list.filter(x => !x[0]).length} з 5` }; },
  finish(S, d) { S.s.goal = { metric: d.metric, target: d.target, from: S.s.week, to: S.s.week + d.weeks, text: SM(S, d).text, done: false, left: false }; },
});
function SM(S, d) {
  const M = goalMetrics()[d.metric], now = M.now(S), real = Math.max(now, SM_BASE[d.metric] || 1) * Math.pow(1.07, d.weeks) + (d.metric === 'cash' ? 0 : d.weeks * 3);
  const ratio = d.metric === 'cash' ? d.target / Math.max(1, S.s.cash) : d.target / Math.max(real, 1);
  const text = `${M.goal} ${M.fmt(d.target)} до тижня ${S.s.week + 1 + d.weeks}`;
  const list = [
    [!!d.metric, 'Конкретна: зрозуміло, що саме потрібно досягти'], [d.target > 0 && d.target !== now, 'Вимірна: є число', 'Цільове значення має відрізнятися від поточного'],
    [d.metric === 'cash' ? d.target > S.s.cash * .9 && d.target < S.s.cash * 6 : ratio >= .6 && ratio <= 5, 'Досяжна: не надто легка й не нереальна', ratio < .6 ? 'Занадто легка: підніміть ціль' : 'Завелика для цього терміну: зменште ціль чи збільшіть термін'],
    [len(d.why) >= 20, 'Важлива: ви можете пояснити, навіщо вона', 'Напишіть хоча б одне речення про причину'], [d.weeks >= 4 && d.weeks <= 40, 'Обмежена в часі: є кінцева дата'],
  ];
  return { text, list, all: list.every(x => x[0]), ratio, note: ratio > 5 ? 'Ціль виглядає надто сміливою для цього терміну.' : ratio < .6 ? 'Ціль виглядає надто легкою.' : 'Ціль виглядає реалістично й трохи амбітно.' };
}
