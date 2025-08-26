# Overview

This is a 3D driving game built with React Three Fiber where players navigate through traffic by switching lanes to avoid collisions. The game features a full-stack architecture with Express.js backend, React frontend using Three.js for 3D graphics, and PostgreSQL database with Drizzle ORM for data persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Main UI framework using functional components and hooks
- **React Three Fiber**: 3D graphics engine for rendering the driving game scene
- **Zustand**: State management for game logic, audio controls, and driving mechanics
- **Tailwind CSS + Radix UI**: Styling system with component library for consistent UI
- **Vite**: Build tool and development server with hot module replacement

## Backend Architecture
- **Express.js**: REST API server with middleware for request logging and error handling
- **TypeScript**: Full type safety across server components
- **Modular Storage Interface**: Abstracted storage layer supporting both in-memory and database implementations

## Game Architecture
- **Component-based 3D Scene**: Separate components for player car, enemy cars, road, and UI elements
- **Real-time Game Loop**: Frame-based updates using React Three Fiber's useFrame hook
- **Lane-based Movement**: Three-lane system with keyboard controls for left/right movement
- **Collision Detection**: Spatial collision checking between player and enemy vehicles
- **Progressive Difficulty**: Enemy spawn rate increases over time based on survival duration

## Data Storage
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **Database Schema**: User management with username/password authentication
- **Connection Pooling**: Neon Database serverless PostgreSQL integration
- **Migration System**: Drizzle Kit for schema changes and database migrations

## Audio System
- **Web Audio API**: Browser-native audio handling for sound effects
- **Zustand Audio Store**: Centralized audio state management with mute controls
- **Dynamic Sound Loading**: Runtime audio file loading for background music and effects

## Development Environment
- **Hot Reloading**: Vite development server with instant updates
- **Error Overlay**: Runtime error display during development
- **Path Aliases**: Simplified imports using @ for client and @shared for common code
- **GLSL Shader Support**: Custom shader loading for advanced 3D effects

# External Dependencies

## Core Frameworks
- **React Three Fiber**: 3D scene management and WebGL rendering
- **Express.js**: Server framework for REST API endpoints
- **Drizzle ORM**: Database abstraction layer with type safety

## Database
- **Neon Database**: Serverless PostgreSQL hosting
- **PostgreSQL**: Primary database for user data persistence

## UI Components
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography

## 3D Graphics
- **Three.js**: Core 3D library (via React Three Fiber)
- **@react-three/drei**: Helper components for Three.js scenes
- **@react-three/postprocessing**: Visual effects and post-processing

## Development Tools
- **TypeScript**: Static type checking across the entire codebase
- **Vite**: Fast build tool and development server
- **ESBuild**: JavaScript bundler for production builds

## State Management
- **Zustand**: Lightweight state management with subscription support
- **React Query**: Server state management and caching (configured but minimal usage)