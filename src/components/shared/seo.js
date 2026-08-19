import React from "react"
import { useStaticQuery, graphql } from "gatsby"

/**
 * SEO component — renders directly into Gatsby's per-page Head export.
 * Must NOT use react-helmet: Head renders each page in isolation via
 * renderToStaticMarkup, so Helmet's side-effect singleton races across
 * pages built concurrently and stamps the wrong page's tags onto the HTML.
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {Object} props.meta - Additional meta tags
 * @param {string} props.pathname - The current page's pathname
 * @param {string} props.pageType - Type of page ('blog', 'project', etc.)
 * @param {Object} props.pageData - Additional data for structured data
 */
const Seo = ({ description, meta, title, pathname, pageType, pageData }) => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            author
            siteUrl
          }
        }
      }
    `
  )

  const metaDescription = description || site.siteMetadata.description
  const defaultTitle = site.siteMetadata?.title
  const composedTitle = defaultTitle ? `${title} | ${defaultTitle}` : title
  const canonicalUrl = `${site.siteMetadata.siteUrl}${pathname || '/'}`;
  const ogImage = pageData?.image
    ? `${site.siteMetadata.siteUrl}${pageData.image}`
    : `${site.siteMetadata.siteUrl}/og-images/og-default.png`;

  // Generate structured data based on page type
  const generateStructuredData = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.siteMetadata.title,
      url: site.siteMetadata.siteUrl,
      author: {
        '@type': 'Person',
        name: 'Dennis J. Carroll',
        url: site.siteMetadata.siteUrl,
        sameAs: [
          'https://github.com/Dennis-J-Carroll',
          'https://www.linkedin.com/in/dennisjcarroll/',
          'https://x.com/denniscarrollj'
        ],
        jobTitle: 'Data Scientist & Developer',
        description: 'Full-stack developer and data scientist specializing in AI, web development, and creative problem-solving'
      }
    };

    // Return different schemas based on page type
    switch(pageType) {
      case 'blog':
      case 'story':
        return {
          ...baseSchema,
          '@type': 'BlogPosting',
          headline: pageData?.title || title,
          datePublished: pageData?.date,
          dateModified: pageData?.modified || pageData?.date,
          author: baseSchema.author,
          description: metaDescription,
          url: canonicalUrl,
          image: ogImage,
          publisher: {
            '@type': 'Person',
            name: 'Dennis J. Carroll',
            url: site.siteMetadata.siteUrl
          }
        };

      case 'project':
        return {
          ...baseSchema,
          '@type': 'SoftwareApplication',
          name: pageData?.title || title,
          description: metaDescription,
          author: baseSchema.author,
          applicationCategory: 'DeveloperApplication',
          url: canonicalUrl,
          screenshot: ogImage,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          }
        };

      case 'profile':
      case 'about':
        return {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Dennis J. Carroll',
          alternateName: 'Dennis Carroll',
          url: site.siteMetadata.siteUrl,
          image: ogImage,
          sameAs: [
            'https://github.com/Dennis-J-Carroll',
            'https://www.linkedin.com/in/dennisjcarroll/',
            'https://x.com/denniscarrollj'
          ],
          jobTitle: 'Data Scientist & Machine Learning Engineer',
          description: metaDescription,
          knowsAbout: [
            'Data Science',
            'Machine Learning',
            'Deep Learning',
            'Bayesian Inference',
            'Mechanistic Interpretability',
            'TensorFlow',
            'PyTorch',
            'Python',
            'JavaScript',
            'React',
            'Gatsby',
            'Interactive Data Visualization',
            'Neural Networks',
            'Statistical Modeling',
            'Reinforcement Learning',
            'Graph Neural Networks'
          ],
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': site.siteMetadata.siteUrl
          }
        };

      case 'website':
      default:
        // Homepage: WebSite + Person as array for dual-schema coverage
        return [
          baseSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'Dennis J. Carroll',
            alternateName: 'Dennis Carroll',
            url: site.siteMetadata.siteUrl,
            image: ogImage,
            sameAs: [
              'https://github.com/Dennis-J-Carroll',
              'https://www.linkedin.com/in/dennisjcarroll/',
              'https://x.com/denniscarrollj'
            ],
            jobTitle: 'Data Scientist & Machine Learning Engineer',
            description: metaDescription,
            knowsAbout: [
              'Data Science', 'Machine Learning', 'Deep Learning',
              'Bayesian Inference', 'Mechanistic Interpretability',
              'TensorFlow', 'PyTorch', 'Python', 'React', 'Gatsby',
              'Interactive Data Visualization'
            ]
          }
        ];
    }
  };

  const metaTags = [
    { name: `description`, content: metaDescription },
    { property: `og:title`, content: composedTitle },
    { property: `og:description`, content: metaDescription },
    { property: `og:type`, content: pageType === 'blog' || pageType === 'story' ? 'article' : 'website' },
    { property: `og:url`, content: canonicalUrl },
    { property: `og:image`, content: ogImage },
    { property: `og:image:width`, content: `1200` },
    { property: `og:image:height`, content: `630` },
    { property: `og:image:alt`, content: metaDescription },
    { property: `og:locale`, content: `en_US` },
    { name: `twitter:card`, content: pageData?.image ? `summary_large_image` : `summary` },
    { name: `twitter:creator`, content: `@denniscarrollj` },
    { name: `twitter:site`, content: `@denniscarrollj` },
    { name: `twitter:title`, content: composedTitle },
    { name: `twitter:description`, content: metaDescription },
    { name: `twitter:image`, content: ogImage },
    { name: `twitter:image:alt`, content: metaDescription },
    {
      name: `keywords`,
      content: `Dennis Carroll, Dennis J. Carroll, data scientist, machine learning engineer, Python, TensorFlow, PyTorch, Bayesian inference, deep learning, mechanistic interpretability, interactive visualization, React, Gatsby, portfolio`,
    },
  ].concat(meta)

  return (
    <>
      <title>{composedTitle}</title>
      {metaTags.map((m, i) => (
        <meta key={m.name || m.property || i} {...m} />
      ))}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <script type="application/ld+json">
        {JSON.stringify(generateStructuredData())}
      </script>
    </>
  )
}

Seo.defaultProps = {
  meta: [],
  description: ``,
  pathname: ``,
  pageType: ``,
  pageData: null,
}

export default Seo
