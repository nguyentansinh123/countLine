import express from "express";
import { getNotifications, markNotificationRead } from "../controller/notification.controller";
import { userAuth } from "../middleware/userAuth";

export const router = express.Router();

router.get("/", userAuth, getNotifications);
router.patch("/:notificationId/read", userAuth, markNotificationRead);