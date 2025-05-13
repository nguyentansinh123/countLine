import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../lib/dynamoClient";

export const logUserActivity = async ({
  userId,
  action,
  targetId,
  details
}: {
  userId: string,
  action: string,
  targetId?: string,
  details?: any
}) => {
  await docClient.send(new PutCommand({
    TableName: 'UserActivity',
    Item: {
      activityId: uuidv4(),
      userId,
      action,
      targetId: targetId || null,
      details: details || null,
      timestamp: new Date().toISOString()
    }
  }));
};

export const getUserActivity = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: 'UserActivity',
      IndexName: 'userId-timestamp-index', 
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: { ':uid': userId }
    }));
    res.json({ success: true, data: result.Items || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch activity" });
  }
};