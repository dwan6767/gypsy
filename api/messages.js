let messages = []; // same in-memory messages (or shared DB)

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(messages);
  } else {
    res.status(405).end();
  }
}

