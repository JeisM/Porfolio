import { useEffect, useRef, type RefObject } from 'react';

type Swipe = {
  id: number;
  x: number;
  y: number;
  startedAt: number;
  axis: 'horizontal' | 'vertical' | null;
  allowPrevious: boolean;
  allowNext: boolean;
};

/** Swipe on either axis to navigate, letting long content scroll before changing slides. */
export function useSlideSwipe(
  scope: RefObject<HTMLDivElement | null>,
  content: RefObject<HTMLDivElement | null>,
  navigate: (step: -1 | 1) => void,
) {
  const swipe = useRef<Swipe | null>(null);
  const blockedUntil = useRef(0);

  useEffect(() => {
    const element = scope.current;
    if (!element) return;
    const start = (event: TouchEvent) => {
      if (event.touches.length !== 1 || (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]'))) {
        swipe.current = null;
        return;
      }
      const touch = event.touches[0];
      const region = content.current;
      const insideContent = region && event.target instanceof Node && region.contains(event.target);
      // Capture the boundaries before native scrolling: reaching an edge mid-swipe
      // must not change the slide the user is still reading.
      swipe.current = {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        startedAt: Date.now(),
        axis: null,
        allowPrevious: !insideContent || region.scrollTop <= 2,
        allowNext: !insideContent || region.scrollTop + region.clientHeight >= region.scrollHeight - 2,
      };
    };
    const move = (event: TouchEvent) => {
      const state = swipe.current;
      if (!state) return;
      if (event.touches.length !== 1) { swipe.current = null; return; }
      const touch = Array.from(event.touches).find((item) => item.identifier === state.id);
      if (!touch) return;
      const x = Math.abs(touch.clientX - state.x);
      const y = Math.abs(touch.clientY - state.y);
      if (!state.axis && Math.max(x, y) >= 12) {
        if (x > y * 1.25) state.axis = 'horizontal';
        else if (y > x * 1.1) state.axis = 'vertical';
      }
      const verticalNavigation = state.axis === 'vertical'
        && (touch.clientY < state.y ? state.allowNext : state.allowPrevious);
      if ((state.axis === 'horizontal' || verticalNavigation) && event.cancelable) event.preventDefault();
    };
    const end = (event: TouchEvent) => {
      const state = swipe.current;
      swipe.current = null;
      if (!state || event.touches.length) return;
      const touch = Array.from(event.changedTouches).find((item) => item.identifier === state.id);
      if (!touch) return;
      const x = touch.clientX - state.x;
      const y = touch.clientY - state.y;
      const axis = state.axis ?? (Math.abs(x) > Math.abs(y) * 1.25 ? 'horizontal' : Math.abs(y) > Math.abs(x) * 1.1 ? 'vertical' : null);
      if (!axis) return;
      const distance = axis === 'horizontal' ? x : y;
      const crossDistance = axis === 'horizontal' ? y : x;
      const threshold = axis === 'horizontal' ? window.innerWidth * .16 : window.innerHeight * .12;
      const step = distance > 0 ? -1 : 1;
      const now = Date.now();
      if (Math.abs(distance) < Math.min(70, threshold) || Math.abs(distance) <= Math.abs(crossDistance) * (axis === 'horizontal' ? 1.25 : 1.1) || now - state.startedAt > 1200) return;
      if (axis === 'vertical' && !(step === 1 ? state.allowNext : state.allowPrevious)) return;
      if (event.cancelable) event.preventDefault();
      if (now < blockedUntil.current) return;
      blockedUntil.current = now + 900;
      navigate(step);
    };
    const cancel = () => { swipe.current = null; };
    element.addEventListener('touchstart', start, { passive: true });
    element.addEventListener('touchmove', move, { passive: false });
    element.addEventListener('touchend', end, { passive: false });
    element.addEventListener('touchcancel', cancel, { passive: true });
    return () => {
      element.removeEventListener('touchstart', start);
      element.removeEventListener('touchmove', move);
      element.removeEventListener('touchend', end);
      element.removeEventListener('touchcancel', cancel);
    };
  }, [scope, content, navigate]);
}
