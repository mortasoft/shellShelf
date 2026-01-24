# ShellShelf

A modern, minimalist application for managing shell commands and scripts.

## Features

- **Command Manager**: Store, tag, and search your frequently used commands.
- **Script Editor**: Create, edit, and run (view) scripts.
- **Modern UI**: Built with React and TailwindCSS for a sleek dark mode experience.
- **Local Storage**: All data is stored in local files (`data/` folder).
- **Dockerized**: Easy deployment with Docker Compose.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **Deployment**: Docker, Nginx

## Getting Started

### Prerequisites

- Node.js (for local dev)
- Docker & Docker Compose (for production/containerized run)

### Running with Docker (Recommended)

1. Clone the repository.
2. Run:
   ```bash
   docker-compose up --build
   ```
3. Open [http://localhost:3000](http://localhost:3000) for the app.
4. The API will be available at [http://localhost:3001](http://localhost:3001).

### Running Locally

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

## License

MIT
