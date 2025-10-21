let currentUrl = null;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { url } = req.body;
    currentUrl = url;
    return res.json({ success: true, url });
  }

  if (!currentUrl) return res.status(404).send('No tunnel set');
  res.writeHead(302, { Location: currentUrl });
  res.end();
}

