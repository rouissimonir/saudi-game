/**
 * Version 1.0 ships without the gem-cost Lucky Dallah wheel.
 * Apple treats a prize wheel that costs in-game currency as simulated gambling, and
 * apps with that rating cannot be reviewed from an individual developer account.
 * The wheel rules stay in the code and tests; this flag only hides every way to reach it.
 */
export const LUCKY_WHEEL_ENABLED = false;
