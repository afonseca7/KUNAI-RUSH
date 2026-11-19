import Phaser from 'phaser';
import { ASSET_KEYS } from '../objects/AssetPipeline';
import { saveService } from './SaveService';

export type SoundEffectType =
  | 'throw'
  | 'thunk'
  | 'crack'
  | 'clang'
  | 'coin'
  | 'boss'
  | 'fail'
  | 'levelup'
  | 'click';

const SFX_KEY_MAP: Record<SoundEffectType, string> = {
  throw: ASSET_KEYS.SFX_THROW,
  thunk: ASSET_KEYS.SFX_THUNK,
  crack: ASSET_KEYS.SFX_CRACK,
  clang: ASSET_KEYS.SFX_CLANG,
  coin: ASSET_KEYS.SFX_COIN,
  boss: ASSET_KEYS.SFX_BOSS,
  fail: ASSET_KEYS.SFX_FAIL,
  levelup: ASSET_KEYS.SFX_LEVELUP,
  click: ASSET_KEYS.SFX_CLICK
};

class AudioServiceImpl {
  private game?: Phaser.Game;
  private bgm?: Phaser.Sound.BaseSound;
  private fallbackCtx?: AudioContext;
  private unlocked = false;

  public bindGame(game: Phaser.Game): void {
    this.game = game;
    this.syncMuteFromSave();

    const unlock = (): void => {
      this.unlockAudio();
    };
    window.addEventListener('pointerdown', unlock, { once: true, passive: true });
    window.addEventListener('keydown', unlock, { once: true, passive: true });
    document.addEventListener('visibilitychange', () => {
      if (!this.bgm) return;
      if (document.hidden) {
        if (this.bgm.isPlaying) this.bgm.pause();
      } else if (saveService.get().soundEnabled && this.bgm.isPaused) {
        this.bgm.resume();
      }
    });
  }

  public unlockAudio(): void {
    if (this.unlocked) return;
    this.unlocked = true;

    const soundMgr = this.game?.sound;
    if (soundMgr && 'context' in soundMgr) {
      const ctx = (soundMgr as Phaser.Sound.WebAudioSoundManager).context;
      if (ctx && ctx.state === 'suspended') {
        void ctx.resume().catch(() => {});
      }
    }

    if (saveService.get().soundEnabled) {
      this.ensureBgmPlaying();
    }
  }

  public syncMuteFromSave(): void {
    const enabled = saveService.get().soundEnabled;
    if (this.game?.sound) {
      this.game.sound.mute = !enabled;
    }
    if (!enabled && this.bgm?.isPlaying) {
      this.bgm.pause();
    } else if (enabled && this.unlocked) {
      this.ensureBgmPlaying();
    }
  }

  public ensureBgmPlaying(): void {
    if (!this.game?.sound || !saveService.get().soundEnabled) return;
    if (!this.game.cache.audio.exists(ASSET_KEYS.BGM_NIGHT)) return;

    if (!this.bgm) {
      this.bgm = this.game.sound.add(ASSET_KEYS.BGM_NIGHT, {
        loop: true,
        volume: 0.24
      });
    }
    if (!this.bgm.isPlaying && !this.bgm.isPaused) {
      this.bgm.play();
    } else if (this.bgm.isPaused) {
      this.bgm.resume();
    }
  }

  public playSfx(type: SoundEffectType, comboStep: number = 1): void {
    if (!saveService.get().soundEnabled) return;
    this.unlockAudio();

    const rate =
      type === 'thunk' || type === 'coin'
        ? Math.min(1.45, 1 + Math.max(0, comboStep - 1) * 0.055)
        : 1;

    const key = SFX_KEY_MAP[type];
    const soundMgr = this.game?.sound;
    if (soundMgr && this.game?.cache.audio.exists(key)) {
      try {
        soundMgr.play(key, {
          volume: type === 'click' ? 0.38 : type === 'throw' ? 0.45 : 0.62,
          rate
        });
        return;
      } catch {
        // Fall through to WebAudio combo fallback
      }
    }

    this.playWebAudioFallback(type, rate);
  }

  private playWebAudioFallback(type: SoundEffectType, rate: number): void {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      if (!this.fallbackCtx) this.fallbackCtx = new Ctx();
      if (this.fallbackCtx.state === 'suspended') {
        void this.fallbackCtx.resume();
      }

      const now = this.fallbackCtx.currentTime;
      const osc = this.fallbackCtx.createOscillator();
      const gain = this.fallbackCtx.createGain();
      const baseFreq =
        type === 'coin'
          ? 740
          : type === 'thunk'
            ? 240
            : type === 'clang'
              ? 165
              : type === 'levelup'
                ? 520
                : 340;
      osc.type = type === 'clang' || type === 'fail' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq * rate, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * rate * 1.15, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.fallbackCtx.destination);
      osc.start(now);
      osc.stop(now + 0.095);
    } catch {
      // Ignore audio errors in muted/headless sandboxes
    }
  }
}

export const audioService = new AudioServiceImpl();
