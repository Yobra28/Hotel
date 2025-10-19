import PoolFacility from '../models/PoolFacility.js';
import { asyncHandler, AppError, successResponse, getPaginationData } from '../middleware/errorHandler.js';

// GET /api/facilities/pools
export const listPools = asyncHandler(async (req, res) => {
  const { search = '', status, type, page = 1, limit = 100, sort = 'name' } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ name: regex }, { location: regex }];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 100;
  const skip = (pageNum - 1) * limitNum;

  const [pools, total] = await Promise.all([
    PoolFacility.find(filter).sort(sort).skip(skip).limit(limitNum),
    PoolFacility.countDocuments(filter)
  ]);

  const meta = getPaginationData(pageNum, limitNum, total);
  successResponse(res, 200, 'Pools retrieved successfully', { pools, ...meta });
});

// GET /api/facilities/pools/:id
export const getPool = asyncHandler(async (req, res, next) => {
  const pool = await PoolFacility.findById(req.params.id);
  if (!pool) return next(new AppError('Pool not found', 404));
  successResponse(res, 200, 'Pool retrieved successfully', { pool });
});

// POST /api/facilities/pools
export const createPool = asyncHandler(async (req, res, next) => {
  const { name, type, depth, operatingHours, location } = req.body;
  if (!name || !type || !depth?.min || !depth?.max || !operatingHours?.open || !operatingHours?.close) {
    return next(new AppError('name, type, depth and operatingHours are required', 400));
  }
  const pool = await PoolFacility.create({ name, type, depth, operatingHours, location });
  successResponse(res, 201, 'Pool created successfully', { pool });
});

// PUT /api/facilities/pools/:id
export const updatePool = asyncHandler(async (req, res, next) => {
  const pool = await PoolFacility.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!pool) return next(new AppError('Pool not found', 404));
  successResponse(res, 200, 'Pool updated successfully', { pool });
});
