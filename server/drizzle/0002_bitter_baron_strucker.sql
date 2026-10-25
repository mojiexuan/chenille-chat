CREATE TABLE "c_user_agent_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"agent_nickname" varchar(50),
	"user_alias" varchar(50),
	"persona_prompt" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "c_user_agent_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "c_user_agent_profiles" ADD CONSTRAINT "c_user_agent_profiles_user_id_c_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."c_users"("id") ON DELETE cascade ON UPDATE no action;