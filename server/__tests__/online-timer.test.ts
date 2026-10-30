import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoomManager, ONLINE_TURN_TIMEOUT_SECONDS } from '../room-manager';

describe('Online Turn Timer in RoomManager', () => {
  let manager: RoomManager;

  beforeEach(() => {
    manager = new RoomManager();
    vi.useFakeTimers();
  });

  it('initializes game with turn timer running and exports public state with timer fields', () => {
    const { room, player: host } = manager.createRoom('HostPlayer', '👑');
    manager.joinRoom(room.code, 'GuestPlayer', '🦊');

    manager.startGame(room.code, host.id);
    const pub = manager.getPublicState(room);

    expect(pub.status).toBe('playing');
    expect(pub.turnTimeoutSeconds).toBe(ONLINE_TURN_TIMEOUT_SECONDS);
    expect(pub.turnExpiresAt).toBeGreaterThan(Date.now());
  });

  it('triggers onTurnTimeoutCallback and auto-resolves when round timer expires', () => {
    const { room, player: host } = manager.createRoom('HostPlayer', '👑');
    manager.joinRoom(room.code, 'GuestPlayer', '🦊');

    let timeoutFired = false;
    manager.setOnTurnTimeoutCallback(() => {
      timeoutFired = true;
    });

    manager.startGame(room.code, host.id);
    const initialPub = manager.getPublicState(room);
    const initialPlayerIndex = initialPub.currentPlayerIndex;
    const initialPlayer = initialPub.players[initialPlayerIndex];

    // Advance time by 20 seconds
    vi.advanceTimersByTime(ONLINE_TURN_TIMEOUT_SECONDS * 1000);

    expect(timeoutFired).toBe(true);

    const postTimeoutPub = manager.getPublicState(room);
    expect(postTimeoutPub.lastActionMessage).toContain('timed out');
    expect(postTimeoutPub.lastActionMessage).toContain(initialPlayer.name);
    // Timer was reset for the next turn
    expect(postTimeoutPub.turnExpiresAt).toBeGreaterThan(Date.now());
  });

  it('clears turn timer when game ends', () => {
    const { room, player: host } = manager.createRoom('HostPlayer', '👑');
    manager.joinRoom(room.code, 'GuestPlayer', '🦊');

    manager.startGame(room.code, host.id);
    expect(room.turnExpiresAt).not.toBeNull();

    manager.clearTurnTimer(room);
    expect(room.turnExpiresAt).toBeNull();
  });
});
