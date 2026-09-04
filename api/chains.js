import { connectToDatabase, Chain, User } from '../db.js';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;

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
      // Get all chains. For a real app with lots of data, we'd paginate or limit.
      const chains = await Chain.find().sort({ createdAt: -1 }).lean();
      
      // Get all users involved to send basic info to frontend
      const userIds = new Set();
      chains.forEach(c => {
        c.acts.forEach(act => {
          userIds.add(act.from.toString());
          userIds.add(act.to.toString());
        });
      });
      
      const users = await User.find({ _id: { $in: Array.from(userIds) } })
        .select('name initials color')
        .lean();
        
      return res.status(200).json({ chains, users });
    }

    if (req.method === 'POST') {
      const currentUserId = getUserFromReq(req);
      if (!currentUserId) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
      }

      const { fromUserId, toUserId, action, category } = req.body;

      // Ensure the logged in user is either the giver or receiver
      if (currentUserId !== fromUserId && currentUserId !== toUserId) {
        return res.status(403).json({ message: 'You can only complete acts you are involved in.' });
      }

      const act = {
        from: fromUserId,
        to: toUserId,
        action,
        category,
        completedAt: new Date()
      };

      // Find an existing chain to append to, or create a new one
      let chain = await Chain.findOne({
        $or: [
          { 'acts.from': fromUserId },
          { 'acts.to': fromUserId },
          { 'acts.from': toUserId },
          { 'acts.to': toUserId }
        ]
      });

      if (chain) {
        chain.acts.push(act);
        await chain.save();
      } else {
        const fromUser = await User.findById(fromUserId);
        chain = new Chain({
          name: `${fromUser.name}'s Chain`,
          acts: [act]
        });
        await chain.save();
      }

      return res.status(200).json({ act, chain });
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Chains API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
