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
    console.error('Please set it with: $env:SUPABASE_SERVICE_KEY="your-service-key"');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
    console.log('🚀 Setting up Supabase storage for resources...\n');

    try {
        // Create the storage bucket
        console.log('📦 Creating "resources" bucket...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
            console.error('❌ Error listing buckets:', listError.message);
            process.exit(1);
        }

        const bucketExists = buckets.some(b => b.name === 'resources');

        if (bucketExists) {
            console.log('✅ "resources" bucket already exists');
        } else {
            const { data, error } = await supabase.storage.createBucket('resources', {
                public: true,
                allowedMimeTypes: ['application/pdf'],
                fileSizeLimit: 52428800, // 50MB
            });

            if (error) {
                console.error('❌ Error creating bucket:', error.message);
                process.exit(1);
            }
            console.log('✅ "resources" bucket created successfully');
        }

        // Now we need to set storage policies via SQL
        console.log('\n🔒 Setting up storage policies...');
        
        const policiesSql = `
-- Enable storage policies
INSERT INTO storage.buckets (id, name, public, owner, created_at, updated_at)
VALUES ('resources', 'resources', true, null, now(), now())
ON CONFLICT (id) DO UPDATE SET 
  public = true;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload resources"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resources' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public to read files
CREATE POLICY "Public can read resources"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'resources');

-- Allow authenticated users to read files
CREATE POLICY "Authenticated users can read resources"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'resources');

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own resources"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'resources' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
        `;

        console.log('📋 Run this SQL in your Supabase dashboard (SQL Editor):');
        console.log('---');
        console.log(policiesSql);
        console.log('---');
        
        console.log('\n✅ Storage setup complete!');
        console.log('\n📝 Next steps:');
        console.log('1. Go to: https://supabase.com/dashboard/project/<your-project>/editor');
        console.log('2. Copy and paste the SQL above into the SQL Editor');
        console.log('3. Execute it');
        console.log('4. Your app is now ready to upload and serve resources!');

    } catch (err) {
        console.error('❌ Unexpected error:', err);
        process.exit(1);
    }
}

setupStorage();
