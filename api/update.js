import fs from 'fs';
import path from 'path';

const file = path.resolve('/tmp/url.json');

export default function handler(req, res) {
  let url = null;

  try {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      url = data.url;
    }
  } catch (e) {
    console.error(e);
  }

  if (!url) return res.status(404).send('No active tunnel');

  // Redirect to ngrok URL
  res.writeHead(302, { Location: url });
  res.end();
}

