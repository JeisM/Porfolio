import { useEffect, useRef, type RefObject } from 'react';

type Swipe = { id: number; x: number; y: number; startedAt: number; axis: 'horizontal' | 'vertical' | null };

/** Horizontal touch gestures navigate; vertical gestures stay native for reading. */
export function useSlideSwipe(scope: RefObject<HTMLDivElement | null>, navigate: (step: -1 | 1) => void) {
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
      swipe.current = { id: touch.identifier, x: touch.clientX, y: touch.clientY, startedAt: Date.now(), axis: null };
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
      if (state.axis === 'horizontal' && event.cancelable) event.preventDefault();
    };
    const end = (event: TouchEvent) => {
      const state = swipe.current;
      swipe.current = null;
      if (!state || event.touches.length || state.axis === 'vertical') return;
      const touch = Array.from(event.changedTouches).find((item) => item.identifier === state.id);
      if (!touch) return;
      const x = touch.clientX - state.x;
      const y = touch.clientY - state.y;
      const now = Date.now();
      if (Math.abs(x) < Math.min(70, window.innerWidth * 0.16) || Math.abs(x) <= Math.abs(y) * 1.25 || now - state.startedAt > 1200) return;
      if (event.cancelable) event.preventDefault();
      if (now < blockedUntil.current) return;
      blockedUntil.current = now + 900;
      navigate(x > 0 ? -1 : 1);
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
  }, [scope, navigate]);
}
