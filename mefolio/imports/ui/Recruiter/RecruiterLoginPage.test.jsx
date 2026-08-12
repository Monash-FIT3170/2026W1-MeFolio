/**
 * UI Tests for RecruiterLoginPage.jsx (FEAT-14)
 *
 * Renders the recruiter access gate inside a MemoryRouter (it relies on
 * useParams / useNavigate) and verifies validation, error, loading, and the
 * success navigation. Meteor.call is monkey-patched per test, matching the
 * mocking style used in LoginPage.test.jsx.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { expect } from "chai";
import { describe, it, beforeEach, afterEach } from "mocha";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { RecruiterLoginPage } from "./RecruiterLoginPage.jsx";

if (Meteor.isClient) {
  describe("RecruiterLoginPage Component", () => {
    let originalCall;

    beforeEach(() => {
      originalCall = Meteor.call;
    });

    afterEach(() => {
      Meteor.call = originalCall;
    });

    // Renders the gate at /recruiter/:portfolioId with stub destination routes
    // so navigation on success can be asserted.
    const renderGate = () =>
      render(
        <MemoryRouter initialEntries={["/recruiter/testPortfolioId"]}>
          <Routes>
            <Route
              path="/recruiter/:portfolioId"
              element={<RecruiterLoginPage />}
            />
            <Route
              path="/recruiter/:portfolioId/view"
              element={<div>Recruiter View</div>}
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

    it("renders the Recruiter Access heading and access code field", () => {
      Meteor.call = () => {};
      renderGate();
      expect(screen.getByText("Recruiter Access")).to.exist;
      expect(screen.getByLabelText("Access code")).to.exist;
    });

    it("shows the access instructions for the portfolio", () => {
      Meteor.call = () => {};
      renderGate();
      expect(screen.getByText(/access the recruiter view for this/i)).to.exist;
    });

    it("shows a validation error when submitting with no code", () => {
      let called = false;
      Meteor.call = () => {
        called = true;
      };
      const { container } = renderGate();
      fireEvent.submit(container.querySelector("form"));
      expect(screen.getByText("Please enter your access code.")).to.exist;
      expect(called).to.equal(false);
    });

    it("shows an error and stays locked when the code is rejected", () => {
      Meteor.call = (name, args, cb) =>
        cb(new Meteor.Error("invalid-code", "Incorrect access code."));
      renderGate();
      fireEvent.change(screen.getByLabelText("Access code"), {
        target: { value: "wrong" },
      });
      fireEvent.submit(screen.getByLabelText("Access code").closest("form"));
      expect(screen.getByText("Incorrect access code.")).to.exist;
      expect(screen.queryByText("Recruiter View")).to.not.exist;
    });

    it("disables the button and shows Verifying while the request is pending", () => {
      // Never invoke the callback -> request stays pending.
      Meteor.call = () => {};
      renderGate();
      fireEvent.change(screen.getByLabelText("Access code"), {
        target: { value: "secret" },
      });
      fireEvent.submit(screen.getByLabelText("Access code").closest("form"));
      const button = screen.getByRole("button", { name: /verifying/i });
      expect(button).to.exist;
      expect(button.disabled).to.equal(true);
    });

    it("navigates to the recruiter view on success", () => {
      Meteor.call = (name, args, cb) => cb(undefined, true);
      renderGate();
      fireEvent.change(screen.getByLabelText("Access code"), {
        target: { value: "letmein" },
      });
      fireEvent.submit(screen.getByLabelText("Access code").closest("form"));
      expect(screen.getByText("Recruiter View")).to.exist;
    });
  });
}
