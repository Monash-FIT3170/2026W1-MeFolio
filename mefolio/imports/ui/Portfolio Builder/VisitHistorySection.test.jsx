import { expect } from "chai";
import { formatRelativeTime } from "./visitHistoryFormat.js";

// These tests cover the only non-trivial logic in VisitHistorySection: the
// relative-time formatter. They deliberately avoid rendering the component,
// which imports the client RecruiterVisits collection — pulling a
// Mongo.Collection into the client test bundle previously broke the suite
// (CLIENT FAILURES). The reactive/render flows are exercised manually and by
// the server-side method tests in recruiter-tokens/methods.test.js.
describe("VisitHistorySection formatRelativeTime", function () {
  const minutesAgo = (n) => new Date(Date.now() - n * 60 * 1000);
  const hoursAgo = (n) => new Date(Date.now() - n * 60 * 60 * 1000);
  const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  it("returns an empty string for a missing date", function () {
    expect(formatRelativeTime(null)).to.equal("");
    expect(formatRelativeTime(undefined)).to.equal("");
  });

  it("shows 'just now' for under a minute", function () {
    expect(formatRelativeTime(new Date())).to.equal("just now");
    expect(formatRelativeTime(minutesAgo(0.5))).to.equal("just now");
  });

  it("shows minutes for under an hour", function () {
    expect(formatRelativeTime(minutesAgo(2))).to.equal("2 min ago");
    expect(formatRelativeTime(minutesAgo(59))).to.equal("59 min ago");
  });

  it("shows hours (singular and plural) for under a day", function () {
    expect(formatRelativeTime(hoursAgo(1))).to.equal("1 hour ago");
    expect(formatRelativeTime(hoursAgo(5))).to.equal("5 hours ago");
  });

  it("shows days (singular and plural) for under a week", function () {
    expect(formatRelativeTime(daysAgo(1))).to.equal("1 day ago");
    expect(formatRelativeTime(daysAgo(6))).to.equal("6 days ago");
  });

  it("falls back to an absolute date for a week or more", function () {
    const result = formatRelativeTime(daysAgo(10));
    expect(result).to.not.match(/ago|just now/);
    // en-AU short format, e.g. "19 Aug 2026"
    expect(result).to.match(/\d{1,2} [A-Za-z]{3} \d{4}/);
  });

  it("accepts an ISO string as well as a Date", function () {
    expect(formatRelativeTime(minutesAgo(3).toISOString())).to.equal(
      "3 min ago",
    );
  });
});
