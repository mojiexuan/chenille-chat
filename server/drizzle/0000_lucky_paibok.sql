CREATE TABLE "c_agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"key" varchar(100) NOT NULL,
	"description" text,
	"model_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "c_agents_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "c_ai_token_usages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"session_id" integer,
	"message_id" integer,
	"prompt_tokens" integer DEFAULT 0 NOT NULL,
	"completion_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"cached_tokens" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "c_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"nickname" varchar(50) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20) NOT NULL,
	"password" varchar(255),
	"gender" varchar(10) DEFAULT 'other',
	"wx_openid" varchar(255),
	"avatar" text,
	"role" varchar(20) DEFAULT 'user',
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "c_users_username_unique" UNIQUE("username"),
	CONSTRAINT "c_users_email_unique" UNIQUE("email"),
	CONSTRAINT "c_users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "c_users_wx_openid_unique" UNIQUE("wx_openid")
);
--> statement-breakpoint
CREATE TABLE "c_login_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"login_type" varchar(20) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"country" varchar(20),
	"city" varchar(20),
	"latitude" double precision,
	"longitude" double precision,
	"token" varchar(255),
	"status" varchar(20) NOT NULL,
	"fail_reason" varchar(255),
	"created_date" date DEFAULT CURRENT_DATE NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "c_models" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"model_name" varchar(100) NOT NULL,
	"description" text,
	"reasoning_effort" varchar(24) DEFAULT 'high' NOT NULL,
	"canInputImage" boolean DEFAULT false NOT NULL,
	"canOutputImage" boolean DEFAULT false NOT NULL,
	"canInputVideo" boolean DEFAULT false NOT NULL,
	"canOutputVideo" boolean DEFAULT false NOT NULL,
	"canInputAudio" boolean DEFAULT false NOT NULL,
	"canOutputAudio" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "c_model_providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_provider" varchar(20) DEFAULT 'openai' NOT NULL,
	"name" varchar(50) NOT NULL,
	"api_key" varchar(512) NOT NULL,
	"base_url" varchar(512) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "c_model_providers_model_provider_unique" UNIQUE("model_provider")
);
--> statement-breakpoint
CREATE TABLE "c_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"parent_id" integer,
	"title" varchar(255),
	"created_date" date DEFAULT CURRENT_DATE NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "c_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"parent_id" integer,
	"role" varchar(20) NOT NULL,
	"reasoning" text,
	"content" text NOT NULL,
	"prompt_tokens" integer DEFAULT 0 NOT NULL,
	"completion_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"cached_tokens" integer DEFAULT 0 NOT NULL,
	"meta" jsonb,
	"created_date" date DEFAULT CURRENT_DATE NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
ALTER TABLE "c_agents" ADD CONSTRAINT "c_agents_model_id_c_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."c_models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_ai_token_usages" ADD CONSTRAINT "c_ai_token_usages_user_id_c_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."c_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_ai_token_usages" ADD CONSTRAINT "c_ai_token_usages_session_id_c_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."c_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_ai_token_usages" ADD CONSTRAINT "c_ai_token_usages_message_id_c_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."c_messages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_login_logs" ADD CONSTRAINT "c_login_logs_user_id_c_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."c_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_models" ADD CONSTRAINT "c_models_provider_id_c_model_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."c_model_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_sessions" ADD CONSTRAINT "c_sessions_user_id_c_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."c_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_sessions" ADD CONSTRAINT "c_sessions_parent_id_c_sessions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."c_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_messages" ADD CONSTRAINT "c_messages_session_id_c_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."c_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_messages" ADD CONSTRAINT "c_messages_parent_id_c_messages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."c_messages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_message_attachments" ADD CONSTRAINT "c_message_attachments_message_id_c_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."c_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_message_attachments" ADD CONSTRAINT "c_message_attachments_user_id_c_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."c_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_login_logs_user_id" ON "c_login_logs" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_login_logs_created_date" ON "c_login_logs" USING btree ("created_date");--> statement-breakpoint
CREATE INDEX "idx_sessions_user_id" ON "c_sessions" USING btree ("user_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_sessions_created_date" ON "c_sessions" USING btree ("created_date");--> statement-breakpoint
CREATE INDEX "idx_messages_session_id" ON "c_messages" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_messages_created_date" ON "c_messages" USING btree ("created_date");--> statement-breakpoint
CREATE INDEX "idx_message_attachments_user_id" ON "c_message_attachments" USING btree ("user_id","created_at");