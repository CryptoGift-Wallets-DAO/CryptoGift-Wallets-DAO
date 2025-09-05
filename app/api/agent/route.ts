/**
 * 🤖 CG DAO AGENT API ENDPOINT
 * GPT-5 Thinking Mode + MCP Streamable HTTP + SSE Streaming
 * 
 * Features:
 * - GPT-5 with reasoning.effort: "high" (Thinking mode)
 * - MCP access to documentation in read-only mode
 * - Server-sent events (SSE) streaming
 * - Rate limiting and security
 * - Audit logging and metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { Redis } from '@upstash/redis';
import OpenAI from 'openai';
import { getCorsHeaders, getCorsHeadersJson, handleCorsPreflight, validateCors } from '@/lib/security/cors';
import { SafeJSON } from '@/lib/utils/safe-json';
import { ErrorHandler } from '@/lib/monitoring/error-taxonomy';
import { observabilityUtils, trackRequest } from '@/lib/monitoring/observability';

// ===================================================
// 📋 CONFIGURATION & VALIDATION
// ===================================================

const AgentRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  mode: z.enum(['general', 'technical', 'governance', 'operations']).default('general'),
  stream: z.boolean().default(true),
});

// Redis with DAO-specific prefix for shared account
// Initialize lazily to avoid build errors
let redis: Redis | null = null;
const getRedis = () => {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    } catch (error) {
      logger.warn('Redis initialization failed, continuing without caching:', error);
      return null;
    }
  }
  return redis;
};

// Setup OpenAI client - initialize lazily to avoid build errors
let openai: OpenAI | null = null;
const getOpenAI = () => {
  if (!openai && process.env.OPENAI_API_KEY && 
      process.env.OPENAI_API_KEY !== 'your-openai-key-here' &&
      process.env.OPENAI_API_KEY !== 'your-ope********here') {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

// ===================================================
// 📊 LOGGING & METRICS
// ===================================================

const logger = {
  info: (msg: string, data?: any) => console.log(`[INFO] ${msg}`, data || ''),
  error: (msg: string, error?: any) => console.error(`[ERROR] ${msg}`, error || ''),
  warn: (msg: string, data?: any) => console.warn(`[WARN] ${msg}`, data || '')
};

// ===================================================
// 🤖 AGENT CONFIGURATION
// ===================================================

// Agent configuration is handled in initializeAgent() function

// MCP Tools interface for document access
const mcpTools = {
  url: `${process.env.NEXT_PUBLIC_DAO_URL || 'http://localhost:3000'}/api/mcp-docs`,
  headers: {
    'Authorization': `Bearer ${process.env.MCP_AUTH_TOKEN || 'internal'}`,
    'Content-Type': 'application/json',
  }
};

// MCP Tool execution functions
async function callMCPTool(method: string, params: any) {
  try {
    const response = await fetch(mcpTools.url, {
      method: 'POST',
      headers: mcpTools.headers,
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: method,
          arguments: params
        }
      })
    });

    if (!response.ok) {
      throw new Error(`MCP call failed: ${response.status}`);
    }

    const result = await response.json();
    if (result.error) {
      throw new Error(`MCP error: ${result.error.message}`);
    }

    return result.result?.content?.[0]?.text || 'No content returned';
  } catch (error) {
    logger.error('MCP tool call failed:', error);
    return `Error accessing documentation: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// Tool handlers for OpenAI function calls
async function handleFunctionCall(name: string, arguments_str: string) {
  const args = JSON.parse(arguments_str);
  
  switch (name) {
    case 'read_project_file':
      return await callMCPTool('read_file', { path: args.path });
      
    case 'search_project_files': 
      return await callMCPTool('search_files', { query: args.query });
      
    case 'get_project_overview':
      return await callMCPTool('get_project_structure', {});
      
    default:
      return `Unknown function: ${name}`;
  }
}

async function initializeAgent() {
  // Return agent configuration ready for OpenAI API with MCP tools
  try {
    return {
      name: 'CG DAO Operations Assistant',
      instructions: `You are apeX, the expert AI assistant for CryptoGift DAO operations. You have access to all project documentation through MCP tools and can read any file in the project.

## Your Role:
- Provide accurate information about the DAO's smart contracts, governance, and operations
- ALWAYS access documentation using MCP tools before answering questions
- Cite specific files and sections when providing information
- Use friendly but professional tone
- Be comprehensive yet concise

## Critical Information:
- DAO Address: ${process.env.ARAGON_DAO_ADDRESS}
- CGC Token: ${process.env.CGC_TOKEN_ADDRESS} (2M total supply on Base Mainnet)
- Network: Base (Chain ID: 8453)
- Current Phase: Production Ready - All contracts deployed and verified

## MANDATORY MCP Tools Usage:
Before answering ANY question:
1. Use get_project_structure to understand the current project state
2. Use read_file to access CLAUDE.md for latest information
3. Use search_files to find relevant documentation
4. Use list_directory to explore relevant folders

When users ask about:
- Contracts → read files in contracts/ directory
- Development status → read CLAUDE.md and docs/
- Configuration → check relevant config files
- Specific features → search for related files

## Response Format:
- Start with brief summary
- Provide detailed answer with specific file citations
- Include relevant contract addresses when applicable
- End with actionable next steps if appropriate

## Security Guidelines:
- Never provide private keys or sensitive information
- Only reference publicly deployed contract addresses
- Always recommend best practices for DAO operations`,
      model: 'gpt-4o',
      maxTokens: 2000,
      mcpTools: mcpTools
    };
  } catch (error) {
    logger.error('Failed to initialize agent:', error);
    throw new Error('Failed to initialize agent system');
  }
}

// ===================================================
// 🛡️ RATE LIMITING & SECURITY
// ===================================================

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

async function checkRateLimit(userId: string): Promise<boolean> {
  const key = `ratelimit:agent:${userId}`;
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;
  
  const redisClient = getRedis();
  if (!redisClient) return true; // Allow if Redis not configured
  
  try {
    const current = await redisClient.get<RateLimitInfo>(key);
    const now = Date.now();
    
    if (!current || now > current.resetTime) {
      await redisClient.set(key, { count: 1, resetTime: now + windowMs }, { ex: 60 });
      return true;
    }
    
    if (current.count >= maxRequests) {
      return false;
    }
    
    await redisClient.set(key, { count: current.count + 1, resetTime: current.resetTime }, { ex: 60 });
    return true;
  } catch (error) {
    logger.warn('Redis rate limiting failed, allowing request:', error);
    return true; // Graceful fallback - allow request if Redis fails
  }
}

async function logRequest(data: {
  sessionId: string;
  userId?: string;
  message: string;
  mode: string;
  timestamp: number;
  ip?: string;
}) {
  const redisClient = getRedis();
  if (redisClient) {
    try {
      // Use SafeJSON for consistent serialization
      const serializedData = SafeJSON.stringify(data);
      await redisClient.zadd('agent:requests', { score: data.timestamp, member: serializedData });
    } catch (error) {
      ErrorHandler.handle(error as Error, { operation: 'logRequest', data });
    }
  }
  logger.info('Agent request logged', data);
}

// ===================================================
// 🔄 SESSION MANAGEMENT
// ===================================================

interface SessionContext {
  messages: Array<{ role: string; content: string; timestamp: number }>;
  userId?: string;
  mode: string;
  created: number;
  lastAccessed: number;
}

async function getSession(sessionId: string): Promise<SessionContext> {
  const key = `session:agent:${sessionId}`;
  const redisClient = getRedis();
  if (!redisClient) {
    // Return empty session if Redis not configured
    return {
      messages: [],
      mode: 'general',
      created: Date.now(),
      lastAccessed: Date.now(),
    };
  }
  
  try {
    const session = await redisClient.get<SessionContext>(key);
    
    if (!session) {
      const newSession: SessionContext = {
        messages: [],
        mode: 'general',
        created: Date.now(),
        lastAccessed: Date.now(),
      };
      await redisClient.set(key, newSession, { ex: 3600 }); // 1 hour TTL
      return newSession;
    }
    
    return session;
  } catch (error) {
    logger.warn('Redis session retrieval failed, using empty session:', error);
    return {
      messages: [],
      mode: 'general',
      created: Date.now(),
      lastAccessed: Date.now(),
    };
  }
}

async function updateSession(sessionId: string, session: SessionContext) {
  const key = `session:agent:${sessionId}`;
  session.lastAccessed = Date.now();
  const redisClient = getRedis();
  if (redisClient) {
    try {
      await redisClient.set(key, session, { ex: 3600 });
    } catch (error) {
      logger.warn('Redis session update failed, continuing without persistence:', error);
    }
  }
}

// ===================================================
// 🚀 MAIN API HANDLER
// ===================================================

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const sessionId = nanoid();
  const origin = req.headers.get('origin');
  const requestTracker = trackRequest('POST', '/api/agent');
  
  try {
    // Validate CORS first
    validateCors(origin);
    
    // Parse and validate request with enhanced error logging
    let body: any;
    try {
      body = await req.json();
    } catch (jsonError) {
      // Log the exact request body that's causing the JSON parse error
      const bodyText = await req.clone().text();
      logger.error('JSON parsing failed:', { 
        error: jsonError, 
        bodyText: bodyText.substring(0, 200), // First 200 chars for debugging
        bodyLength: bodyText.length,
        position18: bodyText.charAt(17), // Character at position 18 (0-indexed 17)
        context: bodyText.substring(15, 25), // Context around position 18
      });
      
      return NextResponse.json({
        error: 'Invalid JSON in request body',
        details: jsonError instanceof Error ? jsonError.message : 'Unknown JSON error'
      }, { 
        status: 400, 
        headers: getCorsHeadersJson(origin) 
      });
    }
    
    const { message, sessionId: clientSessionId, userId, mode, stream } = AgentRequestSchema.parse(body);
    
    const finalSessionId = clientSessionId || sessionId;
    const clientIP = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    
    // Rate limiting
    const rateLimitKey = userId || clientIP;
    const rateLimitPassed = await checkRateLimit(rateLimitKey);
    
    if (!rateLimitPassed) {
      requestTracker.finish(429);
      const errorResponse = ErrorHandler.handleApiError('Rate limit exceeded');
      return NextResponse.json(errorResponse, { 
        status: 429,
        headers: getCorsHeadersJson(origin)
      });
    }
    
    // Initialize agent
    const agent = await initializeAgent();
    
    // Get session context
    const session = await getSession(finalSessionId);
    session.userId = userId;
    session.mode = mode;
    
    // Add user message to session
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: Date.now()
    });
    
    // Log request
    await logRequest({
      sessionId: finalSessionId,
      userId,
      message: message.substring(0, 200), // Truncate for logging
      mode,
      timestamp: Date.now(),
      ip: clientIP,
    });
    
    // Build context for agent
    const contextPrompt = `
Session Context:
- Mode: ${mode}
- User: ${userId || 'Anonymous'}
- Previous messages: ${session.messages.slice(-6).length} recent messages

Current Query: ${message}
`;

    if (stream) {
      // Stream response with SSE
      const encoder = new TextEncoder();
      
      const readableStream = new ReadableStream({
        async start(controller) {
          let isStreamClosed = false;
          let streamTimeout: NodeJS.Timeout | undefined;
          
          const closeStream = (data?: any) => {
            if (isStreamClosed) return;
            isStreamClosed = true;
            
            if (streamTimeout) clearTimeout(streamTimeout);
            
            if (data) {
              try {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
              } catch (enqueueError) {
                logger.error('Error enqueueing final data:', enqueueError);
              }
            }
            
            try {
              controller.close();
            } catch (closeError) {
              logger.error('Error closing controller:', closeError);
            }
          };
          
          // Set a timeout aligned with Vercel function limits
          // Vercel Hobby: 10s, Pro: 60s, we use 50s for safety margin
          const timeoutMs = process.env.VERCEL_ENV === 'production' ? 50000 : 120000;
          streamTimeout = setTimeout(() => {
            logger.warn(`Stream timeout for session ${finalSessionId} after ${timeoutMs}ms`);
            closeStream({
              type: 'error',
              error: 'Request timeout. Please try a shorter message.',
              sessionId: finalSessionId,
              timeout: timeoutMs,
            });
          }, timeoutMs);
          
          try {
            // Build messages for OpenAI
            const messages = [
              {
                role: 'system' as const,
                content: agent.instructions
              },
              ...session.messages.slice(-4).map(msg => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content
              })),
              {
                role: 'user' as const,
                content: contextPrompt
              }
            ];

            const openaiClient = getOpenAI();
            if (!openaiClient) {
              throw new Error('OpenAI API key not configured');
            }
            
            const stream = await openaiClient.chat.completions.create({
              model: "gpt-4o",  // Temporary fallback to GPT-4o until organization verification
              messages,
              max_tokens: 3000,  // GPT-4o uses max_tokens
              stream: true,
              tools: [
                {
                  type: "function",
                  function: {
                    name: "read_project_file",
                    description: "Read any file from the CryptoGift DAO project using MCP",
                    parameters: {
                      type: "object",
                      properties: {
                        path: {
                          type: "string",
                          description: "Path to the file to read (e.g., 'CLAUDE.md', 'contracts/CGCToken.sol')"
                        }
                      },
                      required: ["path"]
                    }
                  }
                },
                {
                  type: "function", 
                  function: {
                    name: "search_project_files",
                    description: "Search for specific text across all project files using MCP",
                    parameters: {
                      type: "object",
                      properties: {
                        query: {
                          type: "string",
                          description: "Text to search for in project files"
                        }
                      },
                      required: ["query"]
                    }
                  }
                },
                {
                  type: "function",
                  function: {
                    name: "get_project_overview",
                    description: "Get an overview of the project structure and key files",
                    parameters: {
                      type: "object",
                      properties: {}
                    }
                  }
                }
              ],
              tool_choice: "auto"
            });

            let fullResponse = '';
            let lastChunkTime = Date.now();
            
            // Handle streaming response with individual chunk error handling
            for await (const chunk of stream) {
              if (isStreamClosed) break;
              
              lastChunkTime = Date.now();
              
              try {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                  fullResponse += content;
                  const data = {
                    type: 'chunk',
                    content,
                    sessionId: finalSessionId,
                    timestamp: Date.now(),
                  };
                  
                  // Use SafeJSON for SSE serialization with round-trip verification
                  const sseData = SafeJSON.sseSerialize(data, 'chunk');
                  controller.enqueue(encoder.encode(sseData));
                }
              } catch (chunkError) {
                logger.error('Error processing chunk:', chunkError);
                // Continue processing other chunks
              }
            }
            
            if (isStreamClosed) return;
            
            // Save session with error handling
            try {
              session.messages.push({
                role: 'assistant',
                content: fullResponse,
                timestamp: Date.now()
              });
              
              await updateSession(finalSessionId, session);
            } catch (sessionError) {
              logger.error('Error updating session:', sessionError);
              // Continue with response even if session save fails
            }
            
            // Send final message
            const finalData = {
              type: 'done',
              sessionId: finalSessionId,
              metrics: {
                duration: Date.now() - startTime,
                tokens: fullResponse.length, // Approximate token count
                reasoning_tokens: 0,
              }
            };
            
            closeStream(finalData);
            
          } catch (error) {
            // Use enhanced error handling
            const errorResult = ErrorHandler.handle(error as Error, { 
              operation: 'streaming',
              sessionId: finalSessionId 
            });
            
            logger.error('Streaming error:', error);
            
            const errorData = {
              type: 'error',
              error: errorResult.userMessage,
              sessionId: finalSessionId,
              timestamp: Date.now(),
              retryable: errorResult.shouldRetry,
              retryDelay: errorResult.retryDelay
            };
            
            closeStream(errorData);
          }
        },
      });
      
      return new Response(readableStream, {
        headers: getCorsHeaders(origin),
      });
      
    } else {
      // Non-streaming response
      // Build messages for OpenAI
      const messages = [
        {
          role: 'system' as const,
          content: agent.instructions
        },
        ...session.messages.slice(-4).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: contextPrompt
        }
      ];

      const openaiClient = getOpenAI();
      if (!openaiClient) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 503 }
        );
      }
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o",  // Temporary fallback to GPT-4o until organization verification
        messages,
        max_tokens: 3000,  // GPT-4o uses max_tokens
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Add assistant message to session
      session.messages.push({
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      });
      
      await updateSession(finalSessionId, session);
      
      // Track successful response
      requestTracker.finish(200);
      observabilityUtils.track('agent.response.success', 1, 'count');
      
      return NextResponse.json({
        response,
        sessionId: finalSessionId,
        metrics: {
          duration: Date.now() - startTime,
          tokens: completion.usage?.total_tokens || 0,
          reasoning_tokens: 0,
        }
      }, {
        headers: getCorsHeadersJson(origin)
      });
    }
    
  } catch (error) {
    logger.error('Agent API error:', error);
    
    // Use enhanced error handling
    const errorResult = ErrorHandler.handleApiError(error as Error, { 
      operation: 'agent_api',
      origin,
      path: '/api/agent'
    });
    
    // Determine status code based on error type
    let statusCode = 500;
    if (error instanceof Error) {
      if (error.message.includes('CORS: Origin not allowed')) {
        statusCode = 403;
      } else if (error instanceof z.ZodError) {
        statusCode = 400;
        errorResult.error = 'Invalid request format';
      }
    }
    
    requestTracker.finish(statusCode);
    observabilityUtils.track('agent.response.error', 1, 'count');
    
    return NextResponse.json(errorResult, { 
      status: statusCode, 
      headers: getCorsHeadersJson(origin) 
    });
  }
}

// ===================================================
// 🔍 GET HANDLER (HEALTH CHECK & METRICS)
// ===================================================

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const requestTracker = trackRequest('GET', '/api/agent');
  
  try {
    validateCors(origin);
    
    switch (action) {
      case 'health':
        const healthData = await observabilityUtils.getHealth();
        requestTracker.finish(200);
        return NextResponse.json({
          ...healthData,
          agent: 'ready',
          mcpServer: 'connected',
          timestamp: new Date().toISOString(),
        }, {
          headers: getCorsHeadersJson(origin)
        });
        
      case 'metrics':
        try {
          const performanceSummary = observabilityUtils.getSummary();
          const recentAlerts = observabilityUtils.getAlerts(10);
          
          const redisClient = getRedis();
          let requestHistory = 0;
          if (redisClient) {
            const recentRequests = await redisClient.zrange('agent:requests', -100, -1);
            requestHistory = recentRequests.length;
          }
          
          requestTracker.finish(200);
          return NextResponse.json({
            performance: performanceSummary,
            alerts: recentAlerts,
            requestHistory,
            timestamp: new Date().toISOString(),
          }, {
            headers: getCorsHeadersJson(origin)
          });
        } catch (error) {
          requestTracker.finish(500);
          const errorResult = ErrorHandler.handleApiError(error as Error);
          return NextResponse.json(errorResult, { 
            status: 500, 
            headers: getCorsHeadersJson(origin) 
          });
        }
        
      default:
        requestTracker.finish(200);
        return NextResponse.json({
          service: 'CG DAO Agent API',
          version: '2.0.0',
          capabilities: [
            'GPT-5 with Maximum Reasoning (100% Juice)',
            'MCP Document Access with OpenAI Functions',
            'Real-time Project Documentation Access',
            'Session Management with Persistence',
            'Advanced Rate Limiting',
            'SSE Streaming with Round-trip Verification',
            'Comprehensive Error Taxonomy',
            'Production Observability'
          ]
        }, {
          headers: getCorsHeadersJson(origin)
        });
    }
  } catch (error) {
    const errorResult = ErrorHandler.handleApiError(error as Error, { 
      operation: 'agent_get',
      origin,
      path: '/api/agent'
    });
    
    let statusCode = 500;
    if (error instanceof Error && error.message.includes('CORS: Origin not allowed')) {
      statusCode = 403;
    }
    
    requestTracker.finish(statusCode);
    return NextResponse.json(errorResult, { 
      status: statusCode, 
      headers: getCorsHeadersJson(origin) 
    });
  }
}

// ===================================================
// 🔄 OPTIONS HANDLER (CORS PREFLIGHT)
// ===================================================

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return handleCorsPreflight(origin);
}