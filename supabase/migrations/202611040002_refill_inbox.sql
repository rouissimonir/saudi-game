create schema if not exists purchase_private;
revoke all on schema purchase_private from public, anon, authenticated;
create table purchase_private.refill_inbox (
 environment text not null check (environment = 'SANDBOX'),
 event_id text not null check (length(event_id) between 1 and 200),
 user_id uuid not null,
 transaction_id text not null check (transaction_id ~ '^[0-9]{1,200}$'),
 kind text not null check (kind in ('purchase','refund')),
 status text not null default 'pending' check (status in ('pending','processed')),
 attempts integer not null default 0,
 received_at timestamptz not null default now(),
 next_attempt_at timestamptz not null default now(),
 processed_at timestamptz,
 last_error_code text,
 primary key(environment,event_id)
);
alter table purchase_private.refill_inbox enable row level security;
revoke all on purchase_private.refill_inbox from public, anon, authenticated;
create index refill_inbox_pending_idx on purchase_private.refill_inbox (next_attempt_at,received_at) where status='pending';

create function public.enqueue_refill(p_event text,p_user uuid,p_environment text,p_transaction text,p_kind text)
returns void language plpgsql security definer set search_path='' as $$
declare existing purchase_private.refill_inbox%rowtype;
begin
 if p_event is null or length(p_event) not between 1 and 200 or p_user is null
    or p_environment is distinct from 'SANDBOX' or p_transaction is null
    or p_transaction !~ '^[0-9]{1,200}$' or p_kind is null or p_kind not in ('purchase','refund')
 then raise exception 'Invalid refill event'; end if;
 insert into purchase_private.refill_inbox(environment,event_id,user_id,transaction_id,kind)
 values(p_environment,p_event,p_user,p_transaction,p_kind) on conflict do nothing;
 if not found then
   select * into existing from purchase_private.refill_inbox where environment=p_environment and event_id=p_event;
   if existing.user_id is distinct from p_user or existing.transaction_id is distinct from p_transaction or existing.kind is distinct from p_kind
   then raise exception 'Conflicting refill event'; end if;
 end if;
end $$;
revoke all on function public.enqueue_refill(text,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.enqueue_refill(text,uuid,text,text,text) to service_role;

create function public.process_refill_inbox(p_limit integer default 50)
returns table(processed integer,failed integer) language plpgsql security definer set search_path='' as $$
declare item purchase_private.refill_inbox%rowtype; ok_count integer:=0; failed_count integer:=0;
begin
 if p_limit is null or p_limit < 1 or p_limit > 100 then raise exception 'Invalid batch limit'; end if;
 for item in select * from purchase_private.refill_inbox where status='pending' and next_attempt_at<=now()
   order by received_at for update skip locked limit p_limit
 loop
   begin
     perform public.record_refill(item.user_id,item.environment,item.transaction_id,item.kind);
     update purchase_private.refill_inbox set status='processed',attempts=attempts+1,processed_at=now(),last_error_code=null
       where environment=item.environment and event_id=item.event_id;
     ok_count:=ok_count+1;
   exception when others then
     update purchase_private.refill_inbox set attempts=attempts+1,last_error_code=sqlstate,
       next_attempt_at=now()+interval '5 minutes'
       where environment=item.environment and event_id=item.event_id;
     failed_count:=failed_count+1;
   end;
 end loop;
 return query select ok_count,failed_count;
end $$;
revoke all on function public.process_refill_inbox(integer) from public,anon,authenticated;
grant execute on function public.process_refill_inbox(integer) to service_role;
