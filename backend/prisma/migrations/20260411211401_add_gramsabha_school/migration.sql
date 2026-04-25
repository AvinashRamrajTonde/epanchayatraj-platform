-- CreateTable
CREATE TABLE "gramsabhas" (
    "id" TEXT NOT NULL,
    "village_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "location" TEXT,
    "agenda" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "attendees_total" INTEGER,
    "attendees_male" INTEGER,
    "attendees_female" INTEGER,
    "minutes" TEXT,
    "decisions" JSONB,
    "image_url" TEXT,
    "pdf_url" TEXT,
    "notice_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gramsabhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "village_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "principal_name" TEXT,
    "principal_photo" TEXT,
    "school_photo" TEXT,
    "boys_count" INTEGER NOT NULL DEFAULT 0,
    "girls_count" INTEGER NOT NULL DEFAULT 0,
    "teachers_count" INTEGER NOT NULL DEFAULT 0,
    "established_year" INTEGER,
    "phone" TEXT,
    "email" TEXT,
    "management_type" TEXT,
    "medium" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gramsabhas_village_id_idx" ON "gramsabhas"("village_id");

-- CreateIndex
CREATE INDEX "gramsabhas_date_idx" ON "gramsabhas"("date");

-- CreateIndex
CREATE INDEX "schools_village_id_idx" ON "schools"("village_id");

-- AddForeignKey
ALTER TABLE "gramsabhas" ADD CONSTRAINT "gramsabhas_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
