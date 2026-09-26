// Automated tests for the temporary profile mock API (lib/profileApi.js).
// These tests run automatically on every pull request.

import {
  getMyProfile,
  updateMyProfile,
  listLinkedProfiles,
  addLinkedProfile,
  removeLinkedProfile,
  deleteAccount,
} from "../lib/profileApi";

describe("Profile API (mock)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("seeds a demo profile when nothing is stored", async () => {
    const profile = await getMyProfile();

    expect(profile.fullName).toBe("Demo User");
    expect(profile.email).toBe("demo@nabad.app");
    expect(profile.isSelf).toBe(true);
  });

  test("getMyProfile rejects instead of returning nothing when data is broken", async () => {
    localStorage.setItem("nabad-profiles", JSON.stringify({ profiles: [] }));
    await expect(getMyProfile()).rejects.toThrow("Your profile was not found");

    localStorage.setItem("nabad-profiles", "{oops");
    await expect(getMyProfile()).rejects.toThrow("Saved profile data is unreadable");
  });

  test("updating the profile does not change the email", async () => {
    await updateMyProfile({
      fullName: "Layla Haddad",
      phone: "71123456",
      dateOfBirth: "1990-05-01",
      email: "hacker@example.com",
    });

    const profile = await getMyProfile();
    expect(profile.fullName).toBe("Layla Haddad");
    expect(profile.email).toBe("demo@nabad.app");
  });

  test("adds, lists, and removes linked profiles", async () => {
    const child = await addLinkedProfile({ fullName: "Sami", relationship: "child" });

    expect(await listLinkedProfiles()).toEqual([child]);

    await removeLinkedProfile(child.id);
    expect(await listLinkedProfiles()).toEqual([]);
  });

  test("rejects a linked profile with an invalid relationship", async () => {
    await expect(
      addLinkedProfile({ fullName: "Sami", relationship: "self" })
    ).rejects.toThrow("Relationship must be child, parent, spouse, or other");
  });

  test("cannot remove the self profile", async () => {
    await expect(removeLinkedProfile("self")).rejects.toThrow(
      "You cannot remove your own profile"
    );
  });

  test("deleteAccount requires a password and then resets the data", async () => {
    await updateMyProfile({ fullName: "Layla Haddad", phone: "", dateOfBirth: "" });

    await expect(deleteAccount("")).rejects.toThrow("Password is required");

    await deleteAccount("secret");
    expect((await getMyProfile()).fullName).toBe("Demo User");
  });
});
