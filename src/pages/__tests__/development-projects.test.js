import React from "react"
import { render, screen } from "@testing-library/react"
import DevelopmentProjects from "../development-projects"

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}))

// Mock Layout component
jest.mock("../../components/layout/layout", () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

describe("DevelopmentProjects", () => {
  const mockLocation = { pathname: "/development-projects" }

  it("renders without crashing", () => {
    render(<DevelopmentProjects location={mockLocation} />)
    expect(screen.getByTestId("layout")).toBeInTheDocument()
  })

  it("displays the page title", () => {
    render(<DevelopmentProjects location={mockLocation} />)
    expect(screen.getByText("Development Projects")).toBeInTheDocument()
  })

  it("displays AI & Machine Learning section", () => {
    render(<DevelopmentProjects location={mockLocation} />)
    expect(screen.getByText("AI & Machine Learning")).toBeInTheDocument()
  })

  it("displays Data Science & Mathematics section", () => {
    render(<DevelopmentProjects location={mockLocation} />)
    expect(screen.getByText("Data Science & Mathematics")).toBeInTheDocument()
  })

  it("displays Web Applications & Tools section", () => {
    render(<DevelopmentProjects location={mockLocation} />)
    expect(screen.getByText("Web Applications & Tools")).toBeInTheDocument()
  })

  it("displays AI projects", () => {
    render(<DevelopmentProjects location={mockLocation} />)
    expect(screen.getByText("Interactive RL Chaos-Error Optimization")).toBeInTheDocument()
    expect(screen.getByText("Neural Network Theory Laboratory")).toBeInTheDocument()
    expect(screen.getByText("Question Analysis Bot")).toBeInTheDocument()
  })

  it("displays Data Science projects", () => {
    render(<DevelopmentProjects location={mockLocation} />)
    expect(screen.getByText("Numerical Attractor Descent Curves")).toBeInTheDocument()
    expect(screen.getByText("SNFT 5-Digit Experimental Framework")).toBeInTheDocument()
    expect(screen.getByText("The Science of Convergence")).toBeInTheDocument()
  })

  it("displays Web Applications", () => {
    render(<DevelopmentProjects location={mockLocation} />)
    expect(screen.getByText("CLI University Interface")).toBeInTheDocument()
    expect(screen.getByText("Flow Writer Tool")).toBeInTheDocument()
    expect(screen.getByText("Sphere Chat Interface")).toBeInTheDocument()
  })

  it("all project links use /apps/ path", () => {
    render(<DevelopmentProjects location={mockLocation} />)
    const projectLinks = screen.getAllByText(/Launch Application/)

    projectLinks.forEach(link => {
      const anchor = link.closest("a")
      expect(anchor).toHaveAttribute("href")
      expect(anchor.getAttribute("href")).toMatch(/^\/apps\//)
    })
  })

  it("displays Technologies & Skills section", () => {
    render(<DevelopmentProjects location={mockLocation} />)
    expect(screen.getByText("Technologies & Skills")).toBeInTheDocument()
    expect(screen.getByText("Frontend")).toBeInTheDocument()
    expect(screen.getByText("Backend & Data Science")).toBeInTheDocument()
    expect(screen.getByText("DevOps & Tools")).toBeInTheDocument()
  })

  it("displays contact CTA", () => {
    render(<DevelopmentProjects location={mockLocation} />)
    expect(screen.getByText("Interested in working together?")).toBeInTheDocument()
    const contactLink = screen.getByRole("link", { name: /Get in Touch/i })
    expect(contactLink).toHaveAttribute("href", "/contact")
  })

  it("project links open in new tab", () => {
    render(<DevelopmentProjects location={mockLocation} />)
    const projectLinks = screen.getAllByText(/Launch Application/)

    projectLinks.forEach(link => {
      const anchor = link.closest("a")
      expect(anchor).toHaveAttribute("target", "_blank")
      expect(anchor).toHaveAttribute("rel", "noopener noreferrer")
    })
  })
})
