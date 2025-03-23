import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from './lib/dynamoClient';
import {router as AuthRoute} from './routes/auth.route'
import {router as UserRoute} from './routes/users.route'
import {router as DocumentRoute} from './routes/document.route'

dotenv.config();



const app = express();
const PORT = process.env.PORT || 5000;


const allowedOrigins = ['http://localhost:5173'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', AuthRoute)
app.use('/api/users', UserRoute)
app.use('/api/document', DocumentRoute)

app.post('/users', async (req, res) => {
  const { user_id, name, age } = req.body;

  const params = {
    TableName: 'Users',
    Item: {
      user_id, 
      name,   
      age
    }
  };

  try {
    const data = await docClient.send(new PutCommand(params));
    res.status(200).json({ message: "User inserted successfully", data });
  } catch (err) {
    console.error("Error inserting user:", err);
    res.status(500).json({ error: "Error inserting user" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
