import express from 'express'
import { userAuth } from '../middleware/userAuth';
export const router = express.Router()
import { 
    createProject, 
    getProject, 
    updateProject, 
    deleteProject, 
    getAllProject,
    addTeamToProject
} from '../controller/project.controller';

router.post('/', userAuth, createProject); 

router.get('/GetallProject', userAuth, getAllProject);

router.get('/:projectId', userAuth, getProject);

router.put('/:projectId', userAuth, updateProject);

router.delete('/:projectId', userAuth, deleteProject);


router.post('/addTeamToProject', userAuth,addTeamToProject)