export function PronouncePage() {
  return (
    <main
      className="mx-auto px-6 sm:px-8 pb-16 w-full"
      style={{ maxWidth: 760, paddingTop: "clamp(20px, 4vw, 36px)" }}
    >
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: "var(--text)",
          margin: 0,
        }}
      >
        Pronunciation trainer
      </h1>

      <div
        style={{
          marginTop: 32,
          padding: "32px 24px",
          borderRadius: 14,
          border: "1px dashed var(--border)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 500,
            color: "var(--text)",
          }}
        >
          Coming soon
        </p>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 13,
            color: "var(--text-muted)",
            lineHeight: 1.6,
            maxWidth: 360,
            marginInline: "auto",
          }}
        >
          Listen to German sentences and record yourself repeating them. You'll
          get an instant score powered by Microsoft Azure pronunciation
          assessment.
        </p>
      </div>
    </main>
  );
}
