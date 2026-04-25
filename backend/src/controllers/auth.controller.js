import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { authService } from '../services/auth.service.js';

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  sendResponse(res, 200, result, 'Login successful');
});

export const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshToken(refreshToken);
  sendResponse(res, 200, result, 'Token refreshed');
});

export const getProfile = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  sendResponse(res, 200, user, 'Profile retrieved');
});
