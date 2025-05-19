import { Request, Response } from "express";
import { docClient } from "../lib/dynamoClient";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export const getTeamStatistics = async (req: Request, res: Response) => {
  try {
    
    const teamsResult = await docClient.send(
      new ScanCommand({
        TableName: "Teams",
        FilterExpression: "attribute_not_exists(isDeleted) OR isDeleted = :false",
        ExpressionAttributeValues: {
          ":false": false
        }
      })
    );

    const teams = teamsResult.Items || [];
    
    const activeTeams = teams.filter(team => team.status === "Active").length;
    const inProgressTeams = teams.filter(team => team.status === "In Progress").length;
    const inactiveTeams = teams.filter(team => team.status === "Inactive").length;
    const otherTeams = teams.filter(team => 
      team.status !== "Active" && 
      team.status !== "In Progress" && 
      team.status !== "Inactive"
    ).length;

    res.status(200).json({
      success: true,
      data: {
        active: activeTeams,
        inProgress: inProgressTeams,
        inactive: inactiveTeams,
        other: otherTeams,
        total: teams.length
      }
    });
  } catch (error) {
    console.error("Error fetching team statistics:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve team statistics" 
    });
  }
};

export const getProjectStatistics = async (req: Request, res: Response) => {
  try {
    const userId = req.body.user_id;
    
    const projectsResult = await docClient.send(
      new ScanCommand({
        TableName: "Projects",
        FilterExpression: "attribute_not_exists(isDeleted) OR isDeleted = :false",
        ExpressionAttributeValues: {
          ":false": false
        }
      })
    );

    const projects = projectsResult.Items || [];
    
    const finishedProjects = projects.filter(project => project.status === "Finished").length;
    const inProgressProjects = projects.filter(project => project.status === "In Progress").length;
    const draftedProjects = projects.filter(project => project.status === "Drafted").length;
    const cancelledProjects = projects.filter(project => project.status === "Cancelled").length;
    const otherProjects = projects.filter(project => 
      project.status !== "Finished" && 
      project.status !== "In Progress" && 
      project.status !== "Drafted" &&
      project.status !== "Cancelled"
    ).length;
    
    res.status(200).json({
      success: true,
      data: {
        finished: finishedProjects,
        inProgress: inProgressProjects,
        drafted: draftedProjects,
        cancelled: cancelledProjects,
        other: otherProjects,
        total: projects.length
      }
    });
  } catch (error) {
    console.error("Error fetching project statistics:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve project statistics" 
    });
  }
};

export const getDashboardStatistics = async (req: Request, res: Response) => {
  try {
    const userId = req.body.user_id;
    
    const teamsResult = await docClient.send(
      new ScanCommand({
        TableName: "Teams",
        FilterExpression: "attribute_not_exists(isDeleted) OR isDeleted = :false",
        ExpressionAttributeValues: {
          ":false": false
        }
      })
    );

    const teams = teamsResult.Items || [];
    const currentTeams = teams.filter(team => team.status === "Active").length;
    const dismissedTeams = teams.filter(team => team.status === "Dismissed").length;
    const pastTeams = teams.filter(team => team.status !== "Active" && team.status !== "Dismissed").length;
    
    const projectsResult = await docClient.send(
      new ScanCommand({
        TableName: "Projects",
        FilterExpression: "attribute_not_exists(isDeleted) OR isDeleted = :false",
        ExpressionAttributeValues: {
          ":false": false
        }
      })
    );

    const projects = projectsResult.Items || [];
    const currentProjects = projects.filter(project => project.status === "In Progress").length;
    const dismissedProjects = projects.filter(project => project.status === "Cancelled").length;
    const pastProjects = projects.filter(project => project.status === "Finished").length;
    
    res.status(200).json({
      success: true,
      data: {
        teams: {
          current: currentTeams,
          dismissed: dismissedTeams,
          past: pastTeams,
          total: teams.length
        },
        projects: {
          current: currentProjects,
          dismissed: dismissedProjects,
          past: pastProjects,
          total: projects.length
        }
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve dashboard statistics" 
    });
  }
};

export const getDocumentTypeCounts = async (req: Request, res: Response) => {
  try {
    const documentsResult = await docClient.send(
      new ScanCommand({
        TableName: "Documents",
        FilterExpression: "attribute_not_exists(isDeleted) OR isDeleted = :false",
        ExpressionAttributeValues: {
          ":false": false
        }
      })
    );

    const documents = documentsResult.Items || [];
    
    const typeCounts: Record<string, number> = {};
    
    documents.forEach(doc => {
      const type = doc.documentType || "Unknown";
      if (!typeCounts[type]) {
        typeCounts[type] = 0;
      }
      typeCounts[type]++;
    });
    
    // Return just the counts by type
    res.status(200).json({
      success: true,
      data: typeCounts
    });
  } catch (error) {
    console.error("Error fetching document type counts:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve document type counts" 
    });
  }
};