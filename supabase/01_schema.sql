create extension if not exists pgcrypto;

create type public.app_role as enum ('student', 'admin');
create type public.marketplace_item_status as enum ('active', 'sold', 'archived');
create type public.message_status as enum ('sent', 'read');
create type public.notification_attachment_type as enum ('text', 'image', 'pdf');
create type public.resource_type as enum ('notes', 'pyq', 'assignment', 'book', 'other');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    'student'
  )
  on conflict (id) do update
  set
    name = excluded.name,
    email = excluded.email;

  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) >= 2),
  email text not null unique,
  role public.app_role not null default 'student',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  user_id uuid primary key references public.users (id) on delete cascade,
  branch text,
  year smallint check (year between 1 and 8),
  bio text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  attachment_type public.notification_attachment_type not null default 'text',
  image_url text,
  file_url text,
  created_by uuid not null references public.users (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint notifications_attachment_check check (
    (
      attachment_type = 'text'
      and image_url is null
    ) or (
      attachment_type = 'image'
      and image_url is not null
    ) or (
      attachment_type = 'pdf'
      and file_url is not null
    )
  )
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject text,
  semester smallint check (semester between 1 and 8),
  resource_type public.resource_type not null default 'notes',
  file_url text not null,
  uploaded_by uuid not null references public.users (id) on delete cascade,
  download_count integer not null default 0 check (download_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.marketplace_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  image_url text,
  seller_id uuid not null references public.users (id) on delete cascade,
  status public.marketplace_item_status not null default 'active',
  contact_phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.marketplace_items (id) on delete cascade,
  sender_id uuid not null references public.users (id) on delete cascade,
  receiver_id uuid not null references public.users (id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  status public.message_status not null default 'sent',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_by uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.community_members (
  community_id uuid not null references public.communities (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  joined_at timestamptz not null default timezone('utc', now()),
  primary key (community_id, user_id)
);

create index if not exists idx_users_role on public.users (role);
create index if not exists idx_notifications_created_at on public.notifications (created_at desc);
create index if not exists idx_notifications_created_by on public.notifications (created_by);
create index if not exists idx_resources_uploaded_by on public.resources (uploaded_by);
create index if not exists idx_resources_created_at on public.resources (created_at desc);
create index if not exists idx_marketplace_items_seller_id on public.marketplace_items (seller_id);
create index if not exists idx_marketplace_items_status on public.marketplace_items (status);
create index if not exists idx_messages_item_id on public.messages (item_id);
create index if not exists idx_messages_sender_receiver on public.messages (sender_id, receiver_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_notifications_updated_at on public.notifications;
create trigger set_notifications_updated_at
before update on public.notifications
for each row
execute function public.set_updated_at();

drop trigger if exists set_resources_updated_at on public.resources;
create trigger set_resources_updated_at
before update on public.resources
for each row
execute function public.set_updated_at();

drop trigger if exists set_marketplace_items_updated_at on public.marketplace_items;
create trigger set_marketplace_items_updated_at
before update on public.marketplace_items
for each row
execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = check_user_id
      and role = 'admin'
  );
$$;

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.notifications enable row level security;
alter table public.resources enable row level security;
alter table public.marketplace_items enable row level security;
alter table public.messages enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;

drop policy if exists "users can read users" on public.users;
create policy "users can read users"
on public.users
for select
to authenticated
using (true);

drop policy if exists "users can insert own row" on public.users;
create policy "users can insert own row"
on public.users
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "users can update own row" on public.users;
create policy "users can update own row"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id and role = (select role from public.users where id = auth.uid()));

drop policy if exists "profiles are readable" on public.profiles;
create policy "profiles are readable"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "notifications are readable" on public.notifications;
create policy "notifications are readable"
on public.notifications
for select
to authenticated
using (true);

drop policy if exists "admins can insert notifications" on public.notifications;
create policy "admins can insert notifications"
on public.notifications
for insert
to authenticated
with check (
  public.is_admin()
  and created_by = auth.uid()
);

drop policy if exists "admins can update notifications" on public.notifications;
create policy "admins can update notifications"
on public.notifications
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can delete notifications" on public.notifications;
create policy "admins can delete notifications"
on public.notifications
for delete
to authenticated
using (public.is_admin());

drop policy if exists "resources are readable" on public.resources;
create policy "resources are readable"
on public.resources
for select
to authenticated
using (true);

drop policy if exists "users can upload own resources" on public.resources;
create policy "users can upload own resources"
on public.resources
for insert
to authenticated
with check (uploaded_by = auth.uid());

drop policy if exists "owners can update own resources" on public.resources;
create policy "owners can update own resources"
on public.resources
for update
to authenticated
using (uploaded_by = auth.uid())
with check (uploaded_by = auth.uid());

drop policy if exists "owners or admins can delete resources" on public.resources;
create policy "owners or admins can delete resources"
on public.resources
for delete
to authenticated
using (uploaded_by = auth.uid() or public.is_admin());

drop policy if exists "marketplace is readable" on public.marketplace_items;
create policy "marketplace is readable"
on public.marketplace_items
for select
to authenticated
using (true);

drop policy if exists "users can create marketplace item" on public.marketplace_items;
create policy "users can create marketplace item"
on public.marketplace_items
for insert
to authenticated
with check (seller_id = auth.uid());

drop policy if exists "seller can update own marketplace item" on public.marketplace_items;
create policy "seller can update own marketplace item"
on public.marketplace_items
for update
to authenticated
using (seller_id = auth.uid())
with check (seller_id = auth.uid());

drop policy if exists "seller can delete own marketplace item" on public.marketplace_items;
create policy "seller can delete own marketplace item"
on public.marketplace_items
for delete
to authenticated
using (seller_id = auth.uid() or public.is_admin());

drop policy if exists "participants can read messages" on public.messages;
create policy "participants can read messages"
on public.messages
for select
to authenticated
using (sender_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists "participants can send messages" on public.messages;
create policy "participants can send messages"
on public.messages
for insert
to authenticated
with check (sender_id = auth.uid());

drop policy if exists "participants can update message status" on public.messages;
create policy "participants can update message status"
on public.messages
for update
to authenticated
using (sender_id = auth.uid() or receiver_id = auth.uid())
with check (sender_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists "communities are readable" on public.communities;
create policy "communities are readable"
on public.communities
for select
to authenticated
using (true);

drop policy if exists "admins can create communities" on public.communities;
create policy "admins can create communities"
on public.communities
for insert
to authenticated
with check (public.is_admin() and created_by = auth.uid());

drop policy if exists "admins can manage communities" on public.communities;
create policy "admins can manage communities"
on public.communities
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can delete communities" on public.communities;
create policy "admins can delete communities"
on public.communities
for delete
to authenticated
using (public.is_admin());

drop policy if exists "community members are readable" on public.community_members;
create policy "community members are readable"
on public.community_members
for select
to authenticated
using (true);

drop policy if exists "users can join community themselves" on public.community_members;
create policy "users can join community themselves"
on public.community_members
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "users can leave community themselves" on public.community_members;
create policy "users can leave community themselves"
on public.community_members
for delete
to authenticated
using (user_id = auth.uid() or public.is_admin());

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('resources', 'resources', true),
  ('notifications', 'notifications', true),
  ('marketplace', 'marketplace', true)
on conflict (id) do nothing;

drop policy if exists "avatars are publicly readable" on storage.objects;
create policy "avatars are publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

drop policy if exists "users can upload own avatar" on storage.objects;
create policy "users can upload own avatar"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users can update own avatar" on storage.objects;
create policy "users can update own avatar"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users can delete own avatar" on storage.objects;
create policy "users can delete own avatar"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "resources are publicly readable" on storage.objects;
create policy "resources are publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'resources');

drop policy if exists "users can upload own resources to storage" on storage.objects;
create policy "users can upload own resources to storage"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resources'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users can update own resources in storage" on storage.objects;
create policy "users can update own resources in storage"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'resources'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'resources'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users can delete own resources from storage" on storage.objects;
create policy "users can delete own resources from storage"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'resources'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
  )
);

drop policy if exists "notifications are publicly readable" on storage.objects;
create policy "notifications are publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'notifications');

drop policy if exists "admins can upload notifications assets" on storage.objects;
create policy "admins can upload notifications assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'notifications'
  and public.is_admin()
);

drop policy if exists "admins can update notifications assets" on storage.objects;
create policy "admins can update notifications assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'notifications'
  and public.is_admin()
)
with check (
  bucket_id = 'notifications'
  and public.is_admin()
);

drop policy if exists "admins can delete notifications assets" on storage.objects;
create policy "admins can delete notifications assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'notifications'
  and public.is_admin()
);

drop policy if exists "marketplace images are publicly readable" on storage.objects;
create policy "marketplace images are publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'marketplace');

drop policy if exists "users can upload own marketplace assets" on storage.objects;
create policy "users can upload own marketplace assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'marketplace'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users can update own marketplace assets" on storage.objects;
create policy "users can update own marketplace assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'marketplace'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'marketplace'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users can delete own marketplace assets" on storage.objects;
create policy "users can delete own marketplace assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'marketplace'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
  )
);
