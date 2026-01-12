import React from "react"
import { render, screen } from "@testing-library/react"
import IndexPage from "../index"

// Mock framer-motion with proper prop filtering
jest.mock("framer-motion", () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, whileInView, initial, animate, transition, viewport, ...props }, ref) =>
        React.createElement('div', { ref, ...props }, children)
      ),
      section: React.forwardRef(({ children, whileInView, initial, animate, transition, viewport, ...props }, ref) =>
        React.createElement('section', { ref, ...props }, children)
      ),
    },
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
    expect(screen.getByText("Welcome to My Digital Universe")).toBeInTheDocument()
  })

  it("displays featured work cards", () => {
    render(<IndexPage location={mockLocation} />)
    const featureCards = screen.getAllByTestId("feature-card")
    expect(featureCards.length).toBeGreaterThan(0)
  })

  it("displays Development Projects card", () => {
    render(<IndexPage location={mockLocation} />)
    const developmentProjects = screen.getAllByText("Development Projects")
    expect(developmentProjects.length).toBeGreaterThan(0)
  })

  it("displays Stories & More card", () => {
    render(<IndexPage location={mockLocation} />)
    const storiesMore = screen.getAllByText("Stories & More")
    expect(storiesMore.length).toBeGreaterThan(0)
  })

  it("displays About Me card", () => {
    render(<IndexPage location={mockLocation} />)
    expect(screen.getByText("About Me")).toBeInTheDocument()
  })

  it("has navigation links to main sections", () => {
    render(<IndexPage location={mockLocation} />)
    const developmentLink = screen.getByRole("link", { name: /Development Projects/i })
    const contactLink = screen.getByRole("link", { name: /Contact Me/i })
    const storiesLink = screen.getByRole("link", { name: /Stories & More/i })

    expect(developmentLink).toHaveAttribute("href", "/development-projects")
    expect(contactLink).toHaveAttribute("href", "/contact")
    expect(storiesLink).toHaveAttribute("href", "/stories")
  })

  it("does not display Data Science card", () => {
    render(<IndexPage location={mockLocation} />)
    expect(screen.queryByText("Data Science")).not.toBeInTheDocument()
  })
})
