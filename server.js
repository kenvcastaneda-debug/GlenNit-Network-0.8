import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import RunwayML, { TaskFailedError, TaskTimedOutError } from '@runwayml/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const runway = new RunwayML({ apiKey: process.env.RUNWAYML_API_SECRET });

app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

function ratioFor(value) {
  if (value === '9:16') return '480:854';
  if (value === '1:1') return '480:480';
  return '854:480';
}

app.post('/api/generate', async (req, res) => {
  const prompt = String(req.body?.prompt || '').trim();
  const duration = Number(req.body?.duration || 5);
  const aspect = String(req.body?.aspect || '16:9');
  const style = String(req.body?.style || 'Cinematic');

  if (!prompt) return res.status(400).json({ error: 'Please enter a video prompt.' });
  if (![5, 10].includes(duration)) return res.status(400).json({ error: 'Duration must be 5 or 10 seconds.' });
  if (!process.env.RUNWAYML_API_SECRET) return res.status(500).json({ error: 'RUNWAYML_API_SECRET is not configured on the server.' });

  const styledPrompt = `${prompt}. Visual style: ${style}.`;

  try {
    const task = await runway.imageToVideo.create({
      model: 'seedance2_5',
      promptText: styledPrompt,
      ratio: ratioFor(aspect),
      duration
    }).waitForTaskOutput({ timeout: 10 * 60 * 1000 });

    return res.json({ videoUrl: task.output?.[0] || null, taskId: task.id });
  } catch (error) {
    if (error instanceof TaskFailedError) {
      return res.status(502).json({ error: 'The AI video task failed.', details: error.taskDetails || null });
    }
    if (error instanceof TaskTimedOutError) {
      return res.status(504).json({ error: 'The video is taking too long. Try again later.' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Video generation failed.' });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(port, () => console.log(`AI Video Studio running on port ${port}`));
