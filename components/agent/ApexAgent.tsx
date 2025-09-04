/**
 * 🤖 APEX AGENT - Floating Bubble with Orbital Menu
 * Glass morphism design with CSS animations
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Settings, 
  HelpCircle, 
  Zap,
  Brain,
  X,
  Maximize2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrbitalMenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  action: () => void;
  position: { x: number; y: number };
}

export function ApexAgent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Orbital menu items positioned around the top-left of the bubble
  const menuItems: OrbitalMenuItem[] = [
    {
      id: 'chat',
      icon: <MessageCircle className="w-4 h-4" />,
      label: 'Chat with apeX',
      action: () => {
        setIsMenuOpen(false);
        // Open mini chat or navigate to full chat
        router.push('/agent');
      },
      position: { x: -45, y: -25 } // Top-left
    },
    {
      id: 'quick-help',
      icon: <HelpCircle className="w-4 h-4" />,
      label: 'Quick Help',
      action: () => {
        setIsMenuOpen(false);
        // Show quick help overlay
        console.log('Quick help activated');
      },
      position: { x: -65, y: 5 } // Left
    },
    {
      id: 'smart-actions',
      icon: <Zap className="w-4 h-4" />,
      label: 'Smart Actions',
      action: () => {
        setIsMenuOpen(false);
        // Show smart actions menu
        console.log('Smart actions activated');
      },
      position: { x: -45, y: 35 } // Bottom-left
    },
    {
      id: 'insights',
      icon: <Brain className="w-4 h-4" />,
      label: 'AI Insights',
      action: () => {
        setIsMenuOpen(false);
        // Show AI insights
        console.log('AI insights activated');
      },
      position: { x: -25, y: -45 } // Top
    }
  ];

  // Handle bubble click
  const handleBubbleClick = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsMenuOpen(!isMenuOpen);
    
    // Reset animation state
    setTimeout(() => setIsAnimating(false), 400);
  };

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bubbleRef.current && !bubbleRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div 
      ref={bubbleRef}
      className="fixed bottom-6 right-6 z-50"
      style={{ zIndex: 9999 }}
    >
      {/* Main apeX Bubble */}
      <div
        className={`glass-bubble w-16 h-16 flex items-center justify-center cursor-pointer float relative transition-all duration-300 hover:scale-110 active:scale-105 ${
          isMenuOpen ? 'scale-105 -rotate-1' : 'scale-100'
        }`}
        onClick={handleBubbleClick}
      >
        {/* apeX Icon/Avatar */}
        <div
          className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm transition-transform duration-400 ${
            isMenuOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          {isMenuOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <span>aX</span> // apeX abbreviated
          )}
        </div>

        {/* Pulse ring when active */}
        <div
          className={`absolute inset-0 rounded-full border-2 border-blue-400/30 transition-opacity duration-300 ${
            isMenuOpen ? 'animate-ping opacity-50' : 'opacity-0'
          }`}
        />
      </div>

      {/* Orbital Menu Items */}
      {isMenuOpen && (
        <>
          {menuItems.map((item, index) => (
            <div
              key={item.id}
              className="orbital-item absolute w-12 h-12 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-120 active:scale-95 orbital-appear"
              style={{
                left: `calc(50% + ${item.position.x}px - 24px)`,
                top: `calc(50% + ${item.position.y}px - 24px)`,
                animationDelay: `${index * 100}ms`
              }}
              onClick={item.action}
              title={item.label}
            >
              <div className="text-glass">
                {item.icon}
              </div>
            </div>
          ))}

          {/* Background overlay for better visibility */}
          <div
            className="absolute inset-0 -m-20 rounded-full transition-opacity duration-300"
            style={{
              background: 'radial-gradient(circle, rgba(0,0,0,0.1) 0%, transparent 70%)',
              backdropFilter: 'blur(2px)',
              opacity: 1
            }}
          />
        </>
      )}

      {/* Tooltip when menu is closed */}
      {!isMenuOpen && (
        <div
          className="absolute -top-12 -left-8 glass-card px-3 py-1 text-sm text-glass whitespace-nowrap pointer-events-none transition-all duration-300 spring-in"
        >
          Hi! I&apos;m apeX 👋
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-glass" />
        </div>
      )}
    </div>
  );
}

// Hook for managing apeX agent state globally
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