CREATE TABLE "invoice_seq" (
	"period" text PRIMARY KEY NOT NULL,
	"last_seq" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "invoice_code" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_invoice_code_unique" ON "transactions" USING btree ("invoice_code");