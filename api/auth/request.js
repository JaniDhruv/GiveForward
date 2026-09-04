import { connectToDatabase, User } from '../db.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    await connectToDatabase();

    // Create a magic link token that expires in 15 minutes
    const token = jwt.sign({ email, name }, JWT_SECRET, { expiresIn: '15m' });

    // The URL the user will click in their email
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = req.headers.host;
    const magicLink = `${protocol}://${host}/api/auth/verify?token=${token}`;

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"GiveForward" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Magic Link for GiveForward 🌱',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h2 style="color: #111827; text-align: center; margin-bottom: 24px;">Welcome to GiveForward</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; text-align: center;">
            Click the button below to securely sign in to your account. This link will expire in 15 minutes.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${magicLink}" style="background-color: #6C5CE7; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">
              Sign In to GiveForward
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 32px;">
            If you didn't request this link, you can safely ignore this email.<br>
            Generosity isn't measured in dollars — it's measured in chains of human connection.
          </p>
        </div>
      `,
    };

    // For local development, if SMTP_PASS is missing, just print the link
    if (!process.env.SMTP_PASS) {
      console.log('==============================================');
      console.log('MAGIC LINK GENERATED (SMTP_PASS not set):');
      console.log(magicLink);
      console.log('==============================================');
      return res.status(200).json({ message: 'Magic link logged to console for testing.' });
    }

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Magic link sent successfully' });
  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ message: 'Failed to send magic link' });
  }
}
