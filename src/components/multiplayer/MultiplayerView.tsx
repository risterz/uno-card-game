import React, { useState, useEffect } from 'react';
import { multiplayerService } from '../../services/multiplayer-socket';
import { PlayerPrivateView, ActionNotificationPayload } from '../../types/multiplayer';
import { OnlineLobby } from './OnlineLobby';
import { MultiplayerGameBoard } from './MultiplayerGameBoard';

export const MultiplayerView: React.FC = () => {
  const [currentView, setCurrentView] = useState<PlayerPrivateView | null>(null);
  const [activeNotification, setActiveNotification] = useState<ActionNotificationPayload | null>(null);
  const [initialRoomCode, setInitialRoomCode] = useState<string>('');

  useEffect(() => {
    // Check URL parameters for ?room=XYZ
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setInitialRoomCode(roomParam.toUpperCase());
    }

    // Connect to Socket.IO server
    multiplayerService.connect();

    // Try auto-reconnect if saved session exists
    const saved = multiplayerService.getSavedSession();
    if (saved.roomCode && saved.sessionToken) {
      multiplayerService
        .reconnectSession(saved.roomCode, saved.sessionToken)
        .catch(() => {
          // Clean up stale session
          multiplayerService.clearSession();
        });
    }

    // Subscribe to state synchronization
    const unsubSync = multiplayerService.onSyncState(view => {
      setCurrentView(view);
    });

    // Subscribe to action notifications (toasts)
    const unsubNotif = multiplayerService.onActionNotification(notif => {
      setActiveNotification(notif);
      setTimeout(() => setActiveNotification(null), 1600);
    });

    return () => {
      unsubSync();
      unsubNotif();
    };
  }, []);

  const handleLeaveRoom = () => {
    if (currentView) {
      multiplayerService.leaveRoom(currentView.publicState.roomCode);
      setCurrentView(null);
    }
  };

  // If in game or game over, render the multiplayer game board
  if (
    currentView &&
    (currentView.publicState.status === 'playing' ||
      currentView.publicState.status === 'game_over')
  ) {
    return (
      <MultiplayerGameBoard
        view={currentView}
        notification={activeNotification}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  // Otherwise render lobby
  return (
    <OnlineLobby
      currentView={currentView}
      onGameStarted={() => {}}
      initialRoomCode={initialRoomCode}
    />
  );
};
