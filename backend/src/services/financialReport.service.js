import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const financialReportService = {
  async create(villageId, data) {
    // Check for duplicate financial year
    const existing = await prisma.financialReport.findUnique({
      where: { villageId_financialYear: { villageId, financialYear: data.financialYear } },
    });
    if (existing) {
      throw new ApiError(409, `${data.financialYear} या आर्थिक वर्षाचा अहवाल आधीच अस्तित्वात आहे`);
    }

    return prisma.financialReport.create({
      data: {
        villageId,
        financialYear: data.financialYear,
        incomeAmount: parseFloat(data.incomeAmount),
        expenseAmount: parseFloat(data.expenseAmount),
        balanceAmount: parseFloat(data.balanceAmount),
        pdfUrl: data.pdfUrl || null,
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
      },
    });
  },

  async findAll(villageId) {
    return prisma.financialReport.findMany({
      where: { villageId },
      orderBy: { financialYear: 'desc' },
    });
  },

  async findAllPublic(villageId) {
    return prisma.financialReport.findMany({
      where: { villageId, isPublished: true },
      orderBy: { financialYear: 'desc' },
    });
  },

  async findById(villageId, id) {
    const report = await prisma.financialReport.findFirst({
      where: { id, villageId },
    });
    if (!report) throw new ApiError(404, 'Financial report not found');
    return report;
  },

  async update(villageId, id, data) {
    const existing = await prisma.financialReport.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Financial report not found');

    const updateData = {};
    if (data.financialYear !== undefined) updateData.financialYear = data.financialYear;
    if (data.incomeAmount !== undefined) updateData.incomeAmount = parseFloat(data.incomeAmount);
    if (data.expenseAmount !== undefined) updateData.expenseAmount = parseFloat(data.expenseAmount);
    if (data.balanceAmount !== undefined) updateData.balanceAmount = parseFloat(data.balanceAmount);
    if (data.pdfUrl !== undefined) updateData.pdfUrl = data.pdfUrl || null;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    return prisma.financialReport.update({
      where: { id },
      data: updateData,
    });
  },

  async remove(villageId, id) {
    const existing = await prisma.financialReport.findFirst({
      where: { id, villageId },
    });
    if (!existing) throw new ApiError(404, 'Financial report not found');

    await prisma.financialReport.delete({ where: { id } });
    return { deleted: true };
  },
};
