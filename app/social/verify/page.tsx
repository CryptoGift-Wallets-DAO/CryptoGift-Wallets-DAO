/**
 * 🔐 Social Verification Flow Page
 *
 * All-in-one popup that handles:
 * 1. OAuth authorization (get permission to check follow status)
 * 2. Redirect to follow/join
 * 3. Verify and report back to parent
 *
 * Flow:
 * - Opens as popup from main page
 * - Does OAuth redirect to get token
 * - After OAuth, shows "Follow" button
 * - User follows on Twitter/Discord
 * - User clicks back
 * - Page verifies and closes
 */

'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Twitter, MessageSquare, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';

type Platform = 'twitter' | 'discord';
type Step = 'loading' | 'authorize' | 'follow' | 'verifying' | 'success' | 'error';

function VerifyContent() {
  const searchParams = useSearchParams();
  const platform = (searchParams.get('platform') as Platform) || 'twitter';
  const returnFromOAuth = searchParams.get('oauth') === 'complete';
  const oauthError = searchParams.get('error');
  const verified = searchParams.get('verified') === 'true';

  const [step, setStep] = useState<Step>('loading');
  const [error, setError] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);

  // Check if we already have authorization (returning from OAuth or follow)
  useEffect(() => {
    const checkAuthStatus = async () => {
      // If returning from OAuth with success
      if (returnFromOAuth && !oauthError) {
        setHasToken(true);
        setStep('follow');
        return;
      }

      // If returning from OAuth with error
      if (oauthError) {
        setError(oauthError);
        setStep('error');
        return;
      }

      // If already verified (returning from follow intent)
      if (verified) {
        setStep('success');
        // Auto-close after showing success
        setTimeout(() => {
          postResultAndClose(true);
        }, 1500);
        return;
      }

      // Check if we have a stored session/token
      try {
        const response = await fetch('/api/social/check-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform }),
        });

        const data = await response.json();

        if (data.hasAuth) {
          setHasToken(true);
          setStep('follow');
        } else {
          setStep('authorize');
        }
      } catch {
        // No auth, need to authorize
        setStep('authorize');
      }
    };

    checkAuthStatus();
  }, [platform, returnFromOAuth, oauthError, verified]);

  // Post result to parent window and close
  const postResultAndClose = useCallback((success: boolean, username?: string) => {
    if (window.opener) {
      window.opener.postMessage({
        type: 'SOCIAL_OAUTH_CALLBACK',
        success: true,
        platform,
        verified: success,
        username,
      }, '*');
    }

    // Close after a short delay
    setTimeout(() => {
      window.close();
    }, 500);
  }, [platform]);

  // Start OAuth flow
  const startOAuth = async () => {
    setStep('loading');

    try {
      const response = await fetch('/api/social/oauth-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          walletAddress: 'verify-flow',
          returnToVerify: true, // Flag to return to this page after OAuth
        }),
      });

      const data = await response.json();

      if (data.authUrl) {
        // Redirect in same window to OAuth
        window.location.href = data.authUrl;
      } else {
        setError('Failed to get authorization URL');
        setStep('error');
      }
    } catch (err) {
      setError('Failed to start authorization');
      setStep('error');
    }
  };

  // Go to follow/join page
  const goToFollow = () => {
    const followUrl = platform === 'twitter'
      ? 'https://twitter.com/intent/follow?screen_name=cryptogiftdao'
      : 'https://discord.gg/XzmKkrvhHc';

    // Navigate in same window
    window.location.href = followUrl;
  };

  // Verify follow status
  const verifyStatus = async () => {
    setStep('verifying');

    try {
      const response = await fetch('/api/social/verify-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });

      const data = await response.json();

      if (data.verified) {
        setStep('success');
        setTimeout(() => {
          postResultAndClose(true, data.username);
        }, 1500);
      } else {
        setError(data.error || `Please ${platform === 'twitter' ? 'follow @cryptogiftdao' : 'join our Discord'} first`);
        setStep('follow'); // Go back to follow step
      }
    } catch {
      setError('Verification failed. Please try again.');
      setStep('follow');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    postResultAndClose(false);
  };

  const isTwitter = platform === 'twitter';
  const Icon = isTwitter ? Twitter : MessageSquare;
  const gradientFrom = isTwitter ? 'from-sky-500' : 'from-indigo-500';
  const gradientTo = isTwitter ? 'to-blue-600' : 'to-purple-600';
  const platformName = isTwitter ? 'Twitter/X' : 'Discord';
  const actionText = isTwitter ? 'Seguir a @cryptogiftdao' : 'Unirse al servidor Discord';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center p-4`}>
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center mb-4`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Verificación de {platformName}
          </h1>
        </div>

        {/* Privacy Notice */}
        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
            🔒 Solo verificamos que sigas/te unas — no recopilamos datos personales
          </p>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {step === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 mx-auto text-gray-400 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
            </div>
          )}

          {step === 'authorize' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Primero, autoriza la verificación con tu cuenta de {platformName}
                </p>
              </div>

              <button
                onClick={startOAuth}
                className={`w-full py-4 px-6 bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white font-bold rounded-xl
                  hover:opacity-90 transition-all flex items-center justify-center gap-3`}
              >
                <Icon className="w-5 h-5" />
                Autorizar con {platformName}
              </button>

              <button
                onClick={handleCancel}
                className="w-full py-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
              >
                Cancelar
              </button>
            </div>
          )}

          {step === 'follow' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-green-600 dark:text-green-400 font-semibold mb-2">
                  ¡Autorización completada!
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Ahora {isTwitter ? 'sigue a @cryptogiftdao' : 'únete al servidor Discord'}
                </p>
              </div>

              {error && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-300 text-center">
                    ⚠️ {error}
                  </p>
                </div>
              )}

              <button
                onClick={goToFollow}
                className={`w-full py-4 px-6 bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white font-bold rounded-xl
                  hover:opacity-90 transition-all flex items-center justify-center gap-3`}
              >
                <Icon className="w-5 h-5" />
                {actionText}
              </button>

              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  Después de {isTwitter ? 'seguir' : 'unirte'}, usa el botón <strong>Atrás</strong> del navegador
                </p>
                <button
                  onClick={verifyStatus}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all"
                >
                  Ya {isTwitter ? 'seguí' : 'me uní'}, verificar
                </button>
              </div>
            </div>
          )}

          {step === 'verifying' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-semibold">
                Verificando...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Comprobando tu {isTwitter ? 'seguimiento' : 'membresía'}
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                ¡Verificado!
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Cerrando ventana...
              </p>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                Error
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error || 'Algo salió mal'}
              </p>
              <button
                onClick={() => setStep('authorize')}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
              >
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SocialVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
