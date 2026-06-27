import { screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { expect, test, vi, beforeEach, afterEach, describe } from 'vitest';
import { renderApp, setupFetchMock } from './test-utils';

describe('5. Performance & Caching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.setAttribute('data-theme', 'light');
    setupFetchMock();
  });

  afterEach(() => {
    cleanup();
  });

  test('should utilize cache and not make duplicate API calls for identical requests', async () => {
    // Arrange
    renderApp();
    const inputA = screen.getByPlaceholderText(/Option A/i);
    const inputB = screen.getByPlaceholderText(/Option B/i);
    const analyzeButton = screen.getAllByRole('button', { name: /Pros & Cons/i })[0];
    
    // Act
    fireEvent.change(inputA, { target: { value: 'Cat' } });
    fireEvent.change(inputB, { target: { value: 'Dog' } });

    // Wait for auth to resolve
    await new Promise(r => setTimeout(r, 50));

    fireEvent.click(analyzeButton);
    
    // Wait for first response
    await waitFor(() => {
      expect(screen.getByText(/A small feline/i)).toBeInTheDocument();
    });

    // Act: Second identical request
    fireEvent.click(analyzeButton);
    
    // Assert
    expect(global.fetch).toHaveBeenCalledTimes(1); 
  });
});
