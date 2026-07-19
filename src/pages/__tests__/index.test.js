import React from "react"
import { render, screen } from "@testing-library/react"
import IndexPage from "../index"

// Mock framer-motion — cover all motion.* elements via Proxy
jest.mock("framer-motion", () => {
  const React = require('react');
  const passthrough = ({ children, initial, animate, whileInView, transition, variants, viewport, exit, layoutId, ...props }) =>
    React.createElement('div', props, children);
  return {
    motion: new Proxy({}, { get: () => passthrough }),
  };
});

// Mock Layout component
jest.mock("../../components/layout/layout", () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

// Mock SpaceBackground component
jest.mock("../../components/shared/space-background", () => {
  return function SpaceBackground() {
    return <div data-testid="space-background" />
  }
})

// Mock InteractiveCube component
jest.mock("../../components/shared/interactive-cube", () => {
  return function InteractiveCube() {
    return <div data-testid="interactive-cube" />
  }
})

// Mock HeroText component
jest.mock("../../components/shared/hero-text", () => {
  return function HeroText({ title, description }) {
    return (
      <div data-testid="hero-text">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    )
  }
})

// Mock FeatureCard component
jest.mock("../../components/shared/feature-card", () => {
  return function FeatureCard({ title, description }) {
    return (
      <div data-testid="feature-card">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    )
  }
})

describe("IndexPage", () => {
  const mockLocation = { pathname: "/" }

  it("renders without crashing", () => {
    render(<IndexPage location={mockLocation} />)
    expect(screen.getByTestId("layout")).toBeInTheDocument()
  })

  it("displays the hero section", () => {
    render(<IndexPage location={mockLocation} />)
    expect(screen.getByTestId("hero-text")).toBeInTheDocument()
    expect(screen.getByText(/Exploring Data Science/i)).toBeInTheDocument()
  })

  it("displays featured work cards", () => {
    render(<IndexPage location={mockLocation} />)
    const featureCards = screen.getAllByTestId("feature-card")
    expect(featureCards.length).toBeGreaterThan(0)
  })

  it("displays Hypersphere Explorer card", () => {
    render(<IndexPage location={mockLocation} />)
    expect(screen.getByText("Hypersphere Explorer")).toBeInTheDocument()
  })

  it("displays Chroma Echo card", () => {
    render(<IndexPage location={mockLocation} />)
    expect(screen.getByText("Chroma Echo")).toBeInTheDocument()
  })

  it("displays Mech Interp Viz card", () => {
    render(<IndexPage location={mockLocation} />)
    expect(screen.getByText("Mech Interp Viz")).toBeInTheDocument()
  })

  it("has Apps & Projects CTA link", () => {
    render(<IndexPage location={mockLocation} />)
    const appsLink = screen.getByRole("link", { name: /Apps & Projects/i })
    expect(appsLink).toHaveAttribute("href", "/apps")
  })

  it("has About Me CTA link", () => {
    render(<IndexPage location={mockLocation} />)
    const aboutLink = screen.getByRole("link", { name: /About Me/i })
    expect(aboutLink).toHaveAttribute("href", "/about")
  })

  it("does not display Data Science card", () => {
    render(<IndexPage location={mockLocation} />)
    expect(screen.queryByText("Data Science")).not.toBeInTheDocument()
  })
})
