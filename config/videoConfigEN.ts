/**
 * VIDEO CONFIGURATION - Centralized video management (ENGLISH VERSION)
 * This file makes it extremely easy to replace videos by just changing the IDs
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

export interface VideoConfig {
  lessonId: string;        // Unique ID for localStorage persistence
  muxPlaybackId: string;   // Mux Playback ID
  title: string;
  description?: string;
  poster?: string;         // Optional poster image
  captionsVtt?: string;    // Optional captions file
}

/**
 * CENTRALIZED VIDEO CONFIGURATION - ENGLISH VERSION
 * To replace any video, just update the muxPlaybackId here
 * The lessonId should be changed when you want to force all users to see the new video
 */
export const VIDEO_CONFIG: Record<string, VideoConfig> = {
  // Sales Masterclass intro video (English)
  salesMasterclass: {
    lessonId: "sales-masterclass-en-v4",
    muxPlaybackId: "3lWAgyukmAHnff02tpTAzYD00DeftIi005YWLmk5AYFs00Y",
    title: "CryptoGift Project",
    description: "Learn about our vision. Starts with a brief video with audio, get comfortable to enjoy it\n\nEstimated time: 10 minutes",
  },

  // Presentation CGC - Final video after EIP-712 and before claim (English)
  presentationCGC: {
    lessonId: "presentation-cgc-en-v1",
    muxPlaybackId: "dsEZYVMpcrkuNvn0200p8C7nz9qEqY3dr7Mx9OiauZSro",
    title: "CryptoGift Club Presentation",
    description: "Discover the exclusive opportunities awaiting you as a CryptoGift Club member",
  },

  // Example for future lessons
  walletBasics: {
    lessonId: "wallet-basics-v1",
    muxPlaybackId: "YOUR_MUX_PLAYBACK_ID_HERE",
    title: "Crypto Wallet Fundamentals",
    description: "Learn the basic concepts of digital wallets",
  },

  gasOptimization: {
    lessonId: "gas-optimization-v1",
    muxPlaybackId: "YOUR_MUX_PLAYBACK_ID_HERE",
    title: "Gas Optimization",
    description: "Strategies to minimize transaction costs",
  },

  nftIntro: {
    lessonId: "nft-intro-v1",
    muxPlaybackId: "YOUR_MUX_PLAYBACK_ID_HERE",
    title: "Introduction to NFTs",
    description: "Everything you need to know about NFTs",
  },

  defiBasics: {
    lessonId: "defi-basics-v1",
    muxPlaybackId: "YOUR_MUX_PLAYBACK_ID_HERE",
    title: "DeFi for Beginners",
    description: "Discover the power of decentralized finance",
  }
};

/**
 * Helper function to get video config
 * @param key - The key from VIDEO_CONFIG object
 * @returns VideoConfig object or undefined if not found
 */
export function getVideoConfig(key: keyof typeof VIDEO_CONFIG): VideoConfig | undefined {
  return VIDEO_CONFIG[key];
}

/**
 * Helper function to update video version (forces re-watch)
 * @param key - The key from VIDEO_CONFIG object
 * @param version - New version number or string
 */
export function updateVideoVersion(key: keyof typeof VIDEO_CONFIG, version: string | number) {
  const config = VIDEO_CONFIG[key];
  if (config) {
    // Extract base lesson ID without version
    const baseId = config.lessonId.replace(/-v\d+$/, '');
    config.lessonId = `${baseId}-v${version}`;
  }
  return config;
}

/**
 * HOW TO REPLACE A VIDEO:
 *
 * 1. Upload new video to Mux
 * 2. Get the new Playback ID from Mux dashboard
 * 3. Update the muxPlaybackId in VIDEO_CONFIG above
 * 4. If you want to force all users to watch the new video, change the lessonId version:
 *    - Example: "sales-masterclass-en-v1" → "sales-masterclass-en-v2"
 * 5. Deploy changes
 *
 * That's it! The video will be automatically updated everywhere it's used.
 */

export default VIDEO_CONFIG;
