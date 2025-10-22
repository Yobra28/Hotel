import Room from '../models/Room.js';
import { asyncHandler, AppError, successResponse, getPaginationData } from '../middleware/errorHandler.js';
import Booking from '../models/Booking.js';

// Map frontend types to backend types
const mapFrontendTypeToBackend = (frontendType) => {
  const map = {
    single: 'Smart Economy',
    double: 'Business Suite',
    suite: 'Premium Deluxe',
    deluxe: 'Presidential'
  };
  return map[frontendType] || frontendType;
};

// Map optional simple payload to full Room schema shape
const normalizeRoomPayload = (payload) => {
  const {
    roomNumber,
    number,
    type,
    floor,
    price,
    pricePerNight,
    status = 'available',
    capacity,
    adults,
    children,
    category = 'standard',
    bedType = 'Queen',
    numberOfBeds = 1,
    size = 25,
    currency = 'KES',
    amenities = ['WiFi', 'TV', 'Air Conditioning'],
    description = '',
    images = [],
  } = payload;

  const resolvedType = mapFrontendTypeToBackend(type);

  // derive capacity
  let capAdults = 1;
  let capChildren = 0;
  if (typeof capacity === 'number') {
    capAdults = Math.max(1, Math.floor(capacity * 0.7));
    capChildren = Math.max(0, capacity - capAdults);
  } else {
    if (typeof adults === 'number') capAdults = adults;
    if (typeof children === 'number') capChildren = children;
  }

  return {
    roomNumber: (roomNumber ?? number ?? '').toString(),
    type: resolvedType,
    category,
    floor: parseInt(floor, 10),
    capacity: {
      adults: capAdults,
      children: capChildren,
    },
    size,
    bedType,
    numberOfBeds,
    pricePerNight: parseInt((pricePerNight ?? price)?.toString() || '0', 10),
    currency,
    amenities,
    features: payload.features || [],
    status,
    housekeepingStatus: payload.housekeepingStatus || 'clean',
    description,
    images,
    isActive: payload.isActive !== undefined ? !!payload.isActive : true,
  };
};

// GET /api/rooms - list rooms with filters
export const listRooms = asyncHandler(async (req, res) => {
  const {
    search = '',
    status,
    type,
    floor,
    minPrice,
    maxPrice,
    page = 1,
    limit = 50,
    sort = '-createdAt',
  } = req.query;

  const filter = {};

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { roomNumber: regex },
      { type: regex },
      { category: regex },
      { description: regex },
    ];
  }
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (floor) filter.floor = Number(floor);
  if (minPrice || maxPrice) {
    filter.pricePerNight = {};
    if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const [rooms, total] = await Promise.all([
    Room.find(filter).sort(sort).skip(skip).limit(limitNum),
    Room.countDocuments(filter),
  ]);

  const meta = getPaginationData(pageNum, limitNum, total);
  successResponse(res, 200, 'Rooms retrieved successfully', { rooms, ...meta });
});

// GET /api/rooms/available - available rooms
export const listAvailableRooms = asyncHandler(async (req, res) => {
  const { adults, children, type } = req.query;
  const filter = {
    status: 'available',
    housekeepingStatus: 'clean',
    isActive: true,
  };
  if (type) filter.type = type;
  if (adults) filter['capacity.adults'] = { $gte: Number(adults) };
  if (children) filter['capacity.children'] = { $gte: Number(children) };

  const rooms = await Room.find(filter);
  successResponse(res, 200, 'Available rooms retrieved successfully', { rooms });
});

// GET /api/rooms/summary - list all rooms with availability for a date range
export const listRoomsSummary = asyncHandler(async (req, res) => {
  const { checkIn, checkOut } = req.query;
  const rooms = await Room.find({ isActive: true }).select('roomNumber type floor capacity pricePerNight status housekeepingStatus isActive');

  const overlappingByRoom = new Map();
  const blockedRangesByRoom = new Map();
  if (checkIn && checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const roomIds = rooms.map(r => r._id);
    const bookings = await Booking.find({
      room: { $in: roomIds },
      status: { $in: ['pending', 'confirmed', 'checked_in'] },
      $or: [
        { checkInDate: { $lt: end, $gte: start } },
        { checkOutDate: { $gt: start, $lte: end } },
        { checkInDate: { $lte: start }, checkOutDate: { $gte: end } },
      ],
    }).select('room checkInDate checkOutDate');

    for (const b of bookings) {
      const key = b.room.toString();
      overlappingByRoom.set(key, true);
      const arr = blockedRangesByRoom.get(key) || [];
      arr.push({ start: b.checkInDate, end: b.checkOutDate });
      blockedRangesByRoom.set(key, arr);
    }
  }

  const data = rooms.map(r => ({
    room: r,
    availableForRange: checkIn && checkOut
      ? !overlappingByRoom.get(r._id.toString())
      : (r.status === 'available' && r.housekeepingStatus === 'clean' && r.isActive),
    blockedRanges: blockedRangesByRoom.get(r._id.toString()) || [],
  }));

  successResponse(res, 200, 'Room summary retrieved successfully', { rooms: data });
});

// GET /api/rooms/:id
export const getRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id);
  if (!room) return next(new AppError('Room not found', 404));
  successResponse(res, 200, 'Room retrieved successfully', { room });
});

// POST /api/rooms
export const createRoom = asyncHandler(async (req, res, next) => {
  const data = normalizeRoomPayload(req.body || {});

  if (!data.roomNumber || !data.type || !data.floor || !data.pricePerNight) {
    return next(new AppError('roomNumber, type, floor and price are required', 400));
  }

  const exists = await Room.findOne({ roomNumber: data.roomNumber });
  if (exists) return next(new AppError('Room number already exists', 400));

  const room = await Room.create(data);
  successResponse(res, 201, 'Room created successfully', { room });
});

// PUT /api/rooms/:id
export const updateRoom = asyncHandler(async (req, res, next) => {
  const payload = normalizeRoomPayload({ ...req.body, roomNumber: req.body.roomNumber || undefined });
  const room = await Room.findByIdAndUpdate(
    req.params.id,
    payload,
    { new: true, runValidators: true }
  );
  if (!room) return next(new AppError('Room not found', 404));
  successResponse(res, 200, 'Room updated successfully', { room });
});

// DELETE /api/rooms/:id
export const deleteRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id);
  if (!room) return next(new AppError('Room not found', 404));
  await room.deleteOne();
  successResponse(res, 200, 'Room deleted successfully');
});
