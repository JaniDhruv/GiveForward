import { connectToDatabase, User } from '../db.js';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;

// Helper to generate a random hex color for avatars
function getRandomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB', '#F1C40F', '#E67E22'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Helper to get initials from name or email
function getInitials(name, email) {
  if (name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Invalid or missing magic link token.');
  }

  try {
    await connectToDatabase();

    // Verify the short-lived magic link token
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email.toLowerCase();

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        name: decoded.name || email.split('@')[0],
        initials: getInitials(decoded.name, email),
        color: getRandomColor(),
      });
      await user.save();
    }

    // Create a long-lived session token (e.g., 7 days)
    const sessionToken = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });

    // Set HTTP-only secure cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    res.setHeader('Set-Cookie', serialize('gf_session', sessionToken, cookieOptions));

    // Redirect to the app home page
    res.redirect('/#/');
  } catch (error) {
    console.error('Verify error:', error);
    res.status(401).send('Magic link is invalid or has expired. Please request a new one.');
  }
}
