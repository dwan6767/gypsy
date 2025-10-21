import fs from 'fs';
import path from 'path';

const file = path.resolve('/tmp/url.json');

export default function handler(req, res) {
  try {
    if (!fs.existsSync(file)) {
      res.status(404).send('No active tunnel.');
      return;
    }

    const { url } = JSON.parse(fs.readFileSync(file, 'utf8'));
    res.writeHead(302, { Location: url });
    res.end();
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
}
