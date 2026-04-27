import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const analyses = sqliteTable("analyses", {
  id: text("id").primaryKey(), // UUID
  sentence: text("sentence").notNull(),
  result: text("result").notNull(), // JSON string of the analysis response
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // UUID
  googleSub: text("google_sub").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  picture: text("picture"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const favorites = sqliteTable(
  "favorites",
  {
    id: text("id").primaryKey(), // UUID
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    kind: text("kind", { enum: ["noun", "verb"] }).notNull(),
    key: text("key").notNull(),
    payload: text("payload").notNull(), // JSON of Noun or Verb
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    uniq: uniqueIndex("favorites_user_kind_key").on(t.userId, t.kind, t.key),
  }),
);
