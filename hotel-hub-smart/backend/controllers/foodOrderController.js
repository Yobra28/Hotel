import FoodOrder from '../models/FoodOrder.js';
import MenuItem from '../models/MenuItem.js';
import User from '../models/User.js';
import { asyncHandler, AppError, successResponse, getPaginationData } from '../middleware/errorHandler.js';

// GET /api/orders/food (staff)
export const listFoodOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 50, sort = '-createdAt' } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    FoodOrder.find(filter).sort(sort).skip(skip).limit(limitNum),
    FoodOrder.countDocuments(filter)
  ]);

  const meta = getPaginationData(pageNum, limitNum, total);
  successResponse(res, 200, 'Food orders retrieved successfully', { orders, ...meta });
});

// GET /api/orders/food/my-orders (guest)
export const myFoodOrders = asyncHandler(async (req, res) => {
  const orders = await FoodOrder.find({ guest: req.user._id }).sort('-createdAt');
  successResponse(res, 200, 'Your orders retrieved successfully', { orders });
});

// GET /api/orders/food/:id
export const getFoodOrder = asyncHandler(async (req, res, next) => {
  const order = await FoodOrder.findById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));
  successResponse(res, 200, 'Order retrieved successfully', { order });
});

// POST /api/orders/food
export const createFoodOrder = asyncHandler(async (req, res, next) => {
  const { items = [], orderType = 'room-service', deliveryLocation, specialInstructions, guestId, roomId } = req.body;
  if (!Array.isArray(items) || items.length === 0) return next(new AppError('At least one item is required', 400));

  // Resolve guest
  let guest = guestId ? await User.findById(guestId) : req.user;
  if (!guest) return next(new AppError('Guest not found', 404));

  // Build items with pricing
  const detailedItems = [];
  let total = 0;
  for (const it of items) {
    const mi = await MenuItem.findById(it.menuItemId || it.menuItem);
    if (!mi) return next(new AppError('Menu item not found', 404));
    const qty = it.quantity || 1;
    const unitPrice = mi.price;
    total += unitPrice * qty;
    detailedItems.push({ menuItem: mi._id, quantity: qty, specialInstructions: it.specialInstructions, unitPrice });
  }

  const order = await FoodOrder.create({
    guest: guest._id,
    room: roomId || undefined,
    items: detailedItems,
    orderType,
    status: 'pending',
    totalAmount: total,
    deliveryLocation,
    specialInstructions,
    createdBy: req.user?._id,
  });

  successResponse(res, 201, 'Food order created successfully', { order });
});

// PATCH /api/orders/food/:id/status
export const updateFoodOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const order = await FoodOrder.findById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));
  order.status = status;
  if (status === 'delivered') order.actualDeliveryTime = new Date();
  await order.save();
  successResponse(res, 200, 'Order status updated successfully', { order });
});

// DELETE /api/orders/food/:id
export const deleteFoodOrder = asyncHandler(async (req, res, next) => {
  const order = await FoodOrder.findById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));
  await order.deleteOne();
  successResponse(res, 200, 'Order deleted successfully');
});
