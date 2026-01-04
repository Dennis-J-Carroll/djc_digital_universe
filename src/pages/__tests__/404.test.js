import React from "react"
import { render, screen } from "@testing-library/react"
import NotFoundPage from "../404"

// Mock Layout component
jest.mock("../../components/layout/layout", () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

describe("404 Page", () => {
  const mockLocation = { pathname: "/404" }

  it("renders without crashing", () => {
    render(<NotFoundPage location={mockLocation} />)
    expect(screen.getByTestId("layout")).toBeInTheDocument()
  })

  it("displays 404 error message", () => {
    render(<NotFoundPage location={mockLocation} />)
    expect(screen.getByText(/404: Not Found/i)).toBeInTheDocument()
  })

  it("displays helpful message", () => {
    render(<NotFoundPage location={mockLocation} />)
    expect(screen.getByText(/You just hit a route that doesn't exist/i)).toBeInTheDocument()
  })
})
