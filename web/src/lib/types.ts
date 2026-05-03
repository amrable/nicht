export type Noun = {
  word: string;
  article: "der" | "die" | "das";
  plural: string | null;
  english: string;
};

export type Verb = {
  infinitive: string;
  formInSentence: string;
  partizipII: string;
  auxiliary: "haben" | "sein";
  english: string;
  present: {
    ich: string;
    du: string;
    erSieEs: string;
    wir: string;
    ihr: string;
    sie: string;
  };
  praeteritum?: {
    ich: string;
    du: string;
    erSieEs: string;
    wir: string;
    ihr: string;
    sie: string;
  };
};

export type BreakdownItem = {
  part: string;
  role: string;
  english: string;
};

export type GuideSlug =
  | "accusative-vs-dative"
  | "der-die-das"
  | "german-cases"
  | "german-plurals"
  | "german-word-order"
  | "haben-or-sein"
  | "modal-verbs"
  | "partizip-2"
  | "strong-verbs"
  | "two-way-prepositions";

export const GUIDE_TITLES: Record<GuideSlug, string> = {
  "accusative-vs-dative": "Accusative vs dative",
  "der-die-das": "der, die, or das",
  "german-cases": "The four German cases",
  "german-plurals": "German plural rules",
  "german-word-order": "German word order (Satzbau)",
  "haben-or-sein": "Haben or sein?",
  "modal-verbs": "German modal verbs",
  "partizip-2": "Partizip II",
  "strong-verbs": "Strong & irregular verbs",
  "two-way-prepositions": "Two-way prepositions",
};

export type Correction = {
  original: string;
  suggested: string;
  reason: string;
  guide?: GuideSlug | null;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
};

export type FavoriteKind = "noun" | "verb";

export type Favorite = {
  id: string;
  kind: FavoriteKind;
  key: string;
  payload: Noun | Verb;
  createdAt: string | number;
};

export type Analysis = {
  analyzed?: string;
  translation: string;
  nouns: Noun[];
  verbs: Verb[];
  breakdown: BreakdownItem[];
  corrections: Correction[];
};

export type MultiAnalysis = {
  id?: string;
  sentence?: string;
  sentences: Analysis[];
};
