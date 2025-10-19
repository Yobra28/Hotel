import MenuItem from '../models/MenuItem.js';
import { asyncHandler, AppError, successResponse, getPaginationData } from '../middleware/errorHandler.js';

// GET /api/menu/items
export const listMenuItems = asyncHandler(async (req, res) => {
  const { search = '', category, isAvailable, page = 1, limit = 100, sort = 'name' } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (typeof isAvailable !== 'undefined') filter.isAvailable = isAvailable === 'true' || isAvailable === true;
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ name: regex }, { description: regex }];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 100;
  const skip = (pageNum - 1) * limitNum;

  const [menuItems, total] = await Promise.all([
    MenuItem.find(filter).sort(sort).skip(skip).limit(limitNum),
    MenuItem.countDocuments(filter)
  ]);

  const meta = getPaginationData(pageNum, limitNum, total);
  successResponse(res, 200, 'Menu items retrieved successfully', { menuItems, ...meta });
});

// POST /api/menu/items
export const createMenuItem = asyncHandler(async (req, res, next) => {
  const { name, description, price, category, preparationTime, isAvailable, allergens = [], dietaryRestrictions = [] } = req.body;
  if (!name || price == null || !category) return next(new AppError('name, price and category are required', 400));
  const item = await MenuItem.create({ name, description, price, category, preparationTime, isAvailable, allergens, dietaryRestrictions });
  successResponse(res, 201, 'Menu item created successfully', { item });
});

// PUT /api/menu/items/:id
export const updateMenuItem = asyncHandler(async (req, res, next) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return next(new AppError('Menu item not found', 404));
  successResponse(res, 200, 'Menu item updated successfully', { item });
});

// DELETE /api/menu/items/:id
export const deleteMenuItem = asyncHandler(async (req, res, next) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return next(new AppError('Menu item not found', 404));
  await item.deleteOne();
  successResponse(res, 200, 'Menu item deleted successfully');
});

// PATCH /api/menu/items/:id/toggle
export const toggleAvailability = asyncHandler(async (req, res, next) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return next(new AppError('Menu item not found', 404));
  item.isAvailable = !item.isAvailable;
  await item.save();
  successResponse(res, 200, 'Menu item availability updated', { item });
});
