import fs from 'fs';
import path from 'path';

const file = path.resolve('/tmp/url.json'); // /tmp persists per instance on Vercel runtime

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Missing URL' });
    fs.writeFileSync(file, JSON.stringify({ url }));
    console.log('✅ Updated URL:', url);
    return res.json({ ok: true, url });
  }

  if (req.method === 'GET') {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      return res.json(data);
    }
    return res.status(404).json({ error: 'No URL stored yet' });
  }

  res.status(405).end();
}

  // GET request: return all messages
  return res.status(200).json(messages);
}

