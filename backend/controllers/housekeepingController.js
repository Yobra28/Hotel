import HousekeepingTask from '../models/HousekeepingTask.js';
import { asyncHandler, AppError, successResponse, getPaginationData } from '../middleware/errorHandler.js';

// GET /api/housekeeping/tasks
export const listTasks = asyncHandler(async (req, res) => {
  const { status, priority, assignedTo, search = '', page = 1, limit = 100, sort = '-createdAt' } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ assignedTo: regex }, { description: regex }];
  }
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 100;
  const skip = (pageNum - 1) * limitNum;
  const [tasks, total] = await Promise.all([
    HousekeepingTask.find(filter).sort(sort).skip(skip).limit(limitNum),
    HousekeepingTask.countDocuments(filter)
  ]);
  const meta = getPaginationData(pageNum, limitNum, total);
  successResponse(res, 200, 'Tasks retrieved successfully', { tasks, ...meta });
});

// GET /api/housekeeping/tasks/my
export const myTasks = asyncHandler(async (req, res) => {
  // match by name for now
  const name = req.user?.name || '';
  const tasks = await HousekeepingTask.find({ assignedTo: name }).sort('-createdAt');
  successResponse(res, 200, 'My tasks retrieved successfully', { tasks });
});

// POST /api/housekeeping/tasks
export const createTask = asyncHandler(async (req, res, next) => {
  const { roomId, assignedTo, priority = 'medium', taskType = 'cleaning', description } = req.body;
  if (!roomId || !assignedTo) return next(new AppError('roomId and assignedTo are required', 400));
  const task = await HousekeepingTask.create({ roomId, assignedTo, priority, taskType, description, assignedBy: req.user?._id });
  successResponse(res, 201, 'Task created successfully', { task });
});

// PUT /api/housekeeping/tasks/:id
export const updateTask = asyncHandler(async (req, res, next) => {
  const task = await HousekeepingTask.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!task) return next(new AppError('Task not found', 404));
  successResponse(res, 200, 'Task updated successfully', { task });
});

// PATCH /api/housekeeping/tasks/:id/status
export const updateTaskStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const task = await HousekeepingTask.findById(req.params.id);
  if (!task) return next(new AppError('Task not found', 404));
  task.status = status;
  if (status === 'in-progress') task.startedAt = new Date();
  if (status === 'completed') task.completedAt = new Date();
  await task.save();
  successResponse(res, 200, 'Task status updated successfully', { task });
});

// DELETE /api/housekeeping/tasks/:id
export const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await HousekeepingTask.findById(req.params.id);
  if (!task) return next(new AppError('Task not found', 404));
  await task.deleteOne();
  successResponse(res, 200, 'Task deleted successfully');
});