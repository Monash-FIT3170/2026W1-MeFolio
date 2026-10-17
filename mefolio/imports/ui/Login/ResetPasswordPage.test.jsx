/**
 * UI Tests for ResetPasswordPage.jsx (BUG-01)
 *
 * Rendered inside a MemoryRouter (it relies on useParams / useNavigate) at
 * /reset-password/:token. Accounts.resetPassword is monkey-patched per test.
 */

import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { expect } from "chai";
import { describe, it, beforeEach, afterEach } from "mocha";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { ResetPasswordPage } from "./ResetPasswordPage.jsx";

if (Meteor.isClient) {
  describe("ResetPasswordPage", () => {
    let originalResetPassword;

    beforeEach(() => {
      originalResetPassword = Accounts.resetPassword;
    });

    afterEach(() => {
      Accounts.resetPassword = originalResetPassword;
      cleanup();
    });

    const renderAt = (token = "tok-123") =>
      render(
        <MemoryRouter initialEntries={[`/reset-password/${token}`]}>
          <Routes>
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
            <Route path="/login" element={<div>Login</div>} />
            <Route path="/forgot" element={<div>Forgot</div>} />
          </Routes>
        </MemoryRouter>,
      );

    const fillPasswords = (pwd, confirm = pwd) => {
      fireEvent.change(screen.getByLabelText("New Password"), {
        target: { value: pwd },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: confirm },
      });
    };

    it("renders the create-new-password form", () => {
      renderAt();
      expect(screen.getByText("Create New Password")).to.exist;
      expect(screen.getByLabelText("New Password")).to.exist;
      expect(screen.getByLabelText("Confirm Password")).to.exist;
    });

    it("calls Accounts.resetPassword with the URL token and new password", () => {
      let args = null;
      Accounts.resetPassword = (token, password, cb) => {
        args = { token, password };
        cb();
      };

      renderAt("tok-abc");
      fillPasswords("Password1");
      fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

      expect(args).to.deep.equal({ token: "tok-abc", password: "Password1" });
      expect(screen.getByText("Password updated")).to.exist;
    });

    it("shows an error for an invalid or expired token", () => {
      Accounts.resetPassword = (token, password, cb) =>
        cb({ reason: "Token expired" });

      renderAt();
      fillPasswords("Password1");
      fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

      expect(screen.getByText("Token expired")).to.exist;
    });

    it("rejects mismatched passwords before calling resetPassword", () => {
      let called = false;
      Accounts.resetPassword = () => {
        called = true;
      };

      renderAt();
      fillPasswords("Password1", "Password2");
      fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

      expect(called).to.be.false;
      expect(screen.getByText("Passwords do not match")).to.exist;
    });

    it("rejects a weak password before calling resetPassword", () => {
      let called = false;
      Accounts.resetPassword = () => {
        called = true;
      };

      renderAt();
      fillPasswords("weak");
      fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

      expect(called).to.be.false;
    });
  });
}
