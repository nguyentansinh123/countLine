import express from 'express';
import { sendEmail } from '../controller/email.controller';
import { userAuth } from '../middleware/userAuth';

export const router = express.Router();
router.post('/send', userAuth, sendEmail);