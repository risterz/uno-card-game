import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Copy,
  Check,
  Share2,
  Play,
  LogOut,
  Crown,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { multiplayerService } from '../../services/multiplayer-socket';
import { PlayerPrivateView } from '../../types/multiplayer';

interface OnlineLobbyProps {
  currentView: PlayerPrivateView | null;
  onGameStarted: () => void;
  initialRoomCode?: string;
}

const AVATARS = ['👑', '🦊', '🐼', '🐯', '🚀', '🐱', '🐶', '🦄'];

export const OnlineLobby: React.FC<OnlineLobbyProps> = ({
  currentView,
  initialRoomCode = '',
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('uno_player_name') || 'Player 1';
  });
  const [roomCodeInput, setRoomCodeInput] = useState(initialRoomCode);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // If initialRoomCode is provided in URL, switch to join tab
  useEffect(() => {
    if (initialRoomCode) {
      setRoomCodeInput(initialRoomCode.toUpperCase());
      setTab('join');
    }
  }, [initialRoomCode]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Please enter your name.');
      return;
    }
    setError(null);
    setLoading(true);
    localStorage.setItem('uno_player_name', playerName.trim());

    try {
      await multiplayerService.createRoom({
        playerName: playerName.trim(),
        avatar: selectedAvatar,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create room.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!roomCodeInput.trim()) {
      setError('Please enter the 6-character room code.');
      return;
    }
    setError(null);
    setLoading(true);
    localStorage.setItem('uno_player_name', playerName.trim());

    try {
      await multiplayerService.joinRoom({
        roomCode: roomCodeInput.trim().toUpperCase(),
        playerName: playerName.trim(),
        avatar: selectedAvatar,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to join room.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyInviteLink = (code: string) => {
    const url = `${window.location.origin}${window.location.pathname}?room=${code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStartGame = () => {
    if (!currentView) return;
    multiplayerService.startGame(currentView.publicState.roomCode);
  };

  const handleToggleReady = () => {
    if (!currentView) return;
    multiplayerService.toggleReady(currentView.publicState.roomCode);
  };

  const handleLeaveRoom = () => {
    if (!currentView) return;
    multiplayerService.leaveRoom(currentView.publicState.roomCode);
  };

  // If in an active room lobby
  if (currentView && currentView.publicState.status === 'lobby') {
    const room = currentView.publicState;
    const me = room.players.find(p => p.id === currentView.myPlayerId);
    const isHost = me?.isHost;
    const canStart = isHost && room.players.length >= 2;

    return (
      <div className="multiplayer-container">
        <motion.div
          className="lobby-card"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="lobby-header">
            <span className="slot-tag you">Online Lobby</span>
            <h2 className="lobby-title">Room {room.roomCode}</h2>
            <p className="lobby-subtitle">
              Waiting for players ({room.players.length}/4 seats filled)
            </p>
          </div>

          {/* Room Code & Invite Link Banner */}
          <div className="room-code-banner">
            <span className="room-code-label">Room Invitation Code</span>
            <span className="room-code-value">{room.roomCode}</span>
            <div className="room-code-actions">
              <button
                className="room-action-pill"
                onClick={() => handleCopyCode(room.roomCode)}
                title="Copy Room Code"
              >
                {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                {copiedCode ? 'Copied Code!' : 'Copy Code'}
              </button>
              <button
                className="room-action-pill"
                onClick={() => handleCopyInviteLink(room.roomCode)}
                title="Copy Shareable Link"
              >
                {copiedLink ? <Check size={12} /> : <Share2 size={12} />}
                {copiedLink ? 'Copied Link!' : 'Share Link'}
              </button>
            </div>
          </div>

          {/* Player Roster */}
          <div className="player-roster">
            {room.players.map(player => {
              const isPlayerMe = player.id === currentView.myPlayerId;
              return (
                <div
                  key={player.id}
                  className={`player-slot ${isPlayerMe ? 'is-me' : ''}`}
                >
                  <div className="slot-left">
                    <span className="slot-avatar">{player.avatar}</span>
                    <span className="slot-name">
                      {player.name}
                      {player.isHost && (
                        <span className="slot-tag host" title="Room Host">
                          <Crown size={10} style={{ display: 'inline', marginRight: 3 }} />
                          Host
                        </span>
                      )}
                      {isPlayerMe && <span className="slot-tag you">You</span>}
                    </span>
                  </div>
                  <div className="slot-right">
                    <span
                      className={`connection-indicator ${player.isConnected ? '' : 'disconnected'}`}
                      title={player.isConnected ? 'Connected' : 'Disconnected'}
                    />
                    <span
                      style={{
                        fontSize: '11px',
                        color: player.isReady ? '#10B981' : '#94A3B8',
                        fontWeight: 600,
                      }}
                    >
                      {player.isHost ? 'Host' : player.isReady ? 'Ready' : 'Not Ready'}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Empty available seats */}
            {Array.from({ length: 4 - room.players.length }).map((_, idx) => (
              <div key={`empty-${idx}`} className="player-slot empty-slot">
                <span>Waiting for player... ({room.players.length + idx + 1}/4)</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isHost ? (
              <button
                className="lobby-btn primary"
                onClick={handleStartGame}
                disabled={!canStart}
                title={
                  room.players.length < 2
                    ? 'Need at least 2 players to start match'
                    : 'Start Match'
                }
                data-testid="start-match-btn"
              >
                <Play size={16} />
                {room.players.length < 2
                  ? 'Waiting for at least 1 more player...'
                  : `Start Match (${room.players.length} Players)`}
              </button>
            ) : (
              <button
                className={`lobby-btn ${me?.isReady ? 'secondary' : 'primary'}`}
                onClick={handleToggleReady}
              >
                {me?.isReady ? 'Cancel Ready' : 'Ready to Play'}
              </button>
            )}

            <button
              className="lobby-btn danger"
              onClick={handleLeaveRoom}
              title="Leave Room"
            >
              <LogOut size={15} /> Leave Room
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Pre-room Screen (Create or Join)
  return (
    <div className="multiplayer-container">
      <motion.div
        className="lobby-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="lobby-header">
          <div
            style={{
              display: 'inline-flex',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#38BDF8',
              fontSize: '12px',
              fontWeight: 600,
              gap: '6px',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <Users size={14} /> Real-Time Multiplayer
          </div>
          <h2 className="lobby-title">Play UNO Online</h2>
          <p className="lobby-subtitle">
            Play with friends across devices with real-time authoritative synchronization.
          </p>
        </div>

        {error && (
          <div className="lobby-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Create vs Join Tabs */}
        <div className="lobby-mode-tabs">
          <button
            className={`lobby-mode-tab ${tab === 'create' ? 'active' : ''}`}
            onClick={() => {
              setTab('create');
              setError(null);
            }}
            type="button"
          >
            Create New Room
          </button>
          <button
            className={`lobby-mode-tab ${tab === 'join' ? 'active' : ''}`}
            onClick={() => {
              setTab('join');
              setError(null);
            }}
            type="button"
          >
            Join with Code
          </button>
        </div>

        {/* Tab 1: Create Room */}
        {tab === 'create' && (
          <form onSubmit={handleCreateRoom}>
            <div className="lobby-form-group">
              <label className="lobby-label">Your Nickname</label>
              <input
                type="text"
                className="lobby-input"
                placeholder="Enter player name"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                maxLength={20}
                required
                data-testid="create-player-name-input"
              />
            </div>

            <div className="lobby-form-group">
              <label className="lobby-label">Choose Avatar</label>
              <div className="avatar-picker">
                {AVATARS.map(avatar => (
                  <button
                    key={avatar}
                    type="button"
                    className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar(avatar)}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="lobby-btn primary"
              disabled={loading || !playerName.trim()}
              data-testid="create-room-btn"
            >
              {loading ? (
                'Creating Room...'
              ) : (
                <>
                  <Sparkles size={16} /> Create Room (Host)
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 2: Join Room */}
        {tab === 'join' && (
          <form onSubmit={handleJoinRoom}>
            <div className="lobby-form-group">
              <label className="lobby-label">Room Code (6 Characters)</label>
              <input
                type="text"
                className="lobby-input room-code-input"
                placeholder="ABC123"
                value={roomCodeInput}
                onChange={e => setRoomCodeInput(e.target.value.toUpperCase())}
                maxLength={6}
                required
                data-testid="join-room-code-input"
              />
            </div>

            <div className="lobby-form-group">
              <label className="lobby-label">Your Nickname</label>
              <input
                type="text"
                className="lobby-input"
                placeholder="Enter player name"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                maxLength={20}
                required
                data-testid="join-player-name-input"
              />
            </div>

            <div className="lobby-form-group">
              <label className="lobby-label">Choose Avatar</label>
              <div className="avatar-picker">
                {AVATARS.map(avatar => (
                  <button
                    key={avatar}
                    type="button"
                    className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar(avatar)}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="lobby-btn primary"
              disabled={loading || !playerName.trim() || roomCodeInput.trim().length < 4}
              data-testid="join-room-submit-btn"
            >
              {loading ? (
                'Joining Room...'
              ) : (
                <>
                  <Users size={16} /> Join Game Room
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
