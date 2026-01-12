/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `Dennis Carroll's Website`,
    description: `A comprehensive personal website showcasing data science, Python development, creative writing, and more.`,
    author: `@denniscarrollj`,
    siteUrl: `https://denniscarroll.com`,
  },
  plugins: [
    `gatsby-plugin-image`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog-posts`,
        path: `${__dirname}/src/blog-posts`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `stories`,
        path: `${__dirname}/src/stories`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: ['.mdx', '.md'],
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1200,
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `everything-personal-website`,
        short_name: `everything`,
        start_url: `/`,
        background_color: `#070b17`,
        theme_color: `#0FA0CE`,
        display: `minimal-ui`,
        icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: `gatsby-plugin-postcss`,
      options: {
        postCssPlugins: [
          require('@tailwindcss/postcss'),
          require('autoprefixer'),
        ],
      },
    },
    // Enhanced sitemap plugin for SEO with priorities and lastmod
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        output: `/`,
        createLinkInHead: true,
        query: `
          {
            site {
              siteMetadata {
                siteUrl
              }
            }
            allSitePage {
              nodes {
                path
              }
            }
            allMdx {
              nodes {
                frontmatter {
                  date(formatString: "YYYY-MM-DD")
                }
                fields {
                  slug
                }
              }
            }
          }
        `,
        resolveSiteUrl: () => 'https://denniscarroll.com',
        serialize: ({ path, allMdx }) => {
          // Find matching MDX node for this path
          const mdxNode = allMdx?.nodes?.find(node =>
            node.fields?.slug && path.includes(node.fields.slug)
          );

          // Determine priority based on path
          let priority = 0.7; // default
          let changefreq = 'monthly';

          if (path === '/') {
            priority = 1.0;
            changefreq = 'weekly';
          } else if (path.includes('/development-projects')) {
            priority = 0.9;
            changefreq = 'weekly';
          } else if (path.includes('/about') || path.includes('/contact')) {
            priority = 0.8;
            changefreq = 'monthly';
          } else if (path.includes('/stories')) {
            priority = 0.8;
            changefreq = 'weekly';
          }

          return {
            url: path,
            lastmod: mdxNode?.frontmatter?.date || new Date().toISOString(),
            changefreq: changefreq,
            priority: priority,
          };
        }
      }
    },
  ],
}
