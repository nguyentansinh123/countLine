# White Knight

**White Knight** is a modern two‐part application:

- **Front End:** A fast, responsive SPA built with [Vite](https://vitejs.dev/), [React.js](https://react.dev/), and [TypeScript](https://www.typescriptlang.org/). It uses Tailwind CSS, Ant Design, Zustand, and more.  
- **Back End:** A TypeScript-powered [Express.js](https://expressjs.com/) server, using AWS DynamoDB, S3, JWT auth, real-time features (Socket.io), email (Nodemailer + MJML), and more.

---

## Table of Contents

1. [Tech Stack](#tech-stack)  
2. [Getting Started](#getting-started)  
   - [Prerequisites](#prerequisites)  
   - [Install Dependencies](#install-dependencies)  
   - [Environment Variables](#environment-variables)  
   - [Run Locally](#run-locally)  
3. [Project Structure](#project-structure)  
4. [Available Scripts](#available-scripts)  
5. [License](#license)  

---

## Tech Stack

### Front End

- Vite (build & dev server)  
- React.js + TypeScript  
- Tailwind CSS  
- Ant Design  
- Zustand (state management)  
- Axios (HTTP)  
- Socket.io client  
- pdf-lib, pdfjs-dist  

See [`frontend/package.json`](frontend/package.json)

### Back End

- Node.js + Express.js  
- TypeScript  
- AWS SDK v3 (DynamoDB, S3, presigned URLs)  
- JWT (`jsonwebtoken`)  
- Bcrypt (`bcryptjs`)  
- Multer + multer-s3  
- Socket.io server  
- Nodemailer + MJML  

See [`backend/package.json`](backend/package.json)

---

## Getting Started

### Prerequisites

- Node.js (>=16) & npm  
- AWS credentials with S3 + DynamoDB access  
- A running DynamoDB & S3 bucket  

### Install Dependencies

```bash
# In the root of the repo
git clone https://github.com/your-org/white-knight.git
cd white-knight

# Install back end deps
cd backend
npm install

# Install front end deps
cd ../frontend
npm install
```


Environment Variables
Create frontend/.env and backend/.env from the examples:

### Front End (frontend/.env)
```bash
VITE_BACKEND_URL=http://localhost:5001
VITE_GPT_KEY=your-openai-api-key
VITE_STREAM_API_KEY=your-stream-api-key
```

### Back End (backend/.env)
```bash
AWS_REGION=your-aws-region
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_BUCKET_NAME=your-s3-bucket-name

JWT_SECRET=your-jwt-secret
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-pass
SENDER_EMAIL=your-sender-email
CLOUDNAME=your-api-key
CLOUD_API_KEY=your-api-key
CLOUD_API_SECRET=your-api-key
NODE_ENV=development
STEAM_API_KEY=your-stream-api-key
STEAM_API_SECRET=your-stream-api-key
```

### Run Locally

# Start back end (runs on :5001)
```bash
cd backend
npm run dev
```
# In new terminal, start front end (runs on :5173)
```bash
cd ../frontend
npm run dev
```

### Project Structure

```bash
.
├── backend/
│   ├── src/
│   │   ├── controller/        # Express route handlers
│   │   ├── routes/            # API route definitions
│   │   ├── model/             # DynamoDB models
│   │   ├── middleware/        # Auth, error handling
│   │   ├── lib/               # AWS & DynamoDB clients
│   │   ├── template/          # Email templates (MJML)
│   │   └── [index.ts](http://_vscodecontentref_/0)           # Entry point
│   └── [package.json](http://_vscodecontentref_/1)
├── frontend/
│   ├── src/
│   │   ├── pages/             # Top-level pages (NDA, SharedDocuments, Users…)
│   │   ├── components/        # Reusable UI components
│   │   ├── utils/             # Helpers (e.g. [ExtractText.tsx](http://_vscodecontentref_/2))
│   │   ├── App.tsx            # Routes & layout
│   │   └── main.tsx           # App bootstrap
│   └── [package.json](http://_vscodecontentref_/3)
├── .gitignore
└── [README.md](http://_vscodecontentref_/4)
```


### Available Scripts
## Front End
```bash

| Command          | Description                                                          |
|------------------|----------------------------------------------------------------------|
| `npm run dev`    | Starts the Vite development server with hot module replacement (HMR) |
| `npm run build`  | Builds the project for production deployment                         |
| `npm run preview`| Serves the production build locally for previewing                   |
| `npm run lint`   | Runs ESLint to check and enforce code quality                        |
| `npm run format` | Runs Prettier to automatically format code                           |
```

## Back End

```bash 
| Command        | Description                           |
|----------------|-------------------------------------  |
| `npm run dev`  | Start dev server with nodemon         |
| `npm run build`| Compile TypeScript files to `dist/`   |
| `npm start`    | Run the compiled server (`node dist/`)|
```

### Database (DynamoDB)
```bash 

| **Table Name**    | **Status** | **Partition Key (PK)** | Index                             |
| ----------------- | ---------- | ---------------------- | ----------------------------------| 
| **Documents**     | Active     | `documentId` (S)       | –                                 | 
| **Notifications** | Active     | `notificationId` (S)   | userId-createdAt-index            |
| **Projects**      | Active     | `projectId` (S)        | –                                 |
| **Teams**         | Active     | `teamId` (S)           | –                                 | 
| **UserActivity**  | Active     | `activityId` (S)       | –                                 |
| **Users**         | Active     | `user_id` (S)          | EmailIndex, NameIndex, UserIdIndex|
```
