import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { deleteNotification, getNotifications } from '../controllers/notification.controller.js';

const router = express.Router();

router.get("/",protectRoute,getNotifications);
router.delete("/:notificationId",protectRoute,deleteNotification);


export default router;