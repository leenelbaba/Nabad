// Automated tests for the Nabad "My Profile" page.
// These tests run automatically on every pull request.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "../pages/profile";
import { ActiveProfileProvider } from "../context/ActiveProfileContext";
import { getMyProfile, addLinkedProfile, listLinkedProfiles } from "../lib/profileApi";

// The page reads linked profiles from the provider, just like in _app.js.
function renderProfilePage() {
  render(
    <ActiveProfileProvider>
      <ProfilePage />
    </ActiveProfileProvider>
  );
}

// Renders the page, waits for the profile to load, and clicks "Edit".
async function renderInEditMode() {
  const user = userEvent.setup();
  renderProfilePage();
  await user.click(await screen.findByRole("button", { name: "Edit" }));
  return user;
}

describe("Profile Page", () => {
  // Start every test with empty storage, so the demo user is seeded fresh.
  beforeEach(() => {
    localStorage.clear();
  });

  test("shows the user's name and email", async () => {
    renderProfilePage();

    expect(await screen.findByText("Demo User")).toBeInTheDocument();
    expect(screen.getByText("demo@nabad.app")).toBeInTheDocument();
  });

  test("loading ends once the profile is shown", async () => {
    renderProfilePage();
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await screen.findByText("Demo User");
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  test("loading ends with an error message when the profile cannot be loaded", async () => {
    localStorage.setItem("nabad-profiles", JSON.stringify({ profiles: [] }));

    renderProfilePage();

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

  test("labels the details as the account owner's", async () => {
    renderProfilePage();

    expect(await screen.findByRole("heading", { name: "Account owner" })).toBeInTheDocument();
  });

  test("explains whose settings these are while acting as a dependent", async () => {
    const maya = await addLinkedProfile({ fullName: "Maya", dateOfBirth: "2015-03-10", relationship: "child" });
    localStorage.setItem("nabad-active-profile-id", maya.id);

    renderProfilePage();

    expect(await screen.findByText("Acting as: Maya (child)")).toBeInTheDocument();
    expect(
      screen.getByText("You're managing Maya's care. Account settings below belong to you.")
    ).toBeInTheDocument();
    // The details below are still the account owner's.
    expect(screen.getByRole("heading", { name: "Account owner" })).toBeInTheDocument();
    expect(screen.getByText("demo@nabad.app")).toBeInTheDocument();
  });

  test("does not show the managing note while acting as yourself", async () => {
    renderProfilePage();
    await screen.findByRole("heading", { name: "Account owner" });

    expect(screen.queryByText(/You're managing/)).not.toBeInTheDocument();
  });

  test("shows the emergency contact placeholder", async () => {
    renderProfilePage();

    expect(await screen.findByText("Emergency contact")).toBeInTheDocument();
  });

  describe("Linked profiles", () => {
    // Renders the page, waits for it to load, and opens the "Add dependent" form.
    async function openAddDependentForm() {
      const user = userEvent.setup();
      renderProfilePage();
      await screen.findByText("Demo User", { selector: "p" });
      await user.click(screen.getByRole("button", { name: "Add dependent" }));
      return user;
    }

    test("shows a message when there are no linked profiles", async () => {
      renderProfilePage();

      expect(await screen.findByText("No linked profiles yet.")).toBeInTheDocument();
    });

    test("adding a dependent shows it in the list with relationship and age", async () => {
      const user = await openAddDependentForm();

      // A date of birth exactly 7 years ago today, so the age is always 7.
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const sevenYearsAgo = `${now.getFullYear() - 7}-${month}-${day}`;

      await user.type(screen.getByLabelText("Full name"), "Sami Haddad");
      await user.type(screen.getByLabelText("Date of birth"), sevenYearsAgo);
      await user.selectOptions(screen.getByLabelText("Relationship"), "child");
      await user.click(screen.getByRole("button", { name: "Save dependent" }));

      expect(await screen.findByText("Dependent added.")).toBeInTheDocument();
      expect(screen.getByText("Sami Haddad", { selector: "strong" })).toBeInTheDocument();
      expect(screen.getByText(/child, age 7/)).toBeInTheDocument();
      expect(screen.queryByText("No linked profiles yet.")).not.toBeInTheDocument();

      // It is also saved through the profile API.
      expect((await listLinkedProfiles())[0].fullName).toBe("Sami Haddad");
    });

    test("shows errors when the form is empty", async () => {
      const user = await openAddDependentForm();

      await user.click(screen.getByRole("button", { name: "Save dependent" }));

      expect(screen.getByText("Full name is required")).toBeInTheDocument();
      expect(screen.getByText("Date of birth is required")).toBeInTheDocument();
      expect(screen.getByText("Relationship is required")).toBeInTheDocument();
      expect(await listLinkedProfiles()).toEqual([]);
    });

    test("shows an error for a date of birth in the future", async () => {
      const user = await openAddDependentForm();

      await user.type(screen.getByLabelText("Full name"), "Sami");
      await user.type(screen.getByLabelText("Date of birth"), "2999-01-01");
      await user.selectOptions(screen.getByLabelText("Relationship"), "child");
      await user.click(screen.getByRole("button", { name: "Save dependent" }));

      expect(screen.getByText("Date of birth cannot be in the future")).toBeInTheDocument();
      expect(await listLinkedProfiles()).toEqual([]);
    });

    test("cannot add more than 10 dependents", async () => {
      for (let i = 1; i <= 10; i++) {
        await addLinkedProfile({ fullName: "Child " + i, dateOfBirth: "2015-03-10", relationship: "child" });
      }

      renderProfilePage();

      expect(await screen.findByText("Child 10", { selector: "strong" })).toBeInTheDocument();
      expect(screen.getByText("You can link up to 10 dependents.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Add dependent" })).toBeDisabled();
    });
  });
});
