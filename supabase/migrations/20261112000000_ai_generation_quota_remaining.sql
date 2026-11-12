drop function if exists public.consume_ad_generation();

create function public.consume_ad_generation()
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
    where usage.generation_count < 25
  returning generation_count into updated_count;

  if updated_count is null then
    return -1;
  end if;

  return 25 - updated_count;
end;
$$;

revoke all on function public.consume_ad_generation() from public, anon;
grant execute on function public.consume_ad_generation() to authenticated;

create or replace function public.get_ad_generations_remaining()
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
      from public.ai_generation_usage
      where user_id = auth.uid()
        and usage_date = (now() at time zone 'utc')::date
    ), 0), 0)
  end;
$$;

revoke all on function public.get_ad_generations_remaining() from public, anon;
grant execute on function public.get_ad_generations_remaining() to authenticated;
