// Automated tests for the Nabad dashboard page.
// These tests run automatically on every pull request.

import { render, screen } from "@testing-library/react";
import DashboardPage from "../pages/dashboard";
import { getMyProfile, updateMyProfile } from "../lib/profileApi";

describe("Dashboard Page", () => {
  // Start every test with empty storage, so the demo user is seeded fresh.
  beforeEach(() => {
    localStorage.clear();
  });

  test("welcomes the demo user by name", async () => {
    render(<DashboardPage />);

    expect(
      await screen.findByText("Welcome, Demo User")
    ).toBeInTheDocument();
  });

  test("welcomes the user by their saved name", async () => {
    const profile = await getMyProfile();
    await updateMyProfile({ ...profile, fullName: "Layla Haddad" });

    render(<DashboardPage />);

    expect(
      await screen.findByText("Welcome, Layla Haddad")
    ).toBeInTheDocument();
  });

  test("loading ends once the profile is shown", async () => {
    render(<DashboardPage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await screen.findByText("Welcome, Demo User");
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  test.each([
    ["no self profile", JSON.stringify({ profiles: [] })],
    ["unexpected shape", JSON.stringify([{ id: "self", isSelf: true }])],
    ["corrupt JSON", "{oops"],
  ])("loading ends with an error message when data has %s", async (_, storedValue) => {
    localStorage.setItem("nabad-profiles", storedValue);

    render(<DashboardPage />);

    expect(
      await screen.findByText("Could not load your profile. Please refresh the page.")
    ).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  test("My Profile link points to /profile", async () => {
    render(<DashboardPage />);
    await screen.findByText("Welcome, Demo User");

    expect(
      screen.getByRole("link", { name: "My Profile" })
    ).toHaveAttribute("href", "/profile");
  });
});
