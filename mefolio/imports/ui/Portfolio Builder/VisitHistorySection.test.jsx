import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import sinon from "sinon";
import { render, fireEvent, cleanup, within } from "@testing-library/react";
import { VisitHistorySection } from "./VisitHistorySection.jsx";
import { RecruiterVisits } from "/imports/api/recruiterVisits";

if (Meteor.isClient) {
  describe("VisitHistorySection", function () {
    let subscribeStub;
    let findStub;
    let meteorCallStub;

    beforeEach(function () {
      userIdStub = sinon.stub(Meteor, "userId").returns("test-user-id");
      subscribeStub = sinon
        .stub(Meteor, "subscribe")
        .returns({ ready: () => true });
      findStub = sinon.stub(RecruiterVisits, "find");
      meteorCallStub = sinon.stub(Meteor, "call");
    });

    afterEach(function () {
      sinon.restore();
      cleanup();
    });

    const sampleVisits = [
      {
        _id: "visit-1",
        portfolioId: "portfolio-1",
        recruiterCompany: "Acme Corp",
        createdAt: new Date(Date.now() - 2 * 60 * 1000),
        metadata: { referrer: "linkedin.com" },
      },
      {
        _id: "visit-2",
        portfolioId: "portfolio-1",
        recruiterCompany: "Globex",
        createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
        metadata: {},
      },
    ];

    it("shows a loading state before subscription is ready", function () {
      subscribeStub.returns({ ready: () => false });
      findStub.returns({ fetch: () => [] });

      const { container } = render(
        <VisitHistorySection portfolioId="portfolio-1" />,
      );

      expect(within(container).getByText(/Loading visit history/i)).to.exist;
    });

    it("does not get stuck loading when no portfolio is selected", function () {
      findStub.returns({ fetch: () => [] });

      const { container } = render(<VisitHistorySection portfolioId="" />);

      expect(
        within(container).getByText(
          /Select a portfolio to view its visit history/i,
        ),
      ).to.exist;
      expect(within(container).queryByText(/Loading visit history/i)).to.equal(
        null,
      );
    });

    it("renders visits reactively with company name and relative time", function () {
      findStub.returns({ fetch: () => sampleVisits });

      const { container } = render(
        <VisitHistorySection portfolioId="portfolio-1" />,
      );

      expect(within(container).getByText("Acme Corp")).to.exist;
      expect(within(container).getByText("Globex")).to.exist;
      expect(within(container).getByText(/2 recorded visits, newest first/i)).to
        .exist;
      expect(within(container).getByText(/Referred from linkedin.com/i)).to
        .exist;
    });

    it("shows an empty state when there are no visits", function () {
      findStub.returns({ fetch: () => [] });

      const { container } = render(
        <VisitHistorySection portfolioId="portfolio-1" />,
      );

      expect(within(container).getByText(/No recruiter visits recorded yet/i))
        .to.exist;
    });

    it("clears visits after confirming Clear history", function () {
      const confirmStub = sinon.stub(window, "confirm").returns(true);
      findStub.returns({ fetch: () => sampleVisits });

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

      fireEvent.click(
        within(container).getByRole("button", { name: /clear history/i }),
      );

      expect(confirmStub.calledOnce).to.equal(true);
      expect(
        meteorCallStub.calledWith("recruiterVisits.clearHistory", {
          portfolioId: "portfolio-1",
        }),
      ).to.equal(true);
    });

    it("does not clear visits if the confirm dialog is dismissed", function () {
      sinon.stub(window, "confirm").returns(false);
      findStub.returns({ fetch: () => sampleVisits });

      const { container } = render(
        <VisitHistorySection portfolioId="portfolio-1" />,
      );

      fireEvent.click(
        within(container).getByRole("button", { name: /clear history/i }),
      );

      expect(
        meteorCallStub
          .getCalls()
          .some((call) => call.args[0] === "recruiterVisits.clearHistory"),
      ).to.equal(false);
    });

    it("renders distinct log rows for multiple repeat visits from the same link/company", function () {
      const repeatVisits = [
        {
          _id: "visit-1",
          portfolioId: "portfolio-1",
          recruiterCompany: "Google",
          createdAt: new Date(Date.now() - 1 * 60 * 1000), // 1 min ago
          metadata: { referrer: "linkedin.com" },
        },
        {
          _id: "visit-2",
          portfolioId: "portfolio-1",
          recruiterCompany: "Google",
          createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
          metadata: { referrer: "email" },
        },
        {
          _id: "visit-3",
          portfolioId: "portfolio-1",
          recruiterCompany: "Google",
          createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          metadata: {},
        },
      ];

      findStub.returns({ fetch: () => repeatVisits });

      const { container } = render(
        <VisitHistorySection portfolioId="portfolio-1" />,
      );

      // Checks that total visits header reflects all repeat entries
      expect(within(container).getByText(/3 recorded visits, newest first/i)).to
        .exist;

      // Checks that all 3 instances of Google are rendered
      const companyHeadings = within(container).getAllByText("Google");
      expect(companyHeadings).to.have.lengthOf(3);

      // Checks distinct relative time indicators
      expect(within(container).getByText(/1 min ago/i)).to.exist;
      expect(within(container).getByText(/15 min ago/i)).to.exist;
      expect(within(container).getByText(/1 hour ago/i)).to.exist;
    });
  });
}
