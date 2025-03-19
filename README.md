# React SPA PlayFab

A React Single Page Application (SPA) that integrates with Microsoft's PlayFab backend service for game development.

## Project Overview

This project demonstrates how to create a modern web application that leverages PlayFab's Backend as a Service (BaaS) capabilities for gaming applications, including:

- User authentication and profile management
- Game state management
- Cloud-based game services
- Azure Blob Storage integration for image storage

## Development Phases

The project is being implemented in phases:

1. **Phase 1**: Project Setup (Current)
   - React SPA initialization with Vite
   - TypeScript configuration
   - Folder structure setup
   - GitHub Actions CI/CD pipeline

2. **Phase 2**: Basic UI and PlayFab SDK Integration
   - Implement minimal UI components
   - Integrate PlayFab SDK for authentication
   - Set up React Context for state management

3. **Phase 3**: Azure Blob Storage Integration
   - Implement image upload functionality
   - Store image URLs in PlayFab Player Data

4. **Phase 4**: Game Basic Features
   - Implement game components
   - Add game state management
   - Save/load game state to/from PlayFab

5. **Phase 5**: Special Processing with Azure Functions
   - Implement complex validation logic
   - Create helper functions for frontend integration

6. **Phase 6**: Social Features and Rankings
   - Implement friend and ranking features
   - Add special ranking processing

7. **Phase 7**: Testing and Optimization
   - Add unit tests
   - Optimize performance
   - Final deployment

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/dmasubuchi/react-spa-playfab.git
cd react-spa-playfab

# Install dependencies
npm install

# Start development server
npm run dev
```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
react-spa-playfab/
├── .github/workflows/        # CI/CD pipeline
├── public/                   # Static files
├── src/                      # Source code
│   ├── components/           # UI components
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utility libraries
│   ├── pages/                # Page components
│   ├── App.tsx               # Main app component
│   └── main.tsx              # Entry point
├── api-functions/            # Azure Functions
└── scripts/                  # Development scripts
```

## License

ISC
