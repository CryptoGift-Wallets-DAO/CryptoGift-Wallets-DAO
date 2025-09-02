/**
 * 🎣 AGENT HOOK
 * React hook for interacting with the CG DAO Agent
 * Handles SSE streaming, session management, and error handling
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import type { 
  AgentRequest, 
  AgentResponse, 
  AgentStreamChunk, 
  ChatMessage, 
  ChatSession,
  AgentModeId,
  AgentError 
} from './types';

// ===================================================
// 🎣 HOOK INTERFACE
// ===================================================

export interface UseAgentOptions {
  sessionId?: string;
  userId?: string;
  mode?: AgentModeId;
  stream?: boolean;
  onMessage?: (message: ChatMessage) => void;
  onError?: (error: AgentError) => void;
  onMetrics?: (metrics: any) => void;
}

export interface UseAgentReturn {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  session: ChatSession | null;
  error: AgentError | null;
  
  // Actions  
  sendMessage: (message: string, options?: { mode?: AgentModeId }) => Promise<void>;
  clearMessages: () => void;
  changeMode: (mode: AgentModeId) => void;
  retry: () => void;
  
  // Session management
  sessionId: string;
  loadSession: (sessionId: string) => Promise<void>;
  
  // Utils
  exportSession: () => string;
  getMetrics: () => Promise<any>;
}

// ===================================================
// 🎣 MAIN HOOK
// ===================================================

export function useAgent(options: UseAgentOptions = {}): UseAgentReturn {
  const {
    sessionId: initialSessionId,
    userId,
    mode = 'general',
    stream = true,
    onMessage,
    onError,
    onMetrics
  } = options;

  // State
  const [sessionId] = useState(() => initialSessionId || nanoid());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [error, setError] = useState<AgentError | null>(null);
  const [currentMode, setCurrentMode] = useState<AgentModeId>(mode);

  // Refs
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastMessageRef = useRef<string>('');

  // ===================================================
  // 🔄 SESSION MANAGEMENT
  // ===================================================

  const initializeSession = useCallback(async () => {
    try {
      const newSession: ChatSession = {
        id: sessionId,
        userId,
        mode: currentMode,
        messages: [],
        created: Date.now(),
        lastAccessed: Date.now(),
      };
      
      setSession(newSession);
      setError(null);
    } catch (err) {
      setError({
        code: 'SESSION_ERROR',
        message: 'Failed to initialize session',
        timestamp: Date.now(),
        details: err
      });
    }
  }, [sessionId, userId, currentMode]);

  const loadSession = useCallback(async (sessionId: string) => {
    try {
      // In a real implementation, this would load from the server
      console.log('Loading session:', sessionId);
    } catch (err) {
      setError({
        code: 'LOAD_ERROR', 
        message: 'Failed to load session',
        timestamp: Date.now(),
        details: err
      });
    }
  }, []);

  // ===================================================
  // 💬 MESSAGE HANDLING
  // ===================================================

  const addMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    const fullMessage: ChatMessage = {
      ...message,
      id: nanoid(),
    };
    
    setMessages(prev => [...prev, fullMessage]);
    
    if (onMessage) {
      onMessage(fullMessage);
    }
    
    return fullMessage;
  }, [onMessage]);

  const updateLastMessage = useCallback((updates: Partial<ChatMessage>) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const lastIndex = newMessages.length - 1;
      if (lastIndex >= 0 && newMessages[lastIndex]) {
        newMessages[lastIndex] = { 
          ...newMessages[lastIndex], 
          ...updates,
        } as ChatMessage;
      }
      return newMessages;
    });
  }, []);

  // ===================================================
  // 🔄 STREAMING LOGIC
  // ===================================================

  const handleStreamResponse = useCallback(async (request: AgentRequest) => {
    return new Promise<void>((resolve, reject) => {
      // Use fetch for non-streaming or EventSource for streaming
      if (!stream) {
        fetch('/api/agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...request, stream: false }),
        })
        .then(res => res.json())
        .then((data: AgentResponse) => {
          addMessage({
            role: 'assistant',
            content: data.response,
            timestamp: Date.now(),
            metadata: {
              mode: currentMode as AgentModeId,
              reasoning_tokens: data.metrics.reasoning_tokens,
            }
          });
          
          if (onMetrics) {
            onMetrics(data.metrics);
          }
          
          resolve();
        })
        .catch(reject);
        
        return;
      }

      // Streaming with Server-Sent Events
      const eventSource = new EventSource('/api/agent?' + new URLSearchParams({
        message: request.message,
        sessionId: request.sessionId || sessionId,
        userId: request.userId || userId || '',
        mode: request.mode || currentMode,
        stream: 'true',
      }));

      eventSourceRef.current = eventSource;
      
      // Add placeholder assistant message
      addMessage({
        role: 'assistant', 
        content: '',
        timestamp: Date.now(),
        metadata: { mode: currentMode }
      });
      
      let fullContent = '';

      eventSource.onmessage = (event) => {
        try {
          const chunk: AgentStreamChunk = JSON.parse(event.data);
          
          switch (chunk.type) {
            case 'chunk':
              if (chunk.content) {
                fullContent += chunk.content;
                updateLastMessage({ content: fullContent });
              }
              break;
              
            case 'done':
              updateLastMessage({ 
                content: fullContent,
                metadata: {
                  mode: currentMode as AgentModeId,
                  reasoning_tokens: chunk.metrics?.reasoning_tokens || 0,
                }
              });
              
              if (onMetrics && chunk.metrics) {
                onMetrics(chunk.metrics);
              }
              
              eventSource.close();
              resolve();
              break;
              
            case 'error':
              updateLastMessage({ 
                content: chunk.error || 'An error occurred',
                metadata: { error: true }
              });
              
              const agentError: AgentError = {
                code: 'STREAM_ERROR',
                message: chunk.error || 'Streaming error',
                timestamp: Date.now()
              };
              
              setError(agentError);
              if (onError) onError(agentError);
              
              eventSource.close();
              reject(new Error(chunk.error || 'Unknown streaming error'));
              break;
          }
        } catch (err) {
          console.error('Failed to parse SSE event:', err);
        }
      };

      eventSource.onerror = (event) => {
        const agentError: AgentError = {
          code: 'CONNECTION_ERROR',
          message: 'Connection to agent failed',
          timestamp: Date.now(),
          details: event
        };
        
        setError(agentError);
        if (onError) onError(agentError);
        
        eventSource.close();
        reject(new Error('Connection failed'));
      };

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
      };
    });
  }, [stream, sessionId, userId, currentMode, addMessage, updateLastMessage, onMetrics, onError]);

  // ===================================================
  // 📤 SEND MESSAGE
  // ===================================================

  const sendMessage = useCallback(async (message: string, options: { mode?: AgentModeId } = {}) => {
    if (!message.trim()) return;
    if (isLoading) return;
    
    const messageMode: AgentModeId = options.mode || currentMode;
    
    try {
      setIsLoading(true);
      setError(null);
      lastMessageRef.current = message;
      
      // Add user message
      addMessage({
        role: 'user',
        content: message,
        timestamp: Date.now(),
        metadata: { mode: messageMode }
      });
      
      // Prepare request
      const request: AgentRequest = {
        message,
        sessionId,
        userId,
        mode: messageMode,
        stream,
      };
      
      // Handle response (streaming or non-streaming)
      await handleStreamResponse(request);
      
    } catch (err) {
      const agentError: AgentError = {
        code: 'SEND_ERROR',
        message: err instanceof Error ? err.message : 'Failed to send message',
        timestamp: Date.now(),
        details: err
      };
      
      setError(agentError);
      if (onError) onError(agentError);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentMode, sessionId, userId, stream, addMessage, handleStreamResponse, onError]);

  // ===================================================
  // 🛠️ UTILITY FUNCTIONS
  // ===================================================

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const changeMode = useCallback((newMode: AgentModeId) => {
    setCurrentMode(newMode);
    
    // Add system message about mode change
    addMessage({
      role: 'system',
      content: `Switched to ${newMode} mode`,
      timestamp: Date.now(),
      metadata: { mode: newMode }
    });
  }, [addMessage]);

  const retry = useCallback(() => {
    if (lastMessageRef.current) {
      sendMessage(lastMessageRef.current);
    }
  }, [sendMessage]);

  const exportSession = useCallback(() => {
    const sessionData = {
      sessionId,
      messages,
      mode: currentMode,
      exported: new Date().toISOString(),
    };
    
    return JSON.stringify(sessionData, null, 2);
  }, [sessionId, messages, currentMode]);

  const getMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/agent?action=metrics');
      return await response.json();
    } catch (err) {
      console.error('Failed to get metrics:', err);
      return null;
    }
  }, []);

  // ===================================================
  // 🔄 EFFECTS
  // ===================================================

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Connection monitoring
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/agent?action=health');
        const health = await response.json();
        setIsConnected(health.status === 'healthy');
      } catch (err) {
        setIsConnected(false);
      }
    };

    const interval = setInterval(checkConnection, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return {
    // State
    messages,
    isLoading,
    isConnected,
    session,
    error,
    
    // Actions
    sendMessage,
    clearMessages,
    changeMode,
    retry,
    
    // Session
    sessionId,
    loadSession,
    
    // Utils
    exportSession,
    getMetrics,
  };
}