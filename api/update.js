
// api/update.js
export const config = { api: { bodyParser: true } };

let latestHTML = "<p>No data yet</p>";
let lastUpdate = 0; // timestamp of last ESP POST

export default function handler(req, res) {
  const now = Date.now();

  if (req.method === "POST") {
    const data = req.body;
    if (data && data.html) {
      latestHTML = data.html;
      lastUpdate = now;
      return res.status(200).json({ message: "HTML received" });
    }
    return res.status(400).json({ message: "Missing html field" });
  } else if (req.method === "GET") {
    // if last update was more than 10 seconds ago, clear cache
    if (now - lastUpdate > 10000) {
      return res.status(200).json({ html: "<p>No data (ESP offline)</p>" });
    }
    return res.status(200).json({ html: latestHTML });
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
