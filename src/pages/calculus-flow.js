import React from "react"
import Layout from "../components/layout/layout"
import Seo from "../components/shared/seo"

export const Head = () => (
  <Seo
    title="Calculus Flow — Interactive Curve Explorer"
    description="Explore Riemann sums, tangent lines, area under curves, the Fundamental Theorem of Calculus, and limits through interactive canvas visualizations."
  />
)

export default function CalculusFlowPage() {
  return (
    <Layout>
      <div
        style={{
          width: "100%",
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          margin: 0,
          overflow: "hidden",
        }}
      >
        <iframe
          src="/apps/calc-flow/index.html"
          title="Calculus Flow — Interactive Curve Explorer"
          style={{
            width: "100%",
            flex: 1,
            border: "none",
            display: "block",
          }}
          allow="fullscreen"
        />
      </div>
    </Layout>
  )
}
