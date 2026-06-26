import React from 'react';
import { render } from '@testing-library/react';
import { MotionConfig } from 'framer-motion';
import { vi, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);
import App from '../App';

vi.mock('../db/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user', email: 'test@example.com' } } } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    update: vi.fn().mockResolvedValue({ data: null, error: null })
  }
}));

import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

import { AuthProvider } from '../context/AuthContext';

export const renderApp = () => {
  // Disable Framer Motion animations for predictable test execution
  // Set localStorage so Welcome modal doesn't pop up
  window.localStorage.setItem('tiebreaker_welcomed', 'true');
  return render(
    <AuthProvider>
      <MotionConfig transition={{ duration: 0 }}>
        <App />
      </MotionConfig>
    </AuthProvider>
  );
};

export const setupFetchMock = (options = {}) => {
  const {
    ok = true,
    status = 200,
    errorPayload = null,
    mockData = {
      entities: ["Cat", "Dog"],
      analyticalReasoning: "Based on the provided options, the analysis focuses on common characteristics.",
      results: [{
        optionName: "Cat",
        pros: ["Cute"],
        cons: ["Moody"],
        summary: "A small feline",
        comparison: { "Factor": "Value" },
        swot: { strengths: ["Cute"], weaknesses: ["Moody"], opportunities: [], threats: [] }
      }],
      verdict: {
        winner: "Cat",
        recommendation: "Strategic Advantages",
        reasoning: ["Cute"]
      }
    }
  } = options;

  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    headers: { get: () => ok ? 'text/event-stream' : 'application/json' },
    json: async () => errorPayload,
    body: {
      getReader: () => {
        let done = false;
        return {
          read: async () => {
            if (done) return { done: true, value: undefined };
            done = true;
            
            const payload = {
              status: "complete",
              content: JSON.stringify(mockData)
            };
            
            const encoder = new TextEncoder();
            const sseString = `data: ${JSON.stringify(payload)}\n\n`;
            return { done: false, value: encoder.encode(sseString) };
          }
        };
      }
    }
  });
};
