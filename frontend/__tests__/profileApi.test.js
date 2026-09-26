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
    const child = await addLinkedProfile({
      fullName: "Sami",
      dateOfBirth: "2015-03-10",
      relationship: "child",
    });

    expect(await listLinkedProfiles()).toEqual([child]);

    await removeLinkedProfile(child.id);
    expect(await listLinkedProfiles()).toEqual([]);
  });

  test("rejects a linked profile with an invalid relationship", async () => {
    await expect(
      addLinkedProfile({ fullName: "Sami", dateOfBirth: "2015-03-10", relationship: "self" })
    ).rejects.toThrow("Relationship must be child, parent, spouse, or other");
  });

  test("rejects a linked profile without a date of birth or with a future one", async () => {
    await expect(
      addLinkedProfile({ fullName: "Sami", dateOfBirth: "", relationship: "child" })
    ).rejects.toThrow("Date of birth is required");

    await expect(
      addLinkedProfile({ fullName: "Sami", dateOfBirth: "2999-01-01", relationship: "child" })
    ).rejects.toThrow("Date of birth cannot be in the future");
  });

  test("allows at most 10 linked profiles, each with its own id", async () => {
    for (let i = 1; i <= 10; i++) {
      await addLinkedProfile({ fullName: "Child " + i, dateOfBirth: "2015-03-10", relationship: "child" });
    }

    const ids = (await listLinkedProfiles()).map((profile) => profile.id);
    expect(new Set(ids).size).toBe(10);

    await expect(
      addLinkedProfile({ fullName: "Child 11", dateOfBirth: "2015-03-10", relationship: "child" })
    ).rejects.toThrow("You can link up to 10 dependents");
  });

  test("cannot remove the self profile", async () => {
    await expect(removeLinkedProfile("self")).rejects.toThrow(
      "You cannot remove your own profile"
    );
  });

  test("deleteAccount requires a password and then resets the data", async () => {
    await updateMyProfile({ fullName: "Layla Haddad", phone: "", dateOfBirth: "" });

    await expect(deleteAccount("")).rejects.toThrow("Password is required");

    await deleteAccount("demo1234");
    expect(localStorage.getItem("nabad-profiles")).toBeNull();
    // Loading again starts over with a fresh demo user.
    expect((await getMyProfile()).fullName).toBe("Demo User");
  });

  test("deleteAccount rejects a wrong password and deletes nothing", async () => {
    await addLinkedProfile({ fullName: "Sami", dateOfBirth: "2015-03-10", relationship: "child" });

    await expect(deleteAccount("wrong")).rejects.toThrow("Incorrect password");

    expect((await listLinkedProfiles())[0].fullName).toBe("Sami");
  });
});
