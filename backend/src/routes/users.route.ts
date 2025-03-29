import express from 'express'
import { getAllUser ,getSingleUser, getAllUserDocuments,getSingleUserDocument,
    updateProfilePic,deleteUser,getUserByName,searchUsersByName,addRecentSearch,getRecentSearches} from '../controller/users.controller'
import { userAuth } from '../middleware/userAuth'

export const router = express.Router()

router.get('/getAllUser',userAuth, getAllUser)
router.get('/getUserById/:id',userAuth, getSingleUser)
router.get('/AllUserDocuments',userAuth, getAllUserDocuments)
router.get('/SingleUserDocument/:documentID',getSingleUserDocument)
router.put('/update-profile', userAuth, updateProfilePic)
router.delete('/delete-user/:id', userAuth, deleteUser); 
router.get('/getUserByName', userAuth,getUserByName)
router.get('/search', userAuth, searchUsersByName);
router.post('/recent-searches', userAuth, addRecentSearch);
router.get('/recent-searches', userAuth, getRecentSearches);