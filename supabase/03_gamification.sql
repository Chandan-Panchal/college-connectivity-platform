create table if not exists public.user_points (
  user_id uuid primary key references public.users (id) on delete cascade,
  points integer not null default 0 check (points >= 0),
  level integer not null default 1 check (level >= 1),
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_user_points_init()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_points (user_id, points, level)
  values (new.id, 0, 1)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_public_user_created_user_points on public.users;
create trigger on_public_user_created_user_points
after insert on public.users
for each row
execute function public.handle_user_points_init();

create or replace function public.add_points(target_user_id uuid, points_to_add integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  next_points integer;
  next_level integer;
begin
  insert into public.user_points (user_id, points, level)
  values (target_user_id, 0, 1)
  on conflict (user_id) do nothing;

  update public.user_points
  set
    points = user_points.points + points_to_add,
    level = floor((user_points.points + points_to_add) / 50.0)::int + 1
  where user_id = target_user_id
  returning points, level
  into next_points, next_level;

  return jsonb_build_object(
    'points', coalesce(next_points, 0),
    'level', coalesce(next_level, 1)
  );
end;
$$;

create or replace view public.leaderboard as
select user_id, points, level
from public.user_points
order by points desc;

alter table public.user_points enable row level security;

drop policy if exists "user points are readable" on public.user_points;
create policy "user points are readable"
on public.user_points
for select
to authenticated
using (true);

drop policy if exists "users can insert own points row" on public.user_points;
create policy "users can insert own points row"
on public.user_points
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "users can update own points row" on public.user_points;
create policy "users can update own points row"
on public.user_points
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant execute on function public.add_points(uuid, integer) to authenticated;

insert into public.user_points (user_id, points, level)
select id, 0, 1
from public.users
on conflict (user_id) do nothing;
