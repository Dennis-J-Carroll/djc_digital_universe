import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout/layout"
import Seo from "../components/shared/seo"

const StoriesPage = ({ data, location }) => {
  const stories = data.allMdx.nodes

  return (
    <Layout location={location}>
      <div className="stories-container">
        <h1>Creative Writing</h1>
        <p>A collection of short stories, fiction, and creative experiments.</p>
        
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

export const Head = () => <Seo title="Creative Writing" />

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
