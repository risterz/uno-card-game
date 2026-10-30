import { describe, it, expect } from 'vitest';
import { RoomManager, isValidEmote } from '../room-manager';

describe('Multiplayer Spectator & Emotes Suite', () => {
  it('validates allowed in-game emotes correctly', () => {
    expect(isValidEmote('😂')).toBe(true);
    expect(isValidEmote('🔥')).toBe(true);
    expect(isValidEmote('💀')).toBe(true);
    expect(isValidEmote('GG')).toBe(true);
    expect(isValidEmote('🎉')).toBe(true);
    expect(isValidEmote('invalid_spam_text')).toBe(false);
    expect(isValidEmote('')).toBe(false);
  });

  it('allows spectator to join a room in progress or with 4 players', () => {
    const rm = new RoomManager();
    const { room: r1, player: p1 } = rm.createRoom('Host Alice');
    rm.joinRoom(r1.code, 'Bob');
    rm.joinRoom(r1.code, 'Charlie');
    rm.joinRoom(r1.code, 'Dave');

    // 4 players in lobby
    expect(r1.players.length).toBe(4);

    // Regular player 5 cannot join
    expect(() => rm.joinRoom(r1.code, 'Eve')).toThrow('Room is full (maximum 4 players).');

    // But Spectator CAN join!
    const { player: spec1, isSpectator } = rm.joinRoom(r1.code, 'Spectator Sam', undefined, 'sock-spec-1', true);
    expect(isSpectator).toBe(true);
    expect(spec1.id.startsWith('spec-')).toBe(true);
    expect(r1.spectators.length).toBe(1);

    // Spectator view has empty hand and isSpectator: true
    const specView = rm.getPrivateView(r1, spec1.id);
    expect(specView.isSpectator).toBe(true);
    expect(specView.myHand).toEqual([]);
    expect(specView.publicState.spectatorCount).toBe(1);

    // Normal player view does not have isSpectator: true
    const p1View = rm.getPrivateView(r1, p1.id);
    expect(p1View.isSpectator).toBe(false);
    expect(p1View.publicState.spectatorCount).toBe(1);
  });

  it('handles spectator disconnect, reconnect, and leaving cleanly', () => {
    const rm = new RoomManager();
    const { room } = rm.createRoom('Host');
    const { player: spec, token } = rm.joinRoom(room.code, 'Viewer', undefined, 'sock-v1', true);

    expect(rm.getPublicState(room).spectatorCount).toBe(1);

    // Disconnect spectator
    const dc = rm.handleDisconnect('sock-v1');
    expect(dc?.isSpectator).toBe(true);
    expect(rm.getPublicState(room).spectatorCount).toBe(0);

    // Reconnect spectator
    const rc = rm.reconnect(room.code, token, 'sock-v2');
    expect(rc.isSpectator).toBe(true);
    expect(rc.player.isConnected).toBe(true);
    expect(rm.getPublicState(room).spectatorCount).toBe(1);

    // Leave room
    const leaveRes = rm.leaveRoom(room.code, spec.id);
    expect(leaveRes.roomDestroyed).toBe(false);
    expect(rm.getPublicState(room).spectatorCount).toBe(0);
  });
});
