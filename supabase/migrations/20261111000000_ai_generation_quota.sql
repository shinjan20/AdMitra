create table if not exists public.ai_generation_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  usage_date date not null default (now() at time zone 'utc')::date,
  generation_count integer not null default 0 check (generation_count >= 0),
  primary key (user_id, usage_date)
);

alter table public.ai_generation_usage enable row level security;
revoke all on table public.ai_generation_usage from public, anon, authenticated;

create or replace function public.consume_ad_generation()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_count integer;
begin
  if auth.uid() is null then
    return false;
  end if;

  insert into public.ai_generation_usage as usage (
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
    where usage.generation_count < 5
  returning generation_count into updated_count;

  return updated_count is not null;
end;
$$;

revoke all on function public.consume_ad_generation() from public, anon;
grant execute on function public.consume_ad_generation() to authenticated;
