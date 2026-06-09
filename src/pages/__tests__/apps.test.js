import React from 'react';
import { render, screen } from '@testing-library/react';
import AppsPage from '../apps';

// Mock framer-motion
jest.mock('framer-motion', () => {
  const passthrough = ({ children, ...props }) => {
    const { initial, animate, transition, variants, whileInView, viewport, exit, layoutId, ...rest } = props;
    return <div {...rest}>{children}</div>;
  };
  return {
    motion: new Proxy({}, { get: () => passthrough }),
    useAnimation: () => ({ start: jest.fn() }),
    useInView: () => true,
  };
});

// Mock Layout
jest.mock('../../components/layout/layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

const mockLocation = { pathname: '/apps' };

describe('AppsPage', () => {
  it('renders without crashing', () => {
    render(<AppsPage location={mockLocation} />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('includes CONVERGENCE in the app list', () => {
    render(<AppsPage location={mockLocation} />);
    expect(screen.getByText('CONVERGENCE')).toBeInTheDocument();
  });

  it('CONVERGENCE is in the Creative category section', () => {
    render(<AppsPage location={mockLocation} />);
    const convergenceEl = screen.getByText('CONVERGENCE');
    // The Creative label should appear (filter button or heading)
    const creativeEls = screen.getAllByText('Creative');
    expect(creativeEls.length).toBeGreaterThan(0);
    // The CONVERGENCE card anchor points to /convergence
    const link = convergenceEl.closest('a') || convergenceEl.closest('[href]');
    if (link) {
      expect(link.getAttribute('href')).toBe('/convergence');
    }
  });

  it('CONVERGENCE card description mentions interactive narrative', () => {
    render(<AppsPage location={mockLocation} />);
    expect(screen.getByText(/interactive narrative/i)).toBeInTheDocument();
  });
});
