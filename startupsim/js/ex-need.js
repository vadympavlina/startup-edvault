// Симулятор стартапу · вправи етапу 1: «Конкуренти» і «Що болить клієнтам». Обидві покрокові, з прикладами й підказками.
import { esc, term } from './ui.js';
import { icon } from './icons.js';
import { reg, xb, xp, xin, tip, box, checks, bar, hash, clamp, sumOf } from './ex-core.js';

const len = s => String(s || '').trim().length;
const eg = t => `<p class="ex-eg"><b>Приклад.</b> ${t}</p>`;
const step = (n, t) => `<span class="ex-n">${n}</span>${t}`;
// оцінка від 1 до 5: п'ять кружечків
const dots = (id, p, cur, label) => `<span class="rdots" role="radiogroup" aria-label="${esc(label)}">${[1, 2, 3, 4, 5].map(v => `<button type="button" class="rdot ${v <= cur ? 'on' : ''}" role="radio" aria-checked="${v === cur}" aria-label="${v} з 5" data-act="ex" data-ex="${id}" data-do="set" data-p="${p}" data-v="${v}" data-t="n"></button>`).join('')}</span>`;

/* ═════════ Конкуренти ═════════ */
const CR = [['price', 'Ціна для клієнта', '5 — дуже дешево', 'дешевші'], ['ease', 'Зручність', '5 — дуже зручно', 'зручніші'], ['speed', 'Швидкість', '5 — одразу', 'швидші'], ['quality', 'Якість', '5 — дуже якісно', 'якісніші'], ['care', 'Увага до клієнта', '5 — слухають і допомагають', 'уважніші до клієнта']];
const TYPES = [['direct', 'Схожий продукт'], ['sub', 'Інший спосіб'], ['self', 'Роблять самі']];
const SUBS = ['Роблять самі', 'Питають друзів чи рідних', 'Безкоштовні сайти й групи', 'Платять фахівцеві'];
// старі збереження мали іншу будову даних (карта позиціонування, карта емпатії): доповнюємо їх без втрат
const fixM = d => { d.comps ||= []; d.comps.forEach(c => { c.r ||= Object.fromEntries(CR.map(([k]) => [k, 3])); c.type ||= 'sub'; c.plus ||= ''; c.minus ||= ''; }); d.me ||= {}; d.me.r ||= Object.fromEntries(CR.map(([k]) => [k, 3])); d.why ||= ''; d.t ||= 0; return d; };
const avgOf = (d, k) => d.comps.length ? sumOf(d.comps.map(c => c.r?.[k] || 3)) / d.comps.length : 0;
reg({
  id: 'market', stage: 0, ord: 2, cols: true, t: 'Конкуренти: хто ще це робить', d: 'Знайдіть тих, до кого клієнт піде замість вас, оцініть їх і зрозумійте, чим ви кращі.', icon: 'search', min: 15,
  intro: `${term('Конкурент', 'Конкурент')} — це будь-хто, до кого клієнт піде замість вас: схожий продукт, інший спосіб або «зроблю сам». Ринку без конкурентів не буває: якщо їх не видно, люди просто вирішують проблему іншим способом. Знайдіть кількох, оцініть їх від 1 до 5 і зрозумійте, у чому ви можете бути кращими.`,
  data: S => ({ comps: S.I.competitors.map(c => ({ t: c.t, type: (c.price || 0) > 0 ? 'direct' : 'sub', price: c.price || 0, r: Object.fromEntries(CR.map(([k]) => [k, 2 + hash(c.t + k) % 3])), plus: '', minus: '' })), me: { r: Object.fromEntries(CR.map(([k]) => [k, 3])) }, why: '', t: 0 }),
  onSet: (S, d, p) => { if (/\.r\./.test(p)) d.t = (d.t || 0) + 1; },
  view(S, d) {
    fixM(d);
    const used = d.comps.map(c => c.t.toLowerCase());
    return `${box(step(1, 'Хто вже це робить?'), `<p class="sub">Напишіть, що ваші клієнти роблять зараз, щоб розв’язати проблему. Це можуть бути компанії, програми чи звичайні способи.</p>
      <div class="cmpl">${d.comps.map((c, i) => `<div class="cmpi"><b>${esc(c.t)}</b><span class="xrow">${TYPES.map(([k, t]) => xp('market', `comps.${i}.type`, k, t, c.type === k)).join('')}</span>${xb('market', 'delComp', '', { i, ic: 'trash', cls: 'ib', title: 'Прибрати' })}</div>`).join('') || '<p class="muted">Поки порожньо. Додайте перший варіант нижче.</p>'}</div>
      ${d.comps.length < 8 ? `<div class="xadd" style="margin-top:12px"><input class="inp" id="market-new" maxlength="200" placeholder="Назва конкурента чи способу" aria-label="Новий конкурент">${xb('market', 'addComp', 'Додати', { ic: 'plus' })}</div>
      <div class="xrow sg" style="margin-top:8px"><small class="muted">Швидко додати:</small>${SUBS.filter(x => !used.includes(x.toLowerCase())).map(x => `<button type="button" class="xchip" data-act="ex" data-ex="market" data-do="addComp" data-a="${esc(x)}">+ ${esc(x)}</button>`).join('')}</div>` : ''}
      ${eg('для «домашки з поясненням» конкуренти: «репетитор» (інший спосіб), «сайти з готовими відповідями» (схожий продукт), «питають друзів» (роблять самі).')}`, { ic: 'search', side: `${d.comps.length} з 8` })}
    ${box(step(2, 'Оцініть їх і себе від 1 до 5'), `<p class="sub">Натискайте на кружечки: 1 — погано, 5 — відмінно. Для «Ми» оцініть, яким ви плануєте бути. Оцінки можна орієнтовні: головне зрозуміти, де ви сильніші.</p>
      ${[...d.comps.map((c, i) => ({ c, i })), { me: true }].map(({ c, i, me }) => `<div class="rcard ${me ? 'me' : ''}"><h3>${me ? 'Ми: наш продукт' : esc(c.t)}</h3>${CR.map(([k, t, hint]) => `<div class="rrow"><span>${t}<small>${hint}</small></span>${dots('market', me ? `me.r.${k}` : `comps.${i}.r.${k}`, (me ? d.me.r[k] : c.r?.[k]) || 3, `${me ? 'Ми' : c.t}: ${t}`)}</div>`).join('')}
        ${me ? '' : `<div class="xg c2" style="margin-top:8px">${xin('market', `comps.${i}.plus`, d, { label: 'Чим добрий', ph: 'наприклад, дешево', max: 90 })}${xin('market', `comps.${i}.minus`, d, { label: 'Чим слабкий', ph: 'наприклад, довго чекати', max: 90 })}</div>`}</div>`).join('')}`, { ic: 'chart' })}
    ${box(step(3, 'Чим ви будете відрізнятися?'), `<p class="sub">Один-два речення: чому клієнт обере саме вас. Спирайтеся на ті критерії, де ваша оцінка вища, ніж у конкурентів (праворуч видно, де).</p>${xin('market', 'why', d, { area: true, rows: 3, max: 300, ph: 'Ми швидші за репетитора, бо пояснюємо одразу, а коштуємо дешевше.' })}
      <div class="xrow">${xb('market', 'hint', 'Підказати початок фрази', { ic: 'bulb', cls: 'sm' })}</div>${eg('«На відміну від репетиторів, ми пояснюємо задачу одразу й дешевше: 99 грн на місяць замість 600 за годину.»')}`, { ic: 'flag' })}`;
  },
  live(S, d) {
    fixM(d);
    const n = d.comps.length;
    const rows = CR.map(([k, t, , ph]) => { const me = d.me.r[k], av = avgOf(d, k); return { k, t, ph, me, av, diff: n ? me - av : 0 }; });
    const best = n ? rows.reduce((m, r) => r.diff > m.diff ? r : m, rows[0]) : null, worst = n ? rows.reduce((m, r) => r.diff < m.diff ? r : m, rows[0]) : null;
    return `${box('Порівняння: ми й конкуренти', n ? `<div class="cmpv">${rows.map(r => `<div class="cpr"><span>${r.t}</span><div class="cpb"><i class="me" style="width:${r.me * 20}%"></i><b>${r.me}</b></div><div class="cpb"><i class="av" style="width:${r.av * 20}%"></i><b>${r.av.toFixed(1).replace('.', ',')}</b></div></div>`).join('')}<div class="legend"><span><i style="background:var(--acc)"></i>Ми</span><span><i style="background:#b9c3cf"></i>Середній конкурент</span></div></div>
      ${best.diff > 0 ? tip(`Ваша сильна сторона: <b>${best.t.toLowerCase()}</b> (ми ${best.ph}). Спирайтеся на неї.`, 'ok') : tip('Поки що ви не кращі за конкурентів ні за одним критерієм. Подумайте, у чому ви можете вигравати, і змініть оцінку «Ми».', 'bad')}${worst.diff < 0 ? `<p class="sm muted">Слабке місце: <b>${worst.t.toLowerCase()}</b>. Вирішіть, чи варто його підтягнути.</p>` : ''}` : `<p class="muted">Додайте хоча б одного конкурента чи спосіб, і тут з’явиться порівняння.</p>`, { ic: 'chart' })}
      ${box('Чи все зроблено', checks([[n >= 3, 'Знайдено хоча б трьох конкурентів чи способів', 'Подумайте, що ще роблять клієнти: «роблять самі» теж конкурент'], [d.comps.filter(c => len(c.plus) || len(c.minus)).length >= 2, 'Описано сильні чи слабкі сторони двох із них', 'Допишіть, чим добрі чи слабкі хоча б двоє'], [(d.t || 0) >= 3, 'Оцінено конкурентів і себе', 'Натискайте на кружечки в кроці 2'], [len(d.why) >= 25, 'Є пояснення, чим ви відрізняєтесь', 'Напишіть хоча б одне повне речення']]), { ic: 'check' })}`;
  },
  acts: {
    addComp(S, d, el) {
      const inp = document.getElementById('market-new'), v = (el.dataset?.a || inp?.value || '').trim();
      if (!v) { inp?.focus(); return false; }
      if (d.comps.some(c => c.t.toLowerCase() === v.toLowerCase())) return false;
      d.comps.push({ t: v, type: 'sub', price: 0, r: Object.fromEntries(CR.map(([k]) => [k, 3])), plus: '', minus: '' });
    },
    delComp(S, d, el) { d.comps.splice(+el.dataset.i, 1); },
    hint(S, d) {
      if (!d.comps.length) return false;
      const rows = CR.map(([k, , , ph]) => ({ k, ph, diff: d.me.r[k] - avgOf(d, k) })), b = rows.reduce((m, r) => r.diff > m.diff ? r : m, rows[0]), rival = [...d.comps].sort((x, y) => (x.r?.[b.k] || 3) - (y.r?.[b.k] || 3))[0];
      d.why = `На відміну від «${rival.t}», ми ${b.ph}, тому що `;
    },
  },
  ready(S, d) {
    fixM(d);
    // усе необов'язкове: завершити можна будь-коли, але повна вправа дає більше зірок
    if (!d.comps.length) return { ok: false, msg: 'додайте хоча б одного конкурента чи спосіб-заміну' };
    if ((d.t || 0) < 2) return { ok: false, msg: 'оцініть конкурентів і себе кружечками' };
    if (len(d.why) < 25) return { ok: false, msg: 'напишіть, чим ви відрізнятиметеся' };
    return { ok: true, stars: 1 + (d.comps.length >= 3 ? 1 : 0) + (d.comps.filter(c => len(c.plus) || len(c.minus)).length >= 2 ? 1 : 0) };
  },
});

/* ═════════ Що болить клієнтам ═════════ */
const FREQ = [['rare', 'Рідко'], ['some', 'Іноді'], ['often', 'Щодня']], FW = { rare: 1, some: 2, often: 3 };
const PAINS = ['Це забирає багато часу', 'Це дорого', 'Незрозуміло, з чого почати', 'Немає кому допомогти', 'Страшно помилитися', 'Результат не завжди зрозумілий'];
const talks = S => sumOf(Object.values(S.s.know).map(k => k.n));
const fixN = d => { d.pains ||= []; d.now ||= []; d.jtbd ||= { when: '', want: '', so: '' }; d.t ||= 0; return d; };
const prio = p => (p.s || 3) * FW[p.f || 'some'];
reg({
  id: 'needs', stage: 0, ord: 3, cols: true, t: 'Що болить клієнтам', d: 'Зрозумійте, яка проблема болить найбільше, як люди справляються зараз і чого вони хочуть.', icon: 'users', min: 20,
  intro: `Продукт потрібен тим, у кого є <b>справжня проблема</b>. Ваше завдання — не вигадувати її, а знайти: що саме болить, наскільки сильно й як часто, і як люди справляються зараз. Допоможуть розмови з клієнтами (розділ «Клієнти») та ваші власні спостереження. Вправа складається з п’яти простих кроків.`,
  data: S => ({ seg: S.s.target, pains: [], now: [], jtbd: { when: '', want: '', so: '' }, t: 0 }),
  onSet: (S, d, p) => { if (p.startsWith('pains') || p.startsWith('jtbd')) d.t = (d.t || 0) + 1; },
  view(S, d) {
    fixN(d);
    const seg = S.segIds.includes(d.seg) ? d.seg : S.s.target, g = S.seg(seg), K = S.insight(seg), n = talks(S);
    const said = (S.s.interviews || []).filter(v => v.seg === seg).slice(-3).flatMap(v => v.log.slice(0, 1).map(l => ({ who: v.name, a: l.a })));
    const free = PAINS.filter(x => !d.pains.some(p => p.t === x));
    return `${box(step(1, 'Для кого ми це робимо?'), `<p class="sub">Оберіть групу клієнтів, про яку думатимете у вправі. Краще починати з однієї.</p><div class="xrow">${S.segIds.map(k => xp('needs', 'seg', k, esc(S.seg(k).short), seg === k)).join('')}</div><p class="sm">Це <b>${esc(g.t)}</b>${g.b2b ? ' (організації)' : ''}.</p>`, { ic: 'target' })}
    ${box(step(2, 'Поговоріть із людьми'), `<p class="sub">Найкращий спосіб дізнатися про біль — спитати про минуле: «Коли востаннє це траплялося? Що ви зробили? Скільки це коштувало?». Проведіть хоча б три розмови в розділі «Клієнти». Не питайте «чи сподобається вам моя ідея».</p>
      <div class="xrow"><span class="chip ${n >= 3 ? 'ok' : ''}">${n >= 3 ? icon('check', 14) : ''} Розмов проведено: ${n} з 3</span>${n >= 3 ? '' : `<button class="btn sm primary" data-act="go" data-to="customers" data-hl='[data-act="interview"]'>Поговорити з клієнтами</button>`}</div>
      ${K.n ? `<p class="sm">Що ви вже з’ясували про «${esc(g.short)}»: розмов — <b>${K.n}</b>${K.pain != null ? `, наскільки болить — <b>${Math.round(K.pain * 10)} з 10</b> (довіра: ${K.painConf})` : ''}${K.wtp ? `, витрачають зараз — <b>${Math.round(K.wtp)} ₴</b>` : ''}.</p>` : ''}
      ${said.length ? `<div class="quotes">${said.map(x => `<blockquote><p>«${esc(x.a)}»</p><cite>${esc(x.who)}</cite></blockquote>`).join('')}</div>` : '<p class="sm muted">Тут з’являться відповіді з ваших розмов. Також можна опиратися на власні спостереження.</p>'}`, { ic: 'mic' })}
    ${box(step(3, 'Що їм болить?'), `<p class="sub">Запишіть від двох до п’яти проблем. Для кожної вкажіть, <b>наскільки сильно</b> вона болить (1 — трохи, 5 — дуже) і <b>як часто</b> трапляється.</p>
      <div class="pl">${d.pains.map((p, i) => `<div class="pli ${i === topIdx(d) ? 'top' : ''}"><div class="plh"><b>${esc(p.t)}</b>${xb('needs', 'delPain', '', { i, ic: 'trash', cls: 'ib', title: 'Прибрати' })}</div><div class="plc"><span>Наскільки болить ${dots('needs', `pains.${i}.s`, p.s || 3, `${p.t}: наскільки болить`)}</span><span>Як часто <span class="xrow">${FREQ.map(([k, t]) => xp('needs', `pains.${i}.f`, k, t, (p.f || 'some') === k)).join('')}</span></span></div></div>`).join('') || '<p class="muted">Поки порожньо. Додайте першу проблему нижче.</p>'}</div>
      ${d.pains.length < 5 ? `<div class="xadd" style="margin-top:12px"><input class="inp" id="nd-pain" maxlength="200" placeholder="Своїми словами: що саме болить?" aria-label="Нова проблема">${xb('needs', 'addPain', 'Додати', { ic: 'plus' })}</div>
      <div class="xrow sg" style="margin-top:8px"><small class="muted">Підказки:</small>${free.map(x => `<button type="button" class="xchip" data-act="ex" data-ex="needs" data-do="addPain" data-a="${esc(x)}">+ ${esc(x)}</button>`).join('')}</div>` : ''}
      ${eg('«Не розумію домашку» · болить на 4 з 5 · трапляється щодня. Це сильна, часта проблема, тож вона важлива.')}`, { ic: 'alert', side: `${d.pains.length} з 5` })}
    ${box(step(4, 'Як вони справляються зараз?'), `<p class="sub">Люди вже якось розв’язують проблему. Позначте, як саме. Це ваші майбутні конкуренти.</p><div class="xrow">${[...new Set([...g.solutions, ...d.now])].map(x => xp('needs', 'now', x, esc(x), d.now.includes(x), { set: 'tog' })).join('')}</div>
      <div class="xadd" style="margin-top:10px"><input class="inp" id="nd-now" maxlength="200" placeholder="Свій варіант" aria-label="Свій спосіб">${xb('needs', 'add', '', { p: 'now', from: '#nd-now', max: 8, ic: 'plus', cls: 'ib', title: 'Додати' })}</div>`, { ic: 'compass' })}
    ${box(step(5, 'Головна потреба'), `<p class="sub">Складіть одне речення за шаблоном: <b>«Коли… я хочу… щоб…»</b>. Воно показує, що клієнту справді потрібно (результат), а не яку програму він хоче.</p>
      <div class="xg">${xin('needs', 'jtbd.when', d, { label: 'Коли (ситуація)', ph: g.who?.[0] ? `Коли ${g.who[0]} сідає за домашку й не розуміє тему` : 'Коли…', max: 100 })}${xin('needs', 'jtbd.want', d, { label: 'Я хочу (що зробити)', ph: 'швидко зрозуміти, як розв’язувати', max: 100 })}${xin('needs', 'jtbd.so', d, { label: 'Щоб (навіщо)', ph: 'здати роботу вчасно й не нервувати', max: 100 })}</div>
      <div class="xrow" style="margin-top:8px">${xb('needs', 'fill', 'Підставити з головної проблеми', { ic: 'bulb', cls: 'sm' })}</div>`, { ic: 'flag' })}`;
  },
  live(S, d) {
    fixN(d);
    const j = d.jtbd, top = d.pains[topIdx(d)], sorted = [...d.pains].map(p => ({ ...p, v: prio(p) })).sort((a, b) => b.v - a.v);
    return `${box('Ваш висновок', `${top ? `<p class="big-pain"><small>Головна проблема</small><b>${esc(top.t)}</b></p>` : '<p class="muted">Головна проблема з’явиться, коли ви запишете хоча б одну.</p>'}
      ${sorted.length ? `<div class="cmpv">${sorted.map(p => `<div class="cpr"><span>${esc(p.t)}</span><div class="cpb"><i class="me" style="width:${p.v / 15 * 100}%"></i><b>${p.v}</b></div></div>`).join('')}</div><p class="sm muted">Важливість = наскільки болить × як часто (від 1 до 15).</p>` : ''}
      <p class="jt">${j.when || j.want || j.so ? `«Коли ${esc(j.when || '…')}, я хочу ${esc(j.want || '…')}, щоб ${esc(j.so || '…')}.»` : ''}</p>`, { ic: 'heart' })}
      ${box('Чи все зроблено', checks([[talks(S) >= 3, 'Проведено хоча б три розмови з клієнтами', 'Розділ «Клієнти» → «Інтерв’ю»'], [d.pains.length >= 2, 'Записано хоча б дві проблеми', 'Додайте ще, нехай навіть орієнтовні'], [d.now.length >= 1, 'Описано, як люди справляються зараз', 'Позначте хоча б один спосіб'], [len(j.when) >= 5 && len(j.want) >= 5 && len(j.so) >= 5, 'Сформульовано головну потребу', 'Заповніть три частини речення']]), { ic: 'check' })}`;
  },
  acts: {
    addPain(S, d, el) {
      const inp = document.getElementById('nd-pain'), v = (el.dataset?.a || inp?.value || '').trim();
      if (!v) { inp?.focus(); return false; }
      if (d.pains.length >= 5 || d.pains.some(p => p.t.toLowerCase() === v.toLowerCase())) return false;
      d.pains.push({ t: v, s: 3, f: 'some' }); d.t = (d.t || 0) + 1;
    },
    delPain(S, d, el) { d.pains.splice(+el.dataset.i, 1); },
    fill(S, d) {
      const top = d.pains[topIdx(d)], g = S.seg(S.segIds.includes(d.seg) ? d.seg : S.s.target);
      if (!top) return false;
      d.jtbd = { when: d.jtbd.when || `${g.who?.[0] || 'клієнт'} стикається з проблемою`, want: `позбутися проблеми: ${top.t.toLowerCase().replace(/[.!]$/, '')}`, so: d.jtbd.so || 'не втрачати час і нерви' };
      d.t = (d.t || 0) + 1;
    },
  },
  ready(S, d) {
    fixN(d);
    const j = d.jtbd;
    if (d.pains.length < 2) return { ok: false, msg: 'запишіть хоча б дві проблеми' };
    if (len(j.when) < 5 || len(j.want) < 5 || len(j.so) < 5) return { ok: false, msg: 'сформулюйте головну потребу: «коли… хочу… щоб…»' };
    return { ok: true, stars: 1 + (d.pains.length >= 3 && d.now.length ? 1 : 0) + (talks(S) >= 3 ? 1 : 0) };
  },
});
function topIdx(d) { fixN(d); let b = -1, v = -1; d.pains.forEach((p, i) => { if (prio(p) > v) { v = prio(p); b = i; } }); return b; }
