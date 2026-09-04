// api/db.js
// Shared Mongoose connection and Schemas for Vercel Serverless Functions

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in serverless environments. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// ==========================================
// SCHEMAS
// ==========================================

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  initials: { type: String, required: true },
  color: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const entrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['need', 'offer'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  tags: [String],
  status: { type: String, enum: ['open', 'completed'], default: 'open' },
  location: String,
  availability: String,
  estimatedTime: String,
  createdAt: { type: Date, default: Date.now },
});

const actSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  category: { type: String, required: true },
  completedAt: { type: Date, default: Date.now },
});

const chainSchema = new mongoose.Schema({
  name: { type: String, required: true },
  acts: [actSchema],
  createdAt: { type: Date, default: Date.now },
});

// Avoid OverwriteModelError in serverless environments
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Entry = mongoose.models.Entry || mongoose.model('Entry', entrySchema);
export const Chain = mongoose.models.Chain || mongoose.model('Chain', chainSchema);
