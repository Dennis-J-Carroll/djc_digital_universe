import React from "react"
import Layout from "../components/layout/layout"
import Seo from "../components/shared/seo"

const AboutPage = ({ location }) => {
  return (
    <Layout location={location}>
      <div className="about-container">
        <h1>About Me</h1>
        
        <section className="about-section">
          <h2>Background</h2>
          <p>
            I'm a passionate technologist with a deep interest in data science, project development,
            and creative expression. My background spans multiple disciplines, allowing me to approach
            problems from unique perspectives and build innovative solutions.
          </p>
          <p>
            With expertise in Python programming and data analysis, I enjoy tackling complex problems
            and turning data into actionable insights. When I'm not coding, you might find me writing
            creative fiction or exploring new technological frontiers.
          </p>
        </section>
        
        <section className="about-section">
          <h2>Skills & Expertise</h2>
          <div className="skills-grid">
            <div className="skill-category">
              <h3>Data Science</h3>
              <ul>
                <li>Data Analysis & Visualization</li>
                <li>Machine Learning Models</li>
                <li>Statistical Analysis</li>
                <li>Python, Pandas, NumPy, TensorFlow</li>
                <li>Jupyter Notebooks</li>
              </ul>
            </div>
            
            <div className="skill-category">
              <h3>Software Development</h3>
              <ul>
                <li>Project Development</li>
                <li>API Development (Flask, FastAPI)</li>
                <li>Web Applications</li>
                <li>Database Design</li>
                <li>Testing & CI/CD</li>
              </ul>
            </div>
            
            <div className="skill-category">
              <h3>Creative</h3>
              <ul>
                <li>Technical Writing</li>
                <li>Creative Fiction</li>
                <li>UI/UX Design Concepts</li>
                <li>Markdown & Documentation</li>
              </ul>
            </div>
          </div>
        </section>
        
        <section className="about-section">
          <h2>This Website</h2>
          <p>
            This website serves as a portfolio of my work in data science and project development,
            as well as a platform for sharing my creative writing. Built with Gatsby and React,
            it showcases both my technical abilities and my creative interests.
          </p>
          <p>
            Feel free to explore the various sections to learn more about my projects, read my
            blog posts, or enjoy my creative writing. If you'd like to get in touch, please
            visit the contact page.
          </p>
        </section>
      </div>
    </Layout>
  )
}

export const Head = () => <Seo title="About Me" />

export default AboutPage
