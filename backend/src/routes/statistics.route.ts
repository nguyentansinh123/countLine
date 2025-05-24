import express from "express";
import {
  getTeamStatistics,
  getProjectStatistics,
  getDashboardStatistics,
  getDocumentTypeCounts,
  getDocumentInsights,
  getProjectProgressDistribution,
  getTeamCollaborationMetrics,
  getUserEngagementMetrics
} from "../controller/statistics.controller";
import { userAuth } from "../middleware/userAuth";

export const router = express.Router();

router.get("/teams", userAuth, getTeamStatistics);
router.get("/projects", userAuth, getProjectStatistics);
router.get("/documents/type-counts", userAuth, getDocumentTypeCounts);

router.get("/dashboard", userAuth, getDashboardStatistics);

router.get("/documents/insights", userAuth, getDocumentInsights);
router.get("/projects/progress-distribution", userAuth, getProjectProgressDistribution);
router.get("/teams/collaboration-metrics", userAuth, getTeamCollaborationMetrics);
router.get("/users/engagement-metrics", userAuth, getUserEngagementMetrics);