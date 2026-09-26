import { createContext, useContext, useEffect, useState } from "react";
import { getMyProfile, listLinkedProfiles } from "../lib/profileApi";

// localStorage key that remembers which profile the user is acting as.
const ACTIVE_PROFILE_KEY = "nabad-active-profile-id";

// A React context lets any page read the active profile without passing it down as props.
const ActiveProfileContext = createContext(null);

export function ActiveProfileProvider({ children }) {
  const [selfProfile, setSelfProfile] = useState(null);
  const [linkedProfiles, setLinkedProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState("self");
  const [error, setError] = useState("");

  // Loads the account owner and all dependents from the profile API.
  async function refreshProfiles() {
    try {
      setSelfProfile(await getMyProfile());
      setLinkedProfiles(await listLinkedProfiles());
    } catch {
      setError("Could not load your profile. Please refresh the page.");
    }
  }

  // On first load, fetch the profiles and read the saved choice.
  // localStorage only exists in the browser, so it is read here and not during rendering.
  useEffect(() => {
    const savedId = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (savedId) {
      setActiveProfileId(savedId);
    }
    refreshProfiles();
  }, []);

  function switchProfile(id) {
    setActiveProfileId(id);
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  }

  // If the saved id no longer matches a dependent (for example it was removed),
  // fall back to the account owner's own profile.
  const activeProfile =
    linkedProfiles.find((profile) => profile.id === activeProfileId) || selfProfile;

  const value = {
    selfProfile,
    linkedProfiles,
    activeProfile,
    switchProfile,
    refreshProfiles,
    error,
    loading: !selfProfile && !error,
  };

  return <ActiveProfileContext.Provider value={value}>{children}</ActiveProfileContext.Provider>;
}

// Pages call useActiveProfile() to get the value shared by the provider above.
export function useActiveProfile() {
  return useContext(ActiveProfileContext);
}
