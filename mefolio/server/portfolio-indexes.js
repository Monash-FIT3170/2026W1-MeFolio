import { Meteor } from "meteor/meteor";
import { PortfolioCollection } from "/imports/api/portfolio";

// Portfolio indexes kept in their own module (rather than main.js) so tests can
// import them without pulling in the app seed and OAuth config, which need
// Meteor.settings to be present. Mirrors the pattern used for
// portfolio-methods.js and portfolio-publications.js.

export const PORTFOLIO_USERNAME_INDEX = "portfolios_username_unique";

// Only portfolios that have actually claimed a custom URL take part in the
// uniqueness constraint.
//
// A plain unique index is not usable here: most portfolios never set a
// username, and Mongo indexes a missing field as `null`, so the second
// portfolio without a username would collide with the first and be rejected.
//
// `$type: "string"` keeps out missing and null usernames, and `$gt: ""` keeps
// out the empty string, which legacy rows may still carry. Unclaimed
// portfolios are therefore left out of the index entirely and never collide.
export const CLAIMED_USERNAME_FILTER = {
  username: { $type: "string", $gt: "" },
};

/**
 * Reports the claimed usernames that are held by more than one portfolio.
 *
 * Used to turn a duplicate-key failure into an actionable log line, since the
 * error Mongo raises only names one offending value.
 *
 * @returns {Promise<Array<{ username: string, count: number }>>}
 */
export const findDuplicateUsernames = async () => {
  const duplicates = await PortfolioCollection.rawCollection()
    .aggregate([
      { $match: CLAIMED_USERNAME_FILTER },
      { $group: { _id: "$username", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $sort: { _id: 1 } },
    ])
    .toArray();

  return duplicates.map(({ _id, count }) => ({ username: _id, count }));
};

/**
 * Creates the unique index that makes a claimed portfolio username unique
 * across the collection.
 *
 * `portfolios.setUsername` already checks for a taken username before writing,
 * but that check and the write are two separate round trips: two requests can
 * both pass the check and then both write the same username. This index is
 * what actually rules that out, and it is why `portfolios.setUsername` treats
 * a duplicate-key error (11000) as "username taken".
 *
 * createIndex is idempotent, so this is safe to run on every boot.
 */
export const ensurePortfolioUsernameIndex = async () =>
  await PortfolioCollection.rawCollection().createIndex(
    { username: 1 },
    {
      name: PORTFOLIO_USERNAME_INDEX,
      unique: true,
      partialFilterExpression: CLAIMED_USERNAME_FILTER,
    },
  );

if (Meteor.isServer) {
  Meteor.startup(async () => {
    try {
      await ensurePortfolioUsernameIndex();
    } catch (error) {
      // A database that already contains duplicate usernames cannot take the
      // index. Crashing the server over it would take the whole app down, so
      // log what needs fixing and carry on: `portfolios.setUsername` still
      // rejects duplicates it can see, it just loses the race-condition
      // guarantee until the index exists.
      if (error?.code !== 11000 && error?.codeName !== "DuplicateKey") {
        throw error;
      }

      const duplicates = await findDuplicateUsernames();
      const summary = duplicates
        .map(({ username, count }) => `"${username}" (${count})`)
        .join(", ");

      console.error(
        `[portfolios] Could not create the unique index "${PORTFOLIO_USERNAME_INDEX}" ` +
          `because these usernames are held by more than one portfolio: ${summary}. ` +
          `Resolve the duplicates and restart to enforce unique portfolio URLs.`,
      );
    }
  });
}
