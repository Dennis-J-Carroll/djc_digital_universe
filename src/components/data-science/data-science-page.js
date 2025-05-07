import React from "react"
import { useStaticQuery, graphql, Link } from "gatsby"
import Layout from "../layout/layout"
import Seo from "../shared/seo"

const DataSciencePage = ({ location }) => {
  // Use Static Query instead of page query for components
  const data = useStaticQuery(graphql`
    query {
      allMdx(
        filter: { frontmatter: { category: { eq: "data-science" }, published: { ne: false } } }
        sort: { frontmatter: { date: DESC } }
      ) {
        edges {
          node {
            id
            excerpt(pruneLength: 120)
            frontmatter {
              title
              date(formatString: "MMMM DD, YYYY")
              description
              tech_stack
              complexity_level
              status
              slug
            }
            fields {
              slug
            }
          }
        }
      }
    }
  `)

  // Get projects from GraphQL query
  const projects = data.allMdx.edges

  return (
    <Layout location={location}>
      <div className="preview-container" style={{ display: 'block' }}>
        <h2>Data Science</h2>
        <p>Exploring patterns and insights in data using machine learning, statistics, and visualization.</p>
        
        <div className="projects-grid">
          {projects.map(({ node }) => (
            <div key={node.id} className="project-card">
              <h3>{node.frontmatter.title}</h3>
              <p>{node.frontmatter.description || "No description available"}</p>
              {node.frontmatter.tech_stack && (
                <div className="tech-tags">
                  {node.frontmatter.tech_stack.map((tech, i) => (
                    <span key={i} className="tech-tag">{tech}</span>
                  ))}
                </div>
              )}
              {node.frontmatter.status && (
                <div className="project-status">
                  <span className={`status-badge ${node.frontmatter.status.toLowerCase()}`}>
                    {node.frontmatter.status}
                  </span>
                </div>
              )}
              <Link to={`/data-science/${node.frontmatter.slug || node.fields.slug}`} className="read-more-link">
                View Project →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export const Head = () => <Seo title="Data Science Projects" />

export default DataSciencePage
