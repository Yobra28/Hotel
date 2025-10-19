import PoolEquipment from '../models/PoolEquipment.js';
import { asyncHandler, AppError, successResponse, getPaginationData } from '../middleware/errorHandler.js';

// GET /api/facilities/equipment
export const listEquipment = asyncHandler(async (req, res) => {
  const { search = '', type, condition, page = 1, limit = 100, sort = 'name' } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (condition) filter.condition = condition;
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ name: regex }, { type: regex }, { description: regex }];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 100;
  const skip = (pageNum - 1) * limitNum;

  const [equipment, total] = await Promise.all([
    PoolEquipment.find(filter).sort(sort).skip(skip).limit(limitNum),
    PoolEquipment.countDocuments(filter)
  ]);

  const meta = getPaginationData(pageNum, limitNum, total);
  successResponse(res, 200, 'Equipment retrieved successfully', { equipment, ...meta });
});

// POST /api/facilities/equipment
export const createEquipment = asyncHandler(async (req, res, next) => {
  const { name, type, totalQuantity, availableQuantity, dailyRate, condition, isAvailable, lastMaintenance, nextMaintenance, description } = req.body;
  if (!name || !type) return next(new AppError('name and type are required', 400));
  const equip = await PoolEquipment.create({ name, type, totalQuantity, availableQuantity, dailyRate, condition, isAvailable, lastMaintenance, nextMaintenance, description });
  successResponse(res, 201, 'Equipment created successfully', { equipment: equip });
});

// PUT /api/facilities/equipment/:id
export const updateEquipment = asyncHandler(async (req, res, next) => {
  const equip = await PoolEquipment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!equip) return next(new AppError('Equipment not found', 404));
  successResponse(res, 200, 'Equipment updated successfully', { equipment: equip });
});

// DELETE /api/facilities/equipment/:id
export const deleteEquipment = asyncHandler(async (req, res, next) => {
  const equip = await PoolEquipment.findById(req.params.id);
  if (!equip) return next(new AppError('Equipment not found', 404));
  await equip.deleteOne();
  successResponse(res, 200, 'Equipment deleted successfully');
});
