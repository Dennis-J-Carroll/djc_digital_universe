import React from 'react';
import { render, screen } from '@testing-library/react';
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

  it('renders theme selector', () => {
    render(<Header siteTitle="Test Site" />);
    const themeSelect = screen.getByLabelText(/Select theme/i);
    expect(themeSelect).toBeInTheDocument();
    expect(themeSelect.tagName).toBe('SELECT');
  });

  it('has accessible GitHub social link', () => {
    render(<Header siteTitle="Test Site" />);
    const githubLink = screen.getAllByLabelText(/^GitHub$/i)[0];
    expect(githubLink).toHaveAttribute('href', expect.stringContaining('github.com'));
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has accessible LinkedIn social link', () => {
    render(<Header siteTitle="Test Site" />);
    const linkedinLink = screen.getAllByLabelText(/^LinkedIn$/i)[0];
    expect(linkedinLink).toHaveAttribute('href', expect.stringContaining('linkedin.com'));
    expect(linkedinLink).toHaveAttribute('target', '_blank');
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has accessible Twitter social link', () => {
    render(<Header siteTitle="Test Site" />);
    const twitterLink = screen.getAllByLabelText(/X \(Twitter\)/i)[0];
    expect(twitterLink).toHaveAttribute('href', expect.stringContaining('x.com'));
    expect(twitterLink).toHaveAttribute('target', '_blank');
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('theme selector has theme options', () => {
    render(<Header siteTitle="Test Site" />);
    const themeSelect = screen.getByLabelText(/Select theme/i);
    const options = themeSelect.querySelectorAll('option');
    expect(options.length).toBeGreaterThan(0);
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
