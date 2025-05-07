import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout/layout"
import Seo from "../components/shared/seo"

const ProjectDetailTemplate = ({ data, children, pageContext }) => {
  const { mdx } = data
  const { frontmatter, fields } = mdx
  
  return (
    <Layout>
      <div className="project-detail-container">
        <h1>{frontmatter.title}</h1>
        <p className="date">{frontmatter.date}</p>
        
        {frontmatter.description && (
          <p className="description">{frontmatter.description}</p>
        )}
        
        {frontmatter.tech_stack && (
          <div className="tech-stack">
            <h3>Technologies Used:</h3>
            <ul className="tech-list">
              {frontmatter.tech_stack.map((tech, index) => (
                <li key={index} className="tech-item">{tech}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="content">
          {children}
        </div>
      </div>
    </Layout>
  )
}

export const Head = ({ data, location, pageContext }) => {
  const { mdx } = data
  const { contentType } = pageContext
  
  // Determine page type based on contentType
  let pageType = "project"; // Default
  if (contentType === "blog-posts") {
    pageType = "blog";
  } else if (contentType === "stories") {
    pageType = "article";
  }
  
  return (
    <Seo 
      title={mdx.frontmatter.title}
      description={mdx.frontmatter.description}
      pathname={location.pathname}
      pageType={pageType}
      pageData={{
        title: mdx.frontmatter.title,
        description: mdx.frontmatter.description,
        date: mdx.frontmatter.date,
        tech_stack: mdx.frontmatter.tech_stack,
        complexity_level: mdx.frontmatter.complexity_level,
        author: mdx.frontmatter.author,
        // Add image if available in the future
        // image: mdx.frontmatter.featuredImage?.childImageSharp?.gatsbyImageData?.images?.fallback?.src
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
        slug
        tech_stack
        complexity_level
        interactive_demo
        description
        author
      }
      fields {
        slug
      }
    }
  }
`

export default ProjectDetailTemplate
