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
import './ex1.js'; import './ex-need.js'; import './ex-start.js'; import './ex1b.js'; import './ex-aud.js'; import './ex-brand.js'; import './ex-bbook.js';
import './ex2.js'; import './ex3.js'; import './ex3b.js'; import './ex4.js'; import './ex5.js'; import './ex6.js'; import './ex7.js'; import './ex8.js'; import './ex9.js';

const $ = id => document.getElementById(id), main = $('main'), tools = $('tools');
// список учнів: кожен — { res, S, key }. Відкрити можна кілька файлів одразу (клас)
const list = []; let cur = -1, S = null, meta = null, tab = 'over', error = '', flt = 'all', q = '';

const ui = { view: 'plan' };
const ro = html => `<div class="ck-ro" inert>${html}</div>`;
const safe = (fn, m = 'Цей розділ не вдалося показати.') => { try { return fn(); } catch { return `<p class="muted">${m}</p>`; } };
const exState = (S, id) => S.s.ex?.done?.[id] ? 'done' : S.s.ex?.d?.[id] ? 'started' : 'none';
const stat = S => {
  const all = exAll(), done = all.filter(e => exDone(S, e.id)), st = done.reduce((a, e) => a + exStars(S, e.id), 0), info = stageInfo(S);
  return { done: done.length, all: all.length, stars: st, weak: done.filter(e => exStars(S, e.id) <= 1).length, stage: Math.min(info.reached + 1, STAGES.length), info };
};

const dropZone = () => `<section class="ck-drop" id="dz"><h1>Відкрийте файл збереження учня</h1><p>Перетягніть сюди файл <b>.edvault</b> (підійде й старий <b>.json</b>) або оберіть його на комп’ютері. Можна відкрити одразу кілька файлів: тоді з’явиться таблиця всього класу. Усе показується лише для перегляду: змінити роботу тут не можна.</p><button class="btn primary" id="pick" type="button">${icon('open', 16)} Обрати файли</button></section>`;

function attention() {
  const s = S.s, st = stat(S), out = [], iv = s.interviews || [];
  if (meta.edited) out.push(['bad', 'Файл змінювали після збереження: дані не збігаються з контрольною сумою.']);
  const cur = st.info.list[st.info.reached] || st.info.list.at(-1);
  if (cur && !cur.done) out.push(['', `Зараз на етапі ${st.info.reached + 1} «${cur.t}»: виконано ${cur.n} з ${cur.m} обов’язкових кроків.`]);
  if (st.weak) out.push(['warn', `Вправ, завершених «як є» або з однією зіркою: ${st.weak}. Варто переглянути, чи учень старався.`]);
  if (!iv.length) out.push(['warn', 'Учень не провів жодного інтерв’ю з клієнтами.']);
  else { const bad = iv.filter(v => v.bad).length; if (bad) out.push(['warn', `Інтерв’ю з підказувальними запитаннями: ${bad} з ${iv.length}.`]); }
  const started = exAll().filter(e => exState(S, e.id) === 'started').length;
  if (started) out.push(['', `Розпочато, але не завершено вправ: ${started}.`]);
  if (!out.length) out.push(['ok', 'Зауважень немає.']);
  return `<section class="card"><header class="card-h"><h3>На що звернути увагу</h3></header><ul class="ck-att">${out.map(([k, x]) => `<li class="${k}">${esc(x)}</li>`).join('')}</ul></section>`;
}
function overview() {
  const sum = summaryOf(S), st = stat(S);
  const rows = st.info.list.map((x, i) => { const ex = exOf(i), dn = ex.filter(e => exDone(S, e.id)).length; return `<li class="ck-sr"><span class="ck-sn">${x.done ? icon('check', 14) : i + 1}</span><span class="ck-sl"><b>${esc(x.t)}</b><small>обов’язкових кроків: ${x.n} з ${x.m}${ex.length ? ` · вправ: ${dn} з ${ex.length}` : ''}</small></span><i class="ck-pb"><u style="width:${x.m ? Math.round(x.n / x.m * 100) : 0}%"></u></i></li>`; }).join('');
  return `${attention()}<section class="card" style="margin-top:14px"><header class="card-h"><h3>Проходження етапів</h3><span class="muted sm">зірок за вправи: ${st.stars}</span></header><ul class="ck-stages">${rows}</ul></section>
    <section class="card" style="margin-top:14px"><header class="card-h"><h3>Підсумок</h3></header><dl class="ck-sum">${Object.entries(sum).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>`;
}

function exBlock(def) {
  const done = S.s.ex?.done?.[def.id], k = exState(S, def.id);
  const chip = done ? `<span class="chip ok">${icon('check', 14)} виконано · ${stars(done.s)} · тиждень ${done.w + 1}</span>` : k === 'started' ? '<span class="chip warn">розпочато, не завершено</span>' : '<span class="chip">не розпочато</span>';
  const text = k === 'none' ? '' : JSON.stringify(S.s.ex.d[def.id]).toLowerCase();
  return `<details class="ck-ex ${k === 'none' ? 'none' : ''}" data-ex="${def.id}" data-st="${k}" data-txt="${esc(text)}"><summary>${icon(def.icon, 20)}<b>${esc(def.t)}</b>${def.opt ? '<span class="muted">додаткова</span>' : ''}${chip}</summary><div class="ck-body" data-body></div></details>`;
}
function exercises() {
  const n = k => exAll().filter(e => exState(S, e.id) === k).length;
  const F = [['all', 'Усі', exAll().length], ['done', 'Виконані', n('done')], ['started', 'Розпочаті', n('started')], ['none', 'Не розпочаті', n('none')]];
  return `<div class="ck-bar"><div class="ck-flt" role="group" aria-label="Фільтр">${F.map(([k, t, c]) => `<button type="button" data-flt="${k}" class="${flt === k ? 'on' : ''}">${t} <small>${c}</small></button>`).join('')}</div>
    <input class="inp ck-q" id="q" type="search" placeholder="Пошук по відповідях учня" value="${esc(q)}" aria-label="Пошук по відповідях"><button class="btn sm" type="button" data-all="1">Розгорнути все</button><button class="btn sm" type="button" data-all="0">Згорнути</button></div>
    <div id="exl">${STAGES.map((st, i) => { const l = exOf(i); return l.length ? `<section class="ck-st"><h3>Етап ${i + 1}. ${esc(STAGE_T[i])} <span class="muted sm">${l.filter(e => exDone(S, e.id)).length} з ${l.length} виконано</span></h3>${l.map(exBlock).join('')}</section>` : ''; }).join('')}<p class="muted ck-none" hidden>За цим фільтром нічого не знайдено.</p></div>`;
}
function applyFilter() {
  const box = $('exl'); if (!box) return; const ql = q.trim().toLowerCase();
  box.querySelectorAll('.ck-ex').forEach(d => { d.hidden = !((flt === 'all' || d.dataset.st === flt) && (!ql || d.dataset.txt.includes(ql) || d.querySelector('b').textContent.toLowerCase().includes(ql))); });
  box.querySelectorAll('.ck-st').forEach(s => { s.hidden = !s.querySelector('.ck-ex:not([hidden])'); });
  box.querySelector('.ck-none').hidden = !![...box.querySelectorAll('.ck-st')].some(s => !s.hidden);
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
  return `<section class="card"><header class="card-h"><h3>${icon('mic')} Інтерв’ю з клієнтами</h3><span class="muted sm">усього: ${l.length}</span></header><div class="ivlist">${[...l].reverse().map(v => `<details class="ivh ck-iv"><summary><b>${esc(v.name)}</b> <span class="muted">${esc(v.who)} · ${esc(S.seg(v.seg)?.short || '')} · тиждень ${v.w + 1}</span>${v.bad ? `<span class="chip warn">підказувальні запитання: ${v.bad}</span>` : '<span class="chip ok">лише факти</span>'}</summary><div class="chat">${v.log.map(x => `<p class="q">${esc(x.q)}</p><p class="a">${esc(x.a)}</p>`).join('')}</div></details>`).join('')}</div></section>`;
}

/* таблиця класу: усі відкриті файли одним списком */
let sortK = 'name', sortD = 1;
const rowsOf = () => list.map((e, i) => { const st = stat(e.S), s = e.S.s; return { i, name: s.founder.name, group: s.founder.group || '', company: s.company.name, stage: st.stage, done: st.done, all: st.all, stars: st.stars, week: s.week + 1, cash: s.cash, edited: e.res.edited, weak: st.weak }; });
function classTable() {
  const rs = rowsOf().sort((a, b) => (typeof a[sortK] === 'string' ? a[sortK].localeCompare(b[sortK], 'uk') : a[sortK] - b[sortK]) * sortD);
  const th = (k, t) => `<th><button type="button" data-sort="${k}" class="${sortK === k ? 'on' : ''}">${t}${sortK === k ? (sortD > 0 ? ' ↑' : ' ↓') : ''}</button></th>`;
  return `<section class="card"><header class="card-h"><h3>Клас</h3><span class="muted sm">учнів: ${rs.length}</span><button class="btn sm" type="button" id="csv">${icon('save', 14)} Таблиця для Excel</button></header>
    <div style="overflow-x:auto"><table class="tbl ck-tbl"><thead><tr>${th('name', 'Учень')}${th('group', 'Клас')}${th('company', 'Компанія')}${th('stage', 'Етап')}${th('done', 'Вправи')}${th('stars', 'Зірки')}${th('week', 'Тиждень')}<th></th></tr></thead>
    <tbody>${rs.map(r => `<tr><td><button type="button" class="ck-lnk" data-open="${r.i}">${esc(r.name)}</button></td><td>${esc(r.group) || '—'}</td><td>${esc(r.company)}</td><td>${r.stage} з ${STAGES.length}</td><td>${r.done} з ${r.all}</td><td>${r.stars}</td><td>${r.week}</td><td>${r.edited ? '<span class="chip warn">змінено</span>' : ''}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function csv() {
  const q = v => `"${String(v).replace(/"/g, '""')}"`, rs = rowsOf();
  const text = '﻿' + [['Учень', 'Клас', 'Компанія', 'Етап', 'Виконано вправ', 'Усього вправ', 'Зірок', 'Тиждень', 'Гроші, грн', 'Файл змінено'], ...rs.map(r => [r.name, r.group, r.company, r.stage, r.done, r.all, r.stars, r.week, Math.round(r.cash), r.edited ? 'так' : 'ні'])].map(r => r.map(q).join(';')).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' })); a.download = 'startup_klas.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

const TABS = () => [...(list.length > 1 ? [['class', 'Клас']] : []), ['over', 'Огляд'], ['ex', 'Вправи'], ['brand', 'Бренд'], ['plan', 'Бізнес-план'], ['iv', "Інтерв'ю"], ['rep', 'Журнал і звіт']];

function render() {
  const err = error ? `<div class="ck-err" role="alert">${esc(error)}</div>` : '';
  if (!list.length) { fill(tools, ''); fill(main, dropZone() + err); return; }
  fill(tools, `<button class="btn" id="pick" type="button">${icon('open', 16)} Додати файли</button><button class="btn" id="prt" type="button">${icon('printer', 16)} Друк</button>`);
  if (tab === 'class' && list.length < 2) tab = 'over';
  const bar = `${err}${list.length > 1 ? `<label class="ck-sw">Учень: <select id="who" class="inp">${list.map((e, i) => `<option value="${i}" ${i === cur ? 'selected' : ''}>${esc(e.S.s.founder.name)} · ${esc(e.S.s.company.name)}</option>`).join('')}</select></label>` : ''}`;
  if (tab === 'class') { fill(main, `${bar}<nav class="ck-tabs" role="tablist">${tabsHtml()}</nav>${classTable()}`); return; }
  const s = S.s, c = s.company, saved = meta.savedAt ? new Date(meta.savedAt).toLocaleString('uk-UA') : '';
  const body = tab === 'over' ? overview() : tab === 'ex' ? exercises() : tab === 'brand' ? safe(brand) : tab === 'plan' ? ro(safe(() => marketViews.plan.render(S, ui))) : tab === 'iv' ? interviews() : ro(safe(() => coreViews.report.render(S, ui)));
  fill(main, `${bar}${meta.edited ? '<div class="ck-warn" role="alert"><b>Увага.</b> Дані у файлі не збігаються з контрольною сумою: файл могли змінювати вручну після збереження.</div>' : ''}
    <div class="ck-who">${logo(c, 56)}<div><h1>${esc(s.founder.name)}${s.founder.group ? ` · ${esc(s.founder.group)}` : ''}</h1><p>${esc(c.name)} · ${esc(S.I.t)} · ${money(s.cash)} на рахунку${saved ? ` · збережено ${esc(saved)}` : ''}</p></div></div>
    <nav class="ck-tabs" role="tablist">${tabsHtml()}</nav><div class="ck-view" data-tab-view="${tab}">${body}</div>`);
  main.querySelectorAll('.ck-view textarea,.ck-view input:not([type=search]),.ck-view select').forEach(el => { el.disabled = true; });
  if (tab === 'ex') applyFilter();
}
const tabsHtml = () => TABS().map(([k, t]) => `<button type="button" role="tab" aria-selected="${tab === k}" class="${tab === k ? 'on' : ''}" data-tab="${k}">${t}</button>`).join('');

function select(i) { cur = i; S = list[i].S; meta = list[i].res; }
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

document.addEventListener('click', e => {
  if (e.target.closest('#pick')) return pick();
  if (e.target.closest('#csv')) return csv();
  if (e.target.closest('#prt')) { if (tab === 'ex') main.querySelectorAll('.ck-ex:not([hidden])').forEach(d => { d.open = true; fillEx(d); }); return print(); }
  const t = e.target.closest('[data-tab]'); if (t) { tab = t.dataset.tab; return render(); }
  const f = e.target.closest('[data-flt]'); if (f) { flt = f.dataset.flt; main.querySelectorAll('[data-flt]').forEach(b => b.classList.toggle('on', b === f)); return applyFilter(); }
  const a = e.target.closest('[data-all]'); if (a) { main.querySelectorAll('.ck-ex:not([hidden])').forEach(d => { if (d.dataset.st !== 'none') d.open = a.dataset.all === '1'; }); return; }
  const o = e.target.closest('[data-open]'); if (o) { select(+o.dataset.open); tab = 'over'; return render(); }
  const sr = e.target.closest('[data-sort]'); if (sr) { sortD = sortK === sr.dataset.sort ? -sortD : 1; sortK = sr.dataset.sort; render(); }
});
document.addEventListener('input', e => { if (e.target.id === 'q') { q = e.target.value; applyFilter(); } });
document.addEventListener('change', e => { if (e.target.id === 'who') { select(+e.target.value); render(); } });
document.addEventListener('toggle', e => { if (e.target.matches?.('.ck-ex[open]')) fillEx(e.target); }, true);
addEventListener('dragover', e => { e.preventDefault(); $('dz')?.classList.add('over'); });
addEventListener('dragleave', e => { if (!e.relatedTarget) $('dz')?.classList.remove('over'); });
addEventListener('drop', e => { e.preventDefault(); $('dz')?.classList.remove('over'); openFiles(e.dataTransfer?.files); });
window.Checker = { open: f => openFiles([f]), openMany: openFiles, get S() { return S; }, get list() { return list; } };
render();
