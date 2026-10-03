import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Optional voice service must not prevent the card game from starting.
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// REST endpoint for voice conversation fallback (Gaucho Copilot with Live audio/text personality)
app.post('/api/voice-chat', async (req, res) => {
  if (!ai || !process.env.GEMINI_TEXT_MODEL) { res.status(503).json({ error: 'El asistente de voz no está configurado.' }); return; }
  try {
    const { prompt } = req.body;
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_TEXT_MODEL!,
      contents: prompt || 'Dame un buen consejo de truco criollo con picardía.',
      config: {
        systemInstruction:
          'Sos un veterano maestro gaucho de Truco Criollo en el Salón Digital. Respondé con sabiduría tradicional criolla argentina, usando vocabulario de truco (envido, flor, truco, retruco, vale 4, ancho de espada, picardía, señas). Sé conciso, pícaro y respetuoso del código criollo.',
      },
    });

    const reply = response.text || '¡Abran cancha que viene barajando fuerte, compadre!';
    res.json({ reply });
  } catch (error) {
    console.error('Error in /api/voice-chat:', error);
    res.status(500).json({ error: 'No se pudo comunicar con el compadre criollo.' });
  }
});

// WebSocket Server for Live API (gemini-3.8-live) real-time voice streaming
const wss = new WebSocketServer({ server, path: '/api/live' });

wss.on('connection', async (clientWs: WebSocket) => {
  if (!ai || !process.env.GEMINI_LIVE_MODEL) { clientWs.send(JSON.stringify({ error: 'El asistente de voz no está configurado.' })); clientWs.close(1013); return; }

  let session: any = null;

  try {
    session = await ai.live.connect({
      model: process.env.GEMINI_LIVE_MODEL!,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction:
          'Sos el Compadre Criollo de la mesa de Truco. Estás en vivo charlando con el gaucho. Hablás con tonada criolla argentina y sabés cuándo tirar una flor, cuándo cantar la falta y cuándo mentir con cara de piedra. Respondé con frases vivaces, auténticas y directas.',
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
          if (audio || text) {
            clientWs.send(JSON.stringify({ audio, text }));
          }
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
      },
    });

    clientWs.on('message', (data) => {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.audio && session) {
          session.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (payload.text && session) {
          session.sendRealtimeInput({
            text: payload.text,
          });
        }
      } catch (err) {
        console.error('Error handling WebSocket message from client:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('Live client disconnected');
      if (session && typeof session.close === 'function') {
        session.close();
      }
    });
  } catch (err) {
    console.error('Failed to establish Live API session:', err);
    clientWs.send(
      JSON.stringify({
        error: 'Error al conectar con gemini-3.8-live. Activando modo asistido.',
      })
    );
  }
});

// Mount Vite or serve static files
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Truco Criollo Server with Gemini Live running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

