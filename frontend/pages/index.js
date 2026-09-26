import Head from "next/head";
import { useRouter } from "next/router";
import Logo from "../components/Logo";

const TEAL = "#0f766e";
const TEAL_LIGHT = "#f0fdfa";

const features = [
  {
    icon: "🩺",
    title: "AI symptom triage",
    text: "Describe your symptoms by text or voice and get an urgency assessment.",
  },
  {
    icon: "🚑",
    title: "Smart emergency routing",
    text: "Get sent to the nearest hospital equipped for your condition, not just the closest one.",
  },
  {
    icon: "🏥",
    title: "Provider directory",
    text: "Find hospitals and clinics by specialty, location, and availability.",
  },
  {
    icon: "👨‍👩‍👧",
    title: "Caregiver profiles",
    text: "Manage care for your children or parents from one account.",
  },
];

const steps = ["Create an account", "Describe your symptoms", "Get guidance and directions"];

const sectionStyle = { maxWidth: 1000, margin: "0 auto", padding: "64px 16px" };

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 24,
};

const buttonStyle = {
  display: "inline-block",
  padding: "10px 20px",
  borderRadius: 8,
  border: `2px solid ${TEAL}`,
  background: TEAL,
  color: "white",
  textDecoration: "none",
  fontWeight: "bold",
};

const outlineButtonStyle = { ...buttonStyle, background: "white", color: TEAL };

export default function HomePage() {
  // The profile page sends users to "/?deleted=1" after they delete their account.
  const router = useRouter();

  return (
    <main style={{ fontFamily: "sans-serif", color: "#1f2937", background: "white" }}>
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          maxWidth: 1000,
          margin: "0 auto",
          padding: "20px 16px",
        }}
      >
        <Logo />
        <div style={{ display: "flex", gap: 12 }}>
          <a href="/login" style={outlineButtonStyle}>Log in</a>
          <a href="/signup" style={buttonStyle}>Sign up</a>
        </div>
      </nav>

      {router.query.deleted && (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px" }}>
          <p
            role="status"
            style={{ margin: 0, padding: 12, borderRadius: 8, background: TEAL_LIGHT, color: TEAL, fontWeight: "bold", textAlign: "center" }}
          >
            Your account has been deleted.
          </p>
        </div>
      )}

      <section
        style={{
          ...sectionStyle,
          textAlign: "center",
          padding: "96px 16px",
          // Shrinks with screen width on phones; stays 96px on screens 960px+ wide.
          paddingBottom: "clamp(48px, 10vw, 96px)",
        }}
      >
        <h1 style={{ fontSize: "clamp(32px, 6vw, 52px)", margin: "0 0 20px" }}>
          Know where to go when it matters.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 600, margin: "0 auto 32px", color: "#4b5563" }}>
          Describe your symptoms, understand how urgent they are, and find the hospital that can
          actually treat you.
        </p>
        <a href="/signup" style={{ ...buttonStyle, padding: "14px 32px", fontSize: 18 }}>
          Get started
        </a>
      </section>

      {/* Shrinks with screen width on phones; stays 64px on screens 1000px+ wide. */}
      <section style={{ ...sectionStyle, paddingTop: "clamp(32px, 6.4vw, 64px)" }}>
        <h2 style={{ textAlign: "center", marginBottom: 40 }}>What Nabad does</h2>
        <div style={gridStyle}>
          {features.map((feature) => (
            <div key={feature.title} style={{ background: TEAL_LIGHT, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 36 }}>{feature.icon}</div>
              <h3 style={{ color: TEAL }}>{feature.title}</h3>
              <p style={{ lineHeight: 1.6, color: "#4b5563" }}>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ textAlign: "center", marginBottom: 40 }}>How it works</h2>
        <div style={gridStyle}>
          {steps.map((step, index) => (
            <div key={step} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  lineHeight: "48px",
                  margin: "0 auto 12px",
                  borderRadius: "50%",
                  background: TEAL,
                  color: "white",
                  fontSize: 20,
                  fontWeight: "bold",
                }}
              >
                {index + 1}
              </div>
              <p style={{ fontSize: 18 }}>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <p
          style={{
            border: `1px solid ${TEAL}`,
            borderRadius: 12,
            padding: 20,
            lineHeight: 1.6,
            textAlign: "center",
            margin: 0,
          }}
        >
          Nabad does not diagnose and does not replace professional medical advice. In an
          emergency, call 140 (Lebanese Red Cross).
        </p>
      </section>

      <footer style={{ textAlign: "center", padding: "32px 16px", borderTop: "1px solid #e5e7eb", color: "#6b7280" }}>
        Nabad, built by Team 3 for CMPS 271, AUB
      </footer>
    </main>
  );
}
