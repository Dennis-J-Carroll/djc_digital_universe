import React from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../../components/layout/layout'
import Seo from '../../components/shared/seo'
import { motion } from 'framer-motion'

// ── Icons ─────────────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

// ── Data ──────────────────────────────────────────────────────────────────────

const trilogyMeta = {
  title: "The Frequency Prior Series",
  description: "A paper series on how GPT-2 Small encodes, amplifies, and yields to training-frequency priors — and what that reveals about the limits of mechanistic intervention, from attention heads down to SAE features.",
  model: "GPT-2 Small (124M parameters)",
  platform: "TransformerLens — all results from real-model inference",
}

const tools = [
  {
    title: "The Frequency Prior Explorer",
    path: "/apps/frequency-prior-explorer/",
    description: "Interactive companion app for the whole series. Walk the Resolution Ladder — heads → directions → SAE features — run simulated causal interventions on real measured data, trace logit-lens trajectories per country, and browse every verified Paper 5 finding with plain-language explainers.",
    tags: ["React", "Recharts", "SAE Features", "Interactive", "No-install"],
    featured: true,
  },
  {
    title: "Attn Flow",
    path: "/apps/attn_flow_web.html",
    description: "Browser-native attention flow visualizer ported from a C terminal tool. Watch probability mass move through GPT-2's residual stream in real time — particle simulation showing token competition at each layer, color-coded by token identity.",
    tags: ["Canvas 2D", "GPT-2", "Visualization", "No-install"],
  },
]

// ── Animation variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

// ── Component ─────────────────────────────────────────────────────────────────

const ResearchPage = ({ data, location }) => {
  const papers = (data?.allMdx?.nodes ?? [])
    .map((node) => ({
      id: node.id,
      number: node.frontmatter.seriesNumber,
      title: node.frontmatter.cardTitle || node.frontmatter.title,
      slug: `/research${node.fields.slug}`,
      status: node.frontmatter.status || "live",
      tagline: node.frontmatter.tagline,
      description: node.frontmatter.cardDescription || node.frontmatter.description,
      highlights: node.frontmatter.highlights || [],
      tags: node.frontmatter.tags || [],
    }));

  return (
    <Layout location={location}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '7rem 1.5rem 5rem' }}>

        {/* Page header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.7 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--primary-color)',
            opacity: 0.75,
            marginBottom: '0.75rem',
          }}>
            Research
          </p>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: '700',
            lineHeight: '1.15',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            marginBottom: '1.25rem',
          }}>
            {trilogyMeta.title}
          </h1>
          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary, rgba(255,255,255,0.7))',
            lineHeight: '1.7',
            maxWidth: '680px',
            marginBottom: '1rem',
          }}>
            {trilogyMeta.description}
          </p>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #888)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span>Model: {trilogyMeta.model}</span>
            <span>Platform: {trilogyMeta.platform}</span>
          </div>
        </motion.div>

        {/* Paper cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '4rem' }}
        >
          {papers.map((paper) => {
            const isLive = paper.status === 'live'
            const card = (
              <motion.div
                key={paper.id}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                style={{
                  background: 'var(--card-bg)',
                  border: isLive
                    ? '1px solid rgba(0, 201, 177, 0.25)'
                    : '1px solid rgba(120, 180, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '1.75rem 2rem',
                  position: 'relative',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  cursor: isLive ? 'pointer' : 'default',
                  opacity: isLive ? 1 : 0.75,
                }}
                onMouseEnter={isLive ? (e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 201, 177, 0.5)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 201, 177, 0.08)'
                } : undefined}
                onMouseLeave={isLive ? (e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 201, 177, 0.25)'
                  e.currentTarget.style.boxShadow = 'none'
                } : undefined}
              >
                {/* Paper number + status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted, #888)',
                  }}>
                    Paper {paper.number}
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.72rem',
                    fontWeight: '600',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    background: isLive
                      ? 'rgba(0, 201, 177, 0.12)'
                      : 'rgba(120, 180, 255, 0.08)',
                    color: isLive
                      ? 'var(--primary-color)'
                      : 'var(--text-secondary, #aaa)',
                    border: isLive
                      ? '1px solid rgba(0, 201, 177, 0.25)'
                      : '1px solid rgba(120, 180, 255, 0.15)',
                  }}>
                    {isLive ? <CheckIcon /> : <ClockIcon />}
                    {isLive ? 'Live' : 'Coming Soon'}
                  </span>
                </div>

                {/* Title + tagline */}
                <h2 style={{
                  fontSize: '1.35rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem',
                  lineHeight: '1.25',
                  letterSpacing: '-0.01em',
                }}>
                  {paper.title}
                </h2>
                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--primary-color)',
                  opacity: 0.8,
                  marginBottom: '0.85rem',
                  fontStyle: 'italic',
                }}>
                  {paper.tagline}
                </p>

                {/* Description */}
                <p style={{
                  fontSize: '0.93rem',
                  color: 'var(--text-secondary, rgba(255,255,255,0.75))',
                  lineHeight: '1.65',
                  marginBottom: '1.1rem',
                }}>
                  {paper.description}
                </p>

                {/* Highlights */}
                <ul style={{
                  margin: '0 0 1.1rem 0',
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}>
                  {paper.highlights.map((h, i) => (
                    <li key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.6rem',
                      fontSize: '0.83rem',
                      color: 'var(--text-secondary, rgba(255,255,255,0.65))',
                      lineHeight: '1.5',
                    }}>
                      <span style={{ color: 'var(--primary-color)', marginTop: '2px', flexShrink: 0 }}>›</span>
                      {h}
                    </li>
                  ))}
                </ul>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: isLive ? '1.25rem' : 0 }}>
                  {paper.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: '0.72rem',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '4px',
                      background: 'rgba(120, 180, 255, 0.07)',
                      color: 'var(--text-secondary, #aaa)',
                      border: '1px solid rgba(120, 180, 255, 0.13)',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                {isLive && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    color: 'var(--primary-color)',
                  }}>
                    Read paper →
                  </div>
                )}
              </motion.div>
            )

            return isLive ? (
              <Link key={paper.id} to={paper.slug} style={{ textDecoration: 'none', display: 'block' }}>
                {card}
              </Link>
            ) : (
              <div key={paper.id}>{card}</div>
            )
          })}
        </motion.div>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid rgba(120, 180, 255, 0.1)', marginBottom: '3rem' }} />

        {/* Companion tool */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
        >
          <p style={{
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-muted, #888)',
            marginBottom: '1rem',
          }}>
            Companion Tools
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {tools.map((tool) => (
              <a
                key={tool.title}
                href={tool.path}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  style={{
                    background: 'var(--card-bg)',
                    border: tool.featured
                      ? '1px solid rgba(0, 201, 177, 0.3)'
                      : '1px solid rgba(120, 180, 255, 0.15)',
                    borderRadius: '12px',
                    padding: '1.5rem 2rem',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = tool.featured
                      ? 'rgba(0, 201, 177, 0.55)'
                      : 'rgba(120, 180, 255, 0.35)'
                    e.currentTarget.style.boxShadow = tool.featured
                      ? '0 6px 24px rgba(0, 201, 177, 0.1)'
                      : '0 6px 24px rgba(120, 180, 255, 0.07)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = tool.featured
                      ? 'rgba(0, 201, 177, 0.3)'
                      : 'rgba(120, 180, 255, 0.15)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                    }}>
                      {tool.title}
                      {tool.featured && (
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: '600',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(0, 201, 177, 0.12)',
                          color: 'var(--primary-color)',
                          border: '1px solid rgba(0, 201, 177, 0.25)',
                        }}>
                          New
                        </span>
                      )}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.83rem', color: 'var(--text-secondary, #aaa)' }}>
                      Open app <ExternalLinkIcon />
                    </div>
                  </div>
                  <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary, rgba(255,255,255,0.7))',
                    lineHeight: '1.6',
                    marginBottom: '0.85rem',
                  }}>
                    {tool.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {tool.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: '0.72rem',
                        padding: '0.15rem 0.55rem',
                        borderRadius: '4px',
                        background: 'rgba(120, 180, 255, 0.07)',
                        color: 'var(--text-secondary, #aaa)',
                        border: '1px solid rgba(120, 180, 255, 0.13)',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Code note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            marginTop: '2.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted, #666)',
            lineHeight: '1.6',
          }}
        >
          All experiments run on GPT-2 Small via TransformerLens. Code in{' '}
          <code style={{ fontSize: '0.78rem', background: 'rgba(120,180,255,0.08)', border: '1px solid rgba(120,180,255,0.15)', borderRadius: '3px', padding: '0.1em 0.35em', color: 'var(--primary-color)' }}>
            new_experiments/
          </code>{' '}
          — steering scripts, logit lens tools, battery runner, and scale sweep utilities.
        </motion.p>

      </div>
    </Layout>
  )
}

export const Head = ({ location }) => (
  <Seo
    title="Research"
    pathname={location.pathname}
    pageType="collection"
    description="The Frequency Prior Series — mechanistic interpretability papers on how GPT-2 Small encodes and amplifies training-frequency priors, from attention heads down to SAE features, with an interactive explorer app."
  />
)

export const query = graphql`
  query {
    allMdx(
      filter: { internal: { contentFilePath: { regex: "/src/research/" } } }
      sort: { frontmatter: { order: ASC } }
    ) {
      nodes {
        id
        fields {
          slug
        }
        frontmatter {
          cardTitle
          title
          tagline
          cardDescription
          description
          status
          seriesNumber
          tags
          highlights
        }
      }
    }
  }
`

export default ResearchPage
