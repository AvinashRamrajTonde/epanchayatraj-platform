import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { sendContactFormNotification, getVillageAdminInfo } from './email.service.js';

export const contactSubmissionService = {
  async create(villageId, data) {
    const submission = await prisma.contactSubmission.create({
      data: {
        villageId,
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        subject: data.subject || null,
        message: data.message,
      },
    });

    // Notify GP admin (non-blocking)
    getVillageAdminInfo(villageId).then(({ adminEmail, villageName }) => {
      if (adminEmail) {
        sendContactFormNotification({
          adminEmail,
          villageName,
          name: submission.name,
          phone: submission.phone,
          email: submission.email,
          subject: submission.subject,
          message: submission.message,
          submittedAt: submission.createdAt,
        }).catch((err) => console.error('[EMAIL] contact form notification failed:', err.message));
      }
    }).catch(() => {});

    return submission;
  },

  async findAll(villageId, { page = 1, limit = 10, status = '' } = {}) {
    const skip = (page - 1) * limit;
    const where = { villageId };

    if (status) where.status = status;

    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contactSubmission.count({ where }),
    ]);

    return {
      submissions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async updateStatus(villageId, id, status) {
    const existing = await prisma.contactSubmission.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Contact submission not found');

    const submission = await prisma.contactSubmission.update({
      where: { id },
      data: { status },
    });
    return submission;
  },

  async remove(villageId, id) {
    const existing = await prisma.contactSubmission.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Contact submission not found');

    await prisma.contactSubmission.delete({ where: { id } });
    return { deleted: true };
  },
};
