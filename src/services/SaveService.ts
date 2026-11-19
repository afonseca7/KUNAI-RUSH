import { Preferences } from '@capacitor/preferences';
import { ADS_CADENCE_CONFIG, ECONOMY_CONFIG } from '../config/balance';
import { i18n, type Locale } from '../config/i18n';
import { KUNAI_SKINS, TARGET_SKINS } from '../config/skins';

export const SAVE_STORAGE_KEY = 'kunai_rush_save_v1';
export const CURRENT_SCHEMA_VERSION = 1;

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
  unlockedKunais: string[];
  unlockedTargets: string[];
  equippedKunai: string;
  equippedTarget: string;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  locale: Locale;
  appLaunchCount: number;
  dailyStreakCount: number;
  lastClaimDateYmd: string | null;
  lastShopFreeCoinsAt: number;
  adsCounters: AdsCounters;
}

function createDefaultSave(locale: Locale = 'es'): SaveData {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    bestScore: 0,
    bestLevel: 1,
    coins: 0,
    unlockedKunais: [KUNAI_SKINS[0].id],
    unlockedTargets: [TARGET_SKINS[0].id],
    equippedKunai: KUNAI_SKINS[0].id,
    equippedTarget: TARGET_SKINS[0].id,
    soundEnabled: true,
    hapticsEnabled: true,
    locale,
    appLaunchCount: 0,
    dailyStreakCount: 0,
    lastClaimDateYmd: null,
    lastShopFreeCoinsAt: 0,
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

export function migrateSave(raw: unknown): SaveData {
  const base = createDefaultSave();
  if (!raw || typeof raw !== 'object') return base;

  const obj = raw as Partial<SaveData>;
  const locale: Locale = obj.locale === 'en' ? 'en' : 'es';

  const unlockedKunais = sanitizeStringArray(obj.unlockedKunais, [KUNAI_SKINS[0].id]);
  const unlockedTargets = sanitizeStringArray(obj.unlockedTargets, [TARGET_SKINS[0].id]);

  const equippedKunai =
    typeof obj.equippedKunai === 'string' && unlockedKunais.includes(obj.equippedKunai)
      ? obj.equippedKunai
      : KUNAI_SKINS[0].id;

  const equippedTarget =
    typeof obj.equippedTarget === 'string' && unlockedTargets.includes(obj.equippedTarget)
      ? obj.equippedTarget
      : TARGET_SKINS[0].id;

  const adsRaw = (obj.adsCounters ?? {}) as Partial<AdsCounters>;

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    bestScore: sanitizeNonNegInt(obj.bestScore, 0),
    bestLevel: Math.max(1, sanitizeNonNegInt(obj.bestLevel, 1)),
    coins: sanitizeNonNegInt(obj.coins, 0),
    unlockedKunais,
    unlockedTargets,
    equippedKunai,
    equippedTarget,
    soundEnabled: typeof obj.soundEnabled === 'boolean' ? obj.soundEnabled : true,
    hapticsEnabled: typeof obj.hapticsEnabled === 'boolean' ? obj.hapticsEnabled : true,
    locale,
    appLaunchCount: sanitizeNonNegInt(obj.appLaunchCount, 0),
    dailyStreakCount: sanitizeNonNegInt(obj.dailyStreakCount, 0),
    lastClaimDateYmd: typeof obj.lastClaimDateYmd === 'string' ? obj.lastClaimDateYmd : null,
    lastShopFreeCoinsAt: sanitizeNonNegInt(obj.lastShopFreeCoinsAt, 0),
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
    i18n.setLocale(this.data.locale);
    this.initialized = true;
    await this.persist();
    return this.get();
  }

  public get(): SaveData {
    return {
      ...this.data,
      unlockedKunais: [...this.data.unlockedKunais],
      unlockedTargets: [...this.data.unlockedTargets],
      adsCounters: { ...this.data.adsCounters }
    };
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

  public unlockAndEquipKunai(id: string, price: number): boolean {
    if (!this.data.unlockedKunais.includes(id)) {
      if (!this.spendCoins(price)) return false;
      this.data.unlockedKunais.push(id);
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
