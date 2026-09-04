import { connectToDatabase, Entry, User } from '../db.js';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to get user from cookie
function getUserFromReq(req) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.gf_session;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const { type, category, status, search } = req.query;
      let filter = {};

      if (type) filter.type = type;
      if (category) filter.category = category;
      if (status) filter.status = status;

      if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [
          { title: regex },
          { description: regex },
          { tags: regex }
        ];
      }

      // We populate the userId to get the user details on the frontend
      const entries = await Entry.find(filter)
        .sort({ createdAt: -1 })
        .populate('userId', 'name initials color')
        .lean();

      // Flatten user object slightly to match the old local structure if needed
      // Actually, frontend can just access entry.userId.name
      return res.status(200).json(entries);
    } 
    
    if (req.method === 'POST') {
      const userId = getUserFromReq(req);
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
      }

      const { type, title, description, category, tags, location, availability, estimatedTime } = req.body;

      const newEntry = new Entry({
        userId,
        type,
        title,
        description,
        category,
        tags: tags || [category],
        location,
        availability,
        estimatedTime,
      });

      await newEntry.save();
      
      const populatedEntry = await Entry.findById(newEntry._id).populate('userId', 'name initials color').lean();
      
      return res.status(201).json(populatedEntry);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Entries API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
