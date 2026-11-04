create table public.sandbox_game_checkpoints (
 user_id uuid primary key references auth.users(id) on delete cascade,
 revision bigint not null default 0 check(revision>=0),
 game_state jsonb not null,
 updated_at timestamptz not null default now()
);
alter table public.sandbox_game_checkpoints enable row level security;
revoke all on public.sandbox_game_checkpoints from public,anon,authenticated;
grant select on public.sandbox_game_checkpoints to authenticated;
create policy own_sandbox_checkpoint on public.sandbox_game_checkpoints for select to authenticated
 using(user_id=(select auth.uid()));

create table purchase_private.sandbox_wallet_claims (
 claim_id uuid primary key,
 user_id uuid references auth.users(id) on delete set null,
 energy bigint not null,
 gems bigint not null,
 checkpoint_revision bigint not null,
 claimed_at timestamptz not null default now()
);
alter table purchase_private.sandbox_wallet_claims enable row level security;
revoke all on purchase_private.sandbox_wallet_claims from public,anon,authenticated;
create index sandbox_wallet_claims_user_idx on purchase_private.sandbox_wallet_claims(user_id);

create function public.save_sandbox_checkpoint(p_expected_revision bigint,p_state jsonb)
returns table(revision bigint,game_state jsonb) language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); current_revision bigint;
begin
 if uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if p_expected_revision is null or p_expected_revision<0 or p_state is null
    or jsonb_typeof(p_state)<>'object' or pg_catalog.octet_length(p_state::text)>250000
    or jsonb_typeof(p_state->'board') is distinct from 'array'
    or (p_state->>'energy') is null or (p_state->>'diamonds') is null
    or (p_state->>'energy') !~ '^[0-9]{1,9}$' or (p_state->>'diamonds') !~ '^[0-9]{1,9}$'
 then raise exception 'Invalid checkpoint'; end if;
 if jsonb_array_length(p_state->'board')<>49 then raise exception 'Invalid board'; end if;
 insert into public.sandbox_game_checkpoints(user_id,revision,game_state) values(uid,0,p_state) on conflict do nothing;
 select c.revision into current_revision from public.sandbox_game_checkpoints c where c.user_id=uid for update;
 if current_revision<>p_expected_revision then raise exception 'Checkpoint conflict' using errcode='40001'; end if;
 return query update public.sandbox_game_checkpoints c set revision=c.revision+1,game_state=p_state,updated_at=now()
  where c.user_id=uid returning c.revision,c.game_state;
end $$;
revoke all on function public.save_sandbox_checkpoint(bigint,jsonb) from public,anon;
grant execute on function public.save_sandbox_checkpoint(bigint,jsonb) to authenticated;

create function public.claim_sandbox_wallet(p_expected_revision bigint,p_claim_id uuid)
returns table(revision bigint,game_state jsonb,energy_claimed bigint,gems_claimed bigint,already_claimed boolean)
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); checkpoint public.sandbox_game_checkpoints%rowtype;
 wallet public.purchase_wallets%rowtype; receipt purchase_private.sandbox_wallet_claims%rowtype;
 e bigint; g bigint;
begin
 if uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if p_expected_revision is null or p_expected_revision<0 or p_claim_id is null then raise exception 'Invalid claim'; end if;
 select * into checkpoint from public.sandbox_game_checkpoints where user_id=uid for update;
 if not found then raise exception 'Checkpoint required'; end if;
 select * into receipt from purchase_private.sandbox_wallet_claims where claim_id=p_claim_id;
 if found then
  if receipt.user_id is distinct from uid then raise exception 'Claim belongs to another account'; end if;
  return query select checkpoint.revision,checkpoint.game_state,receipt.energy,receipt.gems,true; return;
 end if;
 if checkpoint.revision<>p_expected_revision then raise exception 'Checkpoint conflict' using errcode='40001'; end if;
 select * into wallet from public.purchase_wallets where user_id=uid and environment='SANDBOX' for update;
 if not found then raise exception 'No available wallet'; end if;
 e:=greatest(wallet.energy,0); g:=greatest(wallet.gems,0);
 if e=0 and g=0 then raise exception 'No credits available'; end if;
 if (checkpoint.game_state->>'energy')::bigint+e>999999999 or (checkpoint.game_state->>'diamonds')::bigint+g>999999999
 then raise exception 'Balance limit reached'; end if;
 update public.purchase_wallets set energy=energy-e,gems=gems-g where user_id=uid and environment='SANDBOX';
 update public.sandbox_game_checkpoints c set
  game_state=jsonb_set(jsonb_set(c.game_state,'{energy}',to_jsonb((c.game_state->>'energy')::bigint+e)),'{diamonds}',to_jsonb((c.game_state->>'diamonds')::bigint+g)),
  revision=c.revision+1,updated_at=now()
 where c.user_id=uid returning * into checkpoint;
 insert into purchase_private.sandbox_wallet_claims(claim_id,user_id,energy,gems,checkpoint_revision) values(p_claim_id,uid,e,g,checkpoint.revision);
 return query select checkpoint.revision,checkpoint.game_state,e,g,false;
end $$;
revoke all on function public.claim_sandbox_wallet(bigint,uuid) from public,anon;
grant execute on function public.claim_sandbox_wallet(bigint,uuid) to authenticated;
