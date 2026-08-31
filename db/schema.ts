import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  clientId: text("client_id").primaryKey(),
  countries: text("countries").notNull(),
  roles: text("roles").notNull(),
  locations: text("locations").notNull().default(""),
  needsSponsor: integer("needs_sponsor", { mode: "boolean" }).notNull().default(false),
  resumeSkills: text("resume_skills").notNull().default("[]"),
  resumeLanguage: text("resume_language").notNull().default("英文"),
  careerStage: text("career_stage").notNull().default("Graduate / Entry Level"),
  updatedAt: text("updated_at").notNull(),
});

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  country: text("country").notNull(),
  city: text("city").notNull(),
  track: text("track").notNull(),
  source: text("source").notNull(),
  sourceUrl: text("source_url").notNull(),
  description: text("description").notNull().default(""),
  postedAt: text("posted_at"),
  sponsorQuery: text("sponsor_query"),
  fetchedAt: text("fetched_at").notNull(),
}, (table) => [index("idx_jobs_country_posted_at").on(table.country, table.postedAt)]);

export const jobStates = sqliteTable("job_states", {
  clientId: text("client_id").notNull(),
  jobId: text("job_id").notNull(),
  saved: integer("saved", { mode: "boolean" }).notNull().default(false),
  status: text("status").notNull().default("待申请"),
  updatedAt: text("updated_at").notNull(),
}, (table) => [primaryKey({ columns: [table.clientId, table.jobId] })]);

export const syncRuns = sqliteTable("sync_runs", {
  sourceKey: text("source_key").primaryKey(),
  syncedAt: text("synced_at").notNull(),
  jobCount: integer("job_count").notNull().default(0),
});
