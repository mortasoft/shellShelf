import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, '../data');
const COMMANDS_FILE = path.join(DATA_DIR, 'commands.json');
const SCRIPTS_FILE = path.join(DATA_DIR, 'scripts.json');
const COMPOSE_FILE = path.join(DATA_DIR, 'compose.json'); // Metadata for compose files
const INSTRUCTIONS_FILE = path.join(DATA_DIR, 'instructions.json');
const SCRIPTS_DIR = path.join(DATA_DIR, 'scripts');
const COMPOSE_DIR = path.join(DATA_DIR, 'compose'); // Directory for actual yml files

app.use(cors());
app.use(express.json());

// Ensure data existence
const initData = async () => {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR);
    }

    try {
        await fs.access(COMMANDS_FILE);
    } catch {
        await fs.writeFile(COMMANDS_FILE, JSON.stringify([], null, 2));
    }

    try {
        await fs.access(SCRIPTS_FILE);
    } catch {
        await fs.writeFile(SCRIPTS_FILE, JSON.stringify([], null, 2));
    }

    try {
        await fs.access(COMPOSE_FILE);
    } catch {
        await fs.writeFile(COMPOSE_FILE, JSON.stringify([], null, 2));
    }

    try {
        await fs.access(INSTRUCTIONS_FILE);
    } catch {
        await fs.writeFile(INSTRUCTIONS_FILE, JSON.stringify([], null, 2));
    }

    try {
        await fs.access(SCRIPTS_DIR);
    } catch {
        await fs.mkdir(SCRIPTS_DIR);
    }

    try {
        await fs.access(COMPOSE_DIR);
    } catch {
        await fs.mkdir(COMPOSE_DIR);
    }
};

interface Command {
    id: string;
    name: string;
    description: string;
    command: string;
    tags: string[];
    lastModified?: string;
    linkedInstructionId?: string;
}

interface Script {
    filename: string;
    tags: string[];
    lastModified?: string;
}

// Re-using Script interface structure for ComposeFile
interface ComposeFile {
    filename: string;
    tags: string[];
    lastModified?: string;
}

interface Instruction {
    id: string;
    title: string;
    content: string;
}

// Commands API
app.get('/api/commands', async (req, res) => {
    try {
        const data = await fs.readFile(COMMANDS_FILE, 'utf-8');
        res.json(JSON.parse(data));
    } catch (e) {
        res.status(500).json({ error: 'Failed to read commands' });
    }
});

app.post('/api/commands', async (req, res) => {
    try {
        const newCommand: Command = {
            id: uuidv4(),
            lastModified: new Date().toISOString(),
            ...req.body
        };
        const data = JSON.parse(await fs.readFile(COMMANDS_FILE, 'utf-8'));
        data.push(newCommand);
        await fs.writeFile(COMMANDS_FILE, JSON.stringify(data, null, 2));
        res.json(newCommand);
    } catch (e) {
        res.status(500).json({ error: 'Failed to save command' });
    }
});

app.put('/api/commands/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const data: Command[] = JSON.parse(await fs.readFile(COMMANDS_FILE, 'utf-8'));
        const index = data.findIndex(c => c.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Command not found' });
        }

        data[index] = {
            ...data[index],
            ...updates,
            lastModified: new Date().toISOString()
        };
        await fs.writeFile(COMMANDS_FILE, JSON.stringify(data, null, 2));
        res.json(data[index]);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update command' });
    }
});

app.delete('/api/commands/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let data: Command[] = JSON.parse(await fs.readFile(COMMANDS_FILE, 'utf-8'));
        data = data.filter(c => c.id !== id);
        await fs.writeFile(COMMANDS_FILE, JSON.stringify(data, null, 2));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete command' });
    }
});

// Instructions API
app.get('/api/instructions', async (req, res) => {
    try {
        const data = await fs.readFile(INSTRUCTIONS_FILE, 'utf-8');
        res.json(JSON.parse(data));
    } catch (e) {
        res.status(500).json({ error: 'Failed to read instructions' });
    }
});

app.post('/api/instructions', async (req, res) => {
    try {
        const newInstruction: Instruction = { id: uuidv4(), ...req.body };
        const data = JSON.parse(await fs.readFile(INSTRUCTIONS_FILE, 'utf-8'));
        data.push(newInstruction);
        await fs.writeFile(INSTRUCTIONS_FILE, JSON.stringify(data, null, 2));
        res.json(newInstruction);
    } catch (e) {
        res.status(500).json({ error: 'Failed to save instruction' });
    }
});

app.put('/api/instructions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const data: Instruction[] = JSON.parse(await fs.readFile(INSTRUCTIONS_FILE, 'utf-8'));
        const index = data.findIndex(i => i.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Instruction not found' });
        }

        data[index] = { ...data[index], ...updates };
        await fs.writeFile(INSTRUCTIONS_FILE, JSON.stringify(data, null, 2));
        res.json(data[index]);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update instruction' });
    }
});

app.delete('/api/instructions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let data: Instruction[] = JSON.parse(await fs.readFile(INSTRUCTIONS_FILE, 'utf-8'));
        data = data.filter(i => i.id !== id);
        await fs.writeFile(INSTRUCTIONS_FILE, JSON.stringify(data, null, 2));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete instruction' });
    }
});

// Scripts API
// List scripts
app.get('/api/scripts', async (req, res) => {
    try {
        const files = await fs.readdir(SCRIPTS_DIR);
        const metadata: Script[] = JSON.parse(await fs.readFile(SCRIPTS_FILE, 'utf-8'));

        const result = await Promise.all(files.map(async file => {
            const meta = metadata.find(m => m.filename === file);
            let lastModified = meta?.lastModified;

            if (!lastModified) {
                try {
                    const stats = await fs.stat(path.join(SCRIPTS_DIR, file));
                    lastModified = stats.mtime.toISOString();
                } catch {
                    lastModified = new Date().toISOString();
                }
            }

            return {
                filename: file,
                tags: meta ? meta.tags : [],
                lastModified
            };
        }));

        res.json(result);
    } catch (e) {
        res.status(500).json({ error: 'Failed to list scripts' });
    }
});

// Get script content
app.get('/api/scripts/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const content = await fs.readFile(path.join(SCRIPTS_DIR, filename), 'utf-8');
        const metadata: Script[] = JSON.parse(await fs.readFile(SCRIPTS_FILE, 'utf-8'));
        const meta = metadata.find(m => m.filename === filename);
        res.json({
            filename,
            content,
            tags: meta ? meta.tags : []
        });
    } catch (e) {
        res.status(404).json({ error: 'Script not found' });
    }
});

// Raw script content for curl
// Raw script content for curl with variable substitution
app.get('/api/raw/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        let content = await fs.readFile(path.join(SCRIPTS_DIR, filename), 'utf-8');

        // Replace variables defined in query params
        // Example: ?IP=1.1.1.1 will replace {{IP}} with 1.1.1.1
        Object.keys(req.query).forEach(key => {
            const value = req.query[key] as string;
            const regex = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(regex, value);
        });

        res.setHeader('Content-Type', 'text/plain');
        res.send(content);
    } catch (e) {
        res.status(404).send('Script not found');
    }
});

// Save script
app.post('/api/scripts', async (req, res) => {
    try {
        const { filename, content, tags } = req.body;
        if (!filename) return res.status(400).json({ error: 'Filename required' });

        // Write content
        await fs.writeFile(path.join(SCRIPTS_DIR, filename), content || '');

        const lastModified = new Date().toISOString();
        const metadata: Script[] = JSON.parse(await fs.readFile(SCRIPTS_FILE, 'utf-8'));
        const index = metadata.findIndex(m => m.filename === filename);

        if (index >= 0) {
            if (tags) metadata[index].tags = tags;
            metadata[index].lastModified = lastModified;
        } else {
            metadata.push({ filename, tags: tags || [], lastModified });
        }

        await fs.writeFile(SCRIPTS_FILE, JSON.stringify(metadata, null, 2));

        res.json({ filename, success: true, lastModified });
    } catch (e) {
        res.status(500).json({ error: 'Failed to save script' });
    }
});

// Rename script
app.post('/api/scripts/:filename/rename', async (req, res) => {
    try {
        const { filename } = req.params;
        const { newFilename } = req.body;

        if (!newFilename) return res.status(400).json({ error: 'New filename required' });
        if (filename === newFilename) return res.json({ success: true, filename });

        const oldPath = path.join(SCRIPTS_DIR, filename);
        const newPath = path.join(SCRIPTS_DIR, newFilename);

        // Check if new filename exists
        try {
            await fs.access(newPath);
            return res.status(409).json({ error: 'Script with this name already exists' });
        } catch {
            // File doesn't exist, proceed
        }

        // Rename file
        await fs.rename(oldPath, newPath);

        // Update metadata
        const metadata: Script[] = JSON.parse(await fs.readFile(SCRIPTS_FILE, 'utf-8'));
        const index = metadata.findIndex(m => m.filename === filename);
        if (index >= 0) {
            metadata[index].filename = newFilename;
            metadata[index].lastModified = new Date().toISOString();
            await fs.writeFile(SCRIPTS_FILE, JSON.stringify(metadata, null, 2));
        }

        res.json({ success: true, newFilename });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to rename script' });
    }
});

// Delete script
app.delete('/api/scripts/:filename', async (req, res) => {
    try {
        const { filename } = req.params;

        // Delete file
        await fs.unlink(path.join(SCRIPTS_DIR, filename));

        // Remove from metadata
        const metadata: Script[] = JSON.parse(await fs.readFile(SCRIPTS_FILE, 'utf-8'));
        const newMetadata = metadata.filter(m => m.filename !== filename);
        await fs.writeFile(SCRIPTS_FILE, JSON.stringify(newMetadata, null, 2));

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete script' });
    }
});

// --- Compose API ---

// List compose files
app.get('/api/compose', async (req, res) => {
    try {
        const files = await fs.readdir(COMPOSE_DIR);
        const metadata: ComposeFile[] = JSON.parse(await fs.readFile(COMPOSE_FILE, 'utf-8'));

        const result = await Promise.all(files.map(async file => {
            const meta = metadata.find(m => m.filename === file);
            let lastModified = meta?.lastModified;

            if (!lastModified) {
                try {
                    const stats = await fs.stat(path.join(COMPOSE_DIR, file));
                    lastModified = stats.mtime.toISOString();
                } catch {
                    lastModified = new Date().toISOString();
                }
            }

            return {
                filename: file,
                tags: meta ? meta.tags : [],
                lastModified
            };
        }));

        res.json(result);
    } catch (e) {
        // If dir doesn't exist yet, return empty
        res.json([]);
    }
});

// Get compose file content
app.get('/api/compose/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const content = await fs.readFile(path.join(COMPOSE_DIR, filename), 'utf-8');
        const metadata: ComposeFile[] = JSON.parse(await fs.readFile(COMPOSE_FILE, 'utf-8'));
        const meta = metadata.find(m => m.filename === filename);
        res.json({
            filename,
            content,
            tags: meta ? meta.tags : []
        });
    } catch (e) {
        res.status(404).json({ error: 'Compose file not found' });
    }
});

// Raw compose file content for curl/wget
app.get('/api/raw/compose/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        let content = await fs.readFile(path.join(COMPOSE_DIR, filename), 'utf-8');

        // Variable substitution
        Object.keys(req.query).forEach(key => {
            const value = req.query[key] as string;
            const regex = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(regex, value);
        });

        res.setHeader('Content-Type', 'text/yaml');
        res.send(content);
    } catch (e) {
        res.status(404).send('Compose file not found');
    }
});

// Save compose file
app.post('/api/compose', async (req, res) => {
    try {
        const { filename, content, tags } = req.body;
        if (!filename) return res.status(400).json({ error: 'Filename required' });

        // Write content
        await fs.writeFile(path.join(COMPOSE_DIR, filename), content || '');

        const lastModified = new Date().toISOString();
        const metadata: ComposeFile[] = JSON.parse(await fs.readFile(COMPOSE_FILE, 'utf-8'));
        const index = metadata.findIndex(m => m.filename === filename);

        if (index >= 0) {
            if (tags) metadata[index].tags = tags;
            metadata[index].lastModified = lastModified;
        } else {
            metadata.push({ filename, tags: tags || [], lastModified });
        }

        await fs.writeFile(COMPOSE_FILE, JSON.stringify(metadata, null, 2));

        res.json({ filename, success: true, lastModified });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to save compose file' });
    }
});

// Rename compose file
app.post('/api/compose/:filename/rename', async (req, res) => {
    try {
        const { filename } = req.params;
        const { newFilename } = req.body;

        if (!newFilename) return res.status(400).json({ error: 'New filename required' });
        if (filename === newFilename) return res.json({ success: true, filename });

        const oldPath = path.join(COMPOSE_DIR, filename);
        const newPath = path.join(COMPOSE_DIR, newFilename);

        try {
            await fs.access(newPath);
            return res.status(409).json({ error: 'File with this name already exists' });
        } catch {
            // Proceed
        }

        await fs.rename(oldPath, newPath);

        const metadata: ComposeFile[] = JSON.parse(await fs.readFile(COMPOSE_FILE, 'utf-8'));
        const index = metadata.findIndex(m => m.filename === filename);
        if (index >= 0) {
            metadata[index].filename = newFilename;
            metadata[index].lastModified = new Date().toISOString();
            await fs.writeFile(COMPOSE_FILE, JSON.stringify(metadata, null, 2));
        }

        res.json({ success: true, newFilename });
    } catch (e) {
        res.status(500).json({ error: 'Failed to rename compose file' });
    }
});

// Delete compose file
app.delete('/api/compose/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        await fs.unlink(path.join(COMPOSE_DIR, filename));
        const metadata: ComposeFile[] = JSON.parse(await fs.readFile(COMPOSE_FILE, 'utf-8'));
        const newMetadata = metadata.filter(m => m.filename !== filename);
        await fs.writeFile(COMPOSE_FILE, JSON.stringify(newMetadata, null, 2));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete compose file' });
    }
});

initData().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
