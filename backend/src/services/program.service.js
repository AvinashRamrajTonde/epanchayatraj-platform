import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const programService = {
  async create(villageId, data) {
    const program = await prisma.program.create({
      data: {
        villageId,
        title: data.title,
        description: data.description || null,
        category: data.category || 'general',
        location: data.location || null,
        date: data.date ? new Date(data.date) : null,
        images: data.images || [],
        highlights: data.highlights || [],
        result: data.result || null,
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
      },
    });
    return program;
  },

  async findAll(villageId, { page = 1, limit = 10, category = '', isPublished } = {}) {
    const skip = (page - 1) * limit;
    const where = { villageId };

    if (category) where.category = category;
    if (isPublished !== undefined) where.isPublished = isPublished;

    const [programs, total] = await Promise.all([
      prisma.program.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.program.count({ where }),
    ]);

    return {
      programs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async findById(villageId, id) {
    const program = await prisma.program.findFirst({
      where: { id, villageId },
    });
    if (!program) throw new ApiError(404, 'Program not found');
    return program;
  },

  async update(villageId, id, data) {
    const existing = await prisma.program.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Program not found');

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.date !== undefined) updateData.date = data.date ? new Date(data.date) : null;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.highlights !== undefined) updateData.highlights = data.highlights;
    if (data.result !== undefined) updateData.result = data.result;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    const program = await prisma.program.update({
      where: { id },
      data: updateData,
    });
    return program;
  },

  async remove(villageId, id) {
    const existing = await prisma.program.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Program not found');

    await prisma.program.delete({ where: { id } });
    return { deleted: true };
  },
};
