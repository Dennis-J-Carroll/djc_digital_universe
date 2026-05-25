/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/
 */

const React = require("react")

/**
 * @type {import('gatsby').GatsbySSR['onRenderBody']}
 */
exports.onRenderBody = ({ setHtmlAttributes, setPostBodyComponents }) => {
  setHtmlAttributes({ lang: `en` })

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
