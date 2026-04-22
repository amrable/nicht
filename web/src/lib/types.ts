export type Noun = {
  word: string;
  article: "der" | "die" | "das";
  plural: string | null;
};

export type Verb = {
  infinitive: string;
  formInSentence: string;
  partizipII: string;
  auxiliary: "haben" | "sein";
};

export type BreakdownItem = {
  part: string;
  role: string;
};

export type Correction = {
  original: string;
  suggested: string;
  reason: string;
};

export type Analysis = {
  nouns: Noun[];
  verbs: Verb[];
  breakdown: BreakdownItem[];
  corrections: Correction[];
};
