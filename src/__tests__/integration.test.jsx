import { screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { expect, test, vi, beforeEach, afterEach, describe } from 'vitest';
import { renderApp, setupFetchMock } from './test-utils';

describe('4. Asynchronous Data Fetching & API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.setAttribute('data-theme', 'light');
  });

  afterEach(() => {
    cleanup();
  });

  test('should trigger AI analysis and display results on successful response', async () => {
    // Arrange
    setupFetchMock();
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
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText(/A small feline/i)).toBeInTheDocument(); 
      expect(screen.getByText(/Cute/i)).toBeInTheDocument(); 
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });



  test('should display generic server error when server responds with 500 status', async () => {
    // Arrange
    setupFetchMock({
      ok: false,
      status: 500,
      errorPayload: { error: 'The AI engine encountered an internal error.' }
    });
    renderApp();
    
    const inputA = screen.getByPlaceholderText(/Option A/i);
    const inputB = screen.getByPlaceholderText(/Option B/i);
    const analyzeButton = screen.getAllByRole('button', { name: /Pros & Cons/i })[0];
    
    // Act
    fireEvent.change(inputA, { target: { value: 'Option 1' } });
    fireEvent.change(inputB, { target: { value: 'Option 2' } });

    // Wait for auth to resolve
    await new Promise(r => setTimeout(r, 50));

    fireEvent.click(analyzeButton);

    // Assert
    const errorMessage = await screen.findByText(/The AI engine encountered an internal error./i);
    expect(errorMessage).toBeInTheDocument();
  });
});
