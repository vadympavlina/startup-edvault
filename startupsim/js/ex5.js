// Симулятор стартапу · вправи етапу 7 «Команда»: стилі лідерства, ролі, Agile/Scrum/Kanban, наймання, дистанційна робота.
import { ROLES } from './data.js';
import { esc, term, wideChart } from './ui.js';
import { icon } from './icons.js';
import { stars, reg, xb, xp, xin, xsl, tip, box, checks, bar, radar, mk, hash, clamp, sumOf, pc, money0, quiz, quizOk, quizDone } from './ex-core.js';

const len = s => String(s || '').trim().length;

/* ═════════ Стилі лідерства ═════════ */
const ST = { a: ['Авторитарний', 'Ви ухвалюєте рішення самі й дієте швидко.', 'Працює в кризі й коли команда недосвідчена. Але гасить ініціативу.'], d: ['Демократичний', 'Ви радитеся з командою й вирішуєте разом.', 'Працює, коли час є, а рішення важливе для всіх. Але повільніше.'], l: ['Ліберальний', 'Ви даєте повну свободу й не втручаєтеся.', 'Працює з досвідченими й самостійними. Новачкам бракує орієнтирів.'], c: ['Коучинг', 'Ви ставите питання й допомагаєте людині знайти рішення.', 'Працює на розвиток людей. Потребує часу й терпіння.'] };
const SIT = [
  ['До релізу — день, а двоє колег сперечаються, як краще зробити. Що ви зробите?', [['a', 'Скажу, як робити, і наполягу на виконанні.'], ['d', 'Зберу обох, вислухаю й оберемо разом.'], ['l', 'Нехай домовляються самі.'], ['c', 'Спитаю кожного, яка в них мета, і допоможу знайти спільне.']]],
  ['Новачок не справляється із завданням і мовчить про це.', [['a', 'Розпишу кроки й перевірятиму щодня.'], ['d', 'Обговоримо на зустрічі, як допомогти.'], ['l', 'Дам йому час: сам розбереться.'], ['c', 'Сяду разом і спитаю, що саме незрозуміло.']]],
  ['Досвідчена дизайнерка просить свободу вибирати, як виконати завдання.', [['l', 'Дам їй свободу: результат важливіший за процес.'], ['a', 'Усе має бути за моїм шаблоном.'], ['d', 'Обговоримо підхід і домовимося.'], ['c', 'Запитаю про її бачення й допоможу перевірити ідею.']]],
  ['Команда пропонує змінити продукт, а ви не згодні.', [['d', 'Поставлю на обговорення й проголосуємо.'], ['a', 'Рішення моє: не змінюємо.'], ['l', 'Нехай робить, як вважає за краще.'], ['c', 'Попрошу довести ідею цифрами й подивимося разом.']]],
  ['Колега регулярно запізнюється на зустрічі.', [['a', 'Скажу чітко: це неприйнятно, є наслідки.'], ['c', 'Спитаю, що заважає, і шукатимемо рішення.'], ['d', 'Спитаю команду, які правила зустрічей нам потрібні.'], ['l', 'Не втручатимусь: це дрібниця.']]],
  ['Потрібно обрати назву нової функції. Часу вдосталь.', [['d', 'Збираю ідеї від усіх і голосуємо.'], ['a', 'Обираю сам.'], ['l', 'Нехай хтось обере без мене.'], ['c', 'Прошу кожного обґрунтувати свій варіант.']]],
  ['Після релізу клієнти скаржаться на помилку.', [['a', 'Беру керування на себе: розподіляю, хто що виправляє.'], ['d', 'Швидко збираю команду на обговорення.'], ['c', 'Разом розбираємо, чому так сталося й як уникнути.'], ['l', 'Команда знає, що робити: нехай виправляє.']]],
  ['Команда демотивована після невдалого запуску.', [['c', 'Спитаю кожного, що вони відчувають і чого потребують.'], ['a', 'Поставлю нові чіткі завдання й дедлайни.'], ['d', 'Проведемо відкриту зустріч-розбір.'], ['l', 'Дам їм перепочити й не лізтиму.']]],
];
reg({
  id: 'leadership', stage: 6, t: 'Ваш стиль лідерства', d: 'Відповідайте на 8 ситуацій і дізнайтеся свій стиль.', icon: 'user', min: 10,
  intro: `${term('Стилі лідерства', 'Стилі керівництва')} — це способи вести команду: <b>авторитарний</b>, <b>демократичний</b>, <b>ліберальний</b> і <b>коучинг</b>. Немає найкращого: добрий керівник змінює стиль залежно від ситуації. Дайте відповідь у вісьмох ситуаціях, і ми покажемо ваш профіль.`,
  data: () => ({ a: {}, mine: '', rule: '' }),
  view(S, d) {
    return SIT.map(([q, opts], i) => `<div class="xbox"><header><span class="xtag">${i + 1} з ${SIT.length}</span><h3>${esc(q)}</h3></header><div class="xg c2">${opts.map(([k, t], j) => xp('leadership', `a.${i}`, j, esc(t), d.a[i] === j, { t: 'n', cls: 'card' })).join('')}</div></div>`).join('');
  },
  live(S, d) {
    const cnt = { a: 0, d: 0, l: 0, c: 0 }; SIT.forEach(([, o], i) => { if (d.a[i] != null) cnt[o[d.a[i]][0]]++; });
    const n = sumOf(Object.values(cnt)), top = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
    if (n < SIT.length) return `<p class="sm muted">Відповідайте далі: лишилось ${SIT.length - n}.</p>`;
    return `${box('Ваш профіль', `<div class="srcsum">${radar(['a', 'd', 'l', 'c'].map(k => cnt[k]), ['Авторитарний', 'Демократичний', 'Ліберальний', 'Коучинг'], { max: Math.max(4, ...Object.values(cnt)), size: 280 })}<div class="srcl">${Object.entries(ST).map(([k, s]) => `<div class="stl ${k === top[0] ? 'top' : ''}"><b>${s[0]}: ${cnt[k]}</b><p>${s[1]}</p><small>${s[2]}</small></div>`).join('')}</div></div>
      ${tip(`Ваш провідний стиль — <b>${ST[top[0]][0].toLowerCase()}</b>. Це сильна сторона, але в деяких ситуаціях його варто змінювати.`, 'ok')}
      <div class="xrow mt"><span class="xf-l">Який стиль вам хочеться розвивати?</span>${Object.entries(ST).map(([k, s]) => xp('leadership', 'mine', k, s[0], d.mine === k)).join('')}</div>
      ${xin('leadership', 'rule', d, { label: 'Одне правило керівника для вашої команди', area: true, rows: 2, max: 200, ph: 'Наприклад: «У кризі рішення приймаю я, у спокійний час радимося всі»', cls: 'mt' })}`, { ic: 'chart' })}`;
  },
  ready(S, d) {
    const n = Object.keys(d.a).length;
    if (n < SIT.length) return { ok: false, msg: `Відповідайте на всі ситуації: лишилось ${SIT.length - n}` };
    if (!d.mine) return { ok: false, msg: 'Оберіть стиль, який хочете розвивати' };
    if (len(d.rule) < 20) return { ok: false, msg: 'Напишіть правило для команди' };
    const kinds = new Set(SIT.map(([, o], i) => o[d.a[i]][0]));
    return { ok: true, stars: 1 + (kinds.size >= 3 ? 1 : 0) + (len(d.rule) >= 60 ? 1 : 0) };
  },
});

/* ═════════ Ролі в команді ═════════ */
const TASKS7 = [['Писати код і виправляти помилки', 'dev'], ['Малювати інтерфейс і логотип', 'design'], ['Вести соцмережі й писати статті', 'mkt'], ['Шукати й закривати угоди', 'sales'], ['Відповідати клієнтам у чаті', 'support'], ['Рахувати гроші й вести облік', 'me'], ['Говорити з інвесторами', 'me'], ['Проводити інтерв’ю з клієнтами', 'me']];
const OWNERS = [['me', 'Я сам(а)'], ...Object.entries(ROLES).map(([k, r]) => [k, r.t]), ['no', 'Нікому']];
reg({
  id: 'roles', stage: 6, t: 'Ролі в команді', d: 'Розподіліть справи між ролями й виберіть, кого наймати першим.', icon: 'users', min: 12,
  intro: `У команди є <b>ролі</b>: хто що вміє й за що відповідає. Розподіліть справи компанії між людьми: побачите, чим перевантажений засновник і які справи залишилися без власника. Потім вирішіть, кого наймати першим.`,
  data: () => ({ own: {}, first: [], why: '' }),
  view(S, d) {
    return `${box('Хто за що відповідає?', `<div class="xlist">${TASKS7.map(([t], i) => `<div class="xitem rl"><span>${esc(t)}</span><div class="xrow">${OWNERS.map(([k, n]) => xp('roles', `own.${i}`, k, n, d.own[i] === k)).join('')}</div></div>`).join('')}</div>`, { ic: 'users', side: `розподілено ${Object.keys(d.own).length} з ${TASKS7.length}` })}`;
  },
  live(S, d) {
    const cnt = {}; Object.values(d.own).forEach(k => { cnt[k] = (cnt[k] || 0) + 1; });
    const done = Object.keys(d.own).length === TASKS7.length, me = cnt.me || 0, nob = cnt.no || 0;
    if (!done) return '';
    const skill = S.s.founder.bg;
    return `${box('Аналіз', `${checks([[me <= 4, `Засновник бере на себе не більше чотирьох справ (зараз ${me})`, 'Засновник перевантажений: так легко вигоріти'], [nob === 0, 'Усі справи мають власника', `Справ без власника: ${nob}`], [Object.keys(cnt).filter(k => k !== 'me' && k !== 'no').length >= 1, 'Хоча б частину справ віддано ролям, а не лише вам']])}
      <p class="sm muted">Ваш досвід: <b>${esc(S.s.founder.bg === 'dev' ? 'розробник' : S.s.founder.bg === 'design' ? 'дизайнер' : S.s.founder.bg === 'mkt' ? 'маркетолог' : 'продавець')}</b>. Те, чого ви не вмієте, варто віддавати людям, які в цьому сильніші.</p>`, { ic: 'check' })}
    ${box('Кого наймати першим?', `<p class="sub">Оберіть до двох ролей. Подумайте, чого найбільше бракує й що найдорожче робити самому.</p><div class="xg c2">${Object.entries(ROLES).map(([k, r]) => `<div class="chcard ${d.first.includes(k) ? 'on' : ''}">${xp('roles', 'first', k, `${icon(r.icon, 15)} ${esc(r.t)}`, d.first.includes(k), { set: 'tog', max: 2, cls: 'card' })}<small>${esc(r.desc)} · від ${money0(S.marketSalary(k, 1))} / міс (досвід 1) до ${money0(S.marketSalary(k, 3))} (досвід 3)</small>${cnt[k] ? `<small>Справ для цієї ролі: <b>${cnt[k]}</b></small>` : ''}</div>`).join('')}</div>
      ${xin('roles', 'why', d, { label: 'Чому саме ці ролі першими?', area: true, rows: 2, max: 240, cls: 'mt', ph: 'Спершу потрібен…, бо…' })}`, { ic: 'rocket' })}`;
  },
  ready(S, d) {
    if (Object.keys(d.own).length < TASKS7.length) return { ok: false, msg: 'Розподіліть усі справи' };
    if (!d.first.length) return { ok: false, msg: 'Оберіть, кого наймати першим' };
    if (len(d.why) < 20) return { ok: false, msg: 'Поясніть свій вибір' };
    const me = Object.values(d.own).filter(k => k === 'me').length, no = Object.values(d.own).filter(k => k === 'no').length;
    return { ok: true, stars: 1 + (me <= 4 ? 1 : 0) + (no === 0 ? 1 : 0) };
  },
});

/* ═════════ Agile, Scrum, Kanban ═════════ */
const STORIES = [['Вхід через телефон', 3, 5, .1], ['Профіль користувача', 2, 3, .05], ['Платіжна сторінка', 5, 9, .25], ['Повідомлення на пошту', 2, 4, .05], ['Пошук', 3, 5, .1], ['Темна тема', 2, 2, .05], ['Статистика для адміна', 5, 4, .2], ['Інтеграція з календарем', 8, 6, .35], ['Експорт у PDF', 3, 3, .1], ['Відгуки користувачів', 3, 4, .1]].map(([t, pts, val, risk], id) => ({ id, t, pts, val, risk }));
const KB = ['Зробити макет сторінки', 'Написати тексти', 'Налаштувати оплату', 'Протестувати реєстрацію', 'Підготувати пост про запуск', 'Виправити помилку входу', 'Додати аналітику', 'Зібрати відгуки'].map((t, id) => ({ id, t, need: 1 + (id % 3), age: 0, col: 'back', start: null, cyc: null }));
const AQ = [
  { q: 'Вимоги постійно змінюються, а клієнт хоче бачити результат кожні два тижні. Що обрати?', a: ['Scrum зі спринтами', 'Kanban без ітерацій', 'Один великий план на рік'], ok: 0, why: 'Спринти дають регулярний результат і дозволяють змінювати план після кожного.' },
  { q: 'У команди підтримки щодня приходять різні запити. Що зручніше?', a: ['Scrum зі спринтами по два тижні', 'Kanban: безперервний потік із лімітом задач', 'Фіксований план на квартал'], ok: 1, why: 'Kanban добре працює з безперервним потоком запитів. Ліміт «у роботі» не дає захлинутися.' },
  { q: 'Що означає слово «Agile»?', a: ['Жорсткий план із кроками', 'Гнучкий підхід: короткі цикли, відгук, зміни за ходом', 'Окрема програма для задач'], ok: 1, why: 'Agile — набір цінностей: люди й співпраця важливіші за процеси, готовність змінюватися важливіша за план.' },
];
reg({
  id: 'agile', stage: 6, t: 'Agile, Scrum і Kanban', d: 'Проведіть спринт, попрацюйте з Kanban-дошкою й порівняйте методи.', icon: 'cube', min: 20,
  intro: `${term('Agile', 'Agile')} — гнучкий підхід до роботи: короткі цикли, швидкий відгук, готовність змінювати план. ${term('Scrum', 'Scrum')} працює спринтами (1–2 тижні), ${term('Kanban', 'Kanban')} — безперервним потоком із лімітом задач «у роботі». Спробуйте обидва й відповідайте, коли який підходить.`,
  data: S => ({ tab: 'scrum', pick: [], done: [], sprints: 0, log: [], retro: { good: '', bad: '', act: '' }, kb: KB.map(x => ({ ...x })), day: 0, q: {}, seed: 11 }),
  view(S, d) {
    const cap = 12 + 6 * (S.s.team.length + 1), tab = (k, t) => `<button type="button" class="tab ${d.tab === k ? 'on' : ''}" data-act="ex" data-ex="agile" data-do="set" data-p="tab" data-v="${k}" data-t="s" aria-pressed="${d.tab === k}">${t}</button>`;
    const head = `<div class="tabs" role="group" style="margin-bottom:8px">${tab('scrum', `Scrum${d.sprints ? ' ' + icon('check', 14) : ''}`)}${tab('kanban', `Kanban${d.kb.filter(x => x.col === 'done').length >= 4 ? ' ' + icon('check', 14) : ''}`)}${tab('cmp', `Порівняння${quizDone(d, 'q', AQ) >= 3 ? ' ' + icon('check', 14) : ''}`)}</div>`;
    if (d.tab === 'scrum') {
      const rest = STORIES.filter(s => !d.done.includes(s.id)), tot = sumOf(d.pick.map(i => STORIES[i].pts));
      return `${head}${box('Спринт-планування', `<p class="sub">Можливості команди за спринт: <b>${cap} очок</b> (ви + ${S.s.team.length} ${S.s.team.length === 1 ? 'колега' : 'колег'}). Оберіть історії з бек-логу: що найцінніше й вміщається?</p>
        <div class="xlist">${rest.map(s => `<div class="xitem sty ${d.pick.includes(s.id) ? 'on' : ''}"><span><b>${esc(s.t)}</b><small>цінність ${stars(Math.round(s.val / 2), 5)} · ризик ${s.risk >= .25 ? 'високий' : s.risk >= .1 ? 'середній' : 'низький'}</small></span><span class="xtag">${s.pts} оч.</span>${xp('agile', 'pick', s.id, d.pick.includes(s.id) ? 'У спринті' : 'Додати', d.pick.includes(s.id), { set: 'tog', t: 'n' })}</div>`).join('')}</div>
        <div class="mvpbar"><div class="x-bar"><i style="width:${clamp(tot / cap, 0, 1) * 100}%;background:${tot > cap ? '#d33' : 'var(--ok)'}"></i></div><b>${tot} з ${cap} оч.</b></div>
        ${tot > cap ? tip('Ви беретеся за більше, ніж команда встигає: ризикуєте не закінчити нічого.', 'warn') : ''}<div class="xrow">${xb('agile', 'run', d.sprints ? 'Запустити наступний спринт' : 'Запустити спринт', { cls: 'primary', ic: 'play', dis: !d.pick.length })}</div>`, { ic: 'calendar' })}`;
    }
    if (d.tab === 'kanban') {
      const col = (k, t, lim) => { const cs = d.kb.filter(x => x.col === k); return `<div class="kcol ${lim && cs.length >= lim ? 'full' : ''}"><h4>${t}${lim ? `<small>${cs.length} / ${lim}</small>` : `<small>${cs.length}</small>`}</h4>${cs.map(c => `<article class="kcard"><b>${esc(c.t)}</b><small>${c.col === 'done' ? `цикл ${c.cyc} дн.` : c.start != null ? `у роботі ${d.day - c.start} дн. з ${c.need}` : `потрібно ≈ ${c.need} дн.`}</small><div class="xrow">${k !== 'back' ? xb('agile', 'mv', '', { a: c.id, b: -1, ic: 'left', cls: 'ib', title: 'Назад' }) : ''}${k !== 'done' ? xb('agile', 'mv', '', { a: c.id, b: 1, ic: 'right', cls: 'ib', title: 'Далі' }) : ''}</div></article>`).join('')}</div>`; };
      const dn = d.kb.filter(x => x.col === 'done'), avg = dn.length ? sumOf(dn.map(x => x.cyc)) / dn.length : 0;
      return `${head}${box('Kanban-дошка', `<p class="sub">Беріть задачі в роботу, але не більше ліміту. Кожен «день» робота над задачею рухається. Завершуйте, перш ніж починати нове.</p><div class="kboard">${col('back', 'Список', 0)}${col('doing', 'У роботі', 3)}${col('rev', 'Перевірка', 2)}${col('done', 'Готово', 0)}</div>
        <div class="xrow mt">${xb('agile', 'day', `День ${d.day + 1}`, { cls: 'primary', ic: 'next' })}<span class="xtag">Минуло днів: ${d.day}</span>${dn.length ? `<span class="xtag ok">Середній цикл: ${avg.toFixed(1).replace('.', ',')} дн.</span>` : ''}</div>
        ${dn.length >= 4 ? tip('Ви завершили чотири й більше задач. Чим менше задач одночасно «в роботі», тим швидше кожна доходить до кінця.', 'ok') : ''}`, { ic: 'cube' })}`;
    }
    return `${head}${box('Коли що обирати', `<div class="xscroll"><table class="xtable"><thead><tr><th></th><th>Scrum</th><th>Kanban</th></tr></thead><tbody><tr><td><b>Ритм</b></td><td>Спринти 1–2 тижні</td><td>Безперервний потік</td></tr><tr><td><b>Зміни</b></td><td>Після спринту, всередині спринту — ні</td><td>У будь-який момент</td></tr><tr><td><b>Ролі</b></td><td>Власник продукту, Scrum-майстер, команда</td><td>Окремих ролей немає</td></tr><tr><td><b>Контроль</b></td><td>Обсяг спринту за можливостями команди</td><td>Ліміт задач «у роботі»</td></tr><tr><td><b>Добре для</b></td><td>Розробки продукту з вимогами, що змінюються</td><td>Підтримки, потоку малих завдань</td></tr></tbody></table></div>`, { ic: 'plan' })}
      ${box('Перевірте себе', quiz('agile', 'q', d, AQ), { ic: 'bulb', side: `правильно ${quizOk(d, 'q', AQ)} з ${AQ.length}` })}`;
  },
  live(S, d) {
    if (d.tab !== 'scrum' || !d.log.length) return '';
    const L = d.log.at(-1), days = Array.from({ length: 11 }, (_, i) => String(i));
    return `${box(`Результат спринту ${d.log.length}`, `${wideChart([{ v: L.burn, color: '#6366f1', label: 'Залишилось очок', area: true }, { v: L.ideal, color: '#94a3b8', label: 'Ідеальна лінія', dash: true }], { labels: days, fmt: x => String(Math.round(x)) })}
      <div class="kpis3"><div><small>Заплановано</small><b>${L.plan} оч.</b></div><div><small>Зроблено</small><b class="${L.done >= L.plan ? 'pos' : ''}">${L.done} оч.</b></div><div><small>Цінність для клієнтів</small><b>${L.val} з ${L.maxVal}</b></div></div>
      ${L.ev.map(e => `<p class="x-tip warn">${icon('info', 16)}<span>${esc(e)}</span></p>`).join('')}
      <h4 class="h4s mt">Ретроспектива</h4><div class="xg c3">${xin('agile', 'retro.good', d, { label: 'Що вийшло добре?', area: true, rows: 2, max: 140 })}${xin('agile', 'retro.bad', d, { label: 'Що заважало?', area: true, rows: 2, max: 140 })}${xin('agile', 'retro.act', d, { label: 'Що зробимо інакше?', area: true, rows: 2, max: 140 })}</div>`, { ic: 'chart' })}`;
  },
  acts: {
    run(S, d) {
      const cap = 12 + 6 * (S.s.team.length + 1), r = mk(d.seed * 131 + d.sprints * 17 + d.pick.length), st = d.pick.map(i => STORIES[i]), plan = sumOf(st.map(s => s.pts)), ev = [];
      let capNow = cap; if (r.chance(.4)) { capNow -= 3; ev.push('Хтось із команди захворів: можливості спринту зменшилися на 3 очка.'); }
      let done = 0, val = 0, over = Math.max(0, plan / capNow - 1); const maxVal = sumOf(st.map(s => s.val)), fin = [];
      st.forEach(s => { const fail = clamp(over * .55 + s.risk * (r.chance(.5) ? 1 : .5), 0, .9); if (done + s.pts <= capNow * 1.1 && !r.chance(fail)) { done += s.pts; val += s.val; fin.push(s.id); } });
      if (r.chance(.35)) ev.push('Клієнт змінив вимоги посеред спринту: частину роботи довелося переробити.');
      const burn = [plan], per = done / 10; for (let i = 1; i <= 10; i++) burn.push(Math.max(plan - per * i - (i === 5 && ev.length > 1 ? -2 : 0), plan - done));
      d.log.push({ plan, done, val, maxVal, burn: burn.map(x => Math.round(x * 10) / 10), ideal: Array.from({ length: 11 }, (_, i) => plan * (1 - i / 10)), ev }); d.sprints++; d.done.push(...fin); d.pick = [];
      if (!ev.length) ev.push('Спринт минув без несподіванок.');
    },
    mv(S, d, el, C) {
      const c = d.kb.find(x => x.id === +el.dataset.a), order = ['back', 'doing', 'rev', 'done'], ni = order.indexOf(c.col) + +el.dataset.b, to = order[ni]; if (!to) return false;
      const lim = { doing: 3, rev: 2 }[to]; if (lim && d.kb.filter(x => x.col === to).length >= lim) { C.toast(`Ліміт колонки: ${lim}. Спершу завершіть щось із того, що вже там.`, 'bad'); return false; }
      if (to === 'rev' && c.start != null && d.day - c.start < c.need) { C.toast('Задача ще не готова: потрібно більше днів роботи', 'bad'); return false; }
      if (to === 'doing' && c.start == null) c.start = d.day; if (to === 'back') c.start = null; if (to === 'done') c.cyc = d.day - (c.start ?? d.day) + 1; c.col = to;
    },
    day(S, d) { d.day++; },
  },
  ready(S, d) {
    const k = d.kb.filter(x => x.col === 'done').length, ok = quizOk(d, 'q', AQ), r = d.retro;
    if (!d.sprints) return { ok: false, msg: 'Проведіть спринт у вкладці Scrum' };
    if (len(r.good) < 3 || len(r.bad) < 3 || len(r.act) < 3) return { ok: false, msg: 'Заповніть ретроспективу спринту' };
    if (k < 4) return { ok: false, msg: `У Kanban завершіть хоча б чотири задачі (зараз ${k})` };
    if (quizDone(d, 'q', AQ) < AQ.length) return { ok: false, msg: 'Дайте відповідь на запитання у вкладці «Порівняння»' };
    if (ok < 2) return { ok: false, msg: 'Перечитайте пояснення: потрібно хоча б 2 правильні відповіді' };
    return { ok: true, stars: 1 + (d.log.at(-1).done >= d.log.at(-1).plan * .8 ? 1 : 0) + (ok === 3 ? 1 : 0) };
  },
});

/* ═════════ Наймання ═════════ */
const REQ = [['exp', 'Досвід на схожих проєктах'], ['team', 'Уміння працювати в команді'], ['learn', 'Швидко вчиться'], ['own', 'Бере відповідальність і самостійний'], ['eng', 'Читає технічні тексти англійською'], ['talk', 'Добре спілкується з клієнтами']];
const QSTN = [['Розкажіть про проєкт, яким ви найбільше пишаєтесь. Що саме робили ви?', 1, 'Відкрите запитання про реальний досвід.'], ['Ви плануєте мати дітей найближчим часом?', 0, 'Так питати не можна: це дискримінація. Оцінюйте лише навички й роботу.'], ['Опишіть ситуацію, коли ви не встигали в строк. Що зробили?', 1, 'Поведінкове запитання: показує, як людина діє в складній ситуації.'], ['Скільки вам років?', 0, 'Вік не стосується роботи. Питати не варто.'], ['Чому ви хочете працювати саме в нас?', 1, 'Показує мотивацію й чи вивчав(ла) кандидат компанію.'], ['Ви ж погодитеся працювати без вихідних?', 0, 'Навідне запитання, що тисне на кандидата й не перевіряє навичок.'], ['Покажіть, як би ви розв’язали це невелике тестове завдання.', 1, 'Практичне завдання: найкращий спосіб побачити реальний рівень.'], ['Яка у вас сімейна ситуація?', 0, 'Особисте життя не стосується роботи. Таке питання недоречне.']];
const CAND = [
  { n: 'Андрій', cv: '5 років досвіду, але змінював роботу кожен рік.', note: 'Технічно дуже сильний, відповідає коротко й нечасто питає. На командній вправі працював окремо.', s: { exp: 5, team: 2, learn: 3, own: 4, eng: 4, talk: 2 } },
  { n: 'Ірина', cv: '2 роки досвіду, багато коротких курсів.', note: 'Швидко розібралась у тестовому завданні, ставила уточнювальні питання, допомагала іншому кандидату.', s: { exp: 3, team: 5, learn: 5, own: 4, eng: 3, talk: 4 } },
  { n: 'Максим', cv: 'Велике резюме з гучними назвами компаній.', note: 'На конкретні запитання відповідає загально («ми зробили»), не пояснює свого внеску. Тестове завдання не завершив.', s: { exp: 2, team: 3, learn: 2, own: 2, eng: 3, talk: 4 } },
];
reg({
  id: 'hiring', stage: 6, t: 'Наймання людини', d: 'Складіть вакансію, оберіть питання й виберіть кандидата.', icon: 'search', min: 18,
  intro: `${term('Наймання', 'Найм')} — одне з найдорожчих рішень стартапу: помилка коштує місяців. Складіть вакансію, оберіть правильні запитання для співбесіди (деякі питати не можна!) і порівняйте трьох кандидатів за вимогами, які ви самі поставили.`,
  data: () => ({ role: 'dev', req: [], sal: 0, q: {}, cand: {}, pick: '', why: '' }),
  view(S, d) {
    const R = ROLES[d.role], mid = S.marketSalary(d.role, 2), sal = d.sal || mid;
    return `${box('1. Вакансія', `<div class="xrow">${Object.entries(ROLES).map(([k, r]) => xp('hiring', 'role', k, r.t, d.role === k)).join('')}</div><p class="sm muted">${esc(R.desc)}</p>
      <p class="xf-l mt">Що важливо від кандидата? Оберіть три-чотири вимоги.</p><div class="xrow">${REQ.map(([k, t]) => xp('hiring', 'req', k, t, d.req.includes(k), { set: 'tog', max: 4 })).join('')}</div>
      ${xsl('hiring', 'sal', d, { min: Math.round(S.marketSalary(d.role, 1) * .7), max: Math.round(S.marketSalary(d.role, 4) * 1.2), step: 1000, label: 'Зарплата на місяць', u: ' ₴', v: sal })}<p class="sm muted">Ринкова зарплата для цієї ролі: від ${money0(S.marketSalary(d.role, 1))} до ${money0(S.marketSalary(d.role, 3))}.</p>`, { ic: 'pen' })}
    ${box('2. Запитання для співбесіди', `<p class="sub">Які запитання ви поставите? Позначте кожне: «Ставлю» чи «Не ставлю».</p><div class="xlist">${QSTN.map(([q, good, why], i) => `<div class="quiz"><b>${esc(q)}</b><div class="xrow">${xp('hiring', `q.${i}`, 1, 'Ставлю', d.q[i] === 1, { t: 'n', cls: d.q[i] != null ? (good === 1 ? 'right' : d.q[i] === 1 ? 'wrong' : '') : '' })}${xp('hiring', `q.${i}`, 0, 'Не ставлю', d.q[i] === 0, { t: 'n', cls: d.q[i] != null ? (good === 0 ? 'right' : d.q[i] === 0 ? 'wrong' : '') : '' })}</div>${d.q[i] != null ? `<p class="x-tip ${d.q[i] === good ? 'ok' : 'warn'}">${icon(d.q[i] === good ? 'check' : 'info', 16)}<span>${d.q[i] === good ? 'Правильно. ' : 'Не зовсім. '}${esc(why)}</span></p>` : ''}</div>`).join('')}</div>`, { ic: 'mic' })}
    ${box('3. Кандидати', `<div class="xg c3">${CAND.map((c, i) => `<article class="nmcard ${d.pick === c.n ? 'fin' : ''}"><header><span class="pav sm" style="--h:${hash(c.n) % 360}">${c.n[0]}</span><b>${c.n}</b></header><p class="sm"><b>Резюме:</b> ${esc(c.cv)}</p><p class="sm"><b>Співбесіда:</b> ${esc(c.note)}</p>${d.req.length ? `<div class="xrow">${d.req.map(k => `<label class="xf" style="width:46%"><span class="xf-l">${REQ.find(r => r[0] === k)[1].split(' ')[0]}…</span><select class="inp" data-exi="hiring" data-p="cand.${c.n}.${k}">${['—', 1, 2, 3, 4, 5].map(v => `<option value="${v === '—' ? '' : v}" ${String(d.cand[c.n]?.[k] ?? '') === String(v === '—' ? '' : v) ? 'selected' : ''}>${v}</option>`).join('')}</select></label>`).join('')}</div>` : '<p class="sm muted">Спершу оберіть вимоги у вакансії.</p>'}${xp('hiring', 'pick', c.n, d.pick === c.n ? 'Це мій вибір' : 'Обрати кандидата', d.pick === c.n, { cls: 'card' })}</article>`).join('')}</div>
      ${d.pick ? (() => { const sc = c => sumOf(d.req.map(k => c.s[k])), best = [...CAND].sort((a, b) => sc(b) - sc(a))[0]; return tip(d.pick === best.n ? `Ви обрали кандидата, який найкраще відповідає вашим вимогам: ${best.n}.` : `За вашими вимогами найкраще підходить ${best.n}: перегляньте співбесіду ще раз. Але остаточне рішення завжди за вами.`, d.pick === best.n ? 'ok' : 'warn'); })() : ''}
      ${xin('hiring', 'why', d, { label: 'Чому саме цей кандидат?', area: true, rows: 2, max: 240, cls: 'mt', ph: 'Я обираю його(її), тому що…' })}`, { ic: 'users' })}`;
  },
  onSet(S, d, p) { if (p === 'role') d.sal = 0; },
  ready(S, d) {
    const ok = QSTN.filter(([, g], i) => d.q[i] === g).length, answered = Object.keys(d.q).length;
    if (d.req.length < 3) return { ok: false, msg: 'Оберіть хоча б три вимоги до кандидата' };
    if (answered < QSTN.length) return { ok: false, msg: `Позначте всі запитання: лишилось ${QSTN.length - answered}` };
    if (ok < 6) return { ok: false, msg: 'Забагато хибних відповідей у запитаннях: прочитайте пояснення й виправте' };
    if (!d.pick) return { ok: false, msg: 'Оберіть кандидата' };
    if (len(d.why) < 20) return { ok: false, msg: 'Поясніть свій вибір' };
    const best = [...CAND].sort((a, b) => sumOf(d.req.map(k => b.s[k])) - sumOf(d.req.map(k => a.s[k])))[0];
    return { ok: true, stars: 1 + (ok === QSTN.length ? 1 : 0) + (d.pick === best.n ? 1 : 0) };
  },
});

/* ═════════ Дистанційна робота (необов'язкова) ═════════ */
const TOOLS = [['chat', 'Месенджер для швидких питань'], ['video', 'Відеодзвінки'], ['tasks', 'Дошка задач'], ['docs', 'Спільні документи'], ['wiki', 'База знань для новачків']];
const RIT = [['daily', 'Щоденна 10-хвилинна зустріч'], ['demo', 'Щотижнева демонстрація результатів'], ['one', 'Особисті зустрічі 1:1 раз на два тижні'], ['retro', 'Ретроспектива раз на місяць'], ['coffee', 'Неформальна кава-розмова онлайн']];
const RQ = [{ q: 'Колега з іншого часового поясу не відповідає на термінове питання пів дня. Що найкраще?', a: ['Зробити вигляд, що все гаразд', 'Домовитись про «спільні години» та правила, коли очікується відповідь', 'Вимагати відповідати цілодобово'], ok: 1, why: 'Правила спільних годин і швидкості відповіді допомагають без постійного тиску.' }, { q: 'Що найбільше загрожує віддаленій команді?', a: ['Відсутність офісу', 'Відчуття ізоляції й нечітка комунікація', 'Занадто тихі колеги'], ok: 1, why: 'Без розмов біля кавомашини люди відчувають ізоляцію. Потрібні ритуали й чіткі правила.' }];
reg({
  id: 'remote', stage: 6, opt: true, t: 'Дистанційна робота', d: 'Складіть правила роботи віддаленої команди.', icon: 'laptop', min: 12,
  intro: `Віддалена команда працює з різних міст і навіть країн. Тут важливі не «години в офісі», а <b>чіткі правила</b>: де спілкуємось, коли відповідаємо й як бачимо результат. Складіть правила своєї команди й подивіться, де ризики.`,
  data: () => ({ tools: [], rit: [], core: 4, resp: 4, q: {}, ch: 0 }),
  onSet: (S, d, p) => { if (!p.startsWith('q')) d.ch = (d.ch || 0) + 1; },
  view(S, d) {
    return `${box('Інструменти', `<div class="xrow">${TOOLS.map(([k, t]) => xp('remote', 'tools', k, t, d.tools.includes(k), { set: 'tog' })).join('')}</div>`, { ic: 'wrench' })}${box('Ритуали', `<div class="xrow">${RIT.map(([k, t]) => xp('remote', 'rit', k, t, d.rit.includes(k), { set: 'tog' })).join('')}</div>`, { ic: 'calendar' })}
    ${box('Правила часу', `<div class="xg c2">${xsl('remote', 'core', d, { min: 0, max: 8, step: 1, label: 'Спільні години, коли всі на зв’язку', u: ' год' })}${xsl('remote', 'resp', d, { min: 1, max: 24, step: 1, label: 'Відповідь на повідомлення за', u: ' год' })}</div>`, { ic: 'clock' })}
    ${box('Перевірте себе', quiz('remote', 'q', d, RQ), { ic: 'bulb' })}`;
  },
  live(S, d) {
    const comm = clamp(.2 + d.tools.length * .1 + d.rit.length * .1 + Math.min(d.core, 4) * .05 - (d.resp > 12 ? .2 : 0), 0, 1), burn = clamp((d.rit.length > 4 ? .3 : 0) + (d.resp <= 2 ? .35 : 0) + (d.core > 6 ? .25 : 0) + (d.rit.includes('daily') && d.rit.includes('demo') && d.rit.includes('one') ? .15 : 0), 0, 1);
    return `${box('Правила команди', `<div class="kpis3"><div><small>Якість комунікації</small>${bar(comm, { color: comm > .6 ? 'var(--ok)' : '#e0a100', label: 'Комунікація' })}</div><div><small>Ризик вигорання</small>${bar(burn, { color: burn > .5 ? '#d33' : 'var(--ok)', label: 'Вигорання' })}</div><div><small>Правил</small><b>${d.tools.length + d.rit.length}</b></div></div>
      <div class="sheet"><h4>Правила нашої команди</h4><dl><dt>Спілкуємось</dt><dd>${d.tools.map(k => TOOLS.find(t => t[0] === k)[1]).join('; ') || '—'}</dd><dt>Ритуали</dt><dd>${d.rit.map(k => RIT.find(t => t[0] === k)[1]).join('; ') || '—'}</dd><dt>Час</dt><dd>${d.core} спільних годин на день; відповідь на повідомлення — протягом ${d.resp} год.</dd></dl></div>`, { ic: 'plan' })}`;
  },
  ready(S, d) { if (d.tools.length < 3) return { ok: false, msg: 'Оберіть хоча б три інструменти' }; if (d.rit.length < 2) return { ok: false, msg: 'Оберіть хоча б два ритуали' }; if (quizDone(d, 'q', RQ) < RQ.length) return { ok: false, msg: 'Дайте відповідь на запитання' }; return { ok: true, stars: 1 + (quizOk(d, 'q', RQ) === RQ.length ? 1 : 0) + (d.rit.length >= 3 && d.rit.length <= 4 ? 1 : 0) }; },
});
