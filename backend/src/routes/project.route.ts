import express from 'express'
import { userAuth } from '../middleware/userAuth';
export const router = express.Router()
import { 
    createProject, 
    getProject, 
    updateProject, 
    deleteProject, 
    listProjects 
} from '../controller/project.controller';

router.post('/', userAuth, createProject); // havent test yet

router.get('/:projectId', userAuth, getProject);

router.put('/:projectId', userAuth, updateProject);

router.delete('/:projectId', userAuth, deleteProject);

router.get('/', userAuth, listProjects);