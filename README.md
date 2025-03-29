# VSee Frontend

This is the frontend application for VSee, built with React, TypeScript, and Vite.

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add the following variables:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_PUSHER_APP_KEY=your-pusher-key
VITE_PUSHER_APP_CLUSTER=your-pusher-cluster
VITE_PUSHER_APP_HOST=localhost
VITE_PUSHER_APP_PORT=6001
VITE_PUSHER_APP_SCHEME=http
```

3. Start the development server:
```bash
npm run dev
```

## Features

- React with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- React Router for navigation
- React Query for data fetching
- Pusher for real-time features
- Axios for API requests

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── services/      # API and Pusher services
├── hooks/         # Custom React hooks
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Development

- The application runs on `http://localhost:5173` by default
- API requests are made to the backend at `http://localhost:8000/api`
- Real-time features are handled through Pusher
