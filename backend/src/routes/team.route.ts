import express from 'express'
export const router = express.Router()
import { addTeam,getTeam,updateTeam,deleteTeam,addTeamMember,removeTeamMember,getTeamMembers } from '../controller/team.controller'
import { userAuth} from '../middleware/userAuth'

router.post('/addTeam',userAuth, addTeam) // need to add condition if team name is existed or not
router.get('/:teamId', userAuth, getTeam);
router.put('/:teamId', userAuth, updateTeam);
router.delete('/:teamId', userAuth, deleteTeam);

router.post('/:teamId/members', userAuth, addTeamMember);
router.delete('/:teamId/members/:userId', userAuth, removeTeamMember);
router.get('/:teamId/members', userAuth, getTeamMembers);