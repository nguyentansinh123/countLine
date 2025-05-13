import express from 'express'
import { userAuth } from '../middleware/userAuth';
import authorizeRoles from '../middleware/roleMiddleware';
export const router = express.Router()
import { 
    createProject, 
    getProject, 
    updateProject, 
    deleteProject, 
    getAllProject,
    addTeamToProject
} from '../controller/project.controller';

// Only admin and employee can create, update, or delete projects or add teams
router.post('/', userAuth, authorizeRoles('admin', 'employee'), createProject); 
router.put('/:projectId', userAuth, authorizeRoles('admin', 'employee'), updateProject);
router.delete('/:projectId', userAuth, authorizeRoles('admin', 'employee'), deleteProject);
router.post('/addTeamToProject', userAuth, authorizeRoles('admin', 'employee'), addTeamToProject);

// All authenticated users can view projects
router.get('/GetallProject', userAuth, getAllProject);
router.get('/:projectId', userAuth, getProject);