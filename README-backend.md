# Back-End Implementation for Dennis Carroll's Website

This document outlines the server-side implementation for handling the contact form and SEO functionality.

## Architecture Overview

The back-end uses **serverless functions** to handle form submissions, following a lightweight approach that integrates with the Gatsby front-end. This approach avoids the need for a dedicated server while still enabling dynamic functionality.

### Key Components

1. **Contact Form API**: Serverless function that handles form submissions and sends emails
2. **SEO Optimizations**: Sitemap generation and proper header configuration
3. **Deployment Configurations**: Support for both Netlify and Vercel platforms

## Serverless Functions

### Contact Form Handler

Two implementations are provided to support different hosting platforms:

- **Netlify**: `netlify/functions/contact.js`
- **Vercel**: `api/contact.js`

Both implementations provide identical functionality:

- Email validation
- Input sanitization
- Spam protection (honeypot field)
- Email sending via SMTP

### Technologies Used

- **Node.js** - JavaScript runtime
- **Nodemailer** - Email sending library
- **Express-validator** - Input validation 
- **dotenv** - Environment variable management

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/contact` (Vercel) or `/.netlify/functions/contact` (Netlify) | POST | Processes form submissions |

## Configuration

### Environment Variables

Create a `.env` file at the project root with the following variables (see `.env.example` for reference):

```
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_SECURE=true_or_false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
RECIPIENT_EMAIL=denniscarrollj@gmail.com
```

For Gmail, you'll need to create an App Password rather than using your account password.

### Deployment Configuration

#### Netlify

The `netlify.toml` file includes:
- Functions directory configuration
- API route redirects
- Compression and caching headers

#### Vercel

The `vercel.json` file includes:
- Build configurations for Gatsby and API functions
- Route handling
- Caching headers

## SEO Optimization

- **Sitemap**: Generated automatically using `gatsby-plugin-sitemap`
- **robots.txt**: Located in `/static/robots.txt`
- **Headers**: Cache-Control headers for improved performance

## Security Considerations

- All user inputs are sanitized to prevent XSS attacks
- Honeypot mechanism for basic spam protection
- CORS headers properly configured
- Environment variables used for sensitive information

## Performance Optimizations

- Response compression via `gatsby-plugin-compression`
- Proper cache headers for static assets
- Minimal dependencies to keep function size small

## Deployment

### Requirements

- Node.js 18.x or higher recommended
- SMTP credentials (for email functionality)

### Deployment Steps

1. Set environment variables in your hosting provider's dashboard
2. Deploy the site as you normally would with Gatsby
3. The serverless functions will be automatically deployed

## Local Development

1. Copy `.env.example` to `.env` and fill in your SMTP details
2. Run `gatsby develop`
3. Test the contact form (will use the API endpoint)

## Troubleshooting

- **Email not sending**: Check SMTP credentials and ports
- **Form validation errors**: Check browser console for details
- **CORS issues**: Ensure you're accessing the API from the correct origin
