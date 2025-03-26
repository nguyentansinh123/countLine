import { Request, Response } from "express";
import { ScanCommand,QueryCommand, GetCommand, BatchGetCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from '../lib/dynamoClient';
import { v2 } from "../lib/cloudinary";


const getAllUser = async (req: Request, res:Response) => {
    try {
        const scanParams = {
            TableName: 'Users', 
          };
        const data = await docClient.send(new ScanCommand(scanParams));
        const moreSecuredData = data.Items?.map(user => {
            const { password, ...moreSecuredData } = user; 
            return moreSecuredData;
          });

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: moreSecuredData,
          });
    } catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
    
        console.error("Error in getAllUser:", message);
        res.status(500).json({ success: false, message });
    }
  }

  const getSingleUser = async (req: Request, res:Response) => {
    try {
        const {id} = req.params;

        const queryParams = {
            TableName: 'Users', 
            KeyConditionExpression: 'user_id = :user_id',
            ExpressionAttributeValues: {
              ':user_id': id,
            },
          };

          const result = await docClient.send(new QueryCommand(queryParams));

          if (!result.Items || result.Items.length === 0) {
            res.status(404).json({ success: false, message: "User not found" });
            throw new Error("User not found");
          }
          const user = result.Items[0];
          const { password, ...userWithoutPassword } = user;
          
          res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: userWithoutPassword,
          });

    } catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
    
        console.error("Error in getSingleUser:", message);
        res.status(500).json({ success: false, message });
    }
  }

  const getAllUserDocuments = async (req: Request, res:Response) => {
    try {

      const { user_id } = req.body;

      if (!user_id) {
        res.status(400).json({ success: false, message: "User ID is required" });
        return;
    }

      const userParams = {
        TableName: "Users",
        Key: {
            user_id: user_id, 
        },
    };

      const { Item: user } = await docClient.send(new GetCommand(userParams));

      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
      const documentIds = user.documents || [];

      if (documentIds.length === 0) {
        res.status(200).json({
            success: true,
            message: "No documents found for this user",
            data: [],
        });
        return;
    }

    const documentParams = {
      RequestItems: {
          Documents: {
              Keys: documentIds.map((documentId: string) => ({ documentId })),
          },
      },
  };
  const { Responses: documents } = await docClient.send(new BatchGetCommand(documentParams));

  res.status(200).json({
    success: true,
    message: "Documents fetched successfully",
    data: documents?.Documents || [],
  });
      
    } catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;
  
      console.error("Error in getSingleUser:", message);
      res.status(500).json({ success: false, message });
    }
  }

  const getSingleUserDocument = async (req: Request, res:Response) => {
    try {
      const { documentID } = req.params; 
      const { user_id } = req.body;

      if (!documentID) {
        res.status(400).json({ success: false, message: "Document ID is required" });
        return
    }

      const documentParams = {
        TableName: "Documents",
        Key: {
            documentId: documentID,
        },
    };

    const { Item: document } = await docClient.send(new GetCommand(documentParams));

      if (!document) {
        res.status(404).json({ success: false, message: "Document not found" });
        return
    }

      res.status(200).json({
        success: true,
        message: "Document fetched successfully",
        data: document,
    });

    } catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;

      console.error("Error in getSingleUserDocument:", message);
      res.status(500).json({ success: false, message });
    }

  }

  const updateProfilePic = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.body;
        const { profilePicture } = req.body;

        if (!profilePicture) {
            res.status(400).json({
                success: false,
                message: 'Profile picture is required'
            });
            return
        }

        const uploadResponse = await v2.uploader.upload(profilePicture, {
            folder: 'profile-pictures',
            transformation: { width: 500, height: 500, crop: 'fill' }
        });

        const params = {
            TableName: 'Users',
            Key: { user_id },
            UpdateExpression: 'SET profilePicture = :profilePicture',
            ExpressionAttributeValues: {
                ':profilePicture': uploadResponse.secure_url,
            },
            ReturnValues: 'ALL_NEW' as const
        };

        const { Attributes: updatedUser } = await docClient.send(new UpdateCommand(params));

        if (!updatedUser) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return
        }

        res.status(200).json({
            success: true,
            message: 'Profile picture updated successfully',
            user: {
                profilePicture: updatedUser.profilePicture
            }
        });

    } catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;

        console.error("Error updating profile picture:", message);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update profile picture',
            error: message 
        });
    }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
      const { user_id } = req.body;

      if (!user_id) {
          res.status(400).json({
              success: false,
              message: 'user_id is required'
          });
          return
      }

      const getUserParams = {
          TableName: 'Users',
          Key: { user_id }
      };
      
      const userData = await docClient.send(new GetCommand(getUserParams));
      
      if (!userData.Item) {
          res.status(404).json({
              success: false,
              message: 'User not found'
          });
          return
      }

      if (userData.Item.profilePicture) {
          try {
              const urlParts = userData.Item.profilePicture.split('/');
              const publicId = urlParts[urlParts.length - 1].split('.')[0];
              
              await v2.uploader.destroy(publicId);
          } catch (cloudinaryError) {
              console.warn('Cloudinary cleanup warning:', cloudinaryError);
          }
      }

      const deleteParams = {
          TableName: 'Users',
          Key: { user_id }
      };

      await docClient.send(new DeleteCommand(deleteParams));

      res.clearCookie('tdToken');

      res.status(200).json({
          success: true,
          message: 'User account deleted successfully'
      });

  } catch (error) {
      console.error('User deletion error:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to delete user account',
          error: error instanceof Error ? error.message : 'Unknown error'
      });
  }
};

export {getAllUser,getSingleUser,getAllUserDocuments,getSingleUserDocument,updateProfilePic,deleteUser} ;