import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CardDefinition, CardColor } from '../../types/card';
import { Card } from '../Card';
import { CardBack } from '../CardBack';
import { multiplayerService } from '../../services/multiplayer-socket';
import { PlayerPrivateView, ActionNotificationPayload, PublicGameState } from '../../types/multiplayer';
import { isCardPlayable } from '../../engine/rules';
import { ActionEffects } from '../game/ActionEffects';
import { VictoryCelebration } from '../game/VictoryCelebration';
import { CardFlightLayer, FlightItem } from '../game/CardFlightLayer';
import { useAnimationSettings } from '../../utils/animation-settings';
import { playSound, preloadSounds, SoundEffect } from '../../utils/audio';
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
  Sparkles,
  Crown,
  Zap,
  ZapOff,
  Volume2,
  VolumeX,
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
  const [discardLanded, setDiscardLanded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Shared animation settings (Full, Reduced, Off)
  const [animationIntensity, , cycleAnimationIntensity] = useAnimationSettings();

  // Active flight animations and hidden cards during flight
  const [flights, setFlights] = useState<FlightItem[]>([]);
  const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(new Set());
  const isCardInFlightRef = useRef(false);

  // Preload sound effects on mount
  useEffect(() => {
    preloadSounds();
  }, []);

  const playSfx = useCallback(
    (type: SoundEffect) => {
      playSound(type, soundEnabled);
    },
    [soundEnabled]
  );

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

  // Top discard and active color
  const topDiscard = publicState.topDiscard;
  const activeColor = publicState.activeColor;

  // Safe measurement helper with viewport fallback
  const getElementRect = (
    id: string,
    fallback: { x: number; y: number; width: number; height: number }
  ) => {
    if (typeof document === 'undefined') return fallback;
    const el = document.getElementById(id);
    if (!el) return fallback;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  };

  // Trigger flight item helper
  const triggerFlight = useCallback(
    (params: {
      type: 'play' | 'draw';
      card?: CardDefinition;
      fromRect: { x: number; y: number; width: number; height: number };
      toRect: { x: number; y: number; width: number; height: number };
      startRotation?: number;
      endRotation?: number;
      faceDown?: boolean;
      onComplete?: () => void;
    }) => {
      if (animationIntensity === 'off') {
        params.onComplete?.();
        return;
      }

      const flightId = `flight-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const item: FlightItem = {
        id: flightId,
        type: params.type,
        card: params.card,
        fromRect: params.fromRect,
        toRect: params.toRect,
        startRotation: params.startRotation,
        endRotation: params.endRotation,
        faceDown: params.faceDown,
        onComplete: () => {
          setFlights(prev => prev.filter(f => f.id !== flightId));
          params.onComplete?.();
        },
      };

      setFlights(prev => [...prev, item]);
    },
    [animationIntensity]
  );

  // Playable card IDs in my hand
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

  // Track state transitions to animate opponent plays and card draws
  const prevPublicStateRef = useRef<PublicGameState | null>(null);
  const prevMyHandCountRef = useRef<number>(view.myHand.length);

  useEffect(() => {
    const prevState = prevPublicStateRef.current;
    if (prevState && animationIntensity !== 'off') {
      const oldTopDiscard = prevState.topDiscard;
      const newTopDiscard = publicState.topDiscard;

      // 1. Detect Opponent Playing a Card
      if (newTopDiscard && newTopDiscard.id !== oldTopDiscard?.id) {
        const lastMover = prevState.players[prevState.currentPlayerIndex];
        // If an opponent played this card
        if (lastMover && lastMover.id !== myPlayerId) {
          const fromRect = getElementRect(`opponent-pod-${lastMover.id}`, {
            x: window.innerWidth / 2 - 50,
            y: 70,
            width: 110,
            height: 80,
          });

          const toRect = getElementRect('discard-pile-target', {
            x: window.innerWidth / 2 + 50,
            y: window.innerHeight / 2 - 84,
            width: 120,
            height: 168,
          });

          triggerFlight({
            type: 'play',
            faceDown: true, // Never reveal hidden card face in flight
            fromRect,
            toRect,
            startRotation: -12,
            endRotation: (Math.random() - 0.5) * 12,
            onComplete: () => {
              setDiscardLanded(true);
              setTimeout(() => setDiscardLanded(false), 450);
              playSfx(newTopDiscard.color === 'wild' ? 'wild' : 'card');
            },
          });
        }
      }

      // 2. Detect My Drawn Cards (Single draw or multi-card penalty like +2, +4)
      const myDiff = view.myHand.length - prevMyHandCountRef.current;
      if (myDiff > 0) {
        const drawRect = getElementRect('draw-pile-target', {
          x: window.innerWidth / 2 - 170,
          y: window.innerHeight / 2 - 84,
          width: 120,
          height: 168,
        });

        const handRect = getElementRect('human-hand-container', {
          x: window.innerWidth / 2 - 52,
          y: window.innerHeight - 150,
          width: 104,
          height: 145.6,
        });

        for (let i = 0; i < myDiff; i++) {
          setTimeout(() => {
            triggerFlight({
              type: 'draw',
              faceDown: true,
              fromRect: drawRect,
              toRect: handRect,
              startRotation: 0,
              endRotation: (Math.random() - 0.5) * 12,
              onComplete: () => {
                playSfx('draw');
              },
            });
          }, i * 120);
        }
      }

      // 3. Detect Opponent Drawn Cards
      opponents.forEach(opp => {
        const prevOpp = prevState.players.find(p => p.id === opp.id);
        const oppDiff = opp.cardCount - (prevOpp ? prevOpp.cardCount : opp.cardCount);
        if (oppDiff > 0) {
          const drawRect = getElementRect('draw-pile-target', {
            x: window.innerWidth / 2 - 170,
            y: window.innerHeight / 2 - 84,
            width: 120,
            height: 168,
          });

          const oppRect = getElementRect(`opponent-pod-${opp.id}`, {
            x: window.innerWidth / 2 - 50,
            y: 70,
            width: 110,
            height: 80,
          });

          for (let i = 0; i < Math.min(oppDiff, 4); i++) {
            setTimeout(() => {
              triggerFlight({
                type: 'draw',
                faceDown: true,
                fromRect: drawRect,
                toRect: oppRect,
                startRotation: 0,
                endRotation: (Math.random() - 0.5) * 10,
                onComplete: () => {
                  playSfx('draw');
                },
              });
            }, i * 120);
          }
        }
      });
    }

    prevPublicStateRef.current = publicState;
    prevMyHandCountRef.current = view.myHand.length;
  }, [publicState, view.myHand.length, animationIntensity, opponents, myPlayerId, triggerFlight, playSfx]);

  // Handle Local Human Playing a Card with Flight Animation
  const handlePlayCard = useCallback(
    (card: CardDefinition) => {
      if (!isMyTurn) return;
      if (!playableCardIds.has(card.id)) return;
      if (isCardInFlightRef.current) return;

      const isWild =
        card.color === 'wild' ||
        card.value === 'wild' ||
        card.value === 'wild_draw4';

      if (animationIntensity === 'off') {
        multiplayerService.playCard(roomCode, card.id);
        setSelectedCardId(null);
        playSfx(isWild ? 'wild' : ['skip', 'reverse', 'draw2'].includes(card.value) ? 'action' : 'card');
        return;
      }

      isCardInFlightRef.current = true;
      setSelectedCardId(null);
      setHiddenCardIds(prev => new Set(prev).add(card.id));

      const fromRect = getElementRect(`online-hand-card-${card.id}`, {
        x: window.innerWidth / 2 - 52,
        y: window.innerHeight - 150,
        width: 104,
        height: 145.6,
      });

      const toRect = getElementRect('discard-pile-target', {
        x: window.innerWidth / 2 + 50,
        y: window.innerHeight / 2 - 84,
        width: 120,
        height: 168,
      });

      const endRot = (Math.random() - 0.5) * 14;

      triggerFlight({
        type: 'play',
        card,
        fromRect,
        toRect,
        startRotation: 0,
        endRotation: endRot,
        onComplete: () => {
          setHiddenCardIds(prev => {
            const next = new Set(prev);
            next.delete(card.id);
            return next;
          });
          setDiscardLanded(true);
          setTimeout(() => setDiscardLanded(false), 450);
          multiplayerService.playCard(roomCode, card.id);
          isCardInFlightRef.current = false;
        },
      });

      playSfx(isWild ? 'wild' : ['skip', 'reverse', 'draw2'].includes(card.value) ? 'action' : 'card');
    },
    [isMyTurn, playableCardIds, animationIntensity, roomCode, triggerFlight, playSfx]
  );

  // Handle Color Choice
  const handleColorChoice = (color: CardColor) => {
    multiplayerService.chooseColor(roomCode, color);
    playSfx('wild');
  };

  // Handle Draw Card
  const handleDrawCard = () => {
    if (!isMyTurn) return;
    multiplayerService.drawCard(roomCode);
    playSfx('draw');
  };

  // Handle Pass Turn
  const handlePassTurn = () => {
    if (!isMyTurn) return;
    multiplayerService.passTurn(roomCode);
    playSfx('card');
  };

  // Handle Declare UNO
  const handleDeclareUno = () => {
    multiplayerService.declareUno(roomCode);
    playSfx('uno');
  };

  // Handle Catch UNO
  const handleCatchUno = (targetPlayerId: string) => {
    multiplayerService.catchUno(roomCode, targetPlayerId);
    playSfx('action');
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
        playSfx('card');
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

  return (
    <div className="game-container">
      {/* 0. Card Flight Animation Layer (Top Layer) */}
      <CardFlightLayer
        flights={flights}
        reducedMotion={animationIntensity === 'reduced'}
      />

      {/* 0. Action Effects Floating Toast Banner */}
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
        reducedMotion={animationIntensity === 'reduced'}
      />

      {/* 0. Victory Celebration upon Game Over */}
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
          reducedMotion={animationIntensity === 'reduced'}
        />
      )}

      {/* 1. Game Top Status Bar (Matching Local Game Controls) */}
      <div className="game-top-bar">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: 0,
          }}
        >
          <div className="game-status-pill">
            <Sparkles size={16} className="brand-icon" />
            <span>{publicState.lastActionMessage}</span>
          </div>
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
            Live Match
          </span>
        </div>

        <div className="game-controls-group">
          {/* Animation Intensity Cycle Control */}
          <button
            className="game-btn"
            onClick={cycleAnimationIntensity}
            title={`Animation Mode: ${animationIntensity.toUpperCase()} (Click to toggle)`}
            data-testid="anim-toggle-btn"
          >
            {animationIntensity === 'full' ? (
              <>
                <Zap size={14} style={{ color: '#38BDF8' }} /> Anim: Full
              </>
            ) : animationIntensity === 'reduced' ? (
              <>
                <Zap size={14} style={{ color: '#F5A600' }} /> Anim: Reduced
              </>
            ) : (
              <>
                <ZapOff size={14} style={{ color: '#94A3B8' }} /> Anim: Off
              </>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            className="game-btn"
            onClick={() => setSoundEnabled(s => !s)}
            title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          >
            {soundEnabled ? (
              <Volume2 size={14} style={{ color: '#10B981' }} />
            ) : (
              <VolumeX size={14} style={{ color: '#94A3B8' }} />
            )}
          </button>

          {/* Leave Room Button */}
          <button
            className="game-btn danger"
            onClick={onLeaveRoom}
            title="Leave Multiplayer Game"
          >
            <LogOut size={14} /> Leave Room
          </button>
        </div>
      </div>

      {/* 2. Main Arena Table (Reusing Local Tabletop Felt & Architecture) */}
      <div className="game-arena">
        {/* Opponents Row */}
        <div className="opponents-row">
          {opponents.map(opp => {
            const isOppTurn = opp.id === currentPlayer?.id;
            const canCatch = opp.cardCount === 1 && !opp.unoDeclared;

            return (
              <div
                key={opp.id}
                id={`opponent-pod-${opp.id}`}
                className={`opponent-pod ${isOppTurn ? 'active-turn' : ''}`}
              >
                <div className="opponent-header">
                  <span className="opponent-avatar">{opp.avatar}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="opponent-name">{opp.name}</span>
                    {opp.isHost && (
                      <span title="Room Host" style={{ display: 'inline-flex' }}>
                        <Crown size={12} style={{ color: '#F5A600' }} />
                      </span>
                    )}
                  </div>
                  <span
                    className={`connection-indicator ${opp.isConnected ? '' : 'disconnected'}`}
                    title={opp.isConnected ? 'Connected' : 'Disconnected'}
                  />
                  <span className="opponent-cards-badge">
                    {opp.cardCount} cards
                  </span>
                </div>

                {/* Visual miniature cards fan matching local game table */}
                <div className="opponent-cards-visual">
                  {Array.from({ length: Math.min(opp.cardCount, 7) }).map((_, idx) => (
                    <div key={idx} className="mini-card-back">
                      <CardBack size="sm" interactive={false} />
                    </div>
                  ))}
                  {opp.cardCount > 7 && (
                    <span className="opponent-cards-badge">
                      +{opp.cardCount - 7}
                    </span>
                  )}
                </div>

                {/* UNO call badge */}
                {opp.cardCount === 1 && opp.unoDeclared && (
                  <div className="opponent-uno-badge">UNO!</div>
                )}

                {/* Catch UNO button when opponent forgot */}
                {canCatch && isMyTurn && (
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

        {/* Center Table Area: Draw Pile, Active Color Ring & Discard Pile (Side by Side) */}
        <div className="center-play-area">
          <div className="center-table-console">
            {/* Draw Pile */}
            <div className="pile-container">
              <span className="pile-label">Draw Pile</span>
              <div
                id="draw-pile-target"
                className={`draw-pile-wrapper ${!isMyTurn ? 'disabled' : ''}`}
                onClick={handleDrawCard}
                title={isMyTurn ? 'Click to draw a card' : 'Wait for your turn'}
                data-testid="online-draw-pile"
              >
                <CardBack size="md" />
                <span className="draw-count-badge">
                  {publicState.drawPileCount}
                </span>
              </div>
            </div>

            {/* Active Color & Turn Console */}
            <div className="active-color-indicator">
              <div className={`color-ring color-${publicState.activeColor}`}>
                <RotateCw
                  size={24}
                  className={`direction-icon ${publicState.direction === -1 ? 'reverse' : ''}`}
                />
              </div>
              <span className="color-text-label">{publicState.activeColor}</span>
              <span
                className={`center-turn-indicator ${isMyTurn ? 'human-turn' : ''}`}
              >
                {isMyTurn ? '👉 Your Turn' : `⏳ ${currentPlayer?.name || 'Waiting'}'s Turn`}
              </span>
            </div>

            {/* Discard Pile with Landing Shockwave */}
            <div className="pile-container">
              <span className="pile-label">Discard Pile</span>
              <div
                id="discard-pile-target"
                className={`discard-pile-wrapper ${discardLanded ? 'landed' : ''}`}
              >
                {discardLanded && <div className="discard-impact-ring" />}
                {topDiscard ? (
                  <Card card={topDiscard} size="md" interactive={false} />
                ) : (
                  <CardBack size="md" interactive={false} />
                )}
                <span className="draw-count-badge" style={{ bottom: -6, right: -6 }}>
                  {publicState.discardPileCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Human Player Hand Section (Dedicated Bottom Area) */}
        <div className="human-hand-section">
          {/* Hand Action Toolbar */}
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

          {/* Cards Hand Container with Controlled Overlap & Gap Closing */}
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
              const isHidden = hiddenCardIds.has(card.id);

              if (isHidden) {
                // Invisible placeholder to keep hand layout stable during flight
                return (
                  <div
                    key={card.id}
                    style={{
                      width: 'var(--hand-card-width)',
                      height: 'var(--hand-card-height)',
                      marginLeft: idx === 0 ? 0 : 'var(--hand-card-overlap)',
                      visibility: 'hidden',
                      flexShrink: 0,
                    }}
                  />
                );
              }

              return (
                <div
                  key={card.id}
                  id={`online-hand-card-${card.id}`}
                  className={`hand-card-wrapper ${isPlayable ? 'is-playable' : 'not-playable'} ${isSelected ? 'is-selected' : ''} ${isPlayable && animationIntensity === 'full' ? 'breathing' : ''}`}
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
