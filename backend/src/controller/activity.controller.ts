import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../lib/dynamoClient";
import { log } from "console";

export const logUserActivity = async ({
  userId,
  action,
  targetId,
  details,
}: {
  userId: string;
  action: string;
  targetId?: string;
  details?: any;
}) => {
  await docClient.send(
    new PutCommand({
      TableName: "UserActivity",
      Item: {
        activityId: uuidv4(),
        userId,
        action,
        targetId: targetId || null,
        details: details || null,
        timestamp: new Date().toISOString(),
      },
    })
  );
};

export const getUserActivity = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: "UserActivity",
        IndexName: "userId-timestamp-index",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
      })
    );
    res.json({ success: true, data: result.Items || [] });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res.status(500).json({ success: false, message: "Failed to fetch activity" });
  }
};

export const getUserActivityById = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  console.log("Fetching activity for user:", userId);

  if (!userId) {
    res.status(400).json({ success: false, message: "Missing userId" });
    return;
  }

  try {
    // Modify to use Scan operation instead of Query with an index
    const result = await docClient.send(
      new ScanCommand({
        TableName: "UserActivity",
        FilterExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId }
      })
    );

    console.log("Activity data retrieved:", result.Items?.length || 0, "items");
    res.json({ success: true, data: result.Items || [] });
  } catch (error) {
    console.error("Error fetching user activity by ID:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch activity",
      error: errorMessage 
    });
  }
};
