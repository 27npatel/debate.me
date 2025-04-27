# Debate.me Server

Backend server for the Debate.me platform, handling user authentication, debate management, and real-time features.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/debateme
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ```

3. Start MongoDB:

   ```bash
   mongod
   ```

4. Start the server:

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user

  - Body: `{ name, email, password, preferredLanguage }`

- `POST /api/auth/login` - Login user

  - Body: `{ email, password }`

- `GET /api/auth/me` - Get current user profile
  - Headers: `Authorization: Bearer {token}`

## Project Structure

```
src/
├── controllers/     # Route controllers
├── models/         # Database models
├── routes/         # API routes
├── middleware/     # Custom middleware
├── config/         # Configuration files
├── utils/          # Utility functions
└── index.js        # Entry point
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```
