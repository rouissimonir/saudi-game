revoke all on function public.save_sandbox_checkpoint(bigint,jsonb) from public,anon,authenticated;
revoke all on function public.claim_sandbox_wallet(bigint,uuid) from public,anon,authenticated;
revoke all on function purchase_private.save_sandbox_checkpoint(bigint,jsonb) from public,anon,authenticated;
revoke all on function purchase_private.claim_sandbox_wallet(bigint,uuid) from public,anon,authenticated;

create function purchase_private.save_sandbox_checkpoint_bound(p_user uuid,p_expected_revision bigint,p_state jsonb)
returns table(revision bigint,game_state jsonb) language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or auth.uid() is distinct from p_user then raise exception 'Account changed' using errcode='42501'; end if;
 return query select * from purchase_private.save_sandbox_checkpoint(p_expected_revision,p_state);
end $$;
revoke all on function purchase_private.save_sandbox_checkpoint_bound(uuid,bigint,jsonb) from public,anon;
grant execute on function purchase_private.save_sandbox_checkpoint_bound(uuid,bigint,jsonb) to authenticated;

create function purchase_private.claim_sandbox_wallet_bound(p_user uuid,p_expected_revision bigint,p_claim_id uuid)
returns table(revision bigint,game_state jsonb,energy_claimed bigint,gems_claimed bigint,already_claimed boolean)
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or auth.uid() is distinct from p_user then raise exception 'Account changed' using errcode='42501'; end if;
 return query select * from purchase_private.claim_sandbox_wallet(p_expected_revision,p_claim_id);
end $$;
revoke all on function purchase_private.claim_sandbox_wallet_bound(uuid,bigint,uuid) from public,anon;
grant execute on function purchase_private.claim_sandbox_wallet_bound(uuid,bigint,uuid) to authenticated;

create function public.save_sandbox_checkpoint_bound(p_user uuid,p_expected_revision bigint,p_state jsonb)
returns table(revision bigint,game_state jsonb) language sql security invoker set search_path='' as $$
 select * from purchase_private.save_sandbox_checkpoint_bound(p_user,p_expected_revision,p_state);
$$;
revoke all on function public.save_sandbox_checkpoint_bound(uuid,bigint,jsonb) from public,anon;
grant execute on function public.save_sandbox_checkpoint_bound(uuid,bigint,jsonb) to authenticated;

create function public.claim_sandbox_wallet_bound(p_user uuid,p_expected_revision bigint,p_claim_id uuid)
returns table(revision bigint,game_state jsonb,energy_claimed bigint,gems_claimed bigint,already_claimed boolean)
language sql security invoker set search_path='' as $$
 select * from purchase_private.claim_sandbox_wallet_bound(p_user,p_expected_revision,p_claim_id);
$$;
revoke all on function public.claim_sandbox_wallet_bound(uuid,bigint,uuid) from public,anon;
grant execute on function public.claim_sandbox_wallet_bound(uuid,bigint,uuid) to authenticated;
