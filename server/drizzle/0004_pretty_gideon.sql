CREATE TABLE "c_ai_token_usages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"prompt_tokens" integer DEFAULT 0 NOT NULL,
	"completion_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"cached_tokens" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "c_models" RENAME COLUMN "canThinking" TO "reasoning_effort";--> statement-breakpoint
ALTER TABLE "c_ai_token_usages" ADD CONSTRAINT "c_ai_token_usages_user_id_c_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."c_users"("id") ON DELETE cascade ON UPDATE no action;