import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout/layout"
import Seo from "../components/shared/seo"

const ProjectDevPage = ({ data, location }) => {
  const projects = data.allMdx.nodes

  return (
    <Layout location={location}>
      <div className="project-dev-container">
        <h1>Project Development</h1>
        <p>Explore my development projects and applications across various technologies and platforms.</p>
        
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
              <Link to={`/python-dev/${project.frontmatter.slug || project.fields.slug}`} className="read-more-link">
                View Project →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export const Head = () => <Seo title="Project Development" />

export const query = graphql`
  query {
    allMdx(
      filter: { parent: { internal: { description: { regex: "/python-dev-projects/" } } } }
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

export default ProjectDevPage
