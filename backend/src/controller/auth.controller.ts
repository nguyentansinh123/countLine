import { Request, Response } from "express";
import { validateUser } from "../lib/validate.user";
import { PutCommand, QueryCommand, UpdateCommand, UpdateCommandInput, GetCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../lib/dynamoClient";
import { UserSchema } from "../model/user.model";
import bcrypt from "bcryptjs";
import mjml2html from "mjml";
import { welcomeEmailTemplate } from "../template/WelcomeEmailTemplate";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { transporter } from "../lib/nodemailer";
import { log } from "console";
import { logUserActivity } from "./activity.controller";
import { upsertStreamUser, generateStreamToken } from "../lib/stream";
dotenv.config();

const Register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const validatedUser = validateUser({ name, email, password });
    const emailCheckParams = {
      TableName: "Users",
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };
    console.log("hello before emailCheckResult");
    let emailCheckResult;
    try {
      emailCheckResult = await docClient.send(new QueryCommand(emailCheckParams));
      console.log("hello1");
    } catch (err) {
      console.error("❌ QueryCommand error:", err);
    }
    console.log("hello after emailCheckResult");

    if (emailCheckResult?.Items && emailCheckResult.Items.length > 0) {
      throw new Error("Email already exists");
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertParams = {
      TableName: "Users",
      Item: {
        ...validatedUser,
        password: hashedPassword,
      },
    };
    console.log("AWS ENV:", {
      key: process.env.AWS_ACCESS_KEY_ID,
      secret: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
    const data = await docClient.send(new PutCommand(insertParams));
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    try {
      await upsertStreamUser({
        id: validatedUser.user_id,
        name: validatedUser.name,
        image: randomAvatar,
      });
      console.log(`Stream user created for ${validatedUser.name}`);
    } catch (streamError) {
      console.error("Error creating Stream user:", streamError);
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign({ id: validatedUser.user_id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });
    res.cookie("tdToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { html } = mjml2html(welcomeEmailTemplate(name));
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Our App",
      html: html,
    };

    await transporter.sendMail(mailOptions);

    const streamToken = generateStreamToken(validatedUser.user_id);

    res.status(200).json({
      success: true,
      message: "User registered successfully",
      data: {
        user_id: validatedUser.user_id,
        name: validatedUser.name,
        email: validatedUser.email,
        streamToken: streamToken, 
      },
    });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    console.log(message);
    res.status(500).json({ success: false, message: message });
  }
};
const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const emailCheckParams = {
      TableName: "Users",
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };

    const emailCheckResult = await docClient.send(new QueryCommand(emailCheckParams));
    if (!emailCheckResult.Items || emailCheckResult.Items.length === 0) {
      throw new Error("User not found");
    }
    const user = emailCheckResult.Items[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });

    res.cookie("tdToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    console.log(message);
    res.status(500).json({ success: false, message: message });
  }
};
const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("tdToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.status(200).json({ success: true, message: "log out" });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    console.log(message);
    res.status(500).json({ success: false, message: message });
  }
};
const sendVerifyOtp = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;
    const idCheckParams = {
      TableName: "Users",
      KeyConditionExpression: "user_id = :user_id",
      ExpressionAttributeValues: {
        ":user_id": user_id,
      },
    };
    const userResult = await docClient.send(new QueryCommand(idCheckParams));
    if (!userResult.Items || userResult.Items.length === 0) {
      throw new Error("User not found");
    }
    const user = userResult.Items[0];

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const verifyOTPExpiredAt = Date.now() + 24 * 60 * 60 * 1000;

    const updateParams: UpdateCommandInput = {
      TableName: "Users",
      Key: {
        user_id: user_id,
      },
      UpdateExpression: "SET verifyOTP = :otp, verifyOTPExpiredAt = :expiry",
      ExpressionAttributeValues: {
        ":otp": otp,
        ":expiry": verifyOTPExpiredAt,
      },
      ReturnValues: "UPDATED_NEW", // Use the correct enum value
    };

    await docClient.send(new UpdateCommand(updateParams));

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Your OTP for Verification",
      text: `Your OTP is: ${otp}. It will expire in 24 hours.`,
    };
    console.log(mailOptions, "mailOptions");
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Verified OTP send on Email" });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    console.error("Error in sendVerifyOtp:", message);
    res.status(500).json({ success: false, message });
  }
};
const getUserById = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;

    const idCheckParams = {
      TableName: "Users",
      KeyConditionExpression: "user_id = :user_id",
      ExpressionAttributeValues: {
        ":user_id": user_id,
      },
    };
    const user = await docClient.send(new QueryCommand(idCheckParams));
    res.json({ success: true, data: user.Items });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    console.log(message);
    res.status(500).json({ success: false, message: message });
  }
};
const verifiedEmail = async (req: Request, res: Response) => {
  const { user_id, otp } = req.body;

  if (!user_id || !otp) {
    res.status(400).json({ success: false, message: "Missing user_id or OTP" });
    throw new Error("Missing user_id or OTP");
  }

  try {
    const idCheckParams = {
      TableName: "Users",
      KeyConditionExpression: "user_id = :user_id",
      ExpressionAttributeValues: {
        ":user_id": user_id,
      },
    };
    const userResult = await docClient.send(new QueryCommand(idCheckParams));

    if (!userResult.Items || userResult.Items.length === 0) {
      throw new Error("User not found");
    }
    const user = userResult.Items[0];

    if (!user.verifyOTP || user.verifyOTP !== otp) {
      res.status(400).json({ success: false, message: "Invalid OTP" });
      throw new Error("Invalid OTP");
    }

    if (user.verifyOTPExpiredAt < Date.now()) {
      res.status(400).json({ success: false, message: "OTP expired" });
      throw new Error("OTP expired");
    }

    const updateParams: UpdateCommandInput = {
      TableName: "Users",
      Key: {
        user_id: user_id,
      },
      UpdateExpression:
        "SET isAccountVerified = :verified, verifyOTP = :emptyOtp, verifyOTPExpiredAt = :zero",
      ExpressionAttributeValues: {
        ":verified": true,
        ":emptyOtp": "",
        ":zero": 0,
      },
      ReturnValues: "UPDATED_NEW",
    };

    await docClient.send(new UpdateCommand(updateParams));
    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    console.error("Error in verifiedEmail:", message);
    res.status(500).json({ success: false, message });
  }
};
const isAuthenticated = (req: Request, res: Response) => {
  try {
    console.log(req.body.user_id);
    res.json({ success: true, message: "User is authenticated" });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    console.error("Error in verifiedEmail:", message);
    res.status(500).json({ success: false, message });
  }
};
const sendResetOtp = async (req: Request, res: Response) => {
  console.log("here");

  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    throw new Error("Email is required");
  }
  try {
    const emailCheckParams = {
      TableName: "Users",
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };
    const userResult = await docClient.send(new QueryCommand(emailCheckParams));
    if (!userResult.Items || userResult.Items.length === 0) {
      res.status(404).json({ success: false, message: "User not found" });
      throw new Error("User not found");
    }
    const user = userResult.Items[0];

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const resetOTPExpireAt = Date.now() + 15 * 60 * 1000;

    const updateParams: UpdateCommandInput = {
      TableName: "Users",
      Key: {
        user_id: user.user_id, // Primary key
      },
      UpdateExpression: "SET resetOTP = :otp, resetOTPExpireAt = :expiry",
      ExpressionAttributeValues: {
        ":otp": otp,
        ":expiry": resetOTPExpireAt,
      },
      ReturnValues: "UPDATED_NEW",
    };
    await docClient.send(new UpdateCommand(updateParams));

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP will expire in 15 minutes: ${otp}`,
    };
    console.log(mailOptions, "mailOptions");
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;

    console.error("Error in sendResetOtp:", message);
    res.status(500).json({ success: false, message });
  }
};
const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    res.status(400).json({ success: false, message: "Missing details" });
    throw new Error("Missing details");
  }
  try {
    const emailCheckParams = {
      TableName: "Users",
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };

    const userResult = await docClient.send(new QueryCommand(emailCheckParams));
    if (!userResult.Items || userResult.Items.length === 0) {
      res.status(404).json({ success: false, message: "User not found" });
      throw new Error("User not found");
    }

    const user = userResult.Items[0];

    if (!user.resetOTP || user.resetOTP !== otp) {
      res.status(400).json({ success: false, message: "Invalid OTP" });
      throw new Error("Invalid OTP");
    }

    if (user.resetOTPExpireAt < Date.now()) {
      res.status(400).json({ success: false, message: "OTP expired" });
      throw new Error("OTP expired");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateParams: UpdateCommandInput = {
      TableName: "Users",
      Key: {
        user_id: user.user_id, // Primary key
      },
      UpdateExpression: "SET password = :password, resetOTP = :emptyOtp, resetOTPExpireAt = :zero",
      ExpressionAttributeValues: {
        ":password": hashedPassword,
        ":emptyOtp": "",
        ":zero": 0,
      },
      ReturnValues: "UPDATED_NEW",
    };

    await docClient.send(new UpdateCommand(updateParams));
    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;

    console.error("Error in resetPassword:", message);
    res.status(500).json({ success: false, message });
  }
};

const adminCreateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, role } = req.body;
    const userId = req.body.user_id;
    
    const userParams = {
      TableName: "Users",
      Key: { user_id: userId }
    };
    
    const { Item: adminUser } = await docClient.send(new GetCommand(userParams));
    
    if (!adminUser || !adminUser.role || adminUser.role !== "admin") {
      res.status(403).json({ 
        success: false, 
        message: "Forbidden - Admin access required" 
      });
      return; 
    }
    
    if (!name || !email) {
      res.status(400).json({ 
        success: false, 
        message: "Name and email are required" 
      });
      return; 
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ 
        success: false, 
        message: "Invalid email format" 
      });
      return;
    }
    
    const emailCheckParams = {
      TableName: "Users",
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };
    
    const emailCheckResult = await docClient.send(new QueryCommand(emailCheckParams));
    
    if (emailCheckResult?.Items && emailCheckResult.Items.length > 0) {
      res.status(400).json({ 
        success: false, 
        message: "Email already exists" 
      });
      return; 
    }
    
    const password = "12345";
    
    const validatedUser = validateUser({ name, email, password });
    
    validatedUser.role = role;
    validatedUser.isAccountVerified = true;
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const insertParams = {
      TableName: "Users",
      Item: {
        ...validatedUser,
        password: hashedPassword,
      },
    };
    
    await docClient.send(new PutCommand(insertParams));
    
    const { html } = mjml2html(`
      <mjml>
        <mj-body>
          <mj-section>
            <mj-column>
              <mj-text font-size="20px" font-weight="bold">Welcome to Our App</mj-text>
              <mj-text>Hello ${name},</mj-text>
              <mj-text>An administrator has created an account for you.</mj-text>
              <mj-divider border-color="#F45E43"></mj-divider>
              <mj-text><strong>Your login credentials:</strong></mj-text>
              <mj-text><strong>Email:</strong> ${email}</mj-text>
              <mj-text><strong>Password:</strong> ${password}</mj-text>
              <mj-text>Please change your password after logging in for the first time.</mj-text>
              <mj-spacer height="20px" />
              <mj-text>Best regards,</mj-text>
              <mj-text>The Admin Team</mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `);
    
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Your New Account",
      html: html,
    };
    
    await transporter.sendMail(mailOptions);
    
    await logUserActivity({
      userId: userId,
      action: "admin_create_user",
      targetId: validatedUser.user_id,
      details: { 
        email,
        role: role
      }
    });
    
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user_id: validatedUser.user_id,
        name: validatedUser.name,
        email: validatedUser.email,
        role: validatedUser.role
      },
    });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    console.error("Error in adminCreateUser:", message);
    res.status(500).json({ success: false, message });
  }
};

export {
  Login,
  Register,
  logout,
  sendVerifyOtp,
  verifiedEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
  getUserById,
  adminCreateUser,
};
