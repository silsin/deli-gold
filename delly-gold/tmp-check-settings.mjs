import {DatabaseSync} from 'node:sqlite';
const db=new DatabaseSync('./prisma/dev.db');
db.prepare(`UPDATE settings SET value = 'پیشنهاد شگفت انگیز', updated_at = datetime('now') WHERE key = 'special_offers_title'`).run();
console.log('fixed special_offers_title');
const check=db.prepare(`SELECT value FROM settings WHERE key = 'special_offers_title'`).get();
console.log('now:', JSON.stringify(check.value), '| len', check.value.length, '| bytes', Buffer.byteLength(check.value,'utf8'));
