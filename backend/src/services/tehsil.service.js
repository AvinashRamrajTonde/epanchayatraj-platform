import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const tehsilService = {
  async create(data) {
    return prisma.tehsil.create({ data });
  },

  async findAll() {
    return prisma.tehsil.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { villages: true } } },
    });
  },

  async findById(id) {
    const tehsil = await prisma.tehsil.findUnique({
      where: { id },
      include: { _count: { select: { villages: true } } },
    });
    if (!tehsil) throw new ApiError(404, 'Tehsil not found');
    return tehsil;
  },

  async update(id, data) {
    // Ensure tehsil exists
    const existing = await prisma.tehsil.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, 'Tehsil not found');
    return prisma.tehsil.update({
      where: { id },
      data,
      include: { _count: { select: { villages: true } } },
    });
  },

  async delete(id) {
    const existing = await prisma.tehsil.findUnique({
      where: { id },
      include: { _count: { select: { villages: true } } },
    });
    if (!existing) throw new ApiError(404, 'Tehsil not found');
    if (existing._count.villages > 0) {
      throw new ApiError(400, `Cannot delete tehsil with ${existing._count.villages} linked village(s). Remove villages first.`);
    }
    await prisma.tehsil.delete({ where: { id } });
    return { id };
  },
};
