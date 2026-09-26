// Automated tests for switching profiles (ActiveProfile context + ProfileHeader).
// These tests run automatically on every pull request.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileHeader from "../components/ProfileHeader";
import { ActiveProfileProvider } from "../context/ActiveProfileContext";
import { addLinkedProfile } from "../lib/profileApi";

// Renders the header inside the provider, like every page gets from _app.js.
// Returns unmount so a test can "reload the page" by rendering again.
function renderHeader() {
  return render(
    <ActiveProfileProvider>
      <ProfileHeader />
    </ActiveProfileProvider>
  );
}

describe("Profile switcher", () => {
  let child;

  beforeEach(async () => {
    localStorage.clear();
    child = await addLinkedProfile({ fullName: "Sami", dateOfBirth: "2015-03-10", relationship: "child" });
  });

  test("lists the self profile and all dependents", async () => {
    renderHeader();

    expect(await screen.findByRole("option", { name: "Demo User (you)" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Sami (child)" })).toBeInTheDocument();
  });

  test("no banner is shown while acting as yourself", async () => {
    renderHeader();
    await screen.findByRole("option", { name: "Demo User (you)" });

    expect(screen.queryByText(/Acting as:/)).not.toBeInTheDocument();
  });

  test("switching to a dependent shows the Acting as banner, switching back hides it", async () => {
    const user = userEvent.setup();
    renderHeader();
    await screen.findByRole("option", { name: "Sami (child)" });

    await user.selectOptions(screen.getByLabelText("Active profile"), child.id);
    expect(screen.getByText("Acting as: Sami (child)")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Active profile"), "self");
    expect(screen.queryByText(/Acting as:/)).not.toBeInTheDocument();
  });

  test("the chosen profile survives a reload", async () => {
    const user = userEvent.setup();
    const { unmount } = renderHeader();
    await screen.findByRole("option", { name: "Sami (child)" });
    await user.selectOptions(screen.getByLabelText("Active profile"), child.id);

    // Unmounting and rendering again is like refreshing the page.
    unmount();
    renderHeader();

    expect(await screen.findByText("Acting as: Sami (child)")).toBeInTheDocument();
    expect(screen.getByLabelText("Active profile")).toHaveValue(child.id);
  });

  test("falls back to the self profile if the saved one no longer exists", async () => {
    localStorage.setItem("nabad-active-profile-id", "p-deleted");

    renderHeader();

    await screen.findByRole("option", { name: "Demo User (you)" });
    expect(screen.getByLabelText("Active profile")).toHaveValue("self");
    expect(screen.queryByText(/Acting as:/)).not.toBeInTheDocument();
  });
});
