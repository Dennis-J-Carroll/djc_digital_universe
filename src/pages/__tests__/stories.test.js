import React from 'react';
import { render, screen } from '@testing-library/react';
import StoriesPage from '../stories';

// Mock Layout
jest.mock('../../components/layout/layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

describe('Stories Page', () => {
  const mockLocation = { pathname: '/stories' };
  const mockData = {
    allMdx: {
      nodes: [
        {
          id: '1',
          excerpt: 'Test story excerpt...',
          fields: { slug: 'test-story' },
          frontmatter: {
            title: 'Test Story Title',
            date: 'January 01, 2024',
            slug: 'test-story',
            description: 'Test description',
          },
        },
      ],
    },
  };

  it('renders without crashing', () => {
    render(<StoriesPage data={mockData} location={mockLocation} />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('displays Creative Writing heading', () => {
    render(<StoriesPage data={mockData} location={mockLocation} />);
    expect(screen.getByText(/Creative Writing/i)).toBeInTheDocument();
  });

  it('renders story cards when stories exist', () => {
    render(<StoriesPage data={mockData} location={mockLocation} />);
    expect(screen.getByText('Test Story Title')).toBeInTheDocument();
    expect(screen.getByText(/Test story excerpt/i)).toBeInTheDocument();
  });

  it('displays story date', () => {
    render(<StoriesPage data={mockData} location={mockLocation} />);
    expect(screen.getByText('January 01, 2024')).toBeInTheDocument();
  });

  it('has Read Story link', () => {
    render(<StoriesPage data={mockData} location={mockLocation} />);
    expect(screen.getByText(/Read Story/i)).toBeInTheDocument();
  });
});
