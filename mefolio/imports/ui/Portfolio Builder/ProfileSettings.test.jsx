/**
 * Client tests for the Custom URL field in ProfileSettings.jsx (FEAT-13)
 *
 * Covers client-side format validation only — uniqueness is a server concern
 * and is tested separately in server tests.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import { Meteor } from "meteor/meteor";
import ProfileSettings from "./ProfileSettings.jsx";

if (Meteor.isClient) {
  describe("ProfileSettings - Custom URL field", () => {
    const defaultProps = {
      profile: { name: "Sample name", email: "sample@example.com" },
      aboutMe: {
        title: "My Portfolio",
        bio: "Hello world",
        username: "",
        profile: { location: "Melbourne" },
      },
      portfolioId: "test-portfolio-id",
    };

    const renderComponent = (props = {}) =>
      render(<ProfileSettings {...defaultProps} {...props} />);

    beforeEach(() => {
      // Prevent real Meteor calls during tests
      Meteor.call = () => {};
    });

    it("renders the Custom URL field", () => {
      renderComponent();
      expect(screen.getByTestId("field-slug")).to.exist;
    });

    it("shows the /u/ prefix", () => {
      renderComponent();
      expect(screen.getByText("/u/")).to.exist;
    });

    it("accepts a valid slug", () => {
      renderComponent();
      const input = screen.getByTestId("field-slug");
      fireEvent.change(input, { target: { name: "slug", value: "jane-doe" } });
      expect(screen.queryByTestId("slug-error")).to.not.exist;
    });

    it("rejects uppercase letters", () => {
      renderComponent();
      const input = screen.getByTestId("field-slug");
      fireEvent.change(input, { target: { name: "slug", value: "JaneDoe" } });
      expect(screen.getByTestId("slug-error")).to.exist;
      expect(screen.getByTestId("slug-error").textContent).to.include(
        "lowercase letters, numbers, and hyphens",
      );
    });

    it("rejects special characters", () => {
      renderComponent();
      const input = screen.getByTestId("field-slug");
      fireEvent.change(input, {
        target: { name: "slug", value: "jane_doe!" },
      });
      expect(screen.getByTestId("slug-error")).to.exist;
    });

    it("rejects a slug that starts with a hyphen", () => {
      renderComponent();
      const input = screen.getByTestId("field-slug");
      fireEvent.change(input, { target: { name: "slug", value: "-jane" } });
      expect(screen.getByTestId("slug-error")).to.exist;
      expect(screen.getByTestId("slug-error").textContent).to.include(
        "cannot start or end with a hyphen",
      );
    });

    it("rejects a slug that ends with a hyphen", () => {
      renderComponent();
      const input = screen.getByTestId("field-slug");
      fireEvent.change(input, { target: { name: "slug", value: "jane-" } });
      expect(screen.getByTestId("slug-error")).to.exist;
    });

    it("rejects a slug shorter than 3 characters", () => {
      renderComponent();
      const input = screen.getByTestId("field-slug");
      fireEvent.change(input, { target: { name: "slug", value: "ab" } });
      expect(screen.getByTestId("slug-error")).to.exist;
      expect(screen.getByTestId("slug-error").textContent).to.include(
        "at least 3 characters",
      );
    });

    it("rejects a slug longer than 40 characters", () => {
      renderComponent();
      const input = screen.getByTestId("field-slug");
      fireEvent.change(input, {
        target: { name: "slug", value: "a".repeat(41) },
      });
      expect(screen.getByTestId("slug-error")).to.exist;
      expect(screen.getByTestId("slug-error").textContent).to.include(
        "40 characters or fewer",
      );
    });

    it("shows the preview URL when the slug is valid", () => {
      renderComponent();
      const input = screen.getByTestId("field-slug");
      fireEvent.change(input, {
        target: { name: "slug", value: "sample-name" },
      });
      expect(screen.getByText("/u/sample-name")).to.exist;
    });

    it("blocks save when slug is invalid", () => {
      let callCount = 0;
      Meteor.call = () => {
        callCount++;
      };

      renderComponent();
      const input = screen.getByTestId("field-slug");
      fireEvent.change(input, { target: { name: "slug", value: "BAD SLUG!" } });
      fireEvent.click(screen.getByTestId("btn-save"));

      expect(callCount).to.equal(0);
    });

    it("populates the slug field from the existing username", () => {
      renderComponent({
        aboutMe: { ...defaultProps.aboutMe, username: "existing-slug" },
      });
      expect(screen.getByTestId("field-slug").value).to.equal("existing-slug");
    });
  });
}
