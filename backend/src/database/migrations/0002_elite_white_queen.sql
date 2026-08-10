CREATE TABLE "business_calendar_credentials" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"provider" varchar(20) DEFAULT 'google' NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"token_expiry_date" timestamp NOT NULL,
	"scope" varchar(255) NOT NULL,
	"connected_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "business_calendar_credentials_business_id_unique" UNIQUE("business_id")
);
--> statement-breakpoint
ALTER TABLE "business_calendar_credentials" ADD CONSTRAINT "business_calendar_credentials_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;