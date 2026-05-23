import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import { AuthProvider } from "./lib/auth";
import { FavoritesProvider } from "./lib/favorites";
import { LearnedProvider } from "./lib/learned";
import { LoginModal } from "./components/LoginModal";
import { initAnalytics } from "./lib/analytics";
import "./index.css";

initAnalytics();

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <FavoritesProvider>
          <LearnedProvider>
            <App />
            <LoginModal />
          </LearnedProvider>
        </FavoritesProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
