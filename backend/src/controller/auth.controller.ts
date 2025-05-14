import { Request, Response } from "express";
import { validateUser } from "../lib/validate.user";
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../lib/dynamoClient";
import bcrypt from "bcryptjs";
import mjml2html from "mjml";
import { welcomeEmailTemplate } from "../template/WelcomeEmailTemplate";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import { createTransporter } from "../lib/nodemailer";

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

    const emailCheckResult = await docClient.send(
      new QueryCommand(emailCheckParams)
    );
    if (emailCheckResult.Items && emailCheckResult.Items.length > 0) {
      throw new Error("Email already exists");
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const { html } = mjml2html(welcomeEmailTemplate(name));
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Our App",
      html: html,
    };

    // Debugging

    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);

    console.log("Transporter config:", transporter);
    console.log("SMTP_USER:", process.env.SMTP_USER);
    console.log("SMTP_PASS:", process.env.SMTP_PASS);

    const insertParams = {
      TableName: "Users",
      Item: {
        ...validatedUser,
        password: hashedPassword,
      },
    };
    const data = await docClient.send(new PutCommand(insertParams));

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const token = jwt.sign(
      { id: validatedUser.user_id },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );
    res.cookie("tdToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "User registered successfully",
      data: {
        user_id: validatedUser.user_id,
        name: validatedUser.name,
        email: validatedUser.email,
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

    const emailCheckResult = await docClient.send(
      new QueryCommand(emailCheckParams)
    );
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
    console.log("USER_ID in auth.controller", user_id);

    if (!user_id) throw new Error("User_id missing in request");
    const getParams = {
      TableName: "Users",
      Key: { user_id },
    };
    console.log("Looking for user_id:", user_id);
    console.log("Type of user_id:", typeof user_id);
    const userResult = await docClient.send(new GetCommand(getParams));
    console.log(userResult);
    if (!userResult.Item) {
      throw new Error("User not found");
    }
    const user = userResult.Item;

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
    const transporter = createTransporter();
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
    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
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
    const transporter = createTransporter();
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
      UpdateExpression:
        "SET password = :password, resetOTP = :emptyOtp, resetOTPExpireAt = :zero",
      ExpressionAttributeValues: {
        ":password": hashedPassword,
        ":emptyOtp": "",
        ":zero": 0,
      },
      ReturnValues: "UPDATED_NEW",
    };

    await docClient.send(new UpdateCommand(updateParams));
    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;

    console.error("Error in resetPassword:", message);
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
};
