# Resource Upload & Storage Setup Guide

This guide explains how to set up Supabase storage for uploading and managing resources (PDFs) in college-connect.

## Architecture Overview

```
1. User uploads PDF via UploadModal
   ↓
2. File stored in Supabase Storage bucket: "resources"
   ↓
3. Metadata saved to `resources` table in PostgreSQL
   ↓
4. Resources displayed on Resources.jsx page with download links
```

## Step-by-Step Setup

### Step 1: Go to Supabase Console

1. Open your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Storage Setup SQL

Copy and paste the entire content from `/supabase/02_setup_storage.sql` into the SQL Editor and click **Run**.

This will:
- ✅ Create the `resources` storage bucket
- ✅ Set up Row-Level Security (RLS) policies for:
  - **Uploads**: Only authenticated users can upload to their own folder
  - **Downloads**: Anyone (public) can read/download files
  - **Deletions**: Users can only delete their own files

### Step 3: Verify the Setup

Go to **Storage** in your Supabase console and confirm:
- The `resources` bucket exists
- It's marked as Public (allows downloads without auth)

### Step 4: Test the Feature

1. Start the dev server: `npm run dev`
2. Register/login to the app
3. Go to **Resources** page
4. Click **Share Resource** button
5. Fill in details and upload a PDF
6. The resource should appear in the list with a download link

## Database Schema

The `resources` table automatically stores:
- `id` - UUID primary key
- `title` - Resource title
- `description` - Optional description
- `subject` - Subject (DSA, DBMS, etc.)
- `semester` - Semester (1-8)
- `resource_type` - Type: notes, pyq, assignment, book, or other
- `file_url` - Public URL to the PDF in storage
- `uploaded_by` - User ID of uploader (foreign key)
- `download_count` - Download counter
- `created_at` / `updated_at` - Timestamps

## File Structure in Storage

Files are organized by user ID:
```
resources/
├── user-uuid-1/
│   ├── file-uuid-1.pdf
│   ├── file-uuid-2.pdf
│   └── ...
├── user-uuid-2/
│   ├── file-uuid-3.pdf
│   └── ...
└── ...
```

This ensures users can only manage their own uploads.

## Error Troubleshooting

### "Upload Error: Bucket not found"
→ Run Step 2 above to create the bucket

### "Your account is not allowed to upload resources yet"
→ The RLS policies aren't set correctly. Re-run the SQL from Step 2

### "Bucket already exists"
→ This is normal! The SQL script uses `ON CONFLICT` to handle existing buckets

### File won't download after upload
→ Make sure the bucket is marked as **Public** in Supabase Storage settings

## Features Included

✅ **PDF-only uploads** - Only PDF files are accepted  
✅ **File size limit** - 50MB max per file  
✅ **User-based organization** - Files organized by uploader  
✅ **Metadata tracking** - Subject, semester, type, description  
✅ **Search & filter** - Find resources by subject, semester, type  
✅ **Download counter** - Track resource popularity  
✅ **Progress indicator** - See upload progress in real-time  
✅ **Public access** - Resources are accessible to all users  

## Next Steps (Optional)

- Add download counter increment on file access
- Add resource ratings/comments
- Implement resource deletion UI
- Add bulk upload feature
- Set up automatic file cleanup for old resources

---

**Questions?** Check your browser console for detailed error messages.
