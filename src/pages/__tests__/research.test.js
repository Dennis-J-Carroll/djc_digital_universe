import React from 'react';
import { render, screen } from '@testing-library/react';
import ResearchPage from '../research';

jest.mock('../../components/layout/layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

describe('Research Hub Page', () => {
  const mockLocation = { pathname: '/research' };
  const mockData = {
    allMdx: {
      nodes: [
        {
          id: '1',
          fields: { slug: '/frequency-wins/' },
          frontmatter: {
            cardTitle: 'Frequency Wins',
            title: 'Frequency Wins: long title',
            tagline: 'Diagnosing the lesion',
            cardDescription: 'Card blurb for paper one.',
            description: 'SEO description one.',
            status: 'live',
            seriesNumber: 1,
            tags: ['gpt-2'],
            highlights: ['Highlight one A', 'Highlight one B'],
          },
        },
        {
          id: '2',
          fields: { slug: '/frequency-direction/' },
          frontmatter: {
            cardTitle: 'Frequency in All Directions',
            title: 'Frequency in All Directions',
            tagline: 'Does the mechanism generalize?',
            cardDescription: 'Card blurb for paper three.',
            description: 'SEO description three.',
            status: 'coming-soon',
            seriesNumber: 3,
            tags: ['generalization'],
            highlights: ['Highlight three A'],
          },
        },
      ],
    },
  };

  it('renders without crashing', () => {
    render(<ResearchPage data={mockData} location={mockLocation} />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('shows the series title', () => {
    render(<ResearchPage data={mockData} location={mockLocation} />);
    expect(screen.getByText(/The Frequency Prior Series/i)).toBeInTheDocument();
  });

  it('renders a card per paper using cardTitle', () => {
    render(<ResearchPage data={mockData} location={mockLocation} />);
    expect(screen.getByText('Frequency Wins')).toBeInTheDocument();
    expect(screen.getByText('Frequency in All Directions')).toBeInTheDocument();
  });

  it('renders highlights from frontmatter', () => {
    render(<ResearchPage data={mockData} location={mockLocation} />);
    expect(screen.getByText('Highlight one A')).toBeInTheDocument();
  });

  it('marks the live paper with a Read paper CTA', () => {
    render(<ResearchPage data={mockData} location={mockLocation} />);
    expect(screen.getByText(/Read paper/i)).toBeInTheDocument();
  });
});
