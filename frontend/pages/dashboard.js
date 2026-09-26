import { useEffect, useState } from "react";
import Logo from "../components/Logo";
import { getMyProfile } from "../lib/profileApi";

const TEAL = "#0f766e";

const buttonStyle = {
  display: "inline-block",
  padding: "10px 20px",
  borderRadius: 8,
  background: TEAL,
  color: "white",
  textDecoration: "none",
  fontWeight: "bold",
};

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  // Load the user's profile once, when the page first appears.
  // .catch() makes sure a failed load shows a message instead of "Loading..." forever.
  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch(() => setError("Could not load your profile. Please refresh the page."));
  }, []);

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: "20px 16px", fontFamily: "sans-serif", color: "#1f2937" }}>
      <nav style={{ marginBottom: 40 }}>
        <Logo />
      </nav>
      {profile && <h1>Welcome, {profile.fullName}</h1>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {!profile && !error && <p>Loading...</p>}
      <a href="/profile" style={buttonStyle}>My Profile</a>
    </main>
  );
}
