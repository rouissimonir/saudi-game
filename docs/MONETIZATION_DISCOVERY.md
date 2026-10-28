# Monetization discovery: Qahwa & Majlis

Status: product and technical discovery, not an implemented store. The owner's first target is Saudi Arabia's iPhone Casual top-grossing chart. A chart result depends on release, adoption and revenue; no pricing, revenue target or ranking is established here.

## Principles and hypotheses

- Keep the first gathering, guest relationships, regional story and board recovery available without payment. Test whether players enjoy the core loop before adjusting its pacing to sell relief.
- Prototype a permanent, optional Majlis decoration collection as a non-consumable: the player can see what it changes before choosing to buy. Test perceived value and cultural fit with Saudi players before creating a product or setting a price.
- Consider a convenience bundle only after observing real energy waits and testing fair free progression. Make contents and localized price clear; avoid randomized paid rewards in the initial offer. These are hypotheses, not approved products.
- Do not assume that the existing local `vipPassActive` save field proves a purchase. It changes generator odds and can be transferred with the save; an eventual paid entitlement must come from verified store state and cannot trust a player-editable save alone. Decide separately how to handle existing local saves without taking away legitimate access.

## Current implementation and decisions

The shop currently offers a daily in-game gift and earned milestones. It has no purchase SDK, store product IDs, payment or restore flow. The local save and transfer code preserve progress but are not a purchase ledger. Purchases remain unavailable.

RevenueCat documents a [Capacitor SDK](https://www.revenuecat.com/docs/tools/paywalls/installation), and a native StoreKit bridge is another option. Select the provider and product types after checking Capacitor compatibility, account setup, costs, and how transactions and consumable balances are reconciled. No provider, dashboard, products or entitlements have been configured. Never put private store credentials in the client or repository.

## Required before enabling a real offer

1. Define the product, ownership duration, price source and benefits; review Arabic and English copy and confirm the core loop remains enjoyable without purchase. Use store-provided localized prices rather than hardcoded amounts.
2. Configure the App Store product and signing/distribution environment. For a restorable product, provide a visible restore action and reconcile verified ownership, including revocation and account changes. See Apple's [purchase and restore documentation](https://developer.apple.com/documentation/storekit/offering-completing-and-restoring-in-app-purchases/).
3. Persist delivery safely and reconcile transaction IDs idempotently before finishing transactions. Do not allow repeated delivery on retries, relaunch, restores, transfer-code import or multiple devices. Consumables require a separate durable balance and reconciliation design; a restorable entitlement is not a consumable balance. Apple's [consumable history documentation](https://developer.apple.com/documentation/BundleResources/Information-Property-List/SKIncludeConsumableInAppPurchaseHistory) warns against relying only on device state for reconciliation.
4. Handle cancellation, deferred approval, offline or unavailable products, payment failure, interrupted delivery, revocation and restore failure without falsely granting or losing content. Provide a clear support path and no placeholder paid buttons.
5. Validate in StoreKit testing and the Apple sandbox, then on a signed physical iPhone: purchase, cancel, restore, reinstall, relaunch, background during purchase and retry delivery. Record product type, environment, build, device and observed result. A simulator compile or web preview cannot validate a real purchase.
6. Before release, recheck the applicable [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), including digital purchases, non-expiring purchased currency and disclosure of paid randomized-item odds where relevant. Review privacy, security, support and regional pricing with the responsible team.

After launch, evaluate the chosen Saudi Casual grossing chart with a documented source and measurement period, alongside player retention, purchase conversion, refunds and reliability. Do not interpret a single chart position or a small playtest as proof of a durable top-10 game.
