import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import prisma from '../config/db.js';

/**
 * Authenticate citizen users (separate from admin auth).
 * Sets req.citizen with user info.
 */
export const authenticateCitizen = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access token required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.accessSecret);

    // Check if it's a citizen token
    if (!decoded.citizenId) {
      throw new ApiError(401, 'Invalid citizen token');
    }

    const user = await prisma.citizenUser.findUnique({
      where: { id: decoded.citizenId },
      select: { id: true, mobile: true, name: true, email: true, isVerified: true },
    });

    if (!user) {
      throw new ApiError(401, 'Citizen user not found');
    }

    req.citizen = user;
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
