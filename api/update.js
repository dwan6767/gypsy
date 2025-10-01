// api/update.js

export const config = {
  api: { bodyParser: true }
};

let latestHTML = "<p>No data yet</p>";

export default function handler(req, res) {
  if (req.method === "POST") {
    console.log("Received POST:", req.body); // check Vercel logs
    const data = req.body;
    if (data && data.html) {
      latestHTML = data.html;
      return res.status(200).json({ message: "HTML received" });
    }
    return res.status(400).json({ message: "Missing html field" });
  } else if (req.method === "GET") {
    return res.status(200).json({ html: latestHTML });
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
