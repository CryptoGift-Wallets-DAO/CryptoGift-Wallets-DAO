/**
 * 🤖 APEX AGENT - Floating Bubble with Orbital Menu
 * Glass morphism design with CSS animations
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  MessageCircle, 
  Settings, 
  HelpCircle, 
  Zap,
  Brain,
  X,
  Maximize2,
  Lock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useCGCBalance } from '@/lib/web3/hooks';

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
  
  // CGC access control
  const { address, isConnected } = useAccount();
  const { balance } = useCGCBalance(address);
  const cgcBalance = parseFloat(balance || '0');
  const hasAccess = isConnected && cgcBalance >= 0.01;

  // Orbital menu items positioned around the top-left of the bubble
  const menuItems: OrbitalMenuItem[] = [
    {
      id: 'chat',
      icon: <MessageCircle className="w-4 h-4" />,
      label: 'Chat with apeX',
      action: () => {
        setIsMenuOpen(false);
        // Check CGC access before navigation
        if (hasAccess) {
          router.push('/agent');
        } else {
          // Show access message and navigate to agent page (which will show access gate)
          router.push('/agent');
        }
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

  // Handle bubble click - Direct navigation to agent chat with CGC check
  const handleBubbleClick = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Navigate to agent page (CGC access gate will handle permissions)
    router.push('/agent');
    
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
        className={`w-16 h-16 cursor-pointer relative transition-all duration-300 hover:scale-110 active:scale-105 ${
          isMenuOpen ? 'scale-105 -rotate-1' : 'scale-100'
        }`}
        onClick={handleBubbleClick}
      >
        {/* apeX22.PNG Image - ocupando 100% del espacio disponible sin deformarse */}
        <div className="w-full h-full relative overflow-hidden rounded-full">
          <Image 
            src="/apeX22.PNG"
            alt="apeX Assistant"
            width={80}
            height={80}
            className="rounded-full object-cover w-full h-full"
          />
          
          {/* Overlay when menu is open or access is restricted */}
          {(isMenuOpen || !hasAccess) && (
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full flex items-center justify-center transition-opacity duration-300">
              {isMenuOpen ? (
                <X className="w-6 h-6 text-white drop-shadow-lg" />
              ) : !hasAccess ? (
                <Lock className="w-4 h-4 text-white drop-shadow-lg" />
              ) : null}
            </div>
          )}
        </div>

        {/* Pulse ring when active */}
        <div
          className={`absolute inset-0 rounded-full border-2 border-blue-400/30 transition-opacity duration-300 ${
            isMenuOpen ? 'animate-ping opacity-50' : 'opacity-0'
          }`}
        />
        
        {/* Glow effect */}
        <div
          className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
            isMenuOpen ? 'shadow-lg shadow-blue-400/50' : 'shadow-sm'
          }`}
        />
      </div>


      {/* Tooltip */}
      <div
        className="absolute -top-12 -left-8 glass-card px-3 py-1 text-sm text-glass whitespace-nowrap pointer-events-none transition-all duration-300 spring-in"
      >
        {hasAccess ? (
          <>Click me! I&apos;m apeX 🤖</>
        ) : (
          <>🔒 CGC tokens required</>
        )}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-glass" />
      </div>
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