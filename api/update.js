let messages = []; // in-memory storage (last 100 messages)

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { user, msg } = req.body;
    if(user && msg){
      messages.push({ user, msg });
      if (messages.length > 100) messages.shift(); // keep last 100 messages
    }
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(405).end();
  }
}

