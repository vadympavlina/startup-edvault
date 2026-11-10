// Симулятор стартапу · знак компанії: форма, колір чи градієнт, символ або монограма. Використовується у вправі й у шапці гри.
import { icon } from './icons.js';

// 10 форм знака: однаково малюються і в HTML (clip-path / border-radius), і в SVG для експорту
const star = n => Array.from({ length: n * 2 }, (_, i) => { const a = Math.PI * i / n - Math.PI / 2, r = i % 2 ? 41 : 50; return [50 + r * Math.cos(a), 50 + r * Math.sin(a)]; });
const poly = pts => `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}% ${y.toFixed(1)}%`).join(',')})`;
const svgPoly = pts => `<polygon points="${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}"/>`;
const HEX = [[25, 6], [75, 6], [100, 50], [75, 94], [25, 94], [0, 50]], SHIELD = [[0, 0], [100, 0], [100, 55], [50, 100], [0, 55]], DIAM = [[50, 0], [100, 50], [50, 100], [0, 50]], OCT = [[30, 0], [70, 0], [100, 30], [100, 70], [70, 100], [30, 100], [0, 70], [0, 30]], BADGE = star(12);
export const SHAPES = {
  squircle: { t: 'Квадрат', radius: '28%', svg: '<rect width="100" height="100" rx="28"/>' },
  circle: { t: 'Коло', radius: '50%', svg: '<circle cx="50" cy="50" r="50"/>' },
  hex: { t: 'Шестикутник', clip: poly(HEX), svg: svgPoly(HEX) },
  shield: { t: 'Щит', clip: poly(SHIELD), svg: svgPoly(SHIELD) },
  diamond: { t: 'Ромб', clip: poly(DIAM), svg: svgPoly(DIAM) },
  octagon: { t: 'Восьмикутник', clip: poly(OCT), svg: svgPoly(OCT) },
  badge: { t: 'Печатка', clip: poly(BADGE), svg: svgPoly(BADGE) },
  arch: { t: 'Арка', radius: '50% 50% 14% 14% / 42% 42% 14% 14%', svg: '<path d="M0 100V44A50 44 0 0 1 100 44V86Q100 100 86 100H14Q0 100 0 86Z"/>' },
  petal: { t: 'Пелюстка', radius: '50% 6% 50% 6%', svg: '<path d="M50 0H94Q100 0 100 6V50A50 50 0 0 1 50 100H6Q0 100 0 94V50A50 50 0 0 1 50 0Z"/>' },
  drop: { t: 'Крапля', radius: '50% 50% 6% 50%', svg: '<path d="M50 0A50 50 0 0 1 100 50V94Q100 100 94 100H50A50 50 0 0 1 0 50A50 50 0 0 1 50 0Z"/>' },
};
export const SHAPE_KEYS = Object.keys(SHAPES);

const hex2 = h => { const n = parseInt(String(h).replace('#', '').padEnd(6, '0').slice(0, 6), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const mix = (h, t, k) => { const a = hex2(h), b = hex2(t); return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, '0')).join(''); };

// m = { shape, c1, c2, ang, fg, sym, mono, style: 'solid'|'soft'|'line', scale }
export function logoMark(m, size = 36, sym) {
  const sh = SHAPES[m.shape] || SHAPES.squircle, ang = m.ang ?? 140, style = m.style || 'solid', clipped = !!sh.clip;
  const line = !m.img && style === 'line' && !clipped, soft = !m.img && (style === 'soft' || (style === 'line' && clipped));
  const base = m.c2 ? `linear-gradient(${ang}deg, ${m.c1}, ${m.c2})` : m.c1;
  const bg = m.img ? (m.imgFit === 'contain' ? '#ffffff' : m.c1) : line ? 'transparent' : soft ? (m.c2 ? `linear-gradient(${ang}deg, ${mix(m.c1, '#ffffff', .82)}, ${mix(m.c2, '#ffffff', .82)})` : mix(m.c1, '#ffffff', .85)) : base;
  const fg = soft || line ? m.c1 : m.fg, k = (clipped ? .44 : .52) * (m.scale || 1);
  const imgSrc = m.img ? String(m.img).replace(/["<>\s]/g, '') : '', contain = m.imgFit === 'contain';
  const inner = imgSrc ? `<img class="lg-img" alt="" src="${imgSrc}" style="object-fit:${contain ? 'contain' : 'cover'};${contain ? `padding:${Math.round(size * .14)}px;` : ''}">` : m.mono ? `<b class="mono" style="font-size:${Math.round(size * (m.mono.length > 1 ? .36 : .5) * (m.scale || 1))}px;font-family:${m.monoFont || 'inherit'}">${String(m.mono).replace(/[<>&]/g, '')}</b>` : icon(sym || m.sym, Math.round(size * k));
  return `<span class="lgm" style="width:${size}px;height:${size}px;background:${bg};border-radius:${sh.radius || 0};${clipped ? `clip-path:${sh.clip};` : ''}${line ? `box-shadow:inset 0 0 0 ${Math.max(2, Math.round(size * .06))}px ${m.c1};` : ''}color:${fg}">${inner}</span>`;
}

// SVG-версія логотипа: для завантаження у файл. Символ береться з набору іконок, монограма й напис друкуються шрифтом
export function logoSvg(m, { uid = '', name = '', tag = '', layout = 'side', font = 'sans-serif', weight = 800, textColor = '#1d2433', upper = false, track = 0 } = {}) {
  const sh = SHAPES[m.shape] || SHAPES.squircle, ang = m.ang ?? 140, style = m.style || 'solid', clipped = !!sh.clip;
  const soft = style === 'soft' || (style === 'line' && clipped), line = style === 'line' && !clipped;
  const A = (ang - 90) * Math.PI / 180, gx = Math.cos(A) / 2, gy = Math.sin(A) / 2;
  const c1 = soft ? mix(m.c1, '#ffffff', .85) : m.c1, c2 = soft ? mix(m.c2 || m.c1, '#ffffff', .85) : m.c2;
  const grad = m.c2 ? `<linearGradient id="g${uid}" x1="${(.5 - gx).toFixed(3)}" y1="${(.5 - gy).toFixed(3)}" x2="${(.5 + gx).toFixed(3)}" y2="${(.5 + gy).toFixed(3)}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>` : '';
  const fill = line ? 'none' : m.c2 ? `url(#g${uid})` : c1, fg = soft || line ? m.c1 : m.fg, k = (clipped ? .44 : .52) * (m.scale || 1), S = 100;
  const ic = /<svg[^>]*>([\s\S]*)<\/svg>/.exec(icon(m.sym, 24))?.[1] || '';
  const sc = k * 100 / 24;
  const pic = m.img ? (() => { const cn = m.imgFit === 'contain', p = cn ? 14 : 0; return `<clipPath id="k${uid}">${sh.svg}</clipPath><g clip-path="url(#k${uid})">${cn ? '<rect width="100" height="100" fill="#ffffff"/>' : ''}<image href="${String(m.img).replace(/["<>\s]/g, '')}" x="${p}" y="${p}" width="${100 - 2 * p}" height="${100 - 2 * p}" preserveAspectRatio="xMidYMid ${cn ? 'meet' : 'slice'}"/></g>`; })() : '';
  const glyph = m.img ? '' : m.mono ? `<text x="50" y="${m.mono.length > 1 ? 63 : 68}" text-anchor="middle" font-family="${font}" font-weight="800" font-size="${(m.mono.length > 1 ? 36 : 50) * (m.scale || 1)}" fill="${fg}">${String(m.mono).replace(/[<>&]/g, '')}</text>`
    : `<g transform="translate(${(50 - 12 * sc).toFixed(2)},${(50 - 12 * sc).toFixed(2)}) scale(${sc.toFixed(3)})" fill="none" stroke="${fg}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ic}</g>`;
  const mark = m.img ? `<g fill="${m.imgFit === 'contain' ? '#ffffff' : m.c1}">${sh.svg}</g>${pic}` : `<g ${line ? `stroke="${m.c1}" stroke-width="6"` : ''} fill="${fill}">${sh.svg}</g>${glyph}`;
  const txt = String(upper ? name.toUpperCase() : name).replace(/[<>&]/g, ''), tg = String(tag).replace(/[<>&]/g, '');
  const cw = (upper ? 42 : 35) + (weight >= 900 ? 6 : 0), tw = Math.max(40, txt.length * cw + Math.max(0, txt.length - 1) * track * 2);
  const T = (x, y, anchor) => `<text x="${x}" y="${y}" ${anchor ? `text-anchor="${anchor}" ` : ''}font-family="${font}" font-weight="${weight}" font-size="56" letter-spacing="${track * 2}" fill="${textColor}">${txt}</text>`;
  const G = (x, y, anchor) => tg ? `<text x="${x}" y="${y}" ${anchor ? `text-anchor="${anchor}" ` : ''}font-family="${font}" font-size="26" fill="${textColor}" opacity=".7">${tg}</text>` : '';
  let W, H, body;
  if (layout === 'mark') { W = H = S; body = mark; }
  else if (layout === 'word') { W = tw + 20; H = tg ? 120 : 90; body = T(10, 64) + G(10, 104); }
  else if (layout === 'stack') { W = Math.max(tw, S) + 20; H = S + (tg ? 150 : 110); body = `<g transform="translate(${(W - S) / 2},0)">${mark}</g>${T(W / 2, S + 66, 'middle')}${G(W / 2, S + 108, 'middle')}`; }
  else { W = S + 30 + tw; H = S; body = `${mark.replace(/^/, '')}${T(S + 30, tg ? 56 : 66)}${G(S + 30, 90)}`; }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.round(W)} ${Math.round(H)}" width="${Math.round(W * 2)}" height="${Math.round(H * 2)}"><defs>${grad}</defs>${body}</svg>`;
}

// стиль форми для довільного блока (наприклад, рамки кадрування)
export const shapeCss = k => { const sh = SHAPES[k] || SHAPES.squircle; return `${sh.radius ? `border-radius:${sh.radius};` : ''}${sh.clip ? `clip-path:${sh.clip};` : ''}`; };
