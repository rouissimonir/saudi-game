-- Run against an isolated test project as postgres. This transaction always rolls back.
begin;
insert into auth.users(id) values ('df1511f4-1040-4bde-99e1-75032e189001'),('df1511f4-1040-4bde-99e1-75032e189002');
select public.record_refill('df1511f4-1040-4bde-99e1-75032e189001','SANDBOX','777777700001','purchase');
select set_config('request.jwt.claim.sub','df1511f4-1040-4bde-99e1-75032e189001',true);
set local role authenticated;
do $$
declare s jsonb; r record; denied boolean:=false;
begin
 select jsonb_build_object('board',jsonb_agg(to_jsonb(n)),'energy',10,'diamonds',5) into s from generate_series(1,49) n;
 select * into r from public.save_sandbox_checkpoint_bound('df1511f4-1040-4bde-99e1-75032e189001',0,s);
 if r.revision<>1 then raise exception 'initial checkpoint failed'; end if;
 select * into r from public.claim_sandbox_wallet_bound('df1511f4-1040-4bde-99e1-75032e189001',1,'df1511f4-1040-4bde-99e1-75032e189003');
 if r.revision<>2 or (r.game_state->>'energy')::int<>110 or (r.game_state->>'diamonds')::int<>35 or r.already_claimed then raise exception 'claim mismatch'; end if;
 select * into r from public.claim_sandbox_wallet_bound('df1511f4-1040-4bde-99e1-75032e189001',1,'df1511f4-1040-4bde-99e1-75032e189003');
 if r.revision<>2 or not r.already_claimed or (r.game_state->>'energy')::int<>110 then raise exception 'retry duplicated credit'; end if;
 begin perform public.save_sandbox_checkpoint_bound('df1511f4-1040-4bde-99e1-75032e189001',1,s); exception when serialization_failure then denied:=true; end;
 if not denied then raise exception 'stale save accepted'; end if;
 s:=jsonb_set(r.game_state,'{energy}','120'::jsonb);
 select * into r from public.save_sandbox_checkpoint_bound('df1511f4-1040-4bde-99e1-75032e189001',2,s);
 select * into r from public.claim_sandbox_wallet_bound('df1511f4-1040-4bde-99e1-75032e189001',1,'df1511f4-1040-4bde-99e1-75032e189003');
 if r.revision<>3 or not r.already_claimed or (r.game_state->>'energy')::int<>120 then raise exception 'retry reverted later progress'; end if;
 denied:=false;
 begin perform public.claim_sandbox_wallet_bound('df1511f4-1040-4bde-99e1-75032e189001',3,'df1511f4-1040-4bde-99e1-75032e189004'); exception when others then denied:=true; end;
 if not denied then raise exception 'empty wallet accepted'; end if;
 perform set_config('request.jwt.claim.sub','df1511f4-1040-4bde-99e1-75032e189002',true);
 if (select count(*) from public.sandbox_game_checkpoints)<>0 then raise exception 'another user can read checkpoint'; end if;
 denied:=false;
 begin perform public.save_sandbox_checkpoint_bound('df1511f4-1040-4bde-99e1-75032e189001',0,s); exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'mismatched account save accepted'; end if;
 select * into r from public.save_sandbox_checkpoint_bound('df1511f4-1040-4bde-99e1-75032e189002',0,s);
 denied:=false;
 begin perform public.claim_sandbox_wallet_bound('df1511f4-1040-4bde-99e1-75032e189002',1,'df1511f4-1040-4bde-99e1-75032e189003'); exception when others then denied:=true; end;
 if not denied then raise exception 'other account reused claim'; end if;
end $$;
select 'checkpoint tests passed' as result;
rollback;
