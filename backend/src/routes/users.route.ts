import express from 'express'
import { getAllUser ,getSingleUser} from '../controller/users.controller'

export const router = express.Router()

router.get('/getAllUser', getAllUser)
router.get('/getUserById/:id', getSingleUser)
