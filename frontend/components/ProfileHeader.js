import Logo from "./Logo";
import { useActiveProfile } from "../context/ActiveProfileContext";

const TEAL = "#0f766e";

// Page header: the logo, a dropdown to switch profiles, and a banner
// that is shown while acting on behalf of a dependent.
export default function ProfileHeader() {
  const { selfProfile, linkedProfiles, activeProfile, switchProfile } = useActiveProfile();

  return (
    <header style={{ marginBottom: 32 }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Logo />
        {selfProfile && (
          <select
            aria-label="Active profile"
            value={activeProfile.id}
            onChange={(e) => switchProfile(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: `2px solid ${TEAL}`, color: TEAL, maxWidth: "100%" }}
          >
            <option value={selfProfile.id}>{selfProfile.fullName} (you)</option>
            {linkedProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.fullName} ({profile.relationship})
              </option>
            ))}
          </select>
        )}
      </nav>

      {activeProfile && !activeProfile.isSelf && (
        <p
          role="status"
          style={{ background: TEAL, color: "white", fontWeight: "bold", padding: "10px 16px", borderRadius: 8, marginBottom: 0 }}
        >
          Acting as: {activeProfile.fullName} ({activeProfile.relationship})
        </p>
      )}
    </header>
  );
}
