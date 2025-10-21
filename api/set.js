import fs from 'fs';
import path from 'path';

const file = path.resolve('/tmp/url.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    const { url } = req.body;
    if (!url) return res.status(400).send('Missing URL');
    fs.writeFileSync(file, JSON.stringify({ url }));
    res.status(200).json({ success: true, url });
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
}

