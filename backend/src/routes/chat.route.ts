import express from "express";
import { getStreamToken} from '../controller/chat.controller'
import { userAuth } from "../middleware/userAuth";

export const router = express.Router();

router.get("/token", userAuth, getStreamToken);

