// Симулятор стартапу · інтерв'ю з клієнтами: рід, узгодження, логіка. node --test tests/startup-interview.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, QUESTIONS } from '../startupsim/js/sim.js';
import { IDEAS, FEM, gx, whoFem, roleName, TRAITS } from '../startupsim/js/data.js';

test('gx вибирає жіночу або чоловічу форму', () => {
  assert.equal(gx('Я {сиділа|сидів} вдома', true), 'Я сиділа вдома');
  assert.equal(gx('Я {сиділа|сидів} вдома', false), 'Я сидів вдома');
  assert.equal(gx('без розмітки', true), 'без розмітки');
});

test('стать за описом людини', () => {
  for (const w of ['мама учня 6 класу', 'бабуся першокласника', 'учениця 8 класу', 'директорка ліцею', 'вчителька математики й завуч', 'дизайнерка, 29 років', 'пенсіонерка з балконом-садом', 'агрономка тепличного комплексу', 'офіс-менеджерка IT-компанії', 'власниця кав\'ярні', 'майстриня манікюру', 'бровістка', 'головна лікарка стоматології', 'бухгалтерка, хоче в IT', 'адміністраторка барбершопу']) assert.equal(whoFem(w), true, w);
  for (const w of ['тато двох школярів', 'учень 7 класу', 'заступник директора з навчальної роботи', 'директор гімназії', 'студент-біолог', 'програміст, 34 роки, «тато» 40 вазонів', 'власник теплиці з огірками', 'фермер, вирощує полуницю', 'керівник розсадника', 'адміністратор коворкінгу', 'барбер, працює сам', 'масажист', 'керуючий мережею з трьох салонів', 'адміністратор медцентру', 'інженер, 27 років']) assert.equal(whoFem(w), false, w);
});

test('усі описи респондентів у даних мають визначений рід, а розмітка в текстах парна', () => {
  for (const [id, I] of Object.entries(IDEAS)) for (const [k, g] of Object.entries(I.segments)) {
    for (const w of g.who) assert.equal(typeof whoFem(w), 'boolean');
    for (const s of [...g.high, ...g.low, ...g.solutions]) assert.doesNotMatch(gx(s, true) + gx(s, false), /[{}|]/, `${id}.${k}: ${s}`);
  }
});

test('співрозмовник: ім’я того ж роду, що й опис, відповіді без розмітки й без «спробувава»', () => {
  let n = 0;
  for (let seed = 1; seed <= 60; seed++) for (const idea of Object.keys(IDEAS)) {
    const S = newGame({ idea, founder: 'Тест', company: 'Тест', seed });
    S.s.hours.customers = 30;
    for (const k of Object.keys(S.I.segments)) {
      const iv = S.startInterview(k); if (!iv) continue;
      const first = iv.p.name.split(' ')[0];
      assert.equal(FEM.has(first), whoFem(iv.p.who), `${iv.p.name} — ${iv.p.who}`);
      for (const q of ['how', 'last', 'spend', 'like', 'worst']) { if (iv.asked.length >= 3) break; const a = S.ask(q); if (a) { assert.doesNotMatch(a, /[{}|]|спробувава/, a); n++; } }
      S.finishInterview(); S.s.talks = 0;
    }
  }
  assert.ok(n > 300, 'перевірено відповідей: ' + n);
});

test('жіноча й чоловіча форми відповіді відрізняються лише там, де має бути рід', () => {
  const S = newGame({ idea: 'homework', founder: 'Т', company: 'Т', seed: 3 });
  const f = gx(S.I.segments.students.high[0], true), m = gx(S.I.segments.students.high[0], false);
  assert.notEqual(f, m);
  assert.match(S.I.segments.students.high[0], /\{[^}]+\|[^}]+\}/);
});

test('посади й риси кандидатів мають жіночі форми', () => {
  assert.equal(roleName('dev', true), 'Розробниця'); assert.equal(roleName('dev', false), 'Розробник');
  assert.equal(roleName('sales', true), 'Менеджерка з продажів'); assert.equal(roleName('support', true), 'Підтримка клієнтів');
  for (const t of TRAITS) assert.doesNotMatch(gx(t.t, true) + gx(t.t, false), /[{}|]/);
  assert.match(gx(TRAITS[1].t, true), /^Педантична/); assert.match(gx(TRAITS[1].t, false), /^Педантичний/);
});

test('запитання співбесіди: кожне має підказку або позначку підказувального', () => {
  for (const q of QUESTIONS) assert.ok(q.hint || q.bad, q.id);
});

test('промпти для ШІ: у кожній вправі є запит із ролею, контекстом і правилами, звертання без роду', async () => {
  const { aiPrompts } = await import('../startupsim/js/ai.js');
  const { exAll } = await import('../startupsim/js/ex-core.js');
  const S = newGame({ idea: 'homework', founder: 'Тест', company: 'Зошит', seed: 2 });
  for (const def of exAll()) {
    const list = aiPrompts(S, def);
    assert.ok(list.length >= 3, def.id);
    assert.ok(list.some(x => x.k === 'think') && list.some(x => x.k === 'check'), def.id);
    for (const x of list) {
      assert.match(x.p, /Роль:[\s\S]*Контекст:[\s\S]*Завдання:[\s\S]*Правила відповіді:/, def.id + ' ' + x.t);
      assert.match(x.p, /Зошит/, 'назва компанії підставлена');
      assert.doesNotMatch(x.p, /\{(idea|pitch|company|title)\}|\(-ла\)|\(-лась\)|я (зробив|вибрав|записав|склав)\b/, def.id + ' ' + x.t);
    }
  }
});
