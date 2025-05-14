<<<<<<< HEAD
import express from 'express'
import { getAllUser, getSingleUser, getAllUserDocuments, getSingleUserDocument,
    updateProfilePic, deleteUser, getUserByName, searchUsersByName, addRecentSearch, getRecentSearches, reassignUserRole} from '../controller/users.controller'
import { userAuth } from '../middleware/userAuth'
import authorizeRoles from '../middleware/roleMiddleware'
=======
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
  getLoggedInUser,
  updateUserProfile,
} from "../controller/users.controller";
import { userAuth } from "../middleware/userAuth";
import { requireAuth } from "../middleware/requireAuth";
>>>>>>> 592dc2a (user, auth, project routes are connected, added otp page)

export const router = express.Router();

<<<<<<< HEAD
// Admin-only routes
router.get('/getAllUser', userAuth, authorizeRoles('admin'), getAllUser)
router.get('/AllUserDocuments', userAuth, authorizeRoles('admin'), getAllUserDocuments)
router.delete('/delete-user/:id', userAuth, authorizeRoles('admin'), deleteUser)
router.put('/reassign-role', userAuth, authorizeRoles('admin'), reassignUserRole)

// Routes for admin and employee
router.get('/getUserById/:id', userAuth, authorizeRoles('admin', 'employee'), getSingleUser)

// Routes for all authenticated users
router.get('/SingleUserDocument/:documentID', userAuth, getSingleUserDocument)
router.put('/update-profile', userAuth, updateProfilePic)
router.get('/getUserByName', userAuth, getUserByName)
router.get('/search', userAuth, searchUsersByName)
router.post('/recent-searches', userAuth, addRecentSearch)
router.get('/recent-searches', userAuth, getRecentSearches)
=======
router.get("/getAllUser", userAuth, getAllUser); // working
router.get("/getUserById/:id", userAuth, getSingleUser); // working
router.get("/AllUserDocuments", userAuth, getAllUserDocuments); // working
router.get("/SingleUserDocument/:documentID", getSingleUserDocument);
router.put("/update-profile", userAuth, updateProfilePic); // included in update
router.put("/update", userAuth, updateUserProfile); // working
router.delete("/delete-user/:id", userAuth, deleteUser); // needs to be implementd in admin user
router.get("/getUserByName", userAuth, getUserByName);
router.get("/search", userAuth, searchUsersByName);
router.post("/recent-searches", userAuth, addRecentSearch);
router.get("/recent-searches", userAuth, getRecentSearches);
router.get("/me", requireAuth, getLoggedInUser); // working
>>>>>>> 592dc2a (user, auth, project routes are connected, added otp page)
