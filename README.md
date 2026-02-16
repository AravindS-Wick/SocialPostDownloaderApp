# Social Post Downloader App

[![CI/CD Pipeline](https://github.com/yourusername/social-post-downloader-app/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/social-post-downloader-app/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)](https://expo.dev/)

A modern, cross-platform mobile application built with **React Native** and **Expo** that enables users to download content from popular social media platforms including **Instagram**, **Twitter/X**, and **YouTube**. The app provides a seamless, user-friendly experience for saving media content directly to your device.

## ✨ Features

### Core Functionality
- 📱 **Multi-Platform Downloads**: Support for Instagram, Twitter/X, and YouTube
- 🎥 **Video & Audio**: Download both video and audio content
- 📱 **Cross-Platform**: iOS, Android, and Web support via Expo
- 🚀 **Fast Downloads**: Optimized download processing with progress tracking
- 📁 **Media Library Integration**: Automatic saving to device media library
- 🔔 **Push Notifications**: Download completion notifications

### User Experience
- 🎨 **Modern UI**: Clean, intuitive interface with Material Design
- 🌙 **Theme Support**: Light and dark mode support
- 📊 **Download History**: Track and manage your downloads
- ⚙️ **Settings**: Customizable download preferences
- 🔄 **Progress Tracking**: Real-time download progress indicators

### Technical Features
- 🔐 **Secure**: JWT-based authentication and secure API handling
- 🏗️ **Scalable Architecture**: Modular design with TypeScript
- 🧪 **Well Tested**: Comprehensive test coverage
- 📚 **API Documentation**: Swagger/OpenAPI documentation
- 🐳 **Docker Ready**: Containerized deployment support

## 🛠️ Technologies Used

### Frontend (Mobile App)
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and deployment
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library
- **Redux Toolkit** - State management
- **React Query** - Server state management
- **React Native Paper** - Material Design components

### Backend (Server)
- **Node.js** - Runtime environment
- **Fastify** - High-performance web framework
- **TypeScript** - Type-safe server development
- **JWT** - Authentication
- **yt-dlp** - Media download engine
- **Swagger** - API documentation

### DevOps & Tools
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **ESLint** - Code linting
- **Jest** - Testing framework
- **Prettier** - Code formatting

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/social-post-downloader-app.git
cd social-post-downloader-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
cp server/.env.example server/.env
```

4. **Configure your environment variables** in `.env` and `server/.env`

5. **Start the development servers**
```bash
npm run dev
```

This will start both the backend server and the Expo development server.

### Alternative: Using Docker

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📱 Usage

### Mobile App
1. Open the Expo Go app on your device
2. Scan the QR code from the terminal
3. The app will load on your device

### Web Version
```bash
npm run start:web
```
Then open http://localhost:19006 in your browser.

## 🏗️ Project Structure

```
social-post-downloader-app/
├── 📱 Mobile App (React Native + Expo)
│   ├── App.tsx                 # Main app entry point
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── screens/           # Screen components
│   │   ├── navigation/        # Navigation configuration
│   │   ├── services/          # API services and utilities
│   │   ├── store/             # Redux store and slices
│   │   ├── themes/            # Styling and themes
│   │   └── utils/             # Utility functions
│   └── assets/                # Images, icons, fonts
│
├── 🖥️ Backend Server (Node.js + Fastify)
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── services/          # Business logic
│   │   ├── routes/            # API routes
│   │   ├── config/            # Configuration files
│   │   ├── types/             # TypeScript definitions
│   │   └── __tests__/         # Server tests
│   └── dist/                  # Built server code
│
├── 🐳 DevOps
│   ├── .github/workflows/     # GitHub Actions CI/CD
│   ├── Dockerfile             # Docker configuration
│   └── docker-compose.yml     # Docker Compose setup
│
└── 📚 Documentation
    ├── README.md              # This file
    ├── CONTRIBUTING.md        # Contribution guidelines
    ├── SECURITY.md            # Security policy
    └── LICENSE                # MIT License
```

## 🧪 Testing

### Run All Tests
```bash
npm test                    # Run mobile app tests
npm run test:server         # Run server tests
```

### Test Coverage
```bash
npm test -- --coverage     # Generate coverage report
```

### Linting
```bash
npm run lint               # Check code style
npm run lint:fix           # Fix linting issues
```

## 🚀 Deployment

### Mobile App Deployment

#### Using EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

#### Web Deployment
```bash
npm run build:web
# Deploy the web-build/ directory to your hosting service
```

### Server Deployment

#### Using Docker
```bash
# Build Docker image
docker build -t social-downloader-server .

# Run container
docker run -p 2500:2500 --env-file server/.env social-downloader-server
```

#### Manual Deployment
```bash
cd server
npm run build
npm start
```

## 🔧 Configuration

### Environment Variables

#### Mobile App (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:2500
EXPO_PUBLIC_APP_ENV=development
```

#### Server (server/.env)
```env
PORT=2500
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
YOUTUBE_API_KEY=your-youtube-api-key
INSTAGRAM_CLIENT_ID=your-instagram-client-id
TWITTER_BEARER_TOKEN=your-twitter-bearer-token
```

See `.env.example` files for complete configuration options.

## 📖 API Documentation

The server provides interactive API documentation via Swagger UI:
- **Development**: http://localhost:2500/documentation
- **Production**: https://your-domain.com/documentation

### Key Endpoints

- `POST /api/download` - Download media from URL
- `GET /api/info` - Get media information
- `GET /downloads/:filename` - Serve downloaded files
- `GET /health` - Health check

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 🔒 Security

Security is a top priority. Please see our [Security Policy](SECURITY.md) for reporting vulnerabilities.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Powerful media download tool
- [Expo](https://expo.dev/) - Amazing React Native platform
- [Fastify](https://www.fastify.io/) - Fast and efficient web framework
- All contributors and users of this project

## 📞 Support

- 📧 **Email**: support@yourproject.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/social-post-downloader-app/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/social-post-downloader-app/discussions)

## 🗺️ Roadmap

### Version 1.1
- [ ] TikTok support
- [ ] Batch downloads
- [ ] Download scheduling

### Version 1.2
- [ ] User accounts and cloud sync
- [ ] Advanced download options
- [ ] Playlist support

### Version 2.0
- [ ] Desktop application
- [ ] Browser extension
- [ ] Premium features

---

<div align="center">
  <p>Made with ❤️ by the Social Post Downloader App team</p>
  <p>
    <a href="https://github.com/yourusername/social-post-downloader-app">⭐ Star us on GitHub</a> •
    <a href="https://github.com/yourusername/social-post-downloader-app/issues">🐛 Report Bug</a> •
    <a href="https://github.com/yourusername/social-post-downloader-app/issues">💡 Request Feature</a>
  </p>
</div>
