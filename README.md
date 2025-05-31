# White Knight (Front End)

A modern, performant front-end application for the White Knight project, built with Vite, React.js, and TypeScript. This repository contains everything needed to get the front end up and running, customize it, and contribute to its development.

---

## Table of Contents

1. [Overview](#overview)  
2. [Tech Stack](#tech-stack)  
3. [Libraries](#libraries)  
4. [Getting Started](#getting-started)  
   - [Prerequisites](#prerequisites)  
   - [Installation](#installation)  
   - [Environment Variables](#environment-variables)  
   - [Running in Development](#running-in-development)  
   - [Building for Production](#building-for-production)  
   - [Previewing a Production Build](#previewing-a-production-build)  
5. [Project Structure](#project-structure)  
6. [Available NPM Scripts](#available-npm-scripts)  
7. [Contributing](#contributing)  
8. [License](#license)  

---

## Overview

This repository holds the front-end code for **White Knight**, a sleek and high-performance web application. The front end is built with Vite for lightning-fast development and bundling, React.js for component-driven UI, and TypeScript for type safety and maintainability. It connects to the back end (hosted in a separate repository) via RESTful APIs and WebSocket channels to deliver real-time features and dynamic content.

Key features of the front end include:
- **Responsive Layouts** using Tailwind CSS  
- **State Management** with React Context and Zustand  
- **Routing** powered by React Router v6  
- **Environment Configuration** via `.env` files  
- **Linting & Formatting** with ESLint and Prettier to ensure code quality  

---

## Tech Stack

- **Vite**: Next-generation front-end tooling, offering fast builds and HMR (Hot Module Replacement)  
- **React.js**: Component-based UI library for building interactive interfaces  
- **TypeScript**: Superset of JavaScript that adds static typing for safer, more predictable code  
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development  
- **React Router v6**: Declarative routing for React applications  
- **Zustand**: Lightweight state-management library for React  
- **Axios**: Promise-based HTTP client for making API requests  
- **ESLint**: Linter for JavaScript/TypeScript to enforce code style and catch errors early  
- **Prettier**: Opinionated code formatter to maintain consistent code style  
- **Jest + React Testing Library**: Testing framework and utilities for unit and integration tests  

---

## Libraries

Below is the list of libraries and tools used in the front-end application (as specified in `package.json`).

### Runtime Dependencies

- **@ant-design/icons**: ^5.6.1  
- **@pdfme/common**: ^5.3.15  
- **@pdfme/ui**: ^5.3.15  
- **@stream-io/video-react-sdk**: ^1.18.1  
- **@syncfusion/ej2-react-pdfviewer**: ^29.1.35  
- **@types/moment**: ^2.11.29  
- **@types/recharts**: ^1.8.29  
- **antd**: ^5.24.2  
- **axios**: ^1.8.4  
- **crypto-js**: ^4.2.0  
- **framer-motion**: ^12.15.0  
- **moment**: ^2.30.1  
- **moveable**: ^0.53.0  
- **pdf-lib**: ^1.17.1  
- **pdfjs-dist**: ^4.10.38  
- **re-resizable**: ^6.11.2  
- **react**: ^19.0.0  
- **react-charts**: ^3.0.0-beta.57  
- **react-dom**: ^19.0.0  
- **react-draggable**: ^4.4.6  
- **react-moveable**: ^0.56.0  
- **react-pdf**: ^9.2.1  
- **react-router-dom**: ^7.2.0  
- **recharts**: ^2.15.3  
- **socket.io-client**: ^4.8.1  
- **stream-chat**: ^9.3.0  
- **stream-chat-react**: ^13.0.5  
- **suneditor**: ^2.47.5  
- **suneditor-react**: ^3.6.1  

### Development Dependencies

- **@eslint/js**: ^9.21.0  
- **@types/crypto-js**: ^4.2.2  
- **@types/pdfjs-dist**: ^2.10.377  
- **@types/react**: ^19.0.10  
- **@types/react-dom**: ^19.0.4  
- **@vitejs/plugin-react**: ^4.3.4  
- **eslint**: ^9.21.0  
- **eslint-config-prettier**: ^10.0.2  
- **eslint-plugin-prettier**: ^5.2.3  
- **eslint-plugin-react-hooks**: ^5.1.0  
- **eslint-plugin-react-refresh**: ^0.4.19  
- **globals**: ^15.15.0  
- **prettier**: ^3.5.3  
- **typescript**: ~5.7.2  
- **typescript-eslint**: ^8.24.1  
- **vite**: ^6.2.0  

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher  
- [npm](https://www.npmjs.com/) v7 or higher (or [Yarn](https://yarnpkg.com/) v1.22+)  

### Installation

1. **Clone the repository**  
   ```bash
   git clone https://github.com/your-username/white-knight-frontend.git
   cd white-knight-frontend
