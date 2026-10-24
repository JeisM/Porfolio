import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { portfolio, socialProfiles } from './portfolio';

describe('portfolio slideshow', () => {
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
    stored.clear();
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 1366 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, writable: true, value: 768 });
    window.history.replaceState(null, '', '/');
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it('starts with CV Summary and opens the profile through Home', () => {
    const { container } = render(<App />);
    expect(screen.getByRole('heading', { name: 'CV Summary', level: 1 })).toBeInTheDocument();
    expect([...container.querySelectorAll('.arc-navigation a')].map((link) => link.getAttribute('aria-label'))).toEqual(['Summary', 'Home', 'About', 'Skills', 'Experience', 'Education', 'Social']);
    fireEvent.click(screen.getByRole('link', { name: 'Home' }));
    expect(screen.getByRole('heading', { name: 'John Mark Rosales' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Professional Experience' })).not.toBeInTheDocument();
    expect(container.querySelectorAll('main section')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', 'mailto:johnm4rkrosales@gmail.com');
  });

  it('replaces the slide, centers the selection, and changes weather for every section', () => {
    const { container } = render(<App />);
    const sections = [
      ['Summary', 'CV Summary', 'clouds', '01'],
      ['Home', 'John Mark Rosales', 'sunny', '02'],
      ['About', 'Professional Summary', 'clouds', '03'],
      ['Skills', 'Technical Skills', 'autumn', '04'],
      ['Experience', 'Professional Experience', 'winter', '05'],
      ['Education', 'Education', 'mist', '06'],
      ['Social', 'Social Media', 'sunny', '07'],
    ];
    for (const [link, heading, scene, counter] of sections) {
      const target = screen.getByRole('link', { name: link });
      fireEvent.click(target);
      expect(target).toHaveAttribute('aria-current', 'page');
      expect((target as HTMLElement).style.getPropertyValue('--nav-x')).toBe('50%');
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
      expect(container.querySelectorAll('main section')).toHaveLength(1);
      expect(container.querySelector('.weather-scene')).toHaveClass(`scene-${scene}`);
      expect(screen.getByLabelText(`Slide ${Number(counter)} of 7`)).toHaveTextContent(`${counter} / 07`);
    }
  });

  it('keeps CV projects and skill groups available in their slides', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('link', { name: 'Experience' }));
    expect(screen.getByText('Australian Health Insurance')).toBeInTheDocument();
    expect(screen.getByText('Japanese Real Estate Project')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Skills' }));
    expect(screen.getByText('Architecture & APIs')).toBeInTheDocument();
    expect(screen.getByText('Additional Knowledge')).toBeInTheDocument();
    expect(screen.queryByText('Australian Health Insurance')).not.toBeInTheDocument();
  });

  it('opens deep links and responds to history navigation', () => {
    window.history.replaceState(null, '', '/#skills');
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Technical Skills' })).toBeInTheDocument();
    window.history.replaceState(null, '', '/#education');
    fireEvent(window, new PopStateEvent('popstate'));
    expect(screen.getByRole('heading', { name: 'Education' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Technical Skills' })).not.toBeInTheDocument();
  });

  it('supports keyboard navigation and wraps between the first and last slide', () => {
    render(<App />);
    const summary = screen.getByRole('link', { name: 'Summary' });
    summary.focus();
    fireEvent.keyDown(summary, { key: 'ArrowLeft' });
    const social = screen.getByRole('link', { name: 'Social' });
    expect(social).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Social Media' })).toBeInTheDocument();
    fireEvent.keyDown(social, { key: 'ArrowRight' });
    expect(summary).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'CV Summary', level: 1 })).toBeInTheDocument();
  });

  it('pauses weather across section changes and resumes on request', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Pause weather animation' }));
    expect(container.querySelector('.weather-scene')).toHaveClass('is-paused');
    fireEvent.click(screen.getByRole('link', { name: 'Experience' }));
    expect(container.querySelector('.weather-scene')).toHaveClass('scene-winter', 'is-paused');
    fireEvent.click(screen.getByRole('button', { name: 'Play weather animation' }));
    expect(container.querySelector('.weather-scene')).not.toHaveClass('is-paused');
  });

  it('moves between Education and Experience with footer buttons and directional transitions', () => {
    window.history.replaceState(null, '', '/#education');
    render(<App />);
    const previous = screen.getByRole('button', { name: 'Previous slide' });
    previous.focus();
    fireEvent.click(previous);
    expect(screen.getByRole('heading', { name: 'Professional Experience' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Slide content' }).closest('.slide-panel')).toHaveClass('panel-previous', 'panel-css');
    expect(screen.getByRole('button', { name: 'Previous slide' })).toHaveFocus();
    expect(window.location.hash).toBe('#experience');
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(screen.getByRole('heading', { name: 'Education' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Slide content' }).closest('.slide-panel')).toHaveClass('panel-next', 'panel-css');
    expect(screen.getByLabelText('Slide 6 of 7')).toHaveTextContent('06 / 07');
  });

  it('uses wheel direction without letting one continuous gesture skip slides', () => {
    let time = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => time);
    window.history.replaceState(null, '', '/#education');
    render(<App />);
    fireEvent.wheel(screen.getByRole('region', { name: 'Slide content' }), { deltaY: -100 });
    expect(screen.getByRole('heading', { name: 'Professional Experience' })).toBeInTheDocument();
    time += 50;
    fireEvent.wheel(screen.getByRole('region', { name: 'Slide content' }), { deltaY: 100 });
    expect(screen.getByRole('heading', { name: 'Education' })).toBeInTheDocument();
    time += 250;
    fireEvent.wheel(screen.getByRole('region', { name: 'Slide content' }), { deltaY: 100 });
    for (let index = 0; index < 20; index++) {
      time += 50;
      fireEvent.wheel(screen.getByRole('region', { name: 'Slide content' }), { deltaY: 100 });
    }
    expect(screen.getByRole('heading', { name: 'Education' })).toBeInTheDocument();
    time += 1000;
    fireEvent.wheel(screen.getByRole('region', { name: 'Slide content' }), { deltaY: 100 });
    expect(screen.getByRole('heading', { name: 'Social Media' })).toBeInTheDocument();
  });

  it('scrolls long content normally and changes slides only on a fresh gesture at its top or bottom', () => {
    let time = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => time);
    render(<App />);
    const setScrollable = (top: number) => {
      const region = screen.getByRole('region', { name: 'Slide content' });
      Object.defineProperties(region, { clientHeight: { configurable: true, value: 200 }, scrollHeight: { configurable: true, value: 600 }, scrollTop: { configurable: true, writable: true, value: top } });
      return region;
    };
    let region = setScrollable(100);
    expect(fireEvent.wheel(region, { deltaY: 100, cancelable: true })).toBe(true);
    expect(screen.getByRole('heading', { name: 'CV Summary', level: 1 })).toBeInTheDocument();
    region.scrollTop = 400;
    time += 30;
    fireEvent.wheel(region, { deltaY: 100 });
    expect(screen.getByRole('heading', { name: 'CV Summary', level: 1 })).toBeInTheDocument();
    time += 250;
    fireEvent.wheel(region, { deltaY: 100 });
    expect(screen.getByRole('heading', { name: 'John Mark Rosales' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Summary' }));
    region = setScrollable(100);
    time += 1000;
    expect(fireEvent.wheel(region, { deltaY: -100, cancelable: true })).toBe(true);
    region.scrollTop = 0;
    time += 30;
    fireEvent.wheel(region, { deltaY: -100 });
    expect(screen.getByRole('heading', { name: 'CV Summary', level: 1 })).toBeInTheDocument();
    time += 250;
    fireEvent.wheel(region, { deltaY: -100 });
    expect(screen.getByRole('heading', { name: 'Social Media' })).toBeInTheDocument();
  });

  it('ignores pinch zoom and horizontal wheel gestures and supports line-based mouse wheels', () => {
    window.history.replaceState(null, '', '/#about');
    render(<App />);
    const region = screen.getByRole('region', { name: 'Slide content' });
    fireEvent.wheel(region, { deltaY: 100, ctrlKey: true });
    fireEvent.wheel(region, { deltaY: 10, deltaX: 100 });
    expect(screen.getByRole('heading', { name: 'Professional Summary' })).toBeInTheDocument();
    fireEvent.wheel(region, { deltaY: 3, deltaMode: 1 });
    expect(screen.getByRole('heading', { name: 'Technical Skills' })).toBeInTheDocument();
  });

  it('puts all CV information together in one slide using the existing data', () => {
    window.history.replaceState(null, '', '/#cv');
    const { container } = render(<App />);
    expect(screen.getByRole('heading', { name: 'CV Summary', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(portfolio.name)).toBeInTheDocument();
    expect(screen.getByText(portfolio.email)).toBeInTheDocument();
    expect(screen.getByText(portfolio.summary)).toBeInTheDocument();
    for (const project of portfolio.projects) expect(screen.getByText(project.description)).toBeInTheDocument();
    for (const group of portfolio.skills) expect(screen.getByText(group.items.join(' · '))).toBeInTheDocument();
    expect(screen.getByText(portfolio.education.degree)).toBeInTheDocument();
    expect(container.querySelectorAll('main section')).toHaveLength(1);
  });

  it('shows clearly labeled example social profiles with safe external links', () => {
    window.history.replaceState(null, '', '/#social');
    render(<App />);
    expect(screen.getAllByText('Example profile')).toHaveLength(4);
    for (const profile of socialProfiles) {
      const link = screen.getByRole('link', { name: `${profile.label} example profile (opens in a new tab)` });
      expect(link).toHaveAttribute('href', profile.url);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    expect(screen.queryByRole('heading', { name: 'CV Summary' })).not.toBeInTheDocument();
  });

  it('keeps the entire CV together on mobile without pagination controls', () => {
    window.innerWidth = 390;
    window.innerHeight = 844;
    window.history.replaceState(null, '', '/#cv');
    render(<App />);
    expect(screen.queryByRole('button', { name: 'Previous CV page' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next CV page' })).not.toBeInTheDocument();
    expect(screen.getByText(portfolio.summary)).toBeInTheDocument();
    for (const project of portfolio.projects) expect(screen.getByText(project.description)).toBeInTheDocument();
    for (const group of portfolio.skills) expect(screen.getByText(group.items.join(' · '))).toBeInTheDocument();
    expect(screen.getByText(portfolio.education.degree)).toBeInTheDocument();
  });

  it('starts paused when reduced motion is requested', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({ matches: query.includes('reduced-motion'), addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    const { container } = render(<App />);
    expect(container.querySelector('.weather-scene')).toHaveClass('is-paused');
    expect(screen.getByRole('button', { name: 'Play weather animation' })).toBeInTheDocument();
  });

  it('uses the system color preference and persists a theme change', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({ matches: query.includes('color-scheme'), addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    render(<App />);
    expect(document.documentElement).toHaveAttribute('data-color-mode', 'dark');
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(storage.getItem('portfolio-color-mode')).toBe('light');
    expect(document.documentElement).toHaveAttribute('data-color-mode', 'light');
  });
});
