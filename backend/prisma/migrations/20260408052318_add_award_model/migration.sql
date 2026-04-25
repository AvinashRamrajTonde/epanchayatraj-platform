-- CreateTable
CREATE TABLE "awards" (
    "id" TEXT NOT NULL,
    "village_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "year" INTEGER,
    "category" TEXT NOT NULL DEFAULT 'general',
    "awarded_by" TEXT,
    "image_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "awards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "awards_village_id_idx" ON "awards"("village_id");

-- CreateIndex
CREATE INDEX "awards_category_idx" ON "awards"("category");

-- AddForeignKey
ALTER TABLE "awards" ADD CONSTRAINT "awards_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
