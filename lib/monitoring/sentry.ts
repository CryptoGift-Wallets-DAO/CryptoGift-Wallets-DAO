/**
 * Centralized Sentry configuration and utilities
 * Single source of truth for error monitoring setup
 */

import * as Sentry from '@sentry/nextjs';

// Shared configuration for all environments
const sharedConfig: Partial<Sentry.NodeOptions | Sentry.BrowserOptions> = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DAO_DSN,
  environment: process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  debug: process.env.NODE_ENV === 'development',
  
  // Sampling configuration
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out development noise
    if (process.env.NODE_ENV === 'development') {
      // Skip webpack HMR errors
      if (event.exception?.values?.[0]?.value?.includes('ChunkLoadError')) {
        return null;
      }
      // Skip CORS errors in development
      if (event.exception?.values?.[0]?.value?.includes('CORS')) {
        return null;
      }
    }
    
    // Add context for production errors
    if (event.exception) {
      event.tags = {
        ...event.tags,
        component: 'cryptogift-dao',
        deployment: process.env.VERCEL_ENV || 'local',
      };
    }
    
    return event;
  },
  
  // Transaction filtering
  beforeSendTransaction(event) {
    // Skip health check transactions
    if (event.transaction === 'GET /api/health') {
      return null;
    }
    return event;
  },
};

// Client-specific configuration
const clientConfig: Partial<Sentry.BrowserOptions> = {
  ...sharedConfig,
  
  // Replay settings for user sessions
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.5,
  
  integrations: [
    Sentry.replayIntegration({
      maskAllText: process.env.NODE_ENV === 'production',
      blockAllMedia: true,
      maskAllInputs: true,
    }),
    Sentry.browserTracingIntegration({
      // Exclude transactions for static assets
      shouldCreateSpanForRequest: (url) => {
        return !url.includes('/static/') && !url.includes('/_next/');
      },
    }),
  ],
};

// Server-specific configuration
const serverConfig: Partial<Sentry.NodeOptions> = {
  ...sharedConfig,
  
  // Server performance monitoring
  integrations: [
    Sentry.httpIntegration({ breadcrumbs: true }),
    Sentry.nodeContextIntegration(),
    Sentry.localVariablesIntegration({ captureAllExceptions: false }),
  ],
  
  // Enhanced error context
  initialScope: {
    tags: {
      runtime: 'nodejs',
    },
  },
};

// Initialize Sentry based on runtime
export function initializeSentry() {
  if (typeof window === 'undefined') {
    // Server-side initialization
    Sentry.init(serverConfig);
    console.log('[Sentry] Server initialized');
  } else {
    // Client-side initialization
    Sentry.init(clientConfig);
    console.log('[Sentry] Client initialized');
  }
}

// Utility functions for error reporting
export const sentryUtils = {
  // Capture error with context
  captureError: (error: Error, context?: Record<string, any>) => {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }
      Sentry.captureException(error);
    });
  },
  
  // Capture message with level
  captureMessage: (message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) => {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }
      Sentry.captureMessage(message, level);
    });
  },
  
  // Set user context
  setUser: (user: Sentry.User) => {
    Sentry.setUser(user);
  },
  
  // Add breadcrumb
  addBreadcrumb: (breadcrumb: Sentry.Breadcrumb) => {
    Sentry.addBreadcrumb(breadcrumb);
  },
  
  // Create span for performance monitoring (v10+ API)
  startSpan: (options: any, callback?: any) => {
    return Sentry.startSpan(options, callback);
  },
};

// Performance monitoring helpers
export const performance = {
  // Measure function execution time
  measureAsync: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    return await Sentry.startSpan({ name, op: 'function' }, async () => {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        sentryUtils.captureError(error as Error, { function: name });
        throw error;
      }
    });
  },
  
  // Measure synchronous function execution
  measure: <T>(name: string, fn: () => T): T => {
    return Sentry.startSpan({ name, op: 'function' }, () => {
      try {
        const result = fn();
        return result;
      } catch (error) {
        sentryUtils.captureError(error as Error, { function: name });
        throw error;
      }
    });
  },
};

// Export default initialization for immediate use
export default initializeSentry;