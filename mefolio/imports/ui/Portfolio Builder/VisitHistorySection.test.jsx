import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import sinon from "sinon";
import {
  render,
  waitFor,
  fireEvent,
  cleanup,
  within,
} from "@testing-library/react";
import { VisitHistorySection } from "./VisitHistorySection.jsx";

if (Meteor.isClient) {
  describe("VisitHistorySection", function () {
    let meteorCallStub;

    beforeEach(function () {
      meteorCallStub = sinon.stub(Meteor, "call");
    });

    afterEach(function () {
      sinon.restore();
      cleanup();
    });

    const sampleVisits = [
      {
        _id: "visit-1",
        recruiterCompany: "Acme Corp",
        token: "abcd1234wxyz",
        createdAt: new Date(Date.now() - 2 * 60 * 1000),
        metadata: { referrer: "linkedin.com" },
      },
      {
        _id: "visit-2",
        recruiterCompany: "Globex",
        token: "efgh5678qrst",
        createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
        metadata: {},
      },
    ];

    it("shows a loading state before data arrives", function () {
      meteorCallStub.callsFake(() => {});

      const { container } = render(
        <VisitHistorySection portfolioId="portfolio-1" />,
      );

      expect(within(container).getByText(/Loading visit history/i)).to.exist;
    });

    it("renders visits sorted newest-first with company name and relative time", async function () {
      meteorCallStub
        .withArgs(
          "recruiterVisits.getStats",
          { portfolioId: "portfolio-1" },
          sinon.match.func,
        )
        .callsFake((name, args, callback) => {
          callback(null, { totalVisits: 2, visits: sampleVisits });
        });

      const { container } = render(
        <VisitHistorySection portfolioId="portfolio-1" />,
      );

      await waitFor(() => {
        expect(within(container).getByText("Acme Corp")).to.exist;
      });

      expect(within(container).getByText("Globex")).to.exist;
      expect(within(container).getByText(/2 recorded visits, newest first/i)).to
        .exist;
      expect(within(container).getByText(/Link ending in \.\.\.wxyz/i)).to
        .exist;
      expect(within(container).getByText(/Link ending in \.\.\.qrst/i)).to
        .exist;
    });

    it("shows an empty state when there are no visits", async function () {
      meteorCallStub.callsFake((name, args, callback) => {
        callback(null, { totalVisits: 0, visits: [] });
      });

      const { container } = render(
        <VisitHistorySection portfolioId="portfolio-1" />,
      );

      await waitFor(() => {
        expect(within(container).getByText(/No recruiter visits recorded yet/i))
          .to.exist;
      });
    });

    it("shows an error message when the method call fails", async function () {
      meteorCallStub.callsFake((name, args, callback) => {
        callback(new Meteor.Error("not-authorized", "Nope."));
      });

      const { container } = render(
        <VisitHistorySection portfolioId="portfolio-1" />,
      );

      await waitFor(() => {
        expect(within(container).getByText("Nope.")).to.exist;
      });
    });

    it("refetches visits when Refresh is clicked", async function () {
      let callCount = 0;
      meteorCallStub.callsFake((name, args, callback) => {
        callCount += 1;
        callback(null, { totalVisits: 2, visits: sampleVisits });
      });

      const { container } = render(
        <VisitHistorySection portfolioId="portfolio-1" />,
      );

      await waitFor(() => {
        expect(within(container).getByText("Acme Corp")).to.exist;
      });

      const initialCallCount = callCount;
      fireEvent.click(
        within(container).getByRole("button", { name: /refresh/i }),
      );

      await waitFor(() => {
        expect(callCount).to.equal(initialCallCount + 1);
      });
    });

    it("clears visits after confirming Clear history", async function () {
      const confirmStub = sinon.stub(window, "confirm").returns(true);

      meteorCallStub
        .withArgs("recruiterVisits.getStats", sinon.match.any, sinon.match.func)
        .callsFake((name, args, callback) => {
          callback(null, { totalVisits: 2, visits: sampleVisits });
        });

      meteorCallStub
        .withArgs(
          "recruiterVisits.clearHistory",
          sinon.match.any,
          sinon.match.func,
        )
        .callsFake((name, args, callback) => {
          callback(null, 2);
        });

      const { container } = render(
        <VisitHistorySection portfolioId="portfolio-1" />,
      );

      await waitFor(() => {
        expect(within(container).getByText("Acme Corp")).to.exist;
      });

      fireEvent.click(
        within(container).getByRole("button", { name: /clear history/i }),
      );

      expect(confirmStub.calledOnce).to.equal(true);

      await waitFor(() => {
        expect(within(container).getByText(/No recruiter visits recorded yet/i))
          .to.exist;
      });
    });

    it("does not clear visits if the confirm dialog is dismissed", async function () {
      sinon.stub(window, "confirm").returns(false);

      meteorCallStub
        .withArgs("recruiterVisits.getStats", sinon.match.any, sinon.match.func)
        .callsFake((name, args, callback) => {
          callback(null, { totalVisits: 2, visits: sampleVisits });
        });

      const { container } = render(
        <VisitHistorySection portfolioId="portfolio-1" />,
      );

      await waitFor(() => {
        expect(within(container).getByText("Acme Corp")).to.exist;
      });

      fireEvent.click(
        within(container).getByRole("button", { name: /clear history/i }),
      );

      expect(within(container).getByText("Acme Corp")).to.exist;
      expect(
        meteorCallStub
          .getCalls()
          .some((call) => call.args[0] === "recruiterVisits.clearHistory"),
      ).to.equal(false);
    });

    it("does not call Meteor.call when portfolioId is falsy", function () {
      render(<VisitHistorySection portfolioId="" />);
      expect(meteorCallStub.called).to.equal(false);
    });
  });
}
