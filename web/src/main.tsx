import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import { AuthProvider } from "./lib/auth";
import { FavoritesProvider } from "./lib/favorites";
import { LoginModal } from "./components/LoginModal";
import "./index.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <FavoritesProvider>
          <App />
          <LoginModal />
        </FavoritesProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
