import { z } from "zod";

export const AnalyzeRequest = z.object({
  sentence: z.string().trim().min(1).max(500),
});

export const Noun = z.object({
  word: z.string(),
  article: z.enum(["der", "die", "das"]),
  plural: z.string().nullable(),
});

export const Verb = z.object({
  infinitive: z.string(),
  formInSentence: z.string(),
  partizipII: z.string(),
  auxiliary: z.enum(["haben", "sein"]),
});

export const BreakdownItem = z.object({
  part: z.string(),
  role: z.string(),
});

export const Correction = z.object({
  original: z.string(),
  suggested: z.string(),
  reason: z.string(),
});

export const AnalysisResponse = z.object({
  nouns: z.array(Noun),
  verbs: z.array(Verb),
  breakdown: z.array(BreakdownItem),
  corrections: z.array(Correction),
});

export type Analysis = z.infer<typeof AnalysisResponse>;
