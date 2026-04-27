import { useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../lib/auth";

export function LoginModal() {
  const { loginModalOpen, closeLoginModal, handleGoogleCredential } = useAuth();

  useEffect(() => {
    if (!loginModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLoginModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loginModalOpen, closeLoginModal]);

  if (!loginModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
      onClick={closeLoginModal}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: 24,
          maxWidth: 360,
          width: "100%",
          boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
        }}
      >
        <h2
          id="login-title"
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text)",
            margin: 0,
          }}
        >
          Sign in to save words
        </h2>
        <p
          lang="en"
          style={{
            fontSize: 13.5,
            color: "var(--text-muted)",
            marginTop: 6,
            lineHeight: 1.5,
          }}
        >
          Star nouns and verbs to keep them in your personal Favorites tab.
        </p>
        <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={(cred) => {
              if (cred.credential) {
                handleGoogleCredential(cred.credential).catch(() => {
                  // surface errors via console; modal stays open
                });
              }
            }}
            onError={() => {
              // keep modal open
            }}
          />
        </div>
        <button
          type="button"
          onClick={closeLoginModal}
          style={{
            marginTop: 16,
            width: "100%",
            background: "transparent",
            border: 0,
            color: "var(--text-muted)",
            fontSize: 13,
            cursor: "pointer",
            padding: 6,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
