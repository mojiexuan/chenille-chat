CREATE TYPE "gender" AS ENUM ('male', 'female', 'other');
CREATE TYPE "login_type" AS ENUM ('password', 'sms', 'wechat');
CREATE TYPE "login_status" AS ENUM ('success', 'fail');
CREATE TYPE "role" AS ENUM ('user', 'assistant', 'system');
CREATE TYPE "model_provider" AS ENUM ('openai', 'google', 'anthropic', 'deepseek');

CREATE TABLE "c_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"nickname" varchar(50) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20) NOT NULL,
	"password" varchar(255),
	"gender" "gender" DEFAULT 'other',
	"wx_openid" varchar(255),
	"avatar" text,
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
	"login_type" "login_type" NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"token" varchar(255),
	"status" "login_status" NOT NULL,
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
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "c_model_providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_provider" "model_provider" NOT NULL,
	"name" varchar(50) NOT NULL,
	"api_key" varchar(512) NOT NULL,
	"base_url" varchar(512),
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
	"role" "role" NOT NULL,
	"content" text NOT NULL,
	"meta" jsonb,
	"created_date" date DEFAULT CURRENT_DATE NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "c_login_logs" ADD CONSTRAINT "c_login_logs_user_id_c_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."c_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_models" ADD CONSTRAINT "c_models_provider_id_c_model_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."c_model_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_sessions" ADD CONSTRAINT "c_sessions_user_id_c_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."c_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_sessions" ADD CONSTRAINT "c_sessions_parent_id_c_sessions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."c_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_messages" ADD CONSTRAINT "c_messages_session_id_c_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."c_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c_messages" ADD CONSTRAINT "c_messages_parent_id_c_messages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."c_messages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_login_logs_user_id" ON "c_login_logs" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_login_logs_created_date" ON "c_login_logs" USING btree ("created_date");--> statement-breakpoint
CREATE INDEX "idx_sessions_user_id" ON "c_sessions" USING btree ("user_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_sessions_created_date" ON "c_sessions" USING btree ("created_date");--> statement-breakpoint
CREATE INDEX "idx_messages_session_id" ON "c_messages" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_messages_created_date" ON "c_messages" USING btree ("created_date");