import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { portfolio } from './portfolio';

function renderWithNavigation() {
  const result = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /^Show navigation/ }));
  return result;
}

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

  it('hides the Summary heading and icon only while navigation is closed', () => {
    render(<App />);
    const summary = screen.getByRole('region', { name: 'CV Summary' });
    expect(summary.querySelector('.slide-heading')).not.toBeInTheDocument();
    expect(screen.getByText(portfolio.name)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /^Show navigation/ }));
    expect(screen.getByRole('heading', { name: 'CV Summary', level: 1 })).toBeVisible();
    expect(summary.querySelector('.section-icon')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Hide navigation' }));
    expect(summary.querySelector('.slide-heading')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(screen.getByRole('heading', { name: portfolio.name, level: 1 })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(screen.getByRole('heading', { name: 'Professional Summary', level: 1 })).toBeVisible();
    expect(screen.getByRole('button', { name: /^Show navigation/ })).toHaveAttribute('aria-expanded', 'false');
  });

  it('starts with navigation hidden while keeping the selected section and footer controls available', () => {
    window.history.replaceState(null, '', '/#skills');
    const { container } = render(<App />);
    const toggle = screen.getByRole('button', { name: 'Show navigation, current section Skills' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', 'portfolio-navigation');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument();
    expect(container.querySelector('#portfolio-navigation')).toHaveAttribute('inert');
    expect(screen.getByRole('heading', { name: 'Technical Skills' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(screen.getByRole('heading', { name: 'Professional Experience' })).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-label', 'Show navigation, current section Experience');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps navigation open after selecting sections and closes only on request', () => {
    renderWithNavigation();
    const toggle = screen.getByRole('button', { name: 'Hide navigation' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Summary' })).toHaveFocus();
    for (const label of ['Home', 'About', 'Skills', 'Experience', 'Education', 'Social', 'Summary']) {
      fireEvent.click(screen.getByRole('link', { name: label }));
      expect(screen.getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page');
      expect(screen.getByRole('navigation')).toBeVisible();
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    }
    fireEvent.click(toggle);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(toggle).toHaveFocus();
    fireEvent.click(toggle);
    expect(screen.getByRole('link', { name: 'Summary' })).toHaveFocus();
  });

  it('closes navigation with Escape and restores focus to the toggle', () => {
    window.history.replaceState(null, '', '/#education');
    renderWithNavigation();
    const current = screen.getByRole('link', { name: 'Education' });
    expect(current).toHaveFocus();
    fireEvent.keyDown(current, { key: 'Escape' });
    const toggle = screen.getByRole('button', { name: 'Show navigation, current section Education' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Education' })).toBeInTheDocument();
  });

  it('starts with CV Summary and opens the profile through Home', () => {
    const { container } = renderWithNavigation();
    expect(screen.getByRole('heading', { name: 'CV Summary', level: 1 })).toBeInTheDocument();
    expect([...container.querySelectorAll('.arc-navigation a')].map((link) => link.getAttribute('aria-label'))).toEqual(['Summary', 'Home', 'About', 'Skills', 'Experience', 'Education', 'Social']);
    fireEvent.click(screen.getByRole('link', { name: 'Home' }));
    expect(screen.getByRole('heading', { name: 'John Mark Rosales' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Professional Experience' })).not.toBeInTheDocument();
    expect(container.querySelectorAll('main section')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', 'mailto:johnm4rkrosales@gmail.com');
  });

  it('replaces the slide, centers the selection, and changes weather for every section', () => {
    const { container } = renderWithNavigation();
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
      expect(target).toHaveAttribute('data-distance', '0');
      const links = [...container.querySelectorAll<HTMLAnchorElement>('.arc-navigation a')];
      for (const distance of [1, 2, 3]) {
        const neighbor = links.find((link) => link.dataset.distance === String(distance));
        expect(neighbor).toBeDefined();
        expect(Number(neighbor!.style.getPropertyValue('--nav-icon-scale'))).toBeLessThan(Number(target.style.getPropertyValue('--nav-icon-scale')));
      }
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
      expect(container.querySelectorAll('main section')).toHaveLength(1);
      expect(container.querySelector('.weather-scene')).toHaveClass(`scene-${scene}`);
      expect(screen.getByLabelText(`Slide ${Number(counter)} of 7`)).toHaveTextContent(`${counter} / 07`);
    }
  });

  it('keeps CV projects and skill groups available in their slides', () => {
    renderWithNavigation();
    fireEvent.click(screen.getByRole('link', { name: 'Experience' }));
    expect(screen.getByText('Australian Health Insurance')).toBeInTheDocument();
    expect(screen.getByText('Japanese Real Estate Project')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Skills' }));
    expect(screen.getByText('Architecture & APIs')).toBeInTheDocument();
    expect(screen.getByText('Additional Knowledge')).toBeInTheDocument();
    for (const skill of portfolio.skills.flatMap((group) => [...group.items])) {
      expect(screen.getByText(skill).closest('.skill-chip')?.querySelector('svg')).toBeInTheDocument();
    }
    expect(screen.queryByText('Australian Health Insurance')).not.toBeInTheDocument();
  });

  it('opens deep links and responds to history navigation', () => {
    window.history.replaceState(null, '', '/#skills');
    renderWithNavigation();
    expect(screen.getByRole('heading', { name: 'Technical Skills' })).toBeInTheDocument();
    window.history.replaceState(null, '', '/#education');
    fireEvent(window, new PopStateEvent('popstate'));
    expect(screen.getByRole('heading', { name: 'Education' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Technical Skills' })).not.toBeInTheDocument();
  });

  it('supports keyboard navigation and wraps between the first and last slide', () => {
    renderWithNavigation();
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
    const { container } = renderWithNavigation();
    fireEvent.click(screen.getByRole('button', { name: 'Pause weather animation' }));
    expect(container.querySelector('.weather-scene')).toHaveClass('is-paused');
    fireEvent.click(screen.getByRole('link', { name: 'Experience' }));
    expect(container.querySelector('.weather-scene')).toHaveClass('scene-winter', 'is-paused');
    fireEvent.click(screen.getByRole('button', { name: 'Play weather animation' }));
    expect(container.querySelector('.weather-scene')).not.toHaveClass('is-paused');
  });

  it('moves between Education and Experience with footer buttons and directional transitions', () => {
    window.history.replaceState(null, '', '/#education');
    renderWithNavigation();
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
    renderWithNavigation();
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
    renderWithNavigation();
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
    renderWithNavigation();
    const region = screen.getByRole('region', { name: 'Slide content' });
    fireEvent.wheel(region, { deltaY: 100, ctrlKey: true });
    fireEvent.wheel(region, { deltaY: 10, deltaX: 100 });
    expect(screen.getByRole('heading', { name: 'Professional Summary' })).toBeInTheDocument();
    fireEvent.wheel(region, { deltaY: 3, deltaMode: 1 });
    expect(screen.getByRole('heading', { name: 'Technical Skills' })).toBeInTheDocument();
  });

  it('puts all CV information together in one slide using the existing data', () => {
    window.history.replaceState(null, '', '/#cv');
    const { container } = renderWithNavigation();
    expect(screen.getByRole('heading', { name: 'CV Summary', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(portfolio.name)).toBeInTheDocument();
    expect(screen.getByText(portfolio.email)).toBeInTheDocument();
    expect(screen.getByText(portfolio.summary)).toBeInTheDocument();
    for (const project of portfolio.projects) expect(screen.getByText(project.description)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'John Mark Rosales at a waterfall' })).toHaveAttribute('src', '/john-mark-rosales.jpg');
    for (const skill of portfolio.skills.flatMap((group) => [...group.items])) {
      expect(screen.getByText(skill).closest('.skill-chip')?.querySelector('svg')).toBeInTheDocument();
    }
    expect(screen.getByText(portfolio.education.degree)).toBeInTheDocument();
    expect(container.querySelectorAll('main section')).toHaveLength(1);
  });

  it('shows supplied social profiles and contact actions without placeholder accounts', () => {
    window.history.replaceState(null, '', '/#social');
    renderWithNavigation();
    expect(screen.getByRole('link', { name: `Email ${portfolio.email}` })).toHaveAttribute('href', `mailto:${portfolio.email}`);
    expect(screen.getByRole('link', { name: `Phone ${portfolio.phone}` })).toHaveAttribute('href', `tel:${portfolio.phone}`);
    const facebook = screen.getByRole('link', { name: 'Facebook (opens in a new tab)' });
    const github = screen.getByRole('link', { name: 'GitHub (opens in a new tab)' });
    const linkedin = screen.getByRole('link', { name: 'LinkedIn (opens in a new tab)' });
    expect(facebook).toHaveAttribute('href', 'https://www.facebook.com/share/1E6qBPfwAa/');
    expect(github).toHaveAttribute('href', 'https://github.com/JeisM');
    expect(linkedin).toHaveAttribute('href', 'https://www.linkedin.com/in/john-rosales-8266b230a');
    for (const link of [facebook, github, linkedin]) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    expect(screen.queryByText('Example profile')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Instagram|Twitter/ })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Social Media' }).querySelectorAll('a')).toHaveLength(5);
    expect(screen.queryByRole('heading', { name: 'CV Summary' })).not.toBeInTheDocument();
  });

  it('keeps the entire CV together on mobile without pagination controls', () => {
    window.innerWidth = 390;
    window.innerHeight = 844;
    window.history.replaceState(null, '', '/#cv');
    renderWithNavigation();
    expect(screen.queryByRole('button', { name: 'Previous CV page' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next CV page' })).not.toBeInTheDocument();
    expect(screen.getByText(portfolio.summary)).toBeInTheDocument();
    for (const project of portfolio.projects) expect(screen.getByText(project.description)).toBeInTheDocument();
    for (const skill of portfolio.skills.flatMap((group) => [...group.items])) expect(screen.getByText(skill)).toBeInTheDocument();
    expect(screen.getByText(portfolio.education.degree)).toBeInTheDocument();
  });

  it('starts paused when reduced motion is requested', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({ matches: query.includes('reduced-motion'), addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    const { container } = renderWithNavigation();
    expect(container.querySelector('.weather-scene')).toHaveClass('is-paused');
    expect(screen.getByRole('button', { name: 'Play weather animation' })).toBeInTheDocument();
  });

  it('uses the system color preference and persists a theme change', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({ matches: query.includes('color-scheme'), addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    renderWithNavigation();
    expect(document.documentElement).toHaveAttribute('data-color-mode', 'dark');
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(storage.getItem('portfolio-color-mode')).toBe('light');
    expect(document.documentElement).toHaveAttribute('data-color-mode', 'light');
  });
});
