/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/
 */

// Import Tailwind CSS
import "./src/styles/tailwind.css"

// Import other global styles
import "./src/styles/global.css"
import "./src/styles/futuristic-ui.css"

// Web Vitals monitoring for performance tracking
export const onClientEntry = () => {
  // Only run in production to avoid dev noise
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Dynamically import web-vitals to avoid increasing initial bundle
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB, onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      // Log Core Web Vitals to console (in production, send to analytics service)
      const logVital = (metric) => {
        console.log(`[Web Vitals] ${metric.name}:`, Math.round(metric.value), metric.rating);

        // TODO: Send to analytics service (e.g., Google Analytics, Vercel Analytics)
        // Example:
        // window.gtag?.('event', metric.name, {
        //   value: Math.round(metric.value),
        //   metric_id: metric.id,
        //   metric_value: metric.value,
        //   metric_delta: metric.delta,
        //   metric_rating: metric.rating,
        // });
      };

      // Monitor all Core Web Vitals
      onCLS(logVital);   // Cumulative Layout Shift
      onFID(logVital);   // First Input Delay
      onFCP(logVital);   // First Contentful Paint
      onLCP(logVital);   // Largest Contentful Paint
      onTTFB(logVital);  // Time to First Byte
    }).catch(err => {
      // Silently fail if web-vitals fails to load
      console.warn('Failed to load web-vitals:', err);
    });
  }
};
