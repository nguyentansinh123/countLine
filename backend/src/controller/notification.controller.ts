import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../lib/dynamoClient";

interface Notification {
  notificationId: string;
  userId: string; // recipient
  type: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export const createNotification = async (
  userId: string,
  type: string,
  message: string,
  data?: any
) => {
  const notification: Notification = {
    notificationId: uuidv4(),
    userId,
    type,
    message,
    data,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  await docClient.send(
    new PutCommand({
      TableName: "Notifications",
      Item: notification,
    })
  );
  return notification;
};

export const getNotifications = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const result = await docClient.send(new QueryCommand({
    TableName: "Notifications",
    IndexName: "userId-createdAt-index",
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: { ":uid": userId }
  }));

  res.json({ success: true, data: result.Items || [] });
};

export const markNotificationRead = async (req: Request, res: Response) => {
  const { notificationId } = req.params;
  await docClient.send(
    new UpdateCommand({
      TableName: "Notifications",
      Key: { notificationId },
      UpdateExpression: "SET isRead = :read",
      ExpressionAttributeValues: { ":read": true },
    })
  );
  res.json({ success: true });
};
