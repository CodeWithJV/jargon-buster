import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'terms.db');

// Create a new database connection
const db = new sqlite3.Database(dbPath);

// Promisify database operations
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(join(__dirname, 'public')));

// Initialize database
db.serialize(() => {
  // Add new columns to the terms table if they don't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS terms (
      id TEXT PRIMARY KEY,
      term TEXT NOT NULL,
      definition TEXT,
      understood BOOLEAN DEFAULT 0,
      dateAdded TEXT NOT NULL,
      dateUnderstood TEXT,
      initialThoughts TEXT,
      notes TEXT,
      eli5 TEXT
    )
  `);
});

// Get all terms
app.get('/api/terms', async (req, res) => {
  try {
    const terms = await all('SELECT * FROM terms');
    res.json(terms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a term
app.post('/api/terms', async (req, res) => {
  try {
    const { id, term, definition, dateAdded, initialThoughts } = req.body;
    // Server-side Error: Misspelled column name 'definiton' instead of 'definition'
    await run(
      'INSERT INTO terms (id, term, definition, dateAdded, initialThoughts) VALUES (?, ?, ?, ?, ?)',
      [id, term, definition, dateAdded, initialThoughts]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a term
app.put('/api/terms/:id', async (req, res) => {
  try {
    const { term, definition, notes, eli5 } = req.body;
    await run(
      'UPDATE terms SET term = ?, definition = ?, notes = ?, eli5 = ? WHERE id = ?',
      [term, definition, notes, eli5, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle understood status
app.put('/api/terms/:id/toggle', async (req, res) => {
  try {
    const { understood, dateUnderstood } = req.body;
    await run(
      'UPDATE terms SET understood = ?, dateUnderstood = ? WHERE id = ?',
      [understood ? 1 : 0, dateUnderstood, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a term
app.delete('/api/terms/:id', async (req, res) => {
  try {
    await run('DELETE FROM terms WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
