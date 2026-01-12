import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../footer';

// Mock GSAP
jest.mock('gsap', () => ({
  gsap: {
    to: jest.fn(),
    fromTo: jest.fn(),
  },
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }

  observe() {}

  unobserve() {}

  disconnect() {}
};

describe('Footer Component', () => {
  it('renders footer element', () => {
    const { container } = render(<Footer siteTitle="Test Site" />);
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('renders quick links section', () => {
    const { container } = render(<Footer siteTitle="Test Site" />);
    const links = container.querySelectorAll('a');
    // Footer should have multiple links
    expect(links.length).toBeGreaterThan(0);
  });

  it('renders newsletter form with proper accessibility', () => {
    render(<Footer siteTitle="Test Site" />);
    const form = screen.getByLabelText(/Newsletter subscription/i);
    expect(form).toBeInTheDocument();
  });

  it('newsletter form has accessible email input', () => {
    render(<Footer siteTitle="Test Site" />);
    const emailInput = screen.getByLabelText(/Email address for newsletter updates/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('aria-required', 'true');
  });

  it('newsletter form has accessible submit button', () => {
    render(<Footer siteTitle="Test Site" />);
    const submitButton = screen.getByLabelText(/Subscribe to newsletter/i);
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('displays current year in copyright', () => {
    render(<Footer siteTitle="Test Site" />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
  });

  it('initializes GSAP animations on mount', () => {
    const { gsap } = require('gsap');
    render(<Footer siteTitle="Test Site" />);
    expect(gsap.fromTo).toHaveBeenCalled();
  });
});
