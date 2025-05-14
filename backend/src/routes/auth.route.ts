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
} from "../controller/auth.controller";
import { userAuth } from "../middleware/userAuth";

const router = express.Router();

router.post("/login", Login); // working
router.post("/register", Register); // working
router.post("/logout", logout); // working
router.post("/send-verify-otp", sendVerifyOtp); // working
router.post("/verify-account", verifiedEmail);
router.get("/is-auth", isAuthenticated);
router.post("/send-reset-otp", sendResetOtp); // working
router.post("/reset-password", resetPassword); // working
router.get("/test-getUserById", getUserById); // wroking
export { router };
