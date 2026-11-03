create index purchase_ledger_user_idx on public.purchase_ledger(user_id,environment,created_at);
alter policy wallet_owner on public.purchase_wallets using(user_id=(select auth.uid()));
alter policy ledger_owner on public.purchase_ledger using(user_id=(select auth.uid()));
