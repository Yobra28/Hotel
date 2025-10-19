import express from 'express';
import { protect, staffOnly, receptionistAccess, guestAccess, adminOnly } from '../middleware/auth.js';
import { listFoodOrders, myFoodOrders, getFoodOrder, createFoodOrder, updateFoodOrderStatus, deleteFoodOrder } from '../controllers/foodOrderController.js';

const router = express.Router();

// Guest access to their own food orders
router.use('/food/my-orders', protect, guestAccess);
router.get('/food/my-orders', myFoodOrders);

// Staff routes for food orders
router.use('/food', protect, staffOnly);
router.get('/food', listFoodOrders);
router.get('/food/:id', getFoodOrder);
router.post('/food', receptionistAccess, createFoodOrder);
router.patch('/food/:id/status', receptionistAccess, updateFoodOrderStatus);
router.delete('/food/:id', adminOnly, deleteFoodOrder);

export default router;
