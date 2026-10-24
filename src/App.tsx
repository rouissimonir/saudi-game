import React, { useEffect, useState, useCallback, useRef } from 'react';
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
} from 'lucide-react';
import {
  createInitialGameState,
  GameState,
  ITEM_CATALOG,
  Language,
  STORY_CHAPTERS,
  spawnFromGenerator,
  mergeOrMoveCells,
  COMBO_WINDOW_MS,
  dayKeyFromDate,
  getDailyLoginDay,
  claimDailyLoginReward,
  getTutorialStep,
  getActiveSeason,
  completePour,
  type LevelUpReward,
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
  MajlisRegion,
  MajlisAmbiance,
  WheelWedge,
} from './game/rules';
import {
  soundFX,
  saveGameState,
  loadSavedGameState,
  clearSavedGameState,
} from './utils/soundAndHaptics';
import { ItemArtwork, preloadItemArt } from './components/ItemArtwork';
import { MajlisRenovationView } from './components/MajlisRenovationView';
import { StoryDialogueModal } from './components/StoryDialogueModal';
import { DailyLoginModal } from './components/DailyLoginModal';
import { FinjanPourModal } from './components/FinjanPourModal';
import { ShopAndMadaModal } from './components/ShopAndMadaModal';
import {
  CustomerPortrait,
  ChainTreeModal,
  LeaderboardModal,
} from './components/CompetitorModalsAndPortraits';

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
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [mergeFx, setMergeFx] = useState<{ index: number; level: number; mega: boolean; key: number } | null>(null);
  const [comboLive, setComboLive] = useState<boolean>(false);
  const [levelUpToast, setLevelUpToast] = useState<LevelUpReward | null>(null);
  const comboTimeoutRef = useRef<number | null>(null);
  const [dailyLoginDay, setDailyLoginDay] = useState<number | null>(null);
  const tutorialStep = getTutorialStep(gameState);
  const activeSeason = React.useMemo(() => getActiveSeason(new Date()), []);
  const [pourOpen, setPourOpen] = useState<boolean>(false);

  const [shopModalOpen, setShopModalOpen] = useState<boolean>(false);
  const [shopInitialTab, setShopInitialTab] = useState<'shop' | 'liveops' | 'almanac' | 'capacitor'>('shop');

  const [chainModalOpen, setChainModalOpen] = useState<boolean>(false);
  const [chainModalCategory, setChainModalCategory] = useState<ChainCategory>('qahwa');
  const [leaderboardOpen, setLeaderboardOpen] = useState<boolean>(false);
  const [leaderboardSection, setLeaderboardSection] = useState<'leaderboard' | 'mazayen' | 'wheel'>('leaderboard');

  const bannerTimeoutRef = useRef<number | null>(null);

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

  useEffect(() => {
    preloadItemArt();
  }, []);

  // Ambient Hijaz oud loop while playing and unmuted
  useEffect(() => {
    if (shellState === 'playing' && !muted) {
      soundFX.startAmbient();
    } else {
      soundFX.stopAmbient();
    }
    return () => soundFX.stopAmbient();
  }, [shellState, muted]);

  // Offer the daily login reward once per calendar day when play begins
  useEffect(() => {
    if (shellState !== 'playing') return;
    setDailyLoginDay(getDailyLoginDay(gameState, dayKeyFromDate(new Date())));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shellState]);

  const handleFinishPour = (fillPercent: number) => {
    const res = completePour(gameState, fillPercent);
    if (!res.poured) return;
    soundFX.playOrderComplete();
    setGameState(res.state);
  };

  const handleClaimDailyLogin = () => {
    const res = claimDailyLoginReward(gameState, dayKeyFromDate(new Date()));
    setDailyLoginDay(null);
    if (!res.claimed) return;
    soundFX.playOrderComplete();
    setGameState(res.state);
    showFeedback(isAr ? `استلمت هدية اليوم ${res.day}!` : `Claimed Day ${res.day} reward!`);
  };

  // Save game state automatically on change
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // Passive Energy Regeneration (+1 energy every 15 seconds while below maxEnergy)
  useEffect(() => {
    if (shellState !== 'playing') return;
    const timer = window.setInterval(() => {
      setGameState((prev) => {
        if (prev.energy >= prev.maxEnergy) return prev;
        return { ...prev, energy: prev.energy + 1 };
      });
    }, 15000);
    return () => window.clearInterval(timer);
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

  // Shared merge outcome handler: sound, burst FX, combo meter, Mega Merge and level-up rewards
  const applyMergeResult = (
    res: ReturnType<typeof mergeOrMoveCells>,
    targetIndex: number,
    auto: boolean = false
  ) => {
    if (res.action !== 'MERGED' || !res.mergedItemId) return;
    const mergedDef = ITEM_CATALOG[res.mergedItemId];
    const level = mergedDef?.level || 2;
    soundFX.playMerge(res.megaMerge ? level + 1 : level);
    setGameState(res.state);
    setMergeFx({ index: targetIndex, level, mega: Boolean(res.megaMerge), key: Date.now() });

    setComboLive(true);
    if (comboTimeoutRef.current) window.clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = window.setTimeout(() => setComboLive(false), COMBO_WINDOW_MS);

    const name = isAr ? mergedDef.nameAr : mergedDef.nameEn;
    const parts: string[] = [];
    if (res.megaMerge) {
      parts.push(isAr ? `دمج ثلاثي ممتاز! ${name} (المستوى ${level})` : `Mega Merge! ${name} (Lv.${level})`);
    } else if (auto) {
      parts.push(isAr ? `دمج تلقائي: ${name} (المستوى ${level})!` : `Auto-Merged: ${name} (Lv.${level})!`);
    } else {
      parts.push(isAr ? `دمج رائع! حصلت على: ${name} (المستوى ${level})` : `Merged! Created: ${name} (Lv.${level})`);
    }
    if (res.comboBonusCoins) {
      parts.push(isAr ? `كومبو ×${res.comboCount} +${res.comboBonusCoins} ريال` : `Combo ×${res.comboCount} +${res.comboBonusCoins} SAR`);
    }
    showFeedback(parts.join(' · '));

    if (res.levelUp) {
      setLevelUpToast(res.levelUp);
      soundFX.playLevelUp();
      window.setTimeout(() => setLevelUpToast(null), 3200);
    }
  };

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
        setShopInitialTab('shop');
        setShopModalOpen(true);
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
      applyMergeResult(moveRes, index);
    } else if (moveRes.action === 'MOVED' || moveRes.action === 'SWAPPED') {
      soundFX.triggerHaptic('light');
      setGameState(moveRes.state);
    } else {
      if (clickedCell.itemId && !clickedCell.sandLocked) {
        setGameState((prev) => ({ ...prev, selectedCellIndex: index }));
      }
    }
  };

  // HTML5 Drag-and-Drop Handlers
  const handleDragStart = (index: number) => {
    const cell = gameState.board[index];
    if (!cell || !cell.itemId || cell.sandLocked) return;
    setDragFromIndex(index);
    setGameState((prev) => ({ ...prev, selectedCellIndex: index }));
  };

  const handleDropOnCell = (targetIndex: number) => {
    if (dragFromIndex === null || dragFromIndex === targetIndex) {
      setDragFromIndex(null);
      return;
    }
    const moveRes = mergeOrMoveCells(gameState, dragFromIndex, targetIndex);
    if (moveRes.action === 'MERGED' && moveRes.mergedItemId) {
      applyMergeResult(moveRes, targetIndex);
    } else if (moveRes.action === 'MOVED' || moveRes.action === 'SWAPPED') {
      soundFX.triggerHaptic('light');
      setGameState(moveRes.state);
    }
    setDragFromIndex(null);
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
    applyMergeResult(res, toIdx, true);
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

  // Golden Brass Scissors Booster (Splits Lv.2-6 item into two Lv.(N-1) items)
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

  // Royal Joker Finjan Booster (Upgrades Lv.1-5 item directly to Lv.(N+1))
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
    const res = fulfillCustomerOrder(gameState, orderId, activeSeason);
    if (res.fulfilled) {
      soundFX.playOrderComplete();
      setGameState(res.state);
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

      const allMaxed = res.state.renovationZones.every((z) => z.unlockedLevel >= 2);
      if (allMaxed && !res.triggeredStoryId) {
        setShellState('gameover');
      }
    }
  };

  // Claim Story Chapter Reward
  const handleClaimStoryChapter = (chapterId: string) => {
    const chap = STORY_CHAPTERS.find((c) => c.id === chapterId);
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

  const selectedCell =
    gameState.selectedCellIndex !== null ? gameState.board[gameState.selectedCellIndex] : null;
  const selectedItemDef =
    selectedCell && selectedCell.itemId ? ITEM_CATALOG[selectedCell.itemId] : null;

  const activeStoryChapter =
    STORY_CHAPTERS.find((c) => c.id === gameState.activeStoryId) || null;

  // ============================================================================
  // 1. TITLE SCREEN ('title')
  // ============================================================================
  if (shellState === 'title') {
    return (
      <main className="relative min-h-screen w-full bg-[#1C1410] text-[#FBF7F0] flex flex-col justify-between overflow-hidden select-none">
        {/* Top Sadu Geometric Trim */}
        <div className="h-3 w-full sadu-trim" />

        {/* Ambient Desert Starlight & Najdi Arch Silhouette Backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-25 flex items-center justify-center">
          <svg viewBox="0 0 1440 900" className="w-full h-full object-cover">
            <circle cx="1150" cy="180" r="95" fill="#D99B26" opacity="0.25" />
            <path
              d="M0,760 L200,760 L200,520 L260,460 L320,520 L320,760 L1120,760 L1120,500 L1190,430 L1260,500 L1260,760 L1440,760 L1440,900 L0,900 Z"
              fill="#2A1B12"
            />
          </svg>
        </div>

        {/* Main Asymmetric / Centered Monument Spotlight with >35% Calm Negative Space */}
        <div className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Column 1: Interactive Hero Centerpiece (Gilded Najdi Dallah & V60 Crest) */}
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[#241812] border-2 border-[#D99B26]/60 shadow-[0_0_60px_rgba(217,155,38,0.2)] flex items-center justify-center p-6 shrink-0">
            <svg viewBox="0 0 200 200" className="absolute inset-6 w-[calc(100%-3rem)] h-[calc(100%-3rem)]" aria-hidden="true">
              <polygon
                points="100,10 126,42 168,32 158,74 190,100 158,126 168,168 126,158 100,190 74,158 32,168 42,126 10,100 42,74 32,32 74,42"
                fill="#2E1E16"
                stroke="#D99B26"
                strokeWidth="3"
              />
            </svg>
            <img
              src="/assets/art/dallah.png"
              alt={lang === 'ar' ? 'دلة نجدية ذهبية' : 'Gilded Najdi dallah'}
              width={512}
              height={512}
              className="relative w-4/5 h-4/5 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
            />
          </div>

          {/* Column 2: Custom SVG Title Lockup & <= 3 Menu Actions */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-start max-w-xl">
            <svg viewBox="0 0 420 56" className="w-64 sm:w-80 h-auto mb-3">
              <rect x="2" y="6" width="416" height="44" rx="10" fill="#241812" stroke="#D99B26" strokeWidth="2" />
              <text
                x="210"
                y="35"
                textAnchor="middle"
                fill="#E9C46A"
                fontSize="20"
                fontWeight="bold"
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

            <p className="mt-4 text-sm sm:text-base text-[#E5DEC9]/85 leading-relaxed max-w-lg">
              {isAr
                ? 'اجمع بين أصالة الدلة النجدية والبن الخولاني والعود الكمبودي ومشروبات الـ V60، ولبِّ طلبات الضيوف في الدرعية وجدة التاريخية والعلا.'
                : 'Combine Saudi Khawlani Dallah hospitality, Cambodian Oud perfumery, and artisanal V60 pour-overs across Diriyah, Historic Jeddah, and AlUla.'}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-3.5 w-full sm:w-auto">
              <button
                type="button"
                data-start="true"
                onClick={handleStartGame}
                className="px-8 py-4 rounded-xl bg-[#D97724] hover:bg-[#E08738] text-white font-bold text-base shadow-xl transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
              >
                {isAr ? 'ابدأ اللعب الآن · Play Now' : 'Start Playing · ابدأ اللعب'}
              </button>

              <button
                type="button"
                onClick={handleToggleLanguage}
                className="px-5 py-4 rounded-xl bg-[#241812] hover:bg-[#2F2018] border border-[#D99B26]/40 text-[#E9C46A] font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                {isAr ? 'English · تغيير اللغة' : 'العربية · Switch Language'}
              </button>
            </div>
          </div>
        </div>

        {/* Single flat, borderless inline control hint in bottom safe margin */}
        <div className="relative z-10 pb-6 px-6 text-center text-xs text-[#D4A373]/80">
          {isAr
            ? 'انقر على المولّدات لإنتاج البن والعود · اسحب أو انقر لدمج عنصرين متطابقين · Enter للبدء · P للإيقاف المؤقت'
            : 'Tap Generators to Spawn Qahwa & Oud · Drag or Tap 2 Matching Items to Merge · Enter to Start · P to Pause'}
        </div>
      </main>
    );
  }

  // ============================================================================
  // 2. ACTIVE PLAYING SHELL ('playing', 'paused', 'gameover')
  // ============================================================================
  const totalRenovated = gameState.renovationZones.reduce((acc, z) => acc + z.unlockedLevel, 0);

  return (
    <div className="min-h-screen w-full bg-[#1C1410] text-[#FBF7F0] flex flex-col justify-between select-none">
      {/* Top Sadu Geometric Trim */}
      <div className="h-1.5 w-full sadu-trim shrink-0" />

      {/* World-Matched Perimeter HUD Dock */}
      <div className="w-full bg-[#241812] border-b border-[#D99B26]/30 px-3 sm:px-6 py-2 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Brand Identity & Level Progress */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#D99B26]/20 border border-[#FBBF24] flex items-center justify-center tabular-nums font-extrabold text-sm sm:text-base text-[#FBBF24]">
              {gameState.level}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#FBF7F0] leading-tight">
                {isAr ? 'قهوة ومجلس الدرعية' : 'Qahwa & Majlis'}
              </div>
              <div className="text-[11px] text-[#D4A373] tabular-nums">
                {isAr
                  ? `الخبرة ${gameState.xp} · الهيبة ${gameState.prestigePoints}`
                  : `XP ${gameState.xp} · Prestige ${gameState.prestigePoints}`}
              </div>
            </div>
          </div>

          {/* Center: Hero-to-Kicker Resource Counters (Energy, Riyals, Renovation Stars, Royal Gems) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto py-0.5">
            {/* Energy Meter */}
            <button
              type="button"
              onClick={() => {
                setShopInitialTab('shop');
                setShopModalOpen(true);
              }}
              aria-label={isAr ? 'شحن الطاقة' : 'Refill Energy'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1C1410] border border-[#FBBF24]/40 hover:border-[#FBBF24] transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#FBBF24] fill-[#FBBF24] shrink-0" />
              <div className="text-start">
                <span className="block text-[9px] text-[#D4A373] leading-none">
                  {isAr ? 'الطاقة' : 'ENERGY'}
                </span>
                <span className="text-xs sm:text-sm tabular-nums font-extrabold text-[#FBBF24]">
                  {Math.round(gameState.energy)}/{gameState.maxEnergy}
                </span>
              </div>
            </button>

            {/* Gold Riyals (SAR Coins) */}
            <button
              type="button"
              onClick={() => {
                setShopInitialTab('shop');
                setShopModalOpen(true);
              }}
              aria-label={isAr ? 'رصيد الريالات الذهبية' : 'Gold Riyals Balance'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1C1410] border border-[#D99B26]/35 hover:border-[#D99B26] transition-colors cursor-pointer"
            >
              <Coins className="w-4 h-4 text-[#FDE68A] shrink-0" />
              <div className="text-start">
                <span className="block text-[9px] text-[#D4A373] leading-none">
                  {isAr ? 'ريال ذهبي' : 'RIYALS'}
                </span>
                <span className="text-xs sm:text-sm tabular-nums font-extrabold text-[#FDE68A]">
                  {Math.round(gameState.coins)}
                </span>
              </div>
            </button>

            {/* Renovation Stars */}
            <button
              type="button"
              onClick={() => setWorkspace('majlis')}
              aria-label={isAr ? 'نجوم إعمار المجلس' : 'Majlis Renovation Stars'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1C1410] border border-[#E76F51]/45 hover:border-[#E76F51] transition-colors cursor-pointer"
            >
              <Star className="w-4 h-4 text-[#F4A261] fill-[#F4A261] shrink-0" />
              <div className="text-start">
                <span className="block text-[9px] text-[#D4A373] leading-none">
                  {isAr ? 'النجوم' : 'STARS'}
                </span>
                <span className="text-xs sm:text-sm tabular-nums font-extrabold text-[#F4A261]">
                  {Math.round(gameState.stars)}
                </span>
              </div>
            </button>

            {/* Royal Gems */}
            <button
              type="button"
              onClick={() => {
                setShopInitialTab('shop');
                setShopModalOpen(true);
              }}
              aria-label={isAr ? 'رصيد الجواهر' : 'Royal Gems Balance'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1C1410] border border-[#38BDF8]/35 hover:border-[#38BDF8] transition-colors cursor-pointer"
            >
              <Gem className="w-4 h-4 text-[#38BDF8] shrink-0" />
              <div className="text-start">
                <span className="block text-[9px] text-[#D4A373] leading-none">
                  {isAr ? 'الجواهر' : 'GEMS'}
                </span>
                <span className="text-xs sm:text-sm tabular-nums font-extrabold text-[#38BDF8]">
                  {Math.round(gameState.diamonds)}
                </span>
              </div>
            </button>
          </div>

          {/* Right: Compact Utility Icon Controls */}
          <div className="flex items-center gap-1.5">
            {/* Daily Finjan Al-Sabah Spin Wheel Button */}
            <button
              type="button"
              onClick={() => {
                setLeaderboardSection('wheel');
                setLeaderboardOpen(true);
              }}
              className="px-2.5 py-2 rounded-xl bg-[#3B1D38] hover:bg-[#4C2448] border border-[#F472B6]/50 text-[#FBCFE8] text-xs font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Gift className="w-3.5 h-3.5 text-[#F472B6]" />
              <span className="hidden md:inline">
                {isAr ? 'عجلة الصباح' : 'Lucky Spin'}
              </span>
              {gameState.freeSpinsAvailable > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              )}
            </button>

            {/* Diwan Al-Karam & Weekly Mazayen Leaderboard */}
            <button
              type="button"
              onClick={() => {
                setLeaderboardSection('leaderboard');
                setLeaderboardOpen(true);
              }}
              className="px-2.5 py-2 rounded-xl bg-[#2E1E16] hover:bg-[#3A261B] border border-[#FBBF24]/45 text-[#FBBF24] text-xs font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'ديوان الكرم' : 'KSA Rank'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShopInitialTab('shop');
                setShopModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-[#D97724] hover:bg-[#E08738] text-white text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              {isAr ? 'متجر مدى' : 'Mada Shop'}
            </button>

            <button
              type="button"
              onClick={handleToggleLanguage}
              aria-label={isAr ? 'تبديل اللغة إلى الإنجليزية' : 'Switch Language to Arabic'}
              className="h-9 px-2.5 rounded-xl bg-[#1C1410] border border-white/15 hover:border-[#D99B26] text-xs font-bold text-[#E9C46A] cursor-pointer"
            >
              {isAr ? 'EN' : 'عربي'}
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={handleToggleMute}
              aria-label={muted ? 'Unmute Audio [M]' : 'Mute Audio [M]'}
              className="w-9 h-9 rounded-xl bg-[#1C1410] border border-white/15 hover:border-[#D99B26] flex items-center justify-center text-[#E9C46A] cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={handleTogglePause}
              aria-label="Pause Game [P]"
              className="w-9 h-9 rounded-xl bg-[#1C1410] border border-white/15 hover:border-[#D99B26] flex items-center justify-center text-[#E9C46A] cursor-pointer"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex flex-col gap-3">
        {/* Workspace Mode Switcher & Live Feedback Banner */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#241812] border border-[#D99B26]/25">
            <button
              type="button"
              onClick={() => setWorkspace('merge')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                workspace === 'merge'
                  ? 'bg-[#D97724] text-white shadow'
                  : 'text-[#D4A373] hover:text-white'
              }`}
            >
              {isAr ? 'طاولة الدمج والطلبات (7×7)' : 'Merge Board & Orders (7×7)'}
            </button>
            <button
              type="button"
              onClick={() => setWorkspace('majlis')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                workspace === 'majlis'
                  ? 'bg-[#D97724] text-white shadow'
                  : 'text-[#D4A373] hover:text-white'
              }`}
            >
              <span>
                {isAr
                  ? `خريطة وإعمار المجالس (${totalRenovated}/8)`
                  : `Kingdom Map & Majlis (${totalRenovated}/8)`}
              </span>
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              type="button"
              onClick={() => {
                setLeaderboardSection('mazayen');
                setLeaderboardOpen(true);
              }}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#FBBF24] hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'مزاين المجالس' : 'Mazayen Contest'}</span>
            </button>
          </div>

          {activeSeason && (
            <div
              data-testid="season-banner"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#065F46] to-[#047857] border border-[#34D399] text-xs font-bold text-[#D1FAE5]"
            >
              <span className="font-extrabold">{isAr ? activeSeason.nameAr : activeSeason.nameEn}</span>
              <span className="mx-1.5 opacity-60">·</span>
              <span>{isAr ? activeSeason.descAr : activeSeason.descEn}</span>
            </div>
          )}

          {gameState.pourTokens > 0 && (
            <button
              type="button"
              data-testid="pour-challenge-button"
              onClick={() => setPourOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#D97724] hover:bg-[#EA8A35] text-xs font-extrabold text-white text-start"
            >
              {isAr
                ? `☕ تحدي ربع الفنجال جاهز (${gameState.pourTokens}) · اربح جواهر وجوكر`
                : `☕ Rub'a al-Finjan challenge ready (${gameState.pourTokens}) · win gems & a Joker`}
            </button>
          )}

          {tutorialStep && (
            <div
              data-testid="tutorial-coach"
              className="flex items-start gap-2 px-3.5 py-2 rounded-xl bg-[#10B981]/15 border border-[#10B981] text-xs font-bold text-[#A7F3D0]"
            >
              <span className="flex-1 leading-relaxed">
                {tutorialStep === 'merge'
                  ? isAr
                    ? 'ابدأ هنا: اسحب عنصراً فوق عنصر مطابق (أو انقر الاثنين) لدمجهما. المربعات ذات الإطار الأخضر تعني دمجاً ممكناً.'
                    : 'Start here: drag an item onto a matching one (or tap both) to merge. Green-ringed tiles are matches.'
                  : isAr
                  ? 'ممتاز! الآن جهّز العناصر ذات علامة ✓ الخضراء واضغط «تقديم!» لإسعاد ضيوف المجلس.'
                  : 'Nice! Gather the items marked with a green ✓, then press “Serve!” to delight your guests.'}
              </span>
              <button
                type="button"
                onClick={() => setGameState((prev) => ({ ...prev, tutorialDismissed: true }))}
                className="shrink-0 underline text-[#6EE7B7]"
              >
                {isAr ? 'تخطي' : 'Skip'}
              </button>
            </div>
          )}

          {comboLive && gameState.comboCount >= 2 && (
            <div
              data-testid="combo-meter"
              className="combo-meter flex items-center justify-between px-3.5 py-1 rounded-xl bg-gradient-to-r from-[#B45309] to-[#F59E0B] text-[#1C1410] text-xs font-extrabold"
            >
              <span>{isAr ? `كومبو ×${gameState.comboCount}` : `Combo ×${gameState.comboCount}`}</span>
              <span className="combo-bar" style={{ animationDuration: `${COMBO_WINDOW_MS}ms` }} key={gameState.lastMergeAt} />
            </div>
          )}

          {levelUpToast && (
            <div
              role="status"
              data-testid="level-up-toast"
              className="level-up-toast px-3.5 py-2 rounded-xl bg-[#10B981] text-white text-xs font-extrabold text-center"
            >
              {isAr
                ? `ارتقيت للمستوى ${levelUpToast.toLevel}! +${levelUpToast.gems} جوهرة وطاقة ممتلئة`
                : `Level ${levelUpToast.toLevel}! +${levelUpToast.gems} gems & full energy`}
            </div>
          )}

          {feedbackBanner && (
            <div
              role="status"
              aria-live="polite"
              className="px-3.5 py-1.5 rounded-xl bg-[#D99B26]/20 border border-[#FBBF24] text-xs font-bold text-[#FDE68A] truncate"
            >
              {feedbackBanner}
            </div>
          )}
        </div>

        {workspace === 'majlis' ? (
          <MajlisRenovationView
            lang={lang}
            zones={gameState.renovationZones}
            stars={gameState.stars}
            activeRegion={gameState.activeRegion}
            ambiance={gameState.ambiance}
            completedStoryIds={gameState.completedStoryIds}
            onUpgradeZone={handleUpgradeZone}
            onChangeRegion={(region: MajlisRegion) => {
              soundFX.triggerHaptic('light');
              setGameState((prev) => ({ ...prev, activeRegion: region }));
            }}
            onChangeAmbiance={(ambiance: MajlisAmbiance) => {
              soundFX.playMerge(3);
              setGameState((prev) => ({ ...prev, ambiance }));
            }}
            onOpenStory={(storyId) =>
              setGameState((prev) => ({ ...prev, activeStoryId: storyId }))
            }
          />
        ) : (
          /* COMPETITOR UPGRADE: GOSSIP HARBOR / TRAVEL TOWN TOP CUSTOMER ORDER STRIP + HIGH-CONTRAST PARCHMENT BOARD */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Center / Primary Column: Top Customer Strip + 7x7 Parchment Merge Board (order-1 on mobile) */}
            <div className="order-1 lg:col-span-7 flex flex-col items-center gap-2.5">
              {/* 1. Gossip Harbor-Style Horizontal Customer Order Strip Pinned Directly Above Board */}
              <div
                aria-label={isAr ? 'شريط طلبات الضيوف العلوي' : 'Top Customer Order Dock'}
                className="w-full max-w-[540px] grid grid-cols-3 gap-2"
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
                      className={`relative rounded-2xl p-2 border-2 flex flex-col justify-between transition-all ${
                        isReady
                          ? 'bg-gradient-to-b from-[#064E3B] to-[#1A2E26] border-[#10B981] shadow-[0_0_16px_rgba(16,185,129,0.3)]'
                          : order.isVip
                          ? 'bg-gradient-to-b from-[#3B1D38] to-[#241623] border-[#F59E0B]/80'
                          : 'bg-[#261912] border-[#D99B26]/40'
                      }`}
                    >
                      {/* Timed VIP Royal Convoy Rush Badge */}
                      {order.isVip && (
                        <div className="mb-1 px-1.5 py-0.5 rounded bg-[#F59E0B]/20 border border-[#F59E0B]/50 flex items-center justify-between text-[9px] font-extrabold text-[#FDE68A]">
                          <span>{isAr ? '⚡ موكب ملكي VIP' : '⚡ VIP RUSH'}</span>
                          <span>{isAr ? '+صندوق💎' : '+Chest💎'}</span>
                        </div>
                      )}

                      {/* Top row: Portrait + Name + Reward */}
                      <div className="flex items-center gap-1.5">
                        <CustomerPortrait avatarKey={order.customerId} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-bold text-[#FBF7F0] truncate">
                            {isAr ? order.customerNameAr : order.customerNameEn}
                          </div>
                          <div className="inline-flex items-center gap-1 text-[10px] font-extrabold tabular-nums text-[#FBBF24]">
                            <span>+{order.rewardCoins}</span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              {order.rewardStars}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom row: Required item icons + 1-Tap Serve CTA */}
                      <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
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
                                className={`relative w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer ${
                                  hasItem
                                    ? 'bg-[#FBF5E8] border-[#10B981] ring-1 ring-[#10B981]'
                                    : 'bg-[#F5E9D4]/90 border-[#C89D66]'
                                }`}
                              >
                                <ItemArtwork itemId={reqId} size="sm" />
                                {hasItem && (
                                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleFulfillOrder(order.id)}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                            isReady
                              ? 'bg-[#10B981] hover:bg-[#059669] text-white shadow'
                              : 'bg-white/10 text-[#D4A373] hover:bg-white/15'
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
              </div>

              {/* 2. Floating Golden Bonus Bubble Deal (Spawns on Lv.3+ Merges like Gossip Harbor / Travel Town) */}
              {gameState.bonusBubble && (
                <div className="w-full max-w-[540px] rounded-xl bg-gradient-to-r from-[#3B2610] via-[#4C3214] to-[#2B1D14] border-2 border-[#FBBF24] px-3 py-2 flex items-center justify-between gap-2 shadow-lg">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#FBF5E8] border-2 border-[#38BDF8] flex items-center justify-center shrink-0">
                      <ItemArtwork itemId={gameState.bonusBubble.itemId} size="sm" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold text-[#FBBF24] uppercase block">
                        {isAr ? 'فقاعة البركة الذهبية (مكافأة الدمج!)' : 'GOLDEN BONUS BUBBLE DEAL!'}
                      </span>
                      <span className="text-xs font-bold text-white truncate block">
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
                      className="px-2.5 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-[#0284C7] text-[#0F172A] font-extrabold text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Gem className="w-3.5 h-3.5" />
                      <span>{gameState.bonusBubble.gemCost}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGameState((prev) => ({ ...prev, bonusBubble: null }))}
                      className="px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white/80 cursor-pointer"
                    >
                      {isAr ? 'تخطي' : 'Skip'}
                    </button>
                  </div>
                </div>
              )}

              {/* 3. High-Contrast Warm Parchment & Walnut 7x7 Merge Board */}
              <div className="w-full max-w-[540px] rounded-2xl border-2 border-[#D99B26]/65 bg-[#311F15] p-2.5 sm:p-3.5 shadow-2xl">
                <div className="flex items-center justify-between mb-2 px-1 gap-2">
                  <span className="text-xs font-bold text-[#FDE68A] truncate">
                    {isAr
                      ? 'لوحة الدمج (4 سلاسل + صناديق الضيافة)'
                      : 'Khaleeji Board (4 Chains + Majlis Chests)'}
                  </span>

                  {/* Board Boosters Bar: Golden Scissors, Royal Joker & Power Boost */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleUseScissors}
                      title={isAr ? 'المقص الذهبي: يقسم أي عنصر (L2+) إلى قطعتين' : 'Golden Scissors: Split any Lv.2+ item into two'}
                      className="px-2 py-1 rounded-lg bg-[#1C1410] hover:bg-[#2E1E16] border border-[#EC4899]/50 text-[#F472B6] text-[11px] font-extrabold tabular-nums inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Scissors className="w-3 h-3" />
                      <span>{gameState.scissorsCount}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleUseJoker}
                      title={isAr ? 'فنجال الجوكر: يرقّي أي عنصر للمستوى التالي فوراً' : 'Royal Joker: Upgrade any item +1 Level'}
                      className="px-2 py-1 rounded-lg bg-[#1C1410] hover:bg-[#2E1E16] border border-[#A855F7]/60 text-[#C084FC] text-[11px] font-extrabold tabular-nums inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>{gameState.jokerCount}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCyclePowerBoost}
                      aria-label={isAr ? 'تغيير مضاعف الطاقة' : 'Toggle Power Boost Multiplier'}
                      className={`px-2.5 py-1 rounded-lg text-xs font-extrabold tabular-nums inline-flex items-center gap-1 transition-colors cursor-pointer ${
                        gameState.powerMultiplier === 4
                          ? 'bg-[#EF4444] text-white shadow'
                          : gameState.powerMultiplier === 2
                          ? 'bg-[#F59E0B] text-[#1C1410] shadow'
                          : 'bg-[#1C1410] border border-[#FBBF24]/50 text-[#FBBF24]'
                      }`}
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      <span>×{gameState.powerMultiplier}</span>
                    </button>
                  </div>
                </div>

                {/* 7x7 Grid with Warm Sand-Parchment Tiles */}
                <div
                  data-testid="merge-board-grid"
                  className="grid grid-cols-7 gap-1 sm:gap-1.5 aspect-square w-full bg-[#21140D] p-1.5 sm:p-2 rounded-xl border-2 border-[#8B5E3C]/50 shadow-inner"
                >
                  {gameState.board.map((cell) => {
                    const itemDef = cell.itemId ? ITEM_CATALOG[cell.itemId] : null;
                    const isSelected = gameState.selectedCellIndex === cell.index;
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
                        draggable={Boolean(cell.itemId && !cell.sandLocked)}
                        onDragStart={() => handleDragStart(cell.index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropOnCell(cell.index)}
                        onClick={() => handleCellClick(cell.index)}
                        className={`relative aspect-square rounded-lg sm:rounded-xl flex flex-col items-center justify-center transition-transform cursor-pointer select-none ${
                          cell.sandLocked
                            ? 'bg-[#B08968]/85 border border-dashed border-[#5C3A21] opacity-90'
                            : itemDef?.isGenerator
                            ? 'bg-gradient-to-b from-[#FDE68A] to-[#F59E0B] border-2 border-[#B45309] shadow-md hover:scale-[1.03]'
                            : itemDef?.isChest
                            ? 'bg-gradient-to-b from-[#FEF3C7] to-[#FDE68A] border-2 border-[#D97706] shadow-md'
                            : itemDef
                            ? isOrderNeeded
                              ? 'bg-[#DCFCE7] border-2 border-[#10B981] shadow-sm active:scale-95'
                              : isEvenChecker
                              ? 'bg-[#FBF5E8] border border-[#D4A373] hover:border-[#D97724] active:scale-95'
                              : 'bg-[#F3E5AB] border border-[#C89D66] hover:border-[#D97724] active:scale-95'
                            : isEvenChecker
                            ? 'bg-[#E6D5B8]/40 border border-[#C89D66]/25 hover:border-[#D99B26]/50'
                            : 'bg-[#D8C3A5]/30 border border-[#C89D66]/20 hover:border-[#D99B26]/50'
                        } ${
                          isSelected
                            ? 'ring-2 ring-[#D97724] scale-[1.04] z-10'
                            : ''
                        } ${
                          isMergeTarget || isHinted
                            ? 'ring-2 ring-[#10B981]'
                            : ''
                        }`}
                      >
                        {mergeFx && mergeFx.index === cell.index && (
                          <span
                            key={mergeFx.key}
                            aria-hidden="true"
                            className={`merge-burst ${mergeFx.mega ? 'merge-burst-mega' : ''} ${mergeFx.level >= 4 ? 'merge-burst-big' : ''}`}
                          />
                        )}
                        {itemDef && (
                          <>
                            <ItemArtwork itemId={itemDef.id} size="md" />

                            {/* Level or Generator Badge */}
                            <span
                              className={`absolute bottom-0.5 inset-x-0.5 text-[9px] sm:text-[10px] tabular-nums font-extrabold leading-none py-0.5 rounded flex items-center justify-center ${
                                itemDef.isGenerator
                                  ? 'bg-[#78350F] text-[#FEF3C7]'
                                  : itemDef.isChest
                                  ? 'bg-[#9A3412] text-[#FEF3C7]'
                                  : 'bg-[#2B1D14]/90 text-[#FDE68A]'
                              }`}
                            >
                              {itemDef.isGenerator ? (
                                <Zap className="w-2.5 h-2.5 fill-current" />
                              ) : (
                                `L${itemDef.level}`
                              )}
                            </span>

                            {/* Order Needed Checkmark Indicator */}
                            {isOrderNeeded && (
                              <span
                                title={isAr ? 'مطلوب لطلب ضيف' : 'Needed for Order'}
                                className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow"
                              >
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            )}

                            {/* Sand-Locked Dune Overlay */}
                            {cell.sandLocked && (
                              <span
                                title={isAr ? 'ادمج عنصراً مطابقاً لفتح القفل' : 'Merge matching item to unlock'}
                                className="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded bg-[#3E2723] text-[#FBBF24] flex items-center justify-center"
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
              </div>
            </div>

            {/* Right / Secondary Column: Sadu Pantry Storage Bag + Item Inspector + Boosters + Full Order Cards */}
            <div className="order-2 lg:col-span-5 flex flex-col gap-3">
              {/* Selected Item Inspector + Chain Evolution Tree [i] + Sadu Pantry Storage */}
              <section
                aria-label={isAr ? 'تفاصيل العنصر وخزانة المؤونة' : 'Item Inspector & Sadu Pantry'}
                className="rounded-2xl border border-[#D99B26]/35 bg-[#241812] p-3.5 space-y-3 shadow-lg"
              >
                {selectedItemDef ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-[#FBF5E8] border-2 border-[#D99B26] flex items-center justify-center shrink-0">
                          <ItemArtwork itemId={selectedItemDef.id} size="md" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white truncate">
                              {isAr ? selectedItemDef.nameAr : selectedItemDef.nameEn}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (selectedItemDef.chain !== 'generator') {
                                  setChainModalCategory(selectedItemDef.chain);
                                }
                                setChainModalOpen(true);
                              }}
                              aria-label={isAr ? 'عرض شجرة تطور السلسلة' : 'View Merge Chain Evolution Tree'}
                              className="w-6 h-6 rounded-lg bg-[#D99B26]/25 hover:bg-[#D99B26]/45 text-[#FBBF24] flex items-center justify-center shrink-0 cursor-pointer"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-[#E5DEC9]/80 mt-0.5 line-clamp-1">
                            {isAr ? selectedItemDef.descAr : selectedItemDef.descEn}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {selectedItemDef.isChest && gameState.selectedCellIndex !== null ? (
                          <button
                            type="button"
                            onClick={() => handleOpenChest(gameState.selectedCellIndex!)}
                            className="px-3 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-extrabold cursor-pointer whitespace-nowrap shadow"
                          >
                            {isAr ? 'فتح الصندوق!' : 'Open Chest!'}
                          </button>
                        ) : !selectedItemDef.isGenerator ? (
                          <>
                            <button
                              type="button"
                              onClick={handleStoreInPantry}
                              className="px-2.5 py-2 rounded-xl bg-[#2A9D8F]/25 hover:bg-[#2A9D8F]/45 border border-[#2A9D8F] text-[#5EEAD4] text-xs font-bold cursor-pointer whitespace-nowrap"
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
                              className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-red-500/30 text-[#FDE68A] text-xs font-bold cursor-pointer whitespace-nowrap"
                            >
                              +{selectedItemDef.sellValue} SAR
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {/* Booster Actions for Selected Item (Golden Scissors & Royal Joker) */}
                    {!selectedItemDef.isGenerator && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleUseScissors}
                          disabled={selectedItemDef.level <= 1 || gameState.scissorsCount <= 0}
                          className={`py-1.5 px-2.5 rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            selectedItemDef.level > 1 && gameState.scissorsCount > 0
                              ? 'bg-[#EC4899]/20 border-[#EC4899] text-[#FBCFE8] hover:bg-[#EC4899]/35'
                              : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                          }`}
                        >
                          <Scissors className="w-3.5 h-3.5" />
                          <span>
                            {isAr
                              ? `المقص الذهبي (${gameState.scissorsCount})`
                              : `Split Item (${gameState.scissorsCount})`}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={handleUseJoker}
                          disabled={selectedItemDef.level >= selectedItemDef.maxLevel || gameState.jokerCount <= 0}
                          className={`py-1.5 px-2.5 rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            selectedItemDef.level < selectedItemDef.maxLevel && gameState.jokerCount > 0
                              ? 'bg-[#A855F7]/25 border-[#A855F7] text-[#E9D5FF] hover:bg-[#A855F7]/40'
                              : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                          }`}
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>
                            {isAr
                              ? `فنجال الجوكر (${gameState.jokerCount})`
                              : `Joker +1 Lv (${gameState.jokerCount})`}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-[#D4A373] py-1">
                    {isAr
                      ? 'حدد أي عنصر على اللوحة لاستخدام (المقص الذهبي / فنجال الجوكر) أو حفظه في خزانة المؤونة.'
                      : 'Select any tile to use Boosters (Golden Scissors / Royal Joker) or store it in the Sadu Pantry.'}
                  </div>
                )}

                {/* Sadu Pantry Storage Bag (4 Slots) */}
                <div className="pt-2.5 border-t border-white/10">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#E9C46A] inline-flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#FBBF24]" />
                      {isAr
                        ? `خزانة المؤونة (${gameState.inventory.length}/${gameState.inventoryCapacity}) · انقر للاستعادة`
                        : `Sadu Pantry Storage (${gameState.inventory.length}/${gameState.inventoryCapacity}) · Tap to Retrieve`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setChainModalCategory(
                          selectedItemDef && selectedItemDef.chain !== 'generator'
                            ? selectedItemDef.chain
                            : 'oud'
                        );
                        setChainModalOpen(true);
                      }}
                      className="text-[11px] font-bold text-[#FBBF24] hover:underline cursor-pointer"
                    >
                      {isAr ? 'دليل السلاسل الأربع [i]' : '4-Chain Tree [i]'}
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
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
                          className={`h-12 rounded-xl border flex items-center justify-center transition-all ${
                            storedDef
                              ? 'bg-[#FBF5E8] border-[#D99B26] hover:scale-105 cursor-pointer shadow'
                              : 'bg-[#19110D] border-dashed border-white/15 text-[10px] text-white/30'
                          }`}
                        >
                          {storedDef ? (
                            <ItemArtwork itemId={storedDef.id} size="sm" />
                          ) : (
                            <span>{isAr ? 'فارغ' : 'Empty'}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Helper Actions */}
                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoMergeOrHint}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#2A9D8F] hover:bg-[#21867A] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAr ? 'دمج تلقائي ذكي (Auto-Merge)' : 'Smart Auto-Merge Pair'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCellClick(2)}
                    className="py-2.5 px-3 rounded-xl bg-[#A855F7]/25 hover:bg-[#A855F7]/40 border border-[#A855F7]/60 text-[#E9D5FF] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isAr ? `+ إنتاج عود (×${gameState.powerMultiplier})` : `+ Spawn Oud (×${gameState.powerMultiplier})`}
                  </button>
                </div>
              </section>

              {/* Detailed Story & Quotes Customer Order Cards */}
              <section
                aria-label={isAr ? 'تفاصيل طلبات ضيوف المجلس' : 'Detailed Majlis Guest Orders'}
                className="rounded-2xl border border-[#D99B26]/30 bg-[#241812] p-3.5 space-y-2.5 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xs sm:text-sm font-bold text-[#FBF7F0]">
                    {isAr ? 'حكايات وطلبات ضيوف المجلس' : 'Guest Stories & Order Details'}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#D4A373]">
                    <span>{isAr ? `هيبة المجلس: ${gameState.prestigePoints}` : `Prestige: ${gameState.prestigePoints}`}</span>
                    <Star className="w-3 h-3 fill-[#FBBF24] text-[#FBBF24]" />
                  </span>
                </div>

                <div className="space-y-2">
                  {gameState.activeOrders.map((order) => {
                    const readyIndices = findCellsForOrder(
                      gameState.board,
                      order.requiredItemIds
                    );
                    const isReady = readyIndices !== null;

                    return (
                      <div
                        key={`detail_${order.id}`}
                        className={`rounded-xl p-2.5 border transition-all ${
                          isReady
                            ? 'bg-[#10B981]/15 border-[#10B981]'
                            : 'bg-[#1C1410] border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <CustomerPortrait avatarKey={order.customerId} size="sm" />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[#FBF7F0] truncate">
                                {isAr ? order.customerNameAr : order.customerNameEn}
                                <span className="mx-1 text-white/30">·</span>
                                <span className="font-normal text-[#D4A373]">
                                  {isAr ? order.customerRoleAr : order.customerRoleEn}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#E5DEC9]/75 truncate">
                                “{isAr ? order.quoteAr : order.quoteEn}”
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleFulfillOrder(order.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                              isReady
                                ? 'bg-[#10B981] hover:bg-[#059669] text-white shadow-md'
                                : 'bg-white/10 hover:bg-white/15 text-white/60'
                            }`}
                          >
                            {isReady ? (
                              <>
                                <span>{isAr ? 'تقديم الطلب' : 'Serve Order'}</span>
                                <Check className="w-3.5 h-3.5" />
                              </>
                            ) : (
                              <span>+{order.rewardCoins} SAR</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Modals: Story Chapter Dialogue, Mada/Apple Pay Shop, Chain Evolution Tree, KSA Leaderboard/Mazayen/Wheel, and Pause / Victory Modal */}
      <StoryDialogueModal
        lang={lang}
        chapter={activeStoryChapter}
        onClose={handleClaimStoryChapter}
      />

      <DailyLoginModal lang={lang} day={gameState.activeStoryId ? null : dailyLoginDay} onClaim={handleClaimDailyLogin} />

      <FinjanPourModal
        lang={lang}
        isOpen={pourOpen}
        tokens={gameState.pourTokens}
        onFinish={handleFinishPour}
        onClose={() => setPourOpen(false)}
      />

      <ChainTreeModal
        lang={lang}
        isOpen={chainModalOpen}
        initialChain={chainModalCategory}
        discoveredItemIds={gameState.discoveredItemIds}
        onClose={() => setChainModalOpen(false)}
      />

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

      {/* PAUSE OR VICTORY MODAL ('paused' | 'gameover') */}
      {(shellState === 'paused' || shellState === 'gameover') && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={shellState === 'gameover' ? 'Majlis Restoration Complete' : 'Game Paused'}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        >
          <div className="w-full max-w-md rounded-2xl border-2 border-[#D99B26] bg-[#241812] text-[#FBF7F0] p-6 shadow-2xl text-center space-y-5">
            <div className="h-2 w-full sadu-trim rounded" />
            <h2 className="text-2xl font-bold text-[#FBBF24]">
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
              <div className="rounded-xl bg-[#1C1410] border border-white/10 p-3">
                <span className="text-[10px] text-[#D4A373] block">
                  {isAr ? 'الطلبات المنجزة' : 'ORDERS'}
                </span>
                <span className="text-lg tabular-nums font-extrabold text-white">
                  {gameState.ordersCompleted}
                </span>
              </div>
              <div className="rounded-xl bg-[#1C1410] border border-white/10 p-3">
                <span className="text-[10px] text-[#D4A373] block">
                  {isAr ? 'إجمالي الدمج' : 'MERGES'}
                </span>
                <span className="text-lg tabular-nums font-extrabold text-[#FBBF24]">
                  {gameState.totalMerges}
                </span>
              </div>
              <div className="rounded-xl bg-[#1C1410] border border-white/10 p-3">
                <span className="text-[10px] text-[#D4A373] block">
                  {isAr ? 'الإعمار' : 'ESTATE'}
                </span>
                <span className="text-lg tabular-nums font-extrabold text-[#34D399]">
                  {totalRenovated}/8
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                data-start="true"
                onClick={() => setShellState('playing')}
                className="w-full py-3 rounded-xl bg-[#D97724] hover:bg-[#E08738] text-white font-bold text-sm cursor-pointer"
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
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs cursor-pointer"
              >
                {isAr ? 'بدء جولة جديدة (Restart)' : 'Restart Fresh Board'}
              </button>

              <button
                type="button"
                onClick={() => setShellState('title')}
                className="w-full py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-[#D4A373] font-semibold text-xs cursor-pointer"
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
