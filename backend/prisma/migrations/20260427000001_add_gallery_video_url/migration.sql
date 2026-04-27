-- AlterTable: make image_url nullable and add video_url column
ALTER TABLE "gallery_images" ALTER COLUMN "image_url" DROP NOT NULL;
ALTER TABLE "gallery_images" ADD COLUMN "video_url" TEXT;
