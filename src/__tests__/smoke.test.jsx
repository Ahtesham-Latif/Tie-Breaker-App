import { screen, cleanup } from '@testing-library/react';
import { expect, test, vi, beforeEach, afterEach, describe } from 'vitest';
import { renderApp, setupFetchMock } from './test-utils';

describe('1. Rendering and Initial State (Smoke Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.setAttribute('data-theme', 'light');
    setupFetchMock();
  });

  afterEach(() => {
    cleanup();
  });

  test('should render the landing page with main title and initial UI elements', () => {
    // Arrange
    // Act
    renderApp();
    
    // Assert
    const titles = screen.getAllByText(/TIE/i);
    expect(titles.length).toBeGreaterThan(0);
    expect(screen.getByText(/BREAK THE/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Option A/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Option B/i)).toBeInTheDocument();
    
    // Verify all analysis mode buttons are correctly initialized
    expect(screen.getByRole('button', { name: /Pros & Cons/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Comparison/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SWOT/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /The Verdict/i })).toBeInTheDocument();
  });
});
