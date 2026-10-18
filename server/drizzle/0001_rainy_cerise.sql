CREATE TABLE "c_app_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "c_message_tools" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text,
	"session_id" text,
	"tool_call_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"arguments" jsonb,
	"status" varchar(20) NOT NULL,
	"duration" integer DEFAULT -1,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "c_message_attachments" ALTER COLUMN "size" SET DEFAULT -1;--> statement-breakpoint
ALTER TABLE "c_app_feedback" ADD CONSTRAINT "c_app_feedback_user_id_c_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."c_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_message_tools" ADD CONSTRAINT "c_message_tools_message_id_c_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."c_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_message_tools" ADD CONSTRAINT "c_message_tools_session_id_c_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."c_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_message_tools_message_id" ON "c_message_tools" USING btree ("message_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_message_tools_session_id" ON "c_message_tools" USING btree ("session_id","created_at");