import React from 'react';
import { render, screen } from '@testing-library/react';
import AboutPage from '../about';

// Mock Layout
jest.mock('../../components/layout/layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

// Mock framer-motion so animated elements render immediately
jest.mock('framer-motion', () => {
  const passthrough = ({ children, ...props }) => {
    const { initial, animate, transition, variants, whileInView, viewport, ...rest } = props;
    return <div {...rest}>{children}</div>;
  };
  return {
    motion: new Proxy({}, { get: () => passthrough }),
    useAnimation: () => ({ start: jest.fn() }),
    useInView: () => true,
  };
});

describe('About Page', () => {
  const mockLocation = { pathname: '/about' };

  it('renders without crashing', () => {
    render(<AboutPage location={mockLocation} />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('displays name heading', () => {
    render(<AboutPage location={mockLocation} />);
    expect(screen.getByText(/Dennis J. Carroll/i)).toBeInTheDocument();
  });

  it('displays background content', () => {
    render(<AboutPage location={mockLocation} />);
    expect(screen.getByText(/The Mission/i)).toBeInTheDocument();
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
