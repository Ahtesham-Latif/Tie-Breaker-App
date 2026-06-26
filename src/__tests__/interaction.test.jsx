import { screen, fireEvent, cleanup } from '@testing-library/react';
import { expect, test, vi, beforeEach, afterEach, describe } from 'vitest';
import { renderApp, setupFetchMock } from './test-utils';

describe('2. User Interactions and State Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.setAttribute('data-theme', 'light');
    setupFetchMock();
  });

  afterEach(() => {
    cleanup();
  });

  test('should update decision input value when user types', () => {
    // Arrange
    renderApp();
    const inputA = screen.getByPlaceholderText(/Option A/i);
    const testInput = 'Coffee';

    // Act
    fireEvent.change(inputA, { target: { value: testInput } });

    // Assert
    expect(inputA.value).toBe(testInput);
  });

  test('should toggle theme between light and dark mode when theme button is clicked', () => {
    // Arrange
    renderApp();
    const themeBtn = screen.getAllByLabelText(/Toggle Theme/i)[0];
    
    // Act
    fireEvent.click(themeBtn);
    
    // Assert
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    
    // Act
    fireEvent.click(themeBtn);
    
    // Assert
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  test('should add a new factor input when "Add Option" is clicked', () => {
    // Arrange
    renderApp();
    const addButton = screen.getByRole('button', { name: /^Add Option$/i });
    
    // Act
    fireEvent.click(addButton);
    
    // Assert
    const factorInputs = screen.getAllByPlaceholderText(/Factor \d/i);
    expect(factorInputs.length).toBe(3);
  });
});
