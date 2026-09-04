import { connectToDatabase, User, Entry, Chain } from '../db.js';
import { seedUsers, seedEntries, seedChains } from '../../src/data/seed.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    // Clear existing
    await User.deleteMany({});
    await Entry.deleteMany({});
    await Chain.deleteMany({});

    // Map old IDs to Mongo ObjectIds
    const idMap = new Map();

    // Insert Users
    const usersToInsert = seedUsers.map(u => ({
      email: `${u.id}@example.com`,
      name: u.name,
      initials: u.initials,
      color: u.color
    }));
    
    const insertedUsers = await User.insertMany(usersToInsert);
    seedUsers.forEach((su, idx) => {
      idMap.set(su.id, insertedUsers[idx]._id);
    });

    // Insert Entries
    const entriesToInsert = seedEntries.map(e => ({
      userId: idMap.get(e.userId),
      type: e.type,
      title: e.title,
      description: e.description,
      category: e.category,
      tags: e.tags,
      status: e.status,
      location: e.location,
      availability: e.availability,
      estimatedTime: e.estimatedTime,
      createdAt: new Date(e.createdAt)
    }));
    await Entry.insertMany(entriesToInsert);

    // Insert Chains
    const chainsToInsert = seedChains.map(c => ({
      name: c.name,
      acts: c.acts.map(act => ({
        from: idMap.get(act.from),
        to: idMap.get(act.to),
        action: act.action,
        category: act.category,
        completedAt: new Date(act.completedAt)
      }))
    }));
    await Chain.insertMany(chainsToInsert);

    res.status(200).json({ message: 'Database successfully seeded!' });
  } catch (error) {
    console.error('Seed Error:', error);
    res.status(500).json({ message: 'Failed to seed database', error: error.message });
  }
}
