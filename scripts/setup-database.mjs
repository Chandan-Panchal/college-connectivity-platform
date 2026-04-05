import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');

// Load environment variables
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
    console.error('❌ VITE_SUPABASE_URL not found in .env file');
    process.exit(1);
}

if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
    console.error('Get it from: https://supabase.com/dashboard/project/<your-project>/settings/api');
    console.error('Then set it with: $env:SUPABASE_SERVICE_KEY="your-service-key"');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
    console.log('🚀 Setting up database schema...\n');

    try {
        // Read the schema file
        const schemaPath = path.join(__dirname, '..', 'supabase', '01_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

        console.log('📋 Executing schema setup...');

        // Split the SQL into individual statements and execute them
        const statements = schemaSql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
            if (statement.trim()) {
                console.log(`Executing: ${statement.substring(0, 50)}...`);
                const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

                if (error) {
                    console.error('❌ Error executing statement:', error.message);
                    console.error('Statement was:', statement);
                    // Continue with other statements
                }
            }
        }

        console.log('\n✅ Database schema setup complete!');
        console.log('\n📝 Next steps:');
        console.log('1. Run the storage setup: node scripts/setup-storage.mjs');
        console.log('2. Or manually run the SQL from supabase/02_setup_storage.sql in your Supabase dashboard');
        console.log('3. Your app should now work without the "resource_type" error!');

    } catch (err) {
        console.error('❌ Unexpected error:', err);
        console.log('\n💡 Alternative: Copy and paste the SQL from supabase/01_schema.sql');
        console.log('   into your Supabase dashboard SQL Editor and run it manually.');
        process.exit(1);
    }
}

setupDatabase();