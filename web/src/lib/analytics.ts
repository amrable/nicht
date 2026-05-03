import mixpanel from "mixpanel-browser";
import type { AuthUser } from "./types";

type EventProps = {
  page_view: { path: string };
  sentence_analyzed: { char_length: number; word_count: number };
  signup: Record<string, never>;
  login: Record<string, never>;
  login_modal_shown: { source: "favorites" | "gated_action" };
  share_created: { share_id: string };
  shared_view: { share_id: string };
  favorite_added: { kind: "noun" | "verb" };
};

type EventName = keyof EventProps;

const token = import.meta.env.VITE_MIXPANEL_TOKEN as string | undefined;
let enabled = false;

export function initAnalytics() {
  if (!token) {
    console.warn("[analytics] no token — disabled");
    return;
  }
  const apiHost = import.meta.env.VITE_MIXPANEL_API_HOST as string | undefined;
  mixpanel.init(token, {
    track_pageview: false,
    persistence: "localStorage",
    ignore_dnt: true,
    ...(apiHost ? { api_host: apiHost } : {}),
  });
  enabled = true;
}

export function track<E extends EventName>(
  event: E,
  props?: EventProps[E],
) {
  if (!enabled) return;
  mixpanel.track(event, props);
}

const ALIASED_KEY = "nw_mp_aliased";
const KNOWN_USER_PREFIX = "nw_known_user_";

export function identifyUser(user: AuthUser, opts?: { fromLogin?: boolean }) {
  if (!enabled) return;
  if (opts?.fromLogin && !localStorage.getItem(ALIASED_KEY)) {
    try {
      mixpanel.alias(user.id);
      localStorage.setItem(ALIASED_KEY, "1");
    } catch {
      // alias throws if distinct_id already equals the alias; ignore
    }
  }
  mixpanel.identify(user.id);
  mixpanel.people.set({
    $email: user.email,
    $name: user.name ?? undefined,
  });
}

export function isFirstTimeUser(userId: string): boolean {
  const key = KNOWN_USER_PREFIX + userId;
  if (localStorage.getItem(key)) return false;
  localStorage.setItem(key, "1");
  return true;
}

export function resetAnalytics() {
  if (!enabled) return;
  mixpanel.reset();
  localStorage.removeItem(ALIASED_KEY);
}
