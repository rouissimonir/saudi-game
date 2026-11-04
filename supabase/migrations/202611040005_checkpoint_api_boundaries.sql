alter function public.save_sandbox_checkpoint(bigint,jsonb) set schema purchase_private;
alter function public.claim_sandbox_wallet(bigint,uuid) set schema purchase_private;
grant usage on schema purchase_private to authenticated;
revoke all on function purchase_private.save_sandbox_checkpoint(bigint,jsonb) from public,anon;
revoke all on function purchase_private.claim_sandbox_wallet(bigint,uuid) from public,anon;
grant execute on function purchase_private.save_sandbox_checkpoint(bigint,jsonb) to authenticated;
grant execute on function purchase_private.claim_sandbox_wallet(bigint,uuid) to authenticated;

create function public.save_sandbox_checkpoint(p_expected_revision bigint,p_state jsonb)
returns table(revision bigint,game_state jsonb) language sql security invoker set search_path='' as $$
 select * from purchase_private.save_sandbox_checkpoint(p_expected_revision,p_state);
$$;
revoke all on function public.save_sandbox_checkpoint(bigint,jsonb) from public,anon;
grant execute on function public.save_sandbox_checkpoint(bigint,jsonb) to authenticated;

create function public.claim_sandbox_wallet(p_expected_revision bigint,p_claim_id uuid)
returns table(revision bigint,game_state jsonb,energy_claimed bigint,gems_claimed bigint,already_claimed boolean)
language sql security invoker set search_path='' as $$
 select * from purchase_private.claim_sandbox_wallet(p_expected_revision,p_claim_id);
$$;
revoke all on function public.claim_sandbox_wallet(bigint,uuid) from public,anon;
grant execute on function public.claim_sandbox_wallet(bigint,uuid) to authenticated;
