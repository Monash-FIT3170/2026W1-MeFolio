// Pure logic for RecruiterVisitAlert, kept free of the client collection and
// React so it can be unit-tested without a browser test bundle.
export const selectFreshVisits = (visits, since, seenIds) =>
  visits.filter(
    (visit) =>
      visit.createdAt &&
      new Date(visit.createdAt) > since &&
      !seenIds.has(visit._id),
  );
