import type { MultiAnalysis } from "./types";

export type Example = {
  id: string;
  label: string;
  sentence: string;
  analysis: MultiAnalysis;
};

export const EXAMPLES: Example[] = [
  {
    id: "two-way-prep",
    label: "Two-way preposition",
    sentence:
      "Der Mann hat das Buch in die Bibliothek gebracht. Ich gehe in dem Park.",
    analysis: {
      sentences: [
        {
          analyzed: "Der Mann hat das Buch in die Bibliothek gebracht.",
          translation: "The man brought the book to the library.",
          nouns: [
            { word: "Mann", article: "der", plural: "die Männer", english: "man" },
            { word: "Buch", article: "das", plural: "die Bücher", english: "book" },
            {
              word: "Bibliothek",
              article: "die",
              plural: "die Bibliotheken",
              english: "library",
            },
          ],
          verbs: [
            {
              infinitive: "bringen",
              formInSentence: "hat ... gebracht",
              partizipII: "gebracht",
              auxiliary: "haben",
              english: "to bring",
              present: {
                ich: "bringe",
                du: "bringst",
                erSieEs: "bringt",
                wir: "bringen",
                ihr: "bringt",
                sie: "bringen",
              },
              praeteritum: {
                ich: "brachte",
                du: "brachtest",
                erSieEs: "brachte",
                wir: "brachten",
                ihr: "brachtet",
                sie: "brachten",
              },
            },
          ],
          breakdown: [
            { part: "Der Mann", role: "Subjekt (Nominativ)", english: "the man" },
            { part: "hat ... gebracht", role: "Prädikat", english: "brought" },
            { part: "das Buch", role: "Akkusativobjekt", english: "the book" },
            {
              part: "in die Bibliothek",
              role: "Lokaladverbial (Direktional)",
              english: "to the library",
            },
          ],
          corrections: [],
        },
        {
          analyzed: "Ich gehe in den Park.",
          translation: "I'm going to the park.",
          nouns: [
            { word: "Park", article: "der", plural: "die Parks", english: "park" },
          ],
          verbs: [
            {
              infinitive: "gehen",
              formInSentence: "gehe",
              partizipII: "gegangen",
              auxiliary: "sein",
              english: "to go",
              present: {
                ich: "gehe",
                du: "gehst",
                erSieEs: "geht",
                wir: "gehen",
                ihr: "geht",
                sie: "gehen",
              },
              praeteritum: {
                ich: "ging",
                du: "gingst",
                erSieEs: "ging",
                wir: "gingen",
                ihr: "gingt",
                sie: "gingen",
              },
            },
          ],
          breakdown: [
            { part: "Ich", role: "Subjekt (Nominativ)", english: "I" },
            { part: "gehe", role: "Prädikat", english: "am going" },
            {
              part: "in den Park",
              role: "Lokaladverbial (Direktional)",
              english: "to the park",
            },
          ],
          corrections: [
            {
              original: "in dem Park",
              suggested: "in den Park",
              reason: "Direktional → Akkusativ",
              guide: "two-way-prepositions",
            },
          ],
        },
      ],
    },
  },
  {
    id: "partizip-2",
    label: "Partizip II",
    sentence: "Sie hat den Brief gestern geschrieben.",
    analysis: {
      sentences: [
        {
          analyzed: "Sie hat den Brief gestern geschrieben.",
          translation: "She wrote the letter yesterday.",
          nouns: [
            {
              word: "Brief",
              article: "der",
              plural: "die Briefe",
              english: "letter",
            },
          ],
          verbs: [
            {
              infinitive: "schreiben",
              formInSentence: "hat ... geschrieben",
              partizipII: "geschrieben",
              auxiliary: "haben",
              english: "to write",
              present: {
                ich: "schreibe",
                du: "schreibst",
                erSieEs: "schreibt",
                wir: "schreiben",
                ihr: "schreibt",
                sie: "schreiben",
              },
              praeteritum: {
                ich: "schrieb",
                du: "schriebst",
                erSieEs: "schrieb",
                wir: "schrieben",
                ihr: "schriebt",
                sie: "schrieben",
              },
            },
          ],
          breakdown: [
            { part: "Sie", role: "Subjekt (Nominativ)", english: "she" },
            {
              part: "hat ... geschrieben",
              role: "Prädikat",
              english: "wrote",
            },
            { part: "den Brief", role: "Akkusativobjekt", english: "the letter" },
            { part: "gestern", role: "Temporaladverbial", english: "yesterday" },
          ],
          corrections: [],
        },
      ],
    },
  },
  {
    id: "separable-verb",
    label: "Separable verb",
    sentence: "Der Zug fährt um acht Uhr ab.",
    analysis: {
      sentences: [
        {
          analyzed: "Der Zug fährt um acht Uhr ab.",
          translation: "The train departs at eight o'clock.",
          nouns: [
            { word: "Zug", article: "der", plural: "die Züge", english: "train" },
            { word: "Uhr", article: "die", plural: "die Uhren", english: "hour" },
          ],
          verbs: [
            {
              infinitive: "abfahren",
              formInSentence: "fährt ... ab",
              partizipII: "abgefahren",
              auxiliary: "sein",
              english: "to depart",
              present: {
                ich: "fahre ab",
                du: "fährst ab",
                erSieEs: "fährt ab",
                wir: "fahren ab",
                ihr: "fahrt ab",
                sie: "fahren ab",
              },
              praeteritum: {
                ich: "fuhr ab",
                du: "fuhrst ab",
                erSieEs: "fuhr ab",
                wir: "fuhren ab",
                ihr: "fuhrt ab",
                sie: "fuhren ab",
              },
            },
          ],
          breakdown: [
            { part: "Der Zug", role: "Subjekt (Nominativ)", english: "the train" },
            { part: "fährt ... ab", role: "Prädikat", english: "departs" },
            {
              part: "um acht Uhr",
              role: "Temporaladverbial",
              english: "at eight o'clock",
            },
          ],
          corrections: [],
        },
      ],
    },
  },
];

export const DEFAULT_EXAMPLE = EXAMPLES[0];
