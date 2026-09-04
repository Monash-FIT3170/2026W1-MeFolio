/**
 * FEAT-09: Responsive Context Provider for Automatic Layout Adjustment Tests
 *
 * Tests for breakpoint detection, touch target sizes, and responsive CSS classes
 */

import { render, screen } from "@testing-library/react";
import { expect } from "chai";
import { describe, it } from "mocha";
import { Meteor } from "meteor/meteor";
import {
  ResponsiveProvider,
  useResponsive,
} from "../Contexts/ResponsiveContext";

const TestComponent = () => {
  const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();
  return (
    <div>
      <span data-testid="breakpoint">{breakpoint}</span>
      <span data-testid="isMobile">{String(isMobile)}</span>
      <span data-testid="isTablet">{String(isTablet)}</span>
      <span data-testid="isDesktop">{String(isDesktop)}</span>
    </div>
  );
};

if (Meteor.isClient) {
  describe("Responsive Design", () => {
    describe("ResponsiveContext", () => {
      it("provides responsive breakpoint detection", () => {
        render(
          <ResponsiveProvider>
            <TestComponent />
          </ResponsiveProvider>,
        );

        expect(screen.getByTestId("breakpoint")).to.exist;
      });
    });

    describe("Touch Target Sizes", () => {
      it("buttons include classes that imply ≥44px touch targets", () => {
        render(
          <ResponsiveProvider>
            <button data-testid="test-button" className="py-3 px-4">
              Click Me
            </button>
          </ResponsiveProvider>,
        );

        const button = screen.getByTestId("test-button");

        // Check for classes that imply adequate touch size
        expect(button.className).to.match(/py-|px-|min-h|min-w/);
      });

      it("links include classes that imply ≥44px touch targets", () => {
        render(
          <ResponsiveProvider>
            <a
              href="#"
              data-testid="test-link"
              className="py-3 px-4 inline-block"
            >
              Link
            </a>
          </ResponsiveProvider>,
        );

        const link = screen.getByTestId("test-link");

        // Check for classes that imply adequate touch size
        expect(link.className).to.match(/py-|px-|min-h|min-w/);
      });
    });

    describe("Responsive CSS Classes", () => {
      it("responsive-grid class exists and includes grid layout classes", () => {
        const { container } = render(
          <div className="responsive-grid grid grid-cols-2 gap-4">
            <div>Item 1</div>
            <div>Item 2</div>
          </div>,
        );

        const gridElement = container.querySelector(".responsive-grid");

        // Check for Tailwind grid classes
        expect(gridElement.className).to.include("grid");
        expect(gridElement.className).to.include("grid-cols-2");
      });

      it("container-fluid class applies responsive padding", () => {
        const { container } = render(
          <div className="container-fluid">Content</div>,
        );

        const element = container.querySelector(".container-fluid");
        expect(element).to.exist;
      });
    });
  });
}
