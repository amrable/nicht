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

export type Correction = {
  original: string;
  suggested: string;
  reason: string;
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
