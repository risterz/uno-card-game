import { useState, useRef, useEffect, useCallback } from 'react';

export type NotificationType =
  | 'skip'
  | 'reverse'
  | 'draw2'
  | 'wild'
  | 'wild_draw4'
  | 'uno'
  | 'caught';

export interface GameNotification {
  id: string;
  type: NotificationType;
  createdAt: number;
  duration: number;
  targetPlayerName?: string;
  sourcePlayerName?: string;
  chosenColor?: string;
  playerName?: string;
}

export function useNotificationManager(reducedMotion = false) {
  const [activeNotification, setActiveNotification] = useState<GameNotification | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const counterRef = useRef(0);

  // Clear running timers upon component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const dismissNotification = useCallback((id?: string) => {
    if (id && activeIdRef.current !== id) {
      // Stale timer trying to dismiss a newer notification -> ignore safely
      return;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    activeIdRef.current = null;
    setActiveNotification(null);
  }, []);

  const triggerNotification = useCallback(
    (
      params: Omit<GameNotification, 'id' | 'createdAt' | 'duration'> & {
        customDuration?: number;
      }
    ) => {
      // Clear any prior timer to prevent premature dismissal
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Determine duration by priority
      let duration: number;
      if (params.customDuration) {
        duration = params.customDuration;
      } else {
        switch (params.type) {
          case 'skip':
          case 'reverse':
            duration = 1300;
            break;
          case 'draw2':
          case 'wild_draw4':
            duration = 1500;
            break;
          case 'wild':
            duration = 1200;
            break;
          case 'uno':
          case 'caught':
            duration = 1400;
            break;
          default:
            duration = 1200;
        }
      }

      if (reducedMotion) {
        duration = Math.max(650, Math.floor(duration * 0.65));
      }

      counterRef.current += 1;
      const id = `notif-${Date.now()}-${counterRef.current}`;
      const newNotif: GameNotification = {
        ...params,
        id,
        createdAt: Date.now(),
        duration,
      };

      activeIdRef.current = id;
      setActiveNotification(newNotif);

      // Start authoritative dismissal timer
      timerRef.current = setTimeout(() => {
        // Only dismiss if the active notification is still this exact ID
        if (activeIdRef.current === id) {
          setActiveNotification(null);
          activeIdRef.current = null;
          timerRef.current = null;
        }
      }, duration);
    },
    [reducedMotion]
  );

  return {
    activeNotification,
    triggerNotification,
    dismissNotification,
  };
}
