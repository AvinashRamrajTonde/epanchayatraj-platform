import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const awardService = {
  async create(villageId, data) {
    const award = await prisma.award.create({
      data: {
        villageId,
        title: data.title,
        description: data.description || null,
        year: data.year ? parseInt(data.year) : null,
        category: data.category || 'general',
        awardedBy: data.awardedBy || null,
        imageUrl: data.imageUrl || null,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    return award;
  },

  async findAll(villageId, { page = 1, limit = 10, category = '', isActive } = {}) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { villageId };

    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive;

    const [awards, total] = await Promise.all([
      prisma.award.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { year: 'desc' }],
        skip,
        take: parseInt(limit),
      }),
      prisma.award.count({ where }),
    ]);

    return {
      awards,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
    };
  },

  async findAllPublic(villageId) {
    const awards = await prisma.award.findMany({
      where: { villageId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { year: 'desc' }],
    });
    return awards;
  },

  async findById(villageId, id) {
    const award = await prisma.award.findFirst({
      where: { id, villageId },
    });
    if (!award) throw new ApiError(404, 'Award not found');
    return award;
  },

  async update(villageId, id, data) {
    const existing = await prisma.award.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Award not found');

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.year !== undefined) updateData.year = data.year ? parseInt(data.year) : null;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.awardedBy !== undefined) updateData.awardedBy = data.awardedBy;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const award = await prisma.award.update({
      where: { id },
      data: updateData,
    });
    return award;
  },

  async remove(villageId, id) {
    const existing = await prisma.award.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Award not found');

    await prisma.award.delete({ where: { id } });
    return { deleted: true };
  },
};
