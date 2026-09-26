// TEMPORARY MOCK: this file fakes the future backend for profiles.
// It saves data in the browser's localStorage so the demo survives page refreshes.
// Every function is async (returns a Promise) like a real API call, so later we can
// replace the insides with real fetch() calls without changing any page.

const STORAGE_KEY = "nabad-profiles";

const RELATIONSHIPS = ["child", "parent", "spouse", "other"];

// The account owner's profile, used when nothing is stored yet.
const DEMO_SELF_PROFILE = {
  id: "self",
  fullName: "Demo User",
  dateOfBirth: "",
  relationship: "self",
  isSelf: true,
  email: "demo@nabad.app",
  phone: "",
};

// Reads the list of profiles from localStorage (seeding the demo user if empty).
// Throws an error if the stored data is not in the shape we expect.
function loadProfiles() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    let data;
    try {
      data = JSON.parse(saved);
    } catch {
      throw new Error("Saved profile data is unreadable");
    }
    if (!data || !Array.isArray(data.profiles)) {
      throw new Error("Saved profile data is unreadable");
    }
    return data.profiles;
  }
  const profiles = [DEMO_SELF_PROFILE];
  saveProfiles(profiles);
  return profiles;
}

function saveProfiles(profiles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ profiles }));
}

// Returns the account owner's profile from a list, or throws if it is missing
// (like a real API answering "404 Not Found" instead of returning nothing).
function findSelf(profiles) {
  const self = profiles.find((profile) => profile.isSelf);
  if (!self) {
    throw new Error("Your profile was not found");
  }
  return self;
}

export async function getMyProfile() {
  return findSelf(loadProfiles());
}

// Only name, phone, and date of birth can change. Email is read-only.
export async function updateMyProfile(data) {
  const profiles = loadProfiles();
  findSelf(profiles);
  const updatedProfiles = profiles.map((profile) =>
    profile.isSelf
      ? { ...profile, fullName: data.fullName, phone: data.phone, dateOfBirth: data.dateOfBirth }
      : profile
  );
  saveProfiles(updatedProfiles);
  return findSelf(updatedProfiles);
}

export async function listLinkedProfiles() {
  return loadProfiles().filter((profile) => !profile.isSelf);
}

export async function addLinkedProfile(data) {
  if (!data.fullName || !data.fullName.trim()) {
    throw new Error("Full name is required");
  }
  if (!RELATIONSHIPS.includes(data.relationship)) {
    throw new Error("Relationship must be child, parent, spouse, or other");
  }
  const newProfile = {
    id: "p-" + Date.now(),
    fullName: data.fullName.trim(),
    dateOfBirth: data.dateOfBirth || "",
    relationship: data.relationship,
    isSelf: false,
  };
  saveProfiles([...loadProfiles(), newProfile]);
  return newProfile;
}

export async function removeLinkedProfile(id) {
  const profiles = loadProfiles();
  const profile = profiles.find((p) => p.id === id);
  if (!profile) {
    throw new Error("Profile not found");
  }
  if (profile.isSelf) {
    throw new Error("You cannot remove your own profile");
  }
  saveProfiles(profiles.filter((p) => p.id !== id));
}

// The mock cannot check a real password, so it only requires one to be entered.
export async function deleteAccount(password) {
  if (!password) {
    throw new Error("Password is required");
  }
  localStorage.removeItem(STORAGE_KEY);
}
