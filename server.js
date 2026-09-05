import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

import { connectToDatabase, User, Entry, Chain } from './server/db.js';
import { seedUsers, seedEntries, seedChains } from './src/data/seed.js';

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret';

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Connect to DB
connectToDatabase();

// Helper for avatars
function getRandomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB', '#F1C40F', '#E67E22'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getInitials(name) {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// Auth Middleware
function requireAuth(req, res, next) {
  const token = req.cookies.gf_session;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// ==========================================
// AUTH ROUTES
// ==========================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const user = new User({
      email,
      password,
      name,
      initials: getInitials(name),
      color: getRandomColor(),
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('gf_session', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    const userResponse = { _id: user._id, email: user.email, name: user.name, initials: user.initials, color: user.color };
    res.status(201).json({ user: userResponse });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('gf_session', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    const userResponse = { _id: user._id, email: user.email, name: user.name, initials: user.initials, color: user.color };
    res.json({ user: userResponse });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -__v');
    if (!user) return res.status(404).json({ user: null });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ user: null });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('gf_session');
  res.json({ message: 'Logged out' });
});

// ==========================================
// DATA ROUTES
// ==========================================

app.get('/api/entries', async (req, res) => {
  try {
    const { type, category, search } = req.query;
    let filter = {};

    if (type) filter.type = type;
    if (category && category !== 'all') filter.category = category;

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ title: regex }, { description: regex }, { tags: regex }];
    }

    const entries = await Entry.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name initials color email')
      .lean();
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/entries', requireAuth, async (req, res) => {
  try {
    const { type, title, description, category, tags, location, availability, estimatedTime } = req.body;
    const newEntry = new Entry({
      userId: req.userId,
      type, title, description, category, tags: tags || [category], location, availability, estimatedTime
    });
    await newEntry.save();
    
    const populated = await Entry.findById(newEntry._id).populate('userId', 'name initials color').lean();
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/chains', async (req, res) => {
  try {
    const chains = await Chain.find().sort({ createdAt: -1 }).lean();
    const userIds = new Set();
    chains.forEach(c => c.acts.forEach(act => {
      userIds.add(act.from.toString());
      userIds.add(act.to.toString());
    }));
    
    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('name initials color email').lean();
    res.json({ chains, users });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/chains', requireAuth, async (req, res) => {
  try {
    const { fromUserId, toUserId, action, category } = req.body;
    if (req.userId !== fromUserId && req.userId !== toUserId) {
      return res.status(403).json({ message: 'Can only complete acts you are involved in' });
    }

    const act = { from: fromUserId, to: toUserId, action, category, completedAt: new Date() };
    let chain = await Chain.findOne({
      $or: [
        { 'acts.from': fromUserId }, { 'acts.to': fromUserId },
        { 'acts.from': toUserId }, { 'acts.to': toUserId }
      ]
    });

    if (chain) {
      chain.acts.push(act);
      await chain.save();
    } else {
      const fromUser = await User.findById(fromUserId);
      chain = new Chain({ name: `${fromUser.name}'s Chain`, acts: [act] });
      await chain.save();
    }
    res.json({ act, chain });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/seed', async (req, res) => {
  try {
    await User.deleteMany({});
    await Entry.deleteMany({});
    await Chain.deleteMany({});

    const idMap = new Map();

    const usersToInsert = await Promise.all(seedUsers.map(async u => ({
      email: u.email,
      password: await bcrypt.hash('password123', 10),
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

    res.json({ message: 'Database seeded! Login with u15@example.com / password123' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to seed' });
  }
});

// ==========================================
// AI & VOICE ROUTES
// ==========================================

import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/parse', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Missing or empty "text" field' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  const SYSTEM_PROMPT = `You are a structured data parser for GiveForward. Given a natural language description, extract structured data.
Return ONLY valid JSON with this exact shape:
{
  "type": "need" | "offer",
  "title": "short 5-8 word summary",
  "description": "cleaned up version of their message (1-2 sentences)",
  "category": one of ["education", "food", "tech", "time", "items", "skills", "health", "transport", "housing", "other"],
  "tags": ["tag1", "tag2", "tag3"] (2-4 relevant tags),
  "availability": "when they're available (if mentioned, else null)",
  "location": "location if mentioned, else null",
  "estimatedTime": "estimated time commitment if applicable, else null"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `${SYSTEM_PROMPT}\n\nInput: "${text.trim()}"`,
    });
    const raw = response.text.trim();
    const jsonStr = raw.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
    res.status(200).json({ success: true, data: JSON.parse(jsonStr) });
  } catch (error) {
    console.error('Gemini parse error:', error);
    res.status(500).json({ error: 'Failed to parse text' });
  }
});

app.post('/api/match', async (req, res) => {
  const { request, offers } = req.body;
  if (!request || !offers || !Array.isArray(offers)) {
    return res.status(400).json({ error: 'Missing request or offers' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  const SYSTEM_PROMPT = `You are a matching engine for GiveForward. Given a REQUEST and OFFERS, rank matches.
Return ONLY valid JSON:
{ "matches": [ { "offerId": "id", "score": 0.0-1.0, "reason": "reason" } ] }`;

  try {
    const prompt = `${SYSTEM_PROMPT}\n\nREQUEST:\n${JSON.stringify(request, null, 2)}\n\nOFFERS:\n${JSON.stringify(offers, null, 2)}`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const raw = response.text.trim();
    const jsonStr = raw.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
    res.status(200).json({ success: true, data: JSON.parse(jsonStr) });
  } catch (error) {
    console.error('Gemini match error:', error);
    res.status(500).json({ error: 'Failed to find matches' });
  }
});

app.post('/api/speak', async (req, res) => {
  const { text, voiceId } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Missing text field' });
  }
  if (!process.env.ELEVENLABS_API_KEY) {
    return res.status(500).json({ error: 'ELEVENLABS_API_KEY not configured' });
  }

  const selectedVoice = voiceId || '21m00Tcm4TlvDq8ikWAM';
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': process.env.ELEVENLABS_API_KEY },
      body: JSON.stringify({ text: text.trim(), model_id: 'eleven_flash_v2_5' })
    });

    if (!response.ok) return res.status(response.status).json({ error: 'ElevenLabs API error' });

    res.setHeader('Content-Type', 'audio/mpeg');
    const arrayBuffer = await response.arrayBuffer();
    res.status(200).send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('ElevenLabs speak error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
