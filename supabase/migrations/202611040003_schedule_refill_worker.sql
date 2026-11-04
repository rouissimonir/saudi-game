create extension if not exists pg_cron;

create function public.refill_inbox_health()
returns table(pending bigint, retrying bigint, oldest_pending timestamptz)
language sql security definer set search_path='' as $$
  select count(*),count(*) filter(where attempts>0),min(received_at)
  from purchase_private.refill_inbox where status='pending';
$$;
revoke all on function public.refill_inbox_health() from public,anon,authenticated;
grant execute on function public.refill_inbox_health() to service_role;

select cron.schedule('qahwa-sandbox-refill-worker', '*/5 * * * *',
  'select * from public.process_refill_inbox(50)');
