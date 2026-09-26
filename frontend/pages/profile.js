import { useEffect, useState } from "react";
import Logo from "../components/Logo";
import { getMyProfile, updateMyProfile } from "../lib/profileApi";

const TEAL = "#0f766e";

const buttonStyle = {
  padding: "10px 20px",
  borderRadius: 8,
  border: `2px solid ${TEAL}`,
  background: TEAL,
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const outlineButtonStyle = { ...buttonStyle, background: "white", color: TEAL };

const inputStyle = { width: "100%", padding: 8, margin: "6px 0 4px", boxSizing: "border-box" };

// Today's date as "YYYY-MM-DD" in the user's local time zone.
// (toISOString() uses UTC, which can be a different day around midnight in Lebanon.)
function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// Checks the form and returns an object of error messages, e.g. { phone: "..." }.
// An empty object means everything is valid.
function validate(form) {
  const errors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Full name is required";
  }

  // Phone is optional. Ignore spaces, dashes, and brackets, then accept either
  // an international number (+ and 8 to 15 digits, e.g. +961 71 123 456)
  // or a Lebanese local number (7 or 8 digits, e.g. 71 123 456 or 03 123 456).
  const phone = form.phone.replace(/[\s\-()]/g, "");
  if (phone && !/^(\+\d{8,15}|0?\d{7,8})$/.test(phone)) {
    errors.phone = "Enter a valid Lebanese or international phone number";
  }

  // Dates in "YYYY-MM-DD" format can be compared as plain strings.
  if (form.dateOfBirth && form.dateOfBirth > todayString()) {
    errors.dateOfBirth = "Date of birth cannot be in the future";
  }

  return errors;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", dateOfBirth: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");

  // Load the profile once. .catch() makes sure a failed load shows a message
  // instead of "Loading..." forever.
  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch(() => setLoadError("Could not load your profile. Please refresh the page."));
  }, []);

  function startEditing() {
    // Copy the saved values into the form so edits don't change the profile until saved.
    setForm({ fullName: profile.fullName, phone: profile.phone, dateOfBirth: profile.dateOfBirth });
    setErrors({});
    setMessage("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setErrors({});
    setSaveError("");
    setIsEditing(false);
  }

  // Updates one field of the form, e.g. updateField("phone", "71123456").
  function updateField(name, value) {
    setForm({ ...form, [name]: value });
  }

  async function handleSave(e) {
    e.preventDefault();
    const newErrors = validate(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const updated = await updateMyProfile({ ...form, fullName: form.fullName.trim() });
      setProfile(updated);
      setIsEditing(false);
      setMessage("Profile saved successfully.");
    } catch {
      setSaveError("Could not save your profile. Please try again.");
    } finally {
      // Runs whether saving worked or not, so the button never stays on "Saving...".
      setSaving(false);
    }
  }

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px", fontFamily: "sans-serif", color: "#1f2937" }}>
      <nav style={{ marginBottom: 32 }}>
        <Logo />
      </nav>
      <h1>My Profile</h1>

      {loadError && <p style={{ color: "crimson" }}>{loadError}</p>}
      {!profile && !loadError && <p>Loading...</p>}

      {message && <p style={{ color: TEAL, fontWeight: "bold" }}>{message}</p>}

      {profile && !isEditing && (
        <div>
          <p><strong>Full name:</strong> {profile.fullName}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone || "Not set"}</p>
          <p><strong>Date of birth:</strong> {profile.dateOfBirth || "Not set"}</p>
          <button type="button" onClick={startEditing} style={buttonStyle}>Edit</button>
        </div>
      )}

      {profile && isEditing && (
        // noValidate turns off the browser's own checks so our validate() messages are shown.
        <form onSubmit={handleSave} noValidate>
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            style={inputStyle}
          />
          {errors.fullName && <p style={{ color: "crimson", marginTop: 0 }}>{errors.fullName}</p>}

          <p><strong>Email:</strong> {profile.email} (cannot be changed)</p>

          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="e.g. 71 123 456 or +961 71 123 456"
            style={inputStyle}
          />
          {errors.phone && <p style={{ color: "crimson", marginTop: 0 }}>{errors.phone}</p>}

          <label htmlFor="dateOfBirth">Date of birth</label>
          <input
            id="dateOfBirth"
            type="date"
            max={todayString()}
            value={form.dateOfBirth}
            onChange={(e) => updateField("dateOfBirth", e.target.value)}
            style={inputStyle}
          />
          {errors.dateOfBirth && <p style={{ color: "crimson", marginTop: 0 }}>{errors.dateOfBirth}</p>}

          {saveError && <p style={{ color: "crimson" }}>{saveError}</p>}
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button type="submit" disabled={saving} style={buttonStyle}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={cancelEditing} style={outlineButtonStyle}>Cancel</button>
          </div>
        </form>
      )}

      {/* PLACEHOLDER: Emergency contact section, being built by a teammate. Replace this box. */}
      <section style={{ border: `2px dashed ${TEAL}`, borderRadius: 12, padding: 20, marginTop: 40 }}>
        <h2 style={{ marginTop: 0, color: TEAL }}>Emergency contact</h2>
        <p style={{ margin: 0, color: "#6b7280" }}>Coming soon.</p>
      </section>

      <p style={{ marginTop: 24 }}>
        <a href="/dashboard" style={{ color: TEAL }}>Back to dashboard</a>
      </p>
    </main>
  );
}
