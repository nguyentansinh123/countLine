import express from "express";
import { userAuth } from "../middleware/userAuth";
import {
  getUserActivity,
  getUserActivityById,
  getAllActivities,
} from "../controller/activity.controller";

const router = express.Router();

router.get("/myActivity", userAuth, getUserActivity);
router.get("/user/:userId", userAuth, getUserActivityById);
router.get("/all", getAllActivities);

export { router };
