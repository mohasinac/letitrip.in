const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'firestore.indexes.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const seen = new Set();
const unique = [];
for (const idx of data.indexes) {
  const key = JSON.stringify({ collectionGroup: idx.collectionGroup, queryScope: idx.queryScope, fields: idx.fields });
  if (!seen.has(key)) {
    seen.add(key);
    unique.push(idx);
  }
}
console.log('total', data.indexes.length);
console.log('unique', unique.length);
console.log('dups', data.indexes.length - unique.length);
fs.writeFileSync(file, JSON.stringify({ indexes: unique }, null, 2) + '\n');
console.log('wrote', file);
