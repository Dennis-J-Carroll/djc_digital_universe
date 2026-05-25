/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/
 */

const React = require("react")
const fs = require("fs")
const path = require("path")

// Read chunk map at build time to generate preload hints for core bundles.
// These 3 files block the load event — preloading them lets the browser
// start downloading before it parses to the <script> tags at end of <body>.
function getCorePreloads() {
  try {
    const chunkMapPath = path.join(process.cwd(), "public", "chunk-map.json")
    const chunkMap = JSON.parse(fs.readFileSync(chunkMapPath, "utf8"))
    const appChunk = chunkMap["app"]?.[0]

    // webpack-runtime and framework have predictable glob patterns
    const publicDir = path.join(process.cwd(), "public")
    const files = fs.readdirSync(publicDir)
    const runtime = files.find(f => f.startsWith("webpack-runtime-") && f.endsWith(".js"))
    const framework = files.find(f => f.startsWith("framework-") && f.endsWith(".js"))

    return [runtime && `/${runtime}`, framework && `/${framework}`, appChunk]
      .filter(Boolean)
      .map((href, i) =>
        React.createElement("link", {
          key: `preload-core-${i}`,
          rel: "preload",
          as: "script",
          href,
        })
      )
  } catch {
    return []
  }
}

/**
 * @type {import('gatsby').GatsbySSR['onRenderBody']}
 */
exports.onRenderBody = ({ setHtmlAttributes, setHeadComponents, setPostBodyComponents }) => {
  setHtmlAttributes({ lang: `en` })

  // Async font loader — injected as a script so it does NOT block the load event.
  // display=swap: text renders immediately in fallback; Orbitron swaps in when ready.
  // hero-text.js gates its animation on document.fonts.load() so no FOUT on the name.
  setHeadComponents([
    ...getCorePreloads(),
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
        // Fire AFTER window load so the font request never blocks Safari's progress bar.
        // hero-text.js waits on document.fonts.load('800 1em Orbitron') before animating,
        // so the hero name still renders in Orbitron — just after load, not during.
        __html: `(function(){function f(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700&display=swap';document.head.appendChild(l);}if(document.readyState==='complete'){f();}else{window.addEventListener('load',f,{once:true});}})();`,
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
