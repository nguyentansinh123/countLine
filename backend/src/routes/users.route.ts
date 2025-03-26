import express from 'express'
import { getAllUser ,getSingleUser, getAllUserDocuments,getSingleUserDocument,updateProfilePic,deleteUser} from '../controller/users.controller'
import { userAuth } from '../middleware/userAuth'

export const router = express.Router()

router.get('/getAllUser',userAuth, getAllUser)
router.get('/getUserById/:id',userAuth, getSingleUser)
router.get('/AllUserDocuments',userAuth, getAllUserDocuments)
router.get('/SingleUserDocument/:documentID',getSingleUserDocument)
router.put('/update-profile', userAuth, updateProfilePic)
router.delete('/delete-user', userAuth, deleteUser); // need to be fixed, comment for me only since no fking one but me work on backend 