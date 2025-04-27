# debatab.ly Frontend

This is the frontend client for debatab.ly, a global debate platform. Built with Next.js, it provides a modern, responsive interface for users to engage in real-time debates.

## Frontend Features

- Modern, responsive UI with Next.js App Router
- Real-time debate interface with WebSocket integration
- Multi-language support with automatic translation UI
- User authentication and profile management
- Debate scheduling and management interface
- Real-time chat and messaging components
- Topic discovery and search functionality
- AI-powered moderation interface

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React
- **State Management**: React Context
- **Styling**: Custom components with modern design
- **API Integration**: Custom API client with retry logic
- **Real-time**: WebSocket client integration
- **Authentication**: JWT-based client-side auth

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend server running (see backend README)

### Installation

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file with the following variables:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:5001/api
   ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
client/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/         # API routes
│   │   ├── auth/        # Authentication pages
│   │   ├── dashboard/   # Dashboard pages
│   │   └── debate/      # Debate-related pages
│   ├── components/      # Reusable UI components
│   │   ├── ui/         # Basic UI components
│   │   ├── debate/     # Debate-specific components
│   │   └── layout/     # Layout components
│   ├── lib/            # Utility functions and API client
│   │   ├── api.ts      # API client
│   │   └── auth.ts     # Authentication utilities
│   └── styles/         # Global styles
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

- Follow the existing TypeScript and React patterns
- Use functional components with hooks
- Follow the component structure in `src/components`
- Maintain consistent file naming (kebab-case for files, PascalCase for components)

## API Integration

The frontend communicates with the backend through a custom API client (`src/lib/api.ts`). Key features:

- Automatic retry on failed requests
- JWT token management
- Error handling and user feedback
- Type-safe API responses

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
