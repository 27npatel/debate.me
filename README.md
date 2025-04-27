# debatab.le - Real-time Cross-Cultural Debate Platform

debatab.le is a modern web application that enables real-time debates across different languages and cultures. The platform features real-time translation, video conferencing, and a robust debate management system.

## 💡 Inspiration

We created debatab.le because everyone deserves a voice in global conversations. While 1.5 billion people speak English, 6.5 billion don't - and their perspectives matter. In education, this language barrier means students and people across the world miss out on learning from diverse viewpoints. By breaking down these barriers, we're aiming to not only translate words, but also create a global classroom where people can learn from each other's experiences and cultures.

## 🎯 What it does

debatab.le is a real-time debate platform that enables multilingual discussions through AI-powered speech recognition, translation, and processing. Users from around the world join debate rooms (while speaking in their native language) and have their speech automatically translated for the other participant in the call.

## 🚀 Features

- Real-time multilingual debates with instant translation
- Video conferencing powered by Agora
- User authentication and profile management
- Debate room creation and management
- Real-time chat and messaging
- Cross-platform compatibility
- Modern, responsive UI with dark/light mode support
- AI-powered speech recognition and translation
- Real-time speech-to-text transcriptions

## 🏗️ Architecture

The project follows a client-server architecture with the following components:

### Client (Next.js)

- Built with Next.js 15 and React 18
- TypeScript for type safety
- TailwindCSS for styling
- Radix UI components for accessible UI elements
- Zustand for state management
- Socket.IO for real-time communication
- Agora SDK for video conferencing

### Server (Node.js)

- Express.js backend
- MongoDB database
- JWT authentication
- Socket.IO for real-time features
- Google Cloud services integration
- Hugging Face integration
- Gemini API integration

## 📁 Project Structure

```
debatab.le/
├── client/                 # Next.js frontend
│   ├── src/               # Source code
│   │   ├── app/          # Next.js app router
│   │   ├── components/   # Reusable UI components
│   │   ├── lib/         # Utility functions
│   │   └── store/       # State management
│   ├── public/          # Static assets
│   └── package.json     # Frontend dependencies
│
└── server/              # Node.js backend
    ├── src/            # Source code
    │   ├── controllers/ # Route controllers
    │   ├── models/     # Database models
    │   ├── routes/     # API routes
    │   ├── middleware/ # Custom middleware
    │   └── utils/      # Utility functions
    └── package.json    # Backend dependencies
```

## 🛠️ Tech Stack

### Frontend

- Next.js 15 with Turbopack
- React 18
- TypeScript
- TailwindCSS
- Radix UI
- Zustand
- Socket.IO Client
- Agora RTC SDK

### Backend

- Node.js
- Express.js
- MongoDB
- Socket.IO
- JWT Authentication
- Google Cloud Services
- Hugging Face
- Gemini API

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn
- Google Cloud account (for translation services)
- Agora account (for video streaming)
- Hugging Face API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/debatab.le.git
   cd debatab.le
   ```

2. Install dependencies:

   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. Set up environment variables:

   - Create `.env.local` in the client directory
   - Create `.env` in the server directory
   - Refer to `.env.example` files for required variables

4. Start the development servers:

   ```bash
   # Start the backend server
   cd server
   npm run dev

   # Start the frontend server
   cd ../client
   npm run dev
   ```

## 🎯 Challenges & Solutions

### Technical Challenges

- Implementing real-time speech recognition across different browsers
- Setting up live video calling with Agora
- Integrating Gemini API for advanced features
- Managing multiple language translations simultaneously
- Real-time synchronization of audio and translations

### Solutions

- Cross-browser compatibility testing and polyfills
- Robust error handling and fallback mechanisms
- Optimized API integration patterns
- Efficient state management and caching
- Continuous performance monitoring and optimization

## 🏆 Accomplishments

- Created a seamless multilingual debate experience
- Implemented real-time speech-to-text transcriptions
- Developed live video streaming capabilities
- Built an intuitive and responsive UI
- Integrated multiple AI services for enhanced functionality

## 📚 Documentation

- [API Documentation](server/README.md)
- [Client Documentation](client/README.md)
- [Deployment Guide](docs/deployment.md)

## 🔮 Future Plans

- Support for additional languages
- AI-powered debate topic suggestions
- AI moderator for debates
- 1-on-1 debate with Debaty (our multilingual AI debater)
- Enhanced speech recognition accuracy
- Improved translation quality
- Mobile application development
- Offline debate capabilities

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Agora.io for real-time video capabilities
- Google Cloud for translation services
- Hugging Face for AI models
- Gemini API for advanced features
- The open-source community for amazing tools and libraries
