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

  // Async font loader — injected as a script so it does NOT block the load event.
  // display=swap: text renders immediately in fallback; Orbitron swaps in when ready.
  // hero-text.js gates its animation on document.fonts.load() so no FOUT on the name.
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
    React.createElement("script", {
      key: "async-font-loader",
      dangerouslySetInnerHTML: {
        __html: `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700&display=swap';document.head.appendChild(l);})();`,
      },
    }),
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
