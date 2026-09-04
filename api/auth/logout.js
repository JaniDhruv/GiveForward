import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Clear the session cookie
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: -1, // Expire immediately
  };

  res.setHeader('Set-Cookie', serialize('gf_session', '', cookieOptions));
  res.status(200).json({ message: 'Logged out successfully' });
}
