CREATE TABLE "c_message_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer,
	"user_id" integer,
	"role" varchar(20) NOT NULL,
	"file_name" varchar(255),
	"url" varchar(255) NOT NULL,
	"type" varchar(20) NOT NULL,
	"size" integer DEFAULT 0,
	"parsing_content" text,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "c_login_logs" ADD COLUMN "country" varchar(20);--> statement-breakpoint
ALTER TABLE "c_login_logs" ADD COLUMN "city" varchar(20);--> statement-breakpoint
ALTER TABLE "c_login_logs" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "c_login_logs" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "c_models" ADD COLUMN "canThinking" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "c_models" ADD COLUMN "canInputImage" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "c_models" ADD COLUMN "canOutputImage" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "c_models" ADD COLUMN "canInputVideo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "c_models" ADD COLUMN "canOutputVideo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "c_models" ADD COLUMN "canInputAudio" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "c_models" ADD COLUMN "canOutputAudio" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "c_messages" ADD COLUMN "prompt_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "c_messages" ADD COLUMN "completion_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "c_messages" ADD COLUMN "total_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "c_messages" ADD COLUMN "cached_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "c_message_attachments" ADD CONSTRAINT "c_message_attachments_message_id_c_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."c_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_message_attachments" ADD CONSTRAINT "c_message_attachments_user_id_c_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."c_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_message_attachments_user_id" ON "c_message_attachments" USING btree ("user_id","created_at");