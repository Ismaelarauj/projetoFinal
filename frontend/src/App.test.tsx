import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders navigation links', () => {
  render(<App />);
  const linkElements = screen.getAllByRole('link');
  expect(linkElements.length).toBeGreaterThan(0); // Verifica se há links
});