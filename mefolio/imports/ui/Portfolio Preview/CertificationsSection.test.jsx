import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import { render, cleanup, within } from "@testing-library/react";
import { CertificationsSection } from "./CertificationsSection.jsx";

// Scoping to within(container), not global screen, to avoid matching
// unrelated Mocha reporter HTML from other tests (see ProjectChallenge.test.jsx).
if (Meteor.isClient) {
  describe("CertificationsSection", function () {
    afterEach(function () {
      cleanup();
    });

    it("renders nothing when there are no certifications", function () {
      const { container } = render(
        <CertificationsSection certifications={[]} />,
      );
      expect(container.textContent).to.equal("");
    });

    it("renders nothing when certifications is not provided", function () {
      const { container } = render(<CertificationsSection />);
      expect(container.textContent).to.equal("");
    });

    it("shows the title and issuer for each certification", function () {
      const { container } = render(
        <CertificationsSection
          certifications={[
            { title: "AWS Certified Developer", issuer: "Amazon Web Services" },
            { title: "Scrum Master", issuer: "Scrum.org" },
          ]}
        />,
      );
      const scope = within(container);

      expect(scope.getByText("AWS Certified Developer")).to.exist;
      expect(scope.getByText("Amazon Web Services")).to.exist;
      expect(scope.getByText("Scrum Master")).to.exist;
      expect(scope.getByText("Scrum.org")).to.exist;
    });

    it("shows a 'Verified' marker only for verified certifications", function () {
      const { container } = render(
        <CertificationsSection
          certifications={[
            { title: "Verified Cert", verified: true },
            { title: "Manual Cert", verified: false },
          ]}
        />,
      );
      const scope = within(container);

      // Exactly one "Verified" marker should appear, not two.
      expect(scope.getAllByText("Verified")).to.have.lengthOf(1);
    });

    it("formats a valid issueDate as month/year", function () {
      const { container } = render(
        <CertificationsSection
          certifications={[
            { title: "Dated Cert", issueDate: "2025-03-02T00:00:00.000Z" },
          ]}
        />,
      );
      const scope = within(container);

      expect(scope.getByText(/Mar 2025/)).to.exist;
    });

    it("shows no date when issueDate is an empty string", function () {
      const { container } = render(
        <CertificationsSection
          certifications={[{ title: "No Date Cert", issueDate: "" }]}
        />,
      );
      const scope = within(container);

      // Verify the title renders
      expect(scope.getByText("No Date Cert")).to.exist;

      // Verify no "Issued:" text or date string appears
      expect(scope.queryByText(/Issued:/i)).to.equal(null);
      expect(container.textContent).to.not.include("Invalid Date");
    });

    it("links to the verification URL when provided", function () {
      const { container } = render(
        <CertificationsSection
          certifications={[
            {
              title: "Linked Cert",
              verificationUrl: "https://verify.example.com/abc",
            },
          ]}
        />,
      );
      const scope = within(container);

      const link = scope.getByRole("link", { name: /view credential/i });
      expect(link.getAttribute("href")).to.equal(
        "https://verify.example.com/abc",
      );
      expect(link.getAttribute("target")).to.equal("_blank");
      expect(link.getAttribute("rel")).to.contain("noreferrer");
    });

    it("does not render a credential link when verificationUrl is missing", function () {
      const { container } = render(
        <CertificationsSection certifications={[{ title: "No Link Cert" }]} />,
      );
      const scope = within(container);

      expect(scope.queryByRole("link")).to.equal(null);
    });

    it("falls back to a placeholder title when title is missing", function () {
      const { container } = render(
        <CertificationsSection certifications={[{ issuer: "Some Issuer" }]} />,
      );
      const scope = within(container);

      expect(scope.getByText("Untitled certification")).to.exist;
    });

    it("renders every certification in the list", function () {
      const certifications = [
        { title: "Cert One" },
        { title: "Cert Two" },
        { title: "Cert Three" },
      ];
      const { container } = render(
        <CertificationsSection certifications={certifications} />,
      );
      const scope = within(container);

      certifications.forEach((cert) => {
        expect(scope.getByText(cert.title)).to.exist;
      });
    });
  });
}
