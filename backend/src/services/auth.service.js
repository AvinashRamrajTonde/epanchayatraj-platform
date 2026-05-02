import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const authService = {
  async login(email, password, tenant, tenantType) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ApiError(401, 'Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiError(401, 'Invalid credentials');

    // ── Tenant isolation: verify the user belongs to this tenant ──
    if (tenantType === 'village') {
      // Non-superadmin admins must belong to this specific village
      if (user.role !== 'SUPERADMIN') {
        if (!tenant || user.villageId !== tenant.id) {
          // Use the same error as wrong password to avoid user enumeration
          throw new ApiError(401, 'Invalid credentials');
        }
      }
    } else if (tenantType === 'superadmin') {
      // Only superadmins may log in through the superadmin portal
      if (user.role !== 'SUPERADMIN') {
        throw new ApiError(401, 'Invalid credentials');
      }
    }
    // tenantType === 'platform' or 'unknown' — no additional restriction here

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  },

  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) throw new ApiError(401, 'User not found');

      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        config.jwt.accessSecret,
        { expiresIn: config.jwt.accessExpiry }
      );

      return { accessToken };
    } catch (error) {
      throw new ApiError(401, 'Invalid refresh token');
    }
  },

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, villageId: true, createdAt: true },
    });
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  },
};
