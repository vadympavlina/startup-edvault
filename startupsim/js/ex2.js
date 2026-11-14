// Симулятор стартапу · вправи етапу 3 «Позиціонування»: SWOT, унікальна пропозиція, неймінг, PR, відгуки.
import { esc, term } from './ui.js';
import { icon } from './icons.js';
import { reg, xb, xp, xin, tip, box, checks, mk, hash, clamp, sumOf, plural, X } from './ex-core.js';

const len = s => String(s || '').trim().length;

/* ═════════ SWOT ═════════ */
const Q = { S: ['Сильні сторони', 'всередині компанії, допомагає', 'ok'], W: ['Слабкі сторони', 'всередині компанії, заважає', 'bad'], O: ['Можливості', 'ззовні, допомагає', 'ok'], T: ['Загрози', 'ззовні, заважає', 'bad'] };
const QHINT = { S: 'Це про вашу компанію й вона вам допомагає: сильна сторона.', W: 'Це про вашу компанію, але вона заважає: слабка сторона.', O: 'Це відбувається ззовні й може допомогти: можливість.', T: 'Це відбувається ззовні й може зашкодити: загроза.' };
function swotDeck(S) {
  const s = S.s, I = S.I, talks = sumOf(Object.values(s.know).map(k => k.n)), size = sumOf(S.segIds.map(k => S.seg(k).size || 0)), rw = S.runwayWeeks();
  const d = [
    [s.team.length ? `У вас є команда: ${s.team.length + 1} ${plural(s.team.length + 1, 'людина', 'людини', 'людей')}` : 'Ви працюєте самі, без команди', s.team.length ? 'S' : 'W'],
    [rw > 52 ? 'Грошей вистачить більш ніж на рік' : 'Грошей вистачить менш ніж на рік', rw > 52 ? 'S' : 'W'],
    [talks >= 3 ? `Ви поговорили з клієнтами (${talks})` : 'Ви майже не говорили з клієнтами', talks >= 3 ? 'S' : 'W'],
    [`На ринку вже є ${I.competitors.length} ${plural(I.competitors.length, 'конкурент', 'конкуренти', 'конкурентів')}: ${I.competitors.map(c => c.t.toLowerCase()).slice(0, 2).join(', ')}`, 'T'],
    [size > 500000 ? 'Ринок великий: сотні тисяч потенційних клієнтів' : 'Ринок невеликий і швидко насичується', size > 500000 ? 'O' : 'T'],
    [s.product.launched ? 'Продукт уже запущено' : 'Продукт ще не запущено', s.product.launched ? 'S' : 'W'],
    ['Люди дедалі частіше користуються смартфонами й онлайн-сервісами', 'O'], ['Реклама в інтернеті дорожчає щороку', 'T'], ['Нові закони посилюють вимоги до захисту особистих даних', 'T'], ['Школи й батьки охочіше пробують цифрові інструменти', 'O'],
  ];
  return d.map(([t, k], i) => ({ id: i, t, k, q: null, src: 'game' }));
}
reg({
  id: 'swot', stage: 2, t: 'SWOT-аналіз', d: 'Розкладіть факти по чвертях і складіть план дій.', icon: 'compass', min: 15,
  intro: `${term('SWOT', 'SWOT')} — це чотири чверті: <b>сильні</b> й <b>слабкі</b> сторони (усередині компанії), <b>можливості</b> й <b>загрози</b> (ззовні). Спершу розкладіть підказки з вашої гри, потім додайте свої пункти, а наприкінці придумайте дії.`,
  data: S => ({ items: swotDeck(S), tows: { so: '', wo: '', st: '', wt: '' } }),
  view(S, d) {
    const pool = d.items.filter(x => x.src === 'game' && !x.q), placed = k => d.items.filter(x => x.q === k);
    const ans = d.items.filter(x => x.src === 'game' && x.q), right = ans.filter(x => x.q === x.k).length;
    const quad = k => `<div class="sq ${k}"><h4>${Q[k][0]}<small>${Q[k][1]}</small></h4><ul class="xlist">${placed(k).map(x => `<li class="xitem ${x.src === 'game' ? (x.q === x.k ? 'okk' : 'badd') : ''}"><span>${esc(x.t)}${x.src === 'game' && x.q !== x.k ? `<small class="hintq">${QHINT[x.k]}</small>` : ''}</span>${xb('swot', 'unplace', '', { i: x.id, ic: 'x', cls: 'ib', title: 'Вилучити з чверті' })}</li>`).join('')}</ul>
      <div class="xadd"><input class="inp" id="sw-${k}" maxlength="320" placeholder="Додайте своє…" aria-label="${Q[k][0]}">${xb('swot', 'addOwn', '', { a: k, ic: 'plus', cls: 'ib', title: 'Додати' })}</div></div>`;
    const tows = [['so', 'S+O', 'Як сильні сторони допоможуть скористатися можливостями?'], ['wo', 'W+O', 'Як можливості допоможуть подолати слабкі сторони?'], ['st', 'S+T', 'Як сильні сторони захистять від загроз?'], ['wt', 'W+T', 'Як не дати слабким сторонам стати загрозою?']];
    return `${pool.length ? box('Куди це належить?', `<p class="sub">Це факти про вашу ситуацію. Визначте, до якої чверті кожен належить. Запитайте себе: це <b>всередині</b> компанії чи <b>ззовні</b>? Це <b>допомагає</b> чи <b>заважає</b>?</p><ul class="xlist">${pool.map(x => `<li class="xitem pend"><span>${esc(x.t)}</span><span class="xrow">${Object.entries(Q).map(([k, q]) => xb('swot', 'place', k, { a: x.id, b: k, cls: 'sm', title: q[0] })).join('')}</span></li>`).join('')}</ul>`, { ic: 'search', side: `лишилось ${pool.length}` }) : ''}
    ${box('Ваша SWOT-матриця', `<div class="swot">${['S', 'W', 'O', 'T'].map(quad).join('')}</div>${ans.length ? `<p class="sm muted" style="margin-top:8px">Правильно розкладено: ${right} з ${ans.length}.</p>` : ''}`, { ic: 'plan' })}
    ${box('Що з цим робити?', `<p class="sub">Поєднайте чверті й сформулюйте дії. Достатньо двох-трьох.</p><div class="xg c2">${tows.map(([k, t, q]) => xin('swot', `tows.${k}`, d, { label: `${t}: ${q}`, area: true, rows: 2, max: 160 })).join('')}</div>`, { ic: 'rocket' })}`;
  },
  acts: {
    place(S, d, el) { const x = d.items.find(i => i.id === +el.dataset.a); if (x) x.q = el.dataset.b; },
    unplace(S, d, el) { const i = d.items.findIndex(x => x.id === +el.dataset.i), x = d.items[i]; if (!x) return; if (x.src === 'own') d.items.splice(i, 1); else x.q = null; },
    addOwn(S, d, el) { const k = el.dataset.a, src = document.getElementById('sw-' + k), v = (src?.value || '').trim(); if (!v) { src?.focus(); return false; } d.items.push({ id: Math.max(-1, ...d.items.map(x => x.id)) + 1, t: v, q: k, k, src: 'own' }); },
  },
  ready(S, d) {
    const pool = d.items.filter(x => x.src === 'game' && !x.q).length, ans = d.items.filter(x => x.src === 'game'), right = ans.filter(x => x.q === x.k).length;
    if (pool) return { ok: false, msg: `Розкладіть ще ${pool} ${plural(pool, 'підказку', 'підказки', 'підказок')}` };
    if (right / ans.length < .7) return { ok: false, msg: 'Багато підказок у не тих чвертях: перечитайте підказки під ними й виправте' };
    const per = k => d.items.filter(x => x.q === k).length;
    if (['S', 'W', 'O', 'T'].some(k => per(k) < 2)) return { ok: false, msg: 'У кожній чверті має бути хоча б два пункти: додайте свої' };
    if (Object.values(d.tows).filter(v => len(v) >= 15).length < 2) return { ok: false, msg: 'Сформулюйте хоча б дві дії' };
    return { ok: true, stars: 1 + (right === ans.length ? 1 : 0) + (Object.values(d.tows).filter(v => len(v) >= 15).length >= 4 ? 1 : 0) };
  },
});

/* ═════════ Унікальна торгова пропозиція ═════════ */
const UF = [['who', 'Для кого', 'школярів, які бояться контрольних'], ['prob', 'Яка в них проблема', 'не розуміють, як розв’язати задачу'], ['prod', 'Що це (продукт)', 'наш застосунок'], ['cat', 'Яка це категорія', 'персональний репетитор у кишені'], ['gain', 'Головна вигода', 'пояснює кожен крок за 5 хвилин'], ['vs', 'На відміну від кого', 'сайтів із готовими відповідями'], ['proof', 'Чому нам вірять', 'пояснення перевіряють учителі']];
const UBAD = /інноваційн|унікальн|найкращ|найкраща|професійн|якісн|№\s*1|топ|передов|сучасн/i;
const uspText = v => len(v.who) || len(v.prod) ? `Для ${v.who || '…'}, які ${v.prob || '…'}, ${v.prod || '…'} — це ${v.cat || '…'}, що ${v.gain || '…'}. На відміну від ${v.vs || '…'}, ${v.proof ? 'ми ' + v.proof.replace(/^ми\s+/i, '') : '…'}.` : '';
function uspScore(v, S) {
  const t = uspText(v), seg = S.seg().short.toLowerCase().slice(0, 5);
  const parts = [[UF.every(([k]) => len(v[k]) >= 3), 'Заповнено всі частини', 25], [/\d/.test(t), 'Є конкретна цифра чи термін', 20], [len(v.vs) >= 4, 'Названо, чим ви відрізняєтесь від інших', 20], [!UBAD.test(t), 'Без порожніх слів («інноваційний», «найкращий»)', 15], [t.length > 0 && t.length <= 230, 'Не довше двох-трьох речень', 10], [t.toLowerCase().includes(seg) || len(v.who) >= 8, 'Видно, для кого це', 10]];
  return { parts, score: sumOf(parts.map(p => (p[0] ? p[2] : 0))), text: t };
}
const REACT = { yes: ['Це саме те, що мені треба!', 'Звучить конкретно, варто спробувати.', 'Чітко: розумію, що отримаю.', 'Беру, поки не дорого.'], maybe: ['Начебто непогано, але чим це краще, ніж у всіх?', 'Може. Мені б ще приклад.', 'Цікаво, але впевненості поки немає.'], no: ['Звучить як усе, що вже траплялося.', 'Загальні слова, нічого конкретного.', 'Незрозуміло, навіщо це мені.'] };
reg({
  id: 'usp', stage: 2, t: 'Унікальна пропозиція', d: 'Складіть два варіанти пропозиції й перевірте їх на клієнтах.', icon: 'bolt', min: 15,
  intro: `${term('УТП', 'Унікальна торгова пропозиція (УТП)')} — одне-два речення про те, <b>чому клієнт має обрати саме вас</b>. Складіть два варіанти за шаблоном, перевірте кожен за чек-листом і покажіть їх п’яти уявним клієнтам.`,
  data: () => ({ a: {}, b: {}, test: null, pick: '', ab: 'a' }),
  view(S, d) {
    const cur = d[d.ab], sc = uspScore(cur, S);
    const tab = k => `<button type="button" class="tab ${d.ab === k ? 'on' : ''}" data-act="ex" data-ex="usp" data-do="set" data-p="ab" data-v="${k}" data-t="s" aria-pressed="${d.ab === k}">Варіант ${k.toUpperCase()}${uspScore(d[k], S).score >= 70 ? ' ' + icon('check', 14) : ''}</button>`;
    return `<div class="tabs" role="group" style="margin-bottom:6px">${tab('a')}${tab('b')}</div>
    ${box(`Варіант ${d.ab.toUpperCase()}: складіть за шаблоном`, `<div class="xg c2">${UF.map(([k, l, ph]) => xin('usp', `${d.ab}.${k}`, d, { label: l, ph: 'наприклад, ' + ph, max: 90 })).join('')}</div>`, { ic: 'pen' })}`;
  },
  live(S, d) {
    const cur = d[d.ab], sc = uspScore(cur, S), t = sc.text, other = uspScore(d[d.ab === 'a' ? 'b' : 'a'], S);
    return `${t ? `<blockquote class="uspq">${esc(t)}</blockquote>` : ''}${box('Чек-лист', `<div class="uscore"><b>${sc.score}</b><span>з 100</span></div>${checks(sc.parts.map(p => [p[0], p[1]]))}`, { ic: 'check' })}
    ${box('Перевірка на клієнтах', `<p class="sub">П’ять уявних клієнтів із вашого сегмента прочитають обидва варіанти й оберуть, який їм ближчий.</p>${xb('usp', 'test', d.test ? 'Показати ще раз' : 'Показати клієнтам', { cls: 'primary', ic: 'users', dis: sc.score < 40 || other.score < 40 })}${sc.score < 40 || other.score < 40 ? '<small class="muted"> Спершу заповніть обидва варіанти хоча б наполовину.</small>' : ''}
      ${d.test ? `<div class="reacts">${d.test.map((r, i) => `<div class="react ${r.v}"><span class="pav sm" style="--h:${(i * 67 + 20) % 360}">${['Ол', 'Ан', 'Мак', 'Іл', 'Св'][i]}</span><div><b>${r.v === 'a' ? 'Вибір: A' : r.v === 'b' ? 'Вибір: B' : 'Жоден'}</b><p>«${esc(r.q)}»</p></div></div>`).join('')}<p class="x-tip">${icon('chart', 16)}<span>Варіант A: ${d.test.filter(r => r.v === 'a').length} · Варіант B: ${d.test.filter(r => r.v === 'b').length} · жоден: ${d.test.filter(r => r.v === 'n').length}</span></p></div>` : ''}`, { ic: 'users' })}
    ${box('Ваш вибір', `<div class="xrow">${['a', 'b'].map(k => xp('usp', 'pick', k, `Обираю варіант ${k.toUpperCase()}`, d.pick === k, { cls: 'card' })).join('')}${xb('usp', 'toPlan', 'Записати в бізнес-план', { ic: 'plan', dis: !d.pick || !uspScore(d[d.pick], S).text })}</div>`, { ic: 'flag' })}`;
  },
  acts: {
    test(S, d) {
      const A = uspScore(d.a, S), B = uspScore(d.b, S), r = mk(hash(A.text + B.text + S.s.company.name));
      d.test = Array.from({ length: 5 }, () => { const x = A.score + r.norm(0, 14), y = B.score + r.norm(0, 14), best = Math.max(x, y); const v = best < 45 ? 'n' : x >= y ? 'a' : 'b'; const q = v === 'n' ? r.pick(REACT.no) : best > 75 ? r.pick(REACT.yes) : r.pick(REACT.maybe); return { v, q }; });
    },
    toPlan(S, d, el, C) { S.s.canvas ||= {}; S.s.canvas.uvp = uspScore(d[d.pick], S).text; C.toast('Записано в «Бізнес-план» → «Унікальна цінність»', 'good'); },
  },
  ready(S, d) {
    const A = uspScore(d.a, S), B = uspScore(d.b, S);
    if (A.score < 40 || B.score < 40) return { ok: false, msg: 'Заповніть обидва варіанти хоча б наполовину' };
    if (!d.test) return { ok: false, msg: 'Покажіть варіанти клієнтам' };
    if (!d.pick) return { ok: false, msg: 'Оберіть варіант' };
    const best = Math.max(A.score, B.score);
    return { ok: true, stars: 1 + (best >= 70 ? 1 : 0) + (best >= 90 ? 1 : 0) };
  },
});

/* ═════════ Неймінг ═════════ */
const THEMES = {
  edu: ['Знай', 'Розум', 'Мудр', 'Лекс', 'Грані', 'Кроки', 'Звук', 'Пізна', 'Урок', 'Книж', 'Вектор', 'Ідея'],
  tech: ['Код', 'Біт', 'Нейро', 'Хаб', 'Лінк', 'Піксель', 'Клік', 'Оптик', 'Вузол', 'Синк', 'Дата', 'Ядро'],
  nature: ['Лісо', 'Хвиля', 'Зерно', 'Гілка', 'Квіт', 'Листя', 'Струм', 'Роса', 'Бриз', 'Мох', 'Ґрунт', 'Полум'],
  go: ['Мандр', 'Шлях', 'Рух', 'Курс', 'Політ', 'Місток', 'Стежка', 'Ґо', 'Вітер', 'Порт', 'Компас', 'Старт'],
  care: ['Тепло', 'Дбай', 'Друг', 'Рідне', 'Опора', 'Затишок', 'Плечо', 'Серце', 'Дім', 'Сусід', 'Турбо', 'Добро'],
};
const SUF = ['ик', 'ка', 'ія', 'ікс', 'ля', 'ленд', 'хаб', 'лаб', 'ок', 'ер', 'ум', 'ео', 'ай'];
const THEME_T = { edu: 'Навчання', tech: 'Технології', nature: 'Природа', go: 'Рух і подорожі', care: 'Турбота' };
const STYLE_T = { glue: 'Склеєні слова', suf: 'Корінь + закінчення', short: 'Короткі й дзвінкі' };
function genNames(th, style, seed) {
  const r = mk(seed), pool = THEMES[th], out = new Set();
  while (out.size < 12) {
    const a = r.pick(pool), b = r.pick(pool.filter(x => x !== a));
    const n = style === 'glue' ? (a + b.toLowerCase()) : style === 'suf' ? (a + r.pick(SUF)) : (a.slice(0, 3 + r.int(2)) + r.pick(['ро', 'ва', 'ля', 'ко', 'ні', 'ту']));
    const nm = n.charAt(0).toUpperCase() + n.slice(1);
    if (nm.length >= 4 && nm.length <= 12) out.add(nm);
  }
  return [...out];
}
const nameScore = n => {
  const w = n.replace(/[^а-яіїєґa-z]/gi, ''), cons = (w.match(/[бвгґджзйклмнпрстфхцчшщbcdfghjklmnpqrstvwxz]{4,}/gi) || []).length, vowels = (w.match(/[аеєиіїоуюяaeiouy]/gi) || []).length / Math.max(1, w.length);
  const free = hash('dom' + n.toLowerCase()) % 100 < 58;
  const list = [[w.length >= 4 && w.length <= 9, 'Коротка: 4–9 літер', 25], [cons === 0 && vowels > .28, 'Легко вимовляється', 25], [/^[А-ЯІЇЄҐA-Z][а-яіїєґa-z]+$/.test(n), 'Одне слово, без цифр і тире', 15], [free, free ? `Домен ${esc(n.toLowerCase())}.com.ua вільний` : `Домен ${esc(n.toLowerCase())}.com.ua зайнятий`, 20], [hash('mem' + n) % 100 < 70, 'Запам’ятовується (нема схожих гучних брендів)', 15]];
  return { list, score: sumOf(list.map(x => (x[0] ? x[2] : 0))), free };
};
/* Нова назва компанії; копії старої назви в інших вправах (логотип) теж оновлюємо. */
function applyName(S, name) {
  const c = S.s.company, old = c.name;
  if (!name || name === old) return false;
  c.name = name;
  try { const lg = X(S, 'logo'); if (lg && (!lg.name || lg.name === old)) lg.name = name; } catch { /* вправу ще не відкривали */ }
  return true;
}

reg({
  id: 'naming', stage: 2, t: 'Неймінг', d: 'Згенеруйте назви, перевірте їх і оберіть найкращу.', icon: 'pen', min: 15,
  intro: `${term('Неймінг', 'Неймінг')} — вибір назви. Хороша назва коротка, легко вимовляється, її не плутають з іншими та можна зареєструвати домен. Згенеруйте варіанти, додайте свої, складіть шортлист і перевірте кожну назву.`,
  data: () => ({ th: 'edu', st: 'glue', seed: 1, short: [], vote: null, final: '' }),
  view(S, d) {
    const gen = genNames(d.th, d.st, d.seed * 7919 + hash(d.th + d.st));
    return `${box('Генератор', `<div class="xrow"><span class="xf-l">Тема:</span>${Object.entries(THEME_T).map(([k, t]) => xp('naming', 'th', k, t, d.th === k)).join('')}</div><div class="xrow mt"><span class="xf-l">Стиль:</span>${Object.entries(STYLE_T).map(([k, t]) => xp('naming', 'st', k, t, d.st === k)).join('')}${xb('naming', 'more', 'Ще варіанти', { ic: 'refresh', cls: 'sm' })}</div>
      <div class="namegrid mt">${gen.map(n => `<button type="button" class="nm ${d.short.includes(n) ? 'on' : ''}" data-act="ex" data-ex="naming" data-do="tog" data-p="short" data-v="${esc(n)}" data-t="s" data-max="6" aria-pressed="${d.short.includes(n)}">${icon(d.short.includes(n) ? 'star' : 'plus', 14)} ${esc(n)}</button>`).join('')}</div>
      <div class="xadd mt"><input class="inp" id="nm-own" maxlength="120" placeholder="Або впишіть свою назву">${xb('naming', 'addOwn', 'У шортлист', { ic: 'plus' })}</div>`, { ic: 'bulb' })}
    ${box('Шортлист і перевірка', d.short.length ? `<div class="xg c2">${d.short.map(n => { const sc = nameScore(n); return `<article class="nmcard ${d.final === n ? 'fin' : ''}"><header><b>${esc(n)}</b><span class="xtag ${sc.score >= 75 ? 'ok' : sc.score >= 50 ? 'warn' : 'bad'}">${sc.score}/100</span>${xb('naming', 'del', '', { p: 'short', i: d.short.indexOf(n), ic: 'x', cls: 'ib', title: 'Прибрати' })}</header>${checks(sc.list.map(x => [x[0], x[1]]))}${xp('naming', 'final', n, d.final === n ? 'Це моя назва' : 'Обрати як назву', d.final === n, { cls: 'card' })}</article>`; }).join('')}</div>
      <div class="xrow mt">${xb('naming', 'poll', d.vote ? 'Опитати ще раз' : 'Спитати п’ятьох знайомих', { ic: 'users', dis: d.short.length < 2 })}${d.vote ? `<small>${d.short.map(n => `${esc(n)} — ${d.vote[n] || 0}`).join(' · ')}</small>` : ''}</div>` : '<p class="sm muted">Натискайте назви вище, щоб додати до шортлиста (до шести).</p>', { ic: 'check', side: `${d.short.length} з 6` })}
    ${d.final ? box('Застосувати', `<p>Назва «<b>${esc(d.final)}</b>» ${S.s.company.name === d.final ? 'уже стоїть у вашій компанії.' : 'може стати назвою вашої компанії в грі.'}</p>${xb('naming', 'rename', 'Перейменувати компанію', { cls: 'primary', ic: 'check', dis: S.s.company.name === d.final })}`, { ic: 'rocket' }) : ''}`;
  },
  acts: {
    more(S, d) { d.seed++; },
    addOwn(S, d) { const el = document.getElementById('nm-own'), v = (el?.value || '').trim(); if (!v) { el?.focus(); return false; } if (!d.short.includes(v) && d.short.length < 6) d.short.push(v); },
    poll(S, d) { const r = mk(hash(d.short.join('|') + (d.pollN = (d.pollN || 0) + 1))), v = {}; d.short.forEach(n => { v[n] = 0; }); for (let i = 0; i < 5; i++) { const w = d.short.map(n => Math.max(1, nameScore(n).score + r.norm(0, 18))); let t = r.next() * sumOf(w), k = 0; while (t > w[k] && k < w.length - 1) { t -= w[k]; k++; } v[d.short[k]]++; } d.vote = v; },
    rename(S, d, el, C) { if (applyName(S, d.final)) { S.log?.(`Компанію перейменовано: «${d.final}».`); C.toast(`Тепер компанія називається «${d.final}»`, 'good'); C.topbar?.(); } },
  },
  finish(S, d, C, again) { if (d.final && applyName(S, d.final)) { S.log?.(`Компанію перейменовано: «${d.final}».`); C?.topbar?.(); } },
  ready(S, d) {
    if (d.short.length < 3) return { ok: false, msg: 'Додайте до шортлиста хоча б три назви' };
    if (!d.vote) return { ok: false, msg: 'Спитайте п’ятьох знайомих' };
    if (!d.final || !d.short.includes(d.final)) return { ok: false, msg: 'Оберіть назву зі шортлиста' };
    const sc = nameScore(d.final).score;
    return { ok: true, stars: 1 + (sc >= 60 ? 1 : 0) + (sc >= 85 ? 1 : 0) };
  },
});

/* ═════════ PR ═════════ */
const HOOKS = [['launch', 'Запуск продукту'], ['hundred', 'Перші 100 клієнтів'], ['story', 'Цікава історія засновника'], ['data', 'Дослідження з цифрами'], ['partner', 'Партнерство зі школою чи компанією'], ['social', 'Соціальна користь']];
const MEDIA = [['local', 'Місцеве інтернет-видання', 4, 5, 2000, 'містяни'], ['blog', 'Тематичний блогер', 5, 4, 6000, 'підписники'], ['school', 'Шкільна розсилка', 3, 5, 800, 'батьки й учителі'], ['tg', 'Telegram-канал спільноти', 4, 3, 3500, 'читачі']];
const CRISIS = [['hide', 'Видалити допис і не коментувати', 'Люди помітять. Видалення без пояснень виглядає як приховування, а скриншоти вже поширюються.', 0], ['ignore', 'Нічого не робити', 'Допис набере обертів. Мовчання сприймають як байдужість.', 0], ['argue', 'Довести в коментарях, що клієнт неправий', 'Суперечка з клієнтом на публіці псує репутацію, навіть якщо ви праві.', 0], ['fix', 'Публічно вибачитися, розібратися й повернути гроші', 'Найкращий варіант: швидко, відкрито й без виправдань. Клієнти бачать, що за продуктом стоять люди.', 1]];
reg({
  id: 'pr', stage: 2, t: 'PR: перша новина', d: 'Напишіть прес-реліз, оберіть медіа й відповідь на кризу.', icon: 'mic', min: 15,
  intro: `${term('PR', 'PR')} — це робота з репутацією: про вас пишуть інші, тому довіряють більше, ніж рекламі. Оберіть новинний привід, напишіть короткий прес-реліз, виберіть, де його опублікувати, і потренуйтеся реагувати на незручний допис.`,
  data: () => ({ hooks: [], head: '', lead: '', quote: '', media: [], crisis: '' }),
  view(S, d) {
    const reach = sumOf(d.media.map(k => MEDIA.find(m => m[0] === k)?.[4] || 0)), c = S.s.company;
    return `${box('1. Новинний привід', `<p class="sub">Про вас напишуть, якщо є що розповісти. Оберіть до двох приводів.</p><div class="xrow">${HOOKS.map(([k, t]) => xp('pr', 'hooks', k, t, d.hooks.includes(k), { set: 'tog', max: 2 })).join('')}</div>`, { ic: 'bulb' })}
    ${box('2. Прес-реліз', `<div class="xg side"><div>${xin('pr', 'head', d, { label: 'Заголовок', max: 100, ph: 'Школяр із Львова створив застосунок, що пояснює домашку', hint: 'До 90 символів. Краще з дією й цифрою.' })}${xin('pr', 'lead', d, { label: 'Перший абзац: що, хто, коли, де, навіщо', area: true, rows: 4, max: 400, cls: 'mt', ph: 'Сьогодні команда «' + c.name + '» запустила…' })}${xin('pr', 'quote', d, { label: 'Цитата засновника', area: true, rows: 2, max: 200, cls: 'mt', ph: '«Ми хотіли, щоб…», — каже ' + S.s.founder.name })}</div>
      <div><article class="news"><small>НОВИНИ · ${esc(c.name)}</small><h4>${esc(d.head || 'Тут буде заголовок')}</h4><p>${esc(d.lead || 'Тут буде перший абзац новини…')}</p>${d.quote ? `<blockquote>${esc(d.quote)}</blockquote>` : ''}<footer>Про компанію: ${esc(c.name)} — ${esc(S.I.pitch)}</footer></article></div></div>
      ${checks([[len(d.head) >= 20 && len(d.head) <= 90, 'Заголовок 20–90 символів', 'Занадто короткий чи задовгий'], [/\d/.test(d.head) || /запуст|створ|відкри|допомож/i.test(d.head), 'У заголовку є дія чи цифра'], [len(d.lead) >= 80, 'Перший абзац відповідає на «що, хто, коли»'], [len(d.quote) >= 20, 'Є жива цитата засновника']])}`, { ic: 'pen' })}
    ${box('3. Де опублікувати', `<div class="xg c2">${MEDIA.map(([k, t, tr, fit, r, who]) => `<div class="chcard ${d.media.includes(k) ? 'on' : ''}">${xp('pr', 'media', k, esc(t), d.media.includes(k), { set: 'tog', max: 3, cls: 'card' })}<small>охоплення ≈ ${r.toLocaleString('uk-UA')} · ${who}</small><small>довіра ${'●'.repeat(tr)}${'○'.repeat(5 - tr)} · підходить вам ${'●'.repeat(fit)}${'○'.repeat(5 - fit)}</small></div>`).join('')}</div><p class="sm muted">Разом може побачити: <b>${reach.toLocaleString('uk-UA')}</b> людей.</p>`, { ic: 'megaphone', side: `обрано ${d.media.length} з 3` })}
    ${box('4. Складна ситуація', `<p class="sub"><b>Клієнт опублікував допис:</b> «Застосунок двічі списав з мене гроші, а підтримка мовчить». Допис уже має 120 вподобань. Що ви зробите?</p><div class="xg c2">${CRISIS.map(([k, t, why]) => `<div class="chcard ${d.crisis === k ? 'on' : ''}">${xp('pr', 'crisis', k, esc(t), d.crisis === k, { cls: 'card' })}${d.crisis ? `<p class="sm ${k === 'fix' ? '' : 'muted'}">${esc(why)}</p>` : ''}</div>`).join('')}</div>`, { ic: 'shield' })}`;
  },
  ready(S, d) {
    if (!d.hooks.length) return { ok: false, msg: 'Оберіть новинний привід' };
    if (len(d.head) < 20 || len(d.lead) < 60) return { ok: false, msg: 'Напишіть заголовок і перший абзац' };
    if (d.media.length < 2) return { ok: false, msg: 'Оберіть хоча б два місця публікації' };
    if (!d.crisis) return { ok: false, msg: 'Оберіть, як відповісте на складний допис' };
    return { ok: true, stars: 1 + (len(d.quote) >= 20 && /\d/.test(d.head + d.lead) ? 1 : 0) + (d.crisis === 'fix' ? 1 : 0) };
  },
  finish(S, d, C, again) { if (again) return; const b = S.s.brand; b.aware = clamp((b.aware || 0) + .02 + .01 * d.media.length, 0, .95); S.s.organic.social += 6 * d.media.length; },
});

/* ═════════ Відгуки й репутація (необов'язкова) ═════════ */
const REVIEWS = [
  { who: 'Оксана, мама учня', stars: 5, text: 'Дуже зручно! Дитина нарешті розуміє математику без сліз. Дякую!', a: [['Дякуємо! Радіємо, що допомагаємо. Якщо будуть ідеї — пишіть.', 2], ['Спасибі.', 0], ['Купуйте річну підписку зі знижкою!', 0]] },
  { who: 'Андрій', stars: 3, text: 'Нормально, але інколи довго вантажиться, а підказки не завжди зрозумілі.', a: [['Дякуємо за чесний відгук. Прискорюємо завантаження й переписуємо підказки; напишіть, які були незрозумілі, будь ласка.', 2], ['Ви просто не розібралися.', 0], ['Ми в курсі.', 1]] },
  { who: 'Марина', stars: 1, text: 'Списали гроші, а доступу нема! Шахраї!', a: [['Прикро чути! Напишіть нам номер замовлення: розберемося сьогодні й повернемо гроші, якщо проблема на нашому боці.', 2], ['Ніхто вас не обманював, перевірте картку.', 0], ['Видалити відгук.', 0]] },
  { who: 'Користувач567', stars: 5, text: 'Супер! Купуйте крипту тут: bit.ly/xxx', a: [['Позначити як спам і повідомити модераторів.', 2], ['Відповісти «дякуємо».', 0], ['Нічого не робити.', 1]] },
];
reg({
  id: 'reviews', stage: 2, opt: true, t: 'Відгуки й репутація', d: 'Відповідайте на чотири відгуки так, щоб зберегти довіру.', icon: 'heart', min: 8,
  intro: `Відгуки — це публічне обличчя бренду. Кожна відповідь бачить не лише автор, а й майбутні клієнти. Оберіть відповідь на кожен відгук і подивіться, як це вплине на репутацію.`,
  data: () => ({ r: {} }),
  view(S, d) {
    const total = sumOf(REVIEWS.map((x, i) => (d.r[i] != null ? x.a[d.r[i]][1] : 0)));
    return `${REVIEWS.map((x, i) => `<article class="xbox rev"><header><span class="pav sm" style="--h:${hash(x.who) % 360}">${esc(x.who[0])}</span><h3>${esc(x.who)}</h3><span class="stars">${Array.from({ length: 5 }, (_, k) => `<i class="${k < x.stars ? 'on' : ''}"></i>`).join('')}</span></header><p>«${esc(x.text)}»</p><div class="xg">${x.a.map(([t, sc], k) => `<div class="chcard ${d.r[i] === k ? 'on' : ''}">${xp('reviews', `r.${i}`, k, esc(t), d.r[i] === k, { t: 'n', cls: 'card' })}${d.r[i] === k ? `<small class="xtag ${sc === 2 ? 'ok' : sc === 1 ? 'warn' : 'bad'}">${sc === 2 ? 'Відмінно: емпатія й конкретика' : sc === 1 ? 'Прийнятно, але можна краще' : 'Ризиковано: зіпсує довіру'}</small>` : ''}</div>`).join('')}</div></article>`).join('')}
    ${Object.keys(d.r).length === REVIEWS.length ? tip(`Індекс репутації: ${total} з ${REVIEWS.length * 2}. ${total >= 7 ? 'Ви відповідаєте так, що довіра зростає.' : 'Спробуйте відповідати конкретніше й без виправдань.'}`, total >= 7 ? 'ok' : 'warn') : ''}`;
  },
  ready(S, d) { const n = Object.keys(d.r).length; if (n < REVIEWS.length) return { ok: false, msg: `Відповідайте на всі відгуки: лишилось ${REVIEWS.length - n}` }; const t = sumOf(REVIEWS.map((x, i) => x.a[d.r[i]][1])); return { ok: true, stars: t >= 8 ? 3 : t >= 6 ? 2 : 1 }; },
});
