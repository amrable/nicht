import { z } from "zod";

export const AnalyzeRequest = z.object({
  sentence: z.string().trim().min(1).max(500),
});

export const Noun = z.object({
  word: z.string(),
  article: z.enum(["der", "die", "das"]),
  plural: z.string().nullable(),
  english: z.string().default(""),
});

export const Verb = z.object({
  infinitive: z.string(),
  formInSentence: z.string(),
  partizipII: z.string(),
  auxiliary: z.enum(["haben", "sein"]),
  english: z.string().default(""),
  present: z.object({
    ich: z.string(),
    du: z.string(),
    erSieEs: z.string(),
    wir: z.string(),
    ihr: z.string(),
    sie: z.string(),
  }),
  praeteritum: z
    .object({
      ich: z.string(),
      du: z.string(),
      erSieEs: z.string(),
      wir: z.string(),
      ihr: z.string(),
      sie: z.string(),
    })
    .optional(),
});

export const BreakdownItem = z.object({
  part: z.string(),
  role: z.string(),
  english: z.string().default(""),
});

export const Correction = z.object({
  original: z.string(),
  suggested: z.string(),
  reason: z.string(),
});

export const AnalysisResponse = z.object({
  translation: z.string().default(""),
  nouns: z.array(Noun),
  verbs: z.array(Verb),
  breakdown: z.array(BreakdownItem),
  corrections: z.array(Correction),
});

export type Analysis = z.infer<typeof AnalysisResponse>;
