import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const memberService = {
  async create(villageId, data) {
    const member = await prisma.member.create({
      data: {
        villageId,
        name: data.name,
        designation: data.designation,
        type: data.type || 'member',
        phone: data.phone || null,
        email: data.email || null,
        photoUrl: data.photoUrl || null,
        bio: data.bio || null,
        backContent: data.backContent || null,
        sortOrder: data.sortOrder || 0,
      },
    });
    return member;
  },

  async findAll(villageId) {
    const members = await prisma.member.findMany({
      where: { villageId },
      orderBy: { sortOrder: 'asc' },
    });
    return members;
  },

  async findById(villageId, id) {
    const member = await prisma.member.findFirst({
      where: { id, villageId },
    });
    if (!member) throw new ApiError(404, 'Member not found');
    return member;
  },

  async update(villageId, id, data) {
    // Ensure member belongs to village
    const existing = await prisma.member.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Member not found');

    const member = await prisma.member.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.designation !== undefined && { designation: data.designation }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.backContent !== undefined && { backContent: data.backContent }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    return member;
  },

  async remove(villageId, id) {
    const existing = await prisma.member.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Member not found');

    await prisma.member.delete({ where: { id } });
    return { deleted: true };
  },
};
