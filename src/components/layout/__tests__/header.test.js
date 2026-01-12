import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../header';

// Mock GSAP
jest.mock('gsap', () => ({
  gsap: {
    to: jest.fn(),
    fromTo: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('Header Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('dark');
  });

  it('renders site title correctly', () => {
    render(<Header siteTitle="Test Site" />);
    expect(screen.getByText('Dennis J. Carroll')).toBeInTheDocument();
  });

  it('renders logo with initials DJC', () => {
    render(<Header siteTitle="Test Site" />);
    expect(screen.getByText('DJC')).toBeInTheDocument();
  });

  it('renders all theme toggle buttons', () => {
    render(<Header siteTitle="Test Site" />);
    expect(screen.getByLabelText(/Switch to Dark theme/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Switch to Light theme/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Switch to Tokyo theme/i)).toBeInTheDocument();
  });

  it('has accessible GitHub social link', () => {
    render(<Header siteTitle="Test Site" />);
    const githubLink = screen.getByLabelText(/Visit Dennis J\. Carroll's GitHub profile/i);
    expect(githubLink).toHaveAttribute('href', expect.stringContaining('github.com'));
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has accessible LinkedIn social link', () => {
    render(<Header siteTitle="Test Site" />);
    const linkedinLink = screen.getByLabelText(/Connect with Dennis J\. Carroll on LinkedIn/i);
    expect(linkedinLink).toHaveAttribute('href', expect.stringContaining('linkedin.com'));
    expect(linkedinLink).toHaveAttribute('target', '_blank');
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has accessible Twitter social link', () => {
    render(<Header siteTitle="Test Site" />);
    const twitterLink = screen.getByLabelText(/Follow Dennis J\. Carroll on X \(Twitter\)/i);
    expect(twitterLink).toHaveAttribute('href', expect.stringContaining('x.com'));
    expect(twitterLink).toHaveAttribute('target', '_blank');
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders all three themes correctly', () => {
    render(<Header siteTitle="Test Site" />);
    // All three theme buttons should be present
    const darkButton = screen.getByLabelText(/Switch to Dark theme/i);
    const lightButton = screen.getByLabelText(/Switch to Light theme/i);
    const tokyoButton = screen.getByLabelText(/Switch to Tokyo theme/i);

    expect(darkButton).toBeInTheDocument();
    expect(lightButton).toBeInTheDocument();
    expect(tokyoButton).toBeInTheDocument();
  });

  it('initializes GSAP animations on mount', () => {
    const { gsap } = require('gsap');
    render(<Header siteTitle="Test Site" />);
    expect(gsap.fromTo).toHaveBeenCalled();
    expect(gsap.to).toHaveBeenCalled();
  });

  it('header has correct accessibility role', () => {
    const { container } = render(<Header siteTitle="Test Site" />);
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('logo links to homepage', () => {
    render(<Header siteTitle="Test Site" />);
    const logoLink = screen.getByText('Dennis J. Carroll').closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });
});
