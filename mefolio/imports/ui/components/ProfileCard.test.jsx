import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import { render, cleanup, within } from "@testing-library/react";
import { ProfileCard } from "./ProfileCard.jsx";

if (Meteor.isClient) {
  describe("ProfileCard", function () {
    afterEach(function () {
      cleanup();
    });

    it("renders avatar image with eager loading and high priority when avatarUrl exists", function () {
      const mockPortfolio = {
        title: "Senior Full Stack Dev",
        profile: {
          name: "Jane Doe",
          avatarUrl: "https://example.com/avatar.jpg",
          location: "Melbourne, Australia",
        },
      };

      const { container } = render(<ProfileCard portfolio={mockPortfolio} />);
      const scope = within(container);

      const img = scope.getByRole("img", { name: /jane doe/i });
      expect(img).to.exist;
      expect(img.getAttribute("loading")).to.equal("eager");
      expect(img.getAttribute("fetchpriority")).to.equal("high");
      expect(scope.getByText("Senior Full Stack Dev")).to.exist;
      expect(scope.getByText("Melbourne, Australia")).to.exist;
    });

    it("renders initials fallback when no avatar image is provided", function () {
      const mockPortfolio = {
        title: "Dev Portfolio",
        profile: {
          fullName: "Alex Smith",
          avatarUrl: null,
        },
      };

      const { container } = render(<ProfileCard portfolio={mockPortfolio} />);
      const scope = within(container);

      expect(scope.queryByRole("img")).to.be.null;
      expect(scope.getByText("AS")).to.exist;
      expect(scope.getByText("Alex Smith")).to.exist;
    });

    it("falls back to default texts when portfolio fields are missing", function () {
      const mockPortfolio = {
        profile: {},
      };

      const { container } = render(<ProfileCard portfolio={mockPortfolio} />);
      const scope = within(container);

      expect(scope.getByText("Portfolio")).to.exist;
      expect(scope.getByText("No name set")).to.exist;
      expect(scope.getByText("NN")).to.exist;
    });
  });
}