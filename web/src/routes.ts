export type Route =
  | { kind: "home" }
  | { kind: "favorites" }
  | { kind: "common-list" }
  | { kind: "common-detail"; slug: string }
  | { kind: "guides-list" }
  | { kind: "guides-detail"; slug: string }
  | { kind: "about" }
  | { kind: "support" };

export function matchRoute(path: string): Route {
  const p = path.replace(/\/+$/, "") || "/";
  if (p === "/favorites") return { kind: "favorites" };
  if (p === "/about") return { kind: "about" };
  if (p === "/support") return { kind: "support" };
  if (p === "/common") return { kind: "common-list" };
  const c = p.match(/^\/common\/([^/]+)$/);
  if (c) return { kind: "common-detail", slug: c[1] };
  if (p === "/guides") return { kind: "guides-list" };
  const g = p.match(/^\/guides\/([^/]+)$/);
  if (g) return { kind: "guides-detail", slug: g[1] };
  return { kind: "home" };
}

export function pathForRoute(route: Route): string {
  switch (route.kind) {
    case "home":
      return "/";
    case "favorites":
      return "/favorites";
    case "common-list":
      return "/common";
    case "common-detail":
      return `/common/${route.slug}`;
    case "guides-list":
      return "/guides";
    case "guides-detail":
      return `/guides/${route.slug}`;
    case "about":
      return "/about";
    case "support":
      return "/support";
  }
}
