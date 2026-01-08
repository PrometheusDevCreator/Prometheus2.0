/**
 * Vitest Test Setup
 * Global test configuration and matchers
 */

import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia for components that use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Console error tracking for test validation
const originalError = console.error
console.error = (...args) => {
  // Track React errors for test assertions
  if (args[0]?.includes?.('Warning:') || args[0]?.includes?.('Error:')) {
    window.__CONSOLE_ERRORS__ = window.__CONSOLE_ERRORS__ || []
    window.__CONSOLE_ERRORS__.push(args.join(' '))
  }
  originalError.apply(console, args)
}
