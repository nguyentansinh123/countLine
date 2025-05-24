import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { PutCommand, QueryCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
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

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.body.user_id
    
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return; 
    }
    
    const params = {
      TableName: "Notifications", 
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };
    
    const command = new ScanCommand(params);
    const result = await docClient.send(command);
    
    let notifications = result.Items || [];
    notifications.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; 
    });
    
    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

export const markNotificationRead = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};
