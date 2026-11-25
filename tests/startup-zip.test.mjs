// ZIP-архів із роботами класу для сторінки викладача: читання, межі, помилки.
//   node --test tests/startup-zip.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeZip } from './_zip.mjs';
import { readZip, isZip } from '../startupsim/js/zip.js';

const asFile = (buf, name = 'a.zip') => new File([buf], name);

test('архів: стиснуті й нестиснуті файли збережень, кирилична назва, зайве пропускається', async () => {
  const zip = makeZip([
    { name: '9-Б/Марта Коваль.edvault', data: 'EDVAULT-STARTUP\nпроба 1' },
    { name: '9-Б/Олег.json', data: '{"a":1}', method: 0 },
    { name: '9-Б/', data: '', method: 0 },
    { name: '__MACOSX/9-Б/._Олег.json', data: 'x', method: 0 },
    { name: '9-Б/читай-мене.txt', data: 'не збереження' },
  ]);
  assert.ok(await isZip(asFile(zip)));
  const r = await readZip(asFile(zip));
  assert.equal(r.error, undefined);
  assert.deepEqual(r.entries.map(e => e.name), ['Марта Коваль.edvault', 'Олег.json']);
  assert.equal(r.entries[0].text, 'EDVAULT-STARTUP\nпроба 1');
});

test('архів: не ZIP, пошкоджений, з паролем, завеликий файл і забагато файлів — зрозумілі повідомлення', async () => {
  assert.equal(await isZip(asFile(Buffer.from('просто текст'), 'a.txt')), false);
  assert.match((await readZip(asFile(Buffer.from('просто текст')))).error, /не схоже на ZIP/);
  const good = makeZip([{ name: 'a.edvault', data: 'x' }]);
  assert.match((await readZip(asFile(good.subarray(0, 30)))).error, /не схоже|пошкоджений/);
  const pass = await readZip(asFile(makeZip([{ name: 'a.edvault', data: 'x', flags: 1 }])));
  assert.match(pass.skipped[0], /паролем/);
  const big = await readZip(asFile(makeZip([{ name: 'a.edvault', data: 'x'.repeat(2000) }])), { files: 10, each: 1000, total: 1e6 });
  assert.match(big.skipped[0], /завеликий/);
  const many = await readZip(asFile(makeZip(Array.from({ length: 6 }, (_, i) => ({ name: `${i}.edvault`, data: 'x' })))), { files: 5, each: 1e6, total: 1e6 });
  assert.match(many.error, /забагато/);
});
