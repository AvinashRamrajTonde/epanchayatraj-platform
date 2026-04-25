-- AlterTable: Add PDF generation timestamp fields
ALTER TABLE "certificate_applications" ADD COLUMN IF NOT EXISTS "pdf_generated_at" TIMESTAMP(3);
ALTER TABLE "certificate_payments" ADD COLUMN IF NOT EXISTS "receipt_generated_at" TIMESTAMP(3);
