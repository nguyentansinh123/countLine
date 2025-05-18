import { Request, Response } from "express"
import { PutCommand, GetCommand, UpdateCommand, QueryCommand, DeleteCommand, ScanCommandInput } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../lib/dynamoClient";
import { v4 as uuidv4 } from 'uuid';
import { ScanCommand } from "@aws-sdk/client-dynamodb";

const createProject = async (req: Request, res: Response) => {
    try {
        const { projectName, projectStart, projectEnd, description, teams, priority, budget, tags, status } = req.body;
        const createdBy = req.body.user_id; 

        const validStatuses = ['Finished', 'In Progress', 'Drafted', 'Cancelled'];
        
        const projectStatus = status ? 
            (validStatuses.includes(status) ? status : 'Drafted') : 
            'Drafted';

        const projectData = {
            projectId: uuidv4(),
            projectName,
            projectStart,
            projectEnd: projectEnd || null, 
            status: projectStatus,
            teams: teams || [],
            description: description || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy,
            isDeleted: false,
            priority: priority || 'Medium',
            budget: budget || null,
            tags: tags || []
        };

        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(projectData.projectStart)) {
            res.status(400).json({ success: false, message: "Start date must be in DD/MM/YYYY format" });
            return
        }

        const statusWarning = status && !validStatuses.includes(status) ? 
            { statusWarning: `The provided status "${status}" is invalid. Using default status "Drafted" instead.` } : 
            {};

        await docClient.send(new PutCommand({
            TableName: 'Projects',
            Item: projectData
        }));

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: projectData,
            ...statusWarning
        });

    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
        return
    }
};


const getProject = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        const { Item: project } = await docClient.send(new GetCommand({
            TableName: 'Projects',
            Key: { projectId }
        }));

        if (!project || project.isDeleted) {
            res.status(404).json({ 
                success: false, 
                message: "Project not found" 
            });
            return
        }

        res.json({ 
            success: true, 
            data: project 
        });

    } catch (error) {
        console.error("Error getting project:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
        return
    }
};


const updateProject = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const updates = req.body;
        const userId = req.body.user_id; 

        const { Item: project } = await docClient.send(new GetCommand({
            TableName: 'Projects',
            Key: { projectId }
        }));

        if (!project || project.isDeleted) {
            res.status(404).json({ 
                success: false, 
                message: "Project not found" 
            });
            return
        }

        if (project.createdBy !== userId) {
            res.status(403).json({ 
                success: false, 
                message: "Only project creator can update" 
            });
            return
        }

        const updateExpression = [];
        const expressionAttributeValues: Record<string, any> = {};
        const expressionAttributeNames: Record<string, string> = {};

        Object.keys(updates).forEach(key => {
            if (key !== 'projectId' && key in project) {
                updateExpression.push(`#${key} = :${key}`);
                expressionAttributeNames[`#${key}`] = key;
                expressionAttributeValues[`:${key}`] = updates[key];
            }
        });

        if (updateExpression.length === 0) {
            res.status(400).json({ 
                success: false, 
                message: "No valid fields to update" 
            });
            return
        }

        updateExpression.push('updatedAt = :updatedAt');
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();

        const { Attributes } = await docClient.send(new UpdateCommand({
            TableName: 'Projects',
            Key: { projectId },
            UpdateExpression: 'SET ' + updateExpression.join(', '),
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        }));

        res.json({ 
            success: true, 
            message: "Project updated successfully",
            data: Attributes
        });

    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
        return
    }
};


const verifyTeamExists = async (teamId: string): Promise<boolean> => {
    try {
        const { Item } = await docClient.send(new GetCommand({
            TableName: 'Teams',
            Key: { teamId },  
            ConsistentRead: true  
        }));
        return !!Item && !Item.isDeleted;
    } catch (error) {
        console.error('Team verification failed:', error);
        return false;
    }
};
const addTeamToProject = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.body;
        const { teamId } = req.body;
        const userId = req.body.user_id;

        console.log('Received request:', { projectId, teamId, userId });

        if (!teamId || typeof teamId !== 'string' || !projectId || typeof projectId !== 'string') {
            console.log('Validation failed - invalid IDs:', { projectId, teamId });
            res.status(400).json({
                success: false,
                message: "Both projectId and teamId must be valid strings",
                received: { projectId, teamId }
            });
            return
        }

        console.log('Fetching project with key:', { projectId });
        let project;
        try {
            const result = await docClient.send(new GetCommand({
                TableName: 'Projects',
                Key: { projectId },
                ProjectionExpression: 'projectId, createdBy, teams, isDeleted'
            }));
            project = result.Item;
            console.log('Project fetch result:', project);
        } catch (dbError) {
            console.error("DynamoDB Project Error:", {
                error: dbError,
                keyUsed: { projectId },
                time: new Date().toISOString()
            });
            res.status(400).json({
                success: false,
                message: "Project lookup failed",
                errorDetails: process.env.NODE_ENV === 'development' ? {
                    attemptedKey: { projectId },
                } : undefined
            });
            return
        }

        if (!project) {
            res.status(404).json({
                success: false,
                message: "Project not found",
                suggestion: "Verify the project exists in the Projects table"
            });
            return
        }

        if (project.isDeleted) {
            res.status(410).json({
                success: false,
                message: "Project has been deleted"
            });
            return
        }

        console.log('Fetching team with key:', { teamId });
        let team;
        try {
            const result = await docClient.send(new GetCommand({
                TableName: 'Teams',
                Key: { teamId },
                ProjectionExpression: 'teamId, isDeleted'
            }));
            team = result.Item;
            console.log('Team fetch result:', team);
        } catch (dbError) {
            console.error("DynamoDB Team Error:", {
                error: dbError,
                keyUsed: { teamId },
                time: new Date().toISOString()
            });
            res.status(400).json({
                success: false,
                message: "Team lookup failed",
                errorDetails: process.env.NODE_ENV === 'development' ? {
                    attemptedKey: { teamId }
                } : undefined
            });
            return
        }

        if (!team) {
            res.status(404).json({
                success: false,
                message: "Team not found",
                suggestion: "Verify the team exists in the Teams table"
            });
            return 
        }

        if (team.isDeleted) {
            res.status(410).json({
                success: false,
                message: "Team has been deleted"
            });
            return
        }

        if (project.createdBy !== userId) {
            res.status(403).json({
                success: false,
                message: "Only project creator can add teams",
                requiredPermission: "Project owner"
            });
            return
        }

        if (project.teams?.includes(teamId)) {
            res.status(409).json({
                success: false,
                message: "Team already associated with project",
                existingAssociation: true
            });
            return
        }

        const updatedTeams = [...(project.teams || []), teamId];
        const updateTimestamp = new Date().toISOString();
        
        console.log('Attempting to update project with:', {
            teams: updatedTeams,
            updatedAt: updateTimestamp
        });

        let updatedProject;
        try {
            const result = await docClient.send(new UpdateCommand({
                TableName: 'Projects',
                Key: { projectId },
                UpdateExpression: 'SET teams = :teams, updatedAt = :updatedAt',
                ExpressionAttributeValues: {
                    ':teams': updatedTeams,
                    ':updatedAt': updateTimestamp
                },
                ReturnValues: 'ALL_NEW'
            }));
            updatedProject = result.Attributes;
            console.log('Project update successful:', updatedProject);
        } catch (updateError) {
            console.error("Project Update Error:", {
                error: updateError,
                updateData: { teams: updatedTeams },
                time: new Date().toISOString()
            });
            res.status(500).json({
                success: false,
                message: "Failed to update project",
                errorId: uuidv4()
            });
            return
        }

        try {
            await docClient.send(new UpdateCommand({
                TableName: 'Teams',
                Key: { teamId },
                UpdateExpression: 'SET projects = list_append(if_not_exists(projects, :empty_list), :project), updatedAt = :updatedAt',
                ExpressionAttributeValues: {
                    ':project': [projectId],
                    ':empty_list': [],
                    ':updatedAt': updateTimestamp
                }
            }));
            console.log('Team projects list updated successfully');
        } catch (teamUpdateError) {
            console.error("Team Update Error:", teamUpdateError);
        }

        res.status(200).json({
            success: true,
            message: "Team added to project successfully",
            data: {
                projectId,
                addedTeam: teamId,
                teamCount: updatedTeams.length,
                updatedAt: updateTimestamp
            }
        });

    } catch (error) {
        console.error("Unexpected System Error:", {
            error,
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
            errorId: uuidv4()
        });
        res.status(500).json({
            success: false,
            message: "Internal system error",
            errorId: uuidv4(),
            supportContact: "support@domain.com"
        });
        return
    }
};

const deleteProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const { projectId } = req.params;
        const userId = req.body.user_id;

        console.log("Delete request received for project:", projectId, "by user:", userId);

        if (!projectId) {
            res.status(400).json({
                success: false,
                message: "Project ID is required"
            });
            return; 
        }

        const { Item: project } = await docClient.send(new GetCommand({
            TableName: 'Projects',
            Key: { projectId }
        }));

        if (!project) {
            console.log("Project not found:", projectId);
            res.status(404).json({
                success: false,
                message: "Project not found"
            });
            return;
        }

        if (project.isDeleted) {
            console.log("Project already deleted:", projectId);
            res.status(410).json({
                success: false,
                message: "Project has already been deleted"
            });
            return;
        }

        if (project.createdBy !== userId) {
            console.log("Authorization failed. Creator:", project.createdBy, "Requester:", userId);
            res.status(403).json({
                success: false,
                message: "Only the project creator can delete this project"
            });
            return; 
        }

        console.log("Soft deleting project:", projectId);
        
        const updateResult = await docClient.send(new UpdateCommand({
            TableName: 'Projects',
            Key: { projectId },
            UpdateExpression: 'SET isDeleted = :isDeleted, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
                ':isDeleted': true,
                ':updatedAt': new Date().toISOString()
            },
            ReturnValues: 'ALL_NEW'
        }));

        console.log("Project successfully marked as deleted:", projectId);

        res.status(200).json({
            success: true,
            message: "Project deleted successfully",
            data: {
                projectId,
                deletedAt: new Date().toISOString()
            }
        });
        return; 

    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? 
                (error instanceof Error ? error.message : String(error)) : 
                undefined
        });
        return; 
    }
};

interface ProjectResponse {
    success: boolean;
    data: Record<string, any>[];
    count: number;
    limit: number;
    pagination?: {
        nextKey: Record<string, any>;
        hasMore: boolean;
    };
}

const getAllProject = async (req: Request, res: Response) => {
    try {
        const limit = req.params.limit 
            ? Math.min(parseInt(req.query.limit as string), 100) 
            : 10;
        
        if (isNaN(limit)) {
            res.status(400).json({
                success: false,
                message: "Limit must be a valid number"
            });
            return
        }

        const scanParams: ScanCommandInput = {
            TableName: 'Projects',
            Limit: limit,
            FilterExpression: 'isDeleted = :isDeleted',
            ExpressionAttributeValues: {
                ':isDeleted': { BOOL: false } 
            }
        };

        const { Items: projects, LastEvaluatedKey } = await docClient.send(
            new ScanCommand(scanParams)
        );

        const response: ProjectResponse = {
            success: true,
            data: projects || [],
            count: projects?.length || 0,
            limit
        };

        if (LastEvaluatedKey) {
            response.pagination = {
                nextKey: LastEvaluatedKey,
                hasMore: true
            };
        }

        res.status(200).json(response);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error in getAllProject:", message);
        res.status(500).json({ 
            success: false, 
            message: "Failed to retrieve projects",
            error: process.env.NODE_ENV === 'development' ? message : undefined
        });
        return
    }
};

export { createProject, getProject, updateProject, deleteProject, getAllProject,addTeamToProject };