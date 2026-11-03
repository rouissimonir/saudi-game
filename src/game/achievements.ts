import type { GameState } from './rules';

/**
 * Lifetime goals that sit above the daily quests: each one pays once, from progress the game already tracks.
 * Players from before this feature can collect whatever they have already earned.
 */
export interface AchievementDef {
  id: string;
  icon: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  target: number;
  reward: { gems: number; coins: number };
  progress: (state: GameState) => number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'guests_5', icon: '☕', titleAr: 'مضيف مبتدئ', titleEn: 'Fresh Host', descAr: 'استقبل 5 ضيوف', descEn: 'Welcome 5 guests', target: 5, reward: { gems: 5, coins: 100 }, progress: (s) => s.ordersCompleted },
  { id: 'guests_25', icon: '🫖', titleAr: 'مضيف مرحّب', titleEn: 'Warm Host', descAr: 'استقبل 25 ضيفاً', descEn: 'Welcome 25 guests', target: 25, reward: { gems: 12, coins: 300 }, progress: (s) => s.ordersCompleted },
  { id: 'guests_100', icon: '🏆', titleAr: 'كريم المجلس', titleEn: 'Pride of the Majlis', descAr: 'استقبل 100 ضيف', descEn: 'Welcome 100 guests', target: 100, reward: { gems: 40, coins: 1000 }, progress: (s) => s.ordersCompleted },
  { id: 'merges_50', icon: '✨', titleAr: 'يد خفيفة', titleEn: 'Light Hands', descAr: 'ادمج 50 مرة', descEn: 'Merge 50 times', target: 50, reward: { gems: 5, coins: 100 }, progress: (s) => s.totalMerges },
  { id: 'merges_250', icon: '🌟', titleAr: 'دمّاج ماهر', titleEn: 'Skilled Merger', descAr: 'ادمج 250 مرة', descEn: 'Merge 250 times', target: 250, reward: { gems: 15, coins: 400 }, progress: (s) => s.totalMerges },
  { id: 'merges_1000', icon: '💫', titleAr: 'أستاذ الدمج', titleEn: 'Merge Master', descAr: 'ادمج 1000 مرة', descEn: 'Merge 1,000 times', target: 1000, reward: { gems: 50, coins: 1500 }, progress: (s) => s.totalMerges },
  { id: 'level_5', icon: '⭐', titleAr: 'مستوى 5', titleEn: 'Level 5', descAr: 'اوصل المستوى 5', descEn: 'Reach level 5', target: 5, reward: { gems: 8, coins: 200 }, progress: (s) => s.level },
  { id: 'level_10', icon: '🌠', titleAr: 'مستوى 10', titleEn: 'Level 10', descAr: 'اوصل المستوى 10', descEn: 'Reach level 10', target: 10, reward: { gems: 20, coins: 500 }, progress: (s) => s.level },
  { id: 'level_20', icon: '👑', titleAr: 'مستوى 20', titleEn: 'Level 20', descAr: 'اوصل المستوى 20', descEn: 'Reach level 20', target: 20, reward: { gems: 60, coins: 1500 }, progress: (s) => s.level },
  { id: 'finds_12', icon: '📖', titleAr: 'هاوي جمع', titleEn: 'Keen Collector', descAr: 'اكتشف 12 عنصراً', descEn: 'Discover 12 items', target: 12, reward: { gems: 10, coins: 250 }, progress: (s) => s.discoveredItemIds.length },
  { id: 'finds_24', icon: '🗝️', titleAr: 'جامع الكنوز', titleEn: 'Treasure Collector', descAr: 'اكتشف 24 عنصراً', descEn: 'Discover 24 items', target: 24, reward: { gems: 30, coins: 800 }, progress: (s) => s.discoveredItemIds.length },
  { id: 'wings_3', icon: '🏛️', titleAr: 'يد البناء', titleEn: 'Builder', descAr: 'رمّم 3 أجنحة', descEn: 'Restore 3 wings', target: 3, reward: { gems: 10, coins: 300 }, progress: (s) => s.wingUpgrades },
  { id: 'wings_10', icon: '🏰', titleAr: 'معمّر المجالس', titleEn: 'Majlis Restorer', descAr: 'رمّم 10 أجنحة', descEn: 'Restore 10 wings', target: 10, reward: { gems: 35, coins: 1000 }, progress: (s) => s.wingUpgrades },
  { id: 'travel_1', icon: '🧭', titleAr: 'رحّال', titleEn: 'Traveller', descAr: 'سافر إلى منطقة جديدة', descEn: 'Travel to a new area', target: 1, reward: { gems: 15, coins: 400 }, progress: (s) => s.areaIndex },
  { id: 'streak_3', icon: '🔥', titleAr: 'زائر وفي', titleEn: 'Loyal Visitor', descAr: 'زُر اللعبة 3 أيام متتالية', descEn: 'Visit 3 days in a row', target: 3, reward: { gems: 8, coins: 200 }, progress: (s) => s.loginStreak },
  { id: 'streak_7', icon: '🌙', titleAr: 'ضيف الأسبوع', titleEn: 'Week-long Guest', descAr: 'زُر اللعبة 7 أيام', descEn: 'Visit 7 days', target: 7, reward: { gems: 25, coins: 600 }, progress: (s) => s.loginStreak },
  { id: 'invite_1', icon: '💌', titleAr: 'سفير الضيافة', titleEn: 'Hospitality Ambassador', descAr: 'شارك اللعبة مع صديق', descEn: 'Share the game with a friend', target: 1, reward: { gems: 15, coins: 300 }, progress: (s) => s.sharedCount },
  { id: 'story_3', icon: '📜', titleAr: 'راوي الحكاية', titleEn: 'Storyteller', descAr: 'شاهد 3 فصول من الحكاية', descEn: 'Watch 3 story chapters', target: 3, reward: { gems: 10, coins: 250 }, progress: (s) => s.completedStoryIds.length },
];

export interface AchievementRow {
  def: AchievementDef;
  progress: number;
  done: boolean;
  claimed: boolean;
}

export function achievementRows(state: GameState): AchievementRow[] {
  return ACHIEVEMENTS.map((def) => {
    const progress = Math.min(def.target, Math.max(0, Math.floor(def.progress(state))));
    return { def, progress, done: progress >= def.target, claimed: state.claimedAchievements.includes(def.id) };
  });
}

/** How many are finished and waiting to be collected (shown as a badge). */
export function claimableAchievements(state: GameState): number {
  return achievementRows(state).filter((row) => row.done && !row.claimed).length;
}

export function claimAchievement(state: GameState, id: string): { state: GameState; claimed: boolean; reward?: AchievementDef['reward'] } {
  const row = achievementRows(state).find((r) => r.def.id === id);
  if (!row || !row.done || row.claimed) return { state, claimed: false };
  return {
    state: {
      ...state,
      diamonds: state.diamonds + row.def.reward.gems,
      coins: state.coins + row.def.reward.coins,
      claimedAchievements: [...state.claimedAchievements, id],
    },
    claimed: true,
    reward: row.def.reward,
  };
}
