# Supabase Backend Setup

Use [01_schema.sql](/c:/Users/devesh/.antigravity/college-connect/supabase/01_schema.sql) as the full backend bootstrap for this project.

## What This Sets Up

1. Auth-linked `users` and `profiles`
2. Admin-only `notifications`
3. Student-owned `resources`
4. Seller-owned `marketplace_items`
5. Optional `messages`, `communities`, and `community_members`
6. Storage buckets with matching storage policies
7. Trigger-based user creation after signup
8. Production-safe RLS policies

## Buckets

- `avatars`: profile pictures, one top-level folder per user, for example `user-uuid/avatar.png`
- `resources`: PDFs or study files, one top-level folder per user, for example `user-uuid/os-notes.pdf`
- `notifications`: admin-uploaded update attachments such as images or PDFs
- `marketplace`: student-uploaded marketplace item images, one top-level folder per user

## Admin Role Setup

New users are created as `student` automatically. Promote an admin manually from the SQL editor:

```sql
update public.users
set role = 'admin'
where email = 'admin@college.edu';
```

## Frontend Naming

The schema uses snake_case consistently:

- `created_by`
- `file_url`
- `uploaded_by`
- `seller_id`
- `created_at`

If your current React code still uses camelCase fields like `fileURL` or `uploadedBy`, update the frontend to match this schema for best long-term stability.

## Recommended Signup Flow

1. User signs up with Supabase Auth.
2. `handle_new_user()` trigger creates `public.users` and `public.profiles`.
3. Frontend redirects user to a profile completion page.
4. User updates their own `profiles` row.

## Notes

- Public reads are limited to authenticated users on tables.
- Public file access is enabled on storage buckets so uploaded images and PDFs can be viewed directly.
- If you need truly public app pages without login, change selected `for select to authenticated` policies to `to public`.
