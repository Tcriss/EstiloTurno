CREATE TABLE "businesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"whatsapp_phone_number_id" varchar(30),
	"work_start_minutes" integer DEFAULT 540 NOT NULL,
	"work_end_minutes" integer DEFAULT 1080 NOT NULL,
	"slot_interval_minutes" integer DEFAULT 30 NOT NULL,
	"bot_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_whatsapp_phone_number_id_unique" UNIQUE("whatsapp_phone_number_id")
);
--> statement-breakpoint
ALTER TABLE "business_services" DROP CONSTRAINT "business_services_name_unique";--> statement-breakpoint
ALTER TABLE "conversation_states" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "business_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "business_services" ADD COLUMN "business_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "conversation_states" ADD COLUMN "phone" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "conversation_states" ADD COLUMN "business_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "business_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_services" ADD CONSTRAINT "business_services_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_states" ADD CONSTRAINT "conversation_states_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_services" ADD CONSTRAINT "business_services_business_name_unique" UNIQUE("business_id","name");--> statement-breakpoint
ALTER TABLE "conversation_states" ADD CONSTRAINT "conversation_states_phone_business_unique" UNIQUE("phone","business_id");