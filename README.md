# Cloud Drive Frontend

React-based cloud storage application with file management, sharing, and collaboration features.

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Routing**: React Router v6
- **Icons**: Lucide React

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app runs at `http://localhost:3000` and proxies API requests to `http://localhost:3001`.

### Build

```bash
npm run build
```

## Project Structure

```
frontend/src/
├── components/
│   ├── FileItem.jsx       # File/folder item with actions
│   ├── Header.jsx         # Top bar with search
│   ├── Layout.jsx         # Main layout wrapper
│   ├── LoadingScreen.jsx  # Loading state
│   ├── ShareModal.jsx     # Sharing dialog
│   ├── Sidebar.jsx        # Navigation sidebar
│   └── UploadModal.jsx    # File upload dialog
├── pages/
│   ├── Dashboard.jsx      # Main drive view
│   ├── Login.jsx          # Login page
│   ├── PublicLink.jsx     # Public shared link viewer
│   ├── Recent.jsx         # Recently accessed files
│   ├── Register.jsx       # Registration page
│   ├── SharedWithMe.jsx   # Shared items page
│   ├── Starred.jsx        # Starred items page
│   └── Trash.jsx          # Deleted items page
├── stores/
│   └── authStore.js       # Auth state management
├── lib/
│   └── api.js             # API client
├── App.jsx                # Main app with routing
├── main.jsx               # Entry point
└── index.css              # Global styles
```

## Features

- User authentication (login/register)
- File upload with drag-and-drop
- Folder creation and navigation
- File/folder sharing with users
- Public link generation with password protection
- Star/favorite items
- Trash with restore/permanent delete
- Search functionality
- Storage usage display

## Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:3001
```

For production, set this to your backend URL.
