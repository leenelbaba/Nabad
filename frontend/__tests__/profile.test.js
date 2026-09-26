// Automated tests for the Nabad "My Profile" page.
// These tests run automatically on every pull request.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "../pages/profile";
import { getMyProfile } from "../lib/profileApi";

// Renders the page, waits for the profile to load, and clicks "Edit".
async function renderInEditMode() {
  const user = userEvent.setup();
  render(<ProfilePage />);
  await user.click(await screen.findByRole("button", { name: "Edit" }));
  return user;
}

describe("Profile Page", () => {
  // Start every test with empty storage, so the demo user is seeded fresh.
  beforeEach(() => {
    localStorage.clear();
  });

  test("shows the user's name and email", async () => {
    render(<ProfilePage />);

    expect(await screen.findByText("Demo User")).toBeInTheDocument();
    expect(screen.getByText("demo@nabad.app")).toBeInTheDocument();
  });

  test("loading ends once the profile is shown", async () => {
    render(<ProfilePage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await screen.findByText("Demo User");
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  test("loading ends with an error message when the profile cannot be loaded", async () => {
    localStorage.setItem("nabad-profiles", JSON.stringify({ profiles: [] }));

    render(<ProfilePage />);

    expect(
      await screen.findByText("Could not load your profile. Please refresh the page.")
    ).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  test("shows an error when the name is empty", async () => {
    const user = await renderInEditMode();

    await user.clear(screen.getByLabelText("Full name"));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Full name is required")).toBeInTheDocument();
  });

  test("shows an error for an invalid phone number", async () => {
    const user = await renderInEditMode();

    await user.type(screen.getByLabelText("Phone"), "abc123");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      screen.getByText("Enter a valid Lebanese or international phone number")
    ).toBeInTheDocument();
  });

  test("shows an error for a date of birth in the future", async () => {
    const user = await renderInEditMode();

    await user.type(screen.getByLabelText("Date of birth"), "2999-01-01");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      screen.getByText("Date of birth cannot be in the future")
    ).toBeInTheDocument();
  });

  test("saving updates the displayed data", async () => {
    const user = await renderInEditMode();

    await user.clear(screen.getByLabelText("Full name"));
    await user.type(screen.getByLabelText("Full name"), "Layla Haddad");
    await user.type(screen.getByLabelText("Phone"), "+961 71 123 456");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Profile saved successfully.")).toBeInTheDocument();
    expect(screen.getByText("Layla Haddad")).toBeInTheDocument();
    expect(screen.getByText("+961 71 123 456")).toBeInTheDocument();

    // The change is also stored, so it survives a page refresh.
    expect((await getMyProfile()).fullName).toBe("Layla Haddad");
  });

  test("Cancel discards changes", async () => {
    const user = await renderInEditMode();

    await user.clear(screen.getByLabelText("Full name"));
    await user.type(screen.getByLabelText("Full name"), "Someone Else");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByText("Demo User")).toBeInTheDocument();
    expect(screen.queryByText("Someone Else")).not.toBeInTheDocument();
  });

  test("shows the emergency contact placeholder", async () => {
    render(<ProfilePage />);

    expect(await screen.findByText("Emergency contact")).toBeInTheDocument();
  });
});
