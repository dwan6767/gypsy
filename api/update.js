// api/update.js
import fs from 'fs';
import path from 'path';

const file = path.resolve('/tmp/url.json'); // ephemeral but okay for simple redirector
let current = null;

// Accept POST to update, GET to retrieve / redirect
export default function handler(req, res) {
  if (req.method === 'POST') {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: 'Missing url' });
    current = url;
    try { fs.writeFileSync(file, JSON.stringify({ url })); } catch(e){ /* ignore */ }
    console.log('Updated tunnel ->', url);
    return res.status(200).json({ success: true, url });
  }

  // GET and other methods: redirect to current URL if present
  if (!current) {
    // try load from file
    try {
      if (fs.existsSync(file)) {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        current = data.url;
      }
    } catch(e) { /* ignore */ }
  }

  if (!current) return res.status(404).send('No active tunnel');
  res.writeHead(302, { Location: current });
  res.end();
}
