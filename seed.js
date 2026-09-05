import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectToDatabase, User, Entry, Chain } from './server/db.js';
import { seedUsers, seedEntries, seedChains } from './src/data/seed.js';

async function runSeed() {
  try {
    await connectToDatabase();
    console.log('🌱 Seeding database...');

    await User.deleteMany({});
    await Entry.deleteMany({});
    await Chain.deleteMany({});

    const idMap = new Map();

    const usersToInsert = await Promise.all(seedUsers.map(async u => ({
      email: u.email,
      password: await bcrypt.hash(u.password, 10),
      name: u.name,
      initials: u.initials,
      color: u.color
    })));
    
    const insertedUsers = await User.insertMany(usersToInsert);
    seedUsers.forEach((su, idx) => idMap.set(su.id, insertedUsers[idx]._id));

    const entriesToInsert = seedEntries.map(e => ({
      userId: idMap.get(e.userId),
      type: e.type, title: e.title, description: e.description, category: e.category, tags: e.tags, status: e.status, location: e.location, availability: e.availability, estimatedTime: e.estimatedTime, createdAt: new Date(e.createdAt)
    }));
    await Entry.insertMany(entriesToInsert);

    const chainsToInsert = seedChains.map(c => ({
      name: c.name,
      acts: c.acts.map(act => ({
        from: idMap.get(act.from), to: idMap.get(act.to), action: act.action, category: act.category, completedAt: new Date(act.completedAt)
      }))
    }));
    await Chain.insertMany(chainsToInsert);

    console.log('✅ Database successfully seeded!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed database:', err);
    process.exit(1);
  }
}

runSeed();
