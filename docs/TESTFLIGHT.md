# Getting a build onto your iPhone (TestFlight) from Windows

You do not need a Mac. A cloud Mac (GitHub Actions, workflow `.github/workflows/testflight.yml`) builds, signs and uploads the app to App Store Connect; you install it on your iPhone with Apple's TestFlight app.

**Status:** the workflow is written but has not been run. Signing and upload have not been verified. Expect to fix small things on the first run and read the log.

## One-time setup (about 15 minutes)

1. **App Store Connect API key.** App Store Connect > Users and Access > Integrations > App Store Connect API > Team Keys > add a key with the **Admin** role (cloud signing needs it). Download the `.p8` file once (Apple lets you download it only one time) and note the **Key ID** and the **Issuer ID** shown at the top of that page. Never send these to anyone, and never commit them.
2. **Team ID.** developer.apple.com > Account > Membership details: the 10-character **Team ID**.
3. **RevenueCat public key (only if you want purchases in this build).** RevenueCat > your project > API keys > the App Store public key, starts with `appl_`. Skip it for a build with no purchases.
4. **GitHub secrets.** In the repository: Settings > Secrets and variables > Actions > New repository secret. Add:
   - `ASC_KEY_ID` (the Key ID)
   - `ASC_ISSUER_ID` (the Issuer ID)
   - `ASC_KEY_P8` (open the `.p8` file in a text editor and paste its whole text, including the BEGIN and END lines)
   - `APPLE_TEAM_ID`
   - `REVENUECAT_IOS_KEY` (optional, the `appl_` key)

## Each build

1. GitHub > Actions > **TestFlight build** > Run workflow. It runs the lint and tests, builds, signs and uploads. It takes roughly 15 to 30 minutes.
2. In App Store Connect > your app > TestFlight, the build appears after Apple finishes processing it (usually 5 to 30 minutes). If it asks about export compliance, answer that the app uses only standard encryption (see `docs/APP_STORE_SUBMISSION.md`, section 12).
3. Add yourself under **Internal Testing** (internal testers need no Apple review), then open the **TestFlight** app on your iPhone and install.

## Testing subscriptions (sandbox)

- Create a sandbox tester: App Store Connect > Users and Access > Sandbox > Testers.
- On the iPhone, sign in to that sandbox account (Settings > Developer > Sandbox Apple Account, shown once a TestFlight build is installed).
- Purchases in TestFlight use the sandbox, so nobody is charged, and renewals run at an accelerated rate.
- The subscription product must have its details completed in App Store Connect, and the Paid Applications agreement must be signed.

## Still missing before a purchase test can work

- **A purchase screen in the app.** Production builds have no screen that sells anything; the only purchase panel is developer-only. Without a screen to tap, a TestFlight build cannot test a subscription.
- **Game benefits tied to verified purchases** (membership must come from RevenueCat, not the editable save), with restore, expiry and refunds handled.
- **Privacy answers.** If the build includes the RevenueCat key, answer the App Privacy questions as in `docs/APP_STORE_SUBMISSION.md`, section 9, Option B.
