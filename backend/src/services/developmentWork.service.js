import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const developmentWorkService = {
  async create(villageId, data) {
    return prisma.developmentWork.create({
      data: {
        villageId,
        schemeName: data.schemeName,
        workName: data.workName,
        financialYear: data.financialYear,
        sanctionedAmount: parseFloat(data.sanctionedAmount),
        expendedAmount: parseFloat(data.expendedAmount || 0),
        status: data.status || 'in_progress',
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
      },
    });
  },

  async findAll(villageId, query = {}) {
    const where = { villageId };
    if (query.financialYear) where.financialYear = query.financialYear;
    if (query.status) where.status = query.status;

    return prisma.developmentWork.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  },

  async findAllPublic(villageId, query = {}) {
    const where = { villageId, isPublished: true };
    if (query.financialYear) where.financialYear = query.financialYear;
    if (query.status) where.status = query.status;

    return prisma.developmentWork.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(villageId, id) {
    const work = await prisma.developmentWork.findFirst({
      where: { id, villageId },
    });
    if (!work) throw new ApiError(404, 'Development work not found');
    return work;
  },

  async update(villageId, id, data) {
    const existing = await prisma.developmentWork.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Development work not found');

    const updateData = {};
    if (data.schemeName !== undefined) updateData.schemeName = data.schemeName;
    if (data.workName !== undefined) updateData.workName = data.workName;
    if (data.financialYear !== undefined) updateData.financialYear = data.financialYear;
    if (data.sanctionedAmount !== undefined) updateData.sanctionedAmount = parseFloat(data.sanctionedAmount);
    if (data.expendedAmount !== undefined) updateData.expendedAmount = parseFloat(data.expendedAmount);
    if (data.status !== undefined) updateData.status = data.status;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    return prisma.developmentWork.update({
      where: { id },
      data: updateData,
    });
  },

  async remove(villageId, id) {
    const existing = await prisma.developmentWork.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Development work not found');

    await prisma.developmentWork.delete({ where: { id } });
    return { deleted: true };
  },
};
