import { connectToDatabase, User } from '../db.js';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const cookies = parse(req.headers.cookie || '');
  const token = cookies.gf_session;

  if (!token) {
    return res.status(401).json({ user: null });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    await connectToDatabase();
    const user = await User.findById(decoded.userId).select('-__v');

    if (!user) {
      return res.status(401).json({ user: null });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(401).json({ user: null });
  }
}
