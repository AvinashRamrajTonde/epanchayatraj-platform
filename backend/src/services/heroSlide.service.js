import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const heroSlideService = {
  async create(villageId, data) {
    const slide = await prisma.heroSlide.create({
      data: {
        villageId,
        imageUrl: data.imageUrl,
        altText: data.altText || null,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    return slide;
  },

  async findAll(villageId, { activeOnly = false } = {}) {
    const where = { villageId };
    if (activeOnly) where.isActive = true;

    const slides = await prisma.heroSlide.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
    return slides;
  },

  async update(villageId, id, data) {
    const existing = await prisma.heroSlide.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Hero slide not found');

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: {
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.altText !== undefined && { altText: data.altText }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    return slide;
  },

  async remove(villageId, id) {
    const existing = await prisma.heroSlide.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Hero slide not found');

    await prisma.heroSlide.delete({ where: { id } });
    return { deleted: true };
  },
};
