-- Keep the amount chosen for the first event of a transaction for its inverse,
-- including old entries and refunds that arrive before purchase notifications.
create or replace function public.record_refill(p_user uuid,p_environment text,p_transaction text,p_kind text)
returns void language plpgsql security definer set search_path='' as $$
declare changed integer; delta integer; existing_user uuid; existing_energy bigint; existing_gems bigint; amount_energy bigint; amount_gems bigint;
begin
 if p_user is null or p_environment is null or p_environment not in ('SANDBOX','PRODUCTION')
    or p_kind is null or p_kind not in ('purchase','refund') or p_transaction is null
    or length(p_transaction) not between 1 and 200 then raise exception 'Invalid purchase event'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_environment || ':' || p_transaction, 0));
 select user_id, energy, gems into existing_user, existing_energy, existing_gems
 from public.purchase_ledger where environment=p_environment and transaction_id=p_transaction limit 1;
 if found then
   if existing_user is distinct from p_user then raise exception 'Transaction already belongs to another or deleted account'; end if;
   amount_energy := abs(existing_energy); amount_gems := abs(existing_gems);
 else
   amount_energy := 100; amount_gems := 30;
 end if;
 delta := case when p_kind='purchase' then 1 else -1 end;
 insert into public.purchase_ledger(environment,transaction_id,kind,user_id,energy,gems)
 values(p_environment,p_transaction,p_kind,p_user,amount_energy*delta,amount_gems*delta)
 on conflict do nothing;
 get diagnostics changed=row_count;
 if changed=0 then return; end if;
 insert into public.purchase_wallets(user_id,environment,energy,gems)
 values(p_user,p_environment,amount_energy*delta,amount_gems*delta)
 on conflict(user_id,environment) do update set
 energy=public.purchase_wallets.energy+excluded.energy,
 gems=public.purchase_wallets.gems+excluded.gems;
end $$;
revoke all on function public.record_refill(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.record_refill(uuid,text,text,text) to service_role;
