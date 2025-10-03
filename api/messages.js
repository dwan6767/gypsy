// api/messages.js

// Temporary in-memory storage
let messages = []; // { user: string, msg: string }

export default function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { user, msg } = req.body;
      if (!user || !msg) {
        return res.status(400).json({ error: "Missing user or msg" });
      }

      // Limit messages to last 50
      messages.push({ user, msg });
      if (messages.length > 50) messages.shift();

      return res.status(200).json({ status: "ok" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // GET request: return all messages
  return res.status(200).json(messages);
}

