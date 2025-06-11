CREATE TABLE "consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" text NOT NULL,
	"title" text NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"audio_blob" "bytea" NOT NULL
);
