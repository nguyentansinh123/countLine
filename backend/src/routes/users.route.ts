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
import { upload } from "../lib/multerconfig";

export const router = express.Router();

router.get("/me", requireAuth, getLoggedInUser);
router.put("/update-profile", requireAuth, upload.single("profilePicture"), updateProfilePic);
router.put("/update-name", requireAuth, updateUserName);
router.get("/SingleUserDocument/:documentID", userAuth, getSingleUserDocument);
router.post("/getUserByName", userAuth, getUserByName);
router.get("/search", userAuth, searchUsersByName);
router.post("/recent-searches", userAuth, addRecentSearch);
router.get("/recent-searches", userAuth, getRecentSearches);


// Admin-only routes
router.get("/getAllUser", userAuth, getAllUser);
router.get("/AllUserDocuments", userAuth, authorizeRoles("admin"), getAllUserDocuments);
router.delete("/delete-user/:id", userAuth, authorizeRoles("admin"), deleteUser);
router.put("/reassign-role", userAuth, authorizeRoles("admin"), reassignUserRole);

// Routes for admin and employee
router.get(
  "/getUserById/:id",
  userAuth,
  authorizeRoles("admin", "employee", "user"),
  getSingleUser
);

// Put catch-all parameter routes at the end
router.get("/:userId", userAuth, getUserById);
router.get("/:userId/documents", userAuth, getUserDocumentsById);
router.put("/:user_id", userAuth, authorizeRoles("admin"), updateUser);
