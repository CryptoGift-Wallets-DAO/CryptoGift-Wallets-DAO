/**
 * 🎣 useAgent Hook V2 - Con Vercel AI SDK
 * 
 * Hook simplificado usando @ai-sdk/react useChat
 * Maneja streaming, estado y errores automáticamente
 */

'use client';

import { useChat } from '@ai-sdk/react';
import { useCallback, useMemo } from 'react';
import type { CoreMessage } from 'ai';

type Message = CoreMessage;

// ===================================================
// 📋 TYPES
// ===================================================

export interface UseAgentOptions {
  sessionId?: string;
  userId?: string;
  mode?: 'general' | 'technical' | 'governance' | 'operations';
  initialMessages?: Message[];
  onError?: (error: Error) => void;
  onFinish?: (message: Message) => void;
}

export interface UseAgentReturn {
  // Estado del chat
  messages: Message[];
  input: string;
  isLoading: boolean;
  error: Error | undefined;
  
  // Acciones
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>, options?: any) => void;
  append: (message: Message | { role: 'user' | 'assistant'; content: string }) => Promise<string | null | undefined>;
  reload: () => void;
  stop: () => void;
  setMessages: (messages: Message[]) => void;
  setInput: (input: string) => void;
  
  // Métodos específicos del agente DAO
  askAboutContract: (address: string) => Promise<void>;
  askAboutProposal: (proposalId: string) => Promise<void>;
  searchDocumentation: (query: string) => Promise<void>;
  clearSession: () => void;
}

// ===================================================
// 🪝 MAIN HOOK
// ===================================================

export function useAgent(options: UseAgentOptions = {}): UseAgentReturn {
  const {
    sessionId,
    userId,
    mode = 'general',
    initialMessages = [],
    onError,
    onFinish,
  } = options;
  
  // Use Vercel AI SDK's useChat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    append,
    reload,
    stop,
    setMessages,
    setInput,
    isLoading,
    error,
  } = useChat({
    api: '/api/agent-v2',
    initialMessages,
    body: {
      sessionId,
      userId,
      mode,
    },
    onError: (error) => {
      console.error('[useAgent] Error:', error);
      onError?.(error);
    },
    onFinish: (message) => {
      console.log('[useAgent] Message completed:', message);
      onFinish?.(message);
    },
    onResponse: (response: Response) => {
      // Podemos acceder a headers custom aquí
      const requestId = response.headers.get('X-Request-Id');
      const sessionId = response.headers.get('X-Session-Id');
      console.log('[useAgent] Response received', { requestId, sessionId });
    },
  });
  
  // ===================================================
  // 🎯 CUSTOM METHODS
  // ===================================================
  
  // Preguntar sobre un contrato específico
  const askAboutContract = useCallback(async (address: string) => {
    const message = `Analiza el contrato en la dirección ${address} en Base Mainnet. Proporciona información sobre sus funciones principales, estado actual y cualquier dato relevante.`;
    
    await append({
      role: 'user',
      content: message,
    });
  }, [append]);
  
  // Preguntar sobre una propuesta DAO
  const askAboutProposal = useCallback(async (proposalId: string) => {
    const message = `Dame información sobre la propuesta DAO con ID ${proposalId}. Incluye estado, descripción, votos y cualquier detalle relevante.`;
    
    await append({
      role: 'user',
      content: message,
    });
  }, [append]);
  
  // Buscar en documentación
  const searchDocumentation = useCallback(async (query: string) => {
    const message = `Busca en la documentación del proyecto: "${query}"`;
    
    await append({
      role: 'user',
      content: message,
    });
  }, [append]);
  
  // Limpiar sesión
  const clearSession = useCallback(() => {
    setMessages([]);
    setInput('');
  }, [setMessages, setInput]);
  
  // Custom handleSubmit que preserva el comportamiento original
  const handleSubmit = useCallback((
    e?: React.FormEvent<HTMLFormElement>,
    options?: any
  ) => {
    // Log para debugging
    console.log('[useAgent] Submitting message', { input, mode, sessionId });
    
    // Llamar al handleSubmit original
    originalHandleSubmit(e, {
      ...options,
      body: {
        ...options?.body,
        sessionId,
        userId,
        mode,
      },
    });
  }, [originalHandleSubmit, input, mode, sessionId, userId]);
  
  // ===================================================
  // 📊 COMPUTED VALUES
  // ===================================================
  
  // Estadísticas del chat
  const stats = useMemo(() => ({
    messageCount: messages.length,
    userMessages: messages.filter(m => m.role === 'user').length,
    assistantMessages: messages.filter(m => m.role === 'assistant').length,
    totalTokens: messages.reduce((acc, m) => {
      const content = typeof m.content === 'string' ? m.content : 
        Array.isArray(m.content) ? m.content.map(part => typeof part === 'string' ? part : part.text || '').join('') : 
        '';
      return acc + (content.length || 0);
    }, 0) / 4, // Aproximación
  }), [messages]);
  
  // ===================================================
  // 🔄 RETURN
  // ===================================================
  
  return {
    // Estado del chat
    messages,
    input,
    isLoading,
    error,
    
    // Acciones básicas
    handleInputChange,
    handleSubmit,
    append,
    reload,
    stop,
    setMessages,
    setInput,
    
    // Métodos específicos del agente DAO
    askAboutContract,
    askAboutProposal,
    searchDocumentation,
    clearSession,
    
    // Estadísticas (útil para debugging)
    ...stats,
  };
}

// ===================================================
// 🎨 UTILITY FUNCTIONS
// ===================================================

/**
 * Formatea un mensaje para display
 */
export function formatMessage(message: Message): string {
  if (message.role === 'user') {
    return `👤 ${message.content}`;
  }
  if (message.role === 'assistant') {
    return `🤖 ${message.content}`;
  }
  return message.content;
}

/**
 * Extrae menciones de contratos de los mensajes
 */
export function extractContractMentions(messages: Message[]): string[] {
  const contractRegex = /0x[a-fA-F0-9]{40}/g;
  const mentions = new Set<string>();
  
  messages.forEach(message => {
    const content = typeof message.content === 'string' ? message.content : '';
    const matches = content.match(contractRegex);
    if (matches) {
      matches.forEach((match: string) => mentions.add(match));
    }
  });
  
  return Array.from(mentions);
}