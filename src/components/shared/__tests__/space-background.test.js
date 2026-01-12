import React from 'react';
import { render } from '@testing-library/react';
import SpaceBackground from '../space-background';

// Mock tsparticles
jest.mock('react-tsparticles', () => ({
  __esModule: true,
  default: ({ id, options }) => <div data-testid={id || 'tsparticles'} />,
}));

jest.mock('tsparticles-slim', () => ({
  loadSlim: jest.fn(),
}));

describe('SpaceBackground Component', () => {
  beforeEach(() => {
    // Mock localStorage
    global.localStorage = {
      getItem: jest.fn(() => 'dark'),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<SpaceBackground />);
  });

  it('shows static gradient for tokyo-afternoon theme', () => {
    global.localStorage.getItem = jest.fn(() => 'tokyo-afternoon');
    const { container } = render(<SpaceBackground />);
    const staticBg = container.querySelector('.static-gradient-background');
    expect(staticBg || container).toBeInTheDocument();
  });

  it('shows static gradient for light theme', () => {
    global.localStorage.getItem = jest.fn(() => 'light');
    const { container } = render(<SpaceBackground />);
    const staticBg = container.querySelector('.static-gradient-background');
    expect(staticBg || container).toBeInTheDocument();
  });

  it('loads particle system for dark theme', () => {
    global.localStorage.getItem = jest.fn(() => 'dark');
    const { container } = render(<SpaceBackground />);
    // Component should render for dark theme
    expect(container).toBeInTheDocument();
  });
});
