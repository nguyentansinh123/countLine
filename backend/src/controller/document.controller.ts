import { PutObjectCommand } from "@aws-sdk/client-s3";
import {upload} from '../lib/multerconfig'
import { s3Client } from '../lib/s3'
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {docClient} from '../lib/dynamoClient'
import { GetCommand, PutCommand, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { ScanCommand } from "@aws-sdk/client-dynamodb";

export const uploadFileToS3 = async (req: Request, res: Response): Promise<void> => {
  try {
      if (!req.file) {
          res.status(400).json({ success: false, message: "No file uploaded" });
          return
      }

      const file = req.file;

      const fileNameWithoutSpaces = file.originalname.replace(/\s/g, '');

      const params = {
          Bucket: process.env.AWS_BUCKET_NAME!, 
          Key: `uploads/${Date.now()}_${fileNameWithoutSpaces}`,
          Body: file.buffer, 
          ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);

      const fileUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

      const document = {
          documentId: uuidv4(), 
          filename: file.originalname,
          fileType: file.mimetype,
          documentType: req.body.documentType || 'Unknown', 
          fileUrl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          uploadedBy: req.originalBody.user_id, 
          isDeleted: false,
      };

      const putCommand = new PutCommand({
          TableName: "Documents",
          Item: document,
      });
      await docClient.send(putCommand);

      res.status(200).json({
          success: true,
          message: "File uploaded successfully",
          fileUrl,
          documentId: document.documentId, 
          documentType: document.documentType, 
      });
      return;
  
      
  } catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;

      console.error("Error in uploadFileToS3:", message);
      res.status(500).json({ success: false, message });
      return;
  }
};

export const getAllTask = async (req: Request, res: Response) => {
  try {
    const scanParams = {
      TableName: 'Documents'
    }

    const data = await docClient.send(new ScanCommand(scanParams));
    res.status(200).json({
      success: true, data: data})
  } catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;

    console.error("Error in getAllUser:", message);
    res.status(500).json({ success: false, message });
  }
}

export const getSingleTask = async (req: Request, res: Response) => {
  try {
      const { id } = req.params; 

      const params = {
          TableName: "Documents", 
          Key: {
              documentId: id, 
          },
      };
      const { Item } = await docClient.send(new GetCommand(params));

      if (!Item) {
           res.status(404).json({ success: false, message: "Task not found" });
           return
      }
      res.status(200).json({
          success: true,
          data: Item,
      });
  } catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;

      console.error("Error in getSingleTask:", message);
      res.status(500).json({ success: false, message });
  }
};

export const SendFileToAUser = async (req: Request, res: Response) => {
    try {
        const { IdOfUser } = req.params; 
        const { documentId } = req.body; 

        if (!documentId) {
            res.status(400).json({ success: false, message: "Document ID is required" });
            return
        }

        const params: UpdateCommandInput = {
            TableName: "Users", 
            Key: {
                user_id: IdOfUser, 
            },
            UpdateExpression: "SET documents = list_append(if_not_exists(documents, :empty_list), :documentId)", // Add the documentId to the documents array
            ExpressionAttributeValues: {
                ":documentId": [documentId], 
                ":empty_list": [], 
            },
            ReturnValues: "UPDATED_NEW", 
        };

        const { Attributes } = await docClient.send(new UpdateCommand(params));

        res.status(200).json({
            success: true,
            message: "File sent to user successfully",
            documents: Attributes?.documents, 
        });
    } catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;

        console.error("Error in SendFileToAUser:", message);
        res.status(500).json({ success: false, message });
    }
};

