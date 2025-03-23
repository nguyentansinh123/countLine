import express, { Request, Response } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { Readable } from 'stream';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const allowedOrigins = ['http://localhost:5173'];
const uploadDir = path.join(__dirname, 'uploads');

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://sinh123:sinh123@cluster0.je9ds.mongodb.net/lgr?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

  const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  });
  const User = mongoose.model('User', userSchema);
  
  // Auth Routes
  app.post('/register', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword });
      await user.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error });
    }
  });

  app.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user)  {res.status(400).json({ message: 'Invalid credentials' }); return}
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) res.status(400).json({ message: 'Invalid credentials' });
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.status(200).json({ message: 'Logged in successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  });
  app.get('/logout', (req: Request, res: Response) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  });
  
  app.get('/auth-check', (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
         res.status(401).json({ message: 'Not authenticated' });
    }

    jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(200).json({ message: 'Authenticated', userId: decoded.id });
    });
});

// Local file storage setup
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// AWS S3 client setup
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});



const bucketName = process.env.AWS_BUCKET_NAME!;

// Configure Multer for local file storage
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadLocal = multer({ storage: localStorage });

// Configure Multer to use S3 storage
const uploadS3 = multer({
  storage: multerS3({
    s3,
    bucket: bucketName,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `uploads/${Date.now()}-${file.originalname}`);
    },
  }),
});

// Local file upload route
app.post('/upload-local', uploadLocal.single('file'), (req: Request, res: Response): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return resolve();
      }

      const { category } = req.body;
      const fileUrl = new URL(`/uploads/${req.file.filename}`, `http://${req.headers.host}`).toString();
      const metadata = {
        id: `${Date.now()}`,
        title: req.file.originalname.replace('.pdf', ''),
        uploadedBy: 'Current User',
        uploadedAt: new Date().toISOString(),
        status: 'Active',
        fileType: 'PDF',
        location: fileUrl,
        category,
      };

      res.status(200).json({
        message: 'File uploaded successfully!',
        file: req.file.filename,
        metadata,
      });
      resolve();
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Internal server error' });
      reject(error);
    }
  });
});

// S3 file upload route
app.post('/upload-s3', uploadS3.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${(req.file as any).key}`;
    const metadata = {
      id: `${Date.now()}`,
      title: req.file.originalname.replace('.pdf', ''),
      uploadedBy: 'Current User',
      uploadedAt: new Date().toISOString(),
      status: 'Active',
      fileType: 'PDF',
      location: fileUrl,
      category: req.body.category,
    };

    res.status(200).json({
      message: 'File uploaded successfully!',
      fileUrl,
      metadata,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Retrieve file from local storage
app.get('/documents-local/:filename', (req: Request, res: Response): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    fs.exists(filePath, (exists) => {
      if (!exists) {
        res.status(404).json({ error: 'Document not found' });
        return resolve();
      }

      res.sendFile(filePath, (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to send the document' });
          reject(err);
        }
        resolve();
      });
    });
  });
});

// Retrieve file from S3
app.get('/documents-s3/:key', async (req: Request, res: Response): Promise<void> => {
  const { key } = req.params;

  try {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    const response = await s3.send(command);

    res.setHeader('Content-Type', response.ContentType || 'application/pdf');
    if (response.Body) {
      const stream = Readable.from(response.Body as any);
      stream.pipe(res);
    }
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(404).json({ message: 'File not found' });
  }
});

// Delete file from local storage
app.delete('/documents-local/:filename', (req: Request, res: Response): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        res.status(500).json({ message: 'Failed to delete file from server' });
        reject(err);
      }
      res.status(200).json({ message: `Document ${filename} deleted successfully` });
      resolve();
    });
  });
});

// Delete file from S3
app.delete('/documents-s3/:key', async (req: Request, res: Response): Promise<void> => {
  const { key } = req.params;

  try {
    const command = new DeleteObjectCommand({ Bucket: bucketName, Key: key });
    await s3.send(command);

    res.status(200).json({ message: `File ${key} deleted successfully.` });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
});

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.SMTP_USER, // Ensure these are set in your .env file
    pass: process.env.SMTP_PASS,
  },
  debug: true, // Enable debugging
  logger: true, // Log output to console
});

app.post('/sendingMail', async (req: Request, res: Response) => {
  try {
    const { content, email } = req.body;

    // Construct the email body with the embedded signature image (if it exists)
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Agreement',
      html: `
        ${content}
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
