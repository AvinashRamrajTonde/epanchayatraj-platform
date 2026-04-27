import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const galleryService = {
  async create(villageId, data) {
    const image = await prisma.galleryImage.create({
      data: {
        villageId,
        title: data.title || null,
        imageUrl: data.imageUrl || null,
        videoUrl: data.videoUrl || null,
        caption: data.caption || null,
        category: data.category || 'general',
        sortOrder: data.sortOrder || 0,
      },
    });
    return image;
  },

  async findAll(villageId) {
    const images = await prisma.galleryImage.findMany({
      where: { villageId },
      orderBy: { sortOrder: 'asc' },
    });
    return images;
  },

  async remove(villageId, id) {
    const existing = await prisma.galleryImage.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Gallery image not found');

    await prisma.galleryImage.delete({ where: { id } });
    return { deleted: true };
  },
};
