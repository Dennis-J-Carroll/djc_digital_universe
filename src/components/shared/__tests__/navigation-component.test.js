import React from "react"
import { render, screen } from "@testing-library/react"
import Navigation from "../navigation-component"

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}))

// Mock gsap
jest.mock("gsap", () => ({
  gsap: {
    to: jest.fn(),
  },
}))

// Mock @reach/router
jest.mock("@reach/router", () => ({
  useLocation: () => ({
    pathname: "/",
  }),
}))

describe("Navigation Component", () => {
  it("renders without crashing", () => {
    render(<Navigation />)
    expect(screen.getByRole("navigation")).toBeInTheDocument()
  })

  it("displays all navigation links", () => {
    render(<Navigation />)
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Development Projects")).toBeInTheDocument()
    expect(screen.getByText("Stories & More")).toBeInTheDocument()
    expect(screen.getByText("About")).toBeInTheDocument()
    expect(screen.getByText("Contact")).toBeInTheDocument()
  })

  it("does not display Data Science link", () => {
    render(<Navigation />)
    expect(screen.queryByText("Data Science")).not.toBeInTheDocument()
  })

  it("has correct href attributes", () => {
    render(<Navigation />)
    const homeLink = screen.getByRole("link", { name: /Home/i })
    const devLink = screen.getByRole("link", { name: /Development Projects/i })
    const storiesLink = screen.getByRole("link", { name: /Stories & More/i })
    const aboutLink = screen.getByRole("link", { name: /About/i })
    const contactLink = screen.getByRole("link", { name: /Contact/i })

    expect(homeLink).toHaveAttribute("href", "/")
    expect(devLink).toHaveAttribute("href", "/development-projects")
    expect(storiesLink).toHaveAttribute("href", "/stories")
    expect(aboutLink).toHaveAttribute("href", "/about")
    expect(contactLink).toHaveAttribute("href", "/contact")
  })

  it("has exactly 5 navigation items", () => {
    render(<Navigation />)
    const navItems = screen.getAllByRole("listitem")
    expect(navItems).toHaveLength(5)
  })
})
