// /api/update.js
let messages = []; // in-memory storage (reset on server restart)
export default function handler(req, res) {
  if (req.method === "POST") {
    const { user, msg } = req.body;
    if (user && msg) {
      messages.push({ user, msg, ts: Date.now() });
      // Keep last 200 messages
      if (messages.length > 200) messages.shift();
      res.status(200).json({ status: "ok" });
    } else {
      res.status(400).json({ status: "error", message: "user or msg missing" });
    }
  } else {
    res.status(405).json({ status: "error", message: "Method not allowed" });
  }
}

