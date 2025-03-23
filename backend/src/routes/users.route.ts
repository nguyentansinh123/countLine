import express from 'express'
import { getAllUser ,getSingleUser, getAllUserDocuments,getSingleUserDocument} from '../controller/users.controller'
import { userAuth } from '../middleware/userAuth'

export const router = express.Router()

router.get('/getAllUser',userAuth, getAllUser)
router.get('/getUserById/:id',userAuth, getSingleUser)
router.get('/AllUserDocuments',userAuth, getAllUserDocuments)
router.get('/SingleUserDocument/:documentID',getSingleUserDocument)