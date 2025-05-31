# White Knight

A full-stack application consisting of a high-performance front end (built with Vite, React.js, and TypeScript) and a feature-rich back end (built with Express.js, TypeScript, and AWS SDK). The front end and back end live in separate directories (`frontend/` and `backend/`) within this repository.

---

## Table of Contents

1. [Overview](#overview)  
2. [Tech Stack](#tech-stack)  
3. [Libraries & Dependencies](#libraries--dependencies)  
   - [Front End](#front-end)  
   - [Back End](#back-end)  
4. [Environment Variables](#environment-variables)  
   - [Front End](#front-end-env)  
   - [Back End](#back-end-env)  
5. [Project Structure](#project-structure)  
6. [Available NPM Scripts](#available-npm-scripts)  
   - [Front End](#front-end-scripts)  
   - [Back End](#back-end-scripts)  
7. [AWS S3 Bucket CORS Configuration](#aws-s3-bucket-cors-configuration)  
8. [DynamoDB Tables](#dynamodb-tables)  
9. [Contributing](#contributing)  
10. [License](#license)  

---

## Overview

**White Knight** is a two-part application:

- **Front End**: A fast, responsive SPA built with Vite, React.js, and TypeScript. It uses Tailwind CSS for styling, Zustand for state management, and integrates with various third-party UI libraries (Ant Design, Syncfusion PDF Viewer, Stream Chat, etc.).  
- **Back End**: A TypeScript-powered Express.js server that uses AWS services (DynamoDB, S3, S3 pre-signed URLs) as well as MongoDB for certain features. It handles authentication (JWT), file uploads (Multer + S3), real-time communication (Socket.io), email (Nodemailer + MJML), and third-party integrations (Stream Chat, Cloudinary).

This README collects all necessary information—tech stack, dependencies, environment variables, folder structure, scripts, and AWS configurations—into a single reference.

---

## Tech Stack

### Front End

- **Vite**: Fast build tool with built-in HMR (Hot Module Replacement)  
- **React.js**: Component-based UI library  
- **TypeScript**: Static typing for safer, more predictable code  
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development  
- **React Router v7**: Declarative client-side routing  
- **Zustand**: Lightweight state-management library  
- **Axios**: Promise-based HTTP client for RESTful API calls  
- **Socket.io (client)**: Real-time communication with the back end  
- **Ant Design**: UI component library (`antd` + `@ant-design/icons`)  
- **Syncfusion PDF Viewer**: Embeddable PDF viewing  
- **Stream Chat (client)**: Real-time chat SDK for React  

### Back End

- **Node.js + Express.js**: Server framework for building RESTful APIs and WebSocket endpoints  
- **TypeScript**: Static typing and improved maintainability  
- **AWS SDK (v3)**: Interact with DynamoDB, S3, S3 Pre-signed URLs, etc.  
- **MongoDB + Mongoose**: Document database for user accounts and other collections  
- **JWT (jsonwebtoken)**: Token-based authentication/authorization  
- **bcryptjs**: Password hashing  
- **Multer + `multer-s3`**: Handling file uploads directly to S3  
- **Socket.io (server)**: Real-time, bi-directional communication (for notifications, chat, etc.)  
- **Cloudinary**: Image transformation/storage (optional feature)  
- **Nodemailer + MJML**: HTML email generation and sending (e.g., account verification)  
- **Stream Chat (server)**: Back-end integration for real-time chat channels  

---

## Libraries & Dependencies

Below are the exact dependencies and devDependencies from each `package.json`.

### Front End

```jsonc
// frontend/package.json
{
  "name": "my-react-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@ant-design/icons": "^5.6.1",
    "@pdfme/common": "^5.3.15",
    "@pdfme/ui": "^5.3.15",
    "@stream-io/video-react-sdk": "^1.18.1",
    "@syncfusion/ej2-react-pdfviewer": "^29.1.35",
    "@types/moment": "^2.11.29",
    "@types/recharts": "^1.8.29",
    "antd": "^5.24.2",
    "axios": "^1.8.4",
    "crypto-js": "^4.2.0",
    "framer-motion": "^12.15.0",
    "moment": "^2.30.1",
    "moveable": "^0.53.0",
    "pdf-lib": "^1.17.1",
    "pdfjs-dist": "^4.10.38",
    "re-resizable": "^6.11.2",
    "react": "^19.0.0",
    "react-charts": "^3.0.0-beta.57",
    "react-dom": "^19.0.0",
    "react-draggable": "^4.4.6",
    "react-moveable": "^0.56.0",
    "react-pdf": "^9.2.1",
    "react-router-dom": "^7.2.0",
    "recharts": "^2.15.3",
    "socket.io-client": "^4.8.1",
    "stream-chat": "^9.3.0",
    "stream-chat-react": "^13.0.5",
    "suneditor": "^2.47.5",
    "suneditor-react": "^3.6.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.21.0",
    "@types/crypto-js": "^4.2.2",
    "@types/pdfjs-dist": "^2.10.377",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.21.0",
    "eslint-config-prettier": "^10.0.2",
    "eslint-plugin-prettier": "^5.2.3",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "globals": "^15.15.0",
    "prettier": "^3.5.3",
    "typescript": "~5.7.2",
    "typescript-eslint": "^8.24.1",
    "vite": "^6.2.0"
  }
}
// backend/package.json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "ts-node src/index.ts",
    "build": "tsc",
    "serve": "node dist/index.js",
    "dev": "nodemon ./src/index.ts"
  },
  "type": "commonjs",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.777.0",
    "@aws-sdk/client-s3": "^3.777.0",
    "@aws-sdk/lib-dynamodb": "^3.778.0",
    "@aws-sdk/s3-request-presigner": "^3.806.0",
    "@types/mjml": "^4.7.4",
    "aws-sdk": "^2.1692.0",
    "axios": "^1.8.4",
    "bcryptjs": "^3.0.2",
    "cloudinary": "^2.6.0",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "mjml": "^4.15.3",
    "mongoose": "^8.13.1",
    "multer": "^1.4.5-lts.2",
    "multer-s3": "^3.0.1",
    "nodemailer": "^6.10.0",
    "nodemon": "^3.1.9",
    "pdf-parse": "^1.1.1",
    "socket.io": "^4.8.1",
    "stream-chat": "^8.60.0",
    "uuid": "^11.1.0",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@types/cookie-parser": "^1.4.8",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.1",
    "@types/jsonwebtoken": "^9.0.9",
    "@types/multer": "^1.4.12",
    "@types/multer-s3": "^3.0.3",
    "@types/node": "^22.13.14",
    "@types/nodemailer": "^6.4.17",
    "@typescript-eslint/eslint-plugin": "^8.28.0",
    "@typescript-eslint/parser": "^8.28.0",
    "eslint": "^9.23.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.8.2"
  }
}
VITE_BACKEND_URL=https://your-backend-api.example.com
VITE_GPT_KEY=your-openai-api-key
VITE_STREAM_API_KEY=your-stream-chat-api-key
AWS_REGION=your-aws-region
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_BUCKET_NAME=your-s3-bucket-name

SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SENDER_EMAIL=your-sender-email-address

JWT_SECRET=your-jsonwebtoken-secret

CLOUDNAME=your-cloudinary-cloud-name
CLOUD_API_KEY=your-cloudinary-api-key
CLOUD_API_SECRET=your-cloudinary-api-secret

STEAM_API_KEY=your-steam-api-key
STEAM_API_SECRET=your-steam-api-secret

NODE_ENV=development

# (Optional) DynamoDB table names or endpoints can be configured here if needed
├── frontend/                  # Front End –
│   ├── public/                # Static assets (images, fonts, favicon, etc.)
│   ├── src/
│   │   ├── assets/            # Image and font assets
│   │   ├── components/        # Reusable React components
│   │   ├── context/           # React Context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Top-level page components (for routing)
│   │   ├── services/          # API service modules (axios instances, endpoints)
│   │   ├── store/             # Zustand stores for global state
│   │   ├── styles/            # Global CSS / Tailwind configurations
│   │   ├── utils/             # Utility functions and helpers
│   │   ├── App.tsx            # Root component with router setup
│   │   ├── main.tsx           # Entry point for React + Vite
│   │   └── vite-env.d.ts      # TypeScript declarations for Vite
│   ├── .env.example           # Example environment variable definitions
│   ├── .eslintrc.js           # ESLint configuration
│   ├── .prettierrc            # Prettier configuration
│   ├── tsconfig.json          # TypeScript configuration
│   ├── tailwind.config.cjs    # Tailwind CSS configuration
│   ├── vite.config.ts         # Vite configuration
│   └── package.json           # Front-end metadata and scripts
│
├── backend/                   # Back End –
│   ├── src/
│   │   ├── controllers/       # Express route handlers
│   │   ├── middlewares/       # Custom middleware (auth, error handling, etc.)
│   │   ├── models/            # Mongoose models or DynamoDB schema definitions
│   │   ├── routes/            # Express router definitions
│   │   ├── services/          # Business logic, AWS SDK wrappers, etc.
│   │   ├── utils/             # Utility functions/helpers (email, tokens, etc.)
│   │   ├── index.ts           # Entry point for Express app
│   │   └── server.ts          # HTTP server configuration (Socket.io, etc.)
│   ├── .env.example           # Example environment variable definitions
│   └── package.json           # Back-end metadata and scripts
│
├── aws-s3-cors.json           # S3 bucket CORS configuration (example)  
├── README.md                  # ← You are here  
└── LICENSE                    # MIT License (or your chosen license)
// frontend/package.json (scripts)
{
  "scripts": {
    "dev": "vite",                    // Run the development server (http://localhost:3000)
    "build": "tsc -b && vite build",  // Create a production build in frontend/dist/
    "preview": "vite preview",        // Preview the production build locally
    "lint": "eslint .",               // Lint all source files in src/
    "format": "prettier --write 'src/**/*.{ts,tsx,css,md}'" // Format code
  }
}
// backend/package.json (scripts)
{
  "scripts": {
    "dev": "nodemon ./src/index.ts",  // Start Express with auto-reload (ts-node + nodemon)
    "start": "ts-node src/index.ts",  // Run Express app (no reload)
    "build": "tsc",                   // Compile TypeScript → JavaScript (into backend/dist/)
    "serve": "node dist/index.js",    // Run compiled JavaScript server
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedOrigins": [
      "http://localhost:5173"
    ],
    "ExposeHeaders": [
      "ETag",
      "x-amz-meta-custom-header",
      "x-amz-server-side-encryption"
    ],
    "MaxAgeSeconds": 3600
  }
]
| **Table Name**    | **Status** | **Partition Key (PK)** | **Sort Key (SK)** | **Read Capacity Mode** | **Write Capacity Mode** | **Total Size** |
| ----------------- | ---------- | ---------------------- | ----------------- | ---------------------- | ----------------------- | -------------- |
| **Documents**     | Active     | `documentId` (S)       | –                 | On-demand              | On-demand               | 6.7 KB         |
| **Notifications** | Active     | `notificationId` (S)   | –                 | On-demand              | On-demand               | 3.4 KB         |
| **Projects**      | Active     | `projectId` (S)        | –                 | On-demand              | On-demand               | 343 B          |
| **Teams**         | Active     | `teamId` (S)           | –                 | On-demand              | On-demand               | 314 B          |
| **UserActivity**  | Active     | `activityId` (S)       | –                 | On-demand              | On-demand               | 48 KB          |
| **Users**         | Active     | `user_id` (S)          | –                 | On-demand              | On-demand               | 6.9 KB         |
git checkout -b feature/my-new-feature
cd frontend && npm install
cd ../backend && npm install
git add .
git commit -m "feat: add awesome feature"
git push origin feature/my-new-feature
