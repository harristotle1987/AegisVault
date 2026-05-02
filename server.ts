import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import cookieParser from 'cookie-parser';
import session from 'express-session';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(cookieParser());
  app.use(session({
    secret: 'sovereign-vault-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: 'none',
      httpOnly: true,
    }
  }));

  const getAppUrl = () => {
    return process.env.VITE_APP_URL || process.env.APP_URL || 'http://localhost:3000';
  };

  const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn('CRITICAL: VITE_GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. Cloud Sync will be unavailable.');
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${getAppUrl()}/auth/callback`
  );

  // API Routes
  app.get('/api/auth/google/url', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.appdata'],
      prompt: 'consent'
    });
    res.json({ url });
  });

  app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      // In a real app, store this in a persistent DB linked to a user session
      // For this sovereign app, we'll store it in the session temporarily 
      // and maybe send it back to the client to be stored in IndexedDB (encrypted)
      // so it's truly local-first and the server is just a middleman.
      
      (req.session as any).tokens = tokens;

      res.send(`
        <html>
          <body style="background: #09090b; color: #10b981; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center;">
              <h2 style="text-transform: uppercase; letter-spacing: 0.2em; font-size: 14px;">Protocol: Authenticated</h2>
              <p style="color: #a1a1aa; font-size: 10px; margin-top: 8px;">Synchronizing with Sovereign Mesh...</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', tokens: ${JSON.stringify(tokens)} }, '*');
                  window.close();
                } else {
                  window.location.href = '/';
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Code exchange failure:', error);
      res.status(500).send('Authentication failure');
    }
  });

  app.post('/api/drive/sync', async (req, res) => {
    const { tokens, documents } = req.body;
    if (!tokens) return res.status(401).json({ error: 'Missing tokens' });

    try {
      const client = new google.auth.OAuth2(
        process.env.VITE_GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      client.setCredentials(tokens);

      const drive = google.drive({ version: 'v3', auth: client });

      // Find or create AegisVault folder in appDataFolder
      const fileMetadata = {
        name: 'aegis_vault_backup.json',
        parents: ['appDataFolder']
      };

      // Check if file exists
      const response = await drive.files.list({
        spaces: 'appDataFolder',
        fields: 'files(id, name)',
        q: "name = 'aegis_vault_backup.json'"
      });

      const existingFiles = response.data.files;
      const media = {
        mimeType: 'application/json',
        body: JSON.stringify({ documents, updatedAt: Date.now() })
      };

      if (existingFiles && existingFiles.length > 0) {
        // Update
        const fileId = existingFiles[0].id!;
        await drive.files.update({
          fileId: fileId,
          media: media
        });
      } else {
        // Create
        await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id'
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Drive sync failure:', error);
      res.status(500).json({ error: 'Sync failure' });
    }
  });

  app.post('/api/drive/fetch', async (req, res) => {
    const { tokens } = req.body;
    if (!tokens) return res.status(401).json({ error: 'Missing tokens' });

    try {
      const client = new google.auth.OAuth2(
        process.env.VITE_GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      client.setCredentials(tokens);

      const drive = google.drive({ version: 'v3', auth: client });

      const response = await drive.files.list({
        spaces: 'appDataFolder',
        fields: 'files(id, name)',
        q: "name = 'aegis_vault_backup.json'"
      });

      const existingFiles = response.data.files;
      if (existingFiles && existingFiles.length > 0) {
        const fileId = existingFiles[0].id!;
        const fileContent = await drive.files.get({
          fileId: fileId,
          alt: 'media'
        });
        res.json(fileContent.data);
      } else {
        res.json({ documents: [], updatedAt: 0 });
      }
    } catch (error) {
      console.error('Drive fetch failure:', error);
      res.status(500).json({ error: 'Fetch failure' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
