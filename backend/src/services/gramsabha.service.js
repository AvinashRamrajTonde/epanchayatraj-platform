import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const gramsabhaService = {
  async create(villageId, data) {
    // Create gramsabha + auto-create notice
    return prisma.$transaction(async (tx) => {
      let noticeId = null;

      if (data.status === 'scheduled' || !data.status) {
        const gramsabhaDate = new Date(data.date);
        const notice = await tx.notice.create({
          data: {
            villageId,
            title: `ग्रामसभा बैठक — ${data.title}`,
            content: [
              `दिनांक: ${gramsabhaDate.toLocaleDateString('mr-IN')}`,
              data.time ? `वेळ: ${data.time}` : '',
              data.location ? `स्थळ: ${data.location}` : '',
              data.agenda ? `कार्यसूची: ${data.agenda}` : '',
            ].filter(Boolean).join('\n'),
            category: 'meeting',
            priority: 'high',
            isPublished: true,
            expiresAt: gramsabhaDate,
          },
        });
        noticeId = notice.id;
      }

      const gramsabha = await tx.gramsabha.create({
        data: {
          villageId,
          title: data.title,
          date: new Date(data.date),
          time: data.time || null,
          location: data.location || null,
          agenda: data.agenda || null,
          status: data.status || 'scheduled',
          noticeId,
        },
      });

      return gramsabha;
    });
  },

  async findAll(villageId, { page = 1, limit = 10, status = '' } = {}) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { villageId };
    if (status) where.status = status;

    const [gramsabhas, total] = await Promise.all([
      prisma.gramsabha.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.gramsabha.count({ where }),
    ]);

    return {
      gramsabhas,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
    };
  },

  async findAllPublic(villageId) {
    const gramsabhas = await prisma.gramsabha.findMany({
      where: { villageId },
      orderBy: { date: 'desc' },
    });
    return gramsabhas;
  },

  async findById(villageId, id) {
    const gramsabha = await prisma.gramsabha.findFirst({
      where: { id, villageId },
    });
    if (!gramsabha) throw new ApiError(404, 'Gramsabha not found');
    return gramsabha;
  },

  async update(villageId, id, data) {
    const existing = await prisma.gramsabha.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Gramsabha not found');

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.time !== undefined) updateData.time = data.time;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.agenda !== undefined) updateData.agenda = data.agenda;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.attendeesTotal !== undefined) updateData.attendeesTotal = parseInt(data.attendeesTotal);
    if (data.attendeesMale !== undefined) updateData.attendeesMale = parseInt(data.attendeesMale);
    if (data.attendeesFemale !== undefined) updateData.attendeesFemale = parseInt(data.attendeesFemale);
    if (data.minutes !== undefined) updateData.minutes = data.minutes;
    if (data.decisions !== undefined) updateData.decisions = data.decisions;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.pdfUrl !== undefined) updateData.pdfUrl = data.pdfUrl;

    return prisma.$transaction(async (tx) => {
      // If marking as completed or cancelled, expire linked notice
      if (data.status === 'completed' || data.status === 'cancelled') {
        if (existing.noticeId) {
          try {
            await tx.notice.update({
              where: { id: existing.noticeId },
              data: { expiresAt: new Date(), isPublished: false },
            });
          } catch {
            // Notice may already be deleted
          }
        }
      }

      const gramsabha = await tx.gramsabha.update({
        where: { id },
        data: updateData,
      });
      return gramsabha;
    });
  },

  async remove(villageId, id) {
    const existing = await prisma.gramsabha.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Gramsabha not found');

    return prisma.$transaction(async (tx) => {
      // Delete linked notice
      if (existing.noticeId) {
        try {
          await tx.notice.delete({ where: { id: existing.noticeId } });
        } catch {
          // Notice may already be deleted
        }
      }
      await tx.gramsabha.delete({ where: { id } });
      return { deleted: true };
    });
  },
};
