import React from "react"
import { render, screen } from "@testing-library/react"
import Navigation from "../navigation-component"

// Mock framer-motion with proper prop filtering
jest.mock("framer-motion", () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, whileInView, initial, animate, transition, layoutId, viewport, exit, ...props }, ref) =>
        React.createElement('div', { ref, ...props }, children)
      ),
    },
  };
});

// Mock gsap
jest.mock("gsap", () => ({
  gsap: {
    to: jest.fn(),
  },
}))

// Mock @reach/router — aliased to @gatsbyjs/reach-router by Gatsby's webpack but not by Jest
jest.mock("@reach/router", () => ({
  useLocation: () => ({
    pathname: "/",
  }),
}), { virtual: true })

describe("Navigation Component", () => {
  it("renders without crashing", () => {
    render(<Navigation />)
    expect(screen.getByRole("navigation")).toBeInTheDocument()
  })

  it("displays all navigation links", () => {
    render(<Navigation />)
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Apps & Projects")).toBeInTheDocument()
    expect(screen.getByText("Research")).toBeInTheDocument()
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
    const appsLink = screen.getByRole("link", { name: /Apps & Projects/i })
    const researchLink = screen.getByRole("link", { name: /Research/i })
    const storiesLink = screen.getByRole("link", { name: /Stories & More/i })
    const aboutLink = screen.getByRole("link", { name: /About/i })
    const contactLink = screen.getByRole("link", { name: /Contact/i })

    expect(homeLink).toHaveAttribute("href", "/")
    expect(appsLink).toHaveAttribute("href", "/apps")
    expect(researchLink).toHaveAttribute("href", "/research")
    expect(storiesLink).toHaveAttribute("href", "/stories")
    expect(aboutLink).toHaveAttribute("href", "/about")
    expect(contactLink).toHaveAttribute("href", "/contact")
  })

  it("has exactly 6 navigation items", () => {
    render(<Navigation />)
    const navItems = screen.getAllByRole("listitem")
    expect(navItems).toHaveLength(6)
  })
})
