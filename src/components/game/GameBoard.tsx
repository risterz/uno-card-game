import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CardDefinition, CardColor } from '../../types/card';
import { Card } from '../Card';
import { CardBack } from '../../components/CardBack';
import { GameSettings, GameState, Player } from '../../engine/types';
import {
  createInitialGameState,
  playCard,
  drawCard,
  passTurn,
  declareUno,
  catchUno,
  cancelColorChoice,
} from '../../engine/game-state';
import { computeAIMove, findOpponentToCatchUno } from '../../engine/ai';
import { getPlayableCards } from '../../engine/rules';
import { FULL_DECK } from '../../data/deck';
import { playSound, preloadSounds, SoundEffect } from '../../utils/audio';
import {
  AnimationIntensity,
  prefersReducedMotion,
  springs,
  modalBackdropVariants,
  modalDialogVariants,
} from '../../motion/motion-config';
import { CardFlightLayer, FlightItem } from './CardFlightLayer';
import { ActionEffects } from './ActionEffects';
import { useNotificationManager } from '../../utils/useNotificationManager';
import { VictoryCelebration } from './VictoryCelebration';
import {
  RotateCw,
  Settings,
  List,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  PlusCircle,
  CheckCircle2,
  Zap,
  ZapOff,
} from 'lucide-react';
import '../../styles/game.css';
import '../../styles/animations.css';

export const GameBoard: React.FC = () => {
  // Settings state
  const [settings, setSettings] = useState<GameSettings>({
    playerCount: 4,
    gameMode: 'ai',
    aiDifficulty: 'medium',
  });

  // Core game state
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState(settings)
  );

  // Selected card in hand
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // UI state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLogsPanel, setShowLogsPanel] = useState(false);
  const [privacyHidden, setPrivacyHidden] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Animation settings
  const [animationIntensity, setAnimationIntensity] = useState<AnimationIntensity>(() => {
    return prefersReducedMotion() ? 'reduced' : 'full';
  });

  // Active animations & notifications state
  const [flights, setFlights] = useState<FlightItem[]>([]);
  const { activeNotification, triggerNotification, dismissNotification } =
    useNotificationManager(animationIntensity === 'reduced');
  const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(new Set());
  const [discardLanded, setDiscardLanded] = useState(false);
  const [botStatus, setBotStatus] = useState<Record<string, string>>({});

  const isCardInFlightRef = useRef(false);
  const prevPlayerIndexRef = useRef(gameState.currentPlayerIndex);

  // Preload sound effects on mount
  useEffect(() => {
    preloadSounds();
  }, []);

  // Play audio sound effects
  const playSfx = useCallback(
    (type: SoundEffect) => {
      playSound(type, soundEnabled);
    },
    [soundEnabled]
  );

  // Play winning fanfare sound effect upon game over
  const hasPlayedWinSoundRef = useRef(false);
  useEffect(() => {
    if (gameState.status === 'game_over' && !hasPlayedWinSoundRef.current) {
      hasPlayedWinSoundRef.current = true;
      playSfx('win');
    } else if (gameState.status !== 'game_over') {
      hasPlayedWinSoundRef.current = false;
    }
  }, [gameState.status, playSfx]);

  // QA / automated testing helper
  useEffect(() => {
    (window as any).__UNO_GIVE_WILD__ = (
      value: 'wild' | 'wild_draw4' = 'wild',
      replace = false,
      unoDeclared = false
    ) => {
      setGameState(prev => {
        const template = FULL_DECK.find(c => c.value === value)!;
        const wildCard: CardDefinition = {
          ...template,
          id: `${value}-test-${Date.now()}`,
        };
        return {
          ...prev,
          currentPlayerIndex: 0,
          status: 'playing',
          players: prev.players.map((p, idx) =>
            idx === 0
              ? {
                  ...p,
                  hand: replace ? [wildCard] : [wildCard, ...p.hand],
                  unoDeclared,
                }
              : p
          ),
        };
      });
    };
  }, []);

  // Helper to measure element bounding rect safely with viewport fallback
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
      onComplete: () => void;
    }) => {
      if (animationIntensity === 'off') {
        params.onComplete();
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
          params.onComplete();
        },
      };

      setFlights(prev => [...prev, item]);
    },
    [animationIntensity]
  );

  // Restart / Reset Game
  const handleRestartGame = useCallback(
    (newSettings?: GameSettings) => {
      const s = newSettings || settings;
      const fresh = createInitialGameState(s);
      setGameState(fresh);
      setSelectedCardId(null);
      setTestHandDisplayCount(null);
      setShowSettingsModal(false);
      setFlights([]);
      dismissNotification();
      setHiddenCardIds(new Set());
      setBotStatus({});
      isCardInFlightRef.current = false;
      setPrivacyHidden(s.gameMode === 'pass_and_play');
      playSfx('start');
    },
    [settings, playSfx, dismissNotification]
  );

  // UI-only Test Hand Display Count (controls displayed slice without mutating deck or game state)
  const [testHandDisplayCount, setTestHandDisplayCount] = useState<number | null>(null);

  const handleToggleTestHandCount = useCallback((count: number) => {
    setTestHandDisplayCount(prev => (prev === count ? null : count));
  }, []);

  const handleResetTestHandCount = useCallback(() => {
    setTestHandDisplayCount(null);
  }, []);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];

  // Pass-and-play screen shield check
  useEffect(() => {
    if (
      settings.gameMode === 'pass_and_play' &&
      gameState.currentPlayerIndex !== prevPlayerIndexRef.current
    ) {
      setPrivacyHidden(true);
      prevPlayerIndexRef.current = gameState.currentPlayerIndex;
      setSelectedCardId(null);
    }
  }, [gameState.currentPlayerIndex, settings.gameMode]);

  // Check if active player is human
  const isHumanTurn = useMemo(() => {
    if (gameState.status === 'game_over') return false;
    return !currentPlayer.isAI;
  }, [gameState.status, currentPlayer]);

  // Human playable cards in hand
  const playableCardIds = useMemo(() => {
    if (!isHumanTurn) return new Set<string>();
    const playable = getPlayableCards(
      currentPlayer.hand,
      topDiscard,
      gameState.activeColor
    );
    return new Set(playable.map(c => c.id));
  }, [isHumanTurn, currentPlayer.hand, topDiscard, gameState.activeColor]);

  // Current viewing human player
  const viewingPlayer: Player = useMemo(() => {
    if (settings.gameMode === 'pass_and_play') {
      return gameState.players[gameState.currentPlayerIndex];
    }
    return gameState.players[0];
  }, [gameState.players, gameState.currentPlayerIndex, settings.gameMode]);

  // Non-mutating rendered subset of the existing hand for UI display testing
  const renderedHand: CardDefinition[] = useMemo(() => {
    if (testHandDisplayCount === null) {
      return viewingPlayer.hand;
    }
    return viewingPlayer.hand.slice(0, testHandDisplayCount);
  }, [viewingPlayer.hand, testHandDisplayCount]);

  // Informative message when testing hand display count
  const testDisplayMessage = useMemo(() => {
    if (testHandDisplayCount === null) return null;
    if (viewingPlayer.hand.length < testHandDisplayCount) {
      return `Showing ${viewingPlayer.hand.length} of ${testHandDisplayCount} requested cards.`;
    }
    return `Showing ${renderedHand.length} of ${viewingPlayer.hand.length} cards.`;
  }, [testHandDisplayCount, viewingPlayer.hand.length, renderedHand.length]);

  // Selected card definition object (guaranteed to be within rendered subset)
  const selectedCard = useMemo(() => {
    if (!selectedCardId) return null;
    return renderedHand.find(c => c.id === selectedCardId) || null;
  }, [selectedCardId, renderedHand]);

  // Deselect card if it falls outside rendered hand
  useEffect(() => {
    if (selectedCardId && !renderedHand.some(c => c.id === selectedCardId)) {
      setSelectedCardId(null);
    }
  }, [renderedHand, selectedCardId]);

  // Execute card play action and trigger corresponding action banner
  const executePlayCardAction = useCallback(
    (card: CardDefinition, chosenColor?: CardColor) => {
      const activePlayer = gameState.players[gameState.currentPlayerIndex];
      const victim =
        gameState.players[
          (gameState.currentPlayerIndex +
            gameState.direction * 1 +
            gameState.players.length) %
            gameState.players.length
        ];

      setGameState(prev => {
        const p = prev.players[prev.currentPlayerIndex];
        return playCard(prev, p.id, card.id, chosenColor);
      });

      // Sound effect
      if (
        card.color === 'wild' ||
        card.value === 'wild' ||
        card.value === 'wild_draw4'
      ) {
        playSfx('wild');
      } else {
        playSfx(
          ['skip', 'reverse', 'draw2'].includes(card.value) ? 'action' : 'card'
        );
      }

      // Action card visual toast notification
      if (card.value === 'skip') {
        triggerNotification({
          type: 'skip',
          targetPlayerName: victim.name,
          sourcePlayerName: activePlayer.name,
        });
      } else if (card.value === 'reverse') {
        triggerNotification({
          type: 'reverse',
          sourcePlayerName: activePlayer.name,
        });
      } else if (card.value === 'draw2') {
        triggerNotification({
          type: 'draw2',
          targetPlayerName: victim.name,
          sourcePlayerName: activePlayer.name,
        });
      } else if (card.value === 'wild' && chosenColor) {
        triggerNotification({
          type: 'wild',
          chosenColor,
          sourcePlayerName: activePlayer.name,
        });
      } else if (card.value === 'wild_draw4' && chosenColor) {
        triggerNotification({
          type: 'wild_draw4',
          targetPlayerName: victim.name,
          chosenColor,
          sourcePlayerName: activePlayer.name,
        });
      }
    },
    [gameState, playSfx, triggerNotification]
  );

  // Handle Human Playing a Card with Flight Animation
  const handlePlayCard = useCallback(
    (card: CardDefinition) => {
      if (!isHumanTurn) return;
      if (!playableCardIds.has(card.id)) return;
      if (isCardInFlightRef.current) return;

      if (animationIntensity === 'off') {
        executePlayCardAction(card);
        setSelectedCardId(null);
        return;
      }

      isCardInFlightRef.current = true;
      setSelectedCardId(null);
      setHiddenCardIds(prev => new Set(prev).add(card.id));

      const fromRect = getElementRect(`hand-card-${card.id}`, {
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
          executePlayCardAction(card);
          isCardInFlightRef.current = false;
        },
      });
    },
    [
      isHumanTurn,
      playableCardIds,
      animationIntensity,
      triggerFlight,
      executePlayCardAction,
    ]
  );

  // Handle Card Click (Selection & Double-click to play)
  const handleCardClick = (card: CardDefinition, isPlayable: boolean) => {
    if (!isHumanTurn) {
      setSelectedCardId(prev => (prev === card.id ? null : card.id));
      return;
    }

    if (isPlayable) {
      if (selectedCardId === card.id) {
        // Double click / already selected -> play immediately with animation
        handlePlayCard(card);
      } else {
        // First click -> select and lift high
        setSelectedCardId(card.id);
        playSfx('card');
      }
    } else {
      // Not playable -> toggle selection for inspection
      setSelectedCardId(prev => (prev === card.id ? null : card.id));
    }
  };

  // Handle Human Choosing Color for Wild Card
  const handleColorChoice = (color: CardColor) => {
    const pendingCard = gameState.pendingCard;
    const isDraw4 = pendingCard?.value === 'wild_draw4';
    const activePlayer = gameState.players[gameState.currentPlayerIndex];
    const victim =
      gameState.players[
        (gameState.currentPlayerIndex +
          gameState.direction * 1 +
          gameState.players.length) %
          gameState.players.length
      ];

    setGameState(prev => {
      if (prev.status !== 'awaiting_color_choice') return prev;
      const cardId = prev.pendingCard?.id || pendingCard?.id;
      if (!cardId) return prev;
      const p = prev.players[prev.currentPlayerIndex];
      return playCard(prev, p.id, cardId, color);
    });

    playSfx('wild');
    setSelectedCardId(null);

    if (isDraw4) {
      triggerNotification({
        type: 'wild_draw4',
        targetPlayerName: victim.name,
        chosenColor: color,
        sourcePlayerName: activePlayer.name,
      });
    } else {
      triggerNotification({
        type: 'wild',
        chosenColor: color,
        sourcePlayerName: activePlayer.name,
      });
    }
  };

  // Handle Cancelling Color Choice Modal
  const handleCancelColorChoice = () => {
    setGameState(prev => cancelColorChoice(prev));
    setSelectedCardId(null);
  };

  // Handle Human Drawing a Card with Flight Animation
  const handleDrawCard = () => {
    if (!isHumanTurn) return;
    if (gameState.status !== 'playing') return;
    if (isCardInFlightRef.current) return;

    if (animationIntensity === 'off') {
      setGameState(prev => drawCard(prev, currentPlayer.id));
      playSfx('draw');
      return;
    }

    isCardInFlightRef.current = true;
    const fromRect = getElementRect('draw-pile-target', {
      x: window.innerWidth / 2 - 170,
      y: window.innerHeight / 2 - 84,
      width: 120,
      height: 168,
    });

    const toRect = getElementRect('human-hand-container', {
      x: window.innerWidth / 2 - 52,
      y: window.innerHeight - 150,
      width: 104,
      height: 145.6,
    });

    triggerFlight({
      type: 'draw',
      faceDown: true,
      fromRect,
      toRect,
      startRotation: 0,
      endRotation: (Math.random() - 0.5) * 12,
      onComplete: () => {
        setGameState(prev => {
          const next = drawCard(prev, currentPlayer.id);
          playSfx('draw');
          return next;
        });
        isCardInFlightRef.current = false;
      },
    });
  };

  // Handle Human Passing after Drawing
  const handlePassTurn = () => {
    if (!isHumanTurn) return;
    if (gameState.status !== 'drawn_card_decision') return;

    setGameState(prev => {
      const next = passTurn(prev, currentPlayer.id);
      playSfx('card');
      return next;
    });
    setSelectedCardId(null);
  };

  // Handle Human Declaring UNO
  const handleDeclareUno = () => {
    triggerNotification({
      type: 'uno',
      playerName: viewingPlayer.name,
    });
    playSfx('uno');
    setGameState(prev => {
      return declareUno(prev, currentPlayer.id);
    });
  };

  // Handle Catching an Opponent forgetting UNO
  const handleCatchUno = (targetId: string) => {
    const targetPlayer = gameState.players.find(p => p.id === targetId);
    triggerNotification({
      type: 'caught',
      playerName: viewingPlayer.name,
      targetPlayerName: targetPlayer?.name || 'Opponent',
    });
    playSfx('catch');
    setGameState(prev => {
      return catchUno(prev, currentPlayer.id, targetId);
    });
  };

  // AI Turn Execution Effect Loop with Realistic Flight & Pacing
  useEffect(() => {
    if (gameState.status === 'game_over') return;
    if (!currentPlayer.isAI) return;

    let timer: NodeJS.Timeout;

    // 1. AI catches human if vulnerable
    const victim = findOpponentToCatchUno(gameState, currentPlayer.id);
    if (victim) {
      timer = setTimeout(() => {
        triggerNotification({
          type: 'caught',
          playerName: currentPlayer.name,
          targetPlayerName: victim.name,
        });
        playSfx('catch');
        setGameState(prev => catchUno(prev, currentPlayer.id, victim.id));
      }, 500);
      return () => clearTimeout(timer);
    }

    // Indicate AI is "Thinking..."
    setBotStatus(prev => ({ ...prev, [currentPlayer.id]: 'Thinking...' }));

    // 2. AI decides and executes move
    const aiThinkTime = animationIntensity === 'off' ? 400 : 750;

    timer = setTimeout(() => {
      const activeBot = gameState.players[gameState.currentPlayerIndex];
      if (!activeBot || !activeBot.isAI) return;

      const move = computeAIMove(gameState);

      // AI declares UNO if needed
      if (move.shouldDeclareUno && !activeBot.unoDeclared) {
        triggerNotification({
          type: 'uno',
          playerName: activeBot.name,
        });
        playSfx('uno');
        setGameState(prev => declareUno(prev, activeBot.id));
      }

      // Move Type: PLAY
      if (move.type === 'play' && move.cardId) {
        const cardToPlay =
          activeBot.hand.find(c => c.id === move.cardId) ||
          FULL_DECK.find(c => c.id === move.cardId);

        if (animationIntensity === 'off' || !cardToPlay) {
          executePlayCardAction(cardToPlay || activeBot.hand[0], move.chosenColor);
          setBotStatus(prev => ({ ...prev, [activeBot.id]: '' }));
          return;
        }

        setBotStatus(prev => ({
          ...prev,
          [activeBot.id]: `Playing ${cardToPlay.name}...`,
        }));

        const botRect = getElementRect(`opponent-pod-${activeBot.id}`, {
          x: window.innerWidth / 2 - 50,
          y: 70,
          width: 110,
          height: 80,
        });

        const discardRect = getElementRect('discard-pile-target', {
          x: window.innerWidth / 2 + 50,
          y: window.innerHeight / 2 - 84,
          width: 120,
          height: 168,
        });

        triggerFlight({
          type: 'play',
          card: cardToPlay,
          fromRect: botRect,
          toRect: discardRect,
          startRotation: -15,
          endRotation: (Math.random() - 0.5) * 14,
          onComplete: () => {
            setDiscardLanded(true);
            setTimeout(() => setDiscardLanded(false), 450);
            executePlayCardAction(cardToPlay, move.chosenColor);
            setBotStatus(prev => ({ ...prev, [activeBot.id]: '' }));
          },
        });
        return;
      }

      // Move Type: DRAW
      if (move.type === 'draw') {
        if (animationIntensity === 'off') {
          playSfx('draw');
          const afterDraw = drawCard(gameState, activeBot.id);
          if (
            afterDraw.status === 'drawn_card_decision' &&
            afterDraw.drawnCard
          ) {
            const aiMove = computeAIMove(afterDraw);
            if (aiMove.type === 'play' && aiMove.cardId) {
              setGameState(
                playCard(
                  afterDraw,
                  activeBot.id,
                  aiMove.cardId,
                  aiMove.chosenColor
                )
              );
              return;
            }
            setGameState(passTurn(afterDraw, activeBot.id));
            return;
          }
          setGameState(afterDraw);
          setBotStatus(prev => ({ ...prev, [activeBot.id]: '' }));
          return;
        }

        setBotStatus(prev => ({ ...prev, [activeBot.id]: 'Drawing...' }));

        const drawRect = getElementRect('draw-pile-target', {
          x: window.innerWidth / 2 - 170,
          y: window.innerHeight / 2 - 84,
          width: 120,
          height: 168,
        });

        const botRect = getElementRect(`opponent-pod-${activeBot.id}`, {
          x: window.innerWidth / 2 - 50,
          y: 70,
          width: 110,
          height: 80,
        });

        triggerFlight({
          type: 'draw',
          faceDown: true,
          fromRect: drawRect,
          toRect: botRect,
          startRotation: 0,
          endRotation: (Math.random() - 0.5) * 10,
          onComplete: () => {
            playSfx('draw');
            setGameState(prev => {
              const afterDraw = drawCard(prev, activeBot.id);
              if (
                afterDraw.status === 'drawn_card_decision' &&
                afterDraw.drawnCard
              ) {
                const aiMove = computeAIMove(afterDraw);
                if (aiMove.type === 'play' && aiMove.cardId) {
                  return playCard(
                    afterDraw,
                    activeBot.id,
                    aiMove.cardId,
                    aiMove.chosenColor
                  );
                }
                return passTurn(afterDraw, activeBot.id);
              }
              return afterDraw;
            });
            setBotStatus(prev => ({ ...prev, [activeBot.id]: '' }));
          },
        });
        return;
      }

      // Move Type: PASS
      if (move.type === 'pass') {
        setGameState(prev => passTurn(prev, activeBot.id));
        setBotStatus(prev => ({ ...prev, [activeBot.id]: '' }));
      }
    }, aiThinkTime);

    return () => clearTimeout(timer);
  }, [
    gameState,
    currentPlayer,
    animationIntensity,
    playSfx,
    triggerFlight,
    executePlayCardAction,
  ]);

  // Opponents list (all players except human/bottom player in view)
  const opponentPlayers = useMemo(() => {
    if (settings.gameMode === 'pass_and_play') {
      return gameState.players.filter(
        (_, idx) => idx !== gameState.currentPlayerIndex
      );
    }
    return gameState.players.filter((_, idx) => idx !== 0);
  }, [gameState.players, gameState.currentPlayerIndex, settings.gameMode]);

  // Dynamic overlap calculation based on rendered hand size
  const handCardCount = renderedHand.length;
  const calculatedOverlap = useMemo(() => {
    if (handCardCount <= 1) return 0;
    if (handCardCount <= 7) return -12;
    if (handCardCount <= 13) return -28;
    return -42;
  }, [handCardCount]);

  // Toggle animation setting
  const cycleAnimationIntensity = () => {
    setAnimationIntensity(curr => {
      if (curr === 'full') return 'reduced';
      if (curr === 'reduced') return 'off';
      return 'full';
    });
  };

  return (
    <div className="game-container">
      {/* 0. Card Flight Animation Layer (Top Layer) */}
      <CardFlightLayer
        flights={flights}
        reducedMotion={animationIntensity === 'reduced'}
      />

      {/* 0. Action Effects & Power-Card Notifications Toast Overlay */}
      <ActionEffects
        notification={activeNotification}
        reducedMotion={animationIntensity === 'reduced'}
      />

      {/* 0. Victory Celebration Screen with Confetti upon Game Over */}
      {gameState.status === 'game_over' && gameState.winner && (
        <VictoryCelebration
          winner={gameState.winner}
          players={gameState.players}
          settings={gameState.settings}
          onRestart={handleRestartGame}
          onOpenSettings={() => setShowSettingsModal(true)}
          reducedMotion={animationIntensity === 'reduced'}
        />
      )}

      {/* 1. Game Top Status Bar */}
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
            <span>{gameState.lastActionMessage}</span>
          </div>
          {gameState.settings.gameMode === 'ai' && (
            <span
              className={`difficulty-badge difficulty-${gameState.settings.aiDifficulty}`}
              title={`Active AI Intelligence Strategy: ${gameState.settings.aiDifficulty.toUpperCase()}`}
            >
              AI: {gameState.settings.aiDifficulty.toUpperCase()}
            </span>
          )}
        </div>

        <div className="game-controls-group">
          {/* Quick Hand Size Tester */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>Test Hand:</span>
            {[1, 7, 13, 20].map(cnt => {
              const isActive = testHandDisplayCount === cnt;
              return (
                <button
                  key={cnt}
                  className={`game-btn ${isActive ? 'active' : ''}`}
                  style={{
                    padding: '3px 7px',
                    fontSize: '11px',
                    borderColor: isActive ? '#38BDF8' : undefined,
                    background: isActive ? 'rgba(56, 189, 248, 0.18)' : undefined,
                    color: isActive ? '#38BDF8' : undefined,
                    fontWeight: isActive ? 600 : 400,
                  }}
                  onClick={() => handleToggleTestHandCount(cnt)}
                  title={`Display first ${cnt} cards only (UI test)`}
                  data-testid={`test-hand-btn-${cnt}`}
                >
                  {cnt}
                </button>
              );
            })}
            {testHandDisplayCount !== null && (
              <button
                className="game-btn"
                style={{ padding: '3px 6px', fontSize: '10px', color: '#94A3B8' }}
                onClick={handleResetTestHandCount}
                title="Reset to full hand view"
                data-testid="test-hand-btn-reset"
              >
                All
              </button>
            )}
          </div>

          {/* Animation Intensity Cycle Control */}
          <button
            className="game-btn"
            onClick={cycleAnimationIntensity}
            title={`Animation Mode: ${animationIntensity.toUpperCase()} (Click to toggle)`}
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
            onClick={() => setSoundEnabled(prev => !prev)}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? (
              <Volume2 size={14} style={{ color: '#10B981' }} />
            ) : (
              <VolumeX size={14} style={{ color: '#94A3B8' }} />
            )}
          </button>

          {/* Logs */}
          <button
            className="game-btn"
            onClick={() => setShowLogsPanel(prev => !prev)}
          >
            <List size={14} /> Log ({gameState.logs.length})
          </button>

          {/* Match Setup */}
          <button
            className="game-btn primary"
            onClick={() => {
              setSettings(gameState.settings);
              setShowSettingsModal(true);
            }}
          >
            <Settings size={14} /> Match Setup
          </button>

          {/* Restart */}
          <button
            className="game-btn danger"
            onClick={() => handleRestartGame()}
            title="Restart Game"
          >
            <RotateCcw size={14} /> Restart
          </button>
        </div>
      </div>

      {/* 2. Main Arena Table */}
      <div className="game-arena">
        {/* Opponents Row */}
        <div className="opponents-row">
          {opponentPlayers.map(opp => {
            const isTurn =
              gameState.players[gameState.currentPlayerIndex].id === opp.id;
            const hasUnoDanger = opp.hand.length === 1 && !opp.unoDeclared;
            const statusText = botStatus[opp.id];

            return (
              <div
                key={opp.id}
                id={`opponent-pod-${opp.id}`}
                className={`opponent-pod ${isTurn ? 'active-turn' : ''}`}
              >
                <div className="opponent-header">
                  <span className="opponent-avatar">{opp.avatar}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="opponent-name">{opp.name}</span>
                    {opp.isAI && (
                      <span className="opponent-difficulty-tag">
                        {gameState.settings.aiDifficulty.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="opponent-cards-badge">
                    {opp.hand.length} cards
                  </span>
                </div>

                {/* AI Thinking/Status Indicator */}
                {isTurn && opp.isAI && (
                  <div className="ai-status-indicator">
                    <span>{statusText || 'Thinking'}</span>
                    <span className="thinking-dots">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                )}

                {/* Visual miniature cards fan */}
                <div className="opponent-cards-visual">
                  {opp.hand.slice(0, 7).map((card, idx) => (
                    <div
                      key={`${card.id}-${idx}`}
                      className="mini-card-back"
                    >
                      <CardBack size="sm" interactive={false} />
                    </div>
                  ))}
                  {opp.hand.length > 7 && (
                    <span className="opponent-cards-badge">
                      +{opp.hand.length - 7}
                    </span>
                  )}
                </div>

                {/* UNO call badge */}
                {opp.hand.length === 1 && opp.unoDeclared && (
                  <div className="opponent-uno-badge">UNO!</div>
                )}

                {/* Catch UNO button when opponent forgot */}
                {hasUnoDanger && isHumanTurn && (
                  <button
                    className="catch-uno-btn"
                    onClick={() => handleCatchUno(opp.id)}
                  >
                    🚨 CATCH UNO!
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Center Table Area: Draw Pile, Active Color Ring & Discard Pile */}
        <div className="center-play-area">
          <div className="center-table-console">
            {/* Draw Pile */}
            <div className="pile-container">
              <span className="pile-label">Draw Pile</span>
              <div
                id="draw-pile-target"
                className={`draw-pile-wrapper ${!isHumanTurn ? 'disabled' : ''}`}
                onClick={handleDrawCard}
                title={
                  isHumanTurn ? 'Click to draw a card' : 'Wait for your turn'
                }
              >
                <CardBack size="md" />
                <span className="draw-count-badge">
                  {gameState.drawPile.length}
                </span>
              </div>
            </div>

            {/* Active Color & Turn Console */}
            <div className="active-color-indicator">
              <div className={`color-ring color-${gameState.activeColor}`}>
                <RotateCw
                  size={24}
                  className={`direction-icon ${gameState.direction === -1 ? 'reverse' : ''}`}
                />
              </div>
              <span className="color-text-label">{gameState.activeColor}</span>
              <span
                className={`center-turn-indicator ${isHumanTurn ? 'human-turn' : ''}`}
              >
                {isHumanTurn ? '👉 Your Turn' : `⏳ ${currentPlayer.name}'s Turn`}
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
              </div>
            </div>
          </div>
        </div>

        {/* Human Player Hand Section (Dedicated Bottom Area) */}
        <div className="human-hand-section">
          {/* Hand Action Toolbar */}
          <div
            className={`hand-toolbar ${isHumanTurn ? 'active-turn-toolbar' : ''}`}
          >
            {/* Left: Player Profile & Turn Indicator */}
            <div className="hand-player-info">
              <span className="opponent-avatar">{viewingPlayer.avatar}</span>
              <span className="player-name-tag">
                {viewingPlayer.name} ({viewingPlayer.hand.length} cards)
              </span>
              {isHumanTurn && <span className="turn-pill">Your Turn</span>}
              {testDisplayMessage && (
                <span
                  className="test-hand-message-pill"
                  style={{
                    fontSize: '11px',
                    color: '#38BDF8',
                    background: 'rgba(56, 189, 248, 0.12)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    fontWeight: 500,
                  }}
                  data-testid="test-hand-message"
                >
                  {testDisplayMessage}
                </span>
              )}
            </div>

            {/* Center: Contextual Action Controls */}
            <div className="hand-center-actions">
              {/* Drawn Card Decision Controls */}
              {isHumanTurn &&
                gameState.status === 'drawn_card_decision' &&
                gameState.drawnCard && (
                  <div className="drawn-decision-bar">
                    <span>
                      Drawn: <strong>{gameState.drawnCard.name}</strong>
                    </span>
                    {playableCardIds.has(gameState.drawnCard.id) && (
                      <button
                        className="game-btn primary"
                        onClick={() => handlePlayCard(gameState.drawnCard!)}
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
              {isHumanTurn && gameState.status === 'playing' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="game-btn draw-btn"
                    onClick={handleDrawCard}
                    title="Draw 1 card from the draw pile"
                  >
                    <PlusCircle size={14} /> Draw Card
                  </button>
                  {selectedCard && playableCardIds.has(selectedCard.id) && (
                    <button
                      className="game-btn primary"
                      onClick={() => handlePlayCard(selectedCard)}
                      title={`Play selected ${selectedCard.name}`}
                    >
                      <Play size={14} /> Play {selectedCard.name}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right: UNO Shout Button */}
            <div className="hand-right-actions">
              {isHumanTurn && (
                <button
                  className={`uno-shout-btn ${viewingPlayer.unoDeclared ? 'declared' : ''} ${viewingPlayer.hand.length <= 2 && !viewingPlayer.unoDeclared ? 'pulse-ready' : ''}`}
                  onClick={handleDeclareUno}
                  disabled={
                    viewingPlayer.unoDeclared || viewingPlayer.hand.length > 2
                  }
                  title="Shout UNO when holding 2 or 1 cards"
                >
                  {viewingPlayer.unoDeclared ? (
                    <>
                      <CheckCircle2 size={14} /> UNO CALLED!
                    </>
                  ) : (
                    <>📢 SHOUT UNO!</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Cards Hand Container with Dynamic Controlled Overlap & Smooth Motion */}
          <div
            id="human-hand-container"
            className="hand-cards-container"
            style={
              {
                '--hand-card-overlap': `${calculatedOverlap}px`,
              } as React.CSSProperties
            }
          >
            {renderedHand.map((card, idx) => {
              const isPlayable = isHumanTurn && playableCardIds.has(card.id);
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
                  id={`hand-card-${card.id}`}
                  className={`hand-card-wrapper ${isPlayable ? 'is-playable' : 'not-playable'} ${isSelected ? 'is-selected' : ''} ${isPlayable && animationIntensity === 'full' ? 'breathing' : ''}`}
                  style={{ zIndex: isSelected ? 150 : idx + 1 }}
                  onClick={() => handleCardClick(card, isPlayable)}
                  title={`${card.name} - ${isPlayable ? (isSelected ? 'Click again to play' : 'Click to select / play') : 'Cannot play on active color or top card'}`}
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

      {/* 3. Wild Color Selection Modal with Smooth Motion */}
      <AnimatePresence>
        {gameState.status === 'awaiting_color_choice' && isHumanTurn && (
          <motion.div
            className="color-choice-modal"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="color-choice-box"
              variants={modalDialogVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h3 className="color-choice-title">Wild Card Played!</h3>
              <p className="color-choice-subtitle">
                Select the next active color for the game table:
              </p>
              <div className="color-buttons-grid">
                {(['red', 'blue', 'green', 'yellow'] as const).map(color => (
                  <motion.button
                    key={color}
                    className={`color-pick-btn ${color}`}
                    whileHover={{ scale: 1.06, y: -4 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleColorChoice(color)}
                  >
                    {color}
                  </motion.button>
                ))}
              </div>
              <button
                className="action-btn"
                style={{
                  marginTop: '16px',
                  width: '100%',
                  justifyContent: 'center',
                }}
                onClick={handleCancelColorChoice}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Pass-and-Play Privacy Shield Screen */}
      <AnimatePresence>
        {privacyHidden && settings.gameMode === 'pass_and_play' && (
          <motion.div
            className="privacy-shield-overlay"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ShieldAlert className="brand-icon privacy-shield-icon" size={56} />
            <h2 className="privacy-shield-title">
              Pass device to {currentPlayer.name}
            </h2>
            <p className="privacy-shield-desc">
              Keep your cards secret! Hand the device over and tap continue when
              ready.
            </p>
            <button
              className="action-btn primary"
              style={{ fontSize: '16px', padding: '12px 28px' }}
              onClick={() => setPrivacyHidden(false)}
            >
              I am {currentPlayer.name} - Reveal Hand <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Settings / New Match Modal with Smooth Motion */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            className="modal-backdrop"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              className="modal-dialog"
              variants={modalDialogVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Match Configuration & Visual Motion</h3>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowSettingsModal(false)}
                >
                  ×
                </button>
              </div>
              <div
                className="modal-body"
                style={{ flexDirection: 'column', gap: '20px' }}
              >
                {/* Game Mode */}
                <div style={{ width: '100%' }}>
                  <label
                    className="filter-label"
                    style={{ marginBottom: '8px' }}
                  >
                    Game Mode:
                  </label>
                  <div
                    className="button-group"
                    style={{ width: '100%', display: 'flex' }}
                  >
                    <button
                      className={`toggle-btn ${settings.gameMode === 'ai' ? 'active' : ''}`}
                      style={{ flex: 1 }}
                      onClick={() =>
                        setSettings(s => ({ ...s, gameMode: 'ai' }))
                      }
                    >
                      Solo vs AI Bots
                    </button>
                    <button
                      className={`toggle-btn ${settings.gameMode === 'pass_and_play' ? 'active' : ''}`}
                      style={{ flex: 1 }}
                      onClick={() =>
                        setSettings(s => ({ ...s, gameMode: 'pass_and_play' }))
                      }
                    >
                      Local Pass & Play
                    </button>
                  </div>
                </div>

                {/* Player Count */}
                <div style={{ width: '100%' }}>
                  <label
                    className="filter-label"
                    style={{ marginBottom: '8px' }}
                  >
                    Player Count:
                  </label>
                  <div
                    className="button-group"
                    style={{ width: '100%', display: 'flex' }}
                  >
                    {[2, 3, 4].map(num => (
                      <button
                        key={num}
                        className={`toggle-btn ${settings.playerCount === num ? 'active' : ''}`}
                        style={{ flex: 1 }}
                        onClick={() =>
                          setSettings(s => ({ ...s, playerCount: num }))
                        }
                      >
                        {num} Players
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Difficulty */}
                {settings.gameMode === 'ai' && (
                  <div style={{ width: '100%' }}>
                    <label
                      className="filter-label"
                      style={{ marginBottom: '8px' }}
                    >
                      AI Bot Intelligence:
                    </label>
                    <div
                      className="button-group"
                      style={{ width: '100%', display: 'flex' }}
                    >
                      {(['easy', 'medium', 'hard'] as const).map(diff => (
                        <button
                          key={diff}
                          className={`toggle-btn ${settings.aiDifficulty === diff ? 'active' : ''}`}
                          style={{ flex: 1 }}
                          onClick={() =>
                            setSettings(s => ({ ...s, aiDifficulty: diff }))
                          }
                        >
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Animation Intensity Settings */}
                <div style={{ width: '100%' }}>
                  <label
                    className="filter-label"
                    style={{ marginBottom: '8px' }}
                  >
                    Animation Intensity & Effects:
                  </label>
                  <div
                    className="button-group"
                    style={{ width: '100%', display: 'flex' }}
                  >
                    {(
                      [
                        { id: 'full', label: 'Full 3D Motion' },
                        { id: 'reduced', label: 'Reduced Motion' },
                        { id: 'off', label: 'Instant (Off)' },
                      ] as const
                    ).map(item => (
                      <button
                        key={item.id}
                        className={`toggle-btn ${animationIntensity === item.id ? 'active' : ''}`}
                        style={{ flex: 1 }}
                        onClick={() => setAnimationIntensity(item.id)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    width: '100%',
                    marginTop: '12px',
                  }}
                >
                  <button
                    className="action-btn primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => handleRestartGame(settings)}
                  >
                    Start New Match
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => setShowSettingsModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Action History Log Drawer with Slide Transition */}
      <AnimatePresence>
        {showLogsPanel && (
          <motion.div
            className="logs-panel"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={springs.smoothEase}
          >
            <div className="logs-header">
              <span>Match Action Log ({gameState.logs.length})</span>
              <button
                className="clear-btn"
                onClick={() => setShowLogsPanel(false)}
              >
                ×
              </button>
            </div>
            <div className="logs-list">
              {[...gameState.logs].reverse().map(log => (
                <div key={log.id} className={`log-item ${log.type}`}>
                  {log.text}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameBoard;
