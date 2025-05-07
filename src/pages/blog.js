import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout/layout"
import Seo from "../components/shared/seo"

const BlogPage = ({ data, location }) => {
  const posts = data.allMdx.nodes

  return (
    <Layout location={location}>
      <div className="blog-container">
        <h1>Blog</h1>
        <p>Thoughts, tutorials, and insights on technology, data science, and more.</p>
        
        <div className="blog-posts-grid">
          {posts.map(post => (
            <div key={post.id} className="blog-post-card">
              <h2>{post.frontmatter.title}</h2>
              <p className="date">{post.frontmatter.date}</p>
              <p>{post.excerpt}</p>
              <div className="tech-tags">
                {post.frontmatter.tech_stack && 
                  post.frontmatter.tech_stack.map((tech, i) => (
                    <span key={i} className="tech-tag">{tech}</span>
                  ))
                }
              </div>
              <Link to={`/blog/${post.frontmatter.slug || post.fields.slug}`} className="read-more-link">
                Read More →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export const Head = () => <Seo title="Blog" />

export const query = graphql`
  query {
    allMdx(
      filter: { parent: { internal: { description: { regex: "/blog-posts/" } } } }
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
          slug
          description
        }
      }
    }
  }
`

export default BlogPage
