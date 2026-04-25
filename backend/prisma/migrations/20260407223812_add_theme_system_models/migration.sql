-- AlterTable
ALTER TABLE "gallery_images" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'general';

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "back_content" JSONB,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'member';

-- AlterTable
ALTER TABLE "notices" ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "is_popup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'normal';

-- AlterTable
ALTER TABLE "villages" ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'classic';

-- CreateTable
CREATE TABLE "hero_slides" (
    "id" TEXT NOT NULL,
    "village_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "alt_text" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "village_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "location" TEXT,
    "date" TIMESTAMP(3),
    "images" JSONB,
    "highlights" JSONB,
    "result" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schemes" (
    "id" TEXT NOT NULL,
    "village_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'welfare',
    "benefits" JSONB,
    "eligibility" JSONB,
    "documents" JSONB,
    "application_process" JSONB,
    "contact_info" TEXT,
    "budget" TEXT,
    "beneficiaries" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schemes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL,
    "village_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hero_slides_village_id_idx" ON "hero_slides"("village_id");

-- CreateIndex
CREATE INDEX "programs_village_id_idx" ON "programs"("village_id");

-- CreateIndex
CREATE INDEX "programs_category_idx" ON "programs"("category");

-- CreateIndex
CREATE INDEX "schemes_village_id_idx" ON "schemes"("village_id");

-- CreateIndex
CREATE INDEX "schemes_category_idx" ON "schemes"("category");

-- CreateIndex
CREATE INDEX "contact_submissions_village_id_idx" ON "contact_submissions"("village_id");

-- CreateIndex
CREATE INDEX "contact_submissions_status_idx" ON "contact_submissions"("status");

-- CreateIndex
CREATE INDEX "gallery_images_category_idx" ON "gallery_images"("category");

-- CreateIndex
CREATE INDEX "members_type_idx" ON "members"("type");

-- AddForeignKey
ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schemes" ADD CONSTRAINT "schemes_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
