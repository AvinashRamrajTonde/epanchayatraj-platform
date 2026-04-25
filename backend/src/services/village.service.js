import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { sendWelcomeEmail } from './email.service.js';

export const villageService = {
  async create(data) {
    // Duplicate checks before transaction
    const slug = data.slug;
    const subdomain = data.subdomain || data.slug;
    const customDomain = data.customDomain || null;

    const [slugExists, subdomainExists, customDomainExists] = await Promise.all([
      prisma.village.findUnique({ where: { slug } }),
      prisma.village.findUnique({ where: { subdomain } }),
      customDomain ? prisma.village.findFirst({ where: { customDomain } }) : Promise.resolve(null),
    ]);

    if (slugExists) throw new ApiError(409, `Slug '${slug}' आधीच वापरात आहे.`);
    if (subdomainExists) throw new ApiError(409, `Subdomain '${subdomain}' आधीच वापरात आहे.`);
    if (customDomainExists) throw new ApiError(409, `Custom domain '${customDomain}' आधीच वापरात आहे.`);

    return prisma.$transaction(async (tx) => {
      const village = await tx.village.create({
        data: {
          name: data.name,
          slug,
          subdomain,
          customDomain,
          tehsilId: data.tehsilId,
          settings: data.settings || {},
          status: 'active',
        },
        include: { tehsil: true },
      });

      let adminUser = null;
      if (data.adminEmail && data.adminName && data.adminPassword) {
        const hashedPassword = await bcrypt.hash(data.adminPassword, 12);
        adminUser = await tx.user.create({
          data: {
            email: data.adminEmail,
            password: hashedPassword,
            name: data.adminName,
            role: 'admin',
            villageId: village.id,
          },
        });
        const { password: _, ...adminWithoutPassword } = adminUser;
        adminUser = adminWithoutPassword;
      }

      return { village, adminUser };
    });

    // Send welcome email (outside transaction, non-blocking)
    if (result.adminUser && data.adminEmail) {
      const subdomain = result.village.subdomain;
      const loginUrl = `http://${subdomain}.${process.env.PLATFORM_DOMAIN || 'gpmh.local'}:5173/signin`;
      sendWelcomeEmail({
        adminEmail: data.adminEmail,
        adminName: data.adminName,
        villageName: result.village.name,
        loginUrl,
        defaultPassword: data.adminPassword,
      }).catch(err => console.error('[WELCOME EMAIL]', err.message));
    }

    return result;
  },

  async findAll({ page = 1, limit = 10, search = '', status = '' }) {
    const skip = (page - 1) * limit;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [villages, total] = await Promise.all([
      prisma.village.findMany({
        where,
        include: { tehsil: true, _count: { select: { users: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.village.count({ where }),
    ]);

    return {
      villages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id) {
    const village = await prisma.village.findUnique({
      where: { id },
      include: { tehsil: true, _count: { select: { users: true } } },
    });
    if (!village) throw new ApiError(404, 'Village not found');
    return village;
  },

  async update(id, data) {
    const updateData = { ...data };

    // Auto-sync subdomain with slug ONLY if subdomain was NOT explicitly provided
    // and slug is being changed. Once subdomain is set independently, slug changes
    // won't overwrite it.
    if (data.slug && !('subdomain' in data)) {
      // Check current village subdomain vs slug to decide if we should sync
      const current = await prisma.village.findUnique({ where: { id }, select: { slug: true, subdomain: true } });
      if (current && current.subdomain === current.slug) {
        // subdomain still mirrors slug (never independently set) — keep syncing
        updateData.subdomain = data.slug;
      }
      // else: subdomain was independently set at some point — leave it untouched
    }

    // Clear customDomain if explicitly passed as empty string or null
    if ('customDomain' in data && (data.customDomain === '' || data.customDomain === undefined)) {
      updateData.customDomain = null;
    }

    const village = await prisma.village.update({
      where: { id },
      data: updateData,
      include: { tehsil: true },
    });
    return village;
  },

  async updateStatus(id, status) {
    const village = await prisma.village.update({
      where: { id },
      data: { status },
      include: { tehsil: true },
    });
    return village;
  },

  async getStats() {
    const [total, active, inactive] = await Promise.all([
      prisma.village.count(),
      prisma.village.count({ where: { status: 'active' } }),
      prisma.village.count({ where: { status: 'inactive' } }),
    ]);
    return { total, active, inactive };
  },

  async delete(id) {
    const village = await prisma.village.findUnique({ where: { id } });
    if (!village) throw new ApiError(404, 'Village not found');

    // Delete all related records in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.school.deleteMany({ where: { villageId: id } });
      await tx.gramsabha.deleteMany({ where: { villageId: id } });
      await tx.financialReport.deleteMany({ where: { villageId: id } });
      await tx.award.deleteMany({ where: { villageId: id } });
      await tx.contactSubmission.deleteMany({ where: { villageId: id } });
      await tx.scheme.deleteMany({ where: { villageId: id } });
      await tx.program.deleteMany({ where: { villageId: id } });
      await tx.heroSlide.deleteMany({ where: { villageId: id } });
      await tx.application.deleteMany({ where: { villageId: id } });
      await tx.villageContent.deleteMany({ where: { villageId: id } });
      await tx.galleryImage.deleteMany({ where: { villageId: id } });
      await tx.notice.deleteMany({ where: { villageId: id } });
      await tx.member.deleteMany({ where: { villageId: id } });
      await tx.user.deleteMany({ where: { villageId: id } });
      await tx.village.delete({ where: { id } });
    });

    return { message: 'Village and all related data deleted' };
  },
};
