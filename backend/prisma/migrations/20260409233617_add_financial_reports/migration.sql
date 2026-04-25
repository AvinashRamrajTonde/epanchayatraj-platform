-- CreateTable
CREATE TABLE "financial_reports" (
    "id" TEXT NOT NULL,
    "village_id" TEXT NOT NULL,
    "financial_year" TEXT NOT NULL,
    "income_amount" DOUBLE PRECISION NOT NULL,
    "expense_amount" DOUBLE PRECISION NOT NULL,
    "balance_amount" DOUBLE PRECISION NOT NULL,
    "pdf_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "financial_reports_village_id_idx" ON "financial_reports"("village_id");

-- CreateIndex
CREATE UNIQUE INDEX "financial_reports_village_id_financial_year_key" ON "financial_reports"("village_id", "financial_year");

-- AddForeignKey
ALTER TABLE "financial_reports" ADD CONSTRAINT "financial_reports_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
