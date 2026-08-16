/**
 * UI Tests for SignUpPage.jsx
 *
 * Ensures that the SignUpPage component renders correctly and handles user interactions as expected.
 */
import { Meteor } from "meteor/meteor";
import { render, screen, fireEvent } from "@testing-library/react";
import { expect } from "chai";
import { SignUpPage } from "./SignUpPage.jsx";

if (Meteor.isClient) {
  describe("SignUpPage Component", () => {
    it("Renders T&C and Privacy Policy links", () => {
      render(
        <SignUpPage
          onSignUp={() => {}}
          onSwitchToSignIn={() => {}}
          onShowTerms={() => {}}
          onShowPrivacy={() => {}}
        />,
      );

      expect(screen.getByText("Terms")).to.exist;
      expect(screen.getByText("Privacy Policy")).to.exist;
    });

    it("Displays an error message when passwords do not match", async () => {
      render(
        <SignUpPage
          onSignUp={() => {}}
          onSwitchToSignIn={() => {}}
          onShowTerms={() => {}}
          onShowPrivacy={() => {}}
        />,
      );

      // Fill all required fields with mismatched passwords
      fireEvent.change(screen.getByPlaceholderText("John Doe"), {
        target: { value: "John Doe" },
      });

      fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
        target: { value: "john@example.com" },
      });

      fireEvent.change(screen.getByPlaceholderText("yourname"), {
        target: { value: "john" },
      });

      fireEvent.change(
        screen.getByPlaceholderText("Create a strong password"),
        {
          target: { value: "password123" },
        },
      );

      fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
        target: { value: "password456" },
      });

      fireEvent.click(screen.getByRole("checkbox"));

      // Submit form
      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      // Expect error
      const errorDiv = await screen.findByText("Passwords do not match!");
      expect(errorDiv).to.exist;
    });
  });
}
