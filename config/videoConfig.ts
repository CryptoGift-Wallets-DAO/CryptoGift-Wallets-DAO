/**
 * VIDEO CONFIG
 *
 * Configuration for video components in the SalesMasterclass flow.
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

export const VIDEO_CONFIG = {
  // Intro video URL (shown before SalesMasterclass)
  INTRO_VIDEO_URL: null as string | null, // Set to null to skip intro video

  // Outro video URL (shown after SalesMasterclass completion)
  OUTRO_VIDEO_URL: null as string | null, // Set to null to skip outro video

  // Skip settings
  ALLOW_SKIP_INTRO: true,
  SKIP_INTRO_AFTER_SECONDS: 5,

  ALLOW_SKIP_OUTRO: true,
  SKIP_OUTRO_AFTER_SECONDS: 3,

  // Video player settings
  AUTOPLAY: true,
  MUTED_BY_DEFAULT: false,
  LOOP: false,

  // Placeholder text when no video is configured
  INTRO_TITLE: 'Bienvenido a CryptoGift DAO',
  INTRO_SUBTITLE: 'Prepara para una experiencia educativa revolucionaria',

  OUTRO_TITLE: 'Felicidades!',
  OUTRO_SUBTITLE: 'Has completado el Masterclass',
};

export default VIDEO_CONFIG;
