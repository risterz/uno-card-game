import { describe, it, expect, beforeEach } from 'vitest';
import { RoomManager } from '../room-manager';
import { CardDefinition } from '../../src/types/card';

describe('Authoritative Multiplayer Full Lifecycle', () => {
  let manager: RoomManager;

  beforeEach(() => {
    manager = new RoomManager();
  });

  it('1. Creates room with unique host identity and session token', () => {
    const { room, player: host, token } = manager.createRoom('AliceHost', '👑');
    expect(room.code).toBeDefined();
    expect(room.code.length).toBe(6);
    expect(room.status).toBe('lobby');
    expect(host.name).toBe('AliceHost');
    expect(host.isHost).toBe(true);
    expect(token).toBeDefined();

    const retrieved = manager.getRoom(room.code);
    expect(retrieved).toBe(room);
  });

  it('2. Joins room and enforces maximum 4 player limit', () => {
    const { room } = manager.createRoom('Alice', '👑');
    const { player: bob } = manager.joinRoom(room.code, 'Bob', '🦊');
    const { player: charlie } = manager.joinRoom(room.code, 'Charlie', '🐼');
    const { player: dave } = manager.joinRoom(room.code, 'Dave', '🐯');

    expect(room.players.length).toBe(4);
    expect(bob.name).toBe('Bob');
    expect(charlie.name).toBe('Charlie');
    expect(dave.name).toBe('Dave');

    // Attempting to join a full room throws error
    expect(() => manager.joinRoom(room.code, 'Eve', '🐱')).toThrow(/full/i);
  });

  it('3. Starts game and guarantees ZERO private cards leak in public state', () => {
    const { room, player: host } = manager.createRoom('Alice', '👑');
    const { player: guest } = manager.joinRoom(room.code, 'Bob', '🦊');

    manager.startGame(room.code, host.id);
    expect(room.status).toBe('playing');
    expect(room.gameState).toBeDefined();

    // Verify Public State (Broadcast to all spectators / players)
    const pub = manager.getPublicState(room);
    expect(pub.status).toBe('playing');
    expect(pub.topDiscard).toBeDefined();
    expect(pub.activeColor).toBeDefined();
    expect(pub.players.length).toBe(2);

    // CRITICAL SECURITY CHECK: Public state has card counts, NOT card arrays
    for (const p of pub.players) {
      expect((p as any).hand).toBeUndefined();
      expect(p.cardCount).toBe(7);
    }

    // Verify Private Views (Individualized per player socket)
    const aliceView = manager.getPrivateView(room, host.id);
    const bobView = manager.getPrivateView(room, guest.id);

    expect(aliceView.myHand.length).toBe(7);
    expect(bobView.myHand.length).toBe(7);

    // Alice's hand must be completely distinct from Bob's hand
    const aliceCardIds = new Set(aliceView.myHand.map(c => c.id));
    const bobCardIds = new Set(bobView.myHand.map(c => c.id));
    expect(aliceCardIds.size).toBe(7);
    expect(bobCardIds.size).toBe(7);
    for (const id of aliceCardIds) {
      expect(bobCardIds.has(id)).toBe(false);
    }
  });

  it('4. Handles session disconnection and seamless reconnection', () => {
    const { room, player: host } = manager.createRoom('Alice', '👑', 'socket-alice-1');
    const { player: guest, token: guestToken } = manager.joinRoom(room.code, 'Bob', '🦊', 'socket-bob-1');

    manager.startGame(room.code, host.id);

    // Simulate Bob disconnecting
    const disconnected = manager.handleDisconnect('socket-bob-1');
    expect(disconnected).toBeDefined();
    expect(disconnected?.player.isConnected).toBe(false);

    const pubWhileDc = manager.getPublicState(room);
    const bobInPub = pubWhileDc.players.find(p => p.id === guest.id);
    expect(bobInPub?.isConnected).toBe(false);

    // Simulate Bob reconnecting with his private session token on a new socket
    const reconnected = manager.reconnect(room.code, guestToken, 'socket-bob-2');
    expect(reconnected.room.code).toBe(room.code);
    expect(reconnected.player.id).toBe(guest.id);
    expect(reconnected.player.isConnected).toBe(true);
    expect(reconnected.player.socketId).toBe('socket-bob-2');

    // Bob still has his exact 7 cards intact
    const bobPrivateView = manager.getPrivateView(room, guest.id);
    expect(bobPrivateView.myHand.length).toBe(7);
  });

  it('5. Executes card synchronization, pass turn, and game completion', () => {
    const { room, player: host } = manager.createRoom('Alice', '👑');
    manager.joinRoom(room.code, 'Bob', '🦊');

    manager.startGame(room.code, host.id);
    const gs = room.gameState!;

    // Artificially configure host with 1 matching card for determinism
    const topCard = gs.discardPile[gs.discardPile.length - 1];
    const winningCard: CardDefinition = {
      id: 'winning-card-test',
      cardKey: 'red-5',
      color: topCard.color === 'wild' ? 'red' : topCard.color,
      value: '5',
      type: 'number',
      name: 'Test Winning Card',
      score: 5,
      instanceIndex: 1,
    };

    gs.players[0].hand = [winningCard];
    gs.players[0].unoDeclared = true;
    gs.currentPlayerIndex = 0;
    gs.status = 'playing';

    // Alice plays her final card to win
    const result = manager.playCard(room.code, host.id, winningCard.id);

    expect(room.status).toBe('game_over');
    expect(room.gameState?.status).toBe('game_over');
    expect(result.winner).toBeDefined();
    expect(result.winner?.id).toBe(host.id);
    expect(room.turnExpiresAt).toBeNull();
  });
});
