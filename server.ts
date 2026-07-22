import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { assertRuntimeConfig, config, supabaseConfigured } from './server/config';
import coreRoutes from './server/routes/core';
import livekitRoutes from './server/routes/livekit';
import platformRoutes from './server/routes/platform';
import eventsRoutes from './server/routes/events';
import engagementRoutes from './server/routes/engagement';

async function startServer() {
  assertRuntimeConfig();

  if (!supabaseConfigured()) {
    console.warn(
      '[SHC] WARNING: Supabase is not configured. API routes that need the database will fail until SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set and schema.sql is applied.'
    );
  } else {
    console.log('[SHC] Supabase configured');
  }

  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'shc-platform',
      supabase: supabaseConfigured(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api', coreRoutes);
  app.use('/api', livekitRoutes);
  app.use('/api', platformRoutes);
  app.use('/api', eventsRoutes);
  app.use('/api', engagementRoutes);

  if (config.nodeEnv !== 'production') {
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

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`SHC Platform running on http://0.0.0.0:${config.port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
