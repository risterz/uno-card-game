import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CardDefinition, CardColor } from '../../types/card';
import { Card } from '../Card';
import { CardBack } from '../CardBack';
import { multiplayerService } from '../../services/multiplayer-socket';
import { PlayerPrivateView, ActionNotificationPayload } from '../../types/multiplayer';
import { isCardPlayable } from '../../engine/rules';
import { ActionEffects } from '../game/ActionEffects';
import { VictoryCelebration } from '../game/VictoryCelebration';
import {
  modalBackdropVariants,
  modalDialogVariants,
} from '../../motion/motion-config';
import {
  LogOut,
  Play,
  RotateCw,
  PlusCircle,
  CheckCircle2,
  Users,
} from 'lucide-react';
import '../../styles/game.css';
import '../../styles/animations.css';
import '../../styles/multiplayer.css';

interface MultiplayerGameBoardProps {
  view: PlayerPrivateView;
  notification: ActionNotificationPayload | null;
  onLeaveRoom: () => void;
}

export const MultiplayerGameBoard: React.FC<MultiplayerGameBoardProps> = ({
  view,
  notification,
  onLeaveRoom,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const publicState = view.publicState;
  const myPlayerId = view.myPlayerId;
  const roomCode = publicState.roomCode;

  // Active player in turn
  const currentPlayer = publicState.players[publicState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === myPlayerId && publicState.status !== 'game_over';

  // Opponents list (all other players)
  const opponents = useMemo(() => {
    return publicState.players.filter(p => p.id !== myPlayerId);
  }, [publicState.players, myPlayerId]);

  // Me in room
  const me = useMemo(() => {
    return publicState.players.find(p => p.id === myPlayerId);
  }, [publicState.players, myPlayerId]);

  // Calculate playability of each card in my hand
  const topDiscard = publicState.topDiscard;
  const activeColor = publicState.activeColor;

  const playableCardIds = useMemo(() => {
    if (!isMyTurn || !topDiscard) return new Set<string>();
    const playable = view.myHand.filter(card =>
      isCardPlayable(card, topDiscard, activeColor)
    );
    return new Set(playable.map(c => c.id));
  }, [isMyTurn, view.myHand, topDiscard, activeColor]);

  // Selected card
  const selectedCard = useMemo(() => {
    if (!selectedCardId) return null;
    return view.myHand.find(c => c.id === selectedCardId) || null;
  }, [selectedCardId, view.myHand]);

  // Handle Play Card
  const handlePlayCard = useCallback(
    (card: CardDefinition) => {
      if (!isMyTurn) return;
      if (!playableCardIds.has(card.id)) return;

      const isWild =
        card.color === 'wild' ||
        card.value === 'wild' ||
        card.value === 'wild_draw4';

      if (isWild) {
        // Trigger server awaiting_color_choice
        multiplayerService.playCard(roomCode, card.id);
      } else {
        multiplayerService.playCard(roomCode, card.id);
      }
      setSelectedCardId(null);
    },
    [isMyTurn, playableCardIds, roomCode]
  );

  // Handle Color Choice
  const handleColorChoice = (color: CardColor) => {
    multiplayerService.chooseColor(roomCode, color);
  };

  // Handle Draw Card
  const handleDrawCard = () => {
    if (!isMyTurn) return;
    multiplayerService.drawCard(roomCode);
  };

  // Handle Pass Turn
  const handlePassTurn = () => {
    if (!isMyTurn) return;
    multiplayerService.passTurn(roomCode);
  };

  // Handle Declare UNO
  const handleDeclareUno = () => {
    multiplayerService.declareUno(roomCode);
  };

  // Handle Catch UNO
  const handleCatchUno = (targetPlayerId: string) => {
    multiplayerService.catchUno(roomCode, targetPlayerId);
  };

  // Handle Card Click
  const handleCardClick = (card: CardDefinition, isPlayable: boolean) => {
    if (!isMyTurn) {
      setSelectedCardId(prev => (prev === card.id ? null : card.id));
      return;
    }

    if (isPlayable) {
      if (selectedCardId === card.id) {
        handlePlayCard(card);
      } else {
        setSelectedCardId(card.id);
      }
    } else {
      setSelectedCardId(prev => (prev === card.id ? null : card.id));
    }
  };

  // Dynamic overlap for hand
  const handCount = view.myHand.length;
  const calculatedOverlap = useMemo(() => {
    if (handCount <= 1) return 0;
    if (handCount <= 7) return -12;
    if (handCount <= 13) return -28;
    return -42;
  }, [handCount]);

  // Color background helper
  const getGlowColor = (c: CardColor) => {
    switch (c) {
      case 'red':
        return '#E61938';
      case 'blue':
        return '#0066E5';
      case 'green':
        return '#00A852';
      case 'yellow':
        return '#F5A600';
      default:
        return '#38BDF8';
    }
  };

  return (
    <div className="game-container">
      {/* Action Effects Floating Toast Banner */}
      <ActionEffects
        notification={
          notification
            ? {
                id: `multi-toast-${Date.now()}`,
                type: (notification.type === 'caught_uno' ? 'caught' : notification.type) as any,
                createdAt: Date.now(),
                duration: 1600,
                sourcePlayerName: notification.sourcePlayerName,
                targetPlayerName: notification.targetPlayerName,
                chosenColor: notification.chosenColor,
              }
            : null
        }
        reducedMotion={false}
      />

      {/* Victory Celebration upon Game Over */}
      {publicState.status === 'game_over' && publicState.winner && (
        <VictoryCelebration
          winner={{
            id: publicState.winner.id,
            name: publicState.winner.name,
            avatar: publicState.winner.avatar,
            isAI: false,
            hand: [],
            unoDeclared: false,
          }}
          players={publicState.players.map(p => ({
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            isAI: false,
            hand: [],
            unoDeclared: p.unoDeclared,
          }))}
          settings={{
            playerCount: publicState.players.length,
            gameMode: 'pass_and_play',
            aiDifficulty: 'medium',
          }}
          onRestart={() => multiplayerService.requestRematch(roomCode)}
          onOpenSettings={onLeaveRoom}
          reducedMotion={false}
        />
      )}

      {/* Top Header Controls Bar */}
      <div className="game-header-bar">
        <div className="game-status-indicators">
          <span
            className="room-action-pill"
            style={{ fontWeight: 700 }}
            title="Room Code"
          >
            <Users size={13} /> Room: {roomCode}
          </span>
          <span className="turn-counter-badge">
            Turn {publicState.turnCount || 1}
          </span>
          <span
            className="difficulty-badge"
            style={{
              borderColor: 'rgba(56, 189, 248, 0.4)',
              color: '#38BDF8',
              background: 'rgba(56, 189, 248, 0.1)',
            }}
          >
            Live Online Match
          </span>
        </div>

        <div className="game-controls-group">
          <button
            className="game-btn danger"
            onClick={onLeaveRoom}
            title="Leave Multiplayer Game"
          >
            <LogOut size={14} /> Leave
          </button>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="game-board-surface">
        {/* Opponents Section */}
        <div className="online-opponents-row">
          {opponents.map(opp => {
            const isOppTurn = opp.id === currentPlayer?.id;
            const canCatch = opp.cardCount === 1 && !opp.unoDeclared;

            return (
              <div
                key={opp.id}
                className={`online-opponent-card ${isOppTurn ? 'is-turn' : ''}`}
              >
                <div className="online-opponent-header">
                  <span>{opp.avatar}</span>
                  <span>{opp.name}</span>
                  <span
                    className={`connection-indicator ${opp.isConnected ? '' : 'disconnected'}`}
                    title={opp.isConnected ? 'Connected' : 'Disconnected'}
                  />
                </div>

                <div className="online-opponent-fan">
                  {Array.from({ length: Math.min(opp.cardCount, 8) }).map((_, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginLeft: idx === 0 ? 0 : -18,
                        transform: `rotate(${(idx - Math.min(opp.cardCount, 8) / 2) * 4}deg)`,
                      }}
                    >
                      <CardBack size="sm" />
                    </div>
                  ))}
                  {opp.cardCount > 8 && (
                    <span style={{ fontSize: '11px', color: '#94A3B8', marginLeft: 4 }}>
                      +{opp.cardCount - 8}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                  {opp.cardCount} {opp.cardCount === 1 ? 'card' : 'cards'}
                </div>

                {opp.unoDeclared && opp.cardCount <= 2 && (
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#F5A600',
                      fontWeight: 700,
                      marginTop: 2,
                    }}
                  >
                    📢 UNO!
                  </span>
                )}

                {canCatch && (
                  <button
                    className="catch-uno-btn"
                    onClick={() => handleCatchUno(opp.id)}
                    title="Catch opponent for forgetting to declare UNO!"
                  >
                    🚨 CATCH UNO!
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Center Piles Area */}
        <div className="center-piles-area">
          {/* Draw Pile */}
          <div
            className={`pile-card-wrapper draw-pile-card ${isMyTurn ? 'pulse-playable' : ''}`}
            onClick={handleDrawCard}
            title={isMyTurn ? 'Click to draw 1 card' : 'Waiting for your turn'}
            data-testid="online-draw-pile"
          >
            <CardBack size="lg" />
            <span className="deck-counter">{publicState.drawPileCount}</span>
          </div>

          {/* Direction Indicator */}
          <div
            className={`direction-ring ${publicState.direction === 1 ? 'cw' : 'ccw'}`}
            style={{
              borderColor: getGlowColor(publicState.activeColor),
              boxShadow: `0 0 24px ${getGlowColor(publicState.activeColor)}33`,
            }}
          >
            <RotateCw size={28} style={{ color: getGlowColor(publicState.activeColor) }} />
            <span
              className="active-color-name"
              style={{ color: getGlowColor(publicState.activeColor) }}
            >
              {publicState.activeColor.toUpperCase()}
            </span>
          </div>

          {/* Discard Pile */}
          <div
            id="discard-pile-target"
            className="pile-card-wrapper discard-pile-card"
          >
            {topDiscard ? (
              <Card card={topDiscard} size="lg" />
            ) : (
              <CardBack size="lg" />
            )}
            <span className="discard-counter">
              {publicState.discardPileCount}
            </span>
          </div>
        </div>

        {/* Action message banner */}
        <div className="action-announcement-banner">
          <span>{publicState.lastActionMessage}</span>
        </div>

        {/* Human Hand Section */}
        <div className="human-hand-section">
          <div
            className={`hand-toolbar ${isMyTurn ? 'active-turn-toolbar' : ''}`}
          >
            {/* Left: Player Profile & Turn Indicator */}
            <div className="hand-player-info">
              <span className="opponent-avatar">{me?.avatar || '👑'}</span>
              <span className="player-name-tag">
                {me?.name} ({view.myHand.length} cards)
              </span>
              {isMyTurn && <span className="turn-pill">Your Turn</span>}
            </div>

            {/* Center: Contextual Action Controls */}
            <div className="hand-center-actions">
              {/* Drawn Card Decision Controls */}
              {isMyTurn &&
                publicState.gameStatus === 'drawn_card_decision' &&
                view.drawnCard && (
                  <div className="drawn-decision-bar">
                    <span>
                      Drawn: <strong>{view.drawnCard.name}</strong>
                    </span>
                    {playableCardIds.has(view.drawnCard.id) && (
                      <button
                        className="game-btn primary"
                        onClick={() => handlePlayCard(view.drawnCard!)}
                      >
                        <Play size={14} /> Play Drawn Card
                      </button>
                    )}
                    <button className="game-btn" onClick={handlePassTurn}>
                      Pass Turn
                    </button>
                  </div>
                )}

              {/* Normal Turn Actions */}
              {isMyTurn && publicState.gameStatus === 'playing' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="game-btn draw-btn"
                    onClick={handleDrawCard}
                    title="Draw 1 card from the draw pile"
                    data-testid="online-draw-btn"
                  >
                    <PlusCircle size={14} /> Draw Card
                  </button>
                  {selectedCard && playableCardIds.has(selectedCard.id) && (
                    <button
                      className="game-btn primary"
                      onClick={() => handlePlayCard(selectedCard)}
                      title={`Play selected ${selectedCard.name}`}
                      data-testid="online-play-btn"
                    >
                      <Play size={14} /> Play {selectedCard.name}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right: UNO Shout Button */}
            <div className="hand-right-actions">
              <button
                className={`uno-shout-btn ${me?.unoDeclared ? 'declared' : ''} ${view.myHand.length <= 2 && !me?.unoDeclared ? 'pulse-ready' : ''}`}
                onClick={handleDeclareUno}
                disabled={me?.unoDeclared || view.myHand.length > 2}
                title="Shout UNO when holding 2 or 1 cards"
                data-testid="online-uno-btn"
              >
                {me?.unoDeclared ? (
                  <>
                    <CheckCircle2 size={14} /> UNO CALLED!
                  </>
                ) : (
                  <>📢 SHOUT UNO!</>
                )}
              </button>
            </div>
          </div>

          {/* Human Hand Cards Container */}
          <div
            id="human-hand-container"
            className="hand-cards-container"
            style={
              {
                '--hand-card-overlap': `${calculatedOverlap}px`,
              } as React.CSSProperties
            }
          >
            {view.myHand.map((card, idx) => {
              const isPlayable = isMyTurn && playableCardIds.has(card.id);
              const isSelected = selectedCardId === card.id;

              return (
                <div
                  key={card.id}
                  id={`online-hand-card-${card.id}`}
                  className={`hand-card-wrapper ${isPlayable ? 'is-playable' : 'not-playable'} ${isSelected ? 'is-selected' : ''}`}
                  style={{ zIndex: isSelected ? 150 : idx + 1 }}
                  onClick={() => handleCardClick(card, isPlayable)}
                  title={`${card.name} - ${isPlayable ? (isSelected ? 'Click again to play' : 'Click to select / play') : 'Cannot play on active color or top card'}`}
                  data-testid={`card-${card.id}`}
                >
                  {isPlayable && <span className="playable-dot" />}
                  <Card
                    card={card}
                    size="hand"
                    selected={isSelected}
                    interactive={isPlayable}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Wild Color Selection Modal */}
      <AnimatePresence>
        {publicState.gameStatus === 'awaiting_color_choice' && isMyTurn && (
          <motion.div
            className="color-choice-modal"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="color-choice-content"
              variants={modalDialogVariants}
            >
              <h3>Wild Card Played!</h3>
              <p>Select the next active color for the game table:</p>
              <div className="color-grid">
                {(['red', 'blue', 'green', 'yellow'] as CardColor[]).map(color => (
                  <button
                    key={color}
                    className={`color-btn ${color}`}
                    onClick={() => handleColorChoice(color)}
                    data-testid={`wild-color-${color}`}
                  >
                    {color.toUpperCase()}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
