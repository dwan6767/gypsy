// api/set.js
let currentUrl = null;

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Missing URL' });
    currentUrl = url;
    console.log('🔗 New ngrok URL:', url);
    return res.status(200).json({ success: true, url });
  } 
  else if (req.method === 'GET') {
    if (!currentUrl) return res.status(404).json({ error: 'No URL set yet' });
    return res.status(200).json({ url: currentUrl });
  } 
  else {
    res.status(405).end();
  }
}

