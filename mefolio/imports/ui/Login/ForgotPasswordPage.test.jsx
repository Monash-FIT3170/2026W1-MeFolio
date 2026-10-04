/**
 * UI Tests for ForgotPasswordPage.jsx (BUG-01)
 *
 * Verifies the page requests a real reset email via Accounts.forgotPassword and
 * shows a generic confirmation, rather than the old simulated flow.
 * Accounts.forgotPassword is monkey-patched per test, matching the mocking
 * style used in LoginPage.test.jsx / RecruiterLoginPage.test.jsx.
 */

import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { expect } from "chai";
import { describe, it, beforeEach, afterEach } from "mocha";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { ForgotPasswordPage } from "./ForgotPasswordPage.jsx";

if (Meteor.isClient) {
  describe("ForgotPasswordPage", () => {
    let originalForgotPassword;

    beforeEach(() => {
      originalForgotPassword = Accounts.forgotPassword;
    });

    afterEach(() => {
      Accounts.forgotPassword = originalForgotPassword;
      cleanup();
    });

    it("renders the reset-request form", () => {
      render(<ForgotPasswordPage onBackToLogin={() => {}} />);

      expect(screen.getByText("Forgot your password?")).to.exist;
      expect(screen.getByLabelText("Email Address")).to.exist;
      expect(screen.getByRole("button", { name: /send reset link/i })).to.exist;
    });

    it("calls Accounts.forgotPassword and shows a generic confirmation", () => {
      let calledWith = null;
      Accounts.forgotPassword = (options, cb) => {
        calledWith = options;
        cb();
      };

      render(<ForgotPasswordPage onBackToLogin={() => {}} />);

      fireEvent.change(screen.getByLabelText("Email Address"), {
        target: { value: "user@example.com" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: /send reset link/i }),
      );

      expect(calledWith).to.deep.equal({ email: "user@example.com" });
      expect(screen.getByText("Check your inbox")).to.exist;
    });

    it("does not reveal unknown emails (403 still confirms)", () => {
      Accounts.forgotPassword = (options, cb) =>
        cb({ error: 403, reason: "User not found" });

      render(<ForgotPasswordPage onBackToLogin={() => {}} />);

      fireEvent.change(screen.getByLabelText("Email Address"), {
        target: { value: "nobody@example.com" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: /send reset link/i }),
      );

      expect(screen.getByText("Check your inbox")).to.exist;
    });

    it("surfaces a real send failure", () => {
      Accounts.forgotPassword = (options, cb) =>
        cb({ error: 500, reason: "Failed to send email" });

      render(<ForgotPasswordPage onBackToLogin={() => {}} />);

      fireEvent.change(screen.getByLabelText("Email Address"), {
        target: { value: "user@example.com" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: /send reset link/i }),
      );

      expect(screen.getByText("Failed to send email")).to.exist;
    });

    it("has a back button that can be clicked", () => {
      let clicked = false;
      render(<ForgotPasswordPage onBackToLogin={() => (clicked = true)} />);

      fireEvent.click(screen.getAllByText("Back to Login")[0]);
      expect(clicked).to.be.true;
    });
  });
}
