import React from 'react';
import { render } from '@testing-library/react';
import { useStaticQuery } from 'gatsby';
import Seo from '../seo';

// Mock Gatsby's useStaticQuery and graphql
jest.mock('gatsby', () => ({
  ...jest.requireActual('gatsby'),
  useStaticQuery: jest.fn(),
  graphql: jest.fn(),
}));

// Mock react-helmet
jest.mock('react-helmet', () => {
  const React = require('react');
  return {
    Helmet: ({ children }) => React.createElement('div', { 'data-testid': 'helmet' }, children),
  };
});

describe('SEO Component', () => {
  const mockSiteData = {
    site: {
      siteMetadata: {
        title: 'Test Site',
        description: 'Test description',
        author: '@test',
        siteUrl: 'https://test.com',
      },
    },
  };

  beforeEach(() => {
    useStaticQuery.mockReturnValue(mockSiteData);
    // Suppress console errors from Helmet during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    console.error.mockRestore();
  });

  it('renders without crashing with basic props', () => {
    const { container } = render(<Seo title="Test Page" />);
    expect(container).toBeTruthy();
  });

  it('calls useStaticQuery for site metadata', () => {
    render(<Seo title="Test Page" />);
    expect(useStaticQuery).toHaveBeenCalled();
  });

  it('accepts pageType prop for different schemas', () => {
    const { container } = render(<Seo title="Test" pageType="blog" />);
    expect(container).toBeTruthy();
  });

  it('accepts custom description', () => {
    const { container } = render(<Seo title="Test" description="Custom description" />);
    expect(container).toBeTruthy();
  });

  it('accepts pathname for canonical URL', () => {
    const { container } = render(<Seo title="Test" pathname="/test-page" />);
    expect(container).toBeTruthy();
  });
});
