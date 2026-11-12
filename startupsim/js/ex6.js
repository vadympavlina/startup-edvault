// Симулятор стартапу · вправи етапу 8 «Фриланс»: біржі, резюме, пошук замовника й спілкування, оформлення ФОП.
import { esc, term } from './ui.js';
import { icon } from './icons.js';
import { reg, xb, xp, xin, xsl, xnum, xcol, tip, box, checks, bar, mk, hash, clamp, sumOf, pc, money0, quiz, quizOk, quizDone } from './ex-core.js';

const len = s => String(s || '').trim().length;

/* ═════════ Біржі фрилансу ═════════ */
const PLAT = [
  { k: 'global', t: 'Велика міжнародна біржа', fee: .2, esc: true, comp: 5, rate: 1.5, wk: 3, req: 'Англійська та портфоліо', note: 'Багато замовлень, високі ставки, але величезна конкуренція. Комісія велика.' },
  { k: 'ua', t: 'Українська біржа фрилансу', fee: .1, esc: true, comp: 3, rate: 1, wk: 2, req: 'Портфоліо', note: 'Українською, нижчі ставки, менше конкуренції. Є безпечна угода.' },
  { k: 'social', t: 'Соцмережі й Telegram-канали', fee: 0, esc: false, comp: 3, rate: .9, wk: 1, req: 'Лише ваш профіль', note: 'Швидко знайти першу роботу, але ніхто не захищає ваші гроші.' },
  { k: 'direct', t: 'Прямі замовники (знайомі, рекомендації)', fee: 0, esc: false, comp: 1, rate: 1.2, wk: 4, req: 'Репутація', note: 'Найкращі ставки й довіра, але потрібна мережа знайомств і час.' },
  { k: 'market', t: 'Маркетплейс готових послуг', fee: .2, esc: true, comp: 4, rate: .8, wk: 3, req: 'Чітко описана послуга', note: 'Продаєте пакет «під ключ», клієнти самі вас знаходять. Потрібна якісна картка.' },
];
const SCAM = [
  ['Замовник просить спершу виконати «тестове завдання» на повну роботу безкоштовно й пропадає.', 1, 'Безкоштовна «пробна» повна робота — типовий спосіб отримати результат без оплати.'],
  ['Замовник пропонує оплату через безпечну угоду біржі, ТЗ чітке, є відгуки про нього.', 0, 'Це добрі ознаки: гроші захищені, умови зрозумілі.'],
  ['«Заробіток 2000 ₴ за годину без досвіду, потрібно лише внести страховий внесок 500 ₴».', 1, 'Просять гроші наперед за легкий заробіток: класичне шахрайство.'],
  ['Замовник наполягає перейти в особистий месенджер і платити «поза біржею», щоб зекономити комісію.', 1, 'Поза біржею ви втрачаєте захист. Частина шахраїв так і діє.'],
  ['Замовник просить скан паспорта й фото банківської картки «для оформлення».', 1, 'Ці дані потрібні лише біржі, а не замовнику. Небезпечно.'],
  ['Замовник просить підписати договір, платить 50% передоплати й має рейтинг із відгуками.', 0, 'Договір і передоплата від перевіреного замовника — нормальна практика.'],
];
reg({
  id: 'exchanges', stage: 7, t: 'Біржі фрилансу', d: 'Порівняйте місця пошуку замовлень і знайдіть шахраїв.', icon: 'laptop', min: 15,
  intro: `${term('Біржа фрилансу', 'Біржа фрилансу')} — майданчик, де замовники шукають виконавців. У кожного майданчика своя комісія, конкуренція й захист ваших грошей. Порівняйте їх, оберіть, з чого почати, і потренуйтеся розпізнавати шахраїв.`,
  data: S => ({ eng: false, port: false, pick: '', why: '', order: 10000, sc: {} }),
  view(S, d) {
    const sc = p => clamp(5 - p.comp * .6 + (p.esc ? 1 : 0) + (p.req.includes('Англійська') && !d.eng ? -3 : 0) + (p.req.includes('Портфоліо') && !d.port ? -2 : 0) + (p.k === 'social' ? 1 : 0) + (p.fee === 0 ? .5 : 0), 0, 8);
    return `${box('Ваш профіль', `<div class="xrow"><label class="switch"><input type="checkbox" data-exi="exchanges" data-p="eng" ${d.eng ? 'checked' : ''}><span></span>Читаю й пишу англійською</label><label class="switch"><input type="checkbox" data-exi="exchanges" data-p="port" ${d.port ? 'checked' : ''}><span></span>Є портфоліо</label></div>${xsl('exchanges', 'order', d, { min: 1000, max: 50000, step: 500, label: 'Приклад замовлення', u: ' ₴' })}`, { ic: 'user' })}
    ${box('Порівняння майданчиків', `<div class="xg c2">${PLAT.map(p => `<article class="srcard ${d.pick === p.k ? 'on' : ''}" style="--c:#${['6366f1', '0ea5e9', 'f59e0b', '16a34a', 'ec4899'][PLAT.indexOf(p)]}"><header><b>${p.t}</b><span class="xtag ${sc(p) >= 5 ? 'ok' : sc(p) >= 3 ? 'warn' : 'bad'}">підходить: ${Math.round(sc(p) / 8 * 100)}%</span></header><p>${esc(p.note)}</p><div class="rt"><span>Комісія: <b>${p.fee ? pc(p.fee) : 'немає'}</b></span><span>Захист оплати: <b>${p.esc ? 'є' : 'немає'}</b></span><span>Конкуренція ${'●'.repeat(p.comp)}<i style="color:#d3dad8">${'●'.repeat(5 - p.comp)}</i></span><span>Перше замовлення: ≈ ${p.wk} тиж.</span></div><p class="sm">Вам залишиться: <b>${money0(d.order * (1 - p.fee) * p.rate)}</b> із ${money0(d.order * p.rate)}</p><small class="muted">Потрібно: ${esc(p.req)}</small>${xp('exchanges', 'pick', p.k, d.pick === p.k ? 'Починаю тут' : 'Обрати для старту', d.pick === p.k, { cls: 'card' })}</article>`).join('')}</div>${xin('exchanges', 'why', d, { label: 'Чому ви починаєте саме тут?', area: true, rows: 2, max: 240, cls: 'mt', ph: 'Я обираю…, бо…' })}`, { ic: 'compass' })}
    ${box('Шахрай чи ні?', `<p class="sub">Прочитайте пропозиції й позначте, які з них небезпечні.</p>${SCAM.map(([t, bad, why], i) => `<div class="quiz"><b>${esc(t)}</b><div class="xrow">${xp('exchanges', `sc.${i}`, 1, 'Небезпечно', d.sc[i] === 1, { t: 'n', cls: d.sc[i] != null ? (bad === 1 ? 'right' : d.sc[i] === 1 ? 'wrong' : '') : '' })}${xp('exchanges', `sc.${i}`, 0, 'Виглядає нормально', d.sc[i] === 0, { t: 'n', cls: d.sc[i] != null ? (bad === 0 ? 'right' : d.sc[i] === 0 ? 'wrong' : '') : '' })}</div>${d.sc[i] != null ? `<p class="x-tip ${d.sc[i] === bad ? 'ok' : 'warn'}">${icon(d.sc[i] === bad ? 'check' : 'info', 16)}<span>${d.sc[i] === bad ? 'Правильно. ' : 'Не зовсім. '}${esc(why)}</span></p>` : ''}</div>`).join('')}`, { ic: 'shield', side: `правильно ${SCAM.filter(([, b], i) => d.sc[i] === b).length} з ${SCAM.length}` })}`;
  },
  ready(S, d) {
    const ok = SCAM.filter(([, b], i) => d.sc[i] === b).length, n = Object.keys(d.sc).length;
    if (!d.pick) return { ok: false, msg: 'Оберіть майданчик для старту' };
    if (len(d.why) < 20) return { ok: false, msg: 'Поясніть свій вибір' };
    if (n < SCAM.length) return { ok: false, msg: `Позначте всі пропозиції: лишилось ${SCAM.length - n}` };
    if (ok < 5) return { ok: false, msg: 'Забагато помилок: прочитайте пояснення й виправте' };
    return { ok: true, stars: 1 + (ok === SCAM.length ? 1 : 0) + (PLAT.find(p => p.k === d.pick).esc ? 1 : 0) };
  },
});

/* ═════════ Резюме й профіль ═════════ */
const TPL = { classic: 'Класичне', modern: 'Сучасне', mini: 'Мінімалістичне' };
reg({
  id: 'resume', stage: 7, cols: true, t: 'Резюме й профіль', d: 'Складіть резюме й побачте його в трьох шаблонах.', icon: 'pen', min: 20,
  intro: `${term('Резюме', 'Резюме')} продає вас замовнику за десять секунд. Пишіть коротко й з цифрами: не «досвідчений», а «зроблено 12 сайтів». Заповніть розділи, оберіть шаблон і перегляньте результат. Готове резюме можна роздрукувати.`,
  data: S => ({ name: S.s.founder.name, title: '', about: '', skills: [], sk: '', exp: [], port: [], mail: '', tg: '', tpl: 'classic', ac: S.s.company.color, photo: true }),
  view(S, d) {
    const SKR = 'додати навичку';
    return `
      ${box('Про вас', `<div class="xg c2">${xin('resume', 'name', d, { label: 'Ім’я та прізвище', max: 40 })}${xin('resume', 'title', d, { label: 'Хто ви (посада)', max: 50, ph: 'Дизайнер інтерфейсів' })}</div>${xin('resume', 'about', d, { label: 'Коротко про себе', area: true, rows: 3, max: 300, cls: 'mt', ph: 'Створюю прості інтерфейси для шкільних застосунків. За рік — 5 проєктів…' })}<div class="xg c2 mt">${xin('resume', 'mail', d, { label: 'Пошта', max: 40, ph: 'name@example.com' })}${xin('resume', 'tg', d, { label: 'Telegram', max: 30, ph: '@nickname' })}</div>`, { ic: 'user' })}
      ${box('Навички', `<div class="xrow">${d.skills.map((s, i) => `<span class="xtag ok sk">${esc(s.t)} ${'●'.repeat(s.l)}${'○'.repeat(5 - s.l)} ${xb('resume', 'skUp', '', { i, ic: 'plus', cls: 'ib', title: 'Рівень вище' })}${xb('resume', 'del', '', { p: 'skills', i, ic: 'x', cls: 'ib', title: 'Прибрати' })}</span>`).join('') || '<small class="muted">Додайте 3–6 навичок</small>'}</div><div class="xadd mt"><input class="inp" id="rs-sk" maxlength="120" placeholder="Наприклад: Figma">${xb('resume', 'addSk', 'Додати', { ic: 'plus' })}</div>`, { ic: 'bolt' })}
      ${box('Досвід і результати', `${d.exp.map((e, i) => `<div class="xitem" style="align-items:flex-start"><div style="flex:1">${xin('resume', `exp.${i}.t`, d, { max: 60, ph: 'Що робили й де' })}${xin('resume', `exp.${i}.r`, d, { max: 90, ph: 'Результат із цифрою: «продажі виросли на 20%»', cls: 'mt' })}</div>${xb('resume', 'del', '', { p: 'exp', i, ic: 'trash', cls: 'ib', title: 'Прибрати' })}</div>`).join('')}${d.exp.length < 4 ? xb('resume', 'addExp', 'Додати досвід', { ic: 'plus', cls: 'mt' }) : ''}`, { ic: 'building' })}
      ${box('Портфоліо', `${d.port.map((e, i) => `<div class="xitem"><div style="flex:1">${xin('resume', `port.${i}`, d, { max: 100, ph: 'Назва проєкту — що це і посилання' })}</div>${xb('resume', 'del', '', { p: 'port', i, ic: 'trash', cls: 'ib', title: 'Прибрати' })}</div>`).join('')}${d.port.length < 4 ? xb('resume', 'addPort', 'Додати проєкт', { ic: 'plus', cls: 'mt' }) : ''}`, { ic: 'box' })}
      ${box('Вигляд', `<div class="xrow">${Object.entries(TPL).map(([k, t]) => xp('resume', 'tpl', k, t, d.tpl === k)).join('')}${xcol('resume', 'ac', d, { label: 'Колір' })}<label class="switch"><input type="checkbox" data-exi="resume" data-p="photo" ${d.photo ? 'checked' : ''}><span></span>Аватар</label></div>`, { ic: 'palette' })}
    `;
  },
  live(S, d) {
    const ck = [[len(d.about) >= 60 && len(d.about) <= 300, 'Про себе: 60–300 символів', 'Коротко, але змістовно'], [/\d/.test(d.about + d.exp.map(e => e.r).join(' ')), 'Є цифри й результати'], [d.skills.length >= 3, 'Хоча б три навички'], [d.exp.some(e => len(e.t) > 3 && len(e.r) > 5), 'Є досвід із результатом'], [d.port.filter(len).length >= 1, 'Є хоча б один проєкт у портфоліо'], [len(d.mail) > 4 || len(d.tg) > 2, 'Є контакти']];
    return `<div class="cvw"><article class="cv tpl-${d.tpl}" style="--ac:${d.ac}"><header>${d.photo ? `<span class="cvp">${esc((d.name || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase())}</span>` : ''}<div><h2>${esc(d.name || 'Ім’я та прізвище')}</h2><p>${esc(d.title || 'Посада')}</p></div></header>
      ${d.about ? `<section><h4>Про мене</h4><p>${esc(d.about)}</p></section>` : ''}${d.skills.length ? `<section><h4>Навички</h4><div class="cvs">${d.skills.map(s => `<span>${esc(s.t)}<i>${'●'.repeat(s.l)}</i></span>`).join('')}</div></section>` : ''}
      ${d.exp.some(e => len(e.t)) ? `<section><h4>Досвід</h4>${d.exp.filter(e => len(e.t)).map(e => `<p><b>${esc(e.t)}</b>${e.r ? `<br>${esc(e.r)}` : ''}</p>`).join('')}</section>` : ''}${d.port.some(len) ? `<section><h4>Портфоліо</h4><ul>${d.port.filter(len).map(p => `<li>${esc(p)}</li>`).join('')}</ul></section>` : ''}
      ${len(d.mail) || len(d.tg) ? `<footer>${esc(d.mail)} ${d.tg ? ' · ' + esc(d.tg) : ''}</footer>` : ''}</article>${box('Чек-лист', checks(ck.map(x => [x[0], x[1], x[2]])), { ic: 'check' })}<div class="xrow no-print"><button type="button" class="btn" onclick="window.print()">${icon('printer', 16)} Надрукувати / зберегти PDF</button></div></div>`;
  },
  acts: {
    addSk(S, d) { const el = document.getElementById('rs-sk'), v = (el?.value || '').trim(); if (!v) { el?.focus(); return false; } if (d.skills.length < 8 && !d.skills.some(s => s.t === v)) d.skills.push({ t: v, l: 3 }); },
    skUp(S, d, el) { const s = d.skills[+el.dataset.i]; s.l = s.l >= 5 ? 1 : s.l + 1; },
    addExp(S, d) { d.exp.push({ t: '', r: '' }); }, addPort(S, d) { d.port.push(''); },
  },
  ready(S, d) {
    const about = len(d.about) >= 60, sk = d.skills.length >= 3, ex = d.exp.some(e => len(e.t) > 3 && len(e.r) > 5), ct = len(d.mail) > 4 || len(d.tg) > 2;
    if (len(d.name) < 3 || len(d.title) < 3) return { ok: false, msg: 'Впишіть ім’я й посаду' };
    if (!about) return { ok: false, msg: 'Напишіть про себе хоча б 60 символів' };
    if (!sk) return { ok: false, msg: 'Додайте хоча б три навички' };
    if (!ex) return { ok: false, msg: 'Додайте досвід із результатом' };
    if (!ct) return { ok: false, msg: 'Додайте контакти' };
    return { ok: true, stars: 1 + (d.port.filter(len).length >= 1 ? 1 : 0) + (/\d/.test(d.about + d.exp.map(e => e.r).join(' ')) ? 1 : 0) };
  },
});

/* ═════════ Пошук замовника ═════════ */
const JOBS = [
  { t: 'Сайт-візитка для кав’ярні «Ранок»', who: 'Олена', d: 'Потрібен простий сайт із меню, фото та картою. Бюджет до 8 000 ₴, термін — два тижні.', kw: ['меню', 'фото', 'карт', 'ранок'] },
  { t: 'Логотип для школи танців', who: 'Богдан', d: 'Шукаємо дизайнера для логотипа й кольорів. Нам 3 місяці, стиль сучасний. Бюджет 5 000 ₴.', kw: ['логотип', 'танц', 'сучасн', 'кольор'] },
  { t: 'Тексти для сторінок інтернет-магазину', who: 'Марина', d: 'Потрібно написати описи 30 товарів (посуд) українською. Можна частинами. Бюджет — 4 500 ₴.', kw: ['опис', 'товар', 'посуд', '30'] },
];
const DLG = [
  { c: 'Може, зробите те саме, але ще й три додаткові сторінки? У межах тих самих грошей.', o: [['Із задоволенням додам, але це збільшить вартість: пропоную окремий пакет за N ₴ і +3 дні.', 2, 'Ви чітко проговорили межі робіт.'], ['Добре, зроблю без доплати.', 0, 'Так ви привчаєте клієнта до безкоштовних доробок.'], ['Ні, це не входить.', 1, 'Межу ви окреслили, але без альтернативи клієнт може піти.']] },
  { c: 'Мені дорого. Давайте за половину ціни, а потім ще замовлю багато.', o: [['Знижка можлива, якщо зменшимо обсяг роботи. Ось варіанти за вашим бюджетом.', 2, 'Знижка в обмін на обсяг — чесна домовленість.'], ['Добре, за половину.', 0, '«Потім замовлю багато» рідко збувається. Ви працюєте в збиток.'], ['Тоді шукайте іншого виконавця.', 1, 'Різко. Можна було запропонувати спрощений варіант.']] },
  { c: 'Роботу прийнято, а оплату зроблю через місяць: зараз немає коштів.', o: [['Умови були: оплата після прийняття. Рахунок надсилаю сьогодні, термін — до 3 днів. Розділімо платіж на частини, якщо треба.', 2, 'Чітко, ввічливо, з варіантом.'], ['Нічого, почекаю.', 0, 'Ризик, що оплата не прийде зовсім.'], ['Тоді видаліть мою роботу зі свого сайту!', 1, 'Захищає права, але образить клієнта й не поверне гроші.']] },
];
const propScore = (job, t) => { const x = String(t || ''), low = x.toLowerCase(), parts = [[len(x) >= 150 && len(x) <= 700, 'Довжина 150–700 символів', 'Занадто коротко чи задовго'], [job.kw.filter(k => low.includes(k)).length >= 2, 'Згадуєте деталі завдання (замовник бачить, що ви читали)', 'Використайте слова з опису завдання'], [/\d+\s?(₴|грн|днів|дні|тиж|дн)/i.test(x) || /\d{3,}/.test(x), 'Названо ціну чи термін', 'Скажіть, скільки й за який час'], [x.includes('?'), 'Є уточнювальне питання', 'Поставте питання про завдання'], [/(досвід|робив|робила|зробив|зробила|портфоліо|створив|створила)/i.test(x), 'Є коротко про ваш релевантний досвід', 'Згадайте схожу роботу']]; return { parts, score: Math.round(parts.filter(p => p[0]).length / parts.length * 100) }; };
reg({
  id: 'client', stage: 7, t: 'Пошук замовника й спілкування', d: 'Напишіть відгук на вакансію й пройдіть три складні розмови.', icon: 'mic', min: 18,
  intro: `Замовник отримує десятки відгуків і читає кожен кілька секунд. Виграє той, хто показав, що вник у завдання, назвав ціну й термін та поставив питання. Потім починається спілкування: тут важливо тримати межі й залишатися ввічливим. Спробуйте обидва кроки.`,
  data: () => ({ job: 0, txt: ['', '', ''], dlg: {} }),
  view(S, d) {
    const J = JOBS[d.job], pr = propScore(J, d.txt[d.job]);
    return `${box('1. Оберіть замовлення', `<div class="xg c3">${JOBS.map((j, i) => `<div class="chcard ${d.job === i ? 'on' : ''}">${xp('client', 'job', i, esc(j.t), d.job === i, { t: 'n', cls: 'card' })}<small>${esc(j.who)}</small><p>${esc(j.d)}</p></div>`).join('')}</div>`, { ic: 'search' })}
    ${box('2. Ваш відгук', `${xin('client', `txt.${d.job}`, d, { label: `Повідомлення замовнику (${J.who})`, area: true, rows: 7, max: 900, ph: `Добрий день, ${J.who}!…` })}`, { ic: 'pen' })}
    `;
  },
  live(S, d) {
    const J = JOBS[d.job], pr = propScore(J, d.txt[d.job]);
    return `${box('Перевірка відгуку', `<div class="uscore"><b>${pr.score}</b><span>з 100</span></div>${checks(pr.parts.map(p => [p[0], p[1], p[2]]))}`, { ic: 'check' })}
    ${box('3. Складні розмови', DLG.map((x, i) => `<div class="quiz"><b>Замовник: «${esc(x.c)}»</b><div class="xg">${x.o.map(([t, sc, why], k) => `<div class="chcard ${d.dlg[i] === k ? 'on' : ''}">${xp('client', `dlg.${i}`, k, esc(t), d.dlg[i] === k, { t: 'n', cls: 'card' })}${d.dlg[i] === k ? `<small class="xtag ${sc === 2 ? 'ok' : sc === 1 ? 'warn' : 'bad'}">${esc(why)}</small>` : ''}</div>`).join('')}</div></div>`).join(''), { ic: 'users' })}`;
  },
  ready(S, d) {
    const best = Math.max(...JOBS.map((j, i) => propScore(j, d.txt[i]).score)), n = Object.keys(d.dlg).length, pts = sumOf(DLG.map((x, i) => (d.dlg[i] != null ? x.o[d.dlg[i]][1] : 0)));
    if (best < 60) return { ok: false, msg: 'Відгук поки що слабкий: досягніть хоча б 60 балів у чек-листі' };
    if (n < DLG.length) return { ok: false, msg: `Дайте відповідь у всіх розмовах: лишилось ${DLG.length - n}` };
    if (pts < 4) return { ok: false, msg: 'Розмови дали замало балів: перечитайте пояснення й спробуйте інші відповіді' };
    return { ok: true, stars: 1 + (best >= 80 ? 1 : 0) + (pts >= 6 ? 1 : 0) };
  },
});

/* ═════════ Оформлення ФОП ═════════ */
const STEPS = ['Обрати вид діяльності (код КВЕД)', 'Подати заяву на реєстрацію ФОП (онлайн чи в ЦНАП)', 'Обрати групу й систему оподаткування', 'Відкрити рахунок для підприємницької діяльності', 'Сплачувати єдиний податок і єдиний соціальний внесок', 'Подавати звітність у строк'];
const FQ = [{ q: 'Скільки в грі ФОП платить податку з виручки?', a: ['5% від виручки', '18% з прибутку', '0%'], ok: 0, why: 'У симуляторі ФОП платить 5% від виручки й 1 300 ₴ на місяць; реальні ставки залежать від групи й закону.' }, { q: 'Коли вигідніше ТОВ?', a: ['Коли мало клієнтів', 'Коли потрібні інвестиції за частку й великий оборот', 'Ніколи'], ok: 1, why: 'Інвестор отримує частку в ТОВ, а не в ФОП. ТОВ — окрема юридична особа.' }];
reg({
  id: 'fop', stage: 7, t: 'Оформлення ФОП', d: 'Оберіть форму, пройдіть кроки реєстрації й порахуйте податки.', icon: 'building', min: 18,
  intro: `Щоб працювати офіційно й отримувати гроші на рахунок, потрібна ${term('ФОП і ТОВ', 'форма: ФОП або ТОВ')}. ФОП простіший і дешевший, ТОВ потрібне для інвестицій. Оберіть форму, розташуйте кроки реєстрації в правильному порядку й порахуйте податки. Цифри в грі навчальні: актуальні ставки перевіряйте на сайті податкової.`,
  data: S => ({ inc: 60000, team: 0, invest: false, form: '', ord: [], err: 0, seed: 5, q: {} }),
  view(S, d) {
    const r = mk(d.seed), shuf = STEPS.map((t, i) => ({ t, i, k: r.next() })).sort((a, b) => a.k - b.k);
    const fop = { tax: d.inc * .05, fixed: 1300, reg: 0 }, tov = { tax: Math.max(0, (d.inc - d.team * 20000 - 6000)) * .18, fixed: 6000, reg: 12000 };
    return `${box('Яка форма вам підходить?', `<div class="xg c2">${xsl('fop', 'inc', d, { min: 10000, max: 500000, step: 5000, label: 'Очікувана виручка на місяць', u: ' ₴' })}${xsl('fop', 'team', d, { min: 0, max: 10, step: 1, label: 'Скільки співробітників на зарплаті', u: '' })}</div><label class="switch mt"><input type="checkbox" data-exi="fop" data-p="invest" ${d.invest ? 'checked' : ''}><span></span>Плануємо залучати інвестиції за частку</label>
      <div class="xg c2 mt"><div class="srcard ${d.form === 'fop' ? 'on' : ''}" style="--c:#16a34a"><header><b>ФОП</b></header><p>Податок: <b>${money0(fop.tax)}</b> + ${money0(fop.fixed)} щомісяця.</p><small>Реєстрація безкоштовна. Інвестор не може отримати частку.</small>${xp('fop', 'form', 'fop', d.form === 'fop' ? 'Обираю ФОП' : 'Обрати ФОП', d.form === 'fop', { cls: 'card' })}</div>
        <div class="srcard ${d.form === 'tov' ? 'on' : ''}" style="--c:#6366f1"><header><b>ТОВ</b></header><p>Податок: <b>${money0(tov.tax)}</b> + бухгалтер ${money0(tov.fixed)} щомісяця.</p><small>Реєстрація ${money0(tov.reg)}. Підходить для інвестицій.</small>${xp('fop', 'form', 'tov', d.form === 'tov' ? 'Обираю ТОВ' : 'Обрати ТОВ', d.form === 'tov', { cls: 'card' })}</div></div>
      ${d.invest && d.form === 'fop' ? tip('Ви плануєте інвестиції, а ФОП не дає частки інвестору. Подумайте про ТОВ.', 'warn') : ''}${!d.invest && d.inc < 80000 && d.form === 'tov' ? tip('Для невеликої виручки ТОВ дорожче: бухгалтер і реєстрація «з’їдять» гроші. ФОП може бути вигіднішим.', 'warn') : ''}`, { ic: 'building' })}
    ${box('Кроки реєстрації: клікайте в правильному порядку', `<p class="sub">Покроково: що робити першим, що другим… Клікайте по кроках. Помилилися — крок не додається.</p><div class="xrow ord">${d.ord.map((i, n) => `<span class="xtag ok">${n + 1}. ${esc(STEPS[i])}</span>`).join('')}</div>
      <div class="xrow mt">${shuf.filter(x => !d.ord.includes(x.i)).map(x => xb('fop', 'step', esc(x.t), { a: x.i, cls: 'sm' })).join('')}</div>${d.ord.length === STEPS.length ? tip('Усі кроки в правильному порядку. Помилок: ' + d.err, 'ok') : d.err ? `<p class="sm muted">Помилок: ${d.err}</p>` : ''}${d.ord.length ? xb('fop', 'resetOrd', 'Почати спочатку', { cls: 'sm ghost mt', ic: 'refresh' }) : ''}`, { ic: 'check', side: `${d.ord.length} з ${STEPS.length}` })}
    ${box('Перевірте себе', quiz('fop', 'q', d, FQ), { ic: 'bulb' })}
    <div class="xrow mt">${xb('fop', 'toGame', S.s.company.form === 'none' ? 'Зареєструвати компанію в грі' : 'Відкрити «Фінанси»', { ic: 'right' })}</div>`;
  },
  acts: {
    step(S, d, el, C) { const i = +el.dataset.a; if (i === d.ord.length) d.ord.push(i); else { d.err++; C.toast('Ні, це має бути іншим кроком', 'bad'); } },
    resetOrd(S, d) { d.ord = []; d.err = 0; d.seed++; },
    toGame(S, d, el, C) { C.go('finance'); if (S.s.company.form === 'none') C.flash('[data-act="register"]'); return false; },
  },
  ready(S, d) {
    if (!d.form) return { ok: false, msg: 'Оберіть форму: ФОП чи ТОВ' };
    if (d.ord.length < STEPS.length) return { ok: false, msg: 'Розташуйте всі кроки реєстрації в правильному порядку' };
    if (quizDone(d, 'q', FQ) < FQ.length) return { ok: false, msg: 'Дайте відповідь на запитання' };
    const q = quizOk(d, 'q', FQ), good = (d.invest ? d.form === 'tov' : d.inc < 80000 ? d.form === 'fop' : true);
    return { ok: true, stars: 1 + (good ? 1 : 0) + (d.err <= 1 && q === FQ.length ? 1 : 0) };
  },
});
