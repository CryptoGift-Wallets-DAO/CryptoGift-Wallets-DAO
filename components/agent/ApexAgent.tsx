/**
 * 🤖 APEX AGENT - Floating Chat Widget
 * Elegant floating button with expandable chat panel
 * Persists conversation between widget and full page
 * 🌐 i18n: Full translation support for EN/ES
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import {
  MessageCircle,
  Send,
  X,
  Maximize2,
  Loader2,
  ChevronUp,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useAccount } from '@/lib/thirdweb';
import { useCGCBalance } from '@/lib/web3/hooks';
import { useAgent } from '@/lib/agent/useAgent';
import { cn } from '@/lib/utils';

// ===================================================
// 🎨 TYPES
// ===================================================

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

// ===================================================
// 🎯 MAIN COMPONENT
// ===================================================

export function ApexAgent() {
  const t = useTranslations('agent.bubble');
  const router = useRouter();
  const pathname = usePathname();

  // Don't render on the agent page itself
  if (pathname === '/agent') {
    return null;
  }

  return <ApexAgentInner />;
}

function ApexAgentInner() {
  const t = useTranslations('agent.bubble');
  const router = useRouter();

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showTooltip, setShowTooltip] = useState(true);

  // Refs
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // CGC access control
  const { address, isConnected } = useAccount();
  const { balance } = useCGCBalance(address as `0x${string}` | undefined);
  const cgcBalance = parseFloat(balance || '0');
  const hasAccess = isConnected && cgcBalance >= 0.01;

  // Agent hook with persistent session
  const {
    messages,
    isLoading,
    isConnected: agentConnected,
    sendMessage,
    clearMessages,
  } = useAgent({
    sessionId: 'apex-floating-widget',
    mode: 'general',
    stream: true,
  });

  // Hide tooltip after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Show tooltip on hover
  const handleMouseEnter = () => setShowTooltip(true);
  const handleMouseLeave = () => {
    if (!isOpen) {
      setTimeout(() => setShowTooltip(false), 2000);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        // Don't close if clicking the bubble button
        const target = event.target as HTMLElement;
        if (target.closest('[data-apex-bubble]')) return;
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle send message
  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading || !hasAccess) return;

    sendMessage(input.trim());
    setInput('');
  }, [input, isLoading, hasAccess, sendMessage]);

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Navigate to full chat
  const handleOpenFullChat = () => {
    setIsOpen(false);
    router.push('/agent');
  };

  // Toggle chat panel
  const handleToggle = () => {
    if (!hasAccess) {
      router.push('/agent');
      return;
    }
    setIsOpen(!isOpen);
    setShowTooltip(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" style={{ zIndex: 9999 }}>
      {/* Chat Panel - Expands upward */}
      {isOpen && hasAccess && (
        <div
          ref={chatRef}
          className="absolute bottom-20 right-0 w-80 sm:w-96 glass-panel border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
          style={{ maxHeight: '500px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200/50 dark:border-slate-700/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full overflow-hidden border border-purple-500/30">
                <Image
                  src="/apeX-avatar.png"
                  alt="apeX"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">apeX</span>
                <div className="flex items-center space-x-1">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    agentConnected ? 'bg-green-500' : 'bg-yellow-500'
                  )} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {agentConnected ? t('online') : t('connecting')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {/* Clear chat */}
              <button
                onClick={clearMessages}
                className="p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-slate-700/50 text-gray-500 dark:text-gray-400 transition-colors"
                title={t('clearChat')}
              >
                <Trash2 className="h-4 w-4" />
              </button>

              {/* Open full chat */}
              <button
                onClick={handleOpenFullChat}
                className="p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-slate-700/50 text-gray-500 dark:text-gray-400 transition-colors"
                title={t('openFullChat')}
              >
                <Maximize2 className="h-4 w-4" />
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-slate-700/50 text-gray-500 dark:text-gray-400 transition-colors"
                title={t('minimize')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-3 space-y-3 bg-white/50 dark:bg-slate-900/50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-purple-500/20 mb-3">
                  <Image
                    src="/apeX-avatar.png"
                    alt="apeX"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('chatWithApex')}
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))
            )}

            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">apeX is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('typeMessage')}
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {/* More options link */}
            <button
              onClick={handleOpenFullChat}
              className="flex items-center justify-center w-full mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              {t('moreOptions')}
            </button>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && !isOpen && (
        <div className="absolute bottom-20 right-0 animate-in fade-in slide-in-from-right-2 duration-300">
          <div className="glass-panel px-4 py-2 rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50">
            <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
              {hasAccess ? t('needHelp') : `🔒 ${t('cgcRequired')}`}
            </span>
          </div>
          {/* Arrow pointing to bubble */}
          <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/80 dark:border-t-slate-800/80" />
        </div>
      )}

      {/* Floating Bubble Button */}
      <button
        data-apex-bubble
        onClick={handleToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'relative w-14 h-14 rounded-full overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 active:scale-105',
          isOpen && 'ring-2 ring-purple-500/50 ring-offset-2 ring-offset-transparent'
        )}
      >
        {/* apeX Avatar */}
        <Image
          src="/apeX22.PNG"
          alt="apeX Assistant"
          width={56}
          height={56}
          className="w-full h-full object-cover"
          priority
        />

        {/* Overlay when open or no access */}
        {(isOpen || !hasAccess) && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-white drop-shadow-lg" />
            ) : !hasAccess ? (
              <span className="text-white text-xs font-bold drop-shadow-lg">🔒</span>
            ) : null}
          </div>
        )}

        {/* Online indicator */}
        {hasAccess && !isOpen && (
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
        )}

        {/* Pulse effect when has messages */}
        {messages.length > 0 && !isOpen && (
          <div className="absolute inset-0 rounded-full border-2 border-purple-400/50 animate-ping" />
        )}
      </button>
    </div>
  );
}

// ===================================================
// 💬 MESSAGE BUBBLE
// ===================================================

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="text-center">
        <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] px-3 py-2 rounded-2xl text-sm',
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md'
            : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-md'
        )}
      >
        {message.content || (
          <span className="text-gray-400 dark:text-gray-500 italic">...</span>
        )}
      </div>
    </div>
  );
}

// ===================================================
// 🎣 HOOK EXPORT
// ===================================================

export function useApexAgent() {
  const [isVisible, setIsVisible] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);
  const toggle = () => setIsVisible(!isVisible);

  return {
    isVisible,
    isOnline,
    show,
    hide,
    toggle
  };
}
