-- Run after the refill_amounts migration in a disposable database.
begin;
insert into auth.users(id) values ('0c6d2cd3-835f-42ec-a675-9a8d2317e109'), ('70946b0e-1959-4121-80d4-5702ee614eed');
do $$
declare u uuid := '0c6d2cd3-835f-42ec-a675-9a8d2317e109'; r record;
begin
 perform public.record_refill(u,'SANDBOX','new-purchase','purchase');
 perform public.record_refill(u,'SANDBOX','new-purchase','purchase');
 select * into r from public.purchase_wallets where user_id=u and environment='SANDBOX';
 if r.energy<>100 or r.gems<>30 then raise exception 'purchase or replay mismatch'; end if;
 perform public.record_refill(u,'SANDBOX','new-purchase','refund');
 perform public.record_refill(u,'SANDBOX','new-purchase','refund');
 select * into r from public.purchase_wallets where user_id=u and environment='SANDBOX';
 if r.energy<>0 or r.gems<>0 then raise exception 'refund or replay mismatch'; end if;
 perform public.record_refill(u,'SANDBOX','refund-first','refund');
 perform public.record_refill(u,'SANDBOX','refund-first','purchase');
 select * into r from public.purchase_wallets where user_id=u and environment='SANDBOX';
 if r.energy<>0 or r.gems<>0 then raise exception 'refund-before-purchase mismatch'; end if;
 insert into public.purchase_ledger(environment,transaction_id,kind,user_id,energy,gems)
 values ('SANDBOX','legacy','purchase',u,120,20);
 perform public.record_refill(u,'SANDBOX','legacy','refund');
 select * into r from public.purchase_ledger where environment='SANDBOX' and transaction_id='legacy' and kind='refund';
 if r.energy<>-120 or r.gems<>-20 then raise exception 'legacy refund mismatch'; end if;
 begin
  perform public.record_refill('70946b0e-1959-4121-80d4-5702ee614eed','SANDBOX','legacy','refund');
  raise exception 'other account accepted';
 exception when raise_exception then
  if sqlerrm='other account accepted' then raise; end if;
 end;
end $$;
rollback;
