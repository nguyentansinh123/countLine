import express from 'express';
import { Login, Register, logout, sendVerifyOtp, verifiedEmail, isAuthenticated, sendResetOtp,resetPassword,getUserById } from '../controller/auth.controller';
import { userAuth } from '../middleware/userAuth';

const router = express.Router();

router.post('/login', Login);
router.post('/register', Register);
router.post('/logout', logout);
router.post('/send-verify-otp', userAuth, sendVerifyOtp);
router.post('/verify-account',userAuth, verifiedEmail);
router.get('/is-auth',userAuth, isAuthenticated);
router.post('/send-reset-otp',userAuth, sendResetOtp);
router.post('/reset-password',userAuth,resetPassword )
router.get('/test-getUserById',getUserById)


export {router} ;