// Симулятор стартапу · вправа етапу 2 «Логотип і фірмовий стиль»: брендова студія зі стартовими стилями, знаком, кольорами, написом,
// перевіркою логотипа, макетами, збереженими варіантами й експортом у SVG та PNG.
import { esc } from './ui.js';
import { icon } from './icons.js';
import { reg, xb, xp, xin, xsl, xcol, tip, box, checks, bar, clamp } from './ex-core.js';
import { logoMark, logoSvg, SHAPES, SHAPE_KEYS, shapeCss } from './logo.js';
import { X } from './ex-core.js';

const len = s => String(s || '').trim().length;

export const BF = {
  modern: { t: 'Сучасний', css: "'Inter', system-ui, sans-serif", w: 800 },
  classic: { t: 'Класичний', css: "Georgia, 'Times New Roman', serif", w: 700 },
  playful: { t: 'Грайливий', css: "'Caveat', 'Comic Sans MS', cursive", w: 700 },
  tech: { t: 'Технічний', css: "'JetBrains Mono', ui-monospace, monospace", w: 600 },
  round: { t: 'Округлий', css: "'Trebuchet MS', 'Segoe UI', sans-serif", w: 800 },
  elegant: { t: 'Елегантний', css: "'Palatino Linotype', 'Book Antiqua', Palatino, serif", w: 600 },
  bold: { t: 'Масивний', css: "'Arial Black', 'Helvetica Neue', Arial, sans-serif", w: 900 },
  geo: { t: 'Геометричний', css: "'Century Gothic', Futura, 'Avenir Next', sans-serif", w: 700 },
};
const SYMS = ['spark', 'leaf', 'book', 'rocket', 'bolt', 'heart', 'star', 'cube', 'wave', 'sun', 'compass', 'flame', 'users', 'mic', 'palette', 'megaphone', 'tag', 'coins', 'handshake', 'laptop', 'award', 'target', 'gift', 'code', 'shield', 'bank', 'bulb', 'trend', 'flag', 'chart'];
const PALS = [['#6366f1', '#8b5cf6', 'Індиго'], ['#0ea5e9', '#14b8a6', 'Море'], ['#16a34a', '#84cc16', 'Трава'], ['#f97316', '#ef4444', 'Захід'], ['#ec4899', '#f59e0b', 'Малина'], ['#111827', '#374151', 'Графіт'], ['#0f766e', '#0ea5e9', 'Лагуна'], ['#7c3aed', '#ec4899', 'Неон'],
  ['#1d4ed8', '#38bdf8', 'Небо'], ['#b45309', '#f59e0b', 'Мед'], ['#be123c', '#fb7185', 'Вишня'], ['#065f46', '#34d399', 'Ліс'], ['#4338ca', '#06b6d4', 'Кібер'], ['#a21caf', '#f472b6', 'Орхідея'], ['#334155', '#64748b', 'Сталь'], ['#ca8a04', '#fde047', 'Лимон']];
const TPL = [
  ['Технологічний', 'Чіткий і сучасний: квадрат, градієнт, моноширинний шрифт.', { shape: 'squircle', sym: 'code', style: 'solid', c1: '#4338ca', c2: '#06b6d4', grad: true, ang: 135, fg: '#ffffff', font: 'tech', layout: 'side', upper: false, track: 0, useMono: false }],
  ['Теплий', 'Дружній і м’який: коло, теплі кольори, округлий напис.', { shape: 'circle', sym: 'heart', style: 'solid', c1: '#f97316', c2: '#f59e0b', grad: true, ang: 160, fg: '#ffffff', font: 'round', layout: 'side', upper: false, track: 0, useMono: false }],
  ['Преміум', 'Стримано й дорого: темний щит, елегантний напис великими літерами.', { shape: 'shield', sym: 'award', style: 'solid', c1: '#111827', c2: '', grad: false, ang: 140, fg: '#fde68a', font: 'elegant', layout: 'stack', upper: true, track: 4, useMono: false }],
  ['Природа', 'Спокійний і живий: пелюстка, зелені відтінки.', { shape: 'petal', sym: 'leaf', style: 'solid', c1: '#065f46', c2: '#34d399', grad: true, ang: 150, fg: '#ffffff', font: 'classic', layout: 'side', upper: false, track: 0, useMono: false }],
  ['Сміливий', 'Гучний і помітний: печатка, масивний напис.', { shape: 'badge', sym: 'bolt', style: 'solid', c1: '#be123c', c2: '#f97316', grad: true, ang: 120, fg: '#ffffff', font: 'bold', layout: 'side', upper: true, track: 1, useMono: false }],
  ['Мінімалізм', 'Лише контур і літера: нічого зайвого.', { shape: 'circle', sym: 'spark', style: 'line', c1: '#111827', c2: '', grad: false, ang: 140, fg: '#111827', font: 'geo', layout: 'side', upper: false, track: 1, useMono: true }],
  ['Дитячий', 'Веселий і яскравий: крапля, грайливий шрифт.', { shape: 'drop', sym: 'star', style: 'solid', c1: '#ec4899', c2: '#f59e0b', grad: true, ang: 140, fg: '#ffffff', font: 'playful', layout: 'side', upper: false, track: 0, useMono: false }],
  ['Класика', 'Довіра й традиція: арка, синій, книжковий шрифт.', { shape: 'arch', sym: 'bank', style: 'solid', c1: '#1d4ed8', c2: '', grad: false, ang: 140, fg: '#ffffff', font: 'classic', layout: 'side', upper: false, track: 0, useMono: false }],
];
const ED = { z: 100, x: 0, y: 0, rot: 0, flip: false, gray: false, br: 100, ct: 100, cut: 0, bg: 'brand' };
const SNAP = ['shape', 'sym', 'useImg', 'imgFit', 'useMono', 'mono', 'style', 'scale', 'c1', 'c2', 'grad', 'ang', 'fg', 'font', 'layout', 'upper', 'track', 'tag'];
const TABS = [['start', 'Старт', 'rocket'], ['mark', 'Знак', 'cube'], ['color', 'Кольори', 'palette'], ['text', 'Напис', 'pen'], ['check', 'Перевірка', 'check']];

/* ── допоміжні функції кольору ── */
const rgb = h => { const n = parseInt(String(h).replace('#', '').padEnd(6, '0').slice(0, 6), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const lum = h => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }, [r, g, b] = rgb(h); return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const toHsl = h => { let [r, g, b] = rgb(h).map(v => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; let s = 0, hh = 0; if (d) { s = d / (1 - Math.abs(2 * l - 1)); hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60; if (hh < 0) hh += 360; } return [hh, s * 100, l * 100]; };
const fromHsl = (h, s, l) => { h = ((h % 360) + 360) % 360; s = clamp(s, 0, 100) / 100; l = clamp(l, 0, 100) / 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)); return '#' + [f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join(''); };
const initials = n => { const w = String(n || '').trim().split(/[\s-]+/).filter(Boolean); return (w.length > 1 ? w[0][0] + w[1][0] : (w[0] || '?')[0]).toUpperCase(); };

/* ── збирання знака з даних вправи ── */
const markOf = d => ({ shape: d.shape, c1: d.c1, c2: d.grad ? (d.c2 || d.c1) : '', ang: d.ang, fg: d.fg, sym: d.sym, style: d.style, scale: (d.scale || 100) / 100, mono: d.useMono && !(d.useImg && d.img) ? (d.mono || initials(d.name)) : '', monoFont: BF[d.font]?.css, img: d.useImg && d.img ? d.img : '', imgFit: d.imgFit });
const lockup = (d, { size = 56, dark = false, inv = false, cls = '' } = {}) => {
  const F = BF[d.font] || BF.modern, m = markOf(d), mk = inv ? { ...m, c1: '#ffffff', c2: '', fg: d.c1, style: 'solid' } : m, col = dark ? '#ffffff' : '#1d2433';
  return `<div class="lockup ${d.layout} ${cls}" style="color:${col}">${d.layout !== 'word' ? logoMark(mk, size) : ''}${d.layout !== 'mark' ? `<span class="lw" style="font-family:${F.css};font-weight:${F.w};${d.upper ? 'text-transform:uppercase;' : ''}letter-spacing:${(d.track || 0) * .06}em;font-size:${Math.round(size * .56)}px">${esc(d.name || 'Назва')}${d.tag ? `<small>${esc(d.tag)}</small>` : ''}</span>` : ''}</div>`;
};
const symC = d => (d.useImg && d.img ? 4.5 : d.style === 'solid' ? contrast(d.fg, d.c1) : contrast(d.c1, '#ffffff'));

/* ── оцінка логотипа ── */
function review(d) {
  const ct = symC(d), nm = len(d.name), sm = (d.scale || 100) >= 75;
  const hs = d.grad ? Math.abs(toHsl(d.c1)[0] - toHsl(d.c2 || d.c1)[0]) : 0, hd = Math.min(hs, 360 - hs);
  const list = [
    [ct >= 3, `Знак добре видно: контраст ${ct.toFixed(1).replace('.', ',')} до 1`, 'Символ і тло надто схожі: зробіть один світлішим, а інший темнішим'],
    [nm >= 2 && nm <= 14, 'Назва коротка й легко читається', nm > 14 ? 'Назва задовга для логотипа: скоротіть або використайте підпис' : 'Впишіть назву'],
    [!d.useMono || (d.mono || initials(d.name)).length <= 2, 'Монограма з однієї-двох літер', 'Забагато літер у монограмі'],
    [sm && ct >= 3, 'Знак читається навіть у малому розмірі (іконка сайту 16 пікселів)', 'У малому розмірі символ загубиться: збільште символ і контраст'],
    [!d.grad || hd <= 150, 'Кольори градієнта поєднуються', 'Кольори градієнта надто далекі: логотип виглядатиме строкато'],
    [!(d.font === 'playful' && d.layout === 'word' && nm > 10), 'Шрифт підходить до довжини назви', 'Рукописний шрифт у довгій назві важко читати'],
  ];
  const ok = list.filter(x => x[0]).length;
  return { list, ok, score: Math.round(ok / list.length * 100), ct };
}

reg({
  id: 'logo', stage: 1, ord: 4, cols: true, t: 'Логотип і фірмовий стиль', d: 'Створіть логотип у брендовій студії: стиль, знак, кольори, напис, перевірка й макети.', icon: 'palette', min: 20,
  intro: `У студії ви збираєте логотип крок за кроком: оберіть <b>стартовий стиль</b> або починайте з нуля, налаштуйте знак, кольори й напис, перевірте логотип на читабельність і подивіться, як він виглядає на телефоні, візитці, сайті й футболці. Можна зберегти до чотирьох варіантів і порівняти їх, а готовий логотип завантажити у файл.`,
  data: S => ({ tab: 'start', name: S.s.company.name, tag: '', shape: 'squircle', sym: S.s.company.sym || 'spark', img: '', imgS: '', imgO: '', ed: { ...ED }, useImg: false, imgFit: 'cover', useMono: false, mono: '', style: 'solid', scale: 100, c1: S.s.company.color, c2: '', grad: false, ang: 140, fg: '#ffffff', font: 'modern', layout: 'side', upper: false, track: 0, bg: 'light', variants: [], t: 0 }),
  onSet: (S, d, p) => { if (p !== 'tab' && p !== 'bg') d.t = (d.t || 0) + 1; if (/^ed\./.test(p) || p === 'c1') rebake(d); },
  view(S, d) {
    if (d.img && !d.imgO) d.imgO = d.img; // старі збереження: зображення без оригіналу
    if (d.imgO && !IMGC.has(d.imgO)) rebake(d);
    d.ed ||= { ...ED };
    const tabs = `<div class="bs-tabs" role="tablist">${TABS.map(([k, t, ic]) => `<button type="button" role="tab" aria-selected="${d.tab === k}" class="${d.tab === k ? 'on' : ''}" data-act="ex" data-ex="logo" data-do="set" data-p="tab" data-v="${k}" data-t="s">${icon(ic, 16)}<span>${t}</span></button>`).join('')}</div>`;
    const m = markOf(d);
    const panel = {
      start: () => box('Стартові стилі', `<p class="sm muted">Оберіть стиль, і він одразу застосується до вашої назви. Далі його можна змінювати на інших вкладках.</p><div class="bs-tpl">${TPL.map(([t, desc, c], i) => `<button type="button" class="bs-t" data-act="ex" data-ex="logo" data-do="tpl" data-a="${i}">${lockup({ ...d, ...c }, { size: 38 })}<b>${t}</b><small>${desc}</small></button>`).join('')}</div>
        <div class="xrow mt">${xb('logo', 'rand', 'Здивуй мене', { ic: 'refresh' })}<small class="muted">Випадкові форма, символ і кольори</small></div>`, { ic: 'rocket' }),
      mark: () => `${box('Своє зображення або фото', d.img ? photoEditor(d) : `<div class="bs-drop" data-imgdrop>${xb('logo', 'pickImg', 'Завантажити зображення', { ic: 'open', cls: 'primary' })}<button type="button" class="btn" data-act="ex" data-ex="logo" data-do="camImg">${icon('phone', 16)} Зробити фото</button><p class="sm muted">PNG, JPG, SVG або WebP до 8 МБ. Файл можна <b>перетягнути сюди</b> або <b>вставити з буфера</b> (Ctrl+V). Найкраще працює квадратне зображення. Файл лишається у вашому браузері й нікуди не надсилається.</p></div>`, { ic: 'open' })}
        ${box('Форма знака', `<div class="bs-shapes">${SHAPE_KEYS.map(k => `<button type="button" class="bs-sh ${d.shape === k ? 'on' : ''}" aria-pressed="${d.shape === k}" data-act="ex" data-ex="logo" data-do="set" data-p="shape" data-v="${k}" data-t="s" title="${SHAPES[k].t}">${logoMark({ ...m, shape: k }, 46)}<small>${SHAPES[k].t}</small></button>`).join('')}</div>`, { ic: 'cube' })}
        ${box('Символ', `<div class="xrow" style="margin-bottom:10px"><label class="switch"><input type="checkbox" data-exi="logo" data-p="useMono" ${d.useMono ? 'checked' : ''}><span></span>Літери замість символу (монограма)</label>${d.useMono ? `<label class="xf" style="width:120px"><span class="xf-l">Літери</span><input class="inp" type="text" data-exi="logo" data-p="mono" maxlength="2" value="${esc(d.mono || initials(d.name))}" autocomplete="off"></label>` : ''}</div>
          <div class="syms bs-syms ${d.useMono || (d.useImg && d.img) ? 'off' : ''}" role="group" aria-label="Символ">${SYMS.map(sy => `<button type="button" class="sym ${d.sym === sy ? 'on' : ''}" data-act="ex" data-ex="logo" data-do="set" data-p="sym" data-v="${sy}" data-t="s" aria-label="${sy}" ${d.useMono ? 'tabindex="-1"' : ''}>${icon(sy, 20)}</button>`).join('')}</div>`, { ic: 'star' })}
        ${box('Стиль і розмір', `<div class="xrow">${[['solid', 'Заливка'], ['soft', 'Світлий'], ['line', 'Контур']].map(([k, t]) => xp('logo', 'style', k, t, d.style === k)).join('')}</div>${xsl('logo', 'scale', d, { min: 60, max: 130, step: 5, label: 'Розмір символу', u: '%', cls: 'mt' })}${d.style === 'line' && SHAPES[d.shape].clip ? '<p class="sm muted">Для цієї форми контур замінено на світлу заливку.</p>' : ''}`, { ic: 'wrench' })}`,
      color: () => `${box('Готові палітри', `<div class="bs-pals">${PALS.map(([a, b, n]) => `<button type="button" class="bs-pal ${d.c1 === a && d.c2 === b ? 'on' : ''}" style="background:linear-gradient(135deg,${a},${b})" data-act="ex" data-ex="logo" data-do="pair" data-a="${a}" data-b="${b}" title="${n}" aria-label="Палітра ${n}"><small>${n}</small></button>`).join('')}</div>`, { ic: 'palette' })}
        ${box('Свої кольори', `<div class="xrow">${xcol('logo', 'c1', d, { label: 'Основний' })}${xcol('logo', 'fg', d, { label: 'Символ' })}<label class="switch"><input type="checkbox" data-exi="logo" data-p="grad" ${d.grad ? 'checked' : ''}><span></span>Градієнт</label>${d.grad ? xcol('logo', 'c2', d, { label: 'Другий' }) : ''}${xb('logo', 'autofg', 'Підібрати колір символу', { cls: 'sm', ic: 'bolt' })}</div>
          ${d.grad ? xsl('logo', 'ang', d, { min: 0, max: 360, step: 10, label: 'Напрям градієнта', u: '°', cls: 'mt' }) : ''}
          <p class="sm ${symC(d) >= 3 ? 'muted' : 'warnt'}">Контраст символу: ${symC(d).toFixed(1).replace('.', ',')} до 1 ${symC(d) >= 3 ? '— добре видно.' : '— символ погано видно, спробуйте світліший чи темніший колір.'}</p>
          <p class="sm"><b>Підібрати другий колір до основного:</b></p><div class="xrow">${[['30', 'Сусідній'], ['180', 'Контрастний'], ['120', 'Тріада'], ['-40', 'Холодніший']].map(([o, t]) => xb('logo', 'harm', t, { a: o, cls: 'sm' })).join('')}</div>`, { ic: 'wrench' })}`,
      text: () => `${box('Назва й підпис', `<div class="xg c2">${xin('logo', 'name', d, { label: 'Назва', max: 28 })}${xin('logo', 'tag', d, { label: 'Підпис під назвою (необов’язково)', max: 40, ph: 'наприклад, «розумна домашка»' })}</div>`, { ic: 'pen' })}
        ${box('Шрифт', `<div class="bs-fonts">${Object.entries(BF).map(([k, f]) => `<button type="button" class="bs-f ${d.font === k ? 'on' : ''}" aria-pressed="${d.font === k}" data-act="ex" data-ex="logo" data-do="set" data-p="font" data-v="${k}" data-t="s"><span style="font-family:${f.css};font-weight:${f.w}">${esc(d.name || 'Назва')}</span><small>${f.t}</small></button>`).join('')}</div>`, { ic: 'book' })}
        ${box('Розташування', `<div class="xrow">${[['side', 'Знак ліворуч'], ['stack', 'Знак зверху'], ['mark', 'Лише знак'], ['word', 'Лише напис']].map(([k, t]) => xp('logo', 'layout', k, t, d.layout === k)).join('')}</div>
          <div class="xrow mt"><label class="switch"><input type="checkbox" data-exi="logo" data-p="upper" ${d.upper ? 'checked' : ''}><span></span>Великі літери</label></div>${xsl('logo', 'track', d, { min: 0, max: 8, step: 1, label: 'Відстань між літерами', u: '', cls: 'mt' })}`, { ic: 'compass' })}`,
      check: () => { const r = review(d), M = markOf(d), mono = { ...M, c1: '#111827', c2: '', fg: '#ffffff', style: 'solid' }; return `${box('Перевірка логотипа', `<div class="bs-score"><b>${r.score}</b><span>з 100</span>${bar(r.score / 100, { color: r.score >= 80 ? 'var(--ok)' : '#e0a100', label: 'Оцінка логотипа' })}</div>${checks(r.list)}`, { ic: 'check' })}
        ${box('Різні розміри', `<div class="bs-sizes">${[16, 24, 36, 56, 84].map(s => `<figure>${logoMark(M, s)}<figcaption>${s} px</figcaption></figure>`).join('')}</div><p class="sm muted">Хороший знак впізнаваний навіть у 16 пікселів, як іконка вкладки браузера.</p>`, { ic: 'search' })}
        ${box('Різні версії', `<div class="bs-vers"><figure style="background:#fff;${M.img ? 'filter:grayscale(1) contrast(1.3)' : ''}">${logoMark(M.img ? M : mono, 56)}<figcaption>Чорно-біла</figcaption></figure><figure style="background:#111827">${logoMark({ ...M, c1: '#ffffff', c2: '', fg: d.c1, style: 'solid' }, 56)}<figcaption style="color:#fff">На темному</figcaption></figure><figure style="background:${d.c1}">${logoMark({ ...M, c1: '#ffffff', c2: '', fg: d.c1, style: 'solid' }, 56)}<figcaption style="color:#fff">На кольорі бренду</figcaption></figure><figure style="background:#fff;filter:grayscale(1)">${logoMark(M, 56)}<figcaption>Сірі тони</figcaption></figure></div><p class="sm muted">Логотип має працювати в одному кольорі й на будь-якому тлі: так його можна друкувати й штампувати.</p>`, { ic: 'eye' })}`; },
    }[d.tab]();
    return `${tabs}${panel}`;
  },
  live(S, d) {
    const M = markOf(d), bgs = [['light', 'Світле'], ['dark', 'Темне'], ['brand', 'Колір'], ['check', 'Клітинки']], dark = d.bg === 'dark' || d.bg === 'brand', inv = d.bg === 'brand';
    const big = clamp(84 - Math.max(0, len(d.name) - 8) * 4 - (d.track || 0) * (d.upper ? 3 : 1) - (d.layout === 'side' ? 10 : 0), 44, 84);
    const stage = `<div class="stage bs-stage ${d.bg}" style="${d.bg === 'brand' ? `background:${d.c1}` : ''}">${lockup(d, { size: big, dark, inv })}</div>`;
    const V = d.variants || [];
    const gl = (x) => lockup(x, { size: 36 });
    return `${box('Ваш логотип', `<div class="xrow bs-bgs" role="group" aria-label="Тло">${bgs.map(([k, t]) => xp('logo', 'bg', k, t, d.bg === k)).join('')}</div>${stage}
        <div class="xrow mt">${xb('logo', 'saveVar', 'Зберегти варіант', { ic: 'plus', cls: 'sm', dis: V.length >= 4 })}${xb('logo', 'dlSvg', 'SVG', { ic: 'save', cls: 'sm', title: 'Завантажити логотип у файл SVG' })}${xb('logo', 'dlPng', 'PNG', { ic: 'save', cls: 'sm', title: 'Завантажити логотип у файл PNG' })}</div>`, { ic: 'star' })}
      ${V.length ? box('Збережені варіанти', `<div class="bs-vars">${V.map((v, i) => `<div class="bs-v"><div class="bs-vp">${gl({ ...v, name: d.name })}</div><div class="xrow">${xb('logo', 'openVar', 'Відкрити', { i, cls: 'sm' })}${xb('logo', 'delVar', '', { i, ic: 'trash', cls: 'ib', title: 'Видалити' })}</div></div>`).join('')}</div>`, { ic: 'grip', side: `${V.length} з 4` }) : ''}
      ${box('Де його видно', `<div class="bs-mock">
        <figure class="bm-phone"><div class="ph"><div class="ph-g">${Array.from({ length: 7 }, (_, i) => `<i style="background:hsl(${i * 47},35%,${78 - i * 2}%)"></i>`).join('')}<span class="ph-ap">${logoMark({ ...M, shape: d.shape === 'circle' ? 'circle' : 'squircle' }, 34)}</span></div></div><figcaption>Телефон</figcaption></figure>
        <figure class="bm-card"><div class="bc-f">${lockup(d, { size: 34 })}<p>${esc(S.s.founder.name)}<br><span>засновник${/[ая]$/.test(S.s.founder.name.split(' ')[0] || '') ? 'ця' : ''}</span></p></div><div class="bc-b" style="background:${d.c1}">${logoMark({ ...M, c1: '#ffffff', c2: '', fg: d.c1, style: 'solid' }, 40)}</div><figcaption>Візитка</figcaption></figure>
        <figure class="bm-site"><div class="browser"><i></i><i></i><i></i><div class="bar2">${lockup(d, { size: 28 })}<nav><span>Про нас</span><span>Ціни</span><b style="background:${contrast('#ffffff', d.c1) >= 4.5 || contrast('#111111', d.c1) >= 4.5 ? d.c1 : `color-mix(in srgb, ${d.c1} 88%, #000)`};color:${contrast('#ffffff', d.c1) >= contrast('#111111', d.c1) ? '#fff' : '#111'}">Спробувати</b></nav></div><div class="hero" style="--c:${d.c1}"><p class="hero-t" style="font-family:${(BF[d.font] || BF.modern).css}">${esc(d.tag || 'Ваш слоган тут')}</p></div></div><figcaption>Сайт</figcaption></figure>
        <figure class="bm-tee"><div class="tee" style="--c:${d.c1}"><div class="tp">${logoMark({ ...M, c1: '#ffffff', c2: '', fg: d.c1, style: 'solid' }, 46)}</div></div><figcaption>Футболка</figcaption></figure>
        <figure class="bm-ava"><div class="av">${logoMark({ ...M, shape: 'circle' }, 64)}</div><div class="ap"><b>${esc(d.name || 'Назва')}</b><span>@${esc((d.name || 'brand').toLowerCase().replace(/[^a-z0-9а-яіїєґ]+/gi, '') || 'brand')}</span></div><figcaption>Соцмережі</figcaption></figure>
        <figure class="bm-bag"><div class="bag" style="--c:${d.c1}"><div class="bag-l">${logoMark({ ...M, c1: '#ffffff', c2: '', fg: d.c1, style: 'solid' }, 40)}</div></div><figcaption>Пакет</figcaption></figure>
      </div>`, { ic: 'eye' })}`;
  },
  acts: {
    tpl(S, d, el) { const t = TPL[+el.dataset.a]; if (!t) return false; Object.assign(d, t[2]); d.t = (d.t || 0) + 3; },
    pair(S, d, el) { d.c1 = el.dataset.a; d.c2 = el.dataset.b; d.grad = true; d.t = (d.t || 0) + 1; },
    rand(S, d) { const p = PALS[Math.floor(Math.random() * PALS.length)]; Object.assign(d, { c1: p[0], c2: p[1], grad: true, shape: SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)], sym: SYMS[Math.floor(Math.random() * SYMS.length)], useMono: false, font: Object.keys(BF)[Math.floor(Math.random() * 8)] }); d.t = (d.t || 0) + 3; },
    autofg(S, d) { d.fg = contrast('#ffffff', d.c1) >= contrast('#111827', d.c1) ? '#ffffff' : '#111827'; d.t = (d.t || 0) + 1; },
    harm(S, d, el) { const [h, s, l] = toHsl(d.c1), o = +el.dataset.a; d.c2 = fromHsl(h + o, s, o === -40 ? l + 6 : l); d.grad = true; d.t = (d.t || 0) + 1; },
    saveVar(S, d, el, C) { d.variants ||= []; if (d.variants.length >= 4) { C?.toast?.('Можна зберегти до чотирьох варіантів', 'bad'); return false; } const v = {}; SNAP.forEach(k => { v[k] = d[k]; }); d.variants.push(v); C?.toast?.('Варіант збережено', 'good'); },
    openVar(S, d, el) { const v = d.variants?.[+el.dataset.i]; if (v) Object.assign(d, v); },
    delVar(S, d, el) { d.variants?.splice(+el.dataset.i, 1); },
    pickImg(S, d, el, C) { chooseFile(C, d, false); return false; },
    camImg(S, d, el, C) { chooseFile(C, d, true); return false; },
    rmImg(S, d) { d.img = ''; d.imgS = ''; d.imgO = ''; d.useImg = false; d.ed = { ...ED }; },
    rotImg(S, d, el, C) { d.ed = { ...ED, ...d.ed }; d.ed.rot = (d.ed.rot + 90) % 360; rebake(d, C); },
    flipImg(S, d, el, C) { d.ed = { ...ED, ...d.ed }; d.ed.flip = !d.ed.flip; rebake(d, C); },
    resetImg(S, d, el, C) { d.ed = { ...ED }; rebake(d, C); },
    dlSvg(S, d) { download(new Blob([svgOf(d)], { type: 'image/svg+xml' }), `${fileName(d)}.svg`); },
    dlPng(S, d, el, C) {
      const svg = svgOf(d), img = new Image(), w = +/width="(\d+)"/.exec(svg)[1], h = +/height="(\d+)"/.exec(svg)[1];
      img.onload = () => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d'); x.drawImage(img, 0, 0, w, h); cv.toBlob(b => b && download(b, `${fileName(d)}.png`)); };
      img.onerror = () => C?.toast?.('Не вдалося створити PNG, завантажте SVG', 'bad');
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); return false;
    },
  },
  ready(S, d) {
    if (len(d.name) < 2) return { ok: false, msg: 'Впишіть назву' };
    if ((d.t || 0) < 3) return { ok: false, msg: 'Змініть щонайменше три налаштування логотипа' };
    const r = review(d);
    return { ok: true, stars: 1 + (r.score >= 80 ? 1 : 0) + ((d.variants || []).length >= 2 || len(d.tag) ? 1 : 0) };
  },
  finish(S, d) {
    const c = S.s.company, M = markOf(d), r = review(d);
    c.color = d.c1; c.sym = d.sym; c.mk = { shape: M.shape, c1: M.c1, c2: M.c2, ang: M.ang, fg: M.fg, style: M.style, scale: M.scale, mono: M.mono, monoFont: M.monoFont, img: M.img ? (d.imgS || d.img) : '', imgFit: M.img ? M.imgFit : undefined };
    if (!S.s.brand.logo) S.s.brand.logo = { q: clamp(.45 + r.score / 100 * .45, .2, .9), by: 'self' };
  },
});

/* ── файл ── */
const fileName = d => 'logo-' + (String(d.name || 'brand').toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'brand');
const svgOf = d => { const F = BF[d.font] || BF.modern; return logoSvg(markOf(d), { name: d.name, tag: d.tag, layout: d.layout, font: F.css.replace(/"/g, "'"), weight: F.w, upper: d.upper, track: d.track || 0 }); };
function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 3000); }

/* ── фото: завантаження, редагування й «запікання» у знак ── */
const IMGC = new Map(); // кеш завантажених зображень: інакше довелося б чекати на кожну зміну повзунка
const loadSrc = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('image')); im.src = src; });
function readImage(file) { return new Promise((res, rej) => { const url = URL.createObjectURL(file), im = new Image(); im.onload = () => { res(im); setTimeout(() => URL.revokeObjectURL(url), 2000); }; im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('image')); }; im.src = url; }); }
function pack(cv, cap) { let u = cv.toDataURL('image/png'); if (u.length > cap) { const w = cv.toDataURL('image/webp', .86); if (w.startsWith('data:image/webp')) u = w; } return u; }
function shrink(im, max) {
  const w0 = im.naturalWidth || max, h0 = im.naturalHeight || max, k = Math.min(1, max / Math.max(w0, h0)), w = Math.max(1, Math.round(w0 * k)), h = Math.max(1, Math.round(h0 * k));
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(im, 0, 0, w, h);
  return pack(cv, 240000);
}
// малює кадр із налаштуваннями редактора: масштаб, зсув, поворот, відзеркалення, фільтри, прибирання світлого фону
function paint(im, d, size) {
  const e = { ...ED, ...(d.ed || {}) }, cv = document.createElement('canvas'); cv.width = cv.height = size; const ctx = cv.getContext('2d');
  if (e.bg === 'white') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, size, size); } else if (e.bg === 'brand') { ctx.fillStyle = d.c1; ctx.fillRect(0, 0, size, size); }
  const w0 = im.naturalWidth || size, h0 = im.naturalHeight || size, sw = e.rot % 180 ? h0 : w0, sh = e.rot % 180 ? w0 : h0, base = Math.max(size / sw, size / sh) * e.z / 100;
  ctx.save(); ctx.translate(size / 2 + e.x / 100 * size, size / 2 + e.y / 100 * size); ctx.rotate(e.rot * Math.PI / 180); ctx.scale(e.flip ? -base : base, base);
  ctx.filter = `grayscale(${e.gray ? 1 : 0}) brightness(${e.br}%) contrast(${e.ct}%)`;
  if (e.cut > 0) { // спершу малюємо окремо, щоб прибрати світлий фон лише з самого зображення
    const t = document.createElement('canvas'); t.width = w0; t.height = h0; const tc = t.getContext('2d'); tc.drawImage(im, 0, 0);
    const id = tc.getImageData(0, 0, w0, h0), a = id.data, lim = 255 - e.cut * 1.6;
    for (let i = 0; i < a.length; i += 4) { const m = Math.min(a[i], a[i + 1], a[i + 2]); if (m >= lim) a[i + 3] = 0; else if (m >= lim - 24) a[i + 3] = a[i + 3] * (lim - m) / 24; }
    tc.putImageData(id, 0, 0); ctx.drawImage(t, -w0 / 2, -h0 / 2);
  } else ctx.drawImage(im, -w0 / 2, -h0 / 2);
  ctx.restore();
  return cv;
}
function bake(d) { const im = IMGC.get(d.imgO); if (!im) return false; d.img = pack(paint(im, d, 320), 200000); d.imgS = pack(paint(im, d, 96), 60000); return true; }
// перемальовує знак; якщо зображення ще не в кеші (після перезавантаження сторінки), спершу вантажить його
function rebake(d, C) {
  if (!d.imgO) return;
  if (bake(d)) return;
  loadSrc(d.imgO).then(im => { IMGC.set(d.imgO, im); bake(d); (C || window.Startup?.C)?.render(); (C || window.Startup?.C)?.saveSoon?.(); }).catch(() => {});
}
async function useFile(file, C, d) {
  if (!/^image\//.test(file.type)) { C?.toast?.('Оберіть файл зображення: PNG, JPG, SVG або WebP', 'bad'); return; }
  if (file.size > 8e6) { C?.toast?.('Зображення завелике: потрібно до 8 МБ', 'bad'); return; }
  try {
    const im = await readImage(file), o = shrink(im, 512), im2 = await loadSrc(o);
    IMGC.set(o, im2); d.imgO = o; d.ed = { ...ED }; d.useImg = true; d.t = (d.t || 0) + 3; bake(d);
    C.render(); C.saveSoon(); C?.toast?.('Зображення додано', 'good');
  } catch { C?.toast?.('Не вдалося прочитати зображення', 'bad'); }
}
function chooseFile(C, d, camera) {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; if (camera) inp.setAttribute('capture', 'environment'); inp.hidden = true; document.body.appendChild(inp);
  inp.addEventListener('change', () => { const f = inp.files?.[0]; inp.remove(); if (f) useFile(f, C, d); });
  inp.click();
}
function photoEditor(d) {
  const e = { ...ED, ...(d.ed || {}) };
  return `<div class="imged"><div class="imgl"><div class="imgfr" data-imgfr tabindex="0" role="img" aria-label="Кадрування: перетягніть, щоб зсунути зображення" style="${shapeCss(d.shape)}"><img draggable="false" src="${esc(d.img)}" alt=""></div><small>Перетягніть кадр, щоб зсунути (або стрілки на клавіатурі)</small>
      <label class="switch"><input type="checkbox" data-exi="logo" data-p="useImg" ${d.useImg ? 'checked' : ''}><span></span>Використати як знак</label></div>
    <div class="imgc">${xsl('logo', 'ed.z', { ed: e }, { min: 100, max: 400, step: 5, label: 'Масштаб', u: '%' })}<div class="xg c2">${xsl('logo', 'ed.x', { ed: e }, { min: -50, max: 50, step: 1, label: 'Ліворуч / праворуч', u: '' })}${xsl('logo', 'ed.y', { ed: e }, { min: -50, max: 50, step: 1, label: 'Вгору / вниз', u: '' })}</div>
      <div class="xrow" style="margin:8px 0">${xb('logo', 'rotImg', 'Повернути', { ic: 'refresh', cls: 'sm' })}${xb('logo', 'flipImg', 'Віддзеркалити', { ic: 'undo', cls: 'sm' })}${xp('logo', 'ed.gray', e.gray ? '0' : '1', 'Чорно-біле', e.gray, { t: 'b' })}${xb('logo', 'resetImg', 'Скинути', { ic: 'x', cls: 'sm' })}</div>
      <div class="xg c2">${xsl('logo', 'ed.br', { ed: e }, { min: 50, max: 150, step: 5, label: 'Яскравість', u: '%' })}${xsl('logo', 'ed.ct', { ed: e }, { min: 50, max: 200, step: 5, label: 'Контраст', u: '%' })}</div>
      ${xsl('logo', 'ed.cut', { ed: e }, { min: 0, max: 60, step: 2, label: 'Прибрати світлий фон', u: '' })}
      <div class="xrow" style="margin-top:6px"><span class="xf-l">Тло під зображенням:</span>${[['brand', 'Колір бренду'], ['white', 'Біле'], ['none', 'Прозоре']].map(([k, t]) => xp('logo', 'ed.bg', k, t, e.bg === k)).join('')}</div>
      <div class="xrow" style="margin-top:6px"><span class="xf-l">У формі:</span>${xp('logo', 'imgFit', 'cover', 'Заповнити', d.imgFit !== 'contain')}${xp('logo', 'imgFit', 'contain', 'Вписати', d.imgFit === 'contain')}${xb('logo', 'pickImg', 'Замінити', { ic: 'open', cls: 'sm' })}${xb('logo', 'rmImg', 'Прибрати', { ic: 'trash', cls: 'sm' })}</div></div></div>`;
}
// перетягування кадру, вставка з буфера й скидання файлу на вправу; працює, лише коли відкрито «Логотип»
if (typeof document !== 'undefined') {
  const ctx = () => { const C = window.Startup?.C; if (!C?.S || !document.querySelector('[data-ex-root="logo"]')) return null; return { C, d: X(C.S, 'logo') }; };
  let pan = null;
  document.addEventListener('pointerdown', e => { const fr = e.target.closest?.('[data-imgfr]'); const c = fr && ctx(); if (!c) return; const r = fr.getBoundingClientRect(); const ed = c.d.ed = { ...ED, ...(c.d.ed || {}) }; pan = { fr, c, x0: e.clientX, y0: e.clientY, ex: ed.x, ey: ed.y, w: r.width, pid: e.pointerId }; fr.setPointerCapture?.(e.pointerId); fr.classList.add('drag'); });
  document.addEventListener('pointermove', e => { if (!pan || e.pointerId !== pan.pid) return; const ed = pan.c.d.ed; ed.x = clamp(Math.round(pan.ex + (e.clientX - pan.x0) / pan.w * 100), -50, 50); ed.y = clamp(Math.round(pan.ey + (e.clientY - pan.y0) / pan.w * 100), -50, 50); if (bake(pan.c.d)) { pan.fr.querySelector('img').src = pan.c.d.img; } });
  const endPan = () => { if (!pan) return; const p = pan; pan = null; p.fr.classList.remove('drag'); p.c.d.t = (p.c.d.t || 0) + 1; p.c.C.render(); p.c.C.saveSoon(); };
  document.addEventListener('pointerup', endPan); document.addEventListener('pointercancel', endPan);
  document.addEventListener('keydown', e => { const fr = e.target.closest?.('[data-imgfr]'); const c = fr && ctx(); if (!c || !e.key.startsWith('Arrow')) return; e.preventDefault(); const ed = c.d.ed = { ...ED, ...(c.d.ed || {}) }; ed.x = clamp(ed.x + (e.key === 'ArrowRight' ? 2 : e.key === 'ArrowLeft' ? -2 : 0), -50, 50); ed.y = clamp(ed.y + (e.key === 'ArrowDown' ? 2 : e.key === 'ArrowUp' ? -2 : 0), -50, 50); rebake(c.d, c.C); c.C.render(); c.C.saveSoon(); requestAnimationFrame(() => document.querySelector('[data-imgfr]')?.focus()); });
  document.addEventListener('paste', e => { const c = ctx(); if (!c) return; const f = [...(e.clipboardData?.files || [])].find(x => /^image\//.test(x.type)); if (f) { e.preventDefault(); useFile(f, c.C, c.d); } });
  document.addEventListener('dragover', e => { if (ctx() && [...(e.dataTransfer?.types || [])].includes('Files')) e.preventDefault(); });
  document.addEventListener('drop', e => { const c = ctx(); const f = e.dataTransfer?.files?.[0]; if (!c || !f || !/^image\//.test(f.type)) return; e.preventDefault(); e.stopPropagation(); useFile(f, c.C, c.d); }, true);
  // під час руху повзунка оновлюємо картинку в кадрі, не чекаючи на перемальовування сторінки
  document.addEventListener('input', e => { if (!e.target.closest?.('[data-p^="ed."]')) return; const c = ctx(); if (!c) return; setTimeout(() => { const im = document.querySelector('[data-imgfr] img'); if (im && c.d.img) im.src = c.d.img; }, 0); });
}

export { markOf, svgOf, review, initials, lockup, toHsl };
