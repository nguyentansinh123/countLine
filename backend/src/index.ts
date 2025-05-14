import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
<<<<<<< HEAD
import { docClient } from './lib/dynamoClient';
import {router as AuthRoute} from './routes/auth.route'
import {router as UserRoute} from './routes/users.route'
import {router as DocumentRoute} from './routes/document.route'
import {router as TeamRoute} from './routes/team.route'
import {router as ProjectRoute} from './routes/project.route'
import {router as ActivityRoute} from './routes/actitvity.route'
import http from 'http';
import { initSocket } from './lib/socket';
=======
import { docClient } from "./lib/dynamoClient";
import { router as AuthRoute } from "./routes/auth.route";
import { router as UserRoute } from "./routes/users.route";
import { router as DocumentRoute } from "./routes/document.route";
import { router as TeamRoute } from "./routes/team.route";
import { router as ProjectRoute } from "./routes/project.route";
>>>>>>> 592dc2a (user, auth, project routes are connected, added otp page)

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = ["http://localhost:5173"];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());
<<<<<<< HEAD
app.use('/api/auth', AuthRoute)
app.use('/api/users', UserRoute)
app.use('/api/document', DocumentRoute)
app.use('/api/team', TeamRoute)
app.use('/api/project', ProjectRoute)
app.use('/api/history', ActivityRoute)

const server = http.createServer(app);
initSocket(server);

=======
app.use("/api/auth", AuthRoute);
app.use("/api/users", UserRoute);
app.use("/api/document", DocumentRoute);
app.use("/api/team", TeamRoute);
app.use("/api/project", ProjectRoute);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
>>>>>>> 592dc2a (user, auth, project routes are connected, added otp page)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
