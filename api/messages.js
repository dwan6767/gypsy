// /api/messages.js
import { messages } from './update.js'; // reuse same in-memory array

export default function handler(req, res) {
  res.status(200).json(messages);
}

