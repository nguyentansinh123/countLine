import express from "express";
import { userAuth } from "../middleware/userAuth";
import { getUserActivity } from "../controller/activity.controller";

const router = express.Router();

router.get("/myActivity", userAuth, getUserActivity);

export { router };