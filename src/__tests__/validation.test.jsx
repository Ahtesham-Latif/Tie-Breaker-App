import { screen, fireEvent, cleanup } from '@testing-library/react';
import { expect, test, vi, beforeEach, afterEach, describe } from 'vitest';
import { renderApp, setupFetchMock } from './test-utils';

describe('3. Validation and Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.setAttribute('data-theme', 'light');
    setupFetchMock();
  });

  afterEach(() => {
    cleanup();
  });

  test('should disable analysis buttons when decision input is empty', () => {
    // Arrange
    renderApp();
    const inputA = screen.getByPlaceholderText(/Option A/i);
    const analyzeButton = screen.getAllByRole('button', { name: /Pros & Cons/i })[0];
    
    // Act
    fireEvent.change(inputA, { target: { value: '   ' } }); 
    
    // Assert
    expect(analyzeButton).toBeDisabled();
  });
});
