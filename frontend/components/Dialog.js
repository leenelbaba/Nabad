// A simple in-page pop-up: a grey overlay covering the page with a white box in the middle.
// role="dialog" and aria-modal tell screen readers (and our tests) that this is a dialog.
export default function Dialog({ title, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        style={{ background: "white", borderRadius: 12, padding: 24, maxWidth: 440, width: "100%" }}
      >
        <h2 id="dialog-title" style={{ marginTop: 0 }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
