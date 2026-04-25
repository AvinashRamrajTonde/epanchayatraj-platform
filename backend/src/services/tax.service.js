import prisma from '../config/db.js';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';

// Auto-generate receipt number: TAX-YYYY-XXXXXX
function generateReceiptNo() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TAX-${year}-${rand}`;
}

export const taxService = {
  /** Public: submit a new tax payment request */
  async create(villageId, data) {
    const payment = await prisma.taxPayment.create({
      data: {
        villageId,
        name: data.name,
        contact: data.contact,
        address: data.address,
        taxType: data.taxType,
        amount: parseFloat(data.amount),
        year: data.year,
        utrNumber: data.utrNumber || null,
        screenshotUrl: data.screenshotUrl || null,
        paymentMethod: data.paymentMethod || 'upi',
        status: 'pending',
      },
    });
    return payment;
  },

  /** Admin: paginated list with filters */
  async findAll(villageId, { page = 1, limit = 20, status = '', taxType = '', search = '', year = '', from = '', to = '' } = {}) {
    const skip = (Number(page) - 1) * Number(limit);
    const where = { villageId };

    if (status) where.status = status;
    if (taxType) where.taxType = taxType;
    if (year) where.year = year;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { utrNumber: { contains: search, mode: 'insensitive' } },
        { receiptNo: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const [rows, total] = await Promise.all([
      prisma.taxPayment.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.taxPayment.count({ where }),
    ]);

    return { data: rows, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
  },

  /** Admin: single record */
  async findById(villageId, id) {
    const rec = await prisma.taxPayment.findFirst({ where: { id, villageId } });
    if (!rec) throw new ApiError(404, 'Tax payment not found');
    return rec;
  },

  /** Admin: verify / reject a payment */
  async updateStatus(villageId, id, { status, adminNote }) {
    const rec = await prisma.taxPayment.findFirst({ where: { id, villageId } });
    if (!rec) throw new ApiError(404, 'Tax payment not found');

    const upd = {
      status,
      adminNote: adminNote || rec.adminNote,
    };
    if (status === 'verified' && !rec.receiptNo) {
      upd.receiptNo = generateReceiptNo();
      upd.verifiedAt = new Date();
    }

    return prisma.taxPayment.update({ where: { id }, data: upd });
  },

  /** Admin: delete */
  async remove(villageId, id) {
    const rec = await prisma.taxPayment.findFirst({ where: { id, villageId } });
    if (!rec) throw new ApiError(404, 'Tax payment not found');
    await prisma.taxPayment.delete({ where: { id } });
    return { success: true };
  },

  /** Admin: stats + collection summary */
  async getStats(villageId, { from = '', to = '', year = '' } = {}) {
    const where = { villageId };
    if (year) where.year = year;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const [all, verified, pending, rejected, houseVerified, waterVerified, otherVerified] = await Promise.all([
      prisma.taxPayment.aggregate({ where, _count: { id: true }, _sum: { amount: true } }),
      prisma.taxPayment.aggregate({ where: { ...where, status: 'verified' }, _count: { id: true }, _sum: { amount: true } }),
      prisma.taxPayment.aggregate({ where: { ...where, status: 'pending' }, _count: { id: true }, _sum: { amount: true } }),
      prisma.taxPayment.aggregate({ where: { ...where, status: 'rejected' }, _count: { id: true }, _sum: { amount: true } }),
      prisma.taxPayment.aggregate({ where: { ...where, status: 'verified', taxType: 'house' }, _count: { id: true }, _sum: { amount: true } }),
      prisma.taxPayment.aggregate({ where: { ...where, status: 'verified', taxType: 'water' }, _count: { id: true }, _sum: { amount: true } }),
      prisma.taxPayment.aggregate({ where: { ...where, status: 'verified', taxType: 'other' }, _count: { id: true }, _sum: { amount: true } }),
    ]);

    // Monthly breakdown
    const monthlyRaw = await prisma.$queryRaw`
      SELECT
        to_char(created_at, 'YYYY-MM') AS month,
        tax_type,
        COUNT(*)::int AS count,
        SUM(amount) AS total
      FROM tax_payments
      WHERE village_id = ${villageId}
        AND status = 'verified'
        ${from ? Prisma.sql`AND created_at >= ${new Date(from)}` : Prisma.empty}
        ${to ? Prisma.sql`AND created_at <= ${new Date(to + 'T23:59:59')}` : Prisma.empty}
      GROUP BY month, tax_type
      ORDER BY month DESC
      LIMIT 24
    `;

    return {
      all: { count: all._count.id, amount: all._sum.amount || 0 },
      verified: { count: verified._count.id, amount: verified._sum.amount || 0 },
      pending: { count: pending._count.id, amount: pending._sum.amount || 0 },
      rejected: { count: rejected._count.id, amount: rejected._sum.amount || 0 },
      byType: {
        house: { count: houseVerified._count.id, amount: houseVerified._sum.amount || 0 },
        water: { count: waterVerified._count.id, amount: waterVerified._sum.amount || 0 },
        other: { count: otherVerified._count.id, amount: otherVerified._sum.amount || 0 },
      },
      monthly: monthlyRaw,
    };
  },

  /** Admin: list of available years from DB */
  async getYears(villageId) {
    const rows = await prisma.taxPayment.findMany({
      where: { villageId },
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' },
    });
    return rows.map((r) => r.year);
  },
};
