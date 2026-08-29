import { expect } from "chai";
import { selectFreshVisits } from "/imports/ui/Recruiter/recruiterVisitAlertLogic";

// The alert should only surface visits that arrive after the dashboard opened
// (the baseline) and that have not already been shown.
describe("selectFreshVisits (recruiter-visit alert logic)", () => {
  const baseline = new Date("2026-01-01T00:00:00Z");
  const before = new Date("2025-12-31T00:00:00Z");
  const after = new Date("2026-01-02T00:00:00Z");

  it("excludes visits recorded before the baseline", () => {
    const fresh = selectFreshVisits(
      [{ _id: "old", recruiterCompany: "Acme", createdAt: before }],
      baseline,
      new Set(),
    );
    expect(fresh).to.have.lengthOf(0);
  });

  it("includes visits recorded after the baseline", () => {
    const fresh = selectFreshVisits(
      [{ _id: "new", recruiterCompany: "Globex", createdAt: after }],
      baseline,
      new Set(),
    );
    expect(fresh.map((v) => v._id)).to.deep.equal(["new"]);
  });

  it("excludes visits that have already been shown", () => {
    const fresh = selectFreshVisits(
      [{ _id: "seen", createdAt: after }],
      baseline,
      new Set(["seen"]),
    );
    expect(fresh).to.have.lengthOf(0);
  });

  it("ignores visits without a createdAt", () => {
    const fresh = selectFreshVisits([{ _id: "x" }], baseline, new Set());
    expect(fresh).to.have.lengthOf(0);
  });
});
