import { Request, Response } from "express";
import { docClient } from "../lib/dynamoClient";
import { v4 as uuidv4 } from 'uuid';
import { BatchGetCommand, GetCommand, PutCommand, ScanCommand, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { ReturnValue } from "@aws-sdk/client-dynamodb";

const addTeam = async (req: Request, res: Response) => {
    try {
        const { teamName, teamSize, description, status } = req.body;
        const { user_id } = req.body; 

        if (!teamName || teamName.trim() === '') {
            res.status(400).json({ success: false, message: "Team name is required" });
            return
        }

        if (typeof teamSize !== 'number' || isNaN(teamSize)) {
            res.status(400).json({ 
                success: false, 
                message: "Team size must be a valid number" 
            });
            return
        }

        const parsedTeamSize = Number(teamSize);
        if (isNaN(parsedTeamSize)) {
            res.status(400).json({ 
                success: false, 
                message: "Team size must be a valid number" 
            });
            return
        }

        if (parsedTeamSize < 1 || parsedTeamSize > 50) {
            res.status(400).json({ 
                success: false, 
                message: "Team size must be between 1 and 50" 
            });
            return
        }

        const teamData = {
            teamId: uuidv4(),
            teamName: teamName.trim(),
            teamSize: parsedTeamSize, 
            description: description ? description.trim() : "",
            status: status || "Active",
            members: [], 
            projects: [],
            createdBy: user_id,
            dateCreated: new Date().toLocaleDateString('en-GB'), 
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isDeleted: false
        };

        const params = {
            TableName: 'Teams',
            Item: teamData
        };

        await docClient.send(new PutCommand(params));

        const updateUserParams = {
            TableName: 'Users',
            Key: { user_id },
            UpdateExpression: 'SET teams = list_append(if_not_exists(teams, :empty_list), :team)',
            ExpressionAttributeValues: {
                ':team': [teamData.teamId],
                ':empty_list': []
            }
        };

        try {
            await docClient.send(new UpdateCommand(updateUserParams));
        } catch (userUpdateError) {
            console.warn("Team created but failed to update user's teams array:", userUpdateError);
        }

        res.status(201).json({
            success: true,
            message: "Team created successfully",
            data: teamData
        });

    } catch (error) {
        console.error("Error in addTeam:", error);
        res.status(500).json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error" 
        });
        return
    }
}

const getTeam = async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;

        const params = {
            TableName: 'Teams',
            Key: { teamId }
        };

        const { Item } = await docClient.send(new GetCommand(params));

        if (!Item) {
            res.status(404).json({ success: false, message: "Team not found" });
            return
        }

        res.json({ success: true, data: Item });
    } catch (error) {
        console.error("Error in getTeam:", error);
        res.status(500).json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error" 
        });
        return
    }
}

const updateTeam = async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;
        const { teamName, description, status } = req.body;

        const updateParams: UpdateCommandInput = {
            TableName: 'Teams',
            Key: { teamId },
            UpdateExpression: 'SET #teamName = :name, description = :desc, #status = :statusValue, updatedAt = :updated',
            ExpressionAttributeNames: {
                '#teamName': 'teamName',
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':name': teamName,
                ':desc': description,
                ':statusValue': status,
                ':updated': Date.now()
            },
            ReturnValues: 'ALL_NEW'
        };

        const { Attributes } = await docClient.send(new UpdateCommand(updateParams));

        res.json({ 
            success: true, 
            message: "Team updated successfully",
            data: Attributes
        });
    } catch (error) {
        console.error("Error in updateTeam:", error);
        res.status(500).json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error" 
        });
        return
    }
}

const addTeamMember = async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;
        const { team_userId } = req.body;

        const getTeamParams = {
            TableName: 'Teams',
            Key: { teamId }
        };

        const { Item: team } = await docClient.send(new GetCommand(getTeamParams));

        if (!team) {
            res.status(404).json({ success: false, message: "Team not found" });
            return
        }

        if (team.members.includes(team_userId)) {
            res.status(400).json({ success: false, message: "User is already a team member" });
            return
        }

        if (team.members.length >= team.teamSize) {
            res.status(400).json({ success: false, message: "Team size limit reached" });
            return
        }

        const updateParams: UpdateCommandInput = {
            TableName: 'Teams',
            Key: { teamId },
            UpdateExpression: 'SET members = list_append(members, :newMember)',
            ExpressionAttributeValues: {
                ':newMember': [team_userId]
            },
            ReturnValues: ReturnValue.ALL_NEW 
        };

        const { Attributes } = await docClient.send(new UpdateCommand(updateParams));

        const updateUserParams: UpdateCommandInput = {
            TableName: 'Users',
            Key: { user_id: team_userId },
            UpdateExpression: 'SET teams = list_append(if_not_exists(teams, :empty_list), :team)',
            ExpressionAttributeValues: {
                ':team': [teamId],
                ':empty_list': []
            },
            ReturnValues: ReturnValue.ALL_NEW
        };

        await docClient.send(new UpdateCommand(updateUserParams));

        res.json({ 
            success: true, 
            message: "Member added successfully",
            data: Attributes
        });
    } catch (error) {
        console.error("Error in addTeamMember:", error);
        res.status(500).json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error" 
        });
        return
    }
}

const deleteTeam = async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params as { teamId: string };
        console.log('Deleting team:', teamId);

        const { Item: team } = await docClient.send(new GetCommand({
            TableName: 'Teams',
            Key: { teamId }
        }));

        if (!team) {
            res.status(404).json({ 
                success: false, 
                message: "Team not found" 
            });
            return
        }

        if (team.members && team.members.length > 0) {
            await Promise.all(team.members.map(async (userId: string) => {
                const { Item: user } = await docClient.send(new GetCommand({
                    TableName: 'Users',
                    Key: { user_id: userId }
                }));

                if (user?.teams) {
                    const updatedTeams = user.teams.filter((t: string) => t !== teamId);
                    
                    await docClient.send(new UpdateCommand({
                        TableName: 'Users',
                        Key: { user_id: userId },
                        UpdateExpression: 'SET teams = :teams',
                        ExpressionAttributeValues: {
                            ':teams': updatedTeams
                        }
                    }));
                }
            }));
        }

        const { Attributes } = await docClient.send(new UpdateCommand({
            TableName: 'Teams',
            Key: { teamId },
            UpdateExpression: 'SET isDeleted = :deleted, members = :empty, updatedAt = :updated',
            ExpressionAttributeValues: {
                ':deleted': true,
                ':empty': [],
                ':updated': Date.now()
            },
            ReturnValues: ReturnValue.ALL_NEW
        }));

        res.json({
            success: true,
            message: "Team deleted successfully",
            data: Attributes
        });

    } catch (error) {
        console.error("Error in deleteTeam:", error);
        res.status(500).json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Internal server error" 
        });
        return
    }
}

const removeTeamMember = async (req: Request, res: Response) => {
    try {
        const { teamId, userId } = req.params;

        const { Item: team } = await docClient.send(new GetCommand({
            TableName: 'Teams',
            Key: { teamId }
        }));

        if (!team || (team as { isDeleted?: boolean }).isDeleted) {
            res.status(404).json({
                success: false,
                message: "Team not found or already deleted"
            });
            return
        }

        if (!(team as { members: string[] }).members.includes(userId)) {
             res.status(400).json({
                success: false,
                message: "User is not a member of this team"
            });
            return
        }

        const updatedMembers = (team as { members: string[] }).members.filter(
            (member: string) => member !== userId
        );
        
        await docClient.send(new UpdateCommand({
            TableName: 'Teams',
            Key: { teamId },
            UpdateExpression: 'SET members = :members',
            ExpressionAttributeValues: {
                ':members': updatedMembers
            }
        }));

        const { Item: user } = await docClient.send(new GetCommand({
            TableName: 'Users',
            Key: { user_id: userId }
        }));

        if ((user as { teams?: string[] })?.teams) {
            const updatedTeams = (user as { teams: string[] }).teams.filter(
                (t: string) => t !== teamId
            );
            await docClient.send(new UpdateCommand({
                TableName: 'Users',
                Key: { user_id: userId },
                UpdateExpression: 'SET teams = :teams',
                ExpressionAttributeValues: {
                    ':teams': updatedTeams
                }
            }));
        }

        res.json({
            success: true,
            message: "Member removed successfully",
            data: {
                teamId,
                removedUserId: userId,
                remainingMembers: updatedMembers.length
            }
        });

    } catch (error) {
        console.error("Error in removeTeamMember:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error"
        });
        return
    }
}


interface TeamMember {
    user_id: string;
    name?: string;
    email?: string;
    profilePicture?: string;
    role?: string;
  }
  
  interface TeamResponse {
    teamId: string;
    teamName?: string;
    members: TeamMember[];
    count: number;
  }
  
  interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
  }
  
  const getTeamMembers = async (req: Request, res: Response<ApiResponse<TeamResponse>>) => {
      try {
          const { teamId } = req.params as { teamId: string };
  
          const { Item: team } = await docClient.send(new GetCommand({
              TableName: 'Teams',
              Key: { teamId },
              ProjectionExpression: 'members, teamName, isDeleted'
          }));
  
          if (!team || (team as { isDeleted?: boolean }).isDeleted) {
            res.status(404).json({
                  success: false,
                  message: "Team not found or deleted"
              });
              return
          }
  
          const teamMembers = (team as { members?: string[] }).members || [];
          const teamName = (team as { teamName?: string }).teamName;
  
          if (teamMembers.length === 0) {
            res.json({
                  success: true,
                  data: {
                      teamId,
                      teamName,
                      members: [],
                      count: 0
                  }
              });
              return
          }
  
          const { Responses } = await docClient.send(new BatchGetCommand({
              RequestItems: {
                  'Users': {
                      Keys: teamMembers.map(user_id => ({ user_id })),
                      ProjectionExpression: 'user_id, name, email, profilePicture, role'
                  }
              }
          }));
  
          const members: TeamMember[] = Responses?.Users?.map(user => ({
              user_id: user.user_id,
              name: user.name,
              email: user.email,
              profilePicture: user.profilePicture,
              role: user.role
          })) || [];
  
        res.json({
              success: true,
              data: {
                  teamId,
                  teamName,
                  members,
                  count: members.length
              }
          });
  
      } catch (error) {
          console.error("Error in getTeamMembers:", error);
            res.status(500).json({
              success: false,
              message: error instanceof Error ? error.message : "Internal server error"
          });
          return
      }
  }

  const getMyTeams = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user.id;
    try {
        const { Item: user } = await docClient.send(new GetCommand({
            TableName: 'Users',
            Key: { user_id: userId }
        }));
        if (!user || !user.teams) {
            res.json({ success: true, data: [] });
            return;
        }
        const { Responses } = await docClient.send(new BatchGetCommand({
            RequestItems: {
                'Teams': {
                    Keys: user.teams.map((teamId: string) => ({ teamId }))
                }
            }
        }));
        const teams = (Responses?.Teams || []).filter(Boolean);
        res.json({ success: true, data: teams });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch your teams" });
    }
};

const changeTeamStatus = async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const { status } = req.body;
    try {
        const { Attributes } = await docClient.send(new UpdateCommand({
            TableName: 'Teams',
            Key: { teamId },
            UpdateExpression: 'SET #status = :status, updatedAt = :updated',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: { ':status': status, ':updated': Date.now() },
            ReturnValues: 'ALL_NEW'
        }));
        res.json({ success: true, message: "Status updated", data: Attributes });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update status" });
    }
};


const exportTeamsCsv = async (req: Request, res: Response) => {
    try {
        const data = await docClient.send(new ScanCommand({ TableName: 'Teams' }));
        const teams = data.Items || [];
        const csv = [
            'teamId,teamName,teamSize,description,status,createdBy,dateCreated',
            ...teams.map(t =>
                [t.teamId, t.teamName, t.teamSize, `"${t.description}"`, t.status, t.createdBy, t.dateCreated].join(',')
            )
        ].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to export teams" });
    }
};


export {addTeam,getTeam,updateTeam,deleteTeam,addTeamMember,removeTeamMember,getTeamMembers,getMyTeams,changeTeamStatus,exportTeamsCsv}