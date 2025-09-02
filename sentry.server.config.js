// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { init } = require("@sentry/nextjs");

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://d3d2aead23fdd7b41f211da09a7e3456@o4509896599863296.ingest.us.sentry.io/4509924283121664",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: process.env.NODE_ENV === 'development',
});