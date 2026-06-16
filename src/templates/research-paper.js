import React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout/layout"
import Seo from "../components/shared/seo"

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: "0.3rem" }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const ResearchPaperTemplate = ({ data, children, pageContext }) => {
  const { mdx } = data
  const { frontmatter } = mdx

  const isComingSoon = frontmatter.status === "coming-soon"

  return (
    <Layout>
      <div style={{
        maxWidth: "820px",
        margin: "0 auto",
        padding: "7rem 1.5rem 4rem",
      }}>
        {/* Series breadcrumb */}
        <div style={{
          marginBottom: "2rem",
          fontSize: "0.85rem",
          color: "var(--text-muted, #888)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}>
          <Link to="/research" style={{ color: "var(--primary-color)", textDecoration: "none" }}>
            Research
          </Link>
          <span>›</span>
          <span style={{ color: "var(--primary-color)", opacity: 0.7 }}>
            {frontmatter.series || "The Frequency Prior Trilogy"}
          </span>
          {frontmatter.seriesNumber && (
            <>
              <span>›</span>
              <span>Paper {frontmatter.seriesNumber}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
          fontWeight: "700",
          lineHeight: "1.25",
          marginBottom: "1rem",
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}>
          {frontmatter.title}
        </h1>

        {/* Meta row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2.5rem",
          flexWrap: "wrap",
        }}>
          {frontmatter.date && (
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted, #888)" }}>
              {frontmatter.date}
            </span>
          )}
          {mdx.fields?.timeToRead && (
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted, #888)", display: "inline-flex", alignItems: "center" }}>
              <ClockIcon />{mdx.fields.timeToRead} min read
            </span>
          )}
          {isComingSoon && (
            <span style={{
              fontSize: "0.75rem",
              fontWeight: "600",
              padding: "0.2rem 0.6rem",
              borderRadius: "4px",
              background: "rgba(0, 201, 177, 0.15)",
              color: "var(--primary-color)",
              border: "1px solid rgba(0, 201, 177, 0.3)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}>
              Coming Soon
            </span>
          )}
          {frontmatter.tags && frontmatter.tags.map(tag => (
            <span key={tag} style={{
              fontSize: "0.75rem",
              padding: "0.2rem 0.6rem",
              borderRadius: "4px",
              background: "rgba(120, 180, 255, 0.08)",
              color: "var(--text-secondary, #aaa)",
              border: "1px solid rgba(120, 180, 255, 0.15)",
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* MDX Content */}
        <div className="research-content">
          {children}
        </div>

        {/* Series navigation */}
        <div style={{
          marginTop: "4rem",
          paddingTop: "2rem",
          borderTop: "1px solid rgba(120, 180, 255, 0.12)",
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}>
          {frontmatter.seriesPrev ? (
            <Link
              to={frontmatter.seriesPrev}
              style={{
                color: "var(--primary-color)",
                textDecoration: "none",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              ← Previous paper
            </Link>
          ) : <span />}

          <Link
            to="/research"
            style={{
              color: "var(--text-secondary, #aaa)",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            All research
          </Link>

          {frontmatter.seriesNext ? (
            <Link
              to={frontmatter.seriesNext}
              style={{
                color: "var(--primary-color)",
                textDecoration: "none",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              Next paper →
            </Link>
          ) : <span />}
        </div>
      </div>

      {/* Scoped styles for research content */}
      <style>{`
        .research-content {
          color: var(--text-primary);
          line-height: 1.75;
          font-size: 1rem;
        }

        .research-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 2.5rem 0 1rem;
          color: var(--text-primary);
          padding-bottom: 0.4rem;
          border-bottom: 1px solid rgba(120, 180, 255, 0.12);
          letter-spacing: -0.01em;
        }

        .research-content h3 {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 2rem 0 0.75rem;
          color: var(--primary-color);
        }

        .research-content p {
          margin: 0 0 1.25rem;
          color: var(--text-secondary, rgba(255,255,255,0.8));
        }

        .research-content hr {
          border: none;
          border-top: 1px solid rgba(120, 180, 255, 0.1);
          margin: 2.5rem 0;
        }

        .research-content em {
          color: var(--text-secondary, rgba(255,255,255,0.7));
          font-style: italic;
        }

        .research-content strong {
          color: var(--text-primary);
          font-weight: 600;
        }

        .research-content code {
          font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
          font-size: 0.85em;
          background: rgba(120, 180, 255, 0.08);
          border: 1px solid rgba(120, 180, 255, 0.15);
          border-radius: 4px;
          padding: 0.1em 0.4em;
          color: var(--primary-color);
        }

        .research-content pre {
          background: rgba(10, 14, 24, 0.8);
          border: 1px solid rgba(120, 180, 255, 0.15);
          border-radius: 8px;
          padding: 1.25rem 1.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .research-content pre code {
          background: none;
          border: none;
          padding: 0;
          font-size: 0.875rem;
          color: var(--text-secondary, rgba(255,255,255,0.85));
        }

        .research-content blockquote {
          margin: 1.5rem 0;
          padding: 0.75rem 1.25rem;
          border-left: 3px solid var(--primary-color);
          background: rgba(0, 201, 177, 0.04);
          border-radius: 0 6px 6px 0;
          font-style: italic;
          color: var(--text-secondary, rgba(255,255,255,0.8));
        }

        .research-content ul,
        .research-content ol {
          margin: 0.5rem 0 1.25rem 1.5rem;
          color: var(--text-secondary, rgba(255,255,255,0.8));
        }

        .research-content li {
          margin-bottom: 0.4rem;
        }

        /* Tables */
        .research-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.9rem;
          overflow-x: auto;
          display: block;
        }

        .research-content thead {
          background: rgba(0, 201, 177, 0.08);
        }

        .research-content th {
          padding: 0.65rem 1rem;
          text-align: left;
          font-weight: 600;
          color: var(--primary-color);
          border-bottom: 2px solid rgba(0, 201, 177, 0.25);
          white-space: nowrap;
        }

        .research-content td {
          padding: 0.6rem 1rem;
          border-bottom: 1px solid rgba(120, 180, 255, 0.08);
          color: var(--text-secondary, rgba(255,255,255,0.8));
          vertical-align: top;
        }

        .research-content tr:hover td {
          background: rgba(120, 180, 255, 0.04);
        }

        .research-content tr:last-child td {
          border-bottom: none;
        }

        /* Links */
        .research-content a {
          color: var(--primary-color);
          text-decoration: none;
          border-bottom: 1px solid rgba(0, 201, 177, 0.3);
          transition: border-color 0.2s;
        }

        .research-content a:hover {
          border-bottom-color: var(--primary-color);
        }

        /* Responsive tables */
        @media (max-width: 640px) {
          .research-content table {
            font-size: 0.82rem;
          }
          .research-content th,
          .research-content td {
            padding: 0.5rem 0.6rem;
          }
        }
      `}</style>
    </Layout>
  )
}

export const Head = ({ data, location }) => {
  const { mdx } = data
  return (
    <Seo
      title={mdx.frontmatter.title}
      description={mdx.frontmatter.description}
      pathname={location.pathname}
      pageType="article"
      pageData={{
        title: mdx.frontmatter.title,
        description: mdx.frontmatter.description,
        date: mdx.frontmatter.date,
        author: "Dennis J. Carroll",
      }}
    />
  )
}

export const query = graphql`
  query($id: String!) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
        series
        seriesNumber
        seriesPrev
        seriesNext
        status
        tags
      }
      fields {
        slug
        timeToRead
      }
    }
  }
`

export default ResearchPaperTemplate
