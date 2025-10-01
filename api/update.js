// api/update.js

// Store the latest HTML sent by ESP
let latestHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>ESP8266 Demo</title>
  <style>
    body { font-family: Arial; text-align: center; padding: 20px; background: #f0f0f0; }
    h1 { color: #2c3e50; }
    p { color: #34495e; }
    #time { font-weight: bold; }
  </style>
</head>
<body>
  <h1>No data yet</h1>
  <p id="time"></p>
</body>
</html>
`;

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Parse JSON body
      const data = req.body;
      // If Vercel parses JSON automatically, req.body is object
      // Otherwise, use: const data = JSON.parse(req.body);

      if (data.html) {
        latestHTML = data.html;
        res.status(200).json({ message: "HTML received" });
      } else {
        res.status(400).json({ message: "Missing html field" });
      }
    } catch (err) {
      res.status(400).json({ message: "Invalid JSON" });
    }
  } else if (req.method === "GET") {
    // Serve the latest HTML
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(latestHTML);
  } else {
    res.status(405).send("Method Not Allowed"); 
  }
}
