import express from "express";
import {
  getAllUser,
  getSingleUser,
  getAllUserDocuments,
  getSingleUserDocument,
  updateProfilePic,
  deleteUser,
  getUserByName,
  searchUsersByName,
  addRecentSearch,
  getRecentSearches,
  reassignUserRole,
  getLoggedInUser,
  updateUserProfile,
  updateUser,
  updateUserName,
  getUserById,
  getUserDocumentsById,
} from "../controller/users.controller";
import { userAuth } from "../middleware/userAuth";
import { requireAuth } from "../middleware/requireAuth";
import authorizeRoles from "../middleware/roleMiddleware";

export const router = express.Router();

// Admin-only routes
router.get("/getAllUser", userAuth, authorizeRoles("admin"), getAllUser);
router.get("/AllUserDocuments", userAuth, authorizeRoles("admin"), getAllUserDocuments);
router.delete("/delete-user/:id", userAuth, authorizeRoles("admin"), deleteUser);
router.put("/reassign-role", userAuth, authorizeRoles("admin"), reassignUserRole);
router.put("/:user_id", userAuth, authorizeRoles("admin"), updateUser);

// Routes for admin and employee
router.get("/getUserById/:id", userAuth, authorizeRoles("admin", "employee"), getSingleUser);

// Routes for all authenticated users
router.get("/SingleUserDocument/:documentID", userAuth, getSingleUserDocument);
router.put("/update-profile", userAuth, updateProfilePic);

router.get("/getUserByName", userAuth, getUserByName);
router.get("/search", userAuth, searchUsersByName);
router.post("/recent-searches", userAuth, addRecentSearch);
router.get("/recent-searches", userAuth, getRecentSearches);

router.get("/me", requireAuth, getLoggedInUser); // working
router.put("/update-name", requireAuth, updateUserName);
router.get("/:userId", userAuth, getUserById);
router.get("/:userId/documents", userAuth, getUserDocumentsById);
