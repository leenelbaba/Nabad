// Automated tests for the Nabad dashboard page.
// These tests run automatically on every pull request.

import { render, screen } from "@testing-library/react";
import DashboardPage from "../pages/dashboard";
import { ActiveProfileProvider } from "../context/ActiveProfileContext";
import { getMyProfile, updateMyProfile, addLinkedProfile } from "../lib/profileApi";

// The dashboard reads the active profile from the provider, just like in _app.js.
function renderDashboard() {
  render(
    <ActiveProfileProvider>
      <DashboardPage />
    </ActiveProfileProvider>
  );
}

describe("Dashboard Page", () => {
  // Start every test with empty storage, so the demo user is seeded fresh.
  beforeEach(() => {
    localStorage.clear();
  });

  test("welcomes the demo user by name", async () => {
    renderDashboard();

    expect(
      await screen.findByText("Welcome, Demo User")
    ).toBeInTheDocument();
  });

  test("welcomes the user by their saved name", async () => {
    const profile = await getMyProfile();
    await updateMyProfile({ ...profile, fullName: "Layla Haddad" });

    renderDashboard();

    expect(
      await screen.findByText("Welcome, Layla Haddad")
    ).toBeInTheDocument();
  });

  test("loading ends once the profile is shown", async () => {
    renderDashboard();
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

    renderDashboard();

    expect(
      await screen.findByText("Could not load your profile. Please refresh the page.")
    ).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  test("welcomes the active dependent when one is selected", async () => {
    const child = await addLinkedProfile({ fullName: "Sami", dateOfBirth: "2015-03-10", relationship: "child" });
    localStorage.setItem("nabad-active-profile-id", child.id);

    renderDashboard();

    expect(await screen.findByText("Welcome, Sami")).toBeInTheDocument();
    // The "managing ... care" note belongs to /profile only.
    expect(screen.queryByText(/You're managing/)).not.toBeInTheDocument();
  });

  test("My Profile link points to /profile", async () => {
    renderDashboard();
    await screen.findByText("Welcome, Demo User");

    expect(
      screen.getByRole("link", { name: "My Profile" })
    ).toHaveAttribute("href", "/profile");
  });
});
