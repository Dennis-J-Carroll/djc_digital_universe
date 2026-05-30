/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/
 */

const React = require("react")

/**
 * @type {import('gatsby').GatsbySSR['onRenderBody']}
 */
exports.onRenderBody = ({ setHtmlAttributes, setHeadComponents, setPostBodyComponents }) => {
  setHtmlAttributes({ lang: `en` })

  // Font loading: media="print" + onload pattern (Filament Group loadCSS).
  // Browser downloads font CSS during the initial load cycle (progress bar tracks it)
  // but the print media type means it never blocks rendering or first paint.
  // onload switches media to "all" so styles apply once the download completes.
  // noscript fallback covers JS-disabled browsers.
  setHeadComponents([
    React.createElement("link", {
      key: "font-preconnect-1",
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    }),
    React.createElement("link", {
      key: "font-preconnect-2",
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    }),
    React.createElement("link", {
      key: "google-fonts",
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&display=swap",
      media: "print",
    }),
    // Inline script runs synchronously during HTML parse and attaches the onload
    // handler that switches media from "print" to "all" once the font CSS downloads.
    // React SSR strips onLoad event props from static HTML, so this script is required.
    React.createElement("script", {
      key: "font-media-switch",
      dangerouslySetInnerHTML: {
        __html: `(function(){var l=document.currentScript.previousElementSibling;if(l&&l.tagName==='LINK'){if(l.sheet){l.media='all';}else{l.addEventListener('load',function(){l.media='all';});}}})();`,
      },
    }),
    React.createElement("noscript", {
      key: "google-fonts-noscript",
    }, React.createElement("link", {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&display=swap",
    })),
  ])

  // Hidden static forms for Netlify Forms detection at build time.
  // These are never shown — they just let Netlify know the form structure.
  setPostBodyComponents([
    React.createElement("form", {
      key: "netlify-contact",
      name: "contact",
      "data-netlify": "true",
      "data-netlify-honeypot": "bot-field",
      hidden: true,
    }, [
      React.createElement("input", { key: "fn", type: "hidden", name: "form-name", value: "contact" }),
      React.createElement("input", { key: "n",  type: "text",   name: "name" }),
      React.createElement("input", { key: "e",  type: "email",  name: "email" }),
      React.createElement("textarea", { key: "m", name: "message" }),
    ]),
  ])
}
