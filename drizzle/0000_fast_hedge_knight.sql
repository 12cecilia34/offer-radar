CREATE TABLE `job_states` (
	`client_id` text NOT NULL,
	`job_id` text NOT NULL,
	`saved` integer DEFAULT false NOT NULL,
	`status` text DEFAULT '待申请' NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`client_id`, `job_id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`company` text NOT NULL,
	`role` text NOT NULL,
	`country` text NOT NULL,
	`city` text NOT NULL,
	`track` text NOT NULL,
	`source` text NOT NULL,
	`source_url` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`posted_at` text,
	`sponsor_query` text,
	`fetched_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`client_id` text PRIMARY KEY NOT NULL,
	`countries` text NOT NULL,
	`roles` text NOT NULL,
	`locations` text DEFAULT '' NOT NULL,
	`needs_sponsor` integer DEFAULT false NOT NULL,
	`resume_skills` text DEFAULT '[]' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_runs` (
	`source_key` text PRIMARY KEY NOT NULL,
	`synced_at` text NOT NULL,
	`job_count` integer DEFAULT 0 NOT NULL
);
