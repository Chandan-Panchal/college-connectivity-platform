-- MINIMAL FIX: Just create the resources table and types
-- Run this in Supabase SQL Editor to fix the "resource_type" error

-- Create the resource_type enum (if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE public.resource_type AS ENUM ('notes', 'pyq', 'assignment', 'book', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the resources table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject text,
  semester smallint check (semester between 1 and 8),
  resource_type public.resource_type not null default 'notes',
  file_url text not null,
  uploaded_by uuid not null,
  download_count integer not null default 0 check (download_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read resources
CREATE POLICY IF NOT EXISTS "Public can read resources" ON public.resources
  FOR SELECT USING (true);

-- Allow authenticated users to insert resources
CREATE POLICY IF NOT EXISTS "Users can insert resources" ON public.resources
  FOR INSERT TO authenticated WITH CHECK (true);

-- Done! The resource_type column error should be fixed now.