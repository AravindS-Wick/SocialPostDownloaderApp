# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **React Native + Expo** mobile application with a **Node.js/Fastify** backend server. The app enables users to download content from Instagram, Twitter/X, and YouTube. It's a monorepo structure with both the mobile app and backend server in the same repository.

**Key Technologies:**
- **Mobile**: React Native (0.79.3), Expo (SDK 53), TypeScript
- **Backend**: Fastify (4.x), TypeScript, ESM modules
- **State Management**: Redux Toolkit, React Query
- **Download Engine**: yt-dlp (YouTube), instagram-private-api, twitter-api-v2

## Development Commands

### Mobile App

```bash
# Start Expo development server
npm run start

# Start with development client
npm run start:dev

# Start web version
npm run start:web

# Type checking
npm run type-check

# Testing
npm test

# Linting
npm run lint
npm run lint:fix
```

### Backend Server

```bash
# Start backend in development mode (with hot reload)
npm run start:server

# Build server
npm run build:server

# Test server
npm run test:server
cd server && npm test              # Run tests with vitest
cd server && npm run test:coverage # With coverage report
cd server && npm run test:ui       # With UI
```

### Combined Development

```bash
# Start both mobile app and server concurrently
npm run dev
```

### Maintenance

```bash
# Clean everything and reinstall
npm run clean

# Fix security vulnerabilities
npm run audit-fix
```

## Architecture

### Monorepo Structure

The project has a **dual-root structure**:
- **Root**: Mobile app (React Native + Expo)
- **server/**: Backend API (Fastify)

Both have their own `package.json`, `tsconfig.json`, and dependencies.

### Mobile App Architecture

**Entry Point**: `App.tsx` → Sets up providers (Redux, Paper, SafeArea) and navigation

**Key Layers**:
1. **Navigation** (`src/navigation/`): Stack + Bottom Tab Navigator
   - Main tabs: Home, History, Settings
   - Modal screens: Download
   
2. **State Management** (`src/store/`): Redux Toolkit with slices:
   - `downloadSlice`: Download state and progress
   - `authSlice`: Authentication state
   - `historySlice`: Download history
   - `settingsSlice`: App preferences

3. **Services** (`src/services/`):
   - `api.ts`: API client with platform-specific base URLs (handles Android emulator `10.0.2.2`, iOS `localhost`)
   - `storage.ts`: File system and media library handling
   - `permissions.ts`: Android/iOS permission management
   - `axiosInstance.ts`: Configured axios with interceptors

4. **Screens** (`src/screens/`):
   - `HomeScreen`: Main download interface
   - `DownloadScreen`: Download progress and controls
   - `HistoryScreen`: Download history viewer
   - `SettingsScreen`: App settings

5. **Components** (`src/components/`): Reusable UI components

### Backend Architecture

**Entry Point**: `server/src/index.ts`

**Key Components**:
1. **Routes** (`server/src/routes/`):
   - `auth.routes.ts`: JWT-based authentication

2. **Controllers** (`server/src/controllers/`):
   - Handle request/response logic
   - Platform-specific download orchestration

3. **Services** (`server/src/services/`):
   - Platform downloaders (YouTube, Instagram, Twitter)
   - Business logic separated from controllers

4. **Types** (`server/src/types/`):
   - TypeScript type definitions
   - Shared interfaces

**Download Flow**:
- Uses `yt-dlp` CLI (subprocess) for YouTube downloads
- Native APIs for Instagram and Twitter
- Files saved to `server/downloads/` directory
- Served via Fastify static file serving at `/downloads/`

### API Design

**Base URL Configuration**:
- Android emulator: `http://10.0.2.2:2500/api`
- iOS simulator: `http://localhost:2500/api`
- Web: `http://localhost:2500/api`

**Key Endpoints**:
- `GET /health` - Health check
- `GET /api/media/info` - Get media metadata
- `POST /api/media/download` - Initiate download
- `GET /api/media/status/:id` - Download status
- `GET /downloads/:filename` - Serve downloaded files
- `GET /documentation` - Swagger UI

### Module System

**Critical**: The backend uses **ESM** (not CommonJS):
- `"type": "module"` in `server/package.json`
- All imports must use `.js` extensions (TypeScript requirement for ESM)
- `import/export` syntax only, no `require()`

### Environment Configuration

**Mobile App** (`.env`):
```bash
EXPO_PUBLIC_API_URL=http://localhost:2500
EXPO_PUBLIC_APP_ENV=development
```

**Backend** (`server/.env`):
- `PORT=2500`
- Social media API keys (Twitter, Instagram, YouTube)
- JWT secret
- See `.env` for full list

### State Flow

1. User enters URL → `HomeScreen`
2. API request via `src/services/api.ts`
3. Backend processes via platform-specific service
4. Progress updates → Redux store → UI updates
5. File saved → Media library (with permissions)
6. History recorded in `historySlice`

## Testing

- **Mobile**: Jest with `jest-expo` preset
- **Server**: Vitest with coverage via v8
- Mocks in `server/src/__mocks__/`
- Test files alongside source in `__tests__/` directories

## Important Patterns

### API Client Pattern

The mobile app has sophisticated retry logic:
1. Try direct axios call to discovered endpoint
2. Fall back to apiClient instance
3. Auto-retry with backend format string if format fails
4. Comprehensive logging at each step

### Permission Handling

Android-specific: Request media library permissions on startup (with 1s delay) in `App.tsx`. Critical for saving downloads to device storage.

### Download Format Strings

Backend expects specific yt-dlp format strings:
- Video: `bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo[ext=mp4]/best[ext=mp4]/best`
- Audio: `bestaudio[ext=m4a]/bestaudio/best`

Mobile app matches these in `DEFAULT_VIDEO_FORMAT` and `DEFAULT_AUDIO_FORMAT`.

### TypeScript Configuration

- **Mobile**: Extends `expo/tsconfig.base`, JSX mode `react-native`
- **Server**: ES2020 target, ESNext modules, strict mode, path aliases `@/*`

## Common Development Workflows

### Adding a New Platform

1. Create service in `server/src/services/`
2. Add controller in `server/src/controllers/`
3. Register routes in `server/src/index.ts`
4. Update `detectPlatformFromUrl()` in `src/services/api.ts`
5. Add UI elements in relevant screens

### Debugging API Issues

The app has extensive logging. Check Metro bundler console for:
- `=== API REQUEST INTERCEPTOR ===`
- `=== API RESPONSE INTERCEPTOR ===`
- Platform detection and URL resolution logs

Server logs via `pino-pretty` show request/response flow.

### Building for Production

**Mobile**:
```bash
# Use EAS Build (recommended)
eas build:configure
eas build --platform android
eas build --platform ios

# Or web
npm run build:web
```

**Server**:
```bash
cd server
npm run build
# Output in server/dist/
```

### Docker Deployment

```bash
docker-compose up --build
```

Files: `Dockerfile`, `docker-compose.yml` at root.

## Key Dependencies

### Mobile Critical
- `expo-file-system`: File operations
- `expo-media-library`: Save to device gallery
- `expo-notifications`: Download completion alerts
- `@reduxjs/toolkit`: State management
- `react-native-paper`: Material Design UI

### Server Critical
- `youtube-dl-exec`: yt-dlp wrapper
- `fastify`: Web framework
- `@fastify/jwt`: Authentication
- `@fastify/swagger`: API docs
- `pino-pretty`: Logging

## Troubleshooting

### "Cannot find module" in server
Check for `.js` extensions in imports. ESM requires them even in TypeScript.

### Android network errors
Verify using `10.0.2.2` not `localhost` in `src/services/api.ts`.

### yt-dlp not found
Ensure `yt-dlp` is installed on system PATH. Backend uses subprocess to call it.

### Permission errors on Android
Check `requestPermissionsWithPrompt()` is called and user granted permissions.

## Notes

- Server port is `2500` (not 3000 or 8080)
- Downloads directory: `server/downloads/`
- Redux uses `serializableCheck: false` for file objects
- CORS configured for common Expo origins (19006, 8081, etc.)
