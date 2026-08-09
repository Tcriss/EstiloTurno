CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" varchar(20) NOT NULL,
	"service_id" integer NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"duration_minutes" integer NOT NULL,
	CONSTRAINT "business_services_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_states" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"state" varchar(50) DEFAULT 'START' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(150) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'EMPLOYEE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_business_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."business_services"("id") ON DELETE cascade ON UPDATE no action;