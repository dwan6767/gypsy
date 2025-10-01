// api/update.js
export const config = { api: { bodyParser: true } };

export default function handler(req, res) {
  if (req.method === "POST") {
    // ESP is sending content, we just acknowledge
    return res.status(200).json({ message: "Received" });
  } else if (req.method === "GET") {
    // Do NOT store anything, return empty (or instruct browser to fetch directly from ESP)
    return res.status(204).json({ html: "" });
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
