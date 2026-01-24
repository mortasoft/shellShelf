# ShellShelf 🐚

**ShellShelf** is a premium, self-hosted manager for your shell scripts and commands. It transforms your collection of snippets into a powerful, serve-able library with a stunning "Matrix-inspired" UI.

![ShellShelf Matrix UI](https://ik.imagekit.io/senderismocr/shellShelf.png?updatedAt=1769282171898)

## ✨ key Features

### 🚀 **Advanced Script Management**
- **Web-based Code Editor**: Edit your shell scripts directly in the browser with syntax highlighting.
- **Dynamic Variables**: uniquely supports `{{VARIABLE}}` syntax in scripts.
    - When you click "Copy Exec", ShellShelf detects these variables.
    - It prompts you for values (e.g., `IP_ADDRESS`, `OAUTH_TOKEN`).
    - It generates a custom `curl` command with those values pre-filled as query parameters.
- **Direct Serving**: Serve any script instantly via `curl -sL server/raw/scriptname | bash`.
- **Renaming & Tagging**: Organize scripts with tags and easily rename files.

### 💻 **Command Library**
- **Smart Storage**: Save complex one-liners and commands you don't want to type manually.
- **Organization**: Filter by tags or search by name/description.
- **One-Click Copy**: Grabs commands to your clipboard instantly.
- **Documentation Links**: Link specific commands to longer Instruction files for context.

### 🎨 **Immersive UI/UX**
- **Theming System**: 
    - **Matrix Mode**: Full immersion with animated "Digital Rain" background, neon green accents, and terminal aesthetics.
    - **Default Dark**: A clean, professional dark mode.
- **Responsive Design**: Collapsible sidebar and mobile-friendly layouts.
- **Visual Feedback**: Toast notifications, glassmorphism effects, and "danger" states for destructive actions.

### 📚 **Knowledge Base**
- **Instructions**: Write and store markdown documentation alongside your code.
- **Linkable**: Connect docs to commands for a complete "Runbook" experience.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, Lucide Icons, Framer Motion (animations).
- **Backend**: Node.js, Express, TypeScript.
- **Storage**: JSON-based local storage (no database setup required).
- **Deployment**: Docker & Docker Compose with Nginx.

---

## 🚀 Getting Started

### Option A: Docker (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/shellshelf.git
   cd shellshelf
   ```

2. **Run with Docker Compose**:
   ```bash
   docker compose up -d --build
   ```

3. **Access the App**:
   - Frontend: `http://localhost`:80` (or configured port)
   - The app comes pre-configured to talk to the API internally.

### Option B: Local Development

**1. Backend**:
```bash
cd server
npm install
npm run dev
# Server runs on port 3001
```

**2. Frontend**:
```bash
cd client
npm install
npm run dev
# Client runs on localhost:5173 (usually)
```

---

## 💡 Usage Guide

### Dynamic Script Variables
1. Create a script: `deploy.sh`
2. Add content: 
   ```bash
   #!/bin/bash
   echo "Deploying to {{ENV}}..."
   ```
3. Click **Copy Exec**.
4. Enter `Production` when prompted.
5. Paste the generated command:
   ```bash
   curl -sL http://localhost/api/raw/deploy.sh?ENV=Production | bash
   ```

---

## 📄 License
MIT License.
