// Симулятор стартапу · вправи: реєстр, стан у збереженні, спільні елементи розмітки, введення й перетягування.
// Кожна вправа — це опис { id, stage, t, d, icon, intro, data, view, live, ready, acts, finish }.
// Усе, що учень вводить чи обирає, лежить у s.ex.d[id] і потрапляє в збереження та файл разом зі станом гри.
import { esc, term, modal, toast, fill, failCard } from './ui.js';
import { aiPrompts, AI_TIPS } from './ai.js';
import { icon } from './icons.js';

export const STAGE_T = ['Ніша й продукт', 'Аудиторія й бренд', 'Позиціонування', 'Ціна й гроші', 'Гроші на старт', 'Просування', 'Команда', 'Фриланс', 'Платежі й капітал'];

export const EX = {};
export const reg = (...defs) => defs.forEach(d => { EX[d.id] = d; });
const R = S => (S.s.ex ||= { d: {}, done: {} });
// дані вправи: створюються з початкових значень при першому відкритті
const checked = new WeakSet();
export const X = (S, id) => {
  const r = R(S);
  let d = r.d[id];
  if (!d || typeof d !== 'object' || Array.isArray(d)) d = r.d[id] = EX[id]?.data ? EX[id].data(S) : {};
  // пошкоджений файл: поля з іншим типом, ніж у початкових даних, скидаємо до типових
  else if (!checked.has(d)) {
    checked.add(d);
    if (EX[id]?.data) { try { const base = EX[id].data(S); for (const [k, v] of Object.entries(base)) if (!(k in d) || (v !== null && typeof v !== typeof d[k]) || Array.isArray(v) !== Array.isArray(d[k]) || (v === null) !== (d[k] === null)) d[k] = v; } catch { /* лишаємо як є */ } }
  }
  return d;
};
// читання не створює s.ex: інакше підрахунок змінював би стан гри
export const exDone = (S, id) => !!S.s.ex?.done?.[id];
export const exStars = (S, id) => S.s.ex?.done?.[id]?.s || 0;
export const exCount = S => Object.keys(S.s.ex?.done || {}).length;
export const exAll = () => Object.values(EX).sort((a, b) => (a.ord || 0) - (b.ord || 0));
export const exOf = stage => exAll().filter(e => e.stage === stage);

/* ═════════ шляхи в об'єкті ═════════ */
export const get = (o, p) => String(p).split('.').reduce((a, k) => a?.[k], o);
export function put(o, p, v) { const ks = String(p).split('.'), last = ks.pop(); const t = ks.reduce((a, k) => (a[k] ??= {}), o); t[last] = v; return v; }
const parse = (v, t) => t === 'n' ? +v : t === 'b' ? v === '1' || v === 'true' : v;

/* ═════════ дрібні елементи розмітки ═════════ */
const attrs = o => Object.entries(o || {}).map(([k, v]) => ` data-${k}="${esc(v)}"`).join('');
/* Для учня: лише позитивна відзнака, без порожніх зірок (оцінку 1–3 бачить викладач). */
export const mastery = n => n >= 3 ? `<span class="chip gold">${icon('star', 14)} Майстерно</span>` : '';
export const stars = (n, max = 3) => `<span class="stars" aria-label="${n} з ${max}">${Array.from({ length: max }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`;
// кнопка-дія вправи: data-do — назва дії, a/b/c — довільні параметри
export const xb = (id, act, label, { a, b, c, i, p, v, from, max, cls = '', ic, title = '', dis = false } = {}) => `<button type="button" class="btn ${cls}" data-act="ex" data-ex="${id}" data-do="${act}"${attrs({ a, b, c, i, p, v, from, max })}${title ? ` title="${esc(title)}" aria-label="${esc(title)}"` : ''}${dis ? ' disabled' : ''}>${ic ? icon(ic, 16) : ''}${label}</button>`;
// пілюля, що ставить значення (радіо) чи вмикає/вимикає (набір)
export const xp = (id, p, v, label, on, { t = 's', set = 'set', cls = '', sub = '', max } = {}) => `<button type="button" class="xp ${on ? 'on' : ''} ${cls}" aria-pressed="${!!on}" data-act="ex" data-ex="${id}" data-do="${set}" data-p="${esc(p)}" data-v="${esc(v)}" data-t="${t}"${max ? ` data-max="${max}"` : ''}><span>${label}</span>${sub ? `<small>${sub}</small>` : ''}</button>`;
// ліміт довжини м'який: числа в описах вправ — орієнтир, а не стеля (раніше тексту бракувало)
const lim = (max, area) => area ? Math.max(max * 6, 1500) : Math.max(max * 3, 240);
export const xin = (id, p, d, { ph = '', max = 120, label = '', area = false, rows = 3, cls = '', hint = '', v } = {}) => {
  const val = v ?? get(d, p) ?? '';
  const el = area ? `<textarea class="inp" data-exi="${id}" data-p="${esc(p)}" rows="${rows}" maxlength="${lim(max, true)}" placeholder="${esc(ph)}">${esc(val)}</textarea>` : `<input class="inp" type="text" data-exi="${id}" data-p="${esc(p)}" maxlength="${lim(max, false)}" placeholder="${esc(ph)}" value="${esc(val)}" autocomplete="off">`;
  return `<label class="xf ${cls}">${label ? `<span class="xf-l">${label}</span>` : ''}${el}${hint ? `<small>${hint}</small>` : ''}</label>`;
};
// число з розділювачами тисяч, якщо це число
export const fnum = v => (v !== '' && Number.isFinite(+v) ? (+v).toLocaleString('uk-UA') : v);
export const xsl = (id, p, d, { min = 0, max = 100, step = 1, label = '', u = '', v, cls = '' } = {}) => {
  const val = v ?? get(d, p) ?? min;
  return `<div class="sl xsl ${cls}"><label>${label}</label><input type="range" data-exi="${id}" data-p="${esc(p)}" min="${min}" max="${max}" step="${step}" value="${val}" data-u="${esc(u)}" aria-label="${esc(label.replace(/<[^>]+>/g, ''))}"><output>${fnum(val)}${esc(u)}</output></div>`;
};
export const xnum = (id, p, d, { min = 0, max = 1e9, step = 1, label = '', u = '', cls = '' } = {}) => `<label class="xf xnum ${cls}"><span class="xf-l">${label}</span><span class="xn"><input class="inp" type="number" inputmode="decimal" data-exi="${id}" data-p="${esc(p)}" min="${min}" max="${max}" step="${step}" value="${get(d, p) ?? ''}">${u ? `<i>${esc(u)}</i>` : ''}</span></label>`;
export const xsel = (id, p, d, list, { label = '', cls = '' } = {}) => `<label class="xf ${cls}">${label ? `<span class="xf-l">${label}</span>` : ''}<select class="inp" data-exi="${id}" data-p="${esc(p)}">${list.map(([v, t]) => `<option value="${esc(v)}" ${String(get(d, p)) === String(v) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>`;
export const xcol = (id, p, d, { label = '' } = {}) => `<label class="xf xcol"><span class="xf-l">${label}</span><input type="color" data-exi="${id}" data-p="${esc(p)}" value="${esc(get(d, p) || '#6366f1')}"></label>`;
export const tip = (html, kind = '') => `<p class="x-tip ${kind}">${icon(kind === 'bad' ? 'alert' : kind === 'ok' ? 'check' : 'bulb', 16)}<span>${html}</span></p>`;
export const box = (title, body, { cls = '', ic, side = '' } = {}) => `<section class="xbox ${cls}"><header>${ic ? icon(ic, 18) : ''}<h2>${title}</h2>${side ? `<span class="xs">${side}</span>` : ''}</header>${body}</section>`;
export const checks = list => `<ul class="x-checks">${list.map(([ok, t, hint]) => `<li class="${ok ? 'ok' : ''}">${icon(ok ? 'check' : 'minus', 14)}<span>${t}${hint && !ok ? `<small>${hint}</small>` : ''}</span></li>`).join('')}</ul>`;
export const bar = (v, { color = 'var(--acc)', label = '' } = {}) => `<div class="x-bar" ${label ? `role="meter" aria-valuenow="${Math.round(v * 100)}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(label)}"` : 'aria-hidden="true"'}><i style="width:${Math.max(0, Math.min(1, v)) * 100}%;background:${color}"></i></div>`;
export const money0 = n => Math.round(n).toLocaleString('uk-UA').replace(/\s/g, ' ') + ' ₴';
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const sumOf = a => a.reduce((x, y) => x + y, 0);

// власний генератор випадкових чисел із зерном: однакове зерно — однаковий результат
export function mk(seed) {
  let t = seed | 0;
  const next = () => { t = (t + 0x6D2B79F5) | 0; let x = Math.imul(t ^ (t >>> 15), t | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  return { next, int: n => Math.floor(next() * n), range: (a, b) => a + next() * (b - a), pick: a => a[Math.floor(next() * a.length)], norm: (m = 0, sd = 1) => m + sd * Math.sqrt(-2 * Math.log(next() || 1e-9)) * Math.cos(2 * Math.PI * next()), chance: p => next() < p };
}
// хеш рядка в число: для стабільних «випадкових» оцінок
// SMART-ціль: що можна вимірювати й як це читати
export const goalMetrics = () => ({
  paid: { t: 'Платні клієнти', goal: 'Мати', min: 5, max: 1000, step: 5, def: 30, u: '', now: S => S.paidUsers(), fmt: n => `${Math.round(n).toLocaleString('uk-UA')} платних клієнтів` },
  users: { t: 'Користувачі', goal: 'Мати', min: 10, max: 5000, step: 10, def: 200, u: '', now: S => S.activeUsers(), fmt: n => `${Math.round(n).toLocaleString('uk-UA')} користувачів` },
  mrr: { t: 'Виручка на місяць', goal: 'Заробляти', min: 5000, max: 1000000, step: 5000, def: 50000, u: ' ₴', now: S => S.mrr(), fmt: n => `${Math.round(n).toLocaleString('uk-UA').replace(/\s/g, ' ')} ₴ на місяць` },
  cash: { t: 'Гроші на рахунку', goal: 'Мати на рахунку', min: 100000, max: 5000000, step: 50000, def: 500000, u: ' ₴', now: S => S.s.cash, fmt: n => `${Math.round(n).toLocaleString('uk-UA').replace(/\s/g, ' ')} ₴` },
});
// стан цілі для головної: прогрес, залишок тижнів, статус
export function goalNow(S) {
  const g = S.s.goal; if (!g) return null;
  const M = goalMetrics()[g.metric], now = M.now(S), from = g.from0 ?? 0, pct = clamp(now / g.target, 0, 1), left = g.to - S.s.week;
  return { g, M, now, pct, left, status: now >= g.target ? 'done' : left < 0 ? 'late' : 'on' };
}
export const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };


// радарна діаграма: значення 0..max за осями-підписами; другий ряд (необов'язково) — для порівняння
export function radar(vals, labels, { max = 5, size = 280, color = 'var(--acc)', vals2, color2 = '#f59e0b' } = {}) {
  const n = vals.length, c = size / 2, R = size / 2 - 70;
  const pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n, r = R * v / max; return [c + Math.cos(a) * r, c + Math.sin(a) * r]; };
  const poly = vs => vs.map((v, i) => pt(i, v).map(x => x.toFixed(1)).join(',')).join(' ');
  const rings = Array.from({ length: max }, (_, k) => `<polygon points="${poly(vals.map(() => k + 1))}" fill="none" stroke="#cfd6e0" stroke-width="1"/>`).join('');
  const axes = vals.map((_, i) => { const [x, y] = pt(i, max); return `<line x1="${c}" y1="${c}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#cfd6e0"/>`; }).join('');
  const tx = labels.map((t, i) => { const [x, y] = pt(i, max + .95), a = Math.cos(-Math.PI / 2 + i * 2 * Math.PI / n); return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${a > .3 ? 'start' : a < -.3 ? 'end' : 'middle'}" font-size="12" font-weight="600" fill="#3a4457">${esc(t)}</text>`; }).join('');
  return `<svg class="radar" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Діаграма: ${esc(labels.map((l, i) => l + ' ' + vals[i]).join(', '))}">${rings}${axes}${vals2 ? `<polygon points="${poly(vals2)}" fill="${color2}" fill-opacity=".18" stroke="${color2}" stroke-width="2" stroke-dasharray="5 4"/>` : ''}<polygon points="${poly(vals)}" fill="${color}" fill-opacity=".22" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>${vals.map((v, i) => { const [x, y] = pt(i, v); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="${color}"/>`; }).join('')}${tx}</svg>`;
}
// підпис проценту з одним знаком
export const pc = (x, d = 0) => (x * 100).toFixed(d).replace('.', ',') + '%';
export const plural = (n, a, b, c) => { const m = Math.abs(n) % 100, k = m % 10; return m > 10 && m < 20 ? c : k === 1 ? a : k >= 2 && k <= 4 ? b : c; };


// запитання з вибором: відповіді лежать у d[p][i] (номер варіанта), після відповіді показується пояснення
// list = [{ q, a: ['варіант', ...], ok: номер правильного, why: 'пояснення' }]
export function quiz(id, p, d, list) {
  const cur = get(d, p) || {};
  return list.map((x, i) => { const v = cur[i], done = v != null; return `<div class="quiz"><b>${i + 1}. ${x.q}</b><div class="xrow">${x.a.map((t, k) => xp(id, `${p}.${i}`, k, esc(t), v === k, { t: 'n', cls: done ? (k === x.ok ? 'right' : v === k ? 'wrong' : '') : '' })).join('')}</div>${done ? `<p class="x-tip ${v === x.ok ? 'ok' : 'warn'}">${icon(v === x.ok ? 'check' : 'info', 16)}<span>${v === x.ok ? 'Правильно. ' : 'Не зовсім. '}${x.why}</span></p>` : ''}</div>`; }).join('');
}
export const quizOk = (d, p, list) => { const cur = get(d, p) || {}; return list.filter((x, i) => cur[i] === x.ok).length; };
export const quizDone = (d, p, list) => { const cur = get(d, p) || {}; return list.filter((x, i) => cur[i] != null).length; };

/* ═════════ сторінка вправи ═════════ */
// наступна невиконана вправа цього ж етапу (щоб не вертатись щоразу на аркуш)
const nextEx = (S, def) => { const l = exOf(def.stage), i = l.indexOf(def); return [...l.slice(i + 1), ...l.slice(0, i)].find(e => !exDone(S, e.id) && !e.opt) || null; };
function footInner(S, def, d) {
  const r = def.ready(S, d), done = S.s.ex.done[def.id];
  return `<div class="ex-st">${done ? `<span class="chip ok">${icon('check', 14)} Виконано</span>${mastery(done.s)}` : r.ok ? `<span class="chip ok">${icon('check', 14)} Можна завершувати</span>` : `<span class="chip">${icon('info', 14)} Можна завершити й так. Для повної вправи: ${esc((r.msg || 'заповніть решту').replace(/^./, c => c.toLowerCase()))}</span>`}</div>
    <div class="ex-btns"><button class="btn ghost" data-act="exBack" data-ex="${def.id}">До етапу</button>${nextEx(S, def) && (done || r.ok) ? `<button class="btn" data-act="go" data-to="ex-${nextEx(S, def).id}">Далі: ${esc(nextEx(S, def).t)}</button>` : ''}<button class="btn primary" data-act="exDone" data-ex="${def.id}">${done ? 'Зберегти зміни' : r.ok ? 'Завершити вправу' : 'Завершити як є'}</button></div>`;
}
export function exPage(def) {
  return (S, ui) => {
    try { return page(def, S, ui); } catch (e) {
      console.error('Вправа ' + def.id, e);
      return `<div class="ex" data-ex-root="${def.id}"><button class="ex-back" data-act="exBack" data-ex="${def.id}">${icon('left', 16)} Назад</button>${failCard('Вправу не вдалося показати', 'Її дані в збереженні пошкоджені. Решта гри працює. Можна скинути дані цієї вправи.', `<button class="btn" data-act="exReset" data-ex="${def.id}">Скинути дані вправи</button>`)}</div>`;
    }
  };
}
// «Що зробити»: розділи вправи пронумеровано кроками, по кліку — перехід до розділу
const stripTags = s => String(s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
function stepMap(main) {
  const titles = [...main.matchAll(/<section class="xbox[^"]*"><header>(?:<svg[\s\S]*?<\/svg>)?<h2>([\s\S]*?)<\/h2>/g)].map(m => stripTags(m[1]).replace(/^\d+\.\s*/, ''));
  if (titles.length < 2 || titles.length > 8) return '';
  return `<nav class="ex-map" aria-label="Що зробити у вправі"><b>Що зробити</b><ol>${titles.map((t, i) => `<li><button type="button" data-act="exJump" data-i="${i}"><span>${i + 1}</span>${esc(t)}</button></li>`).join('')}</ol></nav>`;
}
function page(def, S, ui) {
    const d = X(S, def.id), done = S.s.ex.done[def.id];
    const main = def.view(S, d, { ui, done });
    return `<div class="ex" data-ex-root="${def.id}">
      <button class="ex-back" data-act="exBack" data-ex="${def.id}">${icon('left', 16)} Етап ${def.stage + 1} · ${esc(STAGE_T[def.stage])}</button>
      <section class="ex-intro"><span class="ex-ic">${icon(def.icon, 26)}</span><button type="button" class="ex-ai" data-act="exAi" data-ex="${def.id}" title="Приклади промптів для ШІ до цієї вправи" aria-label="Приклади промптів для ШІ">${icon('spark', 14)} ШІ</button><div><p>${def.intro}</p>${def.min ? `<small>≈ ${def.min} хв${done ? ` · ви вже виконали цю вправу на тижні ${done.w + 1}` : ''}</small>` : ''}</div></section>
      ${stepMap(main)}
      <div class="ex-body ${def.cols ? 'cols' : ''}">${def.cols ? `<div class="ex-main">${main}</div>` : main}${def.live ? `<div class="ex-live" data-live>${def.live(S, d, { ui, done })}</div>` : ''}</div>
      <footer class="ex-foot" role="group" aria-label="Завершення вправи">${footInner(S, def, d)}</footer></div>`;
}
export const exViews = () => Object.fromEntries(exAll().map(def => [`ex-${def.id}`, { t: def.t, icon: def.icon, render: exPage(def), ex: def.id }]));

/* ═════════ дії ═════════ */
const arr = (d, p) => { const a = get(d, p); if (Array.isArray(a)) return a; put(d, p, []); return get(d, p); };
export const exActs = {
  exReset(C, el) { const def = EX[el.dataset.ex]; if (!def) return; delete C.S.s.ex?.d?.[def.id]; C.render(); C.toast('Дані вправи скинуто', 'good'); },
  ex(C, el) {
    const S = C.S, def = EX[el.dataset.ex]; if (!def) return;
    const d = X(S, def.id), k = el.dataset.do, p = el.dataset.p;
    if (k === 'set') put(d, p, parse(el.dataset.v, el.dataset.t));
    else if (k === 'tog') { const a = arr(d, p), v = parse(el.dataset.v, el.dataset.t), i = a.indexOf(v); if (i < 0) { if (!el.dataset.max || a.length < +el.dataset.max) a.push(v); else { C.toast(`Можна обрати не більше ${el.dataset.max}`, 'bad'); return; } } else a.splice(i, 1); }
    else if (k === 'add') {
      const src = document.querySelector(el.dataset.from), v = (src?.value || '').trim();
      if (!v) { C.toast('Спершу впишіть текст', 'bad'); src?.focus(); return; }
      const a = arr(d, p); if (a.some(x => (x.t ?? x) === v)) { C.toast('Таке вже є', 'bad'); return; }
      if (el.dataset.max && a.length >= +el.dataset.max) { C.toast(`Не більше ${el.dataset.max}`, 'bad'); return; }
      a.push(el.dataset.obj ? { t: v, ...JSON.parse(el.dataset.obj) } : v); if (src) src.value = '';
    } else if (k === 'del') arr(d, p).splice(+el.dataset.i, 1);
    else if (k === 'clear') put(d, p, parse(el.dataset.v ?? '', el.dataset.t));
    else if (def.acts?.[k]) { if (def.acts[k](S, d, el, C) === false) return; }
    if (k === 'set' || k === 'tog') def.onSet?.(S, d, p, el.dataset.v);
    C.render(); C.saveSoon();
  },
  // приклади промптів для ШІ: їх можна скопіювати й вставити у свій улюблений чат-бот
  exAi(C, el) {
    const def = EX[el.dataset.ex]; if (!def) return;
    const list = aiPrompts(C.S, def);
    modal({ title: `Промпти для ШІ · ${def.t}`, wide: true, cls: 'ai-md',
      html: `<p class="sm muted">Скопіюйте промпт, вставте його в чат із ШІ й допишіть свої дані там, де є квадратні дужки. Кожен промпт уже містить роль, опис вашого проєкту й правила відповіді. Це приклади: змінюйте їх під себе.</p>
        <div class="ai-list">${list.map((x, i) => `<article class="ai-it ai-${x.k}"><header><span><b>${esc(x.t)}</b><small class="ai-k">${x.k === 'think' ? 'ШІ ставить запитання' : x.k === 'check' ? 'ШІ перевіряє вашу роботу' : 'ШІ допомагає зробити'}</small></span><button type="button" class="btn sm" data-ai-copy="${i}">${icon('save', 14)} Копіювати</button></header><pre class="ai-p">${esc(x.p)}</pre></article>`).join('')}</div>
        <ul class="ai-tips">${AI_TIPS.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`,
      onOpen: api => api.el.addEventListener('click', async e => {
        const b = e.target.closest('[data-ai-copy]'); if (!b) return;
        const text = list[+b.dataset.aiCopy].p;
        try { await navigator.clipboard.writeText(text); toast('Промпт скопійовано', 'good'); }
        catch { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('Промпт скопійовано', 'good'); } catch { toast('Не вдалося скопіювати: виділіть текст вручну', 'bad'); } ta.remove(); }
      }) });
  },
  exJump(C, el) {
    const b = document.querySelectorAll('.ex-body .xbox')[+el.dataset.i]; if (!b) return;
    b.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    b.classList.add('ex-flash'); setTimeout(() => b.classList.remove('ex-flash'), 1200);
  },
  exBack(C, el) { const def = EX[el.dataset.ex]; C.ui.stage = def?.stage ?? null; C.go('dash'); },
  exDone(C, el) {
    const S = C.S, def = EX[el.dataset.ex], d = X(S, def.id), r = def.ready(S, d), was = S.s.ex.done[def.id];
    // пункти вправи необов'язкові: завершити можна й не все заповнивши. Тоді вправу лише позначаємо виконаною
    // (без дій у грі, які потребують повних даних) з однією зіркою; повна вправа дає більше
    if (!was) {
      if (r.ok) def.finish?.(S, d, C);
      S.s.ex.done[def.id] = { w: S.s.week, s: r.ok ? clamp(r.stars || 2, 1, 3) : 1 };
      C.toast(r.ok ? `Вправу «${def.t}» виконано` : `Вправу «${def.t}» завершено без повного заповнення`, 'good');
    } else {
      if (r.ok) def.finish?.(S, d, C, true);
      S.s.ex.done[def.id].s = clamp(r.ok ? (r.stars || was.s) : was.s, 1, 3); C.toast('Зміни збережено', 'good');
    }
    C.ui.stage = def.stage; C.go('dash');
  },
};

/* ═════════ введення, перетягування, збереження ═════════ */
function patchLive(C, def, d) {
  if (!def) return;
  const ctx = { ui: C.ui, done: C.S.s.ex.done[def.id] };
  // змінюємо лише те, що справді змінилося: інакше кнопка під курсором зникне між натисканням і відпусканням
  const box = document.querySelector('[data-live]'), h1 = box && def.live ? def.live(C.S, d, ctx) : null;
  if (box && h1 != null && box._h !== h1) {
    // поле, у якому людина друкує, може бути всередині цього блоку: після заміни повертаємо в нього курсор
    const act = document.activeElement, keep = act && box.contains(act) && act.dataset?.exi ? { exi: act.dataset.exi, p: act.dataset.p, s: act.selectionStart, e: act.selectionEnd, top: act.scrollTop } : null;
    fill(box, h1); box._h = h1;
    if (keep) {
      const n = [...box.querySelectorAll('[data-exi]')].find(x => x.dataset.exi === keep.exi && x.dataset.p === keep.p);
      if (n) { n.focus({ preventScroll: true }); try { n.setSelectionRange(keep.s, keep.e); } catch { /* поле без виділення */ } n.scrollTop = keep.top; }
    }
  }
  const f = document.querySelector('.ex-foot'), h2 = f ? footInner(C.S, def, d) : null;
  if (f && f._h !== h2) { fill(f, h2); f._h = h2; }
}
let saveT = 0;
export function installEx(C) {
  C.saveSoon = () => { clearTimeout(saveT); saveT = setTimeout(() => C.save(), 350); };
  const apply = (el, commit) => {
    if (!C.S) return;
    const def = EX[el.dataset.exi]; if (!def) return;
    const d = X(C.S, def.id), t = el.type;
    let v = t === 'checkbox' ? el.checked : (t === 'range' || t === 'number') ? (el.value === '' ? '' : +el.value) : el.value;
    put(d, el.dataset.p, v);
    const o = el.nextElementSibling; if (o?.tagName === 'OUTPUT') o.textContent = fnum(v) + (el.dataset.u || '');
    def.onSet?.(C.S, d, el.dataset.p, v, el);
    const heavy = commit && (t === 'range' || t === 'checkbox' || t === 'color' || t === 'radio' || el.tagName === 'SELECT');
    if (heavy) C.render(); else if (!commit) patchLive(C, def, d);
    C.saveSoon();
  };
  document.addEventListener('input', e => { const el = e.target.closest?.('[data-exi]'); if (el) apply(el, false); });
  document.addEventListener('change', e => { const el = e.target.closest?.('[data-exi]'); if (el) apply(el, true); });
  addEventListener('pagehide', () => C.save());
  document.addEventListener('visibilitychange', () => { if (document.hidden) C.save(); });
  // перетягування: елемент із data-drag відпускають на зону data-drop; у відповідь викликається def.drop(S, d, ключ, зона, {fx, fy})
  let drag = null;
  document.addEventListener('pointerdown', e => {
    const el = e.target.closest?.('[data-drag]'); if (!el || e.button > 0) return;
    const r = el.getBoundingClientRect();
    drag = { el, id: el.dataset.drag, ex: el.dataset.ex, dx: e.clientX - r.left - r.width / 2, dy: e.clientY - r.top - r.height / 2, x0: e.clientX, y0: e.clientY, moved: false, pid: e.pointerId };
    el.setPointerCapture?.(e.pointerId);
  });
  document.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.pid) return;
    const mx = e.clientX - drag.x0, my = e.clientY - drag.y0;
    if (!drag.moved && Math.hypot(mx, my) < 5) return;
    drag.moved = true; drag.el.classList.add('dragging'); drag.el.style.setProperty('--dx', mx + 'px'); drag.el.style.setProperty('--dy', my + 'px');
    const z = zoneAt(e.clientX, e.clientY); document.querySelectorAll('[data-drop].over').forEach(n => n !== z && n.classList.remove('over')); z?.classList.add('over');
  });
  const end = e => {
    if (!drag || e.pointerId !== drag.pid) return;
    const dd = drag; drag = null; dd.el.classList.remove('dragging'); dd.el.style.removeProperty('--dx'); dd.el.style.removeProperty('--dy');
    document.querySelectorAll('[data-drop].over').forEach(n => n.classList.remove('over'));
    if (!dd.moved || e.type === 'pointercancel') return;
    const z = zoneAt(e.clientX, e.clientY), def = EX[dd.ex]; if (!z || !def?.drop) return;
    const r = z.getBoundingClientRect();
    def.drop(C.S, X(C.S, def.id), dd.id, z.dataset.drop, { fx: clamp((e.clientX - r.left) / r.width, 0, 1), fy: clamp((e.clientY - r.top) / r.height, 0, 1) }, C);
    C.render(); C.saveSoon();
  };
  document.addEventListener('pointerup', end); document.addEventListener('pointercancel', end);
  // той самий жест з клавіатури: стрілки зсувають точку на 5%
  document.addEventListener('keydown', e => {
    const el = e.target.closest?.('[data-drag][data-fx]'); if (!el || !e.key.startsWith('Arrow')) return;
    const def = EX[el.dataset.ex]; if (!def?.drop) return; e.preventDefault();
    const fx = clamp(+el.dataset.fx + (e.key === 'ArrowRight' ? .05 : e.key === 'ArrowLeft' ? -.05 : 0), 0, 1), fy = clamp(+el.dataset.fy + (e.key === 'ArrowDown' ? .05 : e.key === 'ArrowUp' ? -.05 : 0), 0, 1);
    def.drop(C.S, X(C.S, def.id), el.dataset.drag, el.dataset.zone || '', { fx, fy }, C); C.render(); C.saveSoon();
    requestAnimationFrame(() => document.querySelector(`[data-drag="${CSS.escape(el.dataset.drag)}"][data-ex="${el.dataset.ex}"]`)?.focus());
  });
  const zoneAt = (x, y) => { const l = document.elementsFromPoint(x, y); return l.find(n => n.dataset?.drop !== undefined); };
}
export { term, icon, esc };
