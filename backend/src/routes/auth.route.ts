import express from "express";
import {
  Login,
  Register,
  logout,
  sendVerifyOtp,
  verifiedEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
  getUserById,
  adminCreateUser,
} from "../controller/auth.controller";
import { userAuth } from "../middleware/userAuth";

const router = express.Router();

router.post("/login", Login);
router.post("/register", Register); 
router.post("/logout", logout); 
router.post("/send-verify-otp", sendVerifyOtp); 
router.post("/verify-account", verifiedEmail);
router.get("/is-auth", isAuthenticated);
router.post("/send-reset-otp", sendResetOtp); 
router.post("/reset-password", resetPassword); 
router.get("/test-getUserById", getUserById); 

router.post("/admin/create-user", userAuth, adminCreateUser)
export { router };
