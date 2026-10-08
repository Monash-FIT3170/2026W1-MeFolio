import { render, screen } from "@testing-library/react";
import { ProfileCard } from "./ProfileCard";

describe("ProfileCard", () => {
  it("renders avatar image with eager loading and high priority when avatarUrl exists", () => {
    const mockPortfolio = {
      title: "Senior Full Stack Dev",
      profile: {
        name: "Jane Doe",
        avatarUrl: "https://example.com/avatar.jpg",
        location: "Melbourne, Australia",
      },
    };

    render(<ProfileCard portfolio={mockPortfolio} />);

    const img = screen.getByRole("img", { name: /jane doe/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
    expect(screen.getByText("Senior Full Stack Dev")).toBeInTheDocument();
    expect(screen.getByText("Melbourne, Australia")).toBeInTheDocument();
  });

  it("renders initials fallback when no avatar image is provided", () => {
    const mockPortfolio = {
      title: "Dev Portfolio",
      profile: {
        fullName: "Alex Smith",
        avatarUrl: null,
      },
    };

    render(<ProfileCard portfolio={mockPortfolio} />);

    // No <img> should be rendered
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    // Initials "AS" should be rendered
    expect(screen.getByText("AS")).toBeInTheDocument();
    expect(screen.getByText("Alex Smith")).toBeInTheDocument();
  });

  it("falls back to default texts when portfolio fields are missing", () => {
    const mockPortfolio = {
      profile: {},
    };

    render(<ProfileCard portfolio={mockPortfolio} />);

    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(screen.getByText("No name set")).toBeInTheDocument();
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});