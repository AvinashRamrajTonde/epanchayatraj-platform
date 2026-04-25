import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const applicationService = {
  async create(villageId, data) {
    const application = await prisma.application.create({
      data: {
        villageId,
        applicantName: data.applicantName,
        applicantPhone: data.applicantPhone,
        applicantEmail: data.applicantEmail || null,
        serviceType: data.serviceType,
        description: data.description || null,
        status: 'pending',
      },
    });
    return application;
  },

  async findAll(villageId, { page = 1, limit = 10, status = '', serviceType = '', search = '' } = {}) {
    const skip = (page - 1) * limit;
    const where = { villageId };

    if (status) {
      where.status = status;
    }
    if (serviceType) {
      where.serviceType = serviceType;
    }
    if (search) {
      where.OR = [
        { applicantName: { contains: search, mode: 'insensitive' } },
        { applicantPhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(villageId, id) {
    const application = await prisma.application.findFirst({
      where: { id, villageId },
    });
    if (!application) throw new ApiError(404, 'Application not found');
    return application;
  },

  async updateStatus(villageId, id, status, remarks) {
    const existing = await prisma.application.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Application not found');

    const updateData = { status };
    if (remarks !== undefined) updateData.remarks = remarks;
    if (['approved', 'rejected'].includes(status)) {
      updateData.processedAt = new Date();
    }

    const application = await prisma.application.update({
      where: { id },
      data: updateData,
    });
    return application;
  },

  async getStats(villageId) {
    const [total, pending, approved, rejected] = await Promise.all([
      prisma.application.count({ where: { villageId } }),
      prisma.application.count({ where: { villageId, status: 'pending' } }),
      prisma.application.count({ where: { villageId, status: 'approved' } }),
      prisma.application.count({ where: { villageId, status: 'rejected' } }),
    ]);
    return { total, pending, approved, rejected };
  },
};
