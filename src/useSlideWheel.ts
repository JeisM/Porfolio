import { useEffect, useRef, type RefObject } from 'react';

/** Let inner content scroll first, then change slides on a fresh boundary gesture. */
export function useSlideWheel(
  scope: RefObject<HTMLDivElement | null>,
  content: RefObject<HTMLDivElement | null>,
  navigate: (step: -1 | 1) => void,
) {
  const gesture = useRef({ total: 0, lastAt: 0, direction: 0, blockedUntil: 0, handled: false, startedInside: false });

  useEffect(() => {
    const element = scope.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const step = event.deltaY > 0 ? 1 : -1;
      const now = Date.now();
      const state = gesture.current;
      const reversed = state.direction !== 0 && state.direction !== step;
      const fresh = now - state.lastAt > 180 || reversed;
      if (fresh) {
        state.total = 0;
        state.handled = false;
        state.startedInside = false;
      }
      state.lastAt = now;
      state.direction = step;

      // Ignore trackpad inertia after a transition, but allow an intentional reversal.
      if (state.handled || (now < state.blockedUntil && !reversed)) {
        state.handled = true;
        event.preventDefault();
        return;
      }

      const region = content.current;
      if (region && event.target instanceof Node && region.contains(event.target)) {
        const canScroll = step > 0
          ? region.scrollTop + region.clientHeight < region.scrollHeight - 2
          : region.scrollTop > 2;
        if (canScroll) {
          state.total = 0;
          state.startedInside = true;
          return;
        }
        // Reaching an edge during the same gesture should never throw away the slide.
        if (state.startedInside) {
          event.preventDefault();
          return;
        }
      }

      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      state.total += Math.abs(event.deltaY) * unit;
      if (state.total < 40) return;
      state.total = 0;
      state.handled = true;
      state.blockedUntil = now + 900;
      navigate(step);
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [scope, content, navigate]);
}
