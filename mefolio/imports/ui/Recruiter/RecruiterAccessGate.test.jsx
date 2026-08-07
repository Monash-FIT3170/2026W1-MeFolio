/**
 * UI Tests for RecruiterAccessGate.jsx (FEAT-14)
 *
 * Renders the recruiter access gate inside a MemoryRouter (it relies on
 * useParams) alongside stub login/portal routes, and verifies that access
 * is correctly granted or redirected based on the token + expiresAt stored
 * in localStorage. Sinon fake timers are used to test live expiry, matching
 * the mocking style used in LoginPage.test.jsx.
 */

import React from "react";
import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import sinon from "sinon";
import { render, screen, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { RecruiterAccessGate } from "./RecruiterAccessGate";

if (Meteor.isClient) {
  const TOKEN_KEY = "recruiterAccessToken";
  const EXPIRES_KEY = "recruiterAccessExpiresAt";

  describe("Recruiter Access Gate", function () {
    let clock;

    beforeEach(function () {
      localStorage.clear();
    });

    afterEach(function () {
      cleanup();
      if (clock) {
        clock.restore();
        clock = null;
      }
    });

    // Renders the same two-route shape as the real App.jsx, so useParams()
    // and <Navigate> behave exactly as they do in production.
    function renderAtView(username = "testuser") {
      return render(
        <MemoryRouter initialEntries={[`/recruiter/${username}/view`]}>
          <Routes>
            <Route
              path="/recruiter/:username"
              element={<div>LOGIN_SCREEN</div>}
            />
            <Route
              path="/recruiter/:username/view"
              element={
                <RecruiterAccessGate>
                  <div>PORTAL_CONTENT</div>
                </RecruiterAccessGate>
              }
            />
          </Routes>
        </MemoryRouter>
      );
    }

    it("redirects to the access-code screen when no token is stored", function () {
      renderAtView();
      expect(screen.getByText("LOGIN_SCREEN")).to.exist;
      expect(screen.queryByText("PORTAL_CONTENT")).to.be.null;
    });

    it("renders the protected route when a valid, unexpired token is stored", function () {
      localStorage.setItem(TOKEN_KEY, "abc123");
      localStorage.setItem(EXPIRES_KEY, String(Date.now() + 60000));

      renderAtView();
      expect(screen.getByText("PORTAL_CONTENT")).to.exist;
      expect(screen.queryByText("LOGIN_SCREEN")).to.be.null;
    });

    it("redirects when the stored token is already expired", function () {
      localStorage.setItem(TOKEN_KEY, "abc123");
      localStorage.setItem(EXPIRES_KEY, String(Date.now() - 1000));

      renderAtView();
      expect(screen.getByText("LOGIN_SCREEN")).to.exist;
    });

    it("redirects when token exists but expiresAt is missing (fails closed)", function () {
      localStorage.setItem(TOKEN_KEY, "abc123");
      // no expiresAt set

      renderAtView();
      expect(screen.getByText("LOGIN_SCREEN")).to.exist;
    });

    it("auto-redirects away from the portal the moment the token expires, with no manual navigation", function () {
      const now = Date.now();
      // Only fake timers/Date, not everything React's scheduler relies on
      clock = sinon.useFakeTimers({
        now,
        toFake: ["setTimeout", "clearTimeout", "Date"],
      });

      localStorage.setItem(TOKEN_KEY, "abc123");
      localStorage.setItem(EXPIRES_KEY, String(now + 5000));

      renderAtView();
      expect(screen.getByText("PORTAL_CONTENT")).to.exist;

      act(() => {
        clock.tick(5001);
      });

      // If this fails, the "live kick on expiry" assumption was wrong and
      // the gate needs an explicit effect watching isValid.
      expect(screen.getByText("LOGIN_SCREEN")).to.exist;
      expect(localStorage.getItem(TOKEN_KEY)).to.be.null;
    });
  });
}