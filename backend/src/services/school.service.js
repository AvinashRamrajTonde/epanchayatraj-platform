import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const schoolService = {
  async create(villageId, data) {
    const school = await prisma.school.create({
      data: {
        villageId,
        name: data.name,
        address: data.address || null,
        principalName: data.principalName || null,
        principalPhoto: data.principalPhoto || null,
        schoolPhoto: data.schoolPhoto || null,
        boysCount: data.boysCount ? parseInt(data.boysCount) : 0,
        girlsCount: data.girlsCount ? parseInt(data.girlsCount) : 0,
        teachersCount: data.teachersCount ? parseInt(data.teachersCount) : 0,
        establishedYear: data.establishedYear ? parseInt(data.establishedYear) : null,
        phone: data.phone || null,
        email: data.email || null,
        managementType: data.managementType || null,
        medium: data.medium || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    return school;
  },

  async findAll(villageId) {
    const schools = await prisma.school.findMany({
      where: { villageId },
      orderBy: { createdAt: 'desc' },
    });
    return schools;
  },

  async findAllPublic(villageId) {
    const schools = await prisma.school.findMany({
      where: { villageId, isActive: true },
      orderBy: { name: 'asc' },
    });
    return schools;
  },

  async findById(villageId, id) {
    const school = await prisma.school.findFirst({
      where: { id, villageId },
    });
    if (!school) throw new ApiError(404, 'School not found');
    return school;
  },

  async update(villageId, id, data) {
    const existing = await prisma.school.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'School not found');

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.principalName !== undefined) updateData.principalName = data.principalName;
    if (data.principalPhoto !== undefined) updateData.principalPhoto = data.principalPhoto;
    if (data.schoolPhoto !== undefined) updateData.schoolPhoto = data.schoolPhoto;
    if (data.boysCount !== undefined) updateData.boysCount = parseInt(data.boysCount);
    if (data.girlsCount !== undefined) updateData.girlsCount = parseInt(data.girlsCount);
    if (data.teachersCount !== undefined) updateData.teachersCount = parseInt(data.teachersCount);
    if (data.establishedYear !== undefined) updateData.establishedYear = data.establishedYear ? parseInt(data.establishedYear) : null;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.managementType !== undefined) updateData.managementType = data.managementType;
    if (data.medium !== undefined) updateData.medium = data.medium;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const school = await prisma.school.update({
      where: { id },
      data: updateData,
    });
    return school;
  },

  async remove(villageId, id) {
    const existing = await prisma.school.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'School not found');
    await prisma.school.delete({ where: { id } });
    return { deleted: true };
  },
};
