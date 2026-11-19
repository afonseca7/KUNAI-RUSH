import { i18n } from '../../config/i18n';
import type { IAdsAdapter, RewardedPlacement, UmpConsentState } from './IAdsService';

const UMP_MOCK_KEY = 'kunai_rush_ump_mock_v1';

export class WebMockAdsAdapter implements IAdsAdapter {
  public readonly mode = 'web_mock' as const;
  private bannerEl: HTMLDivElement | null = null;
  private styleInjected = false;

  private getRoot(): HTMLElement {
    this.ensureStyles();
    let el = document.getElementById('ads-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ads-overlay';
      document.body.appendChild(el);
    }
    return el;
  }

  private ensureStyles(): void {
    if (this.styleInjected) return;
    this.styleInjected = true;
    const style = document.createElement('style');
    style.textContent = `
      .kr-ad-banner {
        position: fixed;
        left: 50%;
        bottom: var(--safe-bottom, 0px);
        transform: translateX(-50%);
        width: min(360px, 100vw);
        height: 48px;
        background: linear-gradient(180deg, #1b243b 0%, #0e1424 100%);
        border: 2px solid #f08a4b;
        color: #ffe073;
        font-family: monospace;
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;
        pointer-events: auto;
        box-sizing: border-box;
        z-index: 10000;
      }
      .kr-ad-badge {
        background: #2e8b57;
        color: #fff;
        font-weight: bold;
        font-size: 10px;
        padding: 2px 5px;
        border: 1px solid #9bf5c6;
      }
      .kr-ad-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(5, 7, 14, 0.92);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        pointer-events: auto;
        z-index: 10010;
      }
      .kr-ad-card {
        width: min(320px, 92vw);
        background: #141c30;
        border: 3px solid #f08a4b;
        padding: 16px;
        color: #f4f0e8;
        font-family: monospace;
        text-align: center;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.8);
      }
      .kr-ad-title {
        color: #ffe073;
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 8px;
      }
      .kr-ad-body {
        color: #d6e2f5;
        font-size: 12px;
        line-height: 1.45;
        margin-bottom: 14px;
      }
      .kr-ad-timer {
        color: #59f2e6;
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 14px;
      }
      .kr-ad-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .kr-ad-btn {
        font-family: monospace;
        font-size: 12px;
        font-weight: bold;
        padding: 9px 12px;
        border: 2px solid #0b0e18;
        cursor: pointer;
      }
      .kr-ad-btn-primary {
        background: #f08a4b;
        color: #1c100b;
      }
      .kr-ad-btn-primary:disabled {
        background: #4e4740;
        color: #9e968c;
        cursor: not-allowed;
      }
      .kr-ad-btn-secondary {
        background: #2b354f;
        color: #f4f0e8;
      }
    `;
    document.head.appendChild(style);
  }

  public async init(): Promise<{ umpState: UmpConsentState; npa: boolean }> {
    const saved = this.readSavedConsent();
    if (saved) {
      return {
        umpState: saved,
        npa: saved === 'FALLBACK_NPA'
      };
    }

    const isEs = i18n.getLocale() === 'es';
    const choice = await new Promise<UmpConsentState>((resolve) => {
      const root = this.getRoot();
      const backdrop = document.createElement('div');
      backdrop.className = 'kr-ad-modal-backdrop';
      backdrop.dataset.adType = 'ump';

      const card = document.createElement('div');
      card.className = 'kr-ad-card';

      const title = document.createElement('div');
      title.className = 'kr-ad-title';
      title.textContent = isEs ? 'PRIVACIDAD Y ANUNCIOS (UMP)' : 'PRIVACY & ADS (UMP)';

      const body = document.createElement('div');
      body.className = 'kr-ad-body';
      body.textContent = isEs
        ? 'Kunai Rush usa Google AdMob (13+). Puedes aceptar anuncios personalizados o elegir anuncios no personalizados (NPA).'
        : 'Kunai Rush uses Google AdMob (13+). You may accept personalized ads or choose non-personalized ads (NPA).';

      const actions = document.createElement('div');
      actions.className = 'kr-ad-actions';

      const acceptBtn = document.createElement('button');
      acceptBtn.id = 'ump-accept-btn';
      acceptBtn.className = 'kr-ad-btn kr-ad-btn-primary';
      acceptBtn.textContent = isEs ? 'Aceptar personalizados' : 'Accept Personalized';
      acceptBtn.onclick = () => {
        backdrop.remove();
        resolve('OBTAINED');
      };

      const npaBtn = document.createElement('button');
      npaBtn.id = 'ump-npa-btn';
      npaBtn.className = 'kr-ad-btn kr-ad-btn-secondary';
      npaBtn.textContent = isEs ? 'Solo no personalizados (NPA)' : 'Non-Personalized Only (NPA)';
      npaBtn.onclick = () => {
        backdrop.remove();
        resolve('FALLBACK_NPA');
      };

      actions.append(acceptBtn, npaBtn);
      card.append(title, body, actions);
      backdrop.appendChild(card);
      root.appendChild(backdrop);
    });

    this.saveConsent(choice);
    return {
      umpState: choice,
      npa: choice === 'FALLBACK_NPA'
    };
  }

  public async showBanner(): Promise<void> {
    const root = this.getRoot();
    if (!this.bannerEl) {
      const el = document.createElement('div');
      el.className = 'kr-ad-banner';
      el.dataset.adType = 'banner';

      const left = document.createElement('span');
      left.innerHTML = '<span class="kr-ad-badge">AD</span> AdMob Test Banner';
      const right = document.createElement('span');
      right.textContent = '320x50 SAFE';

      el.append(left, right);
      this.bannerEl = el;
    }
    if (!this.bannerEl.parentElement) {
      root.appendChild(this.bannerEl);
    }
    this.bannerEl.style.display = 'flex';
  }

  public async hideBanner(): Promise<void> {
    if (this.bannerEl) {
      this.bannerEl.style.display = 'none';
    }
  }

  public async showInterstitial(npa: boolean): Promise<boolean> {
    const isEs = i18n.getLocale() === 'es';
    return this.runCountdownOverlay({
      adType: 'interstitial',
      title: isEs ? 'ANUNCIO INTERSTICIAL (TEST)' : 'TEST INTERSTITIAL AD',
      subtitle: `AdMob Test · NPA=${npa ? 'TRUE' : 'FALSE'}`,
      seconds: 5,
      primaryLabel: isEs ? 'Cerrar anuncio' : 'Close Ad',
      allowEarlyDismiss: false
    });
  }

  public async showRewarded(placement: RewardedPlacement, npa: boolean): Promise<boolean> {
    const isEs = i18n.getLocale() === 'es';
    return this.runCountdownOverlay({
      adType: 'rewarded',
      title: isEs ? 'ANUNCIO BONIFICADO (TEST)' : 'TEST REWARDED AD',
      subtitle: `${placement.toUpperCase()} · NPA=${npa ? 'TRUE' : 'FALSE'}`,
      seconds: 5,
      primaryLabel: isEs ? 'Reclamar recompensa' : 'Claim Reward',
      dismissLabel: isEs ? 'Cerrar sin recompensa' : 'Close without reward',
      allowEarlyDismiss: true
    });
  }

  public async showAppOpen(npa: boolean, timeoutMs: number): Promise<boolean> {
    const isEs = i18n.getLocale() === 'es';
    const seconds = Math.min(4, Math.max(1, Math.round(timeoutMs / 1000)));
    return this.runCountdownOverlay({
      adType: 'app_open',
      title: isEs ? 'APP OPEN AD (TEST)' : 'TEST APP OPEN AD',
      subtitle: `Cold Launch >= 2 · NPA=${npa ? 'TRUE' : 'FALSE'}`,
      seconds,
      primaryLabel: isEs ? 'Continuar al dojo' : 'Continue to Game',
      allowEarlyDismiss: false,
      autoCloseOnZero: true
    });
  }

  private runCountdownOverlay(opts: {
    adType: string;
    title: string;
    subtitle: string;
    seconds: number;
    primaryLabel: string;
    dismissLabel?: string;
    allowEarlyDismiss: boolean;
    autoCloseOnZero?: boolean;
  }): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const root = this.getRoot();
      const backdrop = document.createElement('div');
      backdrop.className = 'kr-ad-modal-backdrop';
      backdrop.dataset.adType = opts.adType;

      const card = document.createElement('div');
      card.className = 'kr-ad-card';

      const title = document.createElement('div');
      title.className = 'kr-ad-title';
      title.textContent = opts.title;

      const body = document.createElement('div');
      body.className = 'kr-ad-body';
      body.textContent = opts.subtitle;

      let remaining = opts.seconds;
      const timer = document.createElement('div');
      timer.className = 'kr-ad-timer';
      timer.textContent = `${remaining}s`;

      const actions = document.createElement('div');
      actions.className = 'kr-ad-actions';

      const primaryBtn = document.createElement('button');
      primaryBtn.id = 'ad-primary-btn';
      primaryBtn.className = 'kr-ad-btn kr-ad-btn-primary';
      primaryBtn.textContent = `${opts.primaryLabel} (${remaining}s)`;
      primaryBtn.disabled = true;

      let intervalId = 0;
      const finish = (rewarded: boolean): void => {
        if (intervalId) window.clearInterval(intervalId);
        backdrop.remove();
        resolve(rewarded);
      };

      primaryBtn.onclick = () => finish(true);
      actions.appendChild(primaryBtn);

      if (opts.allowEarlyDismiss && opts.dismissLabel) {
        const dismissBtn = document.createElement('button');
        dismissBtn.id = 'ad-dismiss-btn';
        dismissBtn.className = 'kr-ad-btn kr-ad-btn-secondary';
        dismissBtn.textContent = opts.dismissLabel;
        dismissBtn.onclick = () => finish(false);
        actions.appendChild(dismissBtn);
      }

      card.append(title, body, timer, actions);
      backdrop.appendChild(card);
      root.appendChild(backdrop);

      intervalId = window.setInterval(() => {
        remaining = Math.max(0, remaining - 1);
        timer.textContent = `${remaining}s`;
        if (remaining <= 0) {
          window.clearInterval(intervalId);
          intervalId = 0;
          primaryBtn.disabled = false;
          primaryBtn.textContent = opts.primaryLabel;
          if (opts.autoCloseOnZero) {
            finish(true);
          }
        } else {
          primaryBtn.textContent = `${opts.primaryLabel} (${remaining}s)`;
        }
      }, 1000);
    });
  }

  private readSavedConsent(): UmpConsentState | null {
    try {
      const val = window.localStorage.getItem(UMP_MOCK_KEY);
      if (val === 'OBTAINED' || val === 'FALLBACK_NPA') return val;
    } catch {
      // Ignore storage access errors
    }
    return null;
  }

  private saveConsent(state: UmpConsentState): void {
    try {
      window.localStorage.setItem(UMP_MOCK_KEY, state);
    } catch {
      // Ignore storage access errors
    }
  }
}
