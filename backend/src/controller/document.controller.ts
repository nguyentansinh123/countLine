import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { upload } from "../lib/multerconfig";
import { s3Client } from "../lib/s3";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { docClient } from "../lib/dynamoClient";
import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { logUserActivity } from "./activity.controller";

export const uploadFileToS3 = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    const file = req.file;
    const fileNameWithoutSpaces = file.originalname.replace(/\s/g, "");

    let documentType = req.body.documentType;

    if (!documentType || documentType === "Unknown") {
      const fileExtension = file.originalname.split(".").pop()?.toLowerCase();

      const extensionMap: { [key: string]: string } = {
        pdf: "PDF Document",
        doc: "Word Document",
        docx: "Word Document",
        xls: "Excel Spreadsheet",
        xlsx: "Excel Spreadsheet",
        ppt: "PowerPoint Presentation",
        pptx: "PowerPoint Presentation",
        txt: "Text Document",
        jpg: "Image",
        jpeg: "Image",
        png: "Image",
        gif: "Image",
      };

      documentType = fileExtension
        ? extensionMap[fileExtension] || "Unknown"
        : "Unknown";

      if (documentType === "Unknown") {
        const mimeTypeMap: { [key: string]: string } = {
          "application/pdf": "PDF Document",
          "application/msword": "Word Document",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            "Word Document",
          "application/vnd.ms-excel": "Excel Spreadsheet",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            "Excel Spreadsheet",
          "text/plain": "Text Document",
          "image/jpeg": "Image",
          "image/png": "Image",
          "image/gif": "Image",
        };

        documentType = mimeTypeMap[file.mimetype] || "Unknown";
      }
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `uploads/${Date.now()}_${fileNameWithoutSpaces}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const fileUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

    const getObjectParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: params.Key,
    };
    const getCommand = new GetObjectCommand(getObjectParams);
    const presignedUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 3600,
    });

    const document = {
      documentId: uuidv4(),
      filename: file.originalname,
      fileType: file.mimetype,
      documentType: documentType,
      fileUrl,
      presignedUrl,
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

    await logUserActivity({
      userId: req.body.user_id,
      action: "upload_document",
      targetId: document.documentId,
      details: { filename: file.originalname, documentType }
    });

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      fileUrl: presignedUrl,
      documentId: document.documentId,
      documentType: document.documentType,
    });
    return;
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;

    console.error("Error in uploadFileToS3:", message);
    res.status(500).json({ success: false, message });
    return;
  }
};

export const getAllTask = async (req: Request, res: Response) => {
  try {
    const scanParams = {
      TableName: "Documents",
    };

    const data = await docClient.send(new ScanCommand(scanParams));

    await logUserActivity({
      userId: req.body.user_id,
      action: "get_all_tasks"
    });

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;

    console.error("Error in getAllUser:", message);
    res.status(500).json({ success: false, message });
  }
};

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
      return;
    }

    await logUserActivity({
      userId: req.body.user_id,
      action: "get_single_task",
      targetId: id
    });


    res.status(200).json({
      success: true,
      data: Item,
    });
  } catch (error) {
    let message = "Unknown Error";
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
      res
        .status(400)
        .json({ success: false, message: "Document ID is required" });
      return;
    }

    const params: UpdateCommandInput = {
      TableName: "Users",
      Key: {
        user_id: IdOfUser,
      },
      UpdateExpression:
        "SET documents = list_append(if_not_exists(documents, :empty_list), :documentId)",
      ExpressionAttributeValues: {
        ":documentId": [documentId],
        ":empty_list": [],
      },
      ReturnValues: "UPDATED_NEW",
    };

    const { Attributes } = await docClient.send(new UpdateCommand(params));

    await logUserActivity({
      userId: req.body.user_id,
      action: "send_file_to_user",
      targetId: IdOfUser,
      details: { documentId }
    });

    res.status(200).json({
      success: true,
      message: "File sent to user successfully",
      documents: Attributes?.documents,
    });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;

    console.error("Error in SendFileToAUser:", message);
    res.status(500).json({ success: false, message });
  }
};

export const downloadFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { documentId } = req.params;

    const getParams = {
      TableName: "Documents",
      Key: { documentId },
    };

    const { Item: document } = await docClient.send(new GetCommand(getParams));

    if (!document) {
      res.status(404).json({ success: false, message: "Document not found" });
      return;
    }

    await logUserActivity({
      userId: req.body.user_id,
      action: "download_document",
      targetId: documentId,
      details: { filename: document.filename }
    });

    const urlParts = document.fileUrl.split(".amazonaws.com/");
    const key = urlParts[1];

    const getObjectParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    };

    const command = new GetObjectCommand(getObjectParams);
    const { Body, ContentType } = await s3Client.send(command);

    if (!Body) {
      res
        .status(404)
        .json({ success: false, message: "File content not found" });
      return;
    }

    res.setHeader("Content-Type", ContentType || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${document.filename}"`
    );

    if (typeof (Body as any).pipe === "function") {
      (Body as any).pipe(res);
    } else {
      const chunks: Buffer[] = [];
      for await (const chunk of Body as any) {
        chunks.push(Buffer.from(chunk));
      }
      res.end(Buffer.concat(chunks));
    }
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;

    console.error("Error in downloadFile:", message);
    res.status(500).json({ success: false, message });
  }
};

export const getPresignedUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { documentId } = req.params;
    // @ts-ignore
    const user = req.user;

    const getDocParams = {
      TableName: "Documents",
      Key: { documentId },
    };
    const { Item: document } = await docClient.send(
      new GetCommand(getDocParams)
    );

    if (!document) {
      res.status(404).json({ success: false, message: "Document not found" });
      return;
    }

    if (document.uploadedBy !== user.id && user.role !== "admin") {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const urlParts = document.fileUrl.split(".amazonaws.com/");
    const key = urlParts[1];

    const getObjectParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    };
    const getCommand = new GetObjectCommand(getObjectParams);
    const presignedUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 3600,
    });

    res.status(200).json({
      success: true,
      presignedUrl,
    });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;

    console.error("Error in getPresignedUrl:", message);
    res.status(500).json({ success: false, message });
  }
};

export const getMyDocuments = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user.id;
    try {
      const params = {
        TableName: "Documents",
        FilterExpression: "uploadedBy = :uid",
        ExpressionAttributeValues: { ":uid": userId },
      };
      const data = await docClient.send(new ScanCommand(params));
      res.status(200).json({ success: true, data: data.Items });
    } catch (error) {
      console.error("getMyDocuments error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch your documents" });
    }
};

export const deleteDocument = async (req: Request, res: Response) => {
    const { documentId } = req.params;
    // @ts-ignore
    const user = req.user;
    try {
      const { Item: document } = await docClient.send(
        new GetCommand({
          TableName: "Documents",
          Key: { documentId },
        })
      );
      if (!document) {
        res.status(404).json({ success: false, message: "Document not found" });
        return;
      }
      if (document.uploadedBy !== user.id && user.role !== "admin") {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
      }
      await docClient.send(
        new UpdateCommand({
          TableName: "Documents",
          Key: { documentId },
          UpdateExpression: "set isDeleted = :d",
          ExpressionAttributeValues: { ":d": true },
        })
      );
  
      const usersWithDoc = await docClient.send(
        new ScanCommand({
          TableName: "Users",
          FilterExpression: "contains(documents, :docId)",
          ExpressionAttributeValues: { ":docId": documentId },
        })
      );
  
      for (const userItem of usersWithDoc.Items || []) {
        const docIndex = (userItem.documents || []).indexOf(documentId);
        if (docIndex > -1) {
          await docClient.send(
            new UpdateCommand({
              TableName: "Users",
              Key: { user_id: userItem.user_id },
              UpdateExpression: `REMOVE documents[${docIndex}]`,
            })
          );
        }
      }
  
      res.status(200).json({ success: true, message: "Document soft deleted and references removed" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to delete document" });
    }
  };


export const hardDelete = async (req: Request, res: Response) => {
    const { documentId } = req.params;
    // @ts-ignore
    const user = req.user;
    try {
      const { Item: document } = await docClient.send(
        new GetCommand({
          TableName: "Documents",
          Key: { documentId },
        })
      );
      if (!document) {
        res.status(404).json({ success: false, message: "Document not found" });
        return;
      }
      if (document.uploadedBy !== user.id && user.role !== "admin") {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
      }
  
      await docClient.send(
        new DeleteCommand({
          TableName: "Documents",
          Key: { documentId },
        })
      );
  
      const usersWithDoc = await docClient.send(
        new ScanCommand({
          TableName: "Users",
          FilterExpression: "contains(documents, :docId)",
          ExpressionAttributeValues: { ":docId": documentId },
        })
      );
  
      for (const userItem of usersWithDoc.Items || []) {
        const docIndex = (userItem.documents || []).indexOf(documentId);
        if (docIndex > -1) {
          await docClient.send(
            new UpdateCommand({
              TableName: "Users",
              Key: { user_id: userItem.user_id },
              UpdateExpression: `REMOVE documents[${docIndex}]`,
            })
          );
        }
      }
  
      res.status(200).json({ success: true, message: "Document and references deleted" });
    } catch (error) {
      console.error("hardDelete error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete document" });
    }
  };

export const updateDocument = async (req: Request, res: Response) => {
    const { documentId } = req.params;
    // @ts-ignore
    const user = req.user;
    try {
        const { Item: document } = await docClient.send(
            new GetCommand({
                TableName: "Documents",
                Key: { documentId },
            })
        );
        if (!document) {
            res.status(404).json({ success: false, message: "Document not found" });
            return;
        }
        if (document.uploadedBy !== user.id && user.role !== "admin") {
            res.status(403).json({ success: false, message: "Access denied" });
            return;
        }

        if (!req.file) {
            res.status(400).json({ success: false, message: "No file uploaded" });
            return;
        }

        if (document.fileUrl) {
            const urlParts = document.fileUrl.split('.amazonaws.com/');
            const oldKey = urlParts[1];
            if (oldKey) {
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: oldKey,
                }));
            }
        }

        const file = req.file;
        const fileNameWithoutSpaces = file.originalname.replace(/\s/g, "");
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: `uploads/${Date.now()}_${fileNameWithoutSpaces}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        };
        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        const fileUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

        await docClient.send(
            new UpdateCommand({
                TableName: "Documents",
                Key: { documentId },
                UpdateExpression: "set #f = :f, #ft = :ft, #fn = :fn",
                ExpressionAttributeNames: {
                    "#f": "fileUrl",
                    "#ft": "fileType",
                    "#fn": "filename"
                },
                ExpressionAttributeValues: {
                    ":f": fileUrl,
                    ":ft": file.mimetype,
                    ":fn": file.originalname
                },
            })
        );
        res.status(200).json({ success: true, message: "Document file updated" });
    } catch (error) {
        console.error("updateDocument error:", error);
        res
            .status(500)
            .json({ success: false, message: "Failed to update document" });
    }
};