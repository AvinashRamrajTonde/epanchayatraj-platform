import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const noticeService = {
  async create(villageId, data) {
    const notice = await prisma.notice.create({
      data: {
        villageId,
        title: data.title,
        content: data.content,
        category: data.category || 'general',
        imageUrl: data.imageUrl || null,
        priority: data.priority || 'normal',
        isPopup: data.isPopup || false,
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
        publishedAt: data.isPublished !== false ? new Date() : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
    return notice;
  },

  async findAll(villageId, { page = 1, limit = 10, category = '', isPublished } = {}) {
    const skip = (page - 1) * limit;
    const where = { villageId };

    if (category) {
      where.category = category;
    }
    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notice.count({ where }),
    ]);

    return {
      notices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(villageId, id) {
    const notice = await prisma.notice.findFirst({
      where: { id, villageId },
    });
    if (!notice) throw new ApiError(404, 'Notice not found');
    return notice;
  },

  async update(villageId, id, data) {
    const existing = await prisma.notice.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Notice not found');

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.isPopup !== undefined) updateData.isPopup = data.isPopup;
    if (data.isPublished !== undefined) {
      updateData.isPublished = data.isPublished;
      if (data.isPublished && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const notice = await prisma.notice.update({
      where: { id },
      data: updateData,
    });
    return notice;
  },

  async remove(villageId, id) {
    const existing = await prisma.notice.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Notice not found');

    await prisma.notice.delete({ where: { id } });
    return { deleted: true };
  },
};
