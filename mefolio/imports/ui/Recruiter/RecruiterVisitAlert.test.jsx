/**
 * UI tests for RecruiterVisitAlert.jsx (FEAT-17, AC2).
 *
 * The alert should only surface visits that arrive *after* the dashboard is
 * open — historical visits belong to the visit-history log, not a live alert.
 */
import { render, screen, cleanup } from "@testing-library/react";
import { expect } from "chai";
import { describe, it, afterEach } from "mocha";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";
import RecruiterVisitAlert from "./RecruiterVisitAlert.jsx";
import { RecruiterVisits } from "../../api/recruiterVisits";

if (Meteor.isClient) {
  describe("RecruiterVisitAlert Component", () => {
    // Feed a fixed set of visits to the component: logged in, subscription
    // ready, and RecruiterVisits.find().fetch() returns exactly `visits`.
    const stubVisits = (visits) => {
      sinon.stub(Meteor, "userId").returns("owner-1");
      sinon
        .stub(Meteor, "subscribe")
        .returns({ ready: () => true, stop: () => {} });
      sinon.stub(RecruiterVisits, "find").returns({ fetch: () => visits });
    };

    afterEach(() => {
      sinon.restore();
      cleanup();
    });

    it("does not alert for visits recorded before the dashboard opened", () => {
      const anHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      stubVisits([
        { _id: "old-1", recruiterCompany: "Acme", createdAt: anHourAgo },
      ]);

      render(<RecruiterVisitAlert />);

      expect(screen.queryByText(/just viewed your portfolio/i)).to.equal(null);
    });

    it("alerts for a visit newer than mount, naming the company", async () => {
      // A visit timestamped after the component mounted stands in for one that
      // arrives live while the owner has the dashboard open.
      const afterMount = new Date(Date.now() + 60 * 60 * 1000);
      stubVisits([
        { _id: "new-1", recruiterCompany: "Globex", createdAt: afterMount },
      ]);

      render(<RecruiterVisitAlert />);

      const toast = await screen.findByText(
        /Globex just viewed your portfolio/i,
      );
      expect(toast).to.exist;
    });

    it("renders nothing when there are no visits", () => {
      stubVisits([]);

      const { container } = render(<RecruiterVisitAlert />);

      expect(container.textContent).to.equal("");
    });
  });
}
