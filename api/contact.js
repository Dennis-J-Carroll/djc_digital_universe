const nodemailer = require('nodemailer');
const { check, validationResult } = require('express-validator');
require('dotenv').config();

// Basic in-memory rate limiter (limited effectiveness in serverless)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

// Create validation rules (these will be applied manually since this is a serverless function)
const validationRules = [
  { field: 'name', validate: (value) => value && value.trim().length > 0, message: 'Name is required' },
  { field: 'email', validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), message: 'Valid email is required' },
  { field: 'subject', validate: (value) => value && value.trim().length > 0, message: 'Subject is required' },
  { field: 'message', validate: (value) => value && value.trim().length > 10, message: 'Message must be at least 10 characters' },
];

// Honeypot check for basic spam protection
const isSpam = (data) => {
  return data.honeypot && data.honeypot.length > 0;
};

// Create a transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// This is the handler for Vercel serverless functions
export default async function handler(req, res) {
  // --- Rate Limiting Check ---
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();

  // Clean up old entries
  rateLimit.forEach((timestamps, key) => {
    rateLimit.set(key, timestamps.filter(timestamp => timestamp > now - RATE_LIMIT_WINDOW_MS));
  });

  const timestamps = rateLimit.get(ip) || [];

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
  }

  timestamps.push(now);
  rateLimit.set(ip, timestamps);
  // ---------------------------

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get the data from the request body
  const data = req.body;

  // Check for spam using honeypot
  if (isSpam(data)) {
    // Return 200 OK to not let the spammer know their attempt was detected
    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
    });
  }

  // Validate the input
  const errors = [];
  validationRules.forEach((rule) => {
    if (!rule.validate(data[rule.field])) {
      errors.push({ field: rule.field, message: rule.message });
    }
  });

  // If there are validation errors, return them
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Sanitize the inputs
  const name = sanitizeInput(data.name);
  const email = sanitizeInput(data.email);
  const subject = sanitizeInput(data.subject);
  const message = sanitizeInput(data.message);

  // Create the email
  const emailContent = `
    <h1>New Contact Form Submission</h1>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong> ${message}</p>
  `;

  // Send the email
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Dennis Carroll Website" <${process.env.SMTP_USER}>`,
      to: process.env.RECIPIENT_EMAIL || 'denniscarrollj@gmail.com',
      subject: `New Contact Form: ${subject}`,
      html: emailContent,
      replyTo: email
    });

    return res.status(200).json({
      success: true,
      message: 'Thanks for your message! I\'ll get back to you soon.',
    });
  } catch (error) {
    console.error('Email sending error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'There was an error sending your message. Please try again later.',
    });
  }
}
