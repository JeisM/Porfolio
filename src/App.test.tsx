import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('App', () => {
  const stored = new Map<string, string>();
  const storage: Storage = {
    get length() { return stored.size; },
    clear: () => stored.clear(),
    getItem: (key) => stored.get(key) ?? null,
    key: (index) => [...stored.keys()][index] ?? null,
    removeItem: (key) => stored.delete(key),
    setItem: (key, value) => { stored.set(key, value); },
  };

  beforeEach(() => {
    storage.clear();
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener: vi.fn(), removeListener: vi.fn() });
  });

  it('renders CV-derived portfolio content', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'John Mark Rosales' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Professional Experience' })).toBeInTheDocument();
    expect(screen.getByText('Australian Health Insurance')).toBeInTheDocument();
  });

  it('uses the system preference and persists an explicit theme choice', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addListener: vi.fn(), removeListener: vi.fn() });
    render(<App />);
    expect(document.documentElement).toHaveAttribute('data-color-mode', 'dark');
    const toggle = screen.getAllByRole('button', { name: 'Switch to light mode' })[0];
    fireEvent.click(toggle);
    expect(storage.getItem('portfolio-color-mode')).toBe('light');
    expect(document.documentElement).toHaveAttribute('data-color-mode', 'light');
  });

  it('bounces the main content when a navigation link is clicked', () => {
    const { container } = render(<App />);
    const main = container.querySelector('main.content');
    expect(main).not.toBeNull();

    fireEvent.click(within(container).getByRole('link', { name: 'About' }));
    expect(main).toHaveClass('nav-bounce-a');

    fireEvent.click(within(container).getByRole('link', { name: 'Skills' }));
    expect(main).toHaveClass('nav-bounce-b');
  });
});
