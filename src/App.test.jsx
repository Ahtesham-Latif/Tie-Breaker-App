import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { expect, test, vi, beforeEach, afterEach, describe } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { MotionConfig } from 'framer-motion';
import App from './App';

expect.extend(matchers);

process.env.OPENROUTER_API_KEY = 'test-key';

// 1. MOCK OPENAI
vi.mock('openai', () => {
  return {
    default: class {
      constructor() {
        this.chat = {
          completions: {
            create: vi.fn().mockImplementation(async () => {
              return {
                choices: [{
                  message: {
                    content: JSON.stringify({
                      results: [{
                        optionName: "Cat",
                        pros: ["Cute"],
                        cons: ["Moody"],
                        summary: "A small feline"
                      }]
                    })
                  }
                }]
              };
            }),
          },
        };
      }
    }
  };
});

describe('The Tie Breaker App', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.setAttribute('data-theme', 'light');
  });

  afterEach(() => {
    cleanup();
  });

  const renderApp = () => {
    return render(
      <MotionConfig transition={{ duration: 0 }}>
        <App />
      </MotionConfig>
    );
  };

  test('renders the landing page with the main title', () => {
    renderApp();
    const titles = screen.getAllByText(/TIE/i);
    expect(titles.length).toBeGreaterThan(0);
    expect(screen.getByText(/BREAK THE/i)).toBeInTheDocument();
  });

  test('shows format validation error when missing "and/or"', async () => {
    renderApp();
    const textarea = screen.getByPlaceholderText(/What's the dilemma/i);
    
    // Typing something without 'and' enables the button but fails the regex
    fireEvent.change(textarea, { target: { value: 'JustOneThing' } }); 

    const analyzeButtons = screen.getAllByRole('button', { name: /Pros & Cons/i });
    fireEvent.click(analyzeButtons[0]);

    // Check for the specific regex error message
    const error = await screen.findByText(/Please enter what you want to compare in a clear format/i);
    expect(error).toBeInTheDocument();
  });

  test('allows typing in the decision textarea', () => {
    renderApp();
    const textarea = screen.getByPlaceholderText(/What's the dilemma/i);
    fireEvent.change(textarea, { target: { value: 'Coffee and Tea' } });
    expect(textarea.value).toBe('Coffee and Tea');
  });

  test('can toggle the dark/light theme', () => {
    renderApp();
    const themeBtn = screen.getByTitle(/Toggle Theme/i);
    fireEvent.click(themeBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('can add a new factor/option input', () => {
    renderApp();
    const addButton = screen.getByText(/Add Option/i);
    fireEvent.click(addButton);
    const newInputs = screen.getAllByPlaceholderText(/Option \d/i);
    expect(newInputs.length).toBe(3);
  });

  test('triggers AI analysis when valid input is provided', async () => {
    renderApp();
    const textarea = screen.getByPlaceholderText(/What's the dilemma/i);
    fireEvent.change(textarea, { target: { value: 'Cat and Dog' } });

    const analyzeButtons = screen.getAllByRole('button', { name: /Pros & Cons/i });
    fireEvent.click(analyzeButtons[0]);

    // We look for unique mock text instead of "Cat" which appears in multiple places
    await waitFor(() => {
      expect(screen.getByText(/Strategic Advantages/i)).toBeInTheDocument();
      expect(screen.getByText(/A small feline/i)).toBeInTheDocument(); 
      expect(screen.getByText(/Cute/i)).toBeInTheDocument(); 
    });
  });
});