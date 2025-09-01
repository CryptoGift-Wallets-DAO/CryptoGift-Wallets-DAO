/**
 * 🎯 AGENT TYPES & INTERFACES
 * Type definitions for the CG DAO Agent system
 */

// ===================================================
// 🤖 AGENT REQUEST/RESPONSE TYPES
// ===================================================

export interface AgentRequest {
  message: string;
  sessionId?: string;
  userId?: string;
  mode?: 'general' | 'technical' | 'governance' | 'operations';
  stream?: boolean;
}

export interface AgentResponse {
  response: string;
  sessionId: string;
  metrics: {
    duration: number;
    tokens: number;
    reasoning_tokens?: number;
  };
}

export interface AgentStreamChunk {
  type: 'chunk' | 'done' | 'error';
  content?: string;
  sessionId?: string;
  timestamp?: number;
  error?: string;
  metrics?: {
    duration: number;
    tokens: number;
    reasoning_tokens?: number;
  };
}

// ===================================================
// 💬 CHAT TYPES
// ===================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    mode?: string;
    reasoning_tokens?: number;
    citations?: DocumentCitation[];
    error?: boolean;
  };
}

export interface DocumentCitation {
  file: string;
  line?: number;
  section?: string;
  content: string;
}

export interface ChatSession {
  id: string;
  userId?: string;
  mode: 'general' | 'technical' | 'governance' | 'operations';
  messages: ChatMessage[];
  created: number;
  lastAccessed: number;
  metadata?: Record<string, any>;
}

// ===================================================
// ⚙️ AGENT CONFIGURATION
// ===================================================

export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  stream: boolean;
  reasoning: {
    effort: 'low' | 'medium' | 'high';
  };
  text: {
    verbosity: 'low' | 'medium' | 'high';
  };
}

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  model: 'gpt-5',
  temperature: 0.7,
  maxTokens: 1500,
  stream: true,
  reasoning: {
    effort: 'high'
  },
  text: {
    verbosity: 'high'
  }
};

// ===================================================
// 🎭 AGENT MODES & PRESETS
// ===================================================

export interface AgentMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
  quickActions: QuickAction[];
  config: Partial<AgentConfig>;
}

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: string;
  category: string;
}

export const AGENT_MODES: Record<string, AgentMode> = {
  general: {
    id: 'general',
    name: 'General Assistant',
    description: 'General purpose DAO assistance',
    icon: '🤖',
    systemPrompt: 'You are a helpful DAO assistant. Provide clear, accurate information about CryptoGift DAO.',
    quickActions: [
      {
        id: 'status',
        label: 'Project Status',
        prompt: 'What is the current status of the CryptoGift DAO project?',
        icon: '📊',
        category: 'info'
      },
      {
        id: 'contracts',
        label: 'Contract Info',
        prompt: 'Show me the deployed contract addresses and their status',
        icon: '📜',
        category: 'contracts'
      },
    ],
    config: {}
  },
  technical: {
    id: 'technical',
    name: 'Technical Expert',
    description: 'Smart contracts, deployment, and development',
    icon: '⚙️',
    systemPrompt: 'You are a technical expert for CryptoGift DAO. Focus on smart contracts, deployment, and development details.',
    quickActions: [
      {
        id: 'contracts',
        label: 'Analyze Contracts',
        prompt: 'Analyze the smart contract architecture and explain the key components',
        icon: '🔍',
        category: 'analysis'
      },
      {
        id: 'deployment',
        label: 'Deployment Guide',
        prompt: 'Provide a step-by-step deployment guide for the DAO contracts',
        icon: '🚀',
        category: 'deploy'
      },
    ],
    config: {
      temperature: 0.3,
      text: { verbosity: 'high' }
    }
  },
  governance: {
    id: 'governance',
    name: 'Governance Advisor',
    description: 'Proposals, voting, and DAO operations',
    icon: '🏛️',
    systemPrompt: 'You are a governance expert for CryptoGift DAO. Help with proposals, voting, and DAO operations.',
    quickActions: [
      {
        id: 'proposal',
        label: 'Create Proposal',
        prompt: 'Help me create a new governance proposal for the DAO',
        icon: '📝',
        category: 'governance'
      },
      {
        id: 'tokenomics',
        label: 'Tokenomics',
        prompt: 'Explain the current tokenomics and distribution plan',
        icon: '💰',
        category: 'tokens'
      },
    ],
    config: {
      reasoning: { effort: 'high' }
    }
  },
  operations: {
    id: 'operations',
    name: 'Operations Manager',
    description: 'Daily operations, monitoring, and maintenance',
    icon: '📈',
    systemPrompt: 'You are an operations manager for CryptoGift DAO. Focus on monitoring, maintenance, and operational efficiency.',
    quickActions: [
      {
        id: 'monitor',
        label: 'System Health',
        prompt: 'Check the current system health and contract status',
        icon: '🔍',
        category: 'monitoring'
      },
      {
        id: 'metrics',
        label: 'Key Metrics',
        prompt: 'Show me the key metrics and KPIs for the DAO',
        icon: '📊',
        category: 'metrics'
      },
    ],
    config: {
      maxTokens: 1000,
      temperature: 0.5
    }
  }
};

// ===================================================
// 🔧 UTILITY TYPES
// ===================================================

export type AgentModeId = keyof typeof AGENT_MODES;

export interface AgentMetrics {
  totalRequests: number;
  averageResponseTime: number;
  tokenUsage: {
    total: number;
    reasoning: number;
  };
  userSessions: number;
  popularMode: AgentModeId;
  uptime: number;
}

export interface AgentError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}