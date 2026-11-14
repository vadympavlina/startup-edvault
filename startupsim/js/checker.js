// Симулятор стартапу · сторінка перевірки для викладача.
// Відкриває файл збереження учня й показує всю роботу лише для читання: нічого не редагується і нічого не записується
// ні у файл, ні в localStorage (власну гру викладача сторінка не чіпає).
import { Sim, money } from './sim.js';
import { unpackGame, summaryOf } from './file.js';
import { STAGES, stageInfo } from './stages.js';
import { EX, exAll, exOf, exDone, exStars, exCount, stars, STAGE_T } from './ex-core.js';
import { coreViews } from './v-core.js';
import { marketViews } from './v-market.js';
import { icon } from './icons.js';
import { esc, logo, fill } from './ui.js';
import { SUMM } from './v-stages.js';
import './ex1.js'; import './ex-need.js'; import './ex-start.js'; import './ex1b.js'; import './ex-aud.js'; import './ex-brand.js'; import './ex-bbook.js';
import './ex2.js'; import './ex3.js'; import './ex3b.js'; import './ex4.js'; import './ex5.js'; import './ex6.js'; import './ex7.js'; import './ex8.js'; import './ex9.js';

const $ = id => document.getElementById(id), main = $('main'), tools = $('tools');
// список учнів: кожен — { res, S, key }. Відкрити можна кілька файлів одразу (клас)
const list = []; let cur = -1, S = null, meta = null, tab = 'over', error = '', flt = 'all', q = '', cq = '', onlyAtt = false;
// позначки викладача живуть лише в пам'яті сторінки (нічого не записується); вони потрапляють у таблицю й друк
const marks = new Map();

const ui = { view: 'plan' };
const ro = html => `<div class="ck-ro" inert>${html}</div>`;
const safe = (fn, m = 'Цей розділ не вдалося показати.') => { try { return fn(); } catch { return `<p class="muted">${m}</p>`; } };
const exState = (S, id) => S.s.ex?.done?.[id] ? 'done' : S.s.ex?.d?.[id] ? 'started' : 'none';
const stat = S => {
  const all = exAll(), done = all.filter(e => exDone(S, e.id)), st = done.reduce((a, e) => a + exStars(S, e.id), 0), info = stageInfo(S);
  return { done: done.length, all: all.length, stars: st, weak: done.filter(e => exStars(S, e.id) <= 1).length, stage: Math.min(info.reached + 1, STAGES.length), info };
};


const mkOf = (e = list[cur]) => (e && marks.get(e.key)) || {};
const setMark = (id, v) => { const e = list[cur]; if (!e) return; const m = marks.get(e.key) || {}; if (m[id] === v) delete m[id]; else m[id] = v; marks.set(e.key, m); };
const pct = (a, b) => (b ? Math.round(a / b * 100) : 0);
const initials = n => String(n).split(/\s+/).map(x => x[0] || '').join('').slice(0, 2).toUpperCase();
const hue = n => ([...String(n)].reduce((a, c) => a + c.charCodeAt(0), 0) * 37) % 360;

// перше змістовне речення з відповіді учня: рядок-підказка до вправи
function excerpt(def, SS = S) {
  const d = SS.s.ex?.d?.[def.id]; if (!d) return '';
  try { const s = SUMM[def.id]?.(SS, d); if (s) return String(s); } catch { /* без короткого підсумку */ }
  let best = '';
  const walk = (o, depth) => { if (depth > 3 || best || !o) return; for (const v of Object.values(o)) { if (typeof v === 'string' && v.trim().length >= 15 && !/^(#|data:)/.test(v.trim())) { best = v.trim(); return; } if (v && typeof v === 'object') walk(v, depth + 1); } };
  walk(d, 0);
  return best.length > 150 ? best.slice(0, 147) + '…' : best;
}

// що варто перевірити першим: ознаки для кожного учня
function flagsOf(e) {
  const SS = e.S, out = [], all = exAll();
  const done = all.filter(x => exDone(SS, x.id)), weak = done.filter(x => exStars(SS, x.id) <= 1), started = all.filter(x => exState(SS, x.id) === 'started');
  if (e.res.edited) out.push({ k: 'bad', id: 'edited', t: 'Файл змінювали після збереження' });
  if (!(SS.s.interviews || []).length) out.push({ k: 'warn', id: 'noiv', t: 'Немає інтерв’ю з клієнтами' });
  else { const bad = (SS.s.interviews || []).filter(v => v.bad).length; if (bad) out.push({ k: 'warn', id: 'badiv', t: `Підказувальні інтерв’ю: ${bad}` }); }
  if (done.length >= 6 && weak.length / done.length >= .6) out.push({ k: 'warn', id: 'rush', t: `Багато вправ «як є»: ${weak.length} з ${done.length}` });
  else if (weak.length) out.push({ k: 'info', id: 'weak', t: `Слабких вправ: ${weak.length}` });
  if (started.length) out.push({ k: 'info', id: 'started', t: `Не завершено: ${started.length}` });
  return out;
}
const flagChip = f => `<span class="ck-fl ${f.k}">${esc(f.t)}</span>`;

const dropZone2 = () => `<section class="ck-drop" id="dz"><div class="ck-drop-ic">${icon('open', 34)}</div><h1>Відкрийте файл збереження учня</h1><p>Перетягніть сюди файл <b>.edvault</b> (підійде й старий <b>.json</b>) або оберіть його на комп’ютері. Можна відкрити <b>одразу весь клас</b>: з’явиться таблиця, матриця вправ і ознаки, що перевірити першим. Усе показується лише для перегляду: змінити роботу тут не можна.</p><button class="btn primary" id="pick" type="button">${icon('open', 16)} Обрати файли</button><ul class="ck-how"><li><b>1</b><span>Додайте файли учнів</span></li><li><b>2</b><span>Погляньте на клас: хто відстає й де зауваження</span></li><li><b>3</b><span>Відкрийте учня й швидко пройдіться по вправах із позначками</span></li></ul></section>`;

function attention() {
  const e = list[cur], fl = flagsOf(e), st = stat(S);
  const cu = st.info.list[st.info.reached] || st.info.list.at(-1);
  const rows = [];
  if (cu && !cu.done) rows.push(['', `Зараз на етапі ${st.info.reached + 1} «${cu.t}»: виконано ${cu.n} з ${cu.m} обов’язкових кроків.`, '']);
  for (const f of fl) rows.push([f.k, f.t, f.id === 'weak' || f.id === 'rush' ? 'weak' : f.id === 'started' ? 'started' : f.id === 'noiv' || f.id === 'badiv' ? 'iv' : '']);
  if (!rows.length) rows.push(['ok', 'Зауважень немає.', '']);
  return `<section class="card"><header class="card-h"><h2>На що звернути увагу</h2></header><ul class="ck-att">${rows.map(([k, x, go]) => `<li class="${k}"><span>${esc(x)}</span>${go ? `<button type="button" class="ck-go" data-go="${go}">Показати</button>` : ''}</li>`).join('')}</ul></section>`;
}
const kpi = (t, v, sub = '', cls = '') => `<div class="ck-kpi ${cls}"><small>${esc(t)}</small><b>${v}</b>${sub ? `<span>${sub}</span>` : ''}</div>`;
const dotsOf = (SS, i, key) => exOf(i).map(x => { const k = exState(SS, x.id), s = k === 'done' ? exStars(SS, x.id) : 0; return `<button type="button" class="ck-dot ${k} s${s}" data-jump="${x.id}" title="${esc(x.t)} · ${k === 'done' ? s + ' з 3 зірок' : k === 'started' ? 'розпочато' : 'не розпочато'}" aria-label="${esc(x.t)}"></button>`; }).join('');
function overview() {
  const sum = summaryOf(S), st = stat(S), m = mkOf(), mk = Object.values(m), avg = st.done ? (st.stars / st.done) : 0;
  const rows = st.info.list.map((x, i) => { const ex = exOf(i), dn = ex.filter(e => exDone(S, e.id)).length; return `<li class="ck-sr"><span class="ck-sn">${x.done ? icon('check', 14) : i + 1}</span><span class="ck-sl"><b>${esc(x.t)}</b><small>обов’язкових: ${x.n} з ${x.m} · вправ: ${dn} з ${ex.length}</small></span><span class="ck-dots">${dotsOf(S, i)}</span></li>`; }).join('');
  return `<div class="ck-kpis">${kpi('Етап', `${st.stage} з ${STAGES.length}`, esc(st.info.list[st.stage - 1]?.t || ''))}${kpi('Вправи', `${st.done} з ${st.all}`, `${pct(st.done, st.all)}%`)}${kpi('Зірки', st.stars, st.done ? `у середньому ${avg.toFixed(1).replace('.', ',')} з 3` : '')}${kpi('Інтерв’ю', (S.s.interviews || []).length, 'з клієнтами')}${kpi('Гроші', money(S.s.cash), `тиждень ${S.s.week + 1}`)}${kpi('Позначки', `${mk.filter(v => v === 'ok').length} / ${mk.filter(v => v === 'redo').length}`, 'зараховано / доопрацювати', mk.length ? 'on' : '')}</div>
    ${attention()}
    <section class="card" style="margin-top:14px"><header class="card-h"><h2>Проходження етапів</h2><span class="ck-leg"><i class="ck-dot done s3"></i>3 зірки <i class="ck-dot done s1"></i>1 зірка <i class="ck-dot started"></i>розпочато <i class="ck-dot none"></i>ні</span></header><ul class="ck-stages">${rows}</ul></section>
    <section class="card" style="margin-top:14px"><header class="card-h"><h2>Підсумок</h2></header><dl class="ck-sum">${Object.entries(sum).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>`;
}

function exBlock(def) {
  const done = S.s.ex?.done?.[def.id], k = exState(S, def.id), mrk = mkOf()[def.id], ex = k === 'none' ? '' : excerpt(def);
  const st = done ? exStars(S, def.id) : 0;
  const chip = done ? `<span class="chip ok">${icon('check', 14)} ${stars(done.s)} · тиждень ${done.w + 1}</span>` : k === 'started' ? '<span class="chip warn">розпочато</span>' : '<span class="chip">не розпочато</span>';
  const text = k === 'none' ? '' : JSON.stringify(S.s.ex.d[def.id]).toLowerCase();
  const mb = k === 'none' ? '' : `<span class="ck-mk" role="group" aria-label="Позначка викладача"><button type="button" data-mark="ok" data-ex="${def.id}" class="${mrk === 'ok' ? 'on ok' : ''}" aria-pressed="${mrk === 'ok'}" title="Зараховано">${icon('check', 14)}</button><button type="button" data-mark="redo" data-ex="${def.id}" class="${mrk === 'redo' ? 'on redo' : ''}" aria-pressed="${mrk === 'redo'}" title="Доопрацювати">${icon('undo', 14) || '↺'}</button></span>`;
  return `<details class="ck-ex ${k === 'none' ? 'none' : ''} ${mrk ? 'm-' + mrk : ''}" id="ckx-${def.id}" data-ex="${def.id}" data-st="${k}" data-weak="${k === 'done' && st <= 1 ? 1 : 0}" data-mark-v="${mrk || ''}" data-txt="${esc(text)}"><summary>${icon(def.icon, 20)}<span class="ck-et"><b>${esc(def.t)}${def.opt ? ' <em>додаткова</em>' : ''}</b>${ex ? `<small>${esc(ex)}</small>` : ''}</span>${chip}${mb}</summary><div class="ck-body" data-body></div></details>`;
}
function exercises() {
  const all = exAll(), n = k => all.filter(e => exState(S, e.id) === k).length, weak = all.filter(e => exDone(S, e.id) && exStars(S, e.id) <= 1).length;
  const unm = all.filter(e => exState(S, e.id) !== 'none' && !mkOf()[e.id]).length;
  const F = [['all', 'Усі', all.length], ['done', 'Виконані', n('done')], ['weak', 'Слабкі', weak], ['started', 'Розпочаті', n('started')], ['none', 'Не розпочаті', n('none')], ['unmarked', 'Без позначки', unm]];
  return `<div class="ck-bar"><div class="ck-flt" role="group" aria-label="Фільтр">${F.map(([k, t, c]) => `<button type="button" data-flt="${k}" class="${flt === k ? 'on' : ''}">${t} <small>${c}</small></button>`).join('')}</div>
    <input class="inp ck-q" id="q" type="search" placeholder="Пошук по відповідях учня" value="${esc(q)}" aria-label="Пошук по відповідях"><button class="btn sm" type="button" data-all="1">Розгорнути все</button><button class="btn sm" type="button" data-all="0">Згорнути</button><button class="btn sm primary" type="button" data-next="1">${icon('right', 14) || ''} Далі без позначки</button></div>
    <p class="ck-hint">Позначки «Зараховано» і «Доопрацювати» зберігаються лише на цій сторінці й потрапляють у таблицю та друк. Закриєте сторінку — зникнуть, тож завантажте таблицю.</p>
    <div id="exl">${STAGES.map((st, i) => { const l = exOf(i); return l.length ? `<section class="ck-st"><h2>Етап ${i + 1}. ${esc(STAGE_T[i])} <span class="muted sm">${l.filter(e => exDone(S, e.id)).length} з ${l.length} виконано</span></h2>${l.map(exBlock).join('')}</section>` : ''; }).join('')}<p class="muted ck-none" hidden>За цим фільтром нічого не знайдено.</p></div>`;
}
function applyFilter() {
  const box = $('exl'); if (!box) return; const ql = q.trim().toLowerCase();
  box.querySelectorAll('.ck-ex').forEach(d => {
    const okF = flt === 'all' || (flt === 'weak' ? d.dataset.weak === '1' : flt === 'unmarked' ? d.dataset.st !== 'none' && !d.dataset.markV : d.dataset.st === flt);
    d.hidden = !(okF && (!ql || d.dataset.txt.includes(ql) || d.querySelector('b').textContent.toLowerCase().includes(ql)));
  });
  box.querySelectorAll('.ck-st').forEach(s => { s.hidden = !s.querySelector('.ck-ex:not([hidden])'); });
  box.querySelector('.ck-none').hidden = [...box.querySelectorAll('.ck-st')].some(s => !s.hidden);
}
// вміст вправи малюється той самий, що бачить учень, але в «inert»-контейнері: на ньому нічого не натискається і не редагується
function fillEx(det) {
  const body = det.querySelector('[data-body]'); if (!body || body.dataset.ready) return;
  const def = EX[det.dataset.ex]; if (!def) return;
  body.dataset.ready = '1';
  try {
    const d = (S.s.ex.d[def.id] ||= def.data ? def.data(S) : {}), done = S.s.ex.done[def.id], ctx = { ui, done };
    fill(body, `<div class="ck-ro" inert><div class="ex-body ${def.cols ? 'cols' : ''}">${def.cols ? `<div class="ex-main">${def.view(S, d, ctx)}</div>` : def.view(S, d, ctx)}${def.live ? `<div class="ex-live">${def.live(S, d, ctx)}</div>` : ''}</div></div>`);
    body.querySelectorAll('textarea,input,select,button').forEach(el => { el.disabled = true; el.setAttribute('tabindex', '-1'); });
  } catch { fill(body, '<p class="muted">Цю вправу не вдалося показати.</p>'); }
}


function brand() {
  const L = S.s.ex?.d?.logo, B = EX.bbook;
  if (!L && !S.s.ex?.d?.bbook) return '<section class="card"><p class="muted">Учень ще не працював над брендом.</p></section>';
  const d = (S.s.ex.d.bbook ||= B.data(S));
  return ro(`<div class="ck-brand-v">${B.live(S, d, {})}</div>`) + `<p class="muted sm">Логотип, кольори й голос бренду, які учень зібрав у вправах етапу 2. Деталі кожної вправи є на вкладці «Вправи».</p>`;
}
function interviews() {
  const l = S.s.interviews || [];
  if (!l.length) return '<section class="card"><p class="muted">Учень не провів жодного інтерв’ю.</p></section>';
  return `<section class="card"><header class="card-h"><h2>${icon('mic')} Інтерв’ю з клієнтами</h2><span class="muted sm">усього: ${l.length}</span></header><div class="ivlist">${[...l].reverse().map(v => `<details class="ivh ck-iv"><summary><b>${esc(v.name)}</b> <span class="muted">${esc(v.who)} · ${esc(S.seg(v.seg)?.short || '')} · тиждень ${v.w + 1}</span>${v.bad ? `<span class="chip warn">підказувальні запитання: ${v.bad}</span>` : '<span class="chip ok">лише факти</span>'}</summary><div class="chat">${v.log.map(x => `<p class="q">${esc(x.q)}</p><p class="a">${esc(x.a)}</p>`).join('')}</div></details>`).join('')}</div></section>`;
}


/* ── клас: показники, таблиця, матриця вправ ── */
let sortK = 'name', sortD = 1;
const rowsOf = () => list.map((e, i) => {
  const st = stat(e.S), s = e.S.s, fl = flagsOf(e), mk = Object.values(marks.get(e.key) || {});
  return { i, name: s.founder.name, group: s.founder.group || '', company: s.company.name, idea: e.S.I.t, stage: st.stage, done: st.done, all: st.all, stars: st.stars, avg: st.done ? st.stars / st.done : 0, week: s.week + 1, cash: s.cash, edited: !!e.res.edited, flags: fl, att: fl.filter(f => f.k !== 'info').length, stages: STAGES.map((_, k) => { const l = exOf(k); return [l.filter(x => exDone(e.S, x.id)).length, l.length]; }), ok: mk.filter(v => v === 'ok').length, redo: mk.filter(v => v === 'redo').length };
});
function classView() {
  const all = rowsOf(), ql = cq.trim().toLowerCase();
  let rs = all.filter(r => (!onlyAtt || r.att) && (!ql || `${r.name} ${r.group} ${r.company}`.toLowerCase().includes(ql)));
  rs = rs.sort((a, b) => (typeof a[sortK] === 'string' ? a[sortK].localeCompare(b[sortK], 'uk') : a[sortK] - b[sortK]) * sortD);
  const th = (k, t) => `<th><button type="button" data-sort="${k}" class="${sortK === k ? 'on' : ''}">${t}${sortK === k ? (sortD > 0 ? ' ↑' : ' ↓') : ''}</button></th>`;
  const tot = all.reduce((a, r) => a + r.done, 0), avgP = all.length ? Math.round(all.reduce((a, r) => a + pct(r.done, r.all), 0) / all.length) : 0, attN = all.filter(r => r.att).length;
  const star = all.length ? all.reduce((a, r) => a + r.avg, 0) / all.length : 0;
  const cell = (r, k) => { const [d, t] = r.stages[k]; return `<span class="ck-sc ${d === t ? 'full' : d ? 'part' : ''}" title="Етап ${k + 1}: ${d} з ${t}"><i style="height:${t ? d / t * 100 : 0}%"></i></span>`; };
  const body = rs.map(r => `<tr class="${r.att ? 'att' : ''}"><td><button type="button" class="ck-lnk" data-open="${r.i}"><span class="ck-av" style="--h:${hue(r.name)}">${esc(initials(r.name))}</span>${esc(r.name)}</button></td><td>${esc(r.group) || '—'}</td><td class="ck-bars">${r.stages.map((_, k) => cell(r, k)).join('')}</td><td><span class="ck-pbar"><i style="width:${pct(r.done, r.all)}%"></i></span><small>${r.done} з ${r.all}</small></td><td>${r.stars}<small> · ${r.avg ? r.avg.toFixed(1).replace('.', ',') : '—'}</small></td><td class="ck-fls">${r.flags.filter(f => f.k !== 'info').map(flagChip).join('') || '<span class="ck-fl ok">без зауважень</span>'}</td><td>${r.ok || r.redo ? `<span class="ck-fl ok">${r.ok}</span> <span class="ck-fl warn">${r.redo}</span>` : '—'}</td></tr>`).join('');
  const mx = rs.map(r => { const e = list[r.i]; return `<tr><th scope="row"><button type="button" class="ck-lnk" data-open="${r.i}">${esc(r.name)}</button></th>${exAll().map(x => { const k = exState(e.S, x.id), s = k === 'done' ? exStars(e.S, x.id) : 0; return `<td class="${x.stage !== (exAll()[exAll().indexOf(x) - 1]?.stage ?? x.stage) ? 'sep' : ''}"><button type="button" class="ck-dot ${k} s${s}" data-open="${r.i}" data-jump="${x.id}" title="${esc(r.name)} · ${esc(x.t)} · ${k === 'done' ? s + ' з 3 зірок' : k === 'started' ? 'розпочато' : 'не розпочато'}" aria-label="${esc(r.name)}: ${esc(x.t)}"></button></td>`; }).join('')}</tr>`; }).join('');
  return `<div class="ck-kpis">${kpi('Учнів', all.length, `${new Set(all.map(r => r.group || '—')).size} клас(ів)`)}${kpi('Середній прогрес', avgP + '%', `вправ усього: ${tot}`)}${kpi('Середня оцінка', star ? star.toFixed(1).replace('.', ',') : '—', 'зірок за вправу з 3')}${kpi('Потребують уваги', attN, attN ? 'є зауваження' : 'усе гаразд', attN ? 'warn' : 'ok')}</div>
    <section class="card"><header class="card-h"><h2>Клас</h2><div class="ck-ctl"><input class="inp" id="cq" type="search" placeholder="Знайти учня, клас, компанію" value="${esc(cq)}" aria-label="Пошук учня"><label class="ck-chk"><input type="checkbox" id="att" ${onlyAtt ? 'checked' : ''}> лише із зауваженнями</label><button class="btn sm" type="button" id="csv">${icon('save', 14)} Таблиця для Excel</button></div></header>
    <div class="ck-scroll"><table class="tbl ck-tbl"><thead><tr>${th('name', 'Учень')}${th('group', 'Клас')}<th>Етапи 1–9</th>${th('done', 'Вправи')}${th('stars', 'Зірки')}${th('att', 'Зауваження')}<th title="зараховано / доопрацювати">Позн.</th></tr></thead><tbody>${body || '<tr><td colspan="7" class="muted">Нікого не знайдено.</td></tr>'}</tbody></table></div></section>
    <section class="card" style="margin-top:14px"><header class="card-h"><h2>Матриця вправ</h2><span class="ck-leg"><i class="ck-dot done s3"></i>3 зірки <i class="ck-dot done s2"></i>2 <i class="ck-dot done s1"></i>1 <i class="ck-dot started"></i>розпочато <i class="ck-dot none"></i>ні</span></header><p class="muted sm">Кожен квадрат — одна вправа (52 по порядку, з роздільниками етапів). Натисніть, щоб відкрити її в роботі учня.</p>
    <div class="ck-scroll"><table class="ck-mx"><tbody>${mx}</tbody></table></div></section>`;
}
function csv() {
  const q = v => `"${String(v).replace(/"/g, '""')}"`, rs = rowsOf(), st = STAGES.map((s, i) => `Етап ${i + 1}`);
  const text = '﻿' + [['Учень', 'Клас', 'Компанія', 'Ідея', 'Етап зараз', 'Виконано вправ', 'Усього вправ', 'Зірок', 'Середня оцінка', ...st, 'Тиждень', 'Гроші, грн', 'Зараховано (позначки)', 'Доопрацювати (позначки)', 'Зауваження', 'Файл змінено'], ...rs.map(r => [r.name, r.group, r.company, r.idea, r.stage, r.done, r.all, r.stars, r.avg ? r.avg.toFixed(1).replace('.', ',') : '', ...r.stages.map(([d, t]) => `${d}/${t}`), r.week, Math.round(r.cash), r.ok, r.redo, r.flags.map(f => f.t).join('; '), r.edited ? 'так' : 'ні'])].map(r => r.map(q).join(';')).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' })); a.download = 'startup_klas.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

const TABS = () => [...(list.length > 1 ? [['class', 'Клас']] : []), ['over', 'Огляд'], ['ex', 'Вправи'], ['brand', 'Бренд'], ['plan', 'Бізнес-план'], ['iv', "Інтерв'ю"], ['rep', 'Журнал і звіт']];
const tabsHtml = () => TABS().map(([k, t], i) => `<button type="button" role="tab" aria-selected="${tab === k}" class="${tab === k ? 'on' : ''}" data-tab="${k}" title="Клавіша ${i + 1}">${t}</button>`).join('');

function studentBar() {
  if (list.length < 2) return '';
  return `<div class="ck-nav"><button type="button" class="btn sm" data-step="-1" aria-label="Попередній учень" title="Клавіша ←">${icon('left', 16)}</button><select id="who" class="inp" aria-label="Учень">${list.map((e, i) => `<option value="${i}" ${i === cur ? 'selected' : ''}>${esc(e.S.s.founder.name)} · ${esc(e.S.s.company.name)}${e.S.s.founder.group ? ` · ${esc(e.S.s.founder.group)}` : ''}</option>`).join('')}</select><button type="button" class="btn sm" data-step="1" aria-label="Наступний учень" title="Клавіша →">${icon('right', 16)}</button><span class="muted sm">${cur + 1} з ${list.length}</span></div>`;
}
function render() {
  const err = error ? `<div class="ck-err" role="alert">${esc(error)}</div>` : '';
  if (!list.length) { fill(tools, ''); fill(main, dropZone2() + err); return; }
  fill(tools, `<button class="btn" id="pick" type="button">${icon('open', 16)} Додати файли</button><button class="btn" id="prt" type="button">${icon('printer', 16)} Друк</button>`);
  if (tab === 'class' && list.length < 2) tab = 'over';
  if (tab === 'class') { fill(main, `${err}<nav class="ck-tabs" role="tablist">${tabsHtml()}</nav>${classView()}`); return; }
  const s = S.s, c = s.company, saved = meta.savedAt ? new Date(meta.savedAt).toLocaleString('uk-UA') : '', st = stat(S);
  const body = tab === 'over' ? overview() : tab === 'ex' ? exercises() : tab === 'brand' ? safe(brand) : tab === 'plan' ? ro(safe(() => marketViews.plan.render(S, ui))) : tab === 'iv' ? interviews() : ro(safe(() => coreViews.report.render(S, ui)));
  fill(main, `${err}${meta.edited ? '<div class="ck-warn" role="alert"><b>Увага.</b> Дані у файлі не збігаються з контрольною сумою: файл могли змінювати вручну після збереження.</div>' : ''}
    <div class="ck-head">${studentBar()}<div class="ck-who">${logo(c, 56)}<div><h1>${esc(s.founder.name)}${s.founder.group ? ` · ${esc(s.founder.group)}` : ''}</h1><p>${esc(c.name)} · ${esc(S.I.t)} · ${money(s.cash)} на рахунку${saved ? ` · збережено ${esc(saved)}` : ''}</p></div><div class="ck-prog" title="Виконано вправ"><span class="ck-pbar big"><i style="width:${pct(st.done, st.all)}%"></i></span><b>${pct(st.done, st.all)}%</b></div></div></div>
    <nav class="ck-tabs" role="tablist">${tabsHtml()}</nav><div class="ck-view" data-tab-view="${tab}">${body}</div>`);
  main.querySelectorAll('.ck-view textarea,.ck-view input:not([type=search]),.ck-view select').forEach(el => { el.disabled = true; });
  if (tab === 'ex') applyFilter();
}

function select(i) { cur = (i + list.length) % list.length; S = list[cur].S; meta = list[cur].res; }
async function openFiles(files) {
  const errs = []; let first = -1;
  for (const file of [...(files || [])]) {
    let text = ''; try { text = await file.text(); } catch { errs.push(`${file.name}: файл не вдалося прочитати.`); continue; }
    const res = unpackGame(text); if (!res.ok) { errs.push(`${file.name}: ${res.error}`); continue; }
    let sim; try { sim = new Sim(res.state); } catch { errs.push(`${file.name}: гру не вдалося відновити.`); continue; }
    const key = `${sim.s.founder.name}|${sim.s.company.name}`, at = list.findIndex(e => e.key === key);
    if (at >= 0) { list[at] = { res, S: sim, key }; first = first < 0 ? at : first; } else { list.push({ res, S: sim, key }); first = first < 0 ? list.length - 1 : first; }
  }
  error = errs.join(' ');
  if (first >= 0) { select(first); tab = list.length > 1 && (files.length > 1) ? 'class' : 'over'; } else if (list.length && cur < 0) select(0);
  render(); if (first >= 0) scrollTo(0, 0);
}
const pick = () => { const i = document.createElement('input'); i.type = 'file'; i.multiple = true; i.accept = '.edvault,.json,application/json,text/plain'; i.onchange = () => openFiles(i.files); i.click(); };
// відкрити вправу в роботі учня: вкладка «Вправи», фільтр «усі», розгорнути й прокрутити
function jumpTo(id) {
  tab = 'ex'; flt = 'all'; q = ''; render();
  const d = document.getElementById('ckx-' + id); if (!d) return;
  d.hidden = false; d.open = true; fillEx(d); d.scrollIntoView({ block: 'center' }); d.classList.add('ck-flash'); setTimeout(() => d.classList.remove('ck-flash'), 1400);
}
function nextUnmarked() {
  const box = $('exl'); if (!box) return;
  const list2 = [...box.querySelectorAll('.ck-ex:not([hidden])')].filter(d => d.dataset.st !== 'none' && !d.dataset.markV);
  const open = [...box.querySelectorAll('.ck-ex[open]')].pop(), after = open ? list2.filter(d => open.compareDocumentPosition(d) & Node.DOCUMENT_POSITION_FOLLOWING) : list2, d = after[0] || list2[0];
  if (!d) return;
  box.querySelectorAll('.ck-ex[open]').forEach(x => { x.open = false; });
  d.open = true; fillEx(d); d.scrollIntoView({ block: 'start', behavior: 'smooth' }); d.classList.add('ck-flash'); setTimeout(() => d.classList.remove('ck-flash'), 1200);
}
function mark(id, v) {
  setMark(id, v);
  const d = document.getElementById('ckx-' + id), m = mkOf()[id] || '';
  if (d) {
    d.dataset.markV = m; d.classList.toggle('m-ok', m === 'ok'); d.classList.toggle('m-redo', m === 'redo');
    d.querySelectorAll('[data-mark]').forEach(b => { const on = b.dataset.mark === m; b.classList.toggle('on', on); b.classList.toggle(b.dataset.mark, on); b.setAttribute('aria-pressed', String(on)); });
  }
  main.querySelectorAll('[data-flt="unmarked"] small').forEach(s => { s.textContent = exAll().filter(e => exState(S, e.id) !== 'none' && !mkOf()[e.id]).length; });
  if (flt === 'unmarked') applyFilter();
}

document.addEventListener('click', e => {
  if (e.target.closest('#pick')) return pick();
  if (e.target.closest('#csv')) return csv();
  if (e.target.closest('#prt')) { if (tab === 'ex') main.querySelectorAll('.ck-ex:not([hidden])').forEach(d => { d.open = true; fillEx(d); }); return print(); }
  const mb = e.target.closest('[data-mark]'); if (mb) { e.preventDefault(); e.stopPropagation(); return mark(mb.dataset.ex, mb.dataset.mark); }
  const nx = e.target.closest('[data-next]'); if (nx) return nextUnmarked();
  const st = e.target.closest('[data-step]'); if (st) { select(cur + +st.dataset.step); return render(); }
  const g = e.target.closest('[data-go]'); if (g) { tab = g.dataset.go === 'iv' ? 'iv' : 'ex'; flt = g.dataset.go === 'weak' ? 'weak' : g.dataset.go === 'started' ? 'started' : 'all'; q = ''; return render(); }
  const o = e.target.closest('[data-open]'); if (o) { select(+o.dataset.open); const j = e.target.closest('[data-jump]')?.dataset.jump; if (j) return jumpTo(j); tab = 'over'; return render(); }
  const jp = e.target.closest('[data-jump]'); if (jp) return jumpTo(jp.dataset.jump);
  const t = e.target.closest('[data-tab]'); if (t) { tab = t.dataset.tab; return render(); }
  const f = e.target.closest('[data-flt]'); if (f) { flt = f.dataset.flt; main.querySelectorAll('[data-flt]').forEach(b => b.classList.toggle('on', b === f)); return applyFilter(); }
  const a = e.target.closest('[data-all]'); if (a) { main.querySelectorAll('.ck-ex:not([hidden])').forEach(d => { if (d.dataset.st !== 'none') { d.open = a.dataset.all === '1'; if (d.open) fillEx(d); } }); return; }
  const sr = e.target.closest('[data-sort]'); if (sr) { sortD = sortK === sr.dataset.sort ? -sortD : 1; sortK = sr.dataset.sort; render(); }
});
document.addEventListener('input', e => {
  if (e.target.id === 'q') { q = e.target.value; applyFilter(); }
  if (e.target.id === 'cq') { cq = e.target.value; const p = e.target.selectionStart; render(); const n = $('cq'); if (n) { n.focus(); n.setSelectionRange(p, p); } }
});
document.addEventListener('change', e => {
  if (e.target.id === 'who') { select(+e.target.value); render(); }
  if (e.target.id === 'att') { onlyAtt = e.target.checked; render(); }
});
document.addEventListener('keydown', e => {
  if (!list.length || e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('input,textarea,select,[contenteditable]')) return;
  if (e.key === 'ArrowRight' && list.length > 1 && tab !== 'class') { select(cur + 1); render(); e.preventDefault(); }
  else if (e.key === 'ArrowLeft' && list.length > 1 && tab !== 'class') { select(cur - 1); render(); e.preventDefault(); }
  else if (/^[1-9]$/.test(e.key) && TABS()[+e.key - 1]) { tab = TABS()[+e.key - 1][0]; render(); }
  else if ((e.key === 'n' || e.key === 'т') && tab === 'ex') nextUnmarked();
});
document.addEventListener('toggle', e => { if (e.target.matches?.('.ck-ex[open]')) fillEx(e.target); }, true);
addEventListener('dragover', e => { e.preventDefault(); $('dz')?.classList.add('over'); document.body.classList.add('ck-dragging'); });
addEventListener('dragleave', e => { if (!e.relatedTarget) { $('dz')?.classList.remove('over'); document.body.classList.remove('ck-dragging'); } });
addEventListener('drop', e => { e.preventDefault(); $('dz')?.classList.remove('over'); document.body.classList.remove('ck-dragging'); openFiles(e.dataTransfer?.files); });
window.Checker = { open: f => openFiles([f]), openMany: openFiles, get S() { return S; }, get list() { return list; }, get marks() { return marks; } };
render();
