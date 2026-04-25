import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout/layout"
import Seo from "../components/shared/seo"

const StoriesPage = ({ data, location }) => {
  const stories = data.allMdx.nodes

  return (
    <Layout location={location}>
      <div className="stories-container px-8 md:px-12">
        <h1>Creative Writing</h1>
        <p>A collection of short stories, fiction, and creative experiments.</p>

        {/* Crack in the Veil — universe hub */}
        <div className="citv-feature-card" style={{
          margin: '2.5rem 0',
          background: 'linear-gradient(135deg, rgba(0,201,177,0.06) 0%, rgba(167,139,250,0.06) 100%)',
          border: '1px solid rgba(0,201,177,0.25)',
          borderRadius: '14px',
          padding: '2rem 2.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, #00c9b1, #67e8f9, #a78bfa)',
          }} />
          <div style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '.25em', color: '#415464', textTransform: 'uppercase', marginBottom: '10px' }}>
            Universe Hub // Featured
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 8px', color: 'inherit' }}>
            Crack in the Veil
          </h2>
          <p style={{ color: '#7d92ab', fontSize: '15px', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '640px' }}>
            In 2038, humanity solved suffering. By 2048, it had forgotten how to survive. Enter the CITV universe — a story of pain, silence, and survival at the edge of the cosmos.
          </p>
          <a
            href="/crack-in-the-veil.html"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 22px', borderRadius: '999px',
              background: 'linear-gradient(135deg, #00c9b1, #67e8f9)',
              color: '#05080f', fontWeight: 700, fontSize: '12px',
              letterSpacing: '.1em', textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Enter the Universe →
          </a>
        </div>

        <div className="stories-grid">
          {stories.map(story => (
            <div key={story.id} className="story-card">
              <h2>{story.frontmatter.title}</h2>
              <p className="date">{story.frontmatter.date}</p>
              <p>{story.excerpt}</p>

              <Link to={`/stories/${story.frontmatter.slug || story.fields.slug}`} className="read-more-link">
                Read Story →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export const Head = ({ location }) => (
  <Seo
    title="Creative Writing"
    pathname={location.pathname}
    pageType="collection"
    description="Explore creative stories and narrative experiments by Dennis J. Carroll."
  />
)

export const query = graphql`
  query {
    allMdx(
      filter: { parent: { internal: { description: { regex: "/stories/" } } } }
      sort: { frontmatter: { date: DESC } }
    ) {
      nodes {
        id
        excerpt(pruneLength: 120)
        fields {
          slug
        }
        frontmatter {
          title
          date(formatString: "MMMM DD, YYYY")
          slug
          description
        }
      }
    }
  }
`

export default StoriesPage
