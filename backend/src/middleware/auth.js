import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import prisma from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access token required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.accessSecret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, villageId: true },
    });

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    // ── Tenant ownership check (defense-in-depth) ──────────────────
    // A village-admin's token is only valid on their own village subdomain.
    // Superadmins are exempt so they can manage any village.
    if (req.tenantType === 'village' && req.tenant) {
      if (user.role !== 'SUPERADMIN' && user.villageId !== req.tenant.id) {
        throw new ApiError(403, 'Access denied: you do not belong to this village');
      }
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token expired'));
    }
    next(error);
  }
};
