import SwimmingActivity from '../models/SwimmingActivity.js';
import { asyncHandler, AppError, successResponse, getPaginationData } from '../middleware/errorHandler.js';

// GET /api/activities/swimming
export const listSwimmingActivities = asyncHandler(async (req, res) => {
  const { poolId, type, search = '', page = 1, limit = 100, sort = '-nextSession' } = req.query;
  const filter = {};
  if (poolId) filter.poolId = poolId;
  if (type) filter.type = type;
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ name: regex }, { description: regex }, { instructor: regex }];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 100;
  const skip = (pageNum - 1) * limitNum;

  const [activities, total] = await Promise.all([
    SwimmingActivity.find(filter).sort(sort).skip(skip).limit(limitNum),
    SwimmingActivity.countDocuments(filter)
  ]);

  const meta = getPaginationData(pageNum, limitNum, total);
  successResponse(res, 200, 'Swimming activities retrieved successfully', { activities, ...meta });
});

// POST /api/activities/swimming
export const createSwimmingActivity = asyncHandler(async (req, res, next) => {
  const { name, description, type, poolId, instructor, price, duration, capacity, skillLevel, ageRequirement, isActive, nextSession } = req.body;
  if (!name || !type || !poolId) return next(new AppError('name, type and poolId are required', 400));
  const activity = await SwimmingActivity.create({ name, description, type, poolId, instructor, price, duration, capacity, skillLevel, ageRequirement, isActive, nextSession });
  successResponse(res, 201, 'Swimming activity created successfully', { activity });
});

// PUT /api/activities/swimming/:id
export const updateSwimmingActivity = asyncHandler(async (req, res, next) => {
  const activity = await SwimmingActivity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!activity) return next(new AppError('Swimming activity not found', 404));
  successResponse(res, 200, 'Swimming activity updated successfully', { activity });
});

// DELETE /api/activities/swimming/:id
export const deleteSwimmingActivity = asyncHandler(async (req, res, next) => {
  const activity = await SwimmingActivity.findById(req.params.id);
  if (!activity) return next(new AppError('Swimming activity not found', 404));
  await activity.deleteOne();
  successResponse(res, 200, 'Swimming activity deleted successfully');
});
