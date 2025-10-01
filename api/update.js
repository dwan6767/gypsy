let latestData = null;

export default function handler(req, res) {
  if (req.method === "POST") {
    // ESP8266 sends JSON
    latestData = req.body;
    console.log("Received from ESP8266:", latestData);
    res.status(200).json({ message: "Data received" });
  } 
  else if (req.method === "GET") {
    // Visitor fetches latest data
    res.status(200).json(latestData || { message: "No data yet" });
  } 
  else {
    res.status(405).send("Method Not Allowed");
  }
}

