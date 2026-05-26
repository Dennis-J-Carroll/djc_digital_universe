/**
 * submission-created.js
 *
 * Netlify automatically invokes this function whenever any form with
 * data-netlify="true" receives a submission. No route wiring needed.
 *
 * Required env vars (set in Netlify Dashboard → Site Settings → Env Vars):
 *   SMTP_USER  — Gmail address used to send (e.g. denniscarrollj@gmail.com)
 *   SMTP_PASS  — Gmail App Password (16 chars, no spaces)
 *                Generate at: myaccount.google.com → Security → App passwords
 */

const nodemailer = require('nodemailer');

const RECIPIENTS = 'denniscarroll93@gmail.com, denniscarrollj@gmail.com';

exports.handler = async (event) => {
  let payload;
  try {
    ({ payload } = JSON.parse(event.body));
  } catch (err) {
    console.error('Could not parse submission payload:', err);
    return { statusCode: 400, body: 'Bad payload' };
  }

  // Only act on the contact form (site also has a newsletter form)
  if (payload.form_name !== 'contact') {
    return { statusCode: 200, body: `Skipped form: ${payload.form_name}` };
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('SMTP_USER / SMTP_PASS not configured — email not sent');
    // Return 200 so Netlify does not retry endlessly
    return { statusCode: 200, body: 'SMTP not configured' };
  }

  const { name, email, message } = payload.data;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const html = `
    <h2 style="font-family:sans-serif;color:#1a1a2e;">New message from dennisjcarroll.com</h2>
    <table style="font-family:sans-serif;border-collapse:collapse;width:100%;max-width:560px;">
      <tr>
        <td style="padding:8px 12px;font-weight:600;color:#555;white-space:nowrap;">Name</td>
        <td style="padding:8px 12px;">${sanitize(name)}</td>
      </tr>
      <tr style="background:#f8f8f8;">
        <td style="padding:8px 12px;font-weight:600;color:#555;white-space:nowrap;">Email</td>
        <td style="padding:8px 12px;"><a href="mailto:${sanitize(email)}">${sanitize(email)}</a></td>
      </tr>
      <tr>
        <td style="padding:8px 12px;font-weight:600;color:#555;vertical-align:top;">Message</td>
        <td style="padding:8px 12px;">${sanitize(message).replace(/\n/g, '<br>')}</td>
      </tr>
    </table>
  `;

  try {
    await transporter.sendMail({
      from: `"dennisjcarroll.com" <${process.env.SMTP_USER}>`,
      to: RECIPIENTS,
      replyTo: email,
      subject: `Contact: ${sanitize(name)}`,
      html,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });
    console.log(`Contact email sent — from ${email}`);
    return { statusCode: 200, body: 'Email sent' };
  } catch (err) {
    console.error('nodemailer error:', err.message);
    return { statusCode: 500, body: `Email failed: ${err.message}` };
  }
};

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
