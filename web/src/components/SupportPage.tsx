export function SupportPage() {
  return (
    <div className="mx-auto" style={{ maxWidth: 680 }}>
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: "var(--text)",
          margin: "0 0 8px",
        }}
      >
        Send feedback
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 15, margin: "0 0 24px", lineHeight: 1.6 }}>
        nicht.wtf is built by one person. If something feels off or you have a suggestion, I'd love to hear from you.
      </p>
      <iframe
        src="https://tally.so/embed/NpRJLb?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
        loading="lazy"
        width="100%"
        height="400"
        style={{ border: "none", borderRadius: 8 }}
        title="Feedback form"
      />
    </div>
  );
}
