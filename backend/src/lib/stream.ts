import { StreamChat, UserResponse } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or Secret is missing");
  throw new Error("Stream API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

interface StreamUserData {
  id: string;
  name?: string;
  image?: string;
  [key: string]: any;
}

export const upsertStreamUser = async (userData: StreamUserData): Promise<StreamUserData | undefined> => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    return undefined;
  }
};

export const generateStreamToken = (userId: string | number): string | undefined => {
  try {
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
    return undefined;
  }
};