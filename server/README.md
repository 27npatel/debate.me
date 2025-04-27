# debatab.ly Server

Backend server for the debatab.ly platform, handling user authentication, debate management, real-time features, and AI-powered moderation.

## Features

- User authentication and authorization
- Debate creation and management
- Real-time WebSocket communication
- Multi-language support with translation
- AI-powered content moderation
- User connections and messaging
- Topic management and discovery
- Debate scheduling and reminders

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn
- OpenAI API key (for AI features)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/debatably
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   OPENAI_API_KEY=your_openai_api_key
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
  - Body: `{ username, name, email, password, preferredLanguage }`
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
- `GET /api/auth/me` - Get current user profile
  - Headers: `Authorization: Bearer {token}`

### Debates

- `GET /api/debates` - List debates
- `POST /api/debates` - Create a debate
- `GET /api/debates/:id` - Get debate details
- `POST /api/debates/:id/join` - Join a debate
- `POST /api/debates/:id/leave` - Leave a debate
- `POST /api/debates/:id/end` - End a debate

### Users

- `GET /api/users` - List users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/connections` - Get user connections

### AI Features

- `POST /api/ai/moderate` - Moderate content
- `POST /api/ai/translate` - Translate text
- `POST /api/ai/generate-questions` - Generate debate questions
- `POST /api/ai/counter-arguments` - Generate counter arguments

## Project Structure

```
src/
├── controllers/     # Route controllers
│   ├── auth.ts     # Authentication controller
│   ├── debate.ts   # Debate controller
│   ├── user.ts     # User controller
│   └── ai.ts       # AI features controller
├── models/         # Database models
│   ├── user.ts     # User model
│   ├── debate.ts   # Debate model
│   └── message.ts  # Message model
├── routes/         # API routes
│   ├── auth.ts     # Auth routes
│   ├── debate.ts   # Debate routes
│   ├── user.ts     # User routes
│   └── ai.ts       # AI routes
├── middleware/     # Custom middleware
│   ├── auth.ts     # Auth middleware
│   └── error.ts    # Error handling
├── config/         # Configuration files
├── utils/          # Utility functions
├── services/       # Business logic
│   ├── ai.ts       # AI service
│   └── socket.ts   # WebSocket service
└── index.ts        # Entry point
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## WebSocket Communication

The server uses WebSocket for real-time features:

- Debate updates
- Chat messages
- User presence
- Real-time translations

## Error Handling

The server uses a centralized error handling system:

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
