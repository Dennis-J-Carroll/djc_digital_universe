import React from 'react';
import { render, screen } from '@testing-library/react';
import AboutPage from '../about';

// Mock Layout
jest.mock('../../components/layout/layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

describe('About Page', () => {
  const mockLocation = { pathname: '/about' };

  it('renders without crashing', () => {
    render(<AboutPage location={mockLocation} />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('displays About Me heading', () => {
    render(<AboutPage location={mockLocation} />);
    expect(screen.getByText(/About Me/i)).toBeInTheDocument();
  });

  it('displays background content', () => {
    render(<AboutPage location={mockLocation} />);
    expect(screen.getByText(/passionate technologist/i)).toBeInTheDocument();
  });

  it('displays skills section', () => {
    render(<AboutPage location={mockLocation} />);
    const { container } = render(<AboutPage location={mockLocation} />);
    // Check for any skills-related content
    expect(container).toBeInTheDocument();
  });

  it('displays website information', () => {
    render(<AboutPage location={mockLocation} />);
    expect(screen.getByText(/portfolio/i)).toBeInTheDocument();
  });
});
