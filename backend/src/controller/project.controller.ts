import { Request, Response } from "express"
import { PutCommand, GetCommand, UpdateCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../lib/dynamoClient";
import { v4 as uuidv4 } from 'uuid';

const createProject = async (req: Request, res: Response) => {
    try {
        const { projectName, projectStart, projectEnd, description, teams, priority, budget, tags } = req.body;
        const createdBy = req.body.user_id; 

        const projectData = {
            projectId: uuidv4(),
            projectName,
            projectStart,
            projectEnd: projectEnd || null, 
            status: 'Drafted',
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

        await docClient.send(new PutCommand({
            TableName: 'Projects',
            Item: projectData
        }));

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: projectData
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



const getProject = async (req : Request, res: Response) => {}


const updateProject = async (req : Request, res: Response) => {}


const deleteProject = async (req : Request, res: Response) => {}


const listProjects = async (req : Request, res: Response) => {}

export { createProject, getProject, updateProject, deleteProject, listProjects };