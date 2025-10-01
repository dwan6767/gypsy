// api/update.js
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
  <script>
    setInterval(() => {
      const now = new Date();
      document.getElementById('time').innerText = now.toLocaleTimeString();
    }, 1000);
  </script>
</body>
</html>
`;

export default function handler(req, res) {
  if (req.method === "POST") {
    // ESP8266 sends JSON: { "html": "<html>...</html>" }
    latestHTML = req.body.html || latestHTML;
    res.status(200).json({ message: "HTML received" });
  } else if (req.method === "GET") {
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(latestHTML);
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
