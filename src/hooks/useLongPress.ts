import { useCallback, useRef, useState } from 'react';

export function useLongPress(
  onLongPress: (e: any) => void,
  onClick: (e: any) => void,
  { delay = 300, shouldPreventDefault = true, moveThreshold = 10 } = {}
) {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<NodeJS.Timeout>(null);
  const target = useRef<any>(null);
  const startPos = useRef<{ x: number, y: number } | null>(null);
  const isMoving = useRef(false);

  const start = useCallback(
    (event: any) => {
      isMoving.current = false;
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      startPos.current = { x: clientX, y: clientY };

      if (shouldPreventDefault && event.target) {
        event.target.addEventListener('touchend', preventDefault, {
          passive: false
        });
        target.current = event.target;
      }
      timeout.current = setTimeout(() => {
        if (!isMoving.current) {
          onLongPress(event);
          setLongPressTriggered(true);
        }
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (event: any, shouldTriggerClick = true) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      if (shouldTriggerClick && !longPressTriggered && !isMoving.current) {
        onClick(event);
      }
      setLongPressTriggered(false);
      isMoving.current = false;
      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener('touchend', preventDefault);
      }
    },
    [onClick, longPressTriggered, shouldPreventDefault]
  );

  const move = useCallback((event: any) => {
      if (!startPos.current) return;
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      const diffX = Math.abs(clientX - startPos.current.x);
      const diffY = Math.abs(clientY - startPos.current.y);

      if (diffX > moveThreshold || diffY > moveThreshold) {
          isMoving.current = true;
          if (timeout.current) {
              clearTimeout(timeout.current);
          }
      }
  }, [moveThreshold]);

  const preventDefault = (event: any) => {
    if (!event.cancelable) return;
    event.preventDefault();
  };

  return {
    onMouseDown: (e: any) => start(e),
    onTouchStart: (e: any) => start(e),
    onMouseMove: (e: any) => move(e),
    onTouchMove: (e: any) => move(e),
    onMouseUp: (e: any) => clear(e),
    onMouseLeave: (e: any) => clear(e, false),
    onTouchEnd: (e: any) => clear(e)
  };
}
