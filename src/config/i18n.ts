export type Locale = 'es' | 'en';

export type TranslationParams = Record<string, string | number>;

const ES_DICT = {
  'app.title': 'KUNAI RUSH',
  'app.subtitle': 'NINJA NOCTURNO',
  'common.back': 'VOLVER',
  'common.close': 'CERRAR',
  'common.ok': 'ACEPTAR',
  'common.cancel': 'CANCELAR',
  'common.yes': 'SÍ',
  'common.no': 'NO',
  'common.loading': 'CARGANDO...',
  'common.coins': '{count}',

  'menu.play': 'JUGAR',
  'menu.shop': 'TIENDA',
  'menu.settings': 'AJUSTES',
  'menu.best_score': 'RÉCORD: {score}',
  'menu.best_level': 'NIVEL MÁX: {level}',
  'menu.daily_ready': '¡RACHA DIARIA!',
  'menu.tap_hint': 'TOCA PARA LANZAR',

  'game.level': 'NIVEL {level}',
  'game.score': '{score}',
  'game.combo': '¡COMBO x{combo}!',
  'game.boss_badge': 'JEFE {phase}/3',
  'game.boss_incoming': '¡JEFE NOCTURNO!',
  'game.phase_clear': '¡FASE {phase} ROTA!',
  'game.level_clear': '¡NIVEL SUPERADO!',
  'game.boss_clear': '¡JEFE DERROTADO! +{coins}',
  'game.paused': 'PAUSA',
  'game.resume': 'REANUDAR',
  'game.quit': 'MENÚ',

  'revive.title': '¿REVIVIR?',
  'revive.subtitle': 'ÚLTIMA OPORTUNIDAD EN NIVEL {level}',
  'revive.watch_ad': 'VER ANUNCIO',
  'revive.skip': 'NO, GRACIAS',

  'gameover.title': 'FIN DE PARTIDA',
  'gameover.new_record': '¡NUEVO RÉCORD!',
  'gameover.score': 'PUNTOS: {score}',
  'gameover.best': 'RÉCORD: {best}',
  'gameover.level': 'NIVEL {level}',
  'gameover.run_coins': '+{coins} MONEDAS',
  'gameover.double_coins': 'x2 MONEDAS (AD)',
  'gameover.doubled': '¡DUPLICADO! +{coins}',
  'gameover.retry': 'REINTENTAR',
  'gameover.menu': 'MENÚ',

  'streak.title': 'RACHA DIARIA',
  'streak.subtitle': 'DÍA {day} · +{coins} MONEDAS',
  'streak.day': 'DÍA {day}',
  'streak.claim': 'RECLAMAR +{coins}',

  'shop.title': 'DOJO TIENDA',
  'shop.tab_kunais': 'KUNAIS',
  'shop.tab_targets': 'DIANAS',
  'shop.equip': 'EQUIPAR',
  'shop.equipped': 'EQUIPADO',
  'shop.buy': 'COMPRAR {price}',
  'shop.no_coins': 'FALTA ORO',
  'shop.free_coins': '+25 MONEDAS GRATIS',
  'shop.free_cooldown': 'ESPERA {sec}S',
  'shop.free_claimed': '¡+25 MONEDAS!',

  'settings.title': 'AJUSTES',
  'settings.sound': 'SONIDO',
  'settings.haptics': 'VIBRACIÓN',
  'settings.language': 'IDIOMA',
  'settings.lang_name': 'ESPAÑOL',
  'settings.on': 'SÍ',
  'settings.off': 'NO',
  'settings.credits': 'CRÉDITOS CC0',
  'settings.qa_ads': 'TELEMETRÍA ADS',
  'settings.reset': 'BORRAR PROGRESO',
  'settings.reset_confirm': '¿SEGURO QUE QUIERES BORRAR TODO?',
  'settings.reset_done': 'PROGRESO REINICIADO',

  'credits.title': 'CRÉDITOS Y LICENCIAS',
  'credits.body':
    'ARTE Y AUDIO CC0 1.0:\nNINJA ADVENTURE PACK (PIXEL-BOY & AAA)\nTINY DUNGEON (KENNEY)\n\nCÓDIGO BASE ANGULAR MIT:\nIAGO DAHLEM (KNIFE-HIT)\nMOTOR: PHASER 3 + CAPACITOR',

  'qa.title': 'QA MONETIZACIÓN',
  'qa.close': 'CERRAR',
  'qa.stats':
    'UMP: {ump} · NPA: {npa}\nBANNER: {banner} · LAUNCHES: {launches}\nGO SESSION: {go} · INT: {int} · REW: {rew} · OPEN: {open}',

  'skin.kunai.iron': 'ACERO NOCTURNO',
  'skin.kunai.jade': 'JADE SOMBRÍO',
  'skin.kunai.crimson': 'LUNA CARMESÍ',
  'skin.kunai.cobalt': 'ZAFÍRO GÉLIDO',
  'skin.kunai.amber': 'ÁMBAR SOLAR',
  'skin.kunai.violet': 'AMATISTA SHINOBI',
  'skin.kunai.gold': 'ORO SHOGUN',
  'skin.kunai.obsidian': 'OBSIDIANA NEÓN',

  'skin.target.log': 'TRONCO DEL DOJO',
  'skin.target.stone': 'SELLO DE PIEDRA',
  'skin.target.lantern': 'FAROL ANCESTRAL',
  'skin.target.oni': 'EMBLEMA ONI',

  'boss.bamboo.name': 'GUARDIÁN BAMBÚ',
  'boss.cyclops.name': 'CÍCLOPE DEL TEMPLO',
  'boss.samurai.name': 'SHOGUN SOMBRÍO'
} as const;

export type I18nKey = keyof typeof ES_DICT;

const EN_DICT: Record<I18nKey, string> = {
  'app.title': 'KUNAI RUSH',
  'app.subtitle': 'NOCTURNAL NINJA',
  'common.back': 'BACK',
  'common.close': 'CLOSE',
  'common.ok': 'OK',
  'common.cancel': 'CANCEL',
  'common.yes': 'YES',
  'common.no': 'NO',
  'common.loading': 'LOADING...',
  'common.coins': '{count}',

  'menu.play': 'PLAY',
  'menu.shop': 'SHOP',
  'menu.settings': 'SETTINGS',
  'menu.best_score': 'BEST: {score}',
  'menu.best_level': 'MAX LV: {level}',
  'menu.daily_ready': 'DAILY STREAK!',
  'menu.tap_hint': 'TAP TO THROW',

  'game.level': 'LEVEL {level}',
  'game.score': '{score}',
  'game.combo': 'COMBO x{combo}!',
  'game.boss_badge': 'BOSS {phase}/3',
  'game.boss_incoming': 'NIGHT BOSS!',
  'game.phase_clear': 'PHASE {phase} BROKEN!',
  'game.level_clear': 'LEVEL CLEAR!',
  'game.boss_clear': 'BOSS DEFEATED! +{coins}',
  'game.paused': 'PAUSED',
  'game.resume': 'RESUME',
  'game.quit': 'MENU',

  'revive.title': 'REVIVE?',
  'revive.subtitle': 'SECOND CHANCE AT LEVEL {level}',
  'revive.watch_ad': 'WATCH AD',
  'revive.skip': 'NO, THANKS',

  'gameover.title': 'GAME OVER',
  'gameover.new_record': 'NEW RECORD!',
  'gameover.score': 'SCORE: {score}',
  'gameover.best': 'BEST: {best}',
  'gameover.level': 'LEVEL {level}',
  'gameover.run_coins': '+{coins} COINS',
  'gameover.double_coins': 'x2 COINS (AD)',
  'gameover.doubled': 'DOUBLED! +{coins}',
  'gameover.retry': 'RETRY',
  'gameover.menu': 'MENU',

  'streak.title': 'DAILY STREAK',
  'streak.subtitle': 'DAY {day} · +{coins} COINS',
  'streak.day': 'DAY {day}',
  'streak.claim': 'CLAIM +{coins}',

  'shop.title': 'DOJO SHOP',
  'shop.tab_kunais': 'KUNAIS',
  'shop.tab_targets': 'TARGETS',
  'shop.equip': 'EQUIP',
  'shop.equipped': 'EQUIPPED',
  'shop.buy': 'BUY {price}',
  'shop.no_coins': 'LOW COINS',
  'shop.free_coins': '+25 FREE COINS',
  'shop.free_cooldown': 'WAIT {sec}S',
  'shop.free_claimed': '+25 COINS!',

  'settings.title': 'SETTINGS',
  'settings.sound': 'SOUND',
  'settings.haptics': 'HAPTICS',
  'settings.language': 'LANGUAGE',
  'settings.lang_name': 'ENGLISH',
  'settings.on': 'ON',
  'settings.off': 'OFF',
  'settings.credits': 'CC0 CREDITS',
  'settings.qa_ads': 'ADS TELEMETRY',
  'settings.reset': 'RESET SAVE',
  'settings.reset_confirm': 'ERASE ALL PROGRESS?',
  'settings.reset_done': 'PROGRESS CLEARED',

  'credits.title': 'CREDITS & LICENSES',
  'credits.body':
    'CC0 1.0 ART & AUDIO:\nNINJA ADVENTURE PACK (PIXEL-BOY & AAA)\nTINY DUNGEON (KENNEY)\n\nANGULAR MATH MIT:\nIAGO DAHLEM (KNIFE-HIT)\nENGINE: PHASER 3 + CAPACITOR',

  'qa.title': 'ADS QA TELEMETRY',
  'qa.close': 'CLOSE',
  'qa.stats':
    'UMP: {ump} · NPA: {npa}\nBANNER: {banner} · LAUNCHES: {launches}\nGO SESSION: {go} · INT: {int} · REW: {rew} · OPEN: {open}',

  'skin.kunai.iron': 'NIGHT STEEL',
  'skin.kunai.jade': 'SHADOW JADE',
  'skin.kunai.crimson': 'BLOOD MOON',
  'skin.kunai.cobalt': 'FROST SAPPHIRE',
  'skin.kunai.amber': 'SOLAR AMBER',
  'skin.kunai.violet': 'SHINOBI AMETHYST',
  'skin.kunai.gold': 'SHOGUN GOLD',
  'skin.kunai.obsidian': 'NEON OBSIDIAN',

  'skin.target.log': 'DOJO LOG',
  'skin.target.stone': 'STONE SEAL',
  'skin.target.lantern': 'ANCESTRAL LANTERN',
  'skin.target.oni': 'ONI CREST',

  'boss.bamboo.name': 'BAMBOO GUARDIAN',
  'boss.cyclops.name': 'TEMPLE CYCLOPS',
  'boss.samurai.name': 'SHADOW SHOGUN'
};

class I18nService {
  private locale: Locale = 'es';

  public setLocale(locale: Locale): void {
    this.locale = locale;
  }

  public getLocale(): Locale {
    return this.locale;
  }

  public t(key: I18nKey, params?: TranslationParams): string {
    const dict = this.locale === 'es' ? ES_DICT : EN_DICT;
    let value: string = dict[key] ?? ES_DICT[key] ?? key;
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.replaceAll(`{${paramKey}}`, String(paramValue));
      }
    }
    return value;
  }
}

export const i18n = new I18nService();
