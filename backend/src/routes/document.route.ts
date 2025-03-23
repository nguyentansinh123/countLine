import express from 'express'
import {uploadFileToS3, getAllTask, SendFileToAUser} from '../controller/document.controller'
import {upload} from '../lib/multerconfig'
import { userAuth } from '../middleware/userAuth'
import { preserveBody } from '../middleware/preserveBody'
import { getSingleTask } from '../controller/document.controller'
export const router = express.Router()

router.post('/upload',userAuth,preserveBody,upload.single('file'), uploadFileToS3)
router.get('/alltask',userAuth,getAllTask)
router.get('/singleTask/:id',userAuth,getSingleTask)
router.post('/sendFileToUser/:IdOfUser',userAuth,SendFileToAUser)