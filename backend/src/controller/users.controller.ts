import { Request, Response } from "express";
import {
  ScanCommand,
  QueryCommand,
  GetCommand,
  BatchGetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../lib/dynamoClient";
import { v2 } from "../lib/cloudinary";
import { logUserActivity } from "./activity.controller";

import { User } from "../types/User";
import { ReturnValue } from "@aws-sdk/client-dynamodb";

const getAllUser = async (req: Request, res: Response) => {
  try {
    const scanParams = {
      TableName: "Users",
    };
    const data = await docClient.send(new ScanCommand(scanParams));
    const moreSecuredData = data.Items?.map((user) => {
      const { password, ...moreSecuredData } = user;
      return moreSecuredData;
    });

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: moreSecuredData,
    });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;

    console.error("Error in getAllUser:", message);
    res.status(500).json({ success: false, message });
  }
};

const getSingleUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const queryParams = {
      TableName: "Users",
      KeyConditionExpression: "user_id = :user_id",
      ExpressionAttributeValues: {
        ":user_id": id,
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
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;

    console.error("Error in getSingleUser:", message);
    res.status(500).json({ success: false, message });
  }
};

const getAllUserDocuments = async (req: Request, res: Response) => {
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
    const { Responses: documents } = await docClient.send(
      new BatchGetCommand(documentParams)
    );

    res.status(200).json({
      success: true,
      message: "Documents fetched successfully",
      data: documents?.Documents || [],
    });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;

    console.error("Error in getSingleUser:", message);
    res.status(500).json({ success: false, message });
  }
};

const getSingleUserDocument = async (req: Request, res: Response) => {
  try {
    const { documentID } = req.params;
    const { user_id } = req.body;

    if (!documentID) {
      res
        .status(400)
        .json({ success: false, message: "Document ID is required" });
      return;
    }

    const documentParams = {
      TableName: "Documents",
      Key: {
        documentId: documentID,
      },
    };

    const { Item: document } = await docClient.send(
      new GetCommand(documentParams)
    );

    if (!document) {
      res.status(404).json({ success: false, message: "Document not found" });
      return;
    }

    await logUserActivity({
      userId: req.body.user_id,
      action: "get_single_user_document",
      targetId: documentID,
    });

    res.status(200).json({
      success: true,
      message: "Document fetched successfully",
      data: document,
    });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;

    console.error("Error in getSingleUserDocument:", message);
    res.status(500).json({ success: false, message });
  }
};

const updateUserProfile = async (req: Request, res: Response) => {
  const user_id = req.body.user_id;
  const { name, email, profilePicture } = req.body;

  const params = {
    TableName: "Users",
    Key: { user_id: user_id },
    UpdateExpression: `set #name = :name, email = :email, profilePicture = :profilePicture`,
    ExpressionAttributeNames: {
      "#name": "name",
    },
    ExpressionAttributeValues: {
      ":name": name,
      ":email": email,
      ":profilePicture": profilePicture,
    },
    ReturnValues: "ALL_NEW" as const,
  };

  try {
    const result = await docClient.send(new UpdateCommand(params));
    res.status(200).json(result.Attributes);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

const updateProfilePic = async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user?.id;
    const { name, email, profilePicture } = req.body;

    if (!profilePicture) {
      res.status(400).json({
        success: false,
        message: "Profile picture is required",
      });
      return;
    }

    const uploadResponse = await v2.uploader.upload(profilePicture, {
      folder: "profile-pictures",
      transformation: { width: 500, height: 500, crop: "fill" },
    });

    const params = {
      TableName: "Users",
      Key: { user_id },
      UpdateExpression: "SET profilePicture = :profilePicture",
      ExpressionAttributeValues: {
        ":profilePicture": uploadResponse.secure_url,
      },
      ReturnValues: "ALL_NEW" as const,
    };

    const { Attributes: updatedUser } = await docClient.send(
      new UpdateCommand(params)
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      user: {
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;

    console.error("Error updating profile picture:", message);
    res.status(500).json({
      success: false,
      message: "Failed to update profile picture",
      error: message,
    });
  }
};

const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: user_id } = req.params;

    if (!user_id) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      });
      return;
    }

    const getUserParams = {
      TableName: "Users",
      Key: { user_id },
    };

    const userData = await docClient.send(new GetCommand(getUserParams));

    if (!userData.Item) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (userData.Item.profilePicture) {
      try {
        const urlParts = userData.Item.profilePicture.split("/");
        const publicId = urlParts[urlParts.length - 1].split(".")[0];

        await v2.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.warn("Cloudinary cleanup warning:", cloudinaryError);
      }
    }

    const deleteParams = {
      TableName: "Users",
      Key: { user_id },
    };

    await docClient.send(new DeleteCommand(deleteParams));

    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("User deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user account",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getUserByName = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      res.status(400).json({
        success: false,
        message: "Name body parameter is required and must be a string",
      });
      return;
    }

    const queryParams = {
      TableName: "Users",
      IndexName: "NameIndex",
      KeyConditionExpression: "#name = :name",
      ExpressionAttributeNames: {
        "#name": "name",
      },
      ExpressionAttributeValues: {
        ":name": name,
      },
    };

    const result = await docClient.send(new QueryCommand(queryParams));

    if (!result.Items || result.Items.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const users = result.Items.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.status(200).json({
      success: true,
      message: "User(s) found successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching user by name:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user by name",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const searchUsersByName = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { term } = req.query;

  if (typeof term !== "string" || !term.trim()) {
    res.status(400).json({
      success: false,
      message: "Valid search term is required (e.g. ?term=j)",
    });
    return;
  }

  const searchTerm = term.trim().toLowerCase();
  const MAX_RESULTS = 10;

  try {
    const scanParams = {
      TableName: "Users",
      ProjectionExpression: "#uid, #nm, #em, #rl, #pp",
      ExpressionAttributeNames: {
        "#uid": "user_id",
        "#nm": "name",
        "#em": "email",
        "#rl": "role",
        "#pp": "profilePicture",
      },
      Limit: 100,
    };

    const result = await docClient.send(new ScanCommand(scanParams));

    const filteredUsers = (result.Items || [])
      .filter((user) => user.name?.toLowerCase().includes(searchTerm))
      .slice(0, MAX_RESULTS)
      .map(({ password, verifyOTP, resetOTP, ...rest }) => rest);

    res.status(200).json({
      success: true,
      count: filteredUsers.length,
      data: filteredUsers,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
};

const MAX_RECENT_SEARCHES = 3;

const addRecentSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id } = req.body;
    const { searchedUserId, searchedUserName, searchedUserProfilePicture } =
      req.body;

    if (!user_id || !searchedUserId || !searchedUserName) {
      res.status(400).json({
        success: false,
        message: "User ID, searched user ID and name are required",
      });
      return;
    }

    const getUserParams = {
      TableName: "Users",
      Key: { user_id },
    };

    const { Item: user } = await docClient.send(new GetCommand(getUserParams));

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const currentSearches = user.recentSearches || [];

    const updatedSearches = currentSearches.filter(
      (search: any) => search.userId !== searchedUserId
    );

    updatedSearches.unshift({
      userId: searchedUserId,
      name: searchedUserName,
      profilePicture: searchedUserProfilePicture,
      timestamp: Date.now(),
    });

    const finalSearches = updatedSearches.slice(0, MAX_RECENT_SEARCHES);

    const updateParams = {
      TableName: "Users",
      Key: { user_id },
      UpdateExpression: "SET recentSearches = :recentSearches",
      ExpressionAttributeValues: {
        ":recentSearches": finalSearches,
      },
      ReturnValues: "UPDATED_NEW" as const,
    };

    const { Attributes: updatedUser } = await docClient.send(
      new UpdateCommand(updateParams)
    );

    res.status(200).json({
      success: true,
      message: "Recent search added successfully",
      data: updatedUser?.recentSearches,
    });
  } catch (error) {
    console.error("Error adding recent search:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add recent search",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getRecentSearches = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      });
      return;
    }

    const getUserParams = {
      TableName: "Users",
      Key: { user_id },
      ProjectionExpression: "recentSearches",
    };

    const { Item: user } = await docClient.send(new GetCommand(getUserParams));

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const recentSearches = user.recentSearches || [];

    res.status(200).json({
      success: true,
      message: "Recent searches fetched successfully",
      data: recentSearches,
    });
  } catch (error) {
    console.error("Error fetching recent searches:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent searches",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const reassignUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, newRole } = req.body;
    const { user_id } = req.body;

    if (!userId || !newRole) {
      res.status(400).json({
        success: false,
        message: "User ID and new role are required",
      });
      return;
    }

    const allowedRoles = ["employee", "client", "intern", "admin", "user"];
    if (!allowedRoles.includes(newRole)) {
      res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles are: ${allowedRoles.join(", ")}`,
      });
      return;
    }

    const getUserParams = {
      TableName: "Users",
      Key: { user_id: userId },
    };

    const userData = await docClient.send(new GetCommand(getUserParams));

    if (!userData.Item) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    console.log(
      `Role change requested by Admin (${user_id}) - Changing ${userId} from ${userData.Item.role} to ${newRole}`
    );

    if (userId === user_id) {
      res.status(403).json({
        success: false,
        message: "You cannot change your own role",
      });
      return;
    }

    const updateParams = {
      TableName: "Users",
      Key: { user_id: userId },
      UpdateExpression: "SET #role = :newRole",
      ExpressionAttributeNames: {
        "#role": "role",
      },
      ExpressionAttributeValues: {
        ":newRole": newRole,
      },
      ReturnValues: "ALL_NEW" as const,
    };

    const { Attributes: updatedUser } = await docClient.send(
      new UpdateCommand(updateParams)
    );

    if (!updatedUser) {
      res.status(500).json({
        success: false,
        message: "Failed to update user role",
      });
      return;
    }

    const { password, ...userWithoutPassword } = updatedUser;

    await logUserActivity({
      userId: req.body.user_id,
      action: "reassign_user_role",
      targetId: userId,
      details: { newRole },
    });

    console.log(`Role successfully changed for user ${userId} to ${newRole}`);

    res.status(200).json({
      success: true,
      message: `User role updated to ${newRole} successfully`,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error reassigning user role:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reassign user role",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export {
  getAllUser,
  getSingleUser,
  getAllUserDocuments,
  getSingleUserDocument,
  updateProfilePic,
  deleteUser,
  getUserByName,
  searchUsersByName,
  getRecentSearches,
  addRecentSearch,
};
