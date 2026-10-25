import { useRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSlideSwipe } from './useSlideSwipe';

function SwipeSurface({ navigate }: { navigate: (step: -1 | 1) => void }) {
  const scope = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  useSlideSwipe(scope, content, navigate);
  return <div ref={scope} data-testid="surface"><div ref={content} role="region" aria-label="Slide content"><input aria-label="Editable content" /></div></div>;
}

function setup(scrollTop = 0, scrollHeight = 200) {
  const navigate = vi.fn();
  render(<SwipeSurface navigate={navigate} />);
  const region = screen.getByRole('region', { name: 'Slide content' });
  Object.defineProperties(region, {
    clientHeight: { configurable: true, value: 200 },
    scrollHeight: { configurable: true, value: scrollHeight },
    scrollTop: { configurable: true, writable: true, value: scrollTop },
  });
  return { region, navigate };
}

function swipe(target: HTMLElement, x: number, y: number) {
  const start = { identifier: 1, clientX: 200, clientY: 250 };
  const end = { ...start, clientX: start.clientX + x, clientY: start.clientY + y };
  fireEvent.touchStart(target, { touches: [start] });
  const nativeScroll = fireEvent.touchMove(target, { touches: [end], cancelable: true });
  fireEvent.touchEnd(target, { touches: [], changedTouches: [end], cancelable: true });
  return nativeScroll;
}

describe('slide touch navigation', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 });
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it.each([
    ['left', -100, 0, 1],
    ['right', 100, 0, -1],
    ['up', 0, -100, 1],
    ['down', 0, 100, -1],
  ])('navigates with a swipe %s when content fits', (_direction, x, y, step) => {
    const { region, navigate } = setup();
    expect(swipe(region, Number(x), Number(y))).toBe(false);
    expect(navigate).toHaveBeenCalledExactlyOnceWith(step);
  });

  it.each([-100, 100])('preserves native scrolling inside long content (delta %i)', (y) => {
    const { region, navigate } = setup(100, 600);
    expect(swipe(region, 0, y)).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it.each([
    [0, -100],
    [400, 100],
  ])('scrolls back into content from an edge at %i', (top, y) => {
    const { region, navigate } = setup(top, 600);
    expect(swipe(region, 0, y)).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it.each([
    [400, -100, 1],
    [0, 100, -1],
  ])('requires a fresh swipe after reaching the edge at %i', (top, y, step) => {
    const { region, navigate } = setup(100, 600);
    const start = { identifier: 1, clientX: 200, clientY: 250 };
    const end = { ...start, clientY: start.clientY + y };
    fireEvent.touchStart(region, { touches: [start] });
    region.scrollTop = top;
    fireEvent.touchMove(region, { touches: [end] });
    fireEvent.touchEnd(region, { touches: [], changedTouches: [end] });
    expect(navigate).not.toHaveBeenCalled();
    expect(swipe(region, 0, y)).toBe(false);
    expect(navigate).toHaveBeenCalledExactlyOnceWith(step);
  });

  it('keeps horizontal navigation available while reading long content', () => {
    const { region, navigate } = setup(100, 600);
    swipe(region, -100, 0);
    expect(navigate).toHaveBeenCalledExactlyOnceWith(1);
  });

  it('allows a vertical swipe outside the reading region', () => {
    const { navigate } = setup(100, 600);
    swipe(screen.getByTestId('surface'), 0, -100);
    expect(navigate).toHaveBeenCalledExactlyOnceWith(1);
  });

  it('ignores taps, short movements, ambiguous diagonals, and editable inputs', () => {
    const { region, navigate } = setup();
    swipe(region, 0, 0);
    swipe(region, 0, -20);
    swipe(region, 60, 60);
    swipe(screen.getByRole('textbox'), 0, -100);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('cancels navigation for pinch gestures and interrupted touches', () => {
    const { region, navigate } = setup();
    const first = { identifier: 1, clientX: 200, clientY: 250 };
    const second = { identifier: 2, clientX: 250, clientY: 250 };
    const end = { ...first, clientY: 100 };
    fireEvent.touchStart(region, { touches: [first] });
    fireEvent.touchMove(region, { touches: [end, second] });
    fireEvent.touchEnd(region, { touches: [], changedTouches: [end] });
    fireEvent.touchStart(region, { touches: [first] });
    fireEvent.touchCancel(region);
    fireEvent.touchEnd(region, { touches: [], changedTouches: [end] });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('prevents rapid repeated swipes from skipping multiple slides', () => {
    let now = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const { region, navigate } = setup();
    swipe(region, 0, -100);
    swipe(region, 0, -100);
    expect(navigate).toHaveBeenCalledTimes(1);
    now += 1000;
    swipe(region, 0, -100);
    expect(navigate).toHaveBeenCalledTimes(2);
  });
});
