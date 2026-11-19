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
  'menu.spin_free': 'GRATIS',
  'menu.spin_label': 'RULETA',
  'menu.keys_hud': '{keys} LL · {gold} ORO',
  'menu.chest_ready': 'COFRE',

  'game.level': 'NIVEL {level}',
  'game.score': '{score}',
  'game.combo': '¡COMBO x{combo}!',
  'game.mult_active': 'x{mult} ACTIVO',
  'game.boss_badge': 'JEFE {phase}/3',
  'game.boss_incoming': '¡JEFE NOCTURNO!',
  'game.phase_clear': '¡FASE {phase} ROTA!',
  'game.level_clear': '¡NIVEL SUPERADO!',
  'game.boss_clear': '¡JEFE DERROTADO! +{coins}',
  'game.key_gain': '+{amount} LLAVE',
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
  'gameover.open_spin': 'GIRAR RULETA',

  'streak.title': 'RACHA DIARIA',
  'streak.subtitle': 'DÍA {day} · +{coins} MONEDAS',
  'streak.day': 'DÍA {day}',
  'streak.claim': 'RECLAMAR +{coins}',

  'shop.title': 'DOJO TIENDA',
  'shop.tab_ninjas': 'NINJAS',
  'shop.tab_kunais': 'KUNAIS',
  'shop.tab_backgrounds': 'FONDOS',
  'shop.equip': 'EQUIPAR',
  'shop.equipped': 'EQUIPADO',
  'shop.buy': 'COMPRAR {price}',
  'shop.no_coins': 'FALTA MONEDAS',
  'shop.unlock_streak': 'LOGRO: RACHA {days} DÍAS',
  'shop.unlock_level': 'LOGRO: NIVEL {level}',
  'shop.unlock_score': 'LOGRO: {score} PUNTOS',
  'shop.free_coins': '+25 MONEDAS GRATIS',
  'shop.free_cooldown': 'ESPERA {sec}S',
  'shop.free_claimed': '¡+25 MONEDAS!',
  'shop.redeem_keys': 'CANJEAR {need} LLAVES ({have})',

  'tier.1': 'COMÚN',
  'tier.2': 'RARA',
  'tier.3': 'ÉPICA',
  'tier.4': 'LEGENDARIA',

  'spin.title': 'RULETA SHINOBI',
  'spin.subtitle': '¡GIRA PARA PREMIOS DEL DOJO!',
  'spin.free_ready': 'GIRO GRATIS DISPONIBLE',
  'spin.watch_ad': 'VER ANUNCIO PARA GIRAR ({left}/3)',
  'spin.limit_reached': 'LÍMITE DIARIO DE ANUNCIOS',
  'spin.next_free': 'PRÓXIMO GRATIS: {time}',
  'spin.spinning': 'GIRANDO...',
  'spin.close_no_spin': 'CERRAR',
  'spin.win_mult': '¡PREMIO: x{mult} PRÓX. PARTIDA!',
  'spin.win_coins': '¡PREMIO: +{coins} MONEDAS!',
  'spin.win_chest': '¡GANASTE UN COFRE!',
  'spin.jackpot': '¡¡JACKPOT x{mult}!!',
  'spin.ad_cancelled': 'ANUNCIO CANCELADO · NO GIRÓ',

  'chest.title': 'COFRES Y LLAVES',
  'chest.pending_count': 'COFRES PENDIENTES: {count}',
  'chest.none_pending': 'SIN COFRES PENDIENTES',
  'chest.keys_status': 'LLAVES: {whole} (+{pct}%) · ORO: {gold}',
  'chest.open_free_no_ad': 'ABRIR COFRE GRATIS',
  'chest.open_with_ad': 'VER ANUNCIO PARA ABRIR',
  'chest.opened_reward': '¡+1 LLAVE Y +{gold} ORO!',
  'chest.redeem_btn': 'CANJEAR 3 LLAVES → SKIN',
  'chest.skin_unlocked': '¡SKIN DESBLOQUEADA!',
  'chest.all_unlocked': '¡CATÁLOGO COMPLETO!',
  'chest.in_flight_warn': 'PARA RECLAMAR ESTA LLAVE (+{drop}), ABRÍ EL COFRE AHORA',
  'chest.exit_without_open': 'SALIR SIN ABRIR',
  'chest.confirm_lose_body':
    '¿SEGURO QUE QUERÉS SALIR? PERDERÁS LA LLAVE RECIÉN GANADA SI NO ABRÍS EL COFRE AHORA.',
  'chest.stay_open': 'ABRIR COFRE',
  'chest.leave_lose': 'SALIR Y PERDER',

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
    'UMP: {ump} · NPA: {npa}\nBANNER: {banner} · LAUNCHES: {launches}\nGO: {go} · INT: {int} · REW: {rew} · OPEN: {open}\nSPINS AD: {adSpins}/3 · COFRES: {chests} · LLAVES: {keys}',

  'skin.ninja.shadow': 'SOMBRA CLÁSICA',
  'skin.ninja.azure': 'SHINOBI AZUR',
  'skin.ninja.forest': 'EXPLORADOR VERDE',
  'skin.ninja.crimson': 'LUNA ROJA',
  'skin.ninja.amber': 'TIGRE ÁMBAR',
  'skin.ninja.amethyst': 'MÍSTICO VIOLETA',
  'skin.ninja.shogun': 'SHOGUN DORADO',
  'skin.ninja.void': 'ESPECTRO DEL VACÍO',

  'skin.kunai.iron': 'ACERO NOCTURNO',
  'skin.kunai.jade': 'JADE SOMBRÍO',
  'skin.kunai.crimson': 'LUNA CARMESÍ',
  'skin.kunai.cobalt': 'ZAFÍRO GÉLIDO',
  'skin.kunai.bamboo': 'FILO BAMBÚ',
  'skin.kunai.amber': 'ÁMBAR SOLAR',
  'skin.kunai.violet': 'AMATISTA SHINOBI',
  'skin.kunai.gold': 'ORO SHOGUN',
  'skin.kunai.obsidian': 'OBSIDIANA NEÓN',
  'skin.kunai.celestial': 'ESTELA CELESTIAL',

  'skin.bg.dojo': 'DOJO NOCTURNO',
  'skin.bg.bamboo': 'BOSQUE DE BAMBÚ',
  'skin.bg.village': 'ALDEA ANTIGUA',
  'skin.bg.temple': 'TEMPLO DE ARENA',
  'skin.bg.shrine': 'SANTUARIO CARMESÍ',
  'skin.bg.fortress': 'FORTALEZA OSCURA',
  'skin.bg.moonlit': 'PATIO LUNAR',
  'skin.bg.abyss': 'ABISMO SHINOBI',

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
  'menu.spin_free': 'FREE',
  'menu.spin_label': 'WHEEL',
  'menu.keys_hud': '{keys} KEY · {gold} GOLD',
  'menu.chest_ready': 'CHEST',

  'game.level': 'LEVEL {level}',
  'game.score': '{score}',
  'game.combo': 'COMBO x{combo}!',
  'game.mult_active': 'x{mult} ACTIVE',
  'game.boss_badge': 'BOSS {phase}/3',
  'game.boss_incoming': 'NIGHT BOSS!',
  'game.phase_clear': 'PHASE {phase} BROKEN!',
  'game.level_clear': 'LEVEL CLEAR!',
  'game.boss_clear': 'BOSS DEFEATED! +{coins}',
  'game.key_gain': '+{amount} KEY',
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
  'gameover.open_spin': 'LUCKY SPIN',

  'streak.title': 'DAILY STREAK',
  'streak.subtitle': 'DAY {day} · +{coins} COINS',
  'streak.day': 'DAY {day}',
  'streak.claim': 'CLAIM +{coins}',

  'shop.title': 'DOJO SHOP',
  'shop.tab_ninjas': 'NINJAS',
  'shop.tab_kunais': 'KUNAIS',
  'shop.tab_backgrounds': 'SCENES',
  'shop.equip': 'EQUIP',
  'shop.equipped': 'EQUIPPED',
  'shop.buy': 'BUY {price}',
  'shop.no_coins': 'LOW COINS',
  'shop.unlock_streak': 'STREAK {days} DAYS',
  'shop.unlock_level': 'REACH LEVEL {level}',
  'shop.unlock_score': 'SCORE {score} PTS',
  'shop.free_coins': '+25 FREE COINS',
  'shop.free_cooldown': 'WAIT {sec}S',
  'shop.free_claimed': '+25 COINS!',
  'shop.redeem_keys': 'REDEEM {need} KEYS ({have})',

  'tier.1': 'COMMON',
  'tier.2': 'RARE',
  'tier.3': 'EPIC',
  'tier.4': 'LEGENDARY',

  'spin.title': 'LUCKY SPIN',
  'spin.subtitle': 'SPIN FOR DOJO REWARDS!',
  'spin.free_ready': 'FREE SPIN AVAILABLE',
  'spin.watch_ad': 'WATCH AD TO SPIN ({left}/3)',
  'spin.limit_reached': 'DAILY AD LIMIT REACHED',
  'spin.next_free': 'NEXT FREE: {time}',
  'spin.spinning': 'SPINNING...',
  'spin.close_no_spin': 'CLOSE',
  'spin.win_mult': 'WON: x{mult} NEXT RUN!',
  'spin.win_coins': 'WON: +{coins} COINS!',
  'spin.win_chest': 'WON A CHEST!',
  'spin.jackpot': 'JACKPOT x{mult}!!',
  'spin.ad_cancelled': 'AD CLOSED · NO SPIN',

  'chest.title': 'CHESTS & KEYS',
  'chest.pending_count': 'PENDING CHESTS: {count}',
  'chest.none_pending': 'NO PENDING CHESTS',
  'chest.keys_status': 'KEYS: {whole} (+{pct}%) · GOLD: {gold}',
  'chest.open_free_no_ad': 'OPEN CHEST FREE',
  'chest.open_with_ad': 'WATCH AD TO OPEN',
  'chest.opened_reward': '+1 KEY & +{gold} GOLD!',
  'chest.redeem_btn': 'REDEEM 3 KEYS → SKIN',
  'chest.skin_unlocked': 'SKIN UNLOCKED!',
  'chest.all_unlocked': 'ALL SKINS OWNED!',
  'chest.in_flight_warn': 'TO CLAIM THIS KEY (+{drop}), OPEN THE CHEST NOW',
  'chest.exit_without_open': 'EXIT WITHOUT OPENING',
  'chest.confirm_lose_body':
    'ARE YOU SURE? YOU WILL LOSE THE JUST-EARNED KEY IF YOU DO NOT OPEN THE CHEST NOW.',
  'chest.stay_open': 'OPEN CHEST',
  'chest.leave_lose': 'LEAVE & LOSE',

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
    'UMP: {ump} · NPA: {npa}\nBANNER: {banner} · LAUNCHES: {launches}\nGO: {go} · INT: {int} · REW: {rew} · OPEN: {open}\nAD SPINS: {adSpins}/3 · CHESTS: {chests} · KEYS: {keys}',

  'skin.ninja.shadow': 'CLASSIC SHADOW',
  'skin.ninja.azure': 'AZURE SHINOBI',
  'skin.ninja.forest': 'FOREST SCOUT',
  'skin.ninja.crimson': 'CRIMSON MOON',
  'skin.ninja.amber': 'AMBER TIGER',
  'skin.ninja.amethyst': 'VIOLET MYSTIC',
  'skin.ninja.shogun': 'GOLDEN SHOGUN',
  'skin.ninja.void': 'VOID SPECTER',

  'skin.kunai.iron': 'NIGHT STEEL',
  'skin.kunai.jade': 'SHADOW JADE',
  'skin.kunai.crimson': 'BLOOD MOON',
  'skin.kunai.cobalt': 'FROST SAPPHIRE',
  'skin.kunai.bamboo': 'BAMBOO EDGE',
  'skin.kunai.amber': 'SOLAR AMBER',
  'skin.kunai.violet': 'SHINOBI AMETHYST',
  'skin.kunai.gold': 'SHOGUN GOLD',
  'skin.kunai.obsidian': 'NEON OBSIDIAN',
  'skin.kunai.celestial': 'CELESTIAL STAR',

  'skin.bg.dojo': 'NIGHT DOJO',
  'skin.bg.bamboo': 'BAMBOO GROVE',
  'skin.bg.village': 'ANCIENT VILLAGE',
  'skin.bg.temple': 'SANDSTONE TEMPLE',
  'skin.bg.shrine': 'CRIMSON SHRINE',
  'skin.bg.fortress': 'DARK FORTRESS',
  'skin.bg.moonlit': 'MOONLIT COURTYARD',
  'skin.bg.abyss': 'SHINOBI ABYSS',

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
