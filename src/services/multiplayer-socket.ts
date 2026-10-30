import { io, Socket } from 'socket.io-client';
import {
  PlayerPrivateView,
  ActionNotificationPayload,
  CreateRoomRequest,
  JoinRoomRequest,
  PlayCardRequest,
  ChooseColorRequest,
  CatchUnoRequest,
} from '../types/multiplayer';

export class MultiplayerSocketService {
  private socket: Socket | null = null;
  private serverUrl: string;

  constructor() {
    const envUrl = import.meta.env.VITE_SERVER_URL;

    if (envUrl && envUrl.trim() !== '') {
      let clean = envUrl.trim().replace(/\/+$/, '');
      // Ensure automatic HTTPS/WSS upgrade when frontend is served over HTTPS
      if (typeof window !== 'undefined' && window.location.protocol === 'https:' && clean.startsWith('http://')) {
        clean = clean.replace(/^http:\/\//, 'https://');
      }
      this.serverUrl = clean;
    } else if (import.meta.env.PROD) {
      // In production without VITE_SERVER_URL, do NOT fallback to localhost
      // Default to same-origin (if deployed behind reverse proxy)
      this.serverUrl = typeof window !== 'undefined' ? window.location.origin : '';
      if (!this.serverUrl) {
        console.warn('⚠️ VITE_SERVER_URL is not set in production. Multiplayer backend connection may fail.');
      }
    } else if (typeof window !== 'undefined') {
      const hostname = window.location.hostname || 'localhost';
      this.serverUrl = `http://${hostname}:4000`;
    } else {
      this.serverUrl = 'http://localhost:4000';
    }
  }

  public connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (!this.socket) {
      const isSecure = this.serverUrl.startsWith('https://') ||
        (typeof window !== 'undefined' && window.location.protocol === 'https:');

      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        secure: isSecure,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
    } else {
      this.socket.connect();
    }

    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public isConnected(): boolean {
    return !!this.socket?.connected;
  }

  // --- Session Storage Helpers ---
  public saveSession(roomCode: string, playerId: string, sessionToken: string): void {
    try {
      sessionStorage.setItem('uno_room_code', roomCode);
      sessionStorage.setItem('uno_player_id', playerId);
      sessionStorage.setItem('uno_session_token', sessionToken);
    } catch (_) {}
  }

  public getSavedSession(): { roomCode: string | null; playerId: string | null; sessionToken: string | null } {
    try {
      return {
        roomCode: sessionStorage.getItem('uno_room_code'),
        playerId: sessionStorage.getItem('uno_player_id'),
        sessionToken: sessionStorage.getItem('uno_session_token'),
      };
    } catch (_) {
      return { roomCode: null, playerId: null, sessionToken: null };
    }
  }

  public clearSession(): void {
    try {
      sessionStorage.removeItem('uno_room_code');
      sessionStorage.removeItem('uno_player_id');
      sessionStorage.removeItem('uno_session_token');
    } catch (_) {}
  }

  // --- API Promises ---
  public async createRoom(request: CreateRoomRequest): Promise<{
    roomCode: string;
    playerId: string;
    sessionToken: string;
  }> {
    const s = this.connect();
    return new Promise((resolve, reject) => {
      s.emit('create_room', request, (res: any) => {
        if (res && res.success) {
          this.saveSession(res.roomCode, res.playerId, res.sessionToken);
          resolve(res);
        } else {
          reject(new Error(res?.error || 'Failed to create room.'));
        }
      });
    });
  }

  public async joinRoom(request: JoinRoomRequest): Promise<{
    roomCode: string;
    playerId: string;
    sessionToken: string;
  }> {
    const s = this.connect();
    return new Promise((resolve, reject) => {
      s.emit('join_room', request, (res: any) => {
        if (res && res.success) {
          this.saveSession(res.roomCode, res.playerId, res.sessionToken);
          resolve(res);
        } else {
          reject(new Error(res?.error || 'Failed to join room.'));
        }
      });
    });
  }

  public async reconnectSession(roomCode: string, sessionToken: string): Promise<{
    roomCode: string;
    playerId: string;
  }> {
    const s = this.connect();
    return new Promise((resolve, reject) => {
      s.emit('reconnect_session', { roomCode, sessionToken }, (res: any) => {
        if (res && res.success) {
          resolve(res);
        } else {
          reject(new Error(res?.error || 'Failed to reconnect.'));
        }
      });
    });
  }

  public toggleReady(roomCode: string): void {
    this.socket?.emit('toggle_ready', { roomCode });
  }

  public startGame(roomCode: string): void {
    this.socket?.emit('start_game', { roomCode });
  }

  public playCard(roomCode: string, cardId: string, chosenColor?: any): void {
    const req: PlayCardRequest & { roomCode: string } = { roomCode, cardId, chosenColor };
    this.socket?.emit('play_card', req);
  }

  public chooseColor(roomCode: string, color: any): void {
    const req: ChooseColorRequest & { roomCode: string } = { roomCode, color };
    this.socket?.emit('choose_color', req);
  }

  public drawCard(roomCode: string): void {
    this.socket?.emit('draw_card', { roomCode });
  }

  public passTurn(roomCode: string): void {
    this.socket?.emit('pass_turn', { roomCode });
  }

  public declareUno(roomCode: string): void {
    this.socket?.emit('declare_uno', { roomCode });
  }

  public catchUno(roomCode: string, targetPlayerId: string): void {
    const req: CatchUnoRequest & { roomCode: string } = { roomCode, targetPlayerId };
    this.socket?.emit('catch_uno', req);
  }

  public requestRematch(roomCode: string): void {
    this.socket?.emit('request_rematch', { roomCode });
  }

  public leaveRoom(roomCode: string): void {
    this.socket?.emit('leave_room', { roomCode });
    this.clearSession();
  }

  // --- Subscriptions ---
  public onSyncState(callback: (view: PlayerPrivateView) => void): () => void {
    const s = this.connect();
    s.on('sync_state', callback);
    return () => s.off('sync_state', callback);
  }

  public onActionNotification(callback: (notif: ActionNotificationPayload) => void): () => void {
    const s = this.connect();
    s.on('action_notification', callback);
    return () => s.off('action_notification', callback);
  }
}

export const multiplayerService = new MultiplayerSocketService();
