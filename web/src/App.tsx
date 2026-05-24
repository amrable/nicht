import { useEffect, useState } from "react";
import Header from "./components/Header";
import { ProfilePage } from "./components/ProfilePage";
import { CommonList } from "./components/CommonList";
import { CommonDetail } from "./components/CommonDetail";
import { GuideList } from "./components/GuideList";
import { GuideDetail } from "./components/GuideDetail";
import { AboutPage } from "./components/AboutPage";
import { SupportPage } from "./components/SupportPage";
import { Footer } from "./components/Footer";
import { HubPage } from "./components/HubPage";
import { AnalyzePage } from "./components/AnalyzePage";
import { PronouncePage } from "./components/PronouncePage";
import { matchRoute, type Route } from "./routes";
import { fetchStats } from "./lib/api";

export default function App() {
  const [route, setRoute] = useState<Route>(() =>
    matchRoute(typeof window !== "undefined" ? window.location.pathname : "/"),
  );
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetchStats()
      .then((s) => setCount(s.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fire = () => {
      setRoute(matchRoute(window.location.pathname));
    };
    fire();
    window.addEventListener("popstate", fire);
    return () => window.removeEventListener("popstate", fire);
  }, []);

  // Redirect old shared links (/?shared=...) to /analyze?shared=...
  useEffect(() => {
    if (route.kind === "hub") {
      const shared = new URLSearchParams(window.location.search).get("shared");
      if (shared) {
        window.location.replace(`/analyze?shared=${shared}`);
      }
    }
  }, [route.kind]);

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen">
      <Header count={count} />
      {children}
      <Footer />
    </div>
  );

  if (route.kind === "hub") return shell(<HubPage />);
  if (route.kind === "analyze") return shell(<AnalyzePage />);
  if (route.kind === "pronounce") return shell(<PronouncePage />);
  if (route.kind === "favorites" || route.kind === "profile") return shell(<ProfilePage />);
  if (route.kind === "common-list") return shell(
    <main className="mx-auto px-6 sm:px-8 pb-16 w-full" style={{ maxWidth: 1100, paddingTop: "clamp(20px, 4vw, 36px)" }}>
      <CommonList />
    </main>
  );
  if (route.kind === "common-detail") return shell(
    <main className="mx-auto px-6 sm:px-8 pb-16 w-full" style={{ maxWidth: 1100, paddingTop: "clamp(20px, 4vw, 36px)" }}>
      <CommonDetail slug={route.slug} />
    </main>
  );
  if (route.kind === "guides-list") return shell(
    <main className="mx-auto px-6 sm:px-8 pb-16 w-full" style={{ maxWidth: 1100, paddingTop: "clamp(20px, 4vw, 36px)" }}>
      <GuideList />
    </main>
  );
  if (route.kind === "guides-detail") return shell(
    <main className="mx-auto px-6 sm:px-8 pb-16 w-full" style={{ maxWidth: 1100, paddingTop: "clamp(20px, 4vw, 36px)" }}>
      <GuideDetail slug={route.slug} />
    </main>
  );
  if (route.kind === "about") return shell(
    <main className="mx-auto px-6 sm:px-8 pb-16 w-full" style={{ maxWidth: 1100, paddingTop: "clamp(20px, 4vw, 36px)" }}>
      <AboutPage />
    </main>
  );
  if (route.kind === "support") return shell(
    <main className="mx-auto px-6 sm:px-8 pb-16 w-full" style={{ maxWidth: 1100, paddingTop: "clamp(20px, 4vw, 36px)" }}>
      <SupportPage />
    </main>
  );

  return shell(<HubPage />);
}
