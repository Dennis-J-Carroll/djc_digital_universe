import React from 'react';
import { render } from '@testing-library/react';
import ConvergencePage, { Head } from '../convergence';

jest.mock('../../components/shared/seo', () => {
  return function Seo({ title, description }) {
    return <meta data-testid="seo" data-title={title} data-description={description} />;
  };
});

describe('ConvergencePage', () => {
  it('renders a full-viewport iframe pointing to the game file', () => {
    const { container } = render(<ConvergencePage />);
    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe.getAttribute('src')).toBe('/convergence-app.html');
    expect(iframe.style.width).toBe('100%');
    expect(iframe.style.height).toBe('100vh');
    expect(iframe.style.borderWidth).toBe('0px');
  });

  it('renders nothing else — no nav, no footer, no wrapper divs', () => {
    const { container } = render(<ConvergencePage />);
    // Only one child: the iframe
    expect(container.children).toHaveLength(1);
    expect(container.firstChild.tagName).toBe('IFRAME');
  });

  it('iframe has an accessible title attribute', () => {
    const { container } = render(<ConvergencePage />);
    const iframe = container.querySelector('iframe');
    expect(iframe.getAttribute('title')).toBeTruthy();
  });
});
