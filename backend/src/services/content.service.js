import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const contentService = {
  async upsert(villageId, section, content) {
    const result = await prisma.villageContent.upsert({
      where: {
        villageId_section: { villageId, section },
      },
      update: { content },
      create: { villageId, section, content },
    });
    return result;
  },

  async findBySection(villageId, section) {
    const content = await prisma.villageContent.findUnique({
      where: {
        villageId_section: { villageId, section },
      },
    });
    return content;
  },

  async findAll(villageId) {
    const contents = await prisma.villageContent.findMany({
      where: { villageId },
    });
    return contents;
  },
};
