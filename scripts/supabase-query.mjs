import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envPath = resolve(process.cwd(), '.env');

if (existsSync(envPath)) {
  const envLines = readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of envLines) {
    if (!line || line.trim().startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in the environment.');
  process.exit(1);
}

const [, , table, select = '*', ...rawFilters] = process.argv;

if (!table) {
  console.error(
    'Usage: node scripts/supabase-query.mjs <table> [select] [column=value]...'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

let query = supabase.from(table).select(select);

for (const filter of rawFilters) {
  const [column, ...valueParts] = filter.split('=');
  const value = valueParts.join('=');

  if (!column || !valueParts.length) {
    console.error(`Invalid filter "${filter}". Use column=value.`);
    process.exit(1);
  }

  query = query.eq(column, value);
}

const { data, error } = await query;

if (error) {
  console.error(JSON.stringify(error, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));
