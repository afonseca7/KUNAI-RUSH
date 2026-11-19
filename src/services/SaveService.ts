import { Preferences } from '@capacitor/preferences';
import {
  ADS_CADENCE_CONFIG,
  CHEST_KEY_CONFIG,
  ECONOMY_CONFIG,
  LUCKY_SPIN_CONFIG
} from '../config/balance';
import { i18n, type Locale } from '../config/i18n';
import {
  BACKGROUND_SKINS,
  KUNAI_SKINS,
  NINJA_SKINS,
  TARGET_SKINS,
  getAllShopCosmetics,
  type CosmeticPoolEntry,
  type RarityTier,
  type UnlockRule
} from '../config/skins';

export const SAVE_STORAGE_KEY = 'kunai_rush_save_v1';
export const CURRENT_SCHEMA_VERSION = 2;

export interface AdsCounters {
  interstitialShown: number;
  rewardedShown: number;
  appOpenShown: number;
  bannerShown: number;
}

export interface SaveData {
  schemaVersion: number;
  bestScore: number;
  bestLevel: number;
  coins: number;
  unlockedNinjas: string[];
  unlockedKunais: string[];
  unlockedTargets: string[];
  unlockedBackgrounds: string[];
  equippedNinja: string;
  equippedKunai: string;
  equippedTarget: string;
  equippedBackground: string;
  lastUnlockedSkinTier: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  locale: Locale;
  appLaunchCount: number;
  dailyStreakCount: number;
  lastClaimDateYmd: string | null;
  lastShopFreeCoinsAt: number;
  activeMultiplier: number;
  lastFreeSpinAt: number;
  dailyAdSpinsDateYmd: string | null;
  dailyAdSpinsCount: number;
  gameOversSinceSpinPrompt: number;
  keysWhole: number;
  keysFrac: number;
  gold: number;
  pendingChests: number;
  inFlightKeyAmount: number;
  bossKillCounts: Record<string, number>;
  lastKeyFromAd: boolean;
  adsCounters: AdsCounters;
}

function createDefaultSave(locale: Locale = 'es'): SaveData {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    bestScore: 0,
    bestLevel: 1,
    coins: 0,
    unlockedNinjas: [NINJA_SKINS[0].id],
    unlockedKunais: [KUNAI_SKINS[0].id],
    unlockedTargets: [TARGET_SKINS[0].id],
    unlockedBackgrounds: [BACKGROUND_SKINS[0].id],
    equippedNinja: NINJA_SKINS[0].id,
    equippedKunai: KUNAI_SKINS[0].id,
    equippedTarget: TARGET_SKINS[0].id,
    equippedBackground: BACKGROUND_SKINS[0].id,
    lastUnlockedSkinTier: 0,
    soundEnabled: true,
    hapticsEnabled: true,
    locale,
    appLaunchCount: 0,
    dailyStreakCount: 0,
    lastClaimDateYmd: null,
    lastShopFreeCoinsAt: 0,
    activeMultiplier: 1,
    lastFreeSpinAt: 0,
    dailyAdSpinsDateYmd: null,
    dailyAdSpinsCount: 0,
    gameOversSinceSpinPrompt: 0,
    keysWhole: 0,
    keysFrac: 0,
    gold: 0,
    pendingChests: 0,
    inFlightKeyAmount: 0,
    bossKillCounts: {},
    lastKeyFromAd: false,
    adsCounters: {
      interstitialShown: 0,
      rewardedShown: 0,
      appOpenShown: 0,
      bannerShown: 0
    }
  };
}

function toLocalYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getYesterdayYmd(date: Date): string {
  const copy = new Date(date.getTime());
  copy.setDate(copy.getDate() - 1);
  return toLocalYmd(copy);
}

function sanitizeStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return [...fallback];
  const filtered = value.filter((item): item is string => typeof item === 'string' && item.length > 0);
  for (const req of fallback) {
    if (!filtered.includes(req)) filtered.unshift(req);
  }
  return Array.from(new Set(filtered));
}

function sanitizeNonNegInt(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return fallback;
  return Math.floor(value);
}

function sanitizeFraction(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return 0;
  const clamped = Math.min(0.99, value);
  return Math.round(clamped * 100) / 100;
}

function sanitizeBossKillCounts(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object') return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
      out[k] = Math.floor(v);
    }
  }
  return out;
}

function computeHighestTierOwned(unlockedIds: string[]): number {
  const all = getAllShopCosmetics();
  let highest = 0;
  for (const entry of all) {
    if (entry.tier > 1 && unlockedIds.includes(entry.id)) {
      highest = Math.max(highest, entry.tier);
    }
  }
  return highest;
}

/**
 * Safe v1 -> v2 schema migration preserving all prior v1 inventory, stats, coins,
 * streaks, ad counters, and upgrading cosmetics + chest/key/spin state cleanly.
 */
export function migrateSave(raw: unknown): SaveData {
  const base = createDefaultSave();
  if (!raw || typeof raw !== 'object') return base;

  const obj = raw as Partial<SaveData>;
  const locale: Locale = obj.locale === 'en' ? 'en' : 'es';

  const unlockedNinjas = sanitizeStringArray(obj.unlockedNinjas, [NINJA_SKINS[0].id]);
  const unlockedKunais = sanitizeStringArray(obj.unlockedKunais, [KUNAI_SKINS[0].id]);
  const unlockedTargets = sanitizeStringArray(obj.unlockedTargets, [TARGET_SKINS[0].id]);
  const unlockedBackgrounds = sanitizeStringArray(obj.unlockedBackgrounds, [BACKGROUND_SKINS[0].id]);

  const equippedNinja =
    typeof obj.equippedNinja === 'string' && unlockedNinjas.includes(obj.equippedNinja)
      ? obj.equippedNinja
      : NINJA_SKINS[0].id;

  const equippedKunai =
    typeof obj.equippedKunai === 'string' && unlockedKunais.includes(obj.equippedKunai)
      ? obj.equippedKunai
      : KUNAI_SKINS[0].id;

  const equippedTarget =
    typeof obj.equippedTarget === 'string' && unlockedTargets.includes(obj.equippedTarget)
      ? obj.equippedTarget
      : TARGET_SKINS[0].id;

  const equippedBackground =
    typeof obj.equippedBackground === 'string' && unlockedBackgrounds.includes(obj.equippedBackground)
      ? obj.equippedBackground
      : BACKGROUND_SKINS[0].id;

  const inferredTier = computeHighestTierOwned([
    ...unlockedNinjas,
    ...unlockedKunais,
    ...unlockedBackgrounds
  ]);
  const lastUnlockedSkinTier = Math.min(
    4,
    sanitizeNonNegInt(obj.lastUnlockedSkinTier, inferredTier)
  );

  const adsRaw = (obj.adsCounters ?? {}) as Partial<AdsCounters>;

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    bestScore: sanitizeNonNegInt(obj.bestScore, 0),
    bestLevel: Math.max(1, sanitizeNonNegInt(obj.bestLevel, 1)),
    coins: sanitizeNonNegInt(obj.coins, 0),
    unlockedNinjas,
    unlockedKunais,
    unlockedTargets,
    unlockedBackgrounds,
    equippedNinja,
    equippedKunai,
    equippedTarget,
    equippedBackground,
    lastUnlockedSkinTier,
    soundEnabled: typeof obj.soundEnabled === 'boolean' ? obj.soundEnabled : true,
    hapticsEnabled: typeof obj.hapticsEnabled === 'boolean' ? obj.hapticsEnabled : true,
    locale,
    appLaunchCount: sanitizeNonNegInt(obj.appLaunchCount, 0),
    dailyStreakCount: sanitizeNonNegInt(obj.dailyStreakCount, 0),
    lastClaimDateYmd: typeof obj.lastClaimDateYmd === 'string' ? obj.lastClaimDateYmd : null,
    lastShopFreeCoinsAt: sanitizeNonNegInt(obj.lastShopFreeCoinsAt, 0),
    activeMultiplier: Math.max(1, sanitizeNonNegInt(obj.activeMultiplier, 1)),
    lastFreeSpinAt: sanitizeNonNegInt(obj.lastFreeSpinAt, 0),
    dailyAdSpinsDateYmd: typeof obj.dailyAdSpinsDateYmd === 'string' ? obj.dailyAdSpinsDateYmd : null,
    dailyAdSpinsCount: sanitizeNonNegInt(obj.dailyAdSpinsCount, 0),
    gameOversSinceSpinPrompt: sanitizeNonNegInt(obj.gameOversSinceSpinPrompt, 0),
    keysWhole: sanitizeNonNegInt(obj.keysWhole, 0),
    keysFrac: sanitizeFraction(obj.keysFrac),
    gold: sanitizeNonNegInt(obj.gold, 0),
    pendingChests: sanitizeNonNegInt(obj.pendingChests, 0),
    inFlightKeyAmount:
      typeof obj.inFlightKeyAmount === 'number' && Number.isFinite(obj.inFlightKeyAmount) && obj.inFlightKeyAmount >= 0
        ? Math.round(obj.inFlightKeyAmount * 100) / 100
        : 0,
    bossKillCounts: sanitizeBossKillCounts(obj.bossKillCounts),
    lastKeyFromAd: Boolean(obj.lastKeyFromAd),
    adsCounters: {
      interstitialShown: sanitizeNonNegInt(adsRaw.interstitialShown, 0),
      rewardedShown: sanitizeNonNegInt(adsRaw.rewardedShown, 0),
      appOpenShown: sanitizeNonNegInt(adsRaw.appOpenShown, 0),
      bannerShown: sanitizeNonNegInt(adsRaw.bannerShown, 0)
    }
  };
}

class SaveServiceImpl {
  private data: SaveData = createDefaultSave();
  private initialized = false;
  private persistQueue: Promise<void> = Promise.resolve();

  public async init(): Promise<SaveData> {
    if (this.initialized) return this.get();

    const rawString = await this.readStorage();
    if (rawString) {
      try {
        this.data = migrateSave(JSON.parse(rawString));
      } catch {
        this.data = createDefaultSave();
      }
    } else {
      this.data = createDefaultSave();
    }

    this.data.appLaunchCount += 1;
    this.syncAchievementUnlocks();
    i18n.setLocale(this.data.locale);
    this.initialized = true;
    await this.persist();
    return this.get();
  }

  public get(): SaveData {
    return {
      ...this.data,
      unlockedNinjas: [...this.data.unlockedNinjas],
      unlockedKunais: [...this.data.unlockedKunais],
      unlockedTargets: [...this.data.unlockedTargets],
      unlockedBackgrounds: [...this.data.unlockedBackgrounds],
      bossKillCounts: { ...this.data.bossKillCounts },
      adsCounters: { ...this.data.adsCounters }
    };
  }

  public isRuleMet(rule: UnlockRule): boolean {
    switch (rule.type) {
      case 'free':
        return true;
      case 'coins':
        return false;
      case 'streak':
        return this.data.dailyStreakCount >= rule.days;
      case 'level':
        return this.data.bestLevel >= rule.level;
      case 'score':
        return this.data.bestScore >= rule.score;
    }
  }

  public syncAchievementUnlocks(): string[] {
    const newlyUnlocked: string[] = [];
    for (const skin of NINJA_SKINS) {
      if (!this.data.unlockedNinjas.includes(skin.id) && this.isRuleMet(skin.unlockRule)) {
        this.data.unlockedNinjas.push(skin.id);
        this.data.lastUnlockedSkinTier = Math.max(this.data.lastUnlockedSkinTier, skin.tier);
        newlyUnlocked.push(skin.id);
      }
    }
    for (const skin of KUNAI_SKINS) {
      if (!this.data.unlockedKunais.includes(skin.id) && this.isRuleMet(skin.unlockRule)) {
        this.data.unlockedKunais.push(skin.id);
        this.data.lastUnlockedSkinTier = Math.max(this.data.lastUnlockedSkinTier, skin.tier);
        newlyUnlocked.push(skin.id);
      }
    }
    for (const skin of BACKGROUND_SKINS) {
      if (!this.data.unlockedBackgrounds.includes(skin.id) && this.isRuleMet(skin.unlockRule)) {
        this.data.unlockedBackgrounds.push(skin.id);
        this.data.lastUnlockedSkinTier = Math.max(this.data.lastUnlockedSkinTier, skin.tier);
        newlyUnlocked.push(skin.id);
      }
    }
    if (newlyUnlocked.length > 0) {
      this.schedulePersist();
    }
    return newlyUnlocked;
  }

  public recordRunResult(score: number, level: number): { isNewBestScore: boolean } {
    const cleanScore = Math.max(0, Math.floor(score));
    const cleanLevel = Math.max(1, Math.floor(level));
    const isNewBestScore = cleanScore > this.data.bestScore;
    if (isNewBestScore) {
      this.data.bestScore = cleanScore;
    }
    if (cleanLevel > this.data.bestLevel) {
      this.data.bestLevel = cleanLevel;
    }
    this.data.gameOversSinceSpinPrompt += 1;
    this.syncAchievementUnlocks();
    this.schedulePersist();
    return { isNewBestScore };
  }

  public addCoins(amount: number): number {
    const clean = Math.max(0, Math.floor(amount));
    this.data.coins += clean;
    this.schedulePersist();
    return this.data.coins;
  }

  public spendCoins(amount: number): boolean {
    const clean = Math.max(0, Math.floor(amount));
    if (this.data.coins < clean) return false;
    this.data.coins -= clean;
    this.schedulePersist();
    return true;
  }

  public unlockAndEquipNinja(id: string, price: number, tier: RarityTier): boolean {
    if (!this.data.unlockedNinjas.includes(id)) {
      if (!this.spendCoins(price)) return false;
      this.data.unlockedNinjas.push(id);
      this.data.lastUnlockedSkinTier = Math.max(this.data.lastUnlockedSkinTier, tier);
    }
    this.data.equippedNinja = id;
    this.schedulePersist();
    return true;
  }

  public equipNinja(id: string): boolean {
    if (!this.data.unlockedNinjas.includes(id)) return false;
    this.data.equippedNinja = id;
    this.schedulePersist();
    return true;
  }

  public unlockAndEquipKunai(id: string, price: number, tier: RarityTier = 1): boolean {
    if (!this.data.unlockedKunais.includes(id)) {
      if (!this.spendCoins(price)) return false;
      this.data.unlockedKunais.push(id);
      this.data.lastUnlockedSkinTier = Math.max(this.data.lastUnlockedSkinTier, tier);
    }
    this.data.equippedKunai = id;
    this.schedulePersist();
    return true;
  }

  public equipKunai(id: string): boolean {
    if (!this.data.unlockedKunais.includes(id)) return false;
    this.data.equippedKunai = id;
    this.schedulePersist();
    return true;
  }

  public unlockAndEquipBackground(id: string, price: number, tier: RarityTier): boolean {
    if (!this.data.unlockedBackgrounds.includes(id)) {
      if (!this.spendCoins(price)) return false;
      this.data.unlockedBackgrounds.push(id);
      this.data.lastUnlockedSkinTier = Math.max(this.data.lastUnlockedSkinTier, tier);
    }
    this.data.equippedBackground = id;
    this.schedulePersist();
    return true;
  }

  public equipBackground(id: string): boolean {
    if (!this.data.unlockedBackgrounds.includes(id)) return false;
    this.data.equippedBackground = id;
    this.schedulePersist();
    return true;
  }

  public unlockAndEquipTarget(id: string, price: number): boolean {
    if (!this.data.unlockedTargets.includes(id)) {
      if (!this.spendCoins(price)) return false;
      this.data.unlockedTargets.push(id);
    }
    this.data.equippedTarget = id;
    this.schedulePersist();
    return true;
  }

  public equipTarget(id: string): boolean {
    if (!this.data.unlockedTargets.includes(id)) return false;
    this.data.equippedTarget = id;
    this.schedulePersist();
    return true;
  }

  // -------------------- Feature 2: Lucky Spin --------------------

  public canUseFreeSpin(now: number = Date.now()): boolean {
    if (this.data.lastFreeSpinAt <= 0) return true;
    return now - this.data.lastFreeSpinAt >= LUCKY_SPIN_CONFIG.FREE_SPIN_COOLDOWN_MS;
  }

  public getFreeSpinRemainingSec(now: number = Date.now()): number {
    if (this.canUseFreeSpin(now)) return 0;
    return Math.ceil(
      (LUCKY_SPIN_CONFIG.FREE_SPIN_COOLDOWN_MS - (now - this.data.lastFreeSpinAt)) / 1000
    );
  }

  public getRemainingDailyAdSpins(now: Date = new Date()): number {
    const today = toLocalYmd(now);
    const usedToday = this.data.dailyAdSpinsDateYmd === today ? this.data.dailyAdSpinsCount : 0;
    return Math.max(0, LUCKY_SPIN_CONFIG.MAX_DAILY_AD_SPINS - usedToday);
  }

  public recordSpinUsed(usedFree: boolean, now: number = Date.now()): void {
    if (usedFree) {
      this.data.lastFreeSpinAt = now;
    } else {
      const today = toLocalYmd(new Date(now));
      if (this.data.dailyAdSpinsDateYmd !== today) {
        this.data.dailyAdSpinsDateYmd = today;
        this.data.dailyAdSpinsCount = 0;
      }
      this.data.dailyAdSpinsCount += 1;
    }
    this.schedulePersist();
  }

  public shouldShowPostGameOverSpinPrompt(): boolean {
    return (
      this.data.gameOversSinceSpinPrompt > 0 &&
      this.data.gameOversSinceSpinPrompt % LUCKY_SPIN_CONFIG.POST_GAMEOVER_EVERY_N === 0
    );
  }

  public setActiveMultiplier(mult: number): void {
    this.data.activeMultiplier = Math.max(1, Math.floor(mult));
    this.schedulePersist();
  }

  public consumeActiveMultiplier(): number {
    const m = Math.max(1, this.data.activeMultiplier);
    this.data.activeMultiplier = 1;
    this.schedulePersist();
    return m;
  }

  // -------------------- Feature 3: Chests, Keys, Gold & In-Flight Key --------------------

  public addPendingChest(fromAd: boolean): void {
    this.data.pendingChests += 1;
    if (fromAd) {
      this.data.lastKeyFromAd = true;
    }
    this.schedulePersist();
  }

  public addKeys(amount: number, fromAd: boolean): { whole: number; frac: number } {
    const totalHundredths =
      this.data.keysWhole * 100 +
      Math.round(this.data.keysFrac * 100) +
      Math.max(0, Math.round(amount * 100));
    this.data.keysWhole = Math.floor(totalHundredths / 100);
    this.data.keysFrac = (totalHundredths % 100) / 100;
    this.data.lastKeyFromAd = fromAd;
    this.schedulePersist();
    return { whole: this.data.keysWhole, frac: this.data.keysFrac };
  }

  public recordBossDefeatAndGetKeyDrop(bossId: string): number {
    const kills = this.data.bossKillCounts[bossId] ?? 0;
    const drop = CHEST_KEY_CONFIG.BOSS_KEY_DROPS[kills] ?? 0;
    this.data.bossKillCounts[bossId] = kills + 1;
    this.schedulePersist();
    return drop;
  }

  public setInFlightKey(amount: number): void {
    this.data.inFlightKeyAmount = Math.max(0, Math.round(amount * 100) / 100);
    this.schedulePersist();
  }

  public discardInFlightKey(): number {
    const lost = this.data.inFlightKeyAmount;
    this.data.inFlightKeyAmount = 0;
    this.schedulePersist();
    return lost;
  }

  public openPendingChest(usedAd: boolean): {
    opened: boolean;
    keyGained: number;
    goldGained: number;
  } {
    if (this.data.pendingChests <= 0) {
      return { opened: false, keyGained: 0, goldGained: 0 };
    }
    this.data.pendingChests -= 1;
    const bonusInFlight = this.data.inFlightKeyAmount;
    this.data.inFlightKeyAmount = 0;
    const totalKey = CHEST_KEY_CONFIG.CHEST_KEY_REWARD + bonusInFlight;
    this.addKeys(totalKey, usedAd);
    this.data.gold += CHEST_KEY_CONFIG.CHEST_GOLD_REWARD;
    this.schedulePersist();
    return {
      opened: true,
      keyGained: totalKey,
      goldGained: CHEST_KEY_CONFIG.CHEST_GOLD_REWARD
    };
  }

  public canRedeemKeysForSkin(): boolean {
    return this.data.keysWhole >= CHEST_KEY_CONFIG.KEYS_PER_SKIN;
  }

  public redeemKeysForRandomSkin(randFn: () => number = Math.random): {
    redeemed: boolean;
    item?: CosmeticPoolEntry;
    allOwned: boolean;
  } {
    if (this.data.keysWhole < CHEST_KEY_CONFIG.KEYS_PER_SKIN) {
      return { redeemed: false, allOwned: false };
    }

    const ownedSet = new Set([
      ...this.data.unlockedNinjas,
      ...this.data.unlockedKunais,
      ...this.data.unlockedBackgrounds
    ]);
    const locked = getAllShopCosmetics().filter((c) => !ownedSet.has(c.id));
    if (locked.length === 0) {
      return { redeemed: false, allOwned: true };
    }

    const preferredTiers: RarityTier[] =
      this.data.lastUnlockedSkinTier <= 0
        ? [3, 2, 4, 1]
        : [
            Math.min(4, this.data.lastUnlockedSkinTier + 1) as RarityTier,
            4,
            3,
            2,
            1
          ];

    let candidates: CosmeticPoolEntry[] = [];
    for (const tier of preferredTiers) {
      const matches = locked.filter((item) => item.tier === tier);
      if (matches.length > 0) {
        candidates = matches;
        break;
      }
    }
    if (candidates.length === 0) candidates = locked;

    const chosen = candidates[Math.floor(randFn() * candidates.length) % candidates.length];
    this.data.keysWhole -= CHEST_KEY_CONFIG.KEYS_PER_SKIN;
    if (chosen.category === 'ninjas') {
      this.data.unlockedNinjas.push(chosen.id);
    } else if (chosen.category === 'kunais') {
      this.data.unlockedKunais.push(chosen.id);
    } else {
      this.data.unlockedBackgrounds.push(chosen.id);
    }
    this.data.lastUnlockedSkinTier = chosen.tier;
    this.schedulePersist();
    return { redeemed: true, item: chosen, allOwned: false };
  }

  public setSoundEnabled(enabled: boolean): void {
    this.data.soundEnabled = enabled;
    this.schedulePersist();
  }

  public setHapticsEnabled(enabled: boolean): void {
    this.data.hapticsEnabled = enabled;
    this.schedulePersist();
  }

  public setLocale(locale: Locale): void {
    this.data.locale = locale;
    i18n.setLocale(locale);
    this.schedulePersist();
  }

  public canClaimDailyStreak(now: Date = new Date()): {
    eligible: boolean;
    nextDayIndex: number;
    rewardCoins: number;
  } {
    const today = toLocalYmd(now);
    if (this.data.lastClaimDateYmd === today) {
      const idx = Math.max(1, this.data.dailyStreakCount);
      return { eligible: false, nextDayIndex: idx, rewardCoins: 0 };
    }

    const yesterday = getYesterdayYmd(now);
    const consecutive = this.data.lastClaimDateYmd === yesterday;
    const nextDay = consecutive ? this.data.dailyStreakCount + 1 : 1;
    const rewards = ECONOMY_CONFIG.DAILY_STREAK_REWARDS;
    const rewardCoins = rewards[Math.min(nextDay - 1, rewards.length - 1)];

    return {
      eligible: true,
      nextDayIndex: nextDay,
      rewardCoins
    };
  }

  public claimDailyStreak(now: Date = new Date()): {
    claimed: boolean;
    dayIndex: number;
    coins: number;
  } {
    const status = this.canClaimDailyStreak(now);
    if (!status.eligible) {
      return { claimed: false, dayIndex: status.nextDayIndex, coins: 0 };
    }

    this.data.dailyStreakCount = status.nextDayIndex;
    this.data.lastClaimDateYmd = toLocalYmd(now);
    this.data.coins += status.rewardCoins;
    this.syncAchievementUnlocks();
    this.schedulePersist();
    return {
      claimed: true,
      dayIndex: status.nextDayIndex,
      coins: status.rewardCoins
    };
  }

  public getShopFreeCoinsRemainingSec(now: number = Date.now()): number {
    const elapsed = now - this.data.lastShopFreeCoinsAt;
    if (elapsed >= ADS_CADENCE_CONFIG.SHOP_FREE_COINS_COOLDOWN_MS) return 0;
    return Math.ceil((ADS_CADENCE_CONFIG.SHOP_FREE_COINS_COOLDOWN_MS - elapsed) / 1000);
  }

  public markShopFreeCoinsClaimed(now: number = Date.now()): void {
    this.data.lastShopFreeCoinsAt = now;
    this.schedulePersist();
  }

  public incrementAdCounter(type: keyof AdsCounters): void {
    this.data.adsCounters[type] += 1;
    this.schedulePersist();
  }

  public async resetProgress(): Promise<SaveData> {
    const currentLocale = this.data.locale;
    const currentLaunches = this.data.appLaunchCount;
    this.data = createDefaultSave(currentLocale);
    this.data.appLaunchCount = currentLaunches;
    await this.persist();
    return this.get();
  }

  private schedulePersist(): void {
    this.persistQueue = this.persistQueue.then(() => this.persist()).catch(() => {});
  }

  private async persist(): Promise<void> {
    const payload = JSON.stringify(this.data);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(SAVE_STORAGE_KEY, payload);
      }
    } catch {
      // Ignore storage quota errors in restricted sandboxes
    }
    try {
      await Preferences.set({ key: SAVE_STORAGE_KEY, value: payload });
    } catch {
      // Web fallback already written to localStorage
    }
  }

  private async readStorage(): Promise<string | null> {
    try {
      const result = await Preferences.get({ key: SAVE_STORAGE_KEY });
      if (result && typeof result.value === 'string' && result.value.length > 0) {
        return result.value;
      }
    } catch {
      // Fall back to localStorage
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(SAVE_STORAGE_KEY);
      }
    } catch {
      // Ignore localStorage unavailability
    }
    return null;
  }
}

export const saveService = new SaveServiceImpl();
