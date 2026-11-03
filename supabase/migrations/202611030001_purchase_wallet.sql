create table public.purchase_wallets (
 user_id uuid not null references auth.users(id) on delete cascade,
 environment text not null check(environment in ('SANDBOX','PRODUCTION')),
 energy bigint not null default 0, gems bigint not null default 0,
 primary key(user_id,environment)
);
create table public.purchase_ledger (
 environment text not null check(environment in ('SANDBOX','PRODUCTION')),
 transaction_id text not null, kind text not null check(kind in ('purchase','refund')),
 user_id uuid not null references auth.users(id) on delete cascade,
 energy bigint not null, gems bigint not null, created_at timestamptz not null default now(),
 primary key(environment,transaction_id,kind)
);
alter table public.purchase_wallets enable row level security;
alter table public.purchase_ledger enable row level security;
revoke all on public.purchase_wallets,public.purchase_ledger from anon,authenticated;
grant select on public.purchase_wallets,public.purchase_ledger to authenticated;
create policy wallet_owner on public.purchase_wallets for select to authenticated using(user_id=auth.uid());
create policy ledger_owner on public.purchase_ledger for select to authenticated using(user_id=auth.uid());
create function public.record_refill(p_user uuid,p_environment text,p_transaction text,p_kind text)
returns void language plpgsql security definer set search_path='' as $$
declare changed integer; delta integer;
begin
 if p_environment not in ('SANDBOX','PRODUCTION') or p_kind not in ('purchase','refund') or length(p_transaction) not between 1 and 200 then raise exception 'Invalid purchase event'; end if;
 delta := case when p_kind='purchase' then 1 else -1 end;
 insert into public.purchase_ledger(environment,transaction_id,kind,user_id,energy,gems)
 values(p_environment,p_transaction,p_kind,p_user,120*delta,20*delta)
 on conflict do nothing;
 get diagnostics changed=row_count;
 if changed=0 then return; end if;
 insert into public.purchase_wallets(user_id,environment,energy,gems)
 values(p_user,p_environment,120*delta,20*delta)
 on conflict(user_id,environment) do update set
 energy=public.purchase_wallets.energy+excluded.energy,
 gems=public.purchase_wallets.gems+excluded.gems;
end $$;
revoke all on function public.record_refill(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.record_refill(uuid,text,text,text) to service_role;

