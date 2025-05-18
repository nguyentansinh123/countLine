import express from "express";
export const router = express.Router();
import {
  addTeam,
  getAllTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  getTeamMembers,
  getMyTeams,
  changeTeamStatus,
  exportTeamsCsv,
} from "../controller/team.controller";
import { userAuth } from "../middleware/userAuth";
import authorizeRoles from "../middleware/roleMiddleware";

// Only admin and employee can create, update, or delete teams
router.post("/addTeam", userAuth, authorizeRoles("admin", "employee"), addTeam);
router.put(
  "/:teamId",
  userAuth,
  authorizeRoles("admin", "employee"),
  updateTeam
);
router.delete(
  "/:teamId",
  userAuth,
  authorizeRoles("admin", "employee"),
  deleteTeam
);

// All authenticated users can view teams and members
router.get("/getAllTeams", userAuth, getAllTeams);
router.get("/FindMyTeams/Yes", userAuth, getMyTeams);
router.get("/:teamId/members", userAuth, getTeamMembers);
router.get("/:teamId", userAuth, getTeam);

// Only admin and employee can add or remove team members
router.post(
  "/:teamId/members",
  userAuth,
  authorizeRoles("admin", "employee"),
  addTeamMember
);
router.delete(
  "/:teamId/members/:userId",
  userAuth,
  authorizeRoles("admin", "employee"),
  removeTeamMember
);
router.patch(
  "/:teamId/status",
  userAuth,
  authorizeRoles("admin", "employee"),
  changeTeamStatus
);
router.get("/export/csv", userAuth, authorizeRoles("admin"), exportTeamsCsv);
