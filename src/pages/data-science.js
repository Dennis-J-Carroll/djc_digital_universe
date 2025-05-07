import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout/layout"
import Seo from "../components/shared/seo"

const DataSciencePage = ({ data }) => {
  const projects = data.allMdx.nodes

  return (
    <Layout>
      <div className="data-science-container">
        <h1>Data Science Projects</h1>
        <p>Explore my data science projects and experiments.</p>
        
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <h2>{project.frontmatter.title}</h2>
              <p>{project.excerpt}</p>
              <div className="tech-tags">
                {project.frontmatter.tech_stack && 
                  project.frontmatter.tech_stack.map((tech, i) => (
                    <span key={i} className="tech-tag">{tech}</span>
                  ))
                }
              </div>
              <Link to={`/data-science/${project.frontmatter.slug || project.fields.slug}`} className="read-more-link">
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

export const query = graphql`
  query {
    allMdx(
      filter: { parent: { internal: { description: { regex: "/data-science-projects/" } } } }
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
          tech_stack
          complexity_level
          slug
        }
      }
    }
  }
`

export default DataSciencePage
