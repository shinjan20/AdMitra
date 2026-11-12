create table if not exists public.ai_video_generation_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  usage_date date not null default (now() at time zone 'utc')::date,
  generation_count integer not null default 0 check (generation_count >= 0),
  primary key (user_id, usage_date)
);

alter table public.ai_video_generation_usage enable row level security;
revoke all on table public.ai_video_generation_usage from public, anon, authenticated;

create or replace function public.consume_video_generation()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_count integer;
begin
  if auth.uid() is null then
    return -1;
  end if;

  insert into public.ai_video_generation_usage as usage (
    user_id,
    usage_date,
    generation_count
  )
  values (
    auth.uid(),
    (now() at time zone 'utc')::date,
    1
  )
  on conflict (user_id, usage_date)
  do update
    set generation_count = usage.generation_count + 1
    where usage.generation_count < 25
  returning generation_count into updated_count;

  if updated_count is null then
    return -1;
  end if;

  return 25 - updated_count;
end;
$$;

revoke all on function public.consume_video_generation() from public, anon;
grant execute on function public.consume_video_generation() to authenticated;

create or replace function public.get_video_generations_remaining()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when auth.uid() is null then 0
    else greatest(25 - coalesce((
      select generation_count
      from public.ai_video_generation_usage
      where user_id = auth.uid()
        and usage_date = (now() at time zone 'utc')::date
    ), 0), 0)
  end;
$$;

revoke all on function public.get_video_generations_remaining() from public, anon;
grant execute on function public.get_video_generations_remaining() to authenticated;

create table if not exists public.ad_video_jobs (
  interaction_id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null check (status in ('in_progress', 'completed', 'failed')),
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ad_video_jobs enable row level security;
revoke all on table public.ad_video_jobs from public, anon;
grant select, insert, update on table public.ad_video_jobs to authenticated;

create policy "Users can access their own ad video jobs"
on public.ad_video_jobs
for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ad-videos', 'ad-videos', false, 104857600, array['video/mp4'])
on conflict (id) do update
set public = false,
    file_size_limit = 104857600,
    allowed_mime_types = array['video/mp4'];

create policy "Users can read their own ad videos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'ad-videos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can upload their own ad videos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'ad-videos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can update their own ad videos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'ad-videos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'ad-videos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
