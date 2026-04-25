import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function fixBrokenImages() {
  // Check members
  const members = await prisma.member.findMany({
    where: { photoUrl: { not: null } },
    select: { id: true, name: true, photoUrl: true },
  });

  let fixed = 0;
  for (const m of members) {
    if (!m.photoUrl) continue;
    const fp = path.join(__dirname, '..', m.photoUrl.replace(/^\//, ''));
    if (!fs.existsSync(fp)) {
      console.log(`BROKEN: member "${m.name}" → ${m.photoUrl}`);
      await prisma.member.update({
        where: { id: m.id },
        data: { photoUrl: null },
      });
      console.log(`  → Set photoUrl to null`);
      fixed++;
    }
  }

  // Check hero slides
  const slides = await prisma.heroSlide.findMany({
    select: { id: true, imageUrl: true, altText: true },
  });
  for (const s of slides) {
    if (!s.imageUrl) continue;
    const fp = path.join(__dirname, '..', s.imageUrl.replace(/^\//, ''));
    if (!fs.existsSync(fp)) {
      console.log(`BROKEN: heroSlide "${s.altText || s.id}" → ${s.imageUrl}`);
      fixed++;
    }
  }

  // Check gallery images
  const images = await prisma.galleryImage.findMany({
    select: { id: true, imageUrl: true, caption: true },
  });
  for (const img of images) {
    for (const field of ['imageUrl']) {
      const url = img[field];
      if (!url) continue;
      const fp = path.join(__dirname, '..', url.replace(/^\//, ''));
      if (!fs.existsSync(fp)) {
        console.log(`BROKEN: galleryImage "${img.caption || img.id}" ${field} → ${url}`);
        fixed++;
      }
    }
  }

  console.log(`\nTotal broken references found/fixed: ${fixed}`);
  await prisma.$disconnect();
}

fixBrokenImages().catch(console.error);
