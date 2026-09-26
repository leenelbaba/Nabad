// Automated tests for the Nabad login page.
// These tests will later run automatically on every pull request.

import { render, screen } from "@testing-library/react";
import LoginPage from "../pages/login";

jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("../lib/api", () => ({
  login: jest.fn(),
}));

describe("Login Page", () => {
  test("shows the login heading", () => {
    render(<LoginPage />);

    expect(
      screen.getByText("Log in to Nabad")
    ).toBeInTheDocument();
  });

  test("shows the login button", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("button", { name: "Log in" })
    ).toBeInTheDocument();
  });

  test("shows the forgot password link", () => {
    render(<LoginPage />);

    expect(
      screen.getByText("Forgot password?")
    ).toBeInTheDocument();
  });
});