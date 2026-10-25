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
  MajlisRegion,
  MajlisAmbiance,
  WheelWedge,
  buildMergeParticleBurst,
  MergeParticleBurst,
} from './game/rules';
import {
  soundFX,
  saveGameState,
  loadSavedGameState,
  clearSavedGameState,
} from './utils/soundAndHaptics';
import { ItemArtwork } from './components/ItemArtwork';
import { MajlisRenovationView } from './components/MajlisRenovationView';
import { StoryDialogueModal } from './components/StoryDialogueModal';
import { ShopAndMadaModal } from './components/ShopAndMadaModal';
import {
  CustomerPortrait,
  ChainTreeModal,
  LeaderboardModal,
} from './components/CompetitorModalsAndPortraits';
import { MergeParticleOverlay } from './components/MergeParticleOverlay';

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

  const [shopModalOpen, setShopModalOpen] = useState<boolean>(false);
  const [shopInitialTab, setShopInitialTab] = useState<'shop' | 'liveops' | 'almanac' | 'capacitor'>('shop');

  const [chainModalOpen, setChainModalOpen] = useState<boolean>(false);
  const [chainModalCategory, setChainModalCategory] = useState<ChainCategory>('qahwa');
  const [leaderboardOpen, setLeaderboardOpen] = useState<boolean>(false);
  const [leaderboardSection, setLeaderboardSection] = useState<'leaderboard' | 'mazayen' | 'wheel'>('leaderboard');

  const bannerTimeoutRef = useRef<number | null>(null);
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
      const mergedDef = ITEM_CATALOG[moveRes.mergedItemId];
      soundFX.playMerge(mergedDef?.level || 2);
      triggerMergeParticleBurst(index, moveRes.mergedItemId, {
        megaMerge: moveRes.megaMerge,
        comboCount: moveRes.comboCount,
      });
      setGameState(moveRes.state);
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
      const mergedDef = ITEM_CATALOG[moveRes.mergedItemId];
      soundFX.playMerge(mergedDef?.level || 2);
      triggerMergeParticleBurst(targetIndex, moveRes.mergedItemId, {
        megaMerge: moveRes.megaMerge,
        comboCount: moveRes.comboCount,
      });
      setGameState(moveRes.state);
      showFeedback(
        isAr
          ? `دمج رائع! حصلت على: ${mergedDef.nameAr} (المستوى ${mergedDef.level})`
          : `Merged! Created: ${mergedDef.nameEn} (Lv.${mergedDef.level})`
      );
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
    if (res.action === 'MERGED' && res.mergedItemId) {
      const mergedDef = ITEM_CATALOG[res.mergedItemId];
      soundFX.playMerge(mergedDef?.level || 2);
      triggerMergeParticleBurst(toIdx, res.mergedItemId, {
        megaMerge: res.megaMerge,
        comboCount: res.comboCount,
      });
      setGameState(res.state);
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
    const res = fulfillCustomerOrder(gameState, orderId);
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
      {/* Top Sadu Geometric Trim */}
      <div className="h-1.5 w-full sadu-trim shrink-0" />

      {/* 1. TOP GLOSSY 3D RESOURCE PILL BAR (Gossip Harbor / Travel Town Style) */}
      <header className="w-full bg-gradient-to-b from-[#5C3A21] to-[#432815] border-b-4 border-[#C68B59] px-2.5 sm:px-5 py-2 shadow-md shrink-0">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: 3D Royal Level Shield + Prestige */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#38BDF8] to-[#0284C7] border-2 border-[#FDE68A] shadow-[0_3px_0_#0369A1] flex flex-col items-center justify-center text-white leading-none">
              <span className="text-[8px] font-bold uppercase opacity-90">LV</span>
              <span className="text-sm font-black tabular-nums">{gameState.level}</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-extrabold text-[#FFFDF9] leading-tight">
                {isAr ? 'قهوة ومجلس الدرعية' : 'Qahwa & Majlis'}
              </div>
              <div className="text-[10px] font-bold text-[#FDE68A] tabular-nums">
                {isAr
                  ? `الهيبة ${gameState.prestigePoints} · الطلبات ${gameState.ordersCompleted}`
                  : `Prestige ${gameState.prestigePoints} · Orders ${gameState.ordersCompleted}`}
              </div>
            </div>
          </div>

          {/* Center: 4 Glossy Cream Resource Pills with Green (+) Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto py-0.5">
            {/* Energy Pill */}
            <button
              type="button"
              onClick={() => {
                setShopInitialTab('shop');
                setShopModalOpen(true);
              }}
              aria-label={isAr ? 'شحن الطاقة' : 'Refill Energy'}
              className="hud-pill rounded-full pl-2 pr-1.5 py-1 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#FDE047] to-[#F59E0B] border border-[#B45309] flex items-center justify-center shadow-sm shrink-0">
                <Zap className="w-3.5 h-3.5 text-[#78350F] fill-[#78350F]" />
              </div>
              <span className="text-xs sm:text-sm font-black tabular-nums text-[#3E2723] px-0.5">
                {Math.round(gameState.energy)}
              </span>
              <span className="w-5 h-5 rounded-full btn-3d-green text-white flex items-center justify-center shrink-0">
                <Plus className="w-3 h-3 stroke-[3]" />
              </span>
            </button>

            {/* Gold Riyals (SAR Coins) Pill */}
            <button
              type="button"
              onClick={() => {
                setShopInitialTab('shop');
                setShopModalOpen(true);
              }}
              aria-label={isAr ? 'رصيد الريالات الذهبية' : 'Gold Riyals Balance'}
              className="hud-pill rounded-full pl-2 pr-1.5 py-1 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#FBBF24] to-[#D97706] border border-[#92400E] flex items-center justify-center shadow-sm shrink-0">
                <Coins className="w-3.5 h-3.5 text-[#FFFBEB]" />
              </div>
              <span className="text-xs sm:text-sm font-black tabular-nums text-[#3E2723] px-0.5">
                {Math.round(gameState.coins)}
              </span>
              <span className="w-5 h-5 rounded-full btn-3d-green text-white flex items-center justify-center shrink-0">
                <Plus className="w-3 h-3 stroke-[3]" />
              </span>
            </button>

            {/* Royal Gems Pill */}
            <button
              type="button"
              onClick={() => {
                setShopInitialTab('shop');
                setShopModalOpen(true);
              }}
              aria-label={isAr ? 'رصيد الجواهر' : 'Royal Gems Balance'}
              className="hud-pill rounded-full pl-2 pr-1.5 py-1 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#38BDF8] to-[#0284C7] border border-[#0369A1] flex items-center justify-center shadow-sm shrink-0">
                <Gem className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-black tabular-nums text-[#3E2723] px-0.5">
                {Math.round(gameState.diamonds)}
              </span>
              <span className="w-5 h-5 rounded-full btn-3d-green text-white flex items-center justify-center shrink-0">
                <Plus className="w-3 h-3 stroke-[3]" />
              </span>
            </button>

            {/* Renovation Stars Pill */}
            <button
              type="button"
              onClick={() => setWorkspace('majlis')}
              aria-label={isAr ? 'نجوم إعمار المجلس' : 'Majlis Renovation Stars'}
              className="hud-pill rounded-full px-2.5 py-1 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#FB923C] to-[#EA580C] border border-[#9A3412] flex items-center justify-center shadow-sm shrink-0">
                <Star className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span className="text-xs sm:text-sm font-black tabular-nums text-[#3E2723]">
                {Math.round(gameState.stars)}
              </span>
            </button>
          </div>

          {/* Right: Compact Glossy Utility Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setLeaderboardSection('wheel');
                setLeaderboardOpen(true);
              }}
              className="relative px-2.5 py-1.5 rounded-xl btn-3d-amber text-[#3E2723] text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Gift className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isAr ? 'عجلة الصباح' : 'Spin'}</span>
              {gameState.freeSpinsAvailable > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] border border-white" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setLeaderboardSection('leaderboard');
                setLeaderboardOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-[#FFFDF9] hover:bg-[#FEF3C7] border-2 border-[#D4B483] text-[#5C3A21] text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-sm"
            >
              <Trophy className="w-3.5 h-3.5 text-[#D97706]" />
              <span className="hidden sm:inline">{isAr ? 'ديوان الكرم' : 'Rank'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleLanguage}
              aria-label={isAr ? 'تبديل اللغة إلى الإنجليزية' : 'Switch Language to Arabic'}
              className="h-8 px-2 rounded-xl bg-[#FFFDF9] border-2 border-[#D4B483] text-xs font-extrabold text-[#5C3A21] cursor-pointer shadow-sm"
            >
              {isAr ? 'EN' : 'عربي'}
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={handleToggleMute}
              aria-label={muted ? 'Unmute Audio [M]' : 'Mute Audio [M]'}
              className="w-8 h-8 rounded-xl bg-[#FFFDF9] border-2 border-[#D4B483] flex items-center justify-center text-[#5C3A21] cursor-pointer shadow-sm"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={handleTogglePause}
              aria-label="Pause Game [P]"
              className="w-8 h-8 rounded-xl bg-[#FFFDF9] border-2 border-[#D4B483] flex items-center justify-center text-[#5C3A21] cursor-pointer shadow-sm"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CENTERED STAGE (Clean, Uncluttered Gossip Harbor / Travel Town Layout) */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-2 sm:px-5 py-1.5 sm:py-2 flex flex-col gap-1.5">
        {/* Top Segmented Mode Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 max-w-[430px] w-full mx-auto">
          <div className="inline-flex items-center justify-between w-full gap-1 p-1 rounded-2xl bg-[#E2CFAF] border-2 border-[#C8AF87] shadow-inner">
            <button
              type="button"
              onClick={() => setWorkspace('merge')}
              className={`flex-1 px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                workspace === 'merge'
                  ? 'btn-3d-amber text-[#3E2723]'
                  : 'text-[#5C3A21] hover:bg-white/40'
              }`}
            >
              {isAr ? 'طاولة الدمج (7×7)' : 'Merge (7×7)'}
            </button>

            <button
              type="button"
              onClick={() => setWorkspace('majlis')}
              className={`flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                workspace === 'majlis'
                  ? 'btn-3d-green text-white'
                  : 'text-[#5C3A21] hover:bg-white/40'
              }`}
            >
              <Castle className="w-3.5 h-3.5" />
              <span>
                {isAr
                  ? `قصر الدرعية (${totalRenovated}/8)`
                  : `Estate (${totalRenovated}/8)`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLeaderboardSection('mazayen');
                setLeaderboardOpen(true);
              }}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold text-[#78350F] hover:bg-white/40 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              <span>{isAr ? 'مزاين' : 'Mazayen'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShopInitialTab('shop');
                setShopModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-xl text-xs font-extrabold text-[#047857] hover:bg-white/40 transition-colors cursor-pointer whitespace-nowrap"
            >
              {isAr ? 'متجر مدى' : 'Shop'}
            </button>
          </div>

          {feedbackBanner && (
            <div
              role="status"
              aria-live="polite"
              className="w-full text-center px-3 py-1 rounded-full bg-[#3E2723] border border-[#FBBF24] text-[11px] font-bold text-[#FEF3C7] shadow truncate"
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
                    <div className="mt-1 pt-1 border-t border-[#D4B483]/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1">
                      <div className="flex items-center justify-center sm:justify-start gap-1">
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
                        className={`px-2 py-0.5 sm:py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer whitespace-nowrap text-center shrink-0 ${
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

            {/* B. FLOATING GOLDEN BONUS BUBBLE DEAL (When Active) */}
            {gameState.bonusBubble && (
              <div className="w-full rounded-2xl bg-gradient-to-r from-[#FEF3C7] via-[#FDE68A] to-[#FEF3C7] border-2 border-[#D97706] px-3 py-1.5 flex items-center justify-between gap-2 shadow-md">
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

            {/* C. CARVED NAJDI WOOD & SUN-LIT IVORY 7×7 MERGE BOARD */}
            <div className="w-full rounded-3xl board-wood-frame p-2 sm:p-2.5 border-2 border-[#563216]">
              {/* Top Bezel Booster Bar */}
              <div className="flex items-center justify-between mb-1.5 px-1 gap-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleAutoMergeOrHint}
                    className="px-2.5 py-1 rounded-xl btn-3d-green text-white text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isAr ? 'دمج تلقائي' : 'Auto-Merge'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setChainModalCategory(
                        selectedItemDef && selectedItemDef.chain !== 'generator'
                          ? selectedItemDef.chain
                          : 'qahwa'
                      );
                      setChainModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-[#FFFDF9] hover:bg-[#FEF3C7] border border-[#D4B483] text-[#5C3A21] text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-sm"
                  >
                    <Info className="w-3 h-3 text-[#D97706]" />
                    <span>{isAr ? 'دليل السلاسل' : 'Chains'}</span>
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
                        draggable={Boolean(cell.itemId && !cell.sandLocked)}
                        onDragStart={() => handleDragStart(cell.index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropOnCell(cell.index)}
                        onClick={() => handleCellClick(cell.index)}
                        className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-transform cursor-pointer select-none ${tileSurfaceClass} ${
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
              </div>
            </div>

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
      <StoryDialogueModal
        lang={lang}
        chapter={activeStoryChapter}
        onClose={handleClaimStoryChapter}
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
