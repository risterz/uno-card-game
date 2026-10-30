import http from 'http';
import { Server, Socket } from 'socket.io';
import { RoomManager, GameRoom, isValidEmote } from './room-manager';
import {
  CreateRoomRequest,
  JoinRoomRequest,
  ReconnectSessionRequest,
  PlayCardRequest,
  ChooseColorRequest,
  CatchUnoRequest,
  EmotePayload,
  SendEmoteRequest,
} from '../src/types/multiplayer';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const HOST = process.env.HOST || '0.0.0.0';
const IS_PROD = process.env.NODE_ENV === 'production';
// Wildcard allowed in development only; production requires explicit origins
const CLIENT_URL = process.env.CLIENT_URL || (IS_PROD ? '' : '*');

const roomManager = new RoomManager();

/**
 * Check if incoming request origin is permitted by CORS configuration.
 * In production:
 * - Only explicitly specified origins in CLIENT_URL (comma-delimited) are allowed.
 * - Wildcard * is disabled by default unless explicitly configured.
 * - Subdomain matching (e.g. *.pages.dev) only applies if CLIENT_URL explicitly contains *.
 */
function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true; // Server-to-server, health-check or local non-browser tools
  if (!CLIENT_URL) return false;
  if (CLIENT_URL === '*') return true;

  const allowedList = CLIENT_URL.split(',').map(s => s.trim().toLowerCase());
  const originLower = origin.toLowerCase();

  for (const allowed of allowedList) {
    if (allowed === originLower) {
      return true;
    }
    // Explicit wildcard subdomain matching ONLY (e.g., https://*.pages.dev or *.pages.dev)
    if (allowed.startsWith('https://*.') || allowed.startsWith('http://*.') || allowed.startsWith('*.')) {
      const suffix = allowed.replace(/^(https?:\/\/)?\*\./, '.');
      const originHost = originLower.replace(/^https?:\/\//, '');
      if (originHost.endsWith(suffix)) {
        return true;
      }
    }
  }

  return false;
}

// Create HTTP server with health-check and CORS support
const server = http.createServer((req, res) => {
  const reqOrigin = req.headers.origin as string | undefined;

  if (reqOrigin && isOriginAllowed(reqOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', reqOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (!IS_PROD && CLIENT_URL === '*') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'healthy',
        service: 'uno-multiplayer-backend',
        version: '1.0.0',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: Date.now(),
        environment: process.env.NODE_ENV || 'production',
        port: PORT,
        host: HOST,
      })
    );
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Setup Socket.IO with production CORS origin validation
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS.`));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 20000,
  pingInterval: 10000,
});

// Rate limiting map
const socketRates = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(socketId: string, limit = 25, windowMs = 1000): boolean {
  const now = Date.now();
  const entry = socketRates.get(socketId) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + windowMs;
    socketRates.set(socketId, entry);
    return true;
  }
  entry.count++;
  socketRates.set(socketId, entry);
  return entry.count <= limit;
}

/**
 * Broadcast sanitized, individualized state to each player in room.
 * Private hand of each player is ONLY sent to their own socket.
 */
function broadcastRoom(room: GameRoom) {
  for (const p of room.players) {
    if (p.socketId) {
      try {
        const privateView = roomManager.getPrivateView(room, p.id);
        io.to(p.socketId).emit('sync_state', privateView);
      } catch (err) {
        console.error(`Failed to broadcast to player ${p.id}:`, err);
      }
    }
  }
  for (const s of room.spectators || []) {
    if (s.socketId) {
      try {
        const privateView = roomManager.getPrivateView(room, s.id);
        io.to(s.socketId).emit('sync_state', privateView);
      } catch (err) {
        console.error(`Failed to broadcast to spectator ${s.id}:`, err);
      }
    }
  }
}

// Automatically broadcast to all sockets when a player's round timer expires
roomManager.setOnTurnTimeoutCallback((room) => {
  broadcastRoom(room);
});

io.on('connection', (socket: Socket) => {
  // Middleware check for rate limit
  socket.use((_packet, next) => {
    if (!checkRateLimit(socket.id)) {
      return next(new Error('Rate limit exceeded. Please slow down.'));
    }
    next();
  });

  /**
   * 1. Create Room
   */
  socket.on('create_room', (data: CreateRoomRequest, callback) => {
    try {
      if (!data || typeof data.playerName !== 'string') {
        throw new Error('Invalid player name.');
      }
      const { room, player, token } = roomManager.createRoom(
        data.playerName,
        data.avatar,
        socket.id
      );

      socket.join(room.code);
      broadcastRoom(room);

      if (typeof callback === 'function') {
        callback({
          success: true,
          roomCode: room.code,
          playerId: player.id,
          sessionToken: token,
        });
      }
    } catch (err: any) {
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  /**
   * 2. Join Room (as Player or Spectator)
   */
  socket.on('join_room', (data: JoinRoomRequest, callback) => {
    try {
      if (!data || !data.roomCode || typeof data.playerName !== 'string') {
        throw new Error('Missing room code or player name.');
      }

      const { room, player, token, isSpectator } = roomManager.joinRoom(
        data.roomCode,
        data.playerName,
        data.avatar,
        socket.id,
        data.isSpectator
      );

      socket.join(room.code);
      broadcastRoom(room);

      if (typeof callback === 'function') {
        callback({
          success: true,
          roomCode: room.code,
          playerId: player.id,
          sessionToken: token,
          isSpectator: !!isSpectator,
        });
      }
    } catch (err: any) {
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  /**
   * 3. Reconnect Session
   */
  socket.on('reconnect_session', (data: ReconnectSessionRequest, callback) => {
    try {
      if (!data || !data.roomCode || !data.sessionToken) {
        throw new Error('Missing roomCode or sessionToken.');
      }

      const { room, player, isSpectator } = roomManager.reconnect(
        data.roomCode,
        data.sessionToken,
        socket.id
      );

      socket.join(room.code);
      broadcastRoom(room);

      if (typeof callback === 'function') {
        callback({
          success: true,
          roomCode: room.code,
          playerId: player.id,
          isSpectator: !!isSpectator,
        });
      }
    } catch (err: any) {
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  /**
   * 4. Toggle Ready
   */
  socket.on('toggle_ready', (data: { roomCode: string }, callback) => {
    try {
      const sp = roomManager.getPlayerBySocket(socket.id);
      if (!sp || sp.room.code !== data.roomCode.toUpperCase()) {
        throw new Error('Player not in this room.');
      }
      roomManager.toggleReady(data.roomCode, sp.player.id);
      broadcastRoom(sp.room);
      if (typeof callback === 'function') callback({ success: true });
    } catch (err: any) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  /**
   * 5. Start Game (Host only)
   */
  socket.on('start_game', (data: { roomCode: string }, callback) => {
    try {
      const sp = roomManager.getPlayerBySocket(socket.id);
      if (!sp || sp.room.code !== data.roomCode.toUpperCase()) {
        throw new Error('Player not in this room.');
      }
      const room = roomManager.startGame(data.roomCode, sp.player.id);
      broadcastRoom(room);
      if (typeof callback === 'function') callback({ success: true });
    } catch (err: any) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  /**
   * 6. Play Card
   */
  socket.on('play_card', (data: PlayCardRequest & { roomCode: string }, callback) => {
    try {
      const sp = roomManager.getPlayerBySocket(socket.id);
      if (!sp || sp.room.code !== data.roomCode.toUpperCase()) {
        throw new Error('Player not in this room.');
      }

      const { notification } = roomManager.playCard(
        data.roomCode,
        sp.player.id,
        data.cardId,
        data.chosenColor
      );

      if (notification) {
        io.to(sp.room.code).emit('action_notification', notification);
      }

      broadcastRoom(sp.room);
      if (typeof callback === 'function') callback({ success: true });
    } catch (err: any) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  /**
   * 7. Choose Wild Color
   */
  socket.on('choose_color', (data: ChooseColorRequest & { roomCode: string }, callback) => {
    try {
      const sp = roomManager.getPlayerBySocket(socket.id);
      if (!sp || sp.room.code !== data.roomCode.toUpperCase()) {
        throw new Error('Player not in this room.');
      }

      const { notification } = roomManager.chooseColor(
        data.roomCode,
        sp.player.id,
        data.color
      );

      if (notification) {
        io.to(sp.room.code).emit('action_notification', notification);
      }

      broadcastRoom(sp.room);
      if (typeof callback === 'function') callback({ success: true });
    } catch (err: any) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  /**
   * 8. Draw Card
   */
  socket.on('draw_card', (data: { roomCode: string }, callback) => {
    try {
      const sp = roomManager.getPlayerBySocket(socket.id);
      if (!sp || sp.room.code !== data.roomCode.toUpperCase()) {
        throw new Error('Player not in this room.');
      }

      roomManager.drawCard(data.roomCode, sp.player.id);
      broadcastRoom(sp.room);
      if (typeof callback === 'function') callback({ success: true });
    } catch (err: any) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  /**
   * 9. Pass Turn
   */
  socket.on('pass_turn', (data: { roomCode: string }, callback) => {
    try {
      const sp = roomManager.getPlayerBySocket(socket.id);
      if (!sp || sp.room.code !== data.roomCode.toUpperCase()) {
        throw new Error('Player not in this room.');
      }

      roomManager.passTurn(data.roomCode, sp.player.id);
      broadcastRoom(sp.room);
      if (typeof callback === 'function') callback({ success: true });
    } catch (err: any) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  /**
   * 10. Declare UNO
   */
  socket.on('declare_uno', (data: { roomCode: string }, callback) => {
    try {
      const sp = roomManager.getPlayerBySocket(socket.id);
      if (!sp || sp.room.code !== data.roomCode.toUpperCase()) {
        throw new Error('Player not in this room.');
      }

      const { notification } = roomManager.declareUno(data.roomCode, sp.player.id);
      if (notification) {
        io.to(sp.room.code).emit('action_notification', notification);
      }
      broadcastRoom(sp.room);
      if (typeof callback === 'function') callback({ success: true });
    } catch (err: any) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  /**
   * 11. Catch UNO
   */
  socket.on('catch_uno', (data: CatchUnoRequest & { roomCode: string }, callback) => {
    try {
      const sp = roomManager.getPlayerBySocket(socket.id);
      if (!sp || sp.room.code !== data.roomCode.toUpperCase()) {
        throw new Error('Player not in this room.');
      }

      const { notification } = roomManager.catchUno(
        data.roomCode,
        sp.player.id,
        data.targetPlayerId
      );
      if (notification) {
        io.to(sp.room.code).emit('action_notification', notification);
      }
      broadcastRoom(sp.room);
      if (typeof callback === 'function') callback({ success: true });
    } catch (err: any) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  /**
   * 12. Request Rematch
   */
  socket.on('request_rematch', (data: { roomCode: string }, callback) => {
    try {
      const sp = roomManager.getPlayerBySocket(socket.id);
      if (!sp || sp.room.code !== data.roomCode.toUpperCase()) {
        throw new Error('Player not in this room.');
      }

      const room = roomManager.requestRematch(data.roomCode, sp.player.id);
      broadcastRoom(room);
      if (typeof callback === 'function') callback({ success: true });
    } catch (err: any) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  /**
   * 13. Leave Room
   */
  socket.on('leave_room', (data: { roomCode?: string }, callback) => {
    try {
      const code = data?.roomCode?.toUpperCase();
      let targetRoom: GameRoom | undefined = code ? roomManager.getRoom(code) : undefined;

      const sp = roomManager.getPlayerBySocket(socket.id);
      if (sp) {
        socket.leave(sp.room.code);
        const { roomDestroyed } = roomManager.leaveRoom(sp.room.code, sp.player.id);
        if (!roomDestroyed) {
          broadcastRoom(sp.room);
        }
      } else if (targetRoom && targetRoom.spectators) {
        const spec = targetRoom.spectators.find(s => s.socketId === socket.id);
        if (spec) {
          socket.leave(targetRoom.code);
          roomManager.leaveRoom(targetRoom.code, spec.id);
          broadcastRoom(targetRoom);
        }
      }
      if (typeof callback === 'function') callback({ success: true });
    } catch (err: any) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  /**
   * 14. Send In-Game Emote Reaction
   */
  socket.on('send_emote', (data: SendEmoteRequest & { roomCode: string }, callback) => {
    try {
      if (!data || !data.roomCode || !data.emote || !isValidEmote(data.emote)) {
        throw new Error('Invalid emote reaction.');
      }

      const room = roomManager.getRoom(data.roomCode);
      if (!room) throw new Error('Room not found.');

      // Check if player or spectator
      const player = room.players.find(p => p.socketId === socket.id);
      const spectator = (room.spectators || []).find(s => s.socketId === socket.id);

      if (!player && !spectator) {
        throw new Error('Sender not in this room.');
      }

      const senderId = player ? player.id : spectator!.id;
      const senderName = player ? player.name : spectator!.name;
      const isSpectator = !player;

      const emotePayload: EmotePayload = {
        id: `em-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        playerId: senderId,
        playerName: senderName,
        emote: data.emote.trim(),
        timestamp: Date.now(),
        isSpectator,
      };

      io.to(room.code).emit('player_emote', emotePayload);
      if (typeof callback === 'function') callback({ success: true, emote: emotePayload });
    } catch (err: any) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  /**
   * 15. Socket Disconnect
   */
  socket.on('disconnect', () => {
    const disconnected = roomManager.handleDisconnect(socket.id);
    if (disconnected) {
      broadcastRoom(disconnected.room);
    }
    socketRates.delete(socket.id);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Authoritative UNO Multiplayer Server listening on ${HOST}:${PORT}`);
});
