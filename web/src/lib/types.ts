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

export type Analysis = {
  translation: string;
  nouns: Noun[];
  verbs: Verb[];
  breakdown: BreakdownItem[];
  corrections: Correction[];
};
