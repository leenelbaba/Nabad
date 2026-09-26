// Automated tests for the Nabad landing page.
// These tests run automatically on every pull request.

import { render, screen } from "@testing-library/react";
import HomePage from "../pages/index";

describe("Landing Page", () => {
  test("shows the headline", () => {
    render(<HomePage />);

    expect(
      screen.getByText("Know where to go when it matters.")
    ).toBeInTheDocument();
  });

  test("logo links to the home page", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("link", { name: /Nabad/ })
    ).toHaveAttribute("href", "/");
  });

  test("Log in link points to /login", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("link", { name: "Log in" })
    ).toHaveAttribute("href", "/login");
  });

  test("Sign up and Get started links point to /signup", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("link", { name: "Sign up" })
    ).toHaveAttribute("href", "/signup");

    expect(
      screen.getByRole("link", { name: "Get started" })
    ).toHaveAttribute("href", "/signup");
  });
});
