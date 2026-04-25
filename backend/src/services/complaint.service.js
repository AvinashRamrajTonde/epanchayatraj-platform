import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { sendComplaintNotification, getVillageAdminInfo } from './email.service.js';

export const complaintService = {
  async create(villageId, data) {
    const complaint = await prisma.complaint.create({
      data: {
        villageId,
        name: data.name,
        contact: data.contact,
        category: data.category,
        description: data.description,
        imageUrl: data.imageUrl || null,
        status: 'pending',
      },
    });

    // Notify GP admin (non-blocking)
    getVillageAdminInfo(villageId).then(({ adminEmail, villageName }) => {
      if (adminEmail) {
        const domain = process.env.PLATFORM_DOMAIN || 'localhost:5173';
        sendComplaintNotification({
          adminEmail,
          villageName,
          name: complaint.name,
          contact: complaint.contact,
          category: complaint.category,
          description: complaint.description,
          imageUrl: complaint.imageUrl,
          submittedAt: complaint.createdAt,
          dashboardUrl: `http://${domain}/admin/complaints`,
        }).catch((err) => console.error('[EMAIL] complaint notification failed:', err.message));
      }
    }).catch(() => {});

    return complaint;
  },

  async findAll(villageId, { page = 1, limit = 15, status = '', category = '', search = '' } = {}) {
    const skip = (Number(page) - 1) * Number(limit);
    const where = { villageId };

    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.complaint.count({ where }),
    ]);

    return {
      complaints,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    };
  },

  async findById(villageId, id) {
    const complaint = await prisma.complaint.findFirst({ where: { id, villageId } });
    if (!complaint) throw new ApiError(404, 'Complaint not found');
    return complaint;
  },

  async updateStatus(villageId, id, { status, response }) {
    const existing = await prisma.complaint.findFirst({ where: { id, villageId } });
    if (!existing) throw new ApiError(404, 'Complaint not found');

    const data = { status };
    if (response !== undefined) data.response = response;
    if (response || ['resolved', 'rejected'].includes(status)) {
      data.respondedAt = new Date();
    }

    return prisma.complaint.update({ where: { id }, data });
  },

  async remove(villageId, id) {
    const existing = await prisma.complaint.findFirst({ where: { id, villageId } });
    if (!existing) throw new ApiError(404, 'Complaint not found');
    await prisma.complaint.delete({ where: { id } });
    return { deleted: true };
  },

  async getStats(villageId) {
    const [total, pending, in_progress, resolved, rejected] = await Promise.all([
      prisma.complaint.count({ where: { villageId } }),
      prisma.complaint.count({ where: { villageId, status: 'pending' } }),
      prisma.complaint.count({ where: { villageId, status: 'in_progress' } }),
      prisma.complaint.count({ where: { villageId, status: 'resolved' } }),
      prisma.complaint.count({ where: { villageId, status: 'rejected' } }),
    ]);
    return { total, pending, in_progress, resolved, rejected };
  },
};
