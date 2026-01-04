/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

const path = require("path")
const { createFilePath } = require("gatsby-source-filesystem")

/**
 * @type {import('gatsby').GatsbyNode['onCreateDevServer']}
 */
exports.onCreateDevServer = ({ app }) => {
  const express = require('express')

  // Serve static HTML files from the static directory in development mode
  app.use('/apps', express.static(path.join(__dirname, 'static/apps')))
  app.use('/Wpp', express.static(path.join(__dirname, 'static/Wpp')))

  console.log('\n✓ Static HTML files configured for dev server:')
  console.log('  📱 Apps: http://localhost:8000/apps/')
  console.log('  🎓 CLI University: http://localhost:8000/Wpp/CLI_uni.html\n')
}

/**
 * @type {import('gatsby').GatsbyNode['onCreateNode']}
 */
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === "Mdx") {
    const value = createFilePath({ node, getNode })
    
    createNodeField({
      name: "slug",
      node,
      value,
    })
  }
}

/**
 * @type {import('gatsby').GatsbyNode['createSchemaCustomization']}
 */
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  // Define custom schema types for MDX frontmatter
  const typeDefs = `
    type MdxFrontmatter {
      title: String
      date: Date @dateformat
      slug: String
      tech_stack: [String]
      complexity_level: String
      interactive_demo: Boolean
      category: String
      published: Boolean
      description: String
      status: String
      featuredImage: File @fileByRelativePath
      author: String
      modified: Date @dateformat
    }
  `

  createTypes(typeDefs)
}

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  console.log("Starting createPages function")

  // Define templates
  const projectTemplate = path.resolve("./src/templates/project-detail.js")
  console.log("Project template path:", projectTemplate)
  
  // Query for MDX nodes to use in creating pages
  const result = await graphql(`
    query {
      allMdx {
        nodes {
          id
          fields {
            slug
          }
          internal {
            contentFilePath
          }
          frontmatter {
            slug
          }
          parent {
            ... on File {
              sourceInstanceName
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild('Error loading MDX result', result.errors)
    return
  }

  // Create pages for each MDX file
  const posts = result.data.allMdx.nodes
  console.log("Number of MDX nodes found:", posts.length)

  posts.forEach(node => {
    const slug = node.frontmatter.slug || node.fields.slug
    const sourceInstanceName = node.parent.sourceInstanceName
    
    console.log("Processing node:", {
      id: node.id,
      slug,
      sourceInstanceName,
      contentFilePath: node.internal.contentFilePath
    })
    
    let pagePath = '';
    
    // Determine path based on content type
    switch(sourceInstanceName) {
      case 'data-science-projects':
        pagePath = `/data-science/${slug}`;
        break;
      case 'python-dev-projects':
        pagePath = `/python-dev/${slug}`;
        break;
      case 'blog-posts':
        pagePath = `/blog/${slug}`;
        break;
      case 'stories':
        pagePath = `/stories/${slug}`;
        break;
      default:
        pagePath = slug;
    }
    
    console.log("Creating page with path:", pagePath)
    
    createPage({
      path: pagePath,
      component: `${projectTemplate}?__contentFilePath=${node.internal.contentFilePath}`,
      context: {
        id: node.id,
        slug: slug,
        contentType: sourceInstanceName
      },
    })
  })
}
