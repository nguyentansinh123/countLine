
# White Knight

A full-stack application featuring a high-performance front end (`Vite` + `React.js` + `TypeScript`) and a feature-rich back end (`Express.js` + `TypeScript` + `AWS SDK`). The front end and back end live in separate directories (`frontend/` and `backend/`).

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
9. [Getting Started](#getting-started)
10. [Contributing](#contributing)
11. [License](#license)

---

## Overview

**White Knight** is a modern two-part application:

- **Front End:** A fast, responsive SPA built with [Vite](https://vitejs.dev/), [React.js](https://react.dev/), and [TypeScript](https://www.typescriptlang.org/). It uses Tailwind CSS, Zustand, Ant Design, and more.
- **Back End:** A TypeScript-powered [Express.js](https://expressjs.com/) server, using AWS DynamoDB, S3, and integrations for authentication, file uploads, real-time features, email, and more.

---

## Tech Stack

### Front End

- `Vite` (build tool + HMR)
- `React.js` + `TypeScript`
- `Tailwind CSS`
- `React Router v7`
- `Zustand` (state management)
- `Axios` (HTTP)
- `Socket.io client` (real-time)
- `Ant Design`
- `Syncfusion PDF Viewer`
- `Stream Chat`
- `Framer Motion` (animation)
- **Other libraries:** See [Libraries & Dependencies](#libraries--dependencies)

### Back End

- `Node.js` + `Express.js`
- `TypeScript`
- `AWS SDK (v3)` for S3/DynamoDB
- `JWT` (`jsonwebtoken`)
- `bcryptjs`
- `Multer` + `multer-s3`
- `Socket.io server` (real-time)
- `Cloudinary` (optional)
- `Nodemailer` + `MJML`
- `Stream Chat`
- `uuid`
- **Other libraries:** See [Libraries & Dependencies](#libraries--dependencies)

---

## Libraries & Dependencies

### Front End

<details>
<summary>Show <code>frontend/package.json</code> dependencies</summary>

```jsonc
{
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
    "suneditor-react": "^3.6.1",
    "tailwindcss": "^3.3.4",
    "zustand": "^5.0.3"
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
    "@typescript-eslint/eslint-plugin": "^8.24.1",
    "@typescript-eslint/parser": "^8.24.1",
    "vite": "^6.2.0"
  }
}
</details>
Back End
<details> <summary>Show <code>backend/package.json</code> dependencies</summary>
jsonc
Copy
Edit
{
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
    "eslint": "^9.23.0",
    "@typescript-eslint/eslint-plugin": "^8.28.0",
    "@typescript-eslint/parser": "^8.28.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.8.2"
  }
}
</details>
Environment Variables
Front End (frontend/.env)
env
Copy
Edit
VITE_BACKEND_URL=https://your-backend-api.example.com
VITE_GPT_KEY=your-openai-api-key
VITE_STREAM_API_KEY=your-stream-chat-api-key
Back End (backend/.env)
env
Copy
Edit
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
Project Structure
plaintext
Copy
Edit
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── .env.example
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── tsconfig.json
│   ├── tailwind.config.cjs
│   ├── vite.config.ts
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── index.ts
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
│
├── aws-s3-cors.json
├── README.md
└── LICENSE
Available NPM Scripts
Front End
js
Copy
Edit
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write 'src/**/*.{ts,tsx,css,md}'"
  }
}
Back End
jsonc
Copy
Edit
{
  "scripts": {
    "dev": "nodemon ./src/index.ts",
    "start": "ts-node src/index.ts",
    "build": "tsc",
    "serve": "node dist/index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
AWS S3 Bucket CORS Configuration
json
Copy
Edit
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:5173"],
    "ExposeHeaders": [
      "ETag",
      "x-amz-meta-custom-header",
      "x-amz-server-side-encryption"
    ],
    "MaxAgeSeconds": 3600
  }
]
DynamoDB Tables
Table Name	Status	Partition Key	Sort Key	Read Capacity	Write Capacity	Total Size
Documents	Active	documentId (S)	–	On-demand	On-demand	6.7 KB
Notifications	Active	notificationId(S)	–	On-demand	On-demand	3.4 KB
Projects	Active	projectId (S)	–	On-demand	On-demand	343 B
Teams	Active	teamId (S)	–	On-demand	On-demand	314 B
UserActivity	Active	activityId (S)	–	On-demand	On-demand	48 KB
Users	Active	user_id (S)	–	On-demand	On-demand	6.9 KB

Getting Started
bash
Copy
Edit
# 1. Clone the repository
git clone https://github.com/your-org/white-knight.git
cd white-knight

# 2. Create .env files in frontend/ and backend/ based on the .env.example templates

# 3. Install dependencies
cd frontend && npm install
cd ../backend && npm install

# 4. Run back end
cd backend
npm run dev

# 5. In a new terminal, run front end
cd ../frontend
npm run dev

# 6. Open http://localhost:5173 in your browser!
