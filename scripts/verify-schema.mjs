import fs from 'node:fs';
import path from 'node:path';

const schemaPath = path.resolve(process.cwd(), 'supabase_schema.sql');

if (!fs.existsSync(schemaPath)) {
  console.error('❌ supabase_schema.sql not found in repository root.');
  process.exit(1);
}

const raw = fs.readFileSync(schemaPath, 'utf8');
const tableRegex = /create\s+table\s+public\.(\w+)/gi;
const tables = new Map();
const duplicates = [];
let match;

const getLineNumber = (index) => raw.slice(0, index).split(/\r?\n/).length;

while ((match = tableRegex.exec(raw)) !== null) {
  const name = match[1];
  const line = getLineNumber(match.index);

  if (tables.has(name)) {
    duplicates.push({ name, firstLine: tables.get(name), duplicateLine: line });
  } else {
    tables.set(name, line);
  }
}

const requiredTables = [
  'profiles',
  'products',
  'orders',
  'order_items',
  'payments',
  'cart',
  'posts',
  'agent_tasks'
];

const missing = requiredTables.filter((table) => !tables.has(table));

if (duplicates.length > 0) {
  console.error('❌ Duplicate CREATE TABLE statements detected:');
  duplicates.forEach((dup) => {
    console.error(`  - ${dup.name} (first seen at line ${dup.firstLine}, duplicated at line ${dup.duplicateLine})`);
  });
  process.exit(1);
}

if (missing.length > 0) {
  console.error('❌ Missing critical tables in supabase_schema.sql:');
  missing.forEach((name) => console.error(`  - ${name}`));
  process.exit(1);
}

console.log('✅ supabase_schema.sql validated successfully.');
console.log(`   Tables detected (${tables.size}): ${Array.from(tables.keys()).join(', ')}`);