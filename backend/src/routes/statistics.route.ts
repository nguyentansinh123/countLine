import express from "express";
import {
  getTeamStatistics,
  getProjectStatistics,
  getDashboardStatistics,
  getDocumentTypeCounts
} from "../controller/statistics.controller";
import { userAuth } from "../middleware/userAuth";

export const router = express.Router();

router.get("/teams", userAuth, getTeamStatistics);
router.get("/projects", userAuth, getProjectStatistics);
router.get("/documents/type-counts", userAuth, getDocumentTypeCounts);

router.get("/dashboard", userAuth, getDashboardStatistics);