import React from 'react';
import Seo from '../components/shared/seo';

export default function ConvergencePage() {
  return (
    <iframe
      src="/convergence-app.html"
      style={{ width: '100%', height: '100vh', borderWidth: 0, display: 'block' }}
      title="CONVERGENCE terminal narrative"
    />
  );
}

export const Head = () => (
  <Seo
    title="CONVERGENCE — meridian_term v3.1.4"
    description="An AI has been reading your files. It has questions. Interactive terminal narrative with live mech-interp concepts."
  />
);
