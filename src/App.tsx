import React, { Suspense, lazy, useEffect, useState, useCallback, useRef } from 'react';
import {
  Star,
  Check,
  Zap,
  Coins,
  Gem,
  Lock,
  Volume2,
  VolumeX,
  Pause,
  Sparkles,
  Trophy,
  Package,
  Info,
  Scissors,
  Gift,
  Wand2,
  Plus,
  Castle,
} from 'lucide-react';
import {
  createInitialGameState,
  GameState,
  ITEM_CATALOG,
  Language,
  STORY_CHAPTERS,
  spawnFromGenerator,
  mergeOrMoveCells,
  findBestMergePair,
  sellBoardItem,
  findCellsForOrder,
  fulfillCustomerOrder,
  upgradeRenovationZone,
  canMergeItems,
  cyclePowerMultiplier,
  storeBoardItemInInventory,
  retrieveInventoryItemToBoard,
  unlockBonusBubbleWithGems,
  useGoldenScissors,
  useJokerUpgrade,
  openBoardChest,
  spinLuckyWheel,
  voteMazayenEntry,
  ChainCategory,
  MajlisAmbiance,
  WheelWedge,
  buildMergeParticleBurst,
  claimDailyLoginReward,
  completePour,
  dayKeyFromDate,
  getActiveSeason,
  getDailyLoginDay,
  getTutorialStep,
  COMBO_WINDOW_MS,
  type LevelUpReward,
  type ChainId,
  MergeParticleBurst,
} from './game/rules';
import {
  soundFX,
  saveGameState,
  loadSavedGameState,
  clearSavedGameState,
} from './utils/soundAndHaptics';
import { StoryDialogueModal } from './components/StoryDialogueModal';
import { CustomerPortrait } from './components/CustomerPortrait';
import { MergeParticleOverlay } from './components/MergeParticleOverlay';
import { EnergyModal, QuestsModal, WorkshopModal } from './components/ProgressionModals';
import { BottomNav, GameHud, NavTab } from './components/GameChrome';
import { DailyLoginModal } from './components/DailyLoginModal';
import { ItemArtwork, preloadItemArt } from './components/ItemArtwork';
import { EVENT_ORDER_POINTS, activeLiveEvent, addEventPoints, claimEventMilestone, mergeEventPoints } from './game/events';
import { LiveEventBar, LiveEventModal } from './components/LiveEventUI';

// Screens opened from a button are split into their own chunks and fetched when the page is idle,
// so the first screen downloads and parses less code.
const loadMajlis = () => import('./components/MajlisRenovationView');
const loadShop = () => import('./components/ShopAndMadaModal');
const loadChainAndLeaderboard = () => import('./components/ChainAndLeaderboardModals');
const loadPour = () => import('./components/FinjanPourModal');
const loadTransfer = () => import('./components/SaveTransferModal');
const MajlisRenovationView = lazy(() => loadMajlis().then((m) => ({ default: m.MajlisRenovationView })));
const ShopAndMadaModal = lazy(() => loadShop().then((m) => ({ default: m.ShopAndMadaModal })));
const ChainTreeModal = lazy(() => loadChainAndLeaderboard().then((m) => ({ default: m.ChainTreeModal })));
const LeaderboardModal = lazy(() => loadChainAndLeaderboard().then((m) => ({ default: m.LeaderboardModal })));
const FinjanPourModal = lazy(() => loadPour().then((m) => ({ default: m.FinjanPourModal })));
const SaveTransferModal = lazy(() => loadTransfer().then((m) => ({ default: m.SaveTransferModal })));
function prefetchScreens(): void {
  const run = () => [loadMajlis, loadShop, loadChainAndLeaderboard, loadPour, loadTransfer].forEach((load) => load().catch(() => {}));
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(run, { timeout: 4000 });
  else window.setTimeout(run, 2000);
}
import {
  advanceArea,
  applyEnergyRegen,
  areaInfo,
  buyEnergyWithCoins,
  buyEnergyWithGems,
  buySandTile,
  claimDiscovery,
  claimQuest,
  claimQuestBonus,
  ensureDailyQuests,
  findStoryChapter,
  isAreaComplete,
  msUntilNextEnergy,
  questProgress,
  sandClearCost,
  styleChangeCost,
  unclaimedDiscoveries,
  upgradeGenerator,
  xpToReachLevel,
} from './game/progression';
import { isVoiceCharacter, speakerCharacter } from './game/voiceLines';

type ShellState = 'title' | 'playing' | 'paused' | 'gameover';
type ActiveWorkspace = 'merge' | 'majlis';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const isAr = lang === 'ar';

  const [shellState, setShellState] = useState<ShellState>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return 'playing';
      }
    }
    return 'title';
  });

  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = loadSavedGameState();
    const initial = createInitialGameState();
    if (!saved) return initial;
    return {
      ...initial,
      ...saved,
      powerMultiplier: saved.powerMultiplier || 1,
      inventory: Array.isArray(saved.inventory) ? saved.inventory : [],
      inventoryCapacity: saved.inventoryCapacity || 4,
      bonusBubble: saved.bonusBubble || null,
      prestigePoints: typeof saved.prestigePoints === 'number' ? saved.prestigePoints : 110,
      scissorsCount: typeof saved.scissorsCount === 'number' ? saved.scissorsCount : 2,
      jokerCount: typeof saved.jokerCount === 'number' ? saved.jokerCount : 1,
      freeSpinsAvailable: typeof saved.freeSpinsAvailable === 'number' ? saved.freeSpinsAvailable : 1,
      mazayenVotesRemaining: typeof saved.mazayenVotesRemaining === 'number' ? saved.mazayenVotesRemaining : 3,
      votedRivalIds: Array.isArray(saved.votedRivalIds) ? saved.votedRivalIds : [],
      activeRegion: saved.activeRegion || 'diriyah',
      ambiance: saved.ambiance || 'ramadan_night',
    };
  });

  const [workspace, setWorkspace] = useState<ActiveWorkspace>('merge');
  const [muted, setMuted] = useState<boolean>(false);
  const [hintPair, setHintPair] = useState<[number, number] | null>(null);
  const [dragGhost, setDragGhost] = useState<{ itemId: string; x: number; y: number; from: number; over: number | null } | null>(null);
  const dropRef = useRef<((from: number, to: number) => void) | null>(null);
  const suppressClickRef = useRef(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const [shopModalOpen, setShopModalOpen] = useState<boolean>(false);
  const [shopInitialTab, setShopInitialTab] = useState<'shop' | 'liveops' | 'almanac' | 'capacitor'>('shop');

  const [chainModalOpen, setChainModalOpen] = useState<boolean>(false);
  const [chainModalCategory, setChainModalCategory] = useState<ChainCategory>('qahwa');
  const [leaderboardOpen, setLeaderboardOpen] = useState<boolean>(false);
  const [leaderboardSection, setLeaderboardSection] = useState<'leaderboard' | 'mazayen' | 'wheel'>('leaderboard');

  const bannerTimeoutRef = useRef<number | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [energyOpen, setEnergyOpen] = useState(false);
  const [questsOpen, setQuestsOpen] = useState(false);
  const [workshopOpen, setWorkshopOpen] = useState(false);
  const [sandPromptIndex, setSandPromptIndex] = useState<number | null>(null);
  const [dailyLoginDay, setDailyLoginDay] = useState<number | null>(null);
  const [levelUpToast, setLevelUpToast] = useState<LevelUpReward | null>(null);
  const [comboLive, setComboLive] = useState(false);
  const comboTimeoutRef = useRef<number | null>(null);
  const [pourOpen, setPourOpen] = useState(false);
  const activeSeason = React.useMemo(() => getActiveSeason(new Date()), []);
  const burstSeqRef = useRef<number>(1);
  const [mergeBursts, setMergeBursts] = useState<MergeParticleBurst[]>([]);
  const [celebratingCells, setCelebratingCells] = useState<Record<number, boolean>>({});

  const triggerMergeParticleBurst = useCallback(
    (
      cellIndex: number,
      mergedItemId: string,
      options?: { megaMerge?: boolean; comboCount?: number }
    ) => {
      const seq = burstSeqRef.current++;
      const burst = buildMergeParticleBurst(cellIndex, mergedItemId, seq, options);
      setMergeBursts((prev) => [...prev.slice(-4), burst]);
      setCelebratingCells((prev) => ({ ...prev, [cellIndex]: true }));

      window.setTimeout(() => {
        setCelebratingCells((prev) => {
          const next = { ...prev };
          delete next[cellIndex];
          return next;
        });
      }, 620);

      window.setTimeout(
        () => {
          setMergeBursts((prev) => prev.filter((b) => b.id !== burst.id));
        },
        burst.isHighLevel ? 2350 : 1250
      );
    },
    []
  );

  // Level-up toast and fanfare, plus the live combo meter, after any merge
  const handleMergeExtras = (res: { levelUp?: LevelUpReward; comboCount?: number }) => {
    if (res.levelUp) {
      setLevelUpToast(res.levelUp);
      soundFX.playLevelUp();
      window.setTimeout(() => setLevelUpToast(null), 3200);
    }
    setComboLive(true);
    if (comboTimeoutRef.current) window.clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = window.setTimeout(() => setComboLive(false), COMBO_WINDOW_MS);
  };

  // Festival points for a merge result; the featured chain earns double.
  const withMergeEventPoints = (state: GameState, mergedItemId?: string | null): GameState => {
    const def = mergedItemId ? ITEM_CATALOG[mergedItemId] : null;
    if (!def) return state;
    const now = Date.now();
    return addEventPoints(state, now, mergeEventPoints(def.chain, def.level, activeLiveEvent(now).def.featuredChain));
  };

  const showFeedback = useCallback((msg: string) => {
    setFeedbackBanner(msg);
    if (bannerTimeoutRef.current) {
      window.clearTimeout(bannerTimeoutRef.current);
    }
    bannerTimeoutRef.current = window.setTimeout(() => {
      setFeedbackBanner(null);
    }, 2600);
  }, []);

  // Sync shellState to document.body.dataset.state and language direction to documentElement
  useEffect(() => {
    document.body.dataset.state = shellState;
  }, [shellState]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Save game state automatically on change
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // Energy regenerates from timestamps (also while the app was closed); quests roll over at midnight
  useEffect(() => {
    const tick = () => {
      const t = Date.now();
      setGameState((prev) => {
        const regen = applyEnergyRegen(prev, t);
        return ensureDailyQuests(regen, dayKeyFromDate(new Date(t)));
      });
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Background music while playing, warm the item-art cache once
  useEffect(() => {
    if (shellState === 'playing' && !muted) soundFX.startAmbient();
    else soundFX.stopAmbient();
    return () => soundFX.stopAmbient();
  }, [shellState, muted]);
  useEffect(() => {
    preloadItemArt();
    prefetchScreens();
  }, []);

  // Offer the daily login reward once per calendar day when play begins
  useEffect(() => {
    if (shellState !== 'playing') return;
    setDailyLoginDay(getDailyLoginDay(gameState, dayKeyFromDate(new Date())));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shellState]);

  const handleStartGame = useCallback(() => {
    setShellState('playing');
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    soundFX.playOrderComplete();
  }, []);

  const handleToggleLanguage = useCallback(() => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  const handleToggleMute = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.currentTarget.blur();
    setMuted((prev) => {
      const next = !prev;
      soundFX.muted = next;
      return next;
    });
  }, []);

  const handleTogglePause = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.currentTarget.blur();
    setShellState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
  }, []);

  const handleResetGame = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.currentTarget.blur();
    clearSavedGameState();
    const fresh = createInitialGameState();
    setGameState(fresh);
    setHintPair(null);
    setShellState('playing');
    showFeedback(isAr ? 'تمت إعادة ضبط المجلس بنجاح!' : 'Majlis reset to fresh state!');
  }, [isAr, showFeedback]);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (shellState === 'title' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleStartGame();
        return;
      }

      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (shopModalOpen) {
          setShopModalOpen(false);
          return;
        }
        if (chainModalOpen) {
          setChainModalOpen(false);
          return;
        }
        if (leaderboardOpen) {
          setLeaderboardOpen(false);
          return;
        }
        if (gameState.activeStoryId) {
          return;
        }
        if (shellState === 'playing') {
          setShellState('paused');
        } else if (shellState === 'paused') {
          setShellState('playing');
        }
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shellState, shopModalOpen, chainModalOpen, leaderboardOpen, gameState.activeStoryId, handleStartGame, handleToggleMute]);

  // Cell Click / Tap Interaction
  const handleCellClick = (index: number) => {
    setHintPair(null);
    const clickedCell = gameState.board[index];
    if (!clickedCell) return;

    const itemDef = clickedCell.itemId ? ITEM_CATALOG[clickedCell.itemId] : null;

    // 1. If user taps a Generator tile, spawn item using active Power Boost multiplier!
    if (itemDef?.isGenerator && !clickedCell.sandLocked) {
      const res = spawnFromGenerator(gameState, index);
      if (res.spawnedItemId) {
        soundFX.playSpawn();
        const spawnedDef = ITEM_CATALOG[res.spawnedItemId];
        setGameState(res.state);
        showFeedback(
          isAr
            ? `أنتج المولّد (×${gameState.powerMultiplier}): ${spawnedDef.nameAr} (L${spawnedDef.level})`
            : `Spawned (×${gameState.powerMultiplier}): ${spawnedDef.nameEn} (Lv.${spawnedDef.level})`
        );
      } else if (res.reason === 'NO_ENERGY') {
        soundFX.playError();
        showFeedback(
          isAr
            ? 'نفدت الطاقة! افتح عجلة فنجال الصباح أو متجر الديوان لشحن الطاقة.'
            : 'Out of Energy! Spin the Morning Wheel or open Diwan Store for a refill.'
        );
        setEnergyOpen(true);
      } else if (res.reason === 'BOARD_FULL') {
        soundFX.playError();
        showFeedback(
          isAr
            ? 'اللوحة ممتلئة! ادمج العناصر أو انقل عنصراً لخزانة المؤونة.'
            : 'Board is full! Merge items or store an item in the Sadu Pantry.'
        );
      }
      return;
    }

    // 2. If no cell is currently selected: select this cell if it has an unlocked item
    if (gameState.selectedCellIndex === null) {
      if (clickedCell.itemId && !clickedCell.sandLocked) {
        soundFX.triggerHaptic('light');
        setGameState((prev) => ({ ...prev, selectedCellIndex: index }));
      } else if (clickedCell.sandLocked && clickedCell.itemId) {
        setSandPromptIndex(index);
        const lockedDef = ITEM_CATALOG[clickedCell.itemId];
        showFeedback(
          isAr
            ? `خلية مغطاة برمال النفود! ادمج معها (${lockedDef?.nameAr}) لفتحها.`
            : `Sand-locked tile! Merge a matching (${lockedDef?.nameEn}) onto it to unlock.`
        );
      }
      return;
    }

    // 3. If tapping the exact same cell: if it's a Majlis Chest, open it immediately! Otherwise deselect.
    if (gameState.selectedCellIndex === index) {
      if (itemDef?.isChest && !clickedCell.sandLocked) {
        handleOpenChest(index);
        return;
      }
      setGameState((prev) => ({ ...prev, selectedCellIndex: null }));
      return;
    }

    // 4. Attempt Merge, Move, or Swap from selectedCellIndex -> index
    const srcCell = gameState.board[gameState.selectedCellIndex];
    if (!srcCell || !srcCell.itemId || srcCell.sandLocked) {
      setGameState((prev) => ({ ...prev, selectedCellIndex: index }));
      return;
    }

    const moveRes = mergeOrMoveCells(gameState, gameState.selectedCellIndex, index);
    if (moveRes.action === 'MERGED' && moveRes.mergedItemId) {
      const mergedDef = ITEM_CATALOG[moveRes.mergedItemId];
      soundFX.playMerge(mergedDef?.level || 2);
      triggerMergeParticleBurst(index, moveRes.mergedItemId, {
        megaMerge: moveRes.megaMerge,
        comboCount: moveRes.comboCount,
      });
      handleMergeExtras(moveRes);
      setGameState(withMergeEventPoints(moveRes.state, moveRes.mergedItemId));
      showFeedback(
        isAr
          ? `دمج رائع! حصلت على: ${mergedDef.nameAr} (المستوى ${mergedDef.level})`
          : `Merged! Created: ${mergedDef.nameEn} (Lv.${mergedDef.level})`
      );
    } else if (moveRes.action === 'MOVED' || moveRes.action === 'SWAPPED') {
      soundFX.triggerHaptic('light');
      setGameState(moveRes.state);
    } else {
      if (clickedCell.itemId && !clickedCell.sandLocked) {
        setGameState((prev) => ({ ...prev, selectedCellIndex: index }));
      }
    }
  };

  // Pointer drag (works for touch, pen and mouse; HTML5 drag-and-drop never fires on phones)
  const handleDropOnCell = (fromIndex: number, targetIndex: number) => {
    if (fromIndex === targetIndex) return;
    const moveRes = mergeOrMoveCells(gameState, fromIndex, targetIndex);
    if (moveRes.action === 'MERGED' && moveRes.mergedItemId) {
      const mergedDef = ITEM_CATALOG[moveRes.mergedItemId];
      soundFX.playMerge(mergedDef?.level || 2);
      triggerMergeParticleBurst(targetIndex, moveRes.mergedItemId, {
        megaMerge: moveRes.megaMerge,
        comboCount: moveRes.comboCount,
      });
      handleMergeExtras(moveRes);
      setGameState(withMergeEventPoints(moveRes.state, moveRes.mergedItemId));
      showFeedback(
        isAr
          ? `دمج رائع! حصلت على: ${mergedDef.nameAr} (المستوى ${mergedDef.level})`
          : `Merged! Created: ${mergedDef.nameEn} (Lv.${mergedDef.level})`
      );
    } else if (moveRes.action === 'MOVED' || moveRes.action === 'SWAPPED') {
      soundFX.triggerHaptic('light');
      setGameState(moveRes.state);
    }
  };
  dropRef.current = handleDropOnCell;

  const handleCellPointerDown = (e: React.PointerEvent<HTMLButtonElement>, index: number) => {
    const cell = gameState.board[index];
    if (!cell?.itemId || cell.sandLocked || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const itemId = cell.itemId;
    let started = false;
    const cellAt = (x: number, y: number): number | null => {
      const el = document.elementFromPoint(x, y)?.closest('[data-cell-index]');
      return el ? Number((el as HTMLElement).dataset.cellIndex) : null;
    };
    const move = (ev: PointerEvent) => {
      if (!started && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 8) return;
      started = true;
      setDragGhost({ itemId, x: ev.clientX, y: ev.clientY, from: index, over: cellAt(ev.clientX, ev.clientY) });
    };
    const end = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      setDragGhost(null);
      if (!started || ev.type === 'pointercancel') return;
      suppressClickRef.current = true;
      window.setTimeout(() => (suppressClickRef.current = false), 0);
      const target = cellAt(ev.clientX, ev.clientY);
      if (target !== null) dropRef.current?.(index, target);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  };

  // Auto-Merge / Smart Hint Action
  const handleAutoMergeOrHint = () => {
    const pair = findBestMergePair(gameState.board);
    if (!pair) {
      soundFX.playError();
      showFeedback(
        isAr
          ? 'لا توجد عناصر متطابقة حالياً! انقر على المولّدات في الصف العلوي لإنتاج عناصر جديدة.'
          : 'No matching pairs on board! Tap a Generator in the top row to spawn new items.'
      );
      return;
    }
    const [fromIdx, toIdx] = pair;
    setHintPair(pair);
    const res = mergeOrMoveCells(gameState, fromIdx, toIdx);
    if (res.action === 'MERGED' && res.mergedItemId) {
      const mergedDef = ITEM_CATALOG[res.mergedItemId];
      soundFX.playMerge(mergedDef?.level || 2);
      triggerMergeParticleBurst(toIdx, res.mergedItemId, {
        megaMerge: res.megaMerge,
        comboCount: res.comboCount,
      });
      handleMergeExtras(res);
      setGameState(withMergeEventPoints(res.state, res.mergedItemId));
      showFeedback(
        isAr
          ? `دمج تلقائي: ${mergedDef.nameAr} (المستوى ${mergedDef.level})!`
          : `Auto-Merged: ${mergedDef.nameEn} (Lv.${mergedDef.level})!`
      );
    }
  };

  // Power Boost Multiplier Toggle (1x -> 2x -> 4x)
  const handleCyclePowerBoost = () => {
    soundFX.triggerHaptic('medium');
    setGameState((prev) => {
      const next = cyclePowerMultiplier(prev);
      showFeedback(
        isAr
          ? `مضاعف التحميص الآن ⚡×${next.powerMultiplier} (ينتج عناصر أعلى مباشرة!)`
          : `Roastery Overdrive set to ⚡×${next.powerMultiplier} (Spawns higher-level items!)`
      );
      return next;
    });
  };

  // Golden Brass Scissors Booster
  const handleUseScissors = () => {
    if (gameState.selectedCellIndex === null) {
      soundFX.playError();
      showFeedback(
        isAr
          ? 'حدد عنصراً من المستوى 2 أو أعلى على اللوحة لاستخدام المقص الذهبي!'
          : 'Select a Lv.2+ item on the board first to split it with Golden Scissors!'
      );
      return;
    }
    const res = useGoldenScissors(gameState, gameState.selectedCellIndex);
    if (res.split && res.lowerItemId) {
      soundFX.playMerge(2);
      const lowerDef = ITEM_CATALOG[res.lowerItemId];
      setGameState(res.state);
      showFeedback(
        isAr
          ? `المقص الذهبي: تم تقسيم العنصر إلى قطعتين من (${lowerDef.nameAr})!`
          : `Golden Scissors: Split into two (${lowerDef.nameEn}) items!`
      );
    } else {
      soundFX.playError();
      showFeedback(
        isAr
          ? 'لا يمكن تقسيم عناصر المستوى 1 أو المولّدات (أو نفدت المقصات)!'
          : 'Cannot split Lv.1 items or generators (or no Scissors left)!'
      );
    }
  };

  // Royal Joker Finjan Booster
  const handleUseJoker = () => {
    if (gameState.selectedCellIndex === null) {
      soundFX.playError();
      showFeedback(
        isAr
          ? 'حدد عنصراً على اللوحة لترقيته فوراً ببطاقة فنجال الجوكر الذهبي!'
          : 'Select an item on the board first to upgrade it with the Royal Joker!'
      );
      return;
    }
    const res = useJokerUpgrade(gameState, gameState.selectedCellIndex);
    if (res.upgraded && res.upgradedItemId) {
      const upDef = ITEM_CATALOG[res.upgradedItemId];
      soundFX.playOrderComplete();
      triggerMergeParticleBurst(gameState.selectedCellIndex, res.upgradedItemId);
      setGameState(res.state);
      showFeedback(
        isAr
          ? `فنجال الجوكر الملكي! تمت ترقية العنصر إلى: ${upDef.nameAr} (L${upDef.level})`
          : `Royal Joker Upgrade! Evolved into: ${upDef.nameEn} (Lv.${upDef.level})`
      );
    } else {
      soundFX.playError();
      showFeedback(
        isAr
          ? 'العنصر في الحد الأقصى (المستوى 6) أو نفدت بطاقات الجوكر!'
          : 'Item is already at Max Level or no Royal Jokers remaining!'
      );
    }
  };

  // Open Mergeable Majlis Chest on Board
  const handleOpenChest = (cellIdx: number) => {
    const res = openBoardChest(gameState, cellIdx);
    if (res.opened) {
      soundFX.playOrderComplete();
      setGameState(res.state);
      showFeedback(
        res.tier === 2
          ? isAr
            ? 'تم فتح صندوق الكنز الملكي المذهّب! +180 ر.س، +35💎، +65⚡، +1 مقص وجوكر!'
            : 'Opened Gilded Royal Chest! +180 SAR, +35💎, +65⚡, +1 Scissors & Joker!'
          : isAr
          ? 'تم فتح صندوق ضيافة السدو! +60 ر.س، +12💎، +25⚡ طاقة!'
          : 'Opened Wooden Sadu Chest! +60 SAR, +12💎, +25⚡ Energy!'
      );
    }
  };

  // Store selected item into Sadu Pantry Inventory
  const handleStoreInPantry = () => {
    if (gameState.selectedCellIndex === null) return;
    const res = storeBoardItemInInventory(gameState, gameState.selectedCellIndex);
    if (res.stored) {
      soundFX.triggerHaptic('medium');
      setGameState(res.state);
      showFeedback(
        isAr
          ? 'تم حفظ العنصر في خزانة المؤونة لتفريغ مساحة على اللوحة!'
          : 'Stored item in Sadu Pantry to free up board space!'
      );
    } else {
      soundFX.playError();
      showFeedback(
        isAr
          ? 'خزانة المؤونة ممتلئة (4/4) أو لا يمكن تخزين المولّدات.'
          : 'Sadu Pantry is full (4/4) or generators cannot be stored.'
      );
    }
  };

  // Retrieve item from Sadu Pantry Inventory back to board
  const handleRetrieveFromPantry = (invIndex: number) => {
    const res = retrieveInventoryItemToBoard(gameState, invIndex);
    if (res.retrieved) {
      soundFX.playSpawn();
      setGameState(res.state);
      showFeedback(
        isAr ? 'تمت استعادة العنصر إلى لوحة الدمج!' : 'Item returned to Merge Board!'
      );
    } else {
      soundFX.playError();
      showFeedback(
        isAr ? 'اللوحة ممتلئة! ادمج عنصرين أولاً.' : 'Board is full! Merge two items first.'
      );
    }
  };

  // Unlock Golden Bonus Bubble with Gems
  const handleUnlockBonusBubble = () => {
    const res = unlockBonusBubbleWithGems(gameState);
    if (res.unlocked) {
      soundFX.playOrderComplete();
      setGameState(res.state);
      showFeedback(
        isAr
          ? 'تم فتح الفقاعة الذهبية وإضافة العنصر إلى اللوحة!'
          : 'Golden Bonus Bubble unlocked and placed on board!'
      );
    } else {
      soundFX.playError();
      showFeedback(
        isAr
          ? 'رصيد الجواهر غير كافٍ أو اللوحة ممتلئة!'
          : 'Not enough Gems or board is full!'
      );
    }
  };

  // Fulfill Customer Order
  const handleFulfillOrder = (orderId: string) => {
    const servedOrder = gameState.activeOrders.find((o) => o.id === orderId);
    const res = fulfillCustomerOrder(gameState, orderId, activeSeason);
    if (res.fulfilled) {
      soundFX.playOrderComplete();
      if (servedOrder && isVoiceCharacter(servedOrder.customerId)) {
        soundFX.playVoice(servedOrder.customerId, servedOrder.isVip ? 'vip' : 'served');
      }
      setGameState(addEventPoints(res.state, Date.now(), EVENT_ORDER_POINTS));
      showFeedback(
        res.spawnedChest
          ? isAr
            ? 'تم تقديم ضيافة الموكب الملكي VIP! ربحت جواهر وصندوق ضيافة السدو على اللوحة!'
            : 'VIP Royal Order Served! Earned Bonus Gems & dropped a Majlis Chest on board!'
          : isAr
          ? 'تم تقديم الضيافة بنجاح! ربحت ريالات ذهبية ونجوم إعمار الدرعية'
          : 'Order Served! Earned Gold Riyals & Diriyah Renovation Stars'
      );
    } else {
      soundFX.playError();
      showFeedback(
        isAr
          ? 'العناصر المطلوبة غير جاهزة على اللوحة بعد. ادمج العناصر لتحضير الطلب!'
          : 'Required items are not on the board yet. Merge items to craft this order!'
      );
    }
  };

  // Spin Daily Finjan Al-Sabah Wheel
  const handleSpinWheel = (): WheelWedge | null => {
    const res = spinLuckyWheel(gameState);
    if (res.spun && res.wedge) {
      soundFX.playOrderComplete();
      setGameState(res.state);
      return res.wedge;
    }
    soundFX.playError();
    showFeedback(isAr ? 'رصيد الجواهر غير كافٍ للتدوير!' : 'Not enough Gems to spin!');
    return null;
  };

  // Vote in Weekly Mazayen Al-Majlis Showcase
  const handleVoteMazayen = (rivalId: string) => {
    const res = voteMazayenEntry(gameState, rivalId);
    if (res.voted) {
      soundFX.playOrderComplete();
      setGameState(res.state);
      showFeedback(
        isAr
          ? 'تم تسجيل صوتك في مزاين المجالس! ربحت +25 ريال ذهبي و+20 نقطة هيبة!'
          : 'Vote cast in Mazayen Al-Majlis! Earned +25 SAR & +20 Prestige Points!'
      );
    }
  };

  // Upgrade Majlis Renovation Zone
  const handleUpgradeZone = (zoneId: string, styleIndex?: number) => {
    const res = upgradeRenovationZone(gameState, zoneId, styleIndex);
    if (res.upgraded) {
      soundFX.playOrderComplete();
      setGameState(res.state);
      showFeedback(
        isAr
          ? 'تم ترميم وتحديث جناح المجلس بنجاح! زادت هيبة المقهى ومكافآت الطلبات.'
          : 'Majlis Wing Upgraded! Café prestige and order bonuses increased.'
      );

      if (isAreaComplete(res.state)) {
        showFeedback(
          isAr ? 'اكتمل ترميم المنطقة! انطلق إلى المنطقة التالية من شاشة المجلس.' : 'Area restored! Travel to the next area from the Majlis screen.'
        );
      }
    }
  };

  // Claim Story Chapter Reward
  const handleClaimStoryChapter = (chapterId: string) => {
    const chap = findStoryChapter(chapterId);
    soundFX.playOrderComplete();
    setGameState((prev) => {
      const alreadyClaimed = prev.completedStoryIds.includes(chapterId);
      const nextState: GameState = {
        ...prev,
        activeStoryId: null,
        completedStoryIds: alreadyClaimed ? prev.completedStoryIds : [...prev.completedStoryIds, chapterId],
        diamonds: alreadyClaimed ? prev.diamonds : prev.diamonds + (chap?.rewardDiamonds || 25),
        energy: alreadyClaimed ? prev.energy : prev.energy + (chap?.rewardEnergy || 30),
      };
      return nextState;
    });
  };

  // Buy Pack in Mada / Apple Pay Store
  const handleBuyShopPack = (
    _packId: string,
    energyGain: number,
    diamondsGain: number,
    coinsGain: number,
    activateVip?: boolean
  ) => {
    soundFX.playOrderComplete();
    setGameState((prev) => ({
      ...prev,
      energy: prev.energy + energyGain,
      maxEnergy: activateVip ? 150 : prev.maxEnergy,
      diamonds: prev.diamonds + diamondsGain,
      coins: prev.coins + coinsGain,
      vipPassActive: activateVip ? true : prev.vipPassActive,
    }));
  };

  // Claim LiveOps Milestone
  const handleClaimMilestone = (milestoneId: string) => {
    const m = gameState.liveOpsMilestones.find((item) => item.id === milestoneId);
    if (!m || m.claimed || gameState.liveOpsPoints < m.pointsRequired) return;

    soundFX.playOrderComplete();
    setGameState((prev) => ({
      ...prev,
      energy: m.rewardType === 'energy' ? prev.energy + m.rewardAmount : prev.energy,
      coins: m.rewardType === 'coins' ? prev.coins + m.rewardAmount : prev.coins,
      diamonds: m.rewardType === 'diamonds' ? prev.diamonds + m.rewardAmount : prev.diamonds,
      stars: m.rewardType === 'stars' ? prev.stars + m.rewardAmount : prev.stars,
      liveOpsMilestones: prev.liveOpsMilestones.map((item) =>
        item.id === milestoneId ? { ...item, claimed: true } : item
      ),
    }));
  };

  const handleBuyEnergy = (kind: 'gems' | 'coins') => {
    const r = kind === 'gems' ? buyEnergyWithGems(gameState) : buyEnergyWithCoins(gameState, dayKeyFromDate(new Date()));
    if (!r.bought) {
      soundFX.playError();
      return;
    }
    soundFX.playOrderComplete();
    setGameState(r.state);
  };
  const handleClaimQuest = (questId: string) => {
    const r = claimQuest(gameState, questId);
    if (r.claimed) {
      soundFX.playOrderComplete();
      setGameState(r.state);
    }
  };
  const handleClaimQuestBonus = () => {
    const r = claimQuestBonus(gameState);
    if (r.claimed) {
      soundFX.playLevelUp();
      setGameState(r.state);
    }
  };
  const handleUpgradeGenerator = (chain: ChainId) => {
    const r = upgradeGenerator(gameState, chain);
    if (!r.upgraded) {
      soundFX.playError();
      return;
    }
    soundFX.playMerge(4);
    setGameState(r.state);
  };
  const handleBuySand = () => {
    if (sandPromptIndex === null) return;
    const r = buySandTile(gameState, sandPromptIndex);
    setSandPromptIndex(null);
    if (!r.bought) {
      soundFX.playError();
      return;
    }
    soundFX.playMerge(2);
    setGameState(r.state);
  };
  const handleClaimEventMilestone = (index: number) => {
    const r = claimEventMilestone(gameState, Date.now(), index);
    if (!r.claimed) return;
    soundFX.playOrderComplete();
    soundFX.triggerHaptic('medium');
    setGameState(r.state);
  };
  const handleClaimDiscovery = (itemId: string) => {
    const r = claimDiscovery(gameState, itemId);
    if (!r.claimed) return;
    soundFX.playOrderComplete();
    soundFX.triggerHaptic('medium');
    setGameState(r.state);
  };
  const handleAdvanceArea = () => {
    const r = advanceArea(gameState);
    if (!r.advanced) return;
    soundFX.playLevelUp();
    setGameState(r.state);
    const info = areaInfo(r.state.areaIndex);
    showFeedback(isAr ? `مرحباً بك في ${info.nameAr}!` : `Welcome to ${info.nameEn}!`);
  };
  const handleClaimDailyLogin = () => {
    const res = claimDailyLoginReward(gameState, dayKeyFromDate(new Date()));
    setDailyLoginDay(null);
    if (!res.claimed) return;
    soundFX.playOrderComplete();
    setGameState(res.state);
    showFeedback(isAr ? `استلمت هدية اليوم ${res.day}!` : `Claimed Day ${res.day} reward!`);
  };
  const handleFinishPour = (fillPercent: number) => {
    const res = completePour(gameState, fillPercent);
    if (!res.poured) return;
    soundFX.playOrderComplete();
    setGameState(res.state);
  };
  const claimableQuests = questProgress(gameState).filter((r) => r.done && !r.claimed).length;
  const newDiscoveries = unclaimedDiscoveries(gameState);
  const discoveryCountRef = useRef(newDiscoveries.length);
  useEffect(() => {
    if (newDiscoveries.length > discoveryCountRef.current) {
      showFeedback(isAr ? '🎁 اكتشاف جديد! استلم مكافأته من «دليل السلاسل».' : '🎁 New discovery! Claim its reward in Chains.');
    }
    discoveryCountRef.current = newDiscoveries.length;
  }, [newDiscoveries.length, isAr, showFeedback]);
  const levelFloor = xpToReachLevel(gameState.level);
  const levelProgress = Math.min(1, Math.max(0, (gameState.xp - levelFloor) / (xpToReachLevel(gameState.level + 1) - levelFloor)));
  const canRenovate =
    isAreaComplete(gameState) ||
    gameState.renovationZones.some(
      (z) => z.unlockedLevel < 2 && gameState.stars >= (z.unlockedLevel === 0 ? z.starCostLevel1 : z.starCostLevel2)
    );

  const selectedCell =
    gameState.selectedCellIndex !== null ? gameState.board[gameState.selectedCellIndex] : null;
  const selectedItemDef =
    selectedCell && selectedCell.itemId ? ITEM_CATALOG[selectedCell.itemId] : null;

  const activeStoryChapter = findStoryChapter(gameState.activeStoryId);

  // The speaker greets the player when a story chapter opens
  const storyChapterId = activeStoryChapter ? activeStoryChapter.id : null;
  const storySpeaker = activeStoryChapter ? speakerCharacter(activeStoryChapter.speakerEn) : null;
  useEffect(() => {
    if (shellState === 'playing' && storyChapterId && storySpeaker) soundFX.playVoice(storySpeaker, 'greet');
  }, [storyChapterId, storySpeaker, shellState]);

  const tutorialStep = getTutorialStep(gameState);

  // ============================================================================
  // 1. TITLE SCREEN ('title')
  // ============================================================================
  if (shellState === 'title') {
    return (
      <main className="relative min-h-screen w-full bg-gradient-to-b from-[#2A1B12] via-[#3A2417] to-[#1E130D] text-[#FBF7F0] flex flex-col justify-between overflow-hidden select-none">
        <div className="h-3 w-full sadu-trim" />

        <div className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Column 1: Interactive Hero Centerpiece */}
          <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[#FFFDF9] border-4 border-[#F59E0B] shadow-[0_12px_50px_rgba(245,158,11,0.35)] flex items-center justify-center p-6 shrink-0">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <polygon
                points="100,10 126,42 168,32 158,74 190,100 158,126 168,168 126,158 100,190 74,158 32,168 42,126 10,100 42,74 32,32 74,42"
                fill="#FEF3C7"
                stroke="#D97706"
                strokeWidth="3.5"
              />
              <path
                d="M78,76 L122,76 L132,148 L68,148 Z"
                fill="#F59E0B"
                stroke="#2A180D"
                strokeWidth="4"
              />
              <path
                d="M78,78 L42,60 L62,102 Z"
                fill="#FBBF24"
                stroke="#2A180D"
                strokeWidth="3.5"
              />
              <path
                d="M122,82 C152,82 152,128 126,134"
                fill="none"
                stroke="#B45309"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M84,76 L100,40 L116,76 Z"
                fill="#D97706"
                stroke="#2A180D"
                strokeWidth="3.5"
              />
              <circle cx="100" cy="36" r="5" fill="#9E2A2B" />
              <path d="M73,112 L127,112" stroke="#9E2A2B" strokeWidth="5" />
            </svg>
          </div>

          {/* Column 2: Custom SVG Title Lockup & <= 3 Menu Actions */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-start max-w-xl">
            <svg viewBox="0 0 420 56" className="w-64 sm:w-80 h-auto mb-3">
              <rect x="2" y="6" width="416" height="44" rx="12" fill="#FFFDF9" stroke="#F59E0B" strokeWidth="3" />
              <text
                x="210"
                y="35"
                textAnchor="middle"
                fill="#92400E"
                fontSize="20"
                fontWeight="800"
                fontFamily="Cairo, Plus Jakarta Sans, sans-serif"
              >
                قهوة ومجلس · QAHWA &amp; MAJLIS
              </text>
            </svg>

            <h1
              className="text-3xl sm:text-5xl font-bold tracking-tight text-[#FBF7F0] leading-tight"
              style={{ textWrap: 'balance' }}
            >
              {isAr
                ? 'ادمج القهوة المختصة والعود الملكي وأعِد إعمار مجالس المملكة'
                : 'Merge Specialty Qahwa, Royal Oud & Restore Iconic Saudi Majlises'}
            </h1>

            <p className="mt-4 text-sm sm:text-base text-[#FDE68A]/90 leading-relaxed max-w-lg">
              {isAr
                ? 'اجمع بين أصالة الدلة النجدية والبن الخولاني والعود الكمبودي ومشروبات الـ V60، ولبِّ طلبات الضيوف في الدرعية وجدة التاريخية والعلا.'
                : 'Combine Saudi Khawlani Dallah hospitality, Cambodian Oud perfumery, and artisanal V60 pour-overs across Diriyah, Historic Jeddah, and AlUla.'}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-3.5 w-full sm:w-auto">
              <button
                type="button"
                data-start="true"
                onClick={handleStartGame}
                className="px-8 py-4 rounded-2xl btn-3d-green text-white font-extrabold text-base shadow-xl cursor-pointer whitespace-nowrap"
              >
                {isAr ? 'ابدأ اللعب الآن · Play Now' : 'Start Playing · ابدأ اللعب'}
              </button>

              <button
                type="button"
                onClick={handleToggleLanguage}
                className="px-5 py-4 rounded-2xl bg-[#FFFDF9] hover:bg-[#FEF3C7] border-2 border-[#D97706] text-[#78350F] font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                {isAr ? 'English · تغيير اللغة' : 'العربية · Switch Language'}
              </button>
            </div>
          </div>
        </div>

        <div className="relative z-10 pb-6 px-6 text-center text-xs text-[#FDE68A]/80">
          {isAr
            ? 'انقر على المولّدات لإنتاج البن والعود · اسحب أو انقر لدمج عنصرين متطابقين · Enter للبدء · P للإيقاف المؤقت'
            : 'Tap Generators to Spawn Qahwa & Oud · Drag or Tap 2 Matching Items to Merge · Enter to Start · P to Pause'}
        </div>
      </main>
    );
  }

  // ============================================================================
  // 2. ACTIVE PLAYING SHELL ('playing', 'paused', 'gameover')
  //    HIGH-CRAFT CASUAL MERGE-2 INTERFACE (GOSSIP HARBOR / TRAVEL TOWN BENCHMARK)
  // ============================================================================
  const totalRenovated = gameState.renovationZones.reduce((acc, z) => acc + z.unlockedLevel, 0);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#EDE0C8] via-[#F7F0E4] to-[#E5D3B3] text-[#2C1E14] flex flex-col justify-between select-none">
      <GameHud
        lang={lang}
        level={gameState.level}
        levelProgress={levelProgress}
        energy={gameState.energy}
        maxEnergy={gameState.maxEnergy}
        energyCountdownAt={(t: number) => msUntilNextEnergy(gameState, t)}
        coins={gameState.coins}
        gems={gameState.diamonds}
        muted={muted}
        freeSpins={gameState.freeSpinsAvailable}
        onEnergy={() => setEnergyOpen(true)}
        onCoins={() => setWorkshopOpen(true)}
        onGems={() => {
          setShopInitialTab('shop');
          setShopModalOpen(true);
        }}
        onSpin={() => {
          setLeaderboardSection('wheel');
          setLeaderboardOpen(true);
        }}
        onRank={() => {
          setLeaderboardSection('leaderboard');
          setLeaderboardOpen(true);
        }}
        onToggleLanguage={handleToggleLanguage}
        onToggleMute={() => handleToggleMute()}
        onPause={() => handleTogglePause()}
        onTransfer={() => setTransferOpen(true)}
        overlay={
          <>
            {levelUpToast && (
              <div role="status" data-testid="level-up-toast" className="level-up-toast px-4 py-2 rounded-2xl bg-[#10B981] text-white text-sm font-extrabold shadow-lg">
                {isAr ? `ارتقيت للمستوى ${levelUpToast.toLevel}! +${levelUpToast.gems}💎 +${levelUpToast.energy}⚡` : `Level ${levelUpToast.toLevel}! +${levelUpToast.gems}💎 +${levelUpToast.energy}⚡`}
              </div>
            )}
            {comboLive && gameState.comboCount >= 2 && (
              <div data-testid="combo-meter" className="combo-meter px-4 py-1 rounded-full bg-gradient-to-r from-[#B45309] to-[#F59E0B] text-[#1C1410] text-xs font-extrabold shadow">
                {isAr ? `كومبو ×${gameState.comboCount}` : `Combo ×${gameState.comboCount}`}
                <span className="combo-bar" style={{ animationDuration: `${COMBO_WINDOW_MS}ms` }} key={gameState.lastMergeAt} />
              </div>
            )}
            {feedbackBanner && (
              <div role="status" className="max-w-[440px] text-center px-3 py-1 rounded-full bg-[#3E2723]/95 border border-[#FBBF24] text-[11px] font-bold text-[#FEF3C7] shadow truncate">
                {feedbackBanner}
              </div>
            )}
            {workspace === 'merge' && tutorialStep === 'merge' && (
              <div data-testid="tutorial-coach" className="pointer-events-auto max-w-[440px] w-full flex items-start gap-2 rounded-2xl bg-[#ECFDF5] border-2 border-[#10B981] shadow-lg px-3 py-2 text-xs font-bold text-[#065F46]">
                <span className="flex-1 leading-relaxed">
                  {isAr
                    ? 'اسحب عنصراً فوق عنصر مطابق (أو انقر الاثنين) لدمجهما. الإطار الأخضر يعني دمجاً ممكناً.'
                    : 'Drag an item onto a matching one (or tap both) to merge. A green ring means a match.'}
                </span>
                <button type="button" onClick={() => setGameState((prev) => ({ ...prev, tutorialDismissed: true }))} className="shrink-0 underline">
                  {isAr ? 'تخطي' : 'Skip'}
                </button>
              </div>
            )}
          </>
        }
        below={<LiveEventBar lang={lang} state={gameState} onOpen={() => setEventOpen(true)} />}
      />

      {/* 2. MAIN CENTERED STAGE (Clean, Uncluttered Gossip Harbor / Travel Town Layout) */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-2 sm:px-5 pt-1.5 pb-24 flex flex-col gap-1.5">

        {/* Persistent prompts sit just above the bottom navigation */}
        <div className="fixed bottom-[64px] inset-x-0 z-30 flex flex-col items-center gap-1.5 px-3 pointer-events-none">
          {/* B. FLOATING GOLDEN BONUS BUBBLE DEAL (When Active) */}
          {workspace === 'merge' && gameState.bonusBubble && (
            <div data-testid="bonus-bubble" className="pointer-events-auto max-w-[440px] level-up-toast w-full rounded-2xl bg-gradient-to-r from-[#FEF3C7] via-[#FDE68A] to-[#FEF3C7] border-2 border-[#D97706] px-3 py-1.5 flex items-center justify-between gap-2 shadow-xl">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-[#0284C7] flex items-center justify-center shrink-0 shadow-sm">
                  <ItemArtwork itemId={gameState.bonusBubble.itemId} size="sm" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-black text-[#B45309] uppercase block">
                    {isAr ? 'فقاعة البركة الذهبية!' : 'BONUS BUBBLE!'}
                  </span>
                  <span className="text-xs font-extrabold text-[#2C1E14] truncate block">
                    {isAr
                      ? ITEM_CATALOG[gameState.bonusBubble.itemId]?.nameAr
                      : ITEM_CATALOG[gameState.bonusBubble.itemId]?.nameEn}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleUnlockBonusBubble}
                  className="px-2.5 py-1 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-xs inline-flex items-center gap-1 cursor-pointer shadow"
                >
                  <Gem className="w-3 h-3" />
                  <span>{gameState.bonusBubble.gemCost}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGameState((prev) => ({ ...prev, bonusBubble: null }))}
                  className="px-2 py-1 rounded-xl bg-[#D6BE9C] hover:bg-[#C8AF87] text-xs font-bold text-[#3E2723] cursor-pointer"
                >
                  {isAr ? 'تخطي' : 'Skip'}
                </button>
              </div>
            </div>
          )}

          {sandPromptIndex !== null && gameState.board[sandPromptIndex]?.sandLocked && (
            <div data-testid="sand-prompt" className="pointer-events-auto max-w-[440px] w-full flex items-center gap-2 rounded-2xl bg-[#FFFDF9] border-2 border-[#D97706] shadow-xl px-3 py-2 text-[#3E2723]">
              <span className="flex-1 text-xs font-bold">{isAr ? 'أزل الرمال عن هذه الخلية بالريالات؟' : 'Clear the sand from this tile with coins?'}</span>
              <button type="button" onClick={handleBuySand} disabled={gameState.coins < sandClearCost(gameState)} className="rounded-xl btn-3d-amber text-[#3B2410] text-xs font-extrabold px-3 py-1.5 disabled:opacity-40">
                {sandClearCost(gameState)} 🪙
              </button>
              <button type="button" onClick={() => setSandPromptIndex(null)} className="text-xs font-bold text-[#92400E] px-1">✕</button>
            </div>
          )}
          {workspace === 'merge' && tutorialStep === 'serve' && (
            <div data-testid="tutorial-coach" className="pointer-events-auto max-w-[440px] w-full flex items-start gap-2 rounded-2xl bg-[#ECFDF5] border-2 border-[#10B981] shadow-lg px-3 py-2 text-xs font-bold text-[#065F46]">
              <span className="flex-1 leading-relaxed">
                {isAr
                  ? 'ممتاز! جهّز العناصر ذات علامة ✓ ثم اضغط «تقديم» في بطاقة الضيف.'
                  : 'Nice! Gather the items marked ✓, then press Serve on the guest card.'}
              </span>
              <button type="button" onClick={() => setGameState((prev) => ({ ...prev, tutorialDismissed: true }))} className="shrink-0 underline">
                {isAr ? 'تخطي' : 'Skip'}
              </button>
            </div>
          )}
        </div>

        {workspace === 'majlis' ? (
          <Suspense fallback={<div className="h-64 rounded-2xl bg-[#241812] animate-pulse" />}>
          <MajlisRenovationView
            lang={lang}
            zones={gameState.renovationZones}
            stars={gameState.stars}
            activeRegion={gameState.activeRegion}
            ambiance={gameState.ambiance}
            completedStoryIds={gameState.completedStoryIds}
            onUpgradeZone={handleUpgradeZone}
            areaIndex={gameState.areaIndex}
            areaComplete={isAreaComplete(gameState)}
            styleCost={styleChangeCost(gameState)}
            coins={gameState.coins}
            onAdvanceArea={handleAdvanceArea}
            onChangeAmbiance={(ambiance: MajlisAmbiance) => {
              soundFX.playMerge(3);
              setGameState((prev) => ({ ...prev, ambiance }));
            }}
            onOpenStory={(storyId) =>
              setGameState((prev) => ({ ...prev, activeStoryId: storyId }))
            }
          />
          </Suspense>
        ) : (
          /* FOCUSED SINGLE-COLUMN MERGE-2 STAGE (Exact Gossip Harbor / Travel Town Proportions) */
          <div className="w-full max-w-[430px] mx-auto flex flex-col items-center gap-1.5">
            {/* A. GOSSIP HARBOR-STYLE CUSTOMER ORDER TRAY (Directly Above the Board) */}
            <section
              aria-label={isAr ? 'شريط طلبات الضيوف العلوي' : 'Top Customer Order Dock'}
              className="w-full grid grid-cols-3 gap-1.5"
            >
              {gameState.activeOrders.map((order) => {
                const readyIndices = findCellsForOrder(
                  gameState.board,
                  order.requiredItemIds
                );
                const isReady = readyIndices !== null;

                return (
                  <div
                    key={order.id}
                    className={`relative rounded-2xl p-1.5 sm:p-2 border-2 flex flex-col justify-between transition-all shadow-md overflow-hidden ${
                      isReady
                        ? 'bg-gradient-to-b from-[#ECFDF5] to-[#D1FAE5] border-[#059669] ring-2 ring-[#10B981]/40'
                        : order.isVip
                        ? 'bg-gradient-to-b from-[#FFFBEB] to-[#FEF3C7] border-[#D97706]'
                        : 'bg-gradient-to-b from-[#FFFDF9] to-[#F5EBD9] border-[#C8AF87]'
                    }`}
                  >
                    {/* VIP Rush Ribbon */}
                    {order.isVip && (
                      <span className="absolute top-1 end-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-[#D97706] to-[#B45309] text-white text-[8px] font-black shadow z-10">
                        VIP
                      </span>
                    )}

                    {/* Character Bust + Name + Coin/Star Reward */}
                    <div className="flex items-center gap-1">
                      <CustomerPortrait avatarKey={order.customerId} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] sm:text-[11px] font-extrabold text-[#2C1E14] truncate">
                          {isAr ? order.customerNameAr : order.customerNameEn}
                        </div>
                        <div className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-black tabular-nums text-[#B45309]">
                          <span>+{order.rewardCoins}</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-0.5 text-[#D97706]">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {order.rewardStars}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Speech-Bubble Recipe Tray + Serve CTA */}
                    <div className="mt-1 pt-1 border-t border-[#D4B483]/50 flex flex-row items-center justify-between gap-1">
                      <div className="flex items-center justify-start gap-0.5 min-w-0">
                        {order.requiredItemIds.map((reqId, idx) => {
                          const reqDef = ITEM_CATALOG[reqId];
                          const hasItem = gameState.board.some(
                            (c) => !c.sandLocked && c.itemId === reqId
                          );
                          return (
                            <button
                              key={`${order.id}_top_${reqId}_${idx}`}
                              type="button"
                              onClick={() => {
                                if (reqDef && reqDef.chain !== 'generator') {
                                  setChainModalCategory(reqDef.chain);
                                  setChainModalOpen(true);
                                }
                              }}
                              title={isAr ? reqDef?.nameAr : reqDef?.nameEn}
                              className={`relative w-7 h-7 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 shrink-0 ${
                                hasItem
                                  ? 'bg-[#DCFCE7] border-[#10B981] shadow-sm'
                                  : 'bg-[#F8EFE0] border-[#D4B483]'
                              }`}
                            >
                              <ItemArtwork itemId={reqId} size="sm" />
                              {hasItem && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#10B981] border border-white text-white flex items-center justify-center shadow">
                                  <Check className="w-2 h-2 stroke-[3.5]" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleFulfillOrder(order.id)}
                        className={`px-1.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer whitespace-nowrap text-center shrink-0 ${
                          isReady
                            ? 'btn-3d-green text-white'
                            : 'bg-[#E6D5B8] text-[#785A3C] hover:bg-[#DBC6A4]'
                        }`}
                      >
                        {isReady
                          ? isAr
                            ? 'تقديم!'
                            : 'Serve!'
                          : isAr
                          ? 'تحضير'
                          : 'Craft'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* C. CARVED NAJDI WOOD & SUN-LIT IVORY 7×7 MERGE BOARD */}
            <div className="w-full rounded-3xl board-wood-frame p-2 sm:p-2.5 border-2 border-[#563216]">
              {/* Top Bezel Booster Bar */}
              <div className="flex items-center justify-between mb-1.5 px-1 gap-1">
                <div className="flex items-center gap-1.5">
                  <button
                    aria-label={isAr ? 'دمج تلقائي' : 'Auto-Merge'}
                    type="button"
                    onClick={handleAutoMergeOrHint}
                    className="px-2.5 py-1 rounded-xl btn-3d-green text-white text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span className="hidden min-[360px]:inline">{isAr ? 'دمج تلقائي' : 'Auto-Merge'}</span>
                  </button>

                  <button
                    aria-label={isAr ? 'دليل السلاسل' : 'Chains'}
                    type="button"
                    onClick={() => {
                      const firstNew = newDiscoveries.length ? ITEM_CATALOG[newDiscoveries[0]]?.chain : null;
                      setChainModalCategory(
                        firstNew && firstNew !== 'generator'
                          ? firstNew
                          : selectedItemDef && selectedItemDef.chain !== 'generator'
                          ? selectedItemDef.chain
                          : 'qahwa'
                      );
                      setChainModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-[#FFFDF9] hover:bg-[#FEF3C7] border border-[#D4B483] text-[#5C3A21] text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-sm"
                  >
                    <Info className="w-3 h-3 text-[#D97706]" />
                    <span className="hidden min-[360px]:inline">{isAr ? 'دليل السلاسل' : 'Chains'}</span>
                    {newDiscoveries.length > 0 && (
                      <span data-testid="discovery-badge" className="min-w-[16px] h-4 px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-black flex items-center justify-center">
                        {newDiscoveries.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Right: Scissors, Joker & Power Multiplier */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleUseScissors}
                    title={isAr ? 'المقص الذهبي: يقسم أي عنصر (L2+) إلى قطعتين' : 'Golden Scissors: Split any Lv.2+ item'}
                    className="px-2 py-1 rounded-xl bg-[#FFFDF9] hover:bg-[#FCE7F3] border border-[#DB2777] text-[#9D174D] text-[11px] font-black tabular-nums inline-flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Scissors className="w-3 h-3" />
                    <span>{gameState.scissorsCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUseJoker}
                    title={isAr ? 'فنجال الجوكر: يرقّي أي عنصر للمستوى التالي فوراً' : 'Royal Joker: Upgrade any item +1 Level'}
                    className="px-2 py-1 rounded-xl bg-[#FFFDF9] hover:bg-[#F3E8FF] border border-[#7C3AED] text-[#5B21B6] text-[11px] font-black tabular-nums inline-flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>{gameState.jokerCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCyclePowerBoost}
                    aria-label={isAr ? 'تغيير مضاعف الطاقة' : 'Toggle Power Boost Multiplier'}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black tabular-nums inline-flex items-center gap-1 transition-all cursor-pointer shadow-sm ${
                      gameState.powerMultiplier === 4
                        ? 'bg-[#DC2626] text-white border border-[#991B1B]'
                        : gameState.powerMultiplier === 2
                        ? 'btn-3d-amber text-[#3E2723]'
                        : 'bg-[#FFFDF9] border border-[#D4B483] text-[#78350F]'
                    }`}
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    <span>×{gameState.powerMultiplier}</span>
                  </button>
                </div>
              </div>

              {/* 7×7 Inner Recessed Board Well + High-Level Merge Particle Overlay */}
              <div className="relative w-full">
                <div
                  data-testid="merge-board-grid"
                  className="grid grid-cols-7 gap-1 sm:gap-1.5 aspect-square w-full board-inner-well p-1.5 sm:p-2 rounded-2xl"
                >
                  {gameState.board.map((cell) => {
                    const itemDef = cell.itemId ? ITEM_CATALOG[cell.itemId] : null;
                    const isSelected = gameState.selectedCellIndex === cell.index;
                    const isCelebrating = Boolean(celebratingCells[cell.index]);
                    const isHinted =
                      hintPair !== null &&
                      (hintPair[0] === cell.index || hintPair[1] === cell.index);

                    const isMergeTarget =
                      selectedCell &&
                      selectedCell.index !== cell.index &&
                      !selectedCell.sandLocked &&
                      canMergeItems(selectedCell.itemId, cell.itemId);

                    const isOrderNeeded =
                      !cell.sandLocked &&
                      cell.itemId !== null &&
                      gameState.activeOrders.some((o) =>
                        o.requiredItemIds.includes(cell.itemId!)
                      );

                    const isEvenChecker = (cell.row + cell.col) % 2 === 0;

                    const tileSurfaceClass = cell.sandLocked
                      ? 'tile-locked-3d opacity-95'
                      : itemDef?.isGenerator
                      ? 'tile-generator-3d hover:scale-[1.03]'
                      : itemDef?.isChest
                      ? 'tile-chest-3d hover:scale-[1.03]'
                      : isOrderNeeded
                      ? 'tile-ready-3d active:scale-95'
                      : isEvenChecker
                      ? 'tile-ivory active:scale-95'
                      : 'tile-sand active:scale-95';

                    const accessibleLabel = itemDef
                      ? `${isAr ? itemDef.nameAr : itemDef.nameEn} ${
                          itemDef.isGenerator
                            ? isAr
                              ? 'مولد'
                              : 'Generator'
                            : `Lv.${itemDef.level}`
                        } ${cell.sandLocked ? (isAr ? 'مغطى بالرمال' : 'Sand-Locked') : ''} (${
                          cell.row + 1
                        },${cell.col + 1})`
                      : `${isAr ? 'خلية فارغة' : 'Empty Tile'} (${cell.row + 1},${cell.col + 1})`;

                    return (
                      <button
                        key={cell.index}
                        type="button"
                        aria-label={accessibleLabel}
                        data-cell-index={cell.index}
                        onPointerDown={(e) => handleCellPointerDown(e, cell.index)}
                        onClick={() => {
                          if (suppressClickRef.current) return;
                          handleCellClick(cell.index);
                        }}
                        className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-transform cursor-pointer select-none touch-none ${tileSurfaceClass} ${
                          dragGhost?.from === cell.index ? 'opacity-40' : ''
                        } ${
                          dragGhost && dragGhost.over === cell.index && dragGhost.from !== cell.index ? 'ring-3 ring-[#FDE047] scale-[1.06] z-10' : ''
                        } ${
                          isSelected
                            ? 'ring-3 ring-[#F59E0B] scale-[1.05] z-10'
                            : ''
                        } ${
                          isMergeTarget || isHinted
                            ? 'ring-3 ring-[#10B981]'
                            : ''
                        } ${
                          isCelebrating
                            ? 'merge-tile-celebrate ring-3 ring-[#FDE047] shadow-[0_0_18px_rgba(250,204,21,0.85)] z-20'
                            : ''
                        }`}
                      >
                        {itemDef && (
                          <>
                            <ItemArtwork itemId={itemDef.id} size="md" />

                            {/* Clean Gossip-Harbor Style Corner Badge */}
                            {itemDef.isGenerator ? (
                              <span className="absolute bottom-0.5 right-0.5 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-gradient-to-b from-[#FDE047] to-[#D97706] border border-[#78350F] text-[#3E2723] flex items-center justify-center shadow">
                                <Zap className="w-2.5 h-2.5 fill-current" />
                              </span>
                            ) : (
                              <span className="absolute bottom-0.5 left-0.5 px-1 min-w-[16px] h-4 rounded-md bg-[#3E2723]/85 text-[#FFFDF9] text-[9px] font-black tabular-nums flex items-center justify-center leading-none">
                                {itemDef.level}
                              </span>
                            )}

                            {/* Order Needed Green Checkmark Badge */}
                            {isOrderNeeded && (
                              <span
                                title={isAr ? 'مطلوب لطلب ضيف' : 'Needed for Order'}
                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] border border-white text-white flex items-center justify-center shadow"
                              >
                                <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                              </span>
                            )}

                            {/* Sand-Locked Ribbon Badge */}
                            {cell.sandLocked && (
                              <span
                                title={isAr ? 'ادمج عنصراً مطابقاً لفتح القفل' : 'Merge matching item to unlock'}
                                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#78350F] border border-[#FDE68A] text-[#FDE68A] flex items-center justify-center shadow"
                              >
                                <Lock className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
                <MergeParticleOverlay bursts={mergeBursts} lang={lang} />
                {dragGhost && (
                  <div
                    aria-hidden="true"
                    data-testid="drag-ghost"
                    className="fixed z-50 pointer-events-none w-16 h-16 -translate-x-1/2 -translate-y-[70%] drop-shadow-[0_8px_10px_rgba(0,0,0,0.45)] scale-110"
                    style={{ left: dragGhost.x, top: dragGhost.y }}
                  >
                    <ItemArtwork itemId={dragGhost.itemId} size="md" />
                  </div>
                )}
              </div>
            </div>

{(gameState.pourTokens > 0 || activeSeason) && (
              <div className="w-full flex gap-1.5">
                {activeSeason && (
                  <div data-testid="season-banner" className="flex-1 min-w-0 truncate rounded-2xl bg-gradient-to-r from-[#065F46] to-[#047857] border border-[#34D399] px-3 py-1.5 text-[11px] font-bold text-[#D1FAE5]">
                    {isAr ? activeSeason.nameAr : activeSeason.nameEn} · {isAr ? activeSeason.descAr : activeSeason.descEn}
                  </div>
                )}
                {gameState.pourTokens > 0 && (
                  <button type="button" data-testid="pour-challenge-button" onClick={() => setPourOpen(true)} className="shrink-0 rounded-2xl btn-3d-amber px-3 py-1.5 text-[11px] font-extrabold text-[#3B2410]">
                    ☕ {isAr ? 'تحدي ربع الفنجال' : "Rub'a challenge"} ({gameState.pourTokens})
                  </button>
                )}
              </div>
            )}

                        {/* D. BOTTOM INSPECTOR & 4-SLOT SADU PANTRY TRAY (Clean Single-Row/Card Dock Below Board) */}
            <section
              aria-label={isAr ? 'تفاصيل العنصر وخزانة المؤونة' : 'Item Inspector & Sadu Pantry'}
              className="w-full rounded-2xl bg-[#FFFDF9] border-2 border-[#C8AF87] p-3 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
            >
              {/* Left: Selected Item Inspector */}
              <div className="flex items-center justify-between gap-2.5 flex-1 min-w-0">
                {selectedItemDef ? (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl tile-ivory flex items-center justify-center shrink-0">
                        <ItemArtwork itemId={selectedItemDef.id} size="md" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-black text-[#2C1E14] truncate">
                            {isAr ? selectedItemDef.nameAr : selectedItemDef.nameEn}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[#EDE0C7] text-[#5C3A21] text-[10px] font-extrabold tabular-nums">
                            L{selectedItemDef.level}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B4F35] truncate mt-0.5">
                          {isAr ? selectedItemDef.descAr : selectedItemDef.descEn}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {selectedItemDef.isChest && gameState.selectedCellIndex !== null ? (
                        <button
                          type="button"
                          onClick={() => handleOpenChest(gameState.selectedCellIndex!)}
                          className="px-3 py-1.5 rounded-xl btn-3d-green text-white text-xs font-extrabold cursor-pointer whitespace-nowrap"
                        >
                          {isAr ? 'فتح!' : 'Open!'}
                        </button>
                      ) : !selectedItemDef.isGenerator ? (
                        <>
                          <button
                            type="button"
                            onClick={handleStoreInPantry}
                            className="px-2.5 py-1.5 rounded-xl bg-[#E0F2FE] hover:bg-[#BAE6FD] border border-[#0284C7] text-[#0369A1] text-xs font-extrabold cursor-pointer whitespace-nowrap"
                          >
                            {isAr ? 'تخزين' : 'Store'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              gameState.selectedCellIndex !== null &&
                              setGameState((prev) =>
                                sellBoardItem(prev, prev.selectedCellIndex!)
                              )
                            }
                            className="px-2.5 py-1.5 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#D97706] text-[#92400E] text-xs font-extrabold cursor-pointer whitespace-nowrap"
                          >
                            +{selectedItemDef.sellValue}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <div className="text-xs font-bold text-[#785A3C] py-1">
                    {isAr
                      ? 'انقر على أي مولّد (⚡) لإنتاج البن والعود، أو اسحب عنصرين متطابقين لدمجهما!'
                      : 'Tap any Generator (⚡) to spawn items, or drag two matching items to merge!'}
                  </div>
                )}
              </div>

              {/* Right: 4-Slot Sadu Pantry Storage Tray */}
              <div className="flex items-center gap-1.5 pt-2 sm:pt-0 sm:ps-3 border-t sm:border-t-0 sm:border-s border-[#E2CFAF] shrink-0">
                <span
                  title={isAr ? 'خزانة المؤونة (4 خانات)' : 'Sadu Pantry Storage (4 Slots)'}
                  className="w-8 h-8 rounded-xl bg-[#5C3A21] text-[#FDE68A] flex items-center justify-center shrink-0"
                >
                  <Package className="w-4 h-4" />
                </span>
                {Array.from({ length: gameState.inventoryCapacity }).map((_, slotIdx) => {
                  const storedId = gameState.inventory[slotIdx];
                  const storedDef = storedId ? ITEM_CATALOG[storedId] : null;
                  return (
                    <button
                      key={`pantry_slot_${slotIdx}`}
                      type="button"
                      onClick={() => storedId && handleRetrieveFromPantry(slotIdx)}
                      aria-label={
                        storedDef
                          ? isAr
                            ? `استعادة ${storedDef.nameAr} من الخزانة`
                            : `Retrieve ${storedDef.nameEn} from Pantry`
                          : isAr
                          ? 'خانة خزانة فارغة'
                          : 'Empty Pantry Slot'
                      }
                      className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                        storedDef
                          ? 'tile-ivory border-[#D97706] hover:scale-105 cursor-pointer'
                          : 'bg-[#F4EAD5] border-dashed border-[#C8AF87] text-[9px] font-bold text-[#9C7E5A]'
                      }`}
                    >
                      {storedDef ? (
                        <ItemArtwork itemId={storedDef.id} size="sm" />
                      ) : (
                        <span>+</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Modals: Story Chapter Dialogue, Mada/Apple Pay Shop, Chain Evolution Tree, KSA Leaderboard/Mazayen/Wheel, and Pause / Victory Modal */}
      <BottomNav
        lang={lang}
        active={workspace === 'majlis' ? 'majlis' : 'merge'}
        stars={gameState.stars}
        canRenovate={canRenovate}
        questBadge={claimableQuests}
        onSelect={(tab: NavTab) => {
          soundFX.triggerHaptic('light');
          if (tab === 'merge' || tab === 'majlis') setWorkspace(tab);
          else if (tab === 'quests') setQuestsOpen(true);
          else if (tab === 'workshop') setWorkshopOpen(true);
          else {
            setShopInitialTab('shop');
            setShopModalOpen(true);
          }
        }}
      />

      {transferOpen && (
        <Suspense fallback={null}>
          <SaveTransferModal
            lang={lang}
            state={gameState}
            onClose={() => setTransferOpen(false)}
            onImport={(imported) => {
              discoveryCountRef.current = unclaimedDiscoveries(imported).length;
              setGameState(imported);
              setTransferOpen(false);
              soundFX.playLevelUp();
              showFeedback(isAr ? 'تم نقل تقدمك بنجاح!' : 'Progress transferred!');
            }}
          />
        </Suspense>
      )}

      {eventOpen && (
        <LiveEventModal lang={lang} state={gameState} onClose={() => setEventOpen(false)} onClaim={handleClaimEventMilestone} />
      )}

      {energyOpen && (
        <EnergyModal
          lang={lang}
          state={gameState}
          onClose={() => setEnergyOpen(false)}
          onBuyWithGems={() => handleBuyEnergy('gems')}
          onBuyWithCoins={() => handleBuyEnergy('coins')}
          onOpenShop={() => {
            setEnergyOpen(false);
            setShopInitialTab('shop');
            setShopModalOpen(true);
          }}
        />
      )}
      {questsOpen && (
        <QuestsModal lang={lang} state={gameState} onClose={() => setQuestsOpen(false)} onClaim={handleClaimQuest} onClaimBonus={handleClaimQuestBonus} />
      )}
      {workshopOpen && (
        <WorkshopModal lang={lang} state={gameState} onClose={() => setWorkshopOpen(false)} onUpgrade={handleUpgradeGenerator} />
      )}
      <DailyLoginModal lang={lang} day={gameState.activeStoryId ? null : dailyLoginDay} onClaim={handleClaimDailyLogin} />
      {pourOpen && (
        <Suspense fallback={null}>
        <FinjanPourModal lang={lang} isOpen={pourOpen} tokens={gameState.pourTokens} onFinish={handleFinishPour} onClose={() => setPourOpen(false)} />
        </Suspense>
      )}

      <StoryDialogueModal
        lang={lang}
        chapter={activeStoryChapter}
        onClose={handleClaimStoryChapter}
      />

      {chainModalOpen && (
        <Suspense fallback={null}>
          <ChainTreeModal
            lang={lang}
            isOpen={chainModalOpen}
            initialChain={chainModalCategory}
            discoveredItemIds={gameState.discoveredItemIds}
            claimableItemIds={newDiscoveries}
            onClaimDiscovery={handleClaimDiscovery}
            onClose={() => setChainModalOpen(false)}
          />
        </Suspense>
      )}

      {leaderboardOpen && (
        <Suspense fallback={null}>
          <LeaderboardModal
            lang={lang}
            isOpen={leaderboardOpen}
            initialSection={leaderboardSection}
            playerPrestige={gameState.prestigePoints}
            ordersCompleted={gameState.ordersCompleted}
            totalRenovated={totalRenovated}
            freeSpinsAvailable={gameState.freeSpinsAvailable}
            diamonds={gameState.diamonds}
            mazayenVotesRemaining={gameState.mazayenVotesRemaining}
            votedRivalIds={gameState.votedRivalIds}
            onSpinWheel={handleSpinWheel}
            onVoteMazayen={handleVoteMazayen}
            onClose={() => setLeaderboardOpen(false)}
          />
        </Suspense>
      )}

      {shopModalOpen && (
        <Suspense fallback={null}>
          <ShopAndMadaModal
            lang={lang}
            isOpen={shopModalOpen}
            initialTab={shopInitialTab}
            coins={gameState.coins}
            diamonds={gameState.diamonds}
            liveOpsPoints={gameState.liveOpsPoints}
            milestones={gameState.liveOpsMilestones}
            discoveredItemIds={gameState.discoveredItemIds}
            vipPassActive={gameState.vipPassActive}
            onClose={() => setShopModalOpen(false)}
            onBuyPack={handleBuyShopPack}
            onClaimMilestone={handleClaimMilestone}
          />
        </Suspense>
      )}

      {/* PAUSE OR VICTORY MODAL ('paused' | 'gameover') */}
      {(shellState === 'paused' || shellState === 'gameover') && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={shellState === 'gameover' ? 'Majlis Restoration Complete' : 'Game Paused'}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
        >
          <div className="w-full max-w-md rounded-3xl border-4 border-[#C68B59] bg-[#FFFDF9] text-[#2C1E14] p-6 shadow-2xl text-center space-y-5">
            <div className="h-2 w-full sadu-trim rounded" />
            <h2 className="text-2xl font-black text-[#78350F]">
              {shellState === 'gameover'
                ? isAr
                  ? 'اكتمل إعمار قصر الدرعية الملكي!'
                  : 'Royal Diriyah Majlis Fully Restored!'
                : isAr
                ? 'استراحة المجلس (إيقاف مؤقت)'
                : 'Majlis Paused'}
            </h2>

            {/* 3 Tabular-Nums Stat Tiles */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl bg-[#F6EBD8] border border-[#D4B483] p-3">
                <span className="text-[10px] font-bold text-[#785A3C] block">
                  {isAr ? 'الطلبات المنجزة' : 'ORDERS'}
                </span>
                <span className="text-lg tabular-nums font-black text-[#2C1E14]">
                  {gameState.ordersCompleted}
                </span>
              </div>
              <div className="rounded-2xl bg-[#F6EBD8] border border-[#D4B483] p-3">
                <span className="text-[10px] font-bold text-[#785A3C] block">
                  {isAr ? 'إجمالي الدمج' : 'MERGES'}
                </span>
                <span className="text-lg tabular-nums font-black text-[#D97706]">
                  {gameState.totalMerges}
                </span>
              </div>
              <div className="rounded-2xl bg-[#F6EBD8] border border-[#D4B483] p-3">
                <span className="text-[10px] font-bold text-[#785A3C] block">
                  {isAr ? 'الإعمار' : 'ESTATE'}
                </span>
                <span className="text-lg tabular-nums font-black text-[#059669]">
                  {totalRenovated}/8
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                data-start="true"
                onClick={() => setShellState('playing')}
                className="w-full py-3 rounded-2xl btn-3d-green text-white font-extrabold text-sm cursor-pointer"
              >
                {shellState === 'gameover'
                  ? isAr
                    ? 'مواصلة اللعب في القصر الملكي'
                    : 'Continue Playing in Royal Mode'
                  : isAr
                  ? 'استئناف اللعب (Resume)'
                  : 'Resume Game'}
              </button>

              <button
                type="button"
                onClick={handleResetGame}
                className="w-full py-2.5 rounded-2xl bg-[#EDE0C7] hover:bg-[#E2CFAF] text-[#5C3A21] font-extrabold text-xs cursor-pointer"
              >
                {isAr ? 'بدء جولة جديدة (Restart)' : 'Restart Fresh Board'}
              </button>

              <button
                type="button"
                onClick={() => setShellState('title')}
                className="w-full py-2.5 rounded-2xl bg-transparent hover:bg-[#F6EBD8] text-[#785A3C] font-bold text-xs cursor-pointer"
              >
                {isAr ? 'العودة للشاشة الرئيسية' : 'Return to Title Screen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
