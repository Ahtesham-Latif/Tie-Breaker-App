import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { expect, test, vi, beforeEach, afterEach, describe } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { MotionConfig } from 'framer-motion';
import App from './App';

expect.extend(matchers);


// Mocking fetch globally
global.fetch = vi.fn();

describe('The Tie Breaker App - Production Test Suite', () => {
  beforeEach(() => {
    // Arrange: Reset all mocks and document state before each test
    vi.clearAllMocks();
    document.documentElement.setAttribute('data-theme', 'light');
    
    // Default successful fetch mock for happy paths
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        content: JSON.stringify({
          entities: ["Cat", "Dog"],
          analyticalReasoning: "Based on the provided options, the analysis focuses on common characteristics.",
          results: [{
            optionName: "Cat",
            pros: ["Cute"],
            cons: ["Moody"],
            summary: "A small feline"
          }]
        })
      }),
    });
  });

  afterEach(() => {
    // Cleanup to prevent memory leaks and DOM pollution
    cleanup();
  });

  const renderApp = () => {
    // Disable Framer Motion animations for predictable test execution
    return render(
      <MotionConfig transition={{ duration: 0 }}>
        <App />
      </MotionConfig>
    );
  };

  describe('1. Rendering and Initial State (Smoke Tests)', () => {
    test('should render the landing page with main title and initial UI elements', () => {
      // Arrange
      // (No specific setup needed beyond beforeEach)
      
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

  describe('2. User Interactions and State Management', () => {
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
      const themeBtn = screen.getByTitle(/Toggle Theme/i);
      
      // Act: Toggle to dark mode
      fireEvent.click(themeBtn);
      
      // Assert: Verify dark mode applied
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      
      // Act: Toggle back to light mode
      fireEvent.click(themeBtn);
      
      // Assert: Verify light mode restored
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    test('should add a new factor input when "Add Option" is clicked', () => {
      // Arrange
      renderApp();
      const addButton = screen.getByRole('button', { name: /^Add Option$/i });
      
      // Act
      fireEvent.click(addButton);
      
      // Assert: Verify factor inputs incremented from initial 2 to 3
      const factorInputs = screen.getAllByPlaceholderText(/Factor \d/i);
      expect(factorInputs.length).toBe(3);
    });
  });

  describe('3. Validation and Edge Cases', () => {
    test('should disable analysis buttons when decision input is empty', () => {
      // Arrange
      renderApp();
      const inputA = screen.getByPlaceholderText(/Option A/i);
      const analyzeButton = screen.getAllByRole('button', { name: /Pros & Cons/i })[0];
      
      // Act
      fireEvent.change(inputA, { target: { value: '   ' } }); // Simulate whitespace only
      
      // Assert
      expect(analyzeButton).toBeDisabled();
    });
  });

  describe('4. Asynchronous Data Fetching & API Integration', () => {
    test('should trigger AI analysis and display results on successful response', async () => {
      // Arrange
      renderApp();
      const inputA = screen.getByPlaceholderText(/Option A/i);
      const inputB = screen.getByPlaceholderText(/Option B/i);
      const analyzeButton = screen.getAllByRole('button', { name: /Pros & Cons/i })[0];
      
      // Act
      fireEvent.change(inputA, { target: { value: 'Cat' } });
      fireEvent.change(inputB, { target: { value: 'Dog' } });
      fireEvent.click(analyzeButton);
      
      // Assert
      // We look for unique mock text injected via our global fetch mock
      await waitFor(() => {
        expect(screen.getByText(/Strategic Advantages/i)).toBeInTheDocument();
        expect(screen.getByText(/A small feline/i)).toBeInTheDocument(); 
        expect(screen.getByText(/Cute/i)).toBeInTheDocument(); 
      });
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('should display rate limit error when server responds with 429 status', async () => {
      // Arrange
      renderApp();
      const inputA = screen.getByPlaceholderText(/Option A/i);
      const inputB = screen.getByPlaceholderText(/Option B/i);
      const analyzeButton = screen.getAllByRole('button', { name: /Pros & Cons/i })[0];
      
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: { get: () => 'application/json' },
        json: async () => ({ error: 'Too many requests from this IP, please try again after 15 minutes' }),
      });

      // Act
      fireEvent.change(inputA, { target: { value: 'Option 1' } });
      fireEvent.change(inputB, { target: { value: 'Option 2' } });
      fireEvent.click(analyzeButton);

      // Assert
      const errorTitle = await screen.findByText(/Quota Exceeded/i);
      expect(errorTitle).toBeInTheDocument();
      expect(screen.getByText(/The AI service is currently at its limit/i)).toBeInTheDocument();
    });

    test('should display generic server error when server responds with 500 status', async () => {
      // Arrange
      renderApp();
      const inputA = screen.getByPlaceholderText(/Option A/i);
      const inputB = screen.getByPlaceholderText(/Option B/i);
      const analyzeButton = screen.getAllByRole('button', { name: /Pros & Cons/i })[0];
      
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: { get: () => 'application/json' },
        json: async () => ({ error: 'The AI engine encountered an internal error.' }),
      });

      // Act
      fireEvent.change(inputA, { target: { value: 'Option 1' } });
      fireEvent.change(inputB, { target: { value: 'Option 2' } });
      fireEvent.click(analyzeButton);

      // Assert
      const errorTitle = await screen.findByText(/Connection Error/i);
      expect(errorTitle).toBeInTheDocument();
      expect(screen.getByText(/The AI engine encountered an internal error. \(Status: 500\)/i)).toBeInTheDocument();
    });
  });

  describe('5. Performance & Caching', () => {
    test('should utilize cache and not make duplicate API calls for identical requests', async () => {
      // Arrange
      renderApp();
      const inputA = screen.getByPlaceholderText(/Option A/i);
      const inputB = screen.getByPlaceholderText(/Option B/i);
      const analyzeButton = screen.getAllByRole('button', { name: /Pros & Cons/i })[0];
      
      // Act: First Request
      fireEvent.change(inputA, { target: { value: 'Mac' } });
      fireEvent.change(inputB, { target: { value: 'PC' } });
      fireEvent.click(analyzeButton);
      
      // Wait for first response
      await waitFor(() => {
        expect(screen.getByText(/A small feline/i)).toBeInTheDocument();
      });

      // Act: Second identical request
      // (This should bypass the fetch call and immediately return from LRU cache)
      fireEvent.click(analyzeButton);
      
      // Assert
      expect(global.fetch).toHaveBeenCalledTimes(1); // Fetch called only once despite two clicks
    });
  });
});