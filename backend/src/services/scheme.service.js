import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const schemeService = {
  async create(villageId, data) {
    const scheme = await prisma.scheme.create({
      data: {
        villageId,
        title: data.title,
        description: data.description || null,
        category: data.category || 'welfare',
        benefits: data.benefits || [],
        eligibility: data.eligibility || [],
        documents: data.documents || [],
        applicationProcess: data.applicationProcess || [],
        contactInfo: data.contactInfo || null,
        budget: data.budget || null,
        beneficiaries: data.beneficiaries || null,
        imageUrl: data.imageUrl || null,
        schemeLink: data.schemeLink || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    return scheme;
  },

  async findAll(villageId, { page = 1, limit = 10, category = '', isActive } = {}) {
    const skip = (page - 1) * limit;
    const where = { villageId };

    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive;

    const [schemes, total] = await Promise.all([
      prisma.scheme.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.scheme.count({ where }),
    ]);

    return {
      schemes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async findById(villageId, id) {
    const scheme = await prisma.scheme.findFirst({
      where: { id, villageId },
    });
    if (!scheme) throw new ApiError(404, 'Scheme not found');
    return scheme;
  },

  async update(villageId, id, data) {
    const existing = await prisma.scheme.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Scheme not found');

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.benefits !== undefined) updateData.benefits = data.benefits;
    if (data.eligibility !== undefined) updateData.eligibility = data.eligibility;
    if (data.documents !== undefined) updateData.documents = data.documents;
    if (data.applicationProcess !== undefined) updateData.applicationProcess = data.applicationProcess;
    if (data.contactInfo !== undefined) updateData.contactInfo = data.contactInfo;
    if (data.budget !== undefined) updateData.budget = data.budget;
    if (data.beneficiaries !== undefined) updateData.beneficiaries = data.beneficiaries;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.schemeLink !== undefined) updateData.schemeLink = data.schemeLink;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const scheme = await prisma.scheme.update({
      where: { id },
      data: updateData,
    });
    return scheme;
  },

  async remove(villageId, id) {
    const existing = await prisma.scheme.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Scheme not found');

    await prisma.scheme.delete({ where: { id } });
    return { deleted: true };
  },
};
