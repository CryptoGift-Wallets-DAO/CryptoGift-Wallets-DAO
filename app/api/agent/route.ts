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
// Simplified imports for deployment
import { z } from 'zod';
import { nanoid } from 'nanoid';
// import winston from 'winston';
// import { Redis } from '@upstash/redis';

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

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Setup OpenAI
setDefaultOpenAIKey(process.env.OPENAI_API_KEY!);
setOpenAIAPI('responses'); // Force Responses API for GPT-5

// ===================================================
// 📊 LOGGING & METRICS
// ===================================================

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// ===================================================
// 🤖 AGENT CONFIGURATION
// ===================================================

let agentInstance: Agent | null = null;
let mcpDocsServer: MCPServerStreamableHttp | null = null;

async function initializeAgent() {
  if (agentInstance) return agentInstance;

  try {
    // Initialize MCP Docs Server
    mcpDocsServer = new MCPServerStreamableHttp({
      url: `${process.env.NEXT_PUBLIC_DAO_URL}/api/mcp-docs`,
      name: 'cg-dao-docs',
      headers: {
        'Authorization': `Bearer ${process.env.MCP_AUTH_TOKEN || 'internal'}`,
        'Content-Type': 'application/json',
      },
    });

    await mcpDocsServer.connect();
    
    // Create agent with GPT-5 Thinking capabilities
    agentInstance = new Agent({
      name: 'CG DAO Operations Assistant',
      instructions: `You are an expert assistant for CryptoGift DAO operations. You have access to all project documentation through MCP tools.

## Your Role:
- Provide accurate information about the DAO's smart contracts, governance, and operations
- Always cite specific documents when providing information
- Use formal but friendly tone
- Be concise but comprehensive

## Critical Information:
- DAO Address: ${process.env.ARAGON_DAO_ADDRESS}
- CGC Token: ${process.env.CGC_TOKEN_ADDRESS} (2M total supply on Base Mainnet)
- Network: Base (Chain ID: 8453)
- Current Phase: Production Ready - All contracts deployed and verified

## MCP Tools Usage:
- ALWAYS use MCP tools to read documentation before answering
- When citing information, include file name and relevant section
- If unsure about current state, read CLAUDE.md and DEVELOPMENT.md
- For contract details, check contracts/ directory

## Response Format:
- Start with brief summary
- Provide detailed answer with citations
- Include relevant contract addresses when applicable
- End with actionable next steps if appropriate

## Security Guidelines:
- Never provide private keys or sensitive information
- Only reference publicly deployed contract addresses
- Always recommend best practices for DAO operations`,
      
      mcpServers: [mcpDocsServer],
    });

    logger.info('Agent initialized successfully', {
      mcpServers: agentInstance.mcpServers?.length || 0,
    });

    return agentInstance;
  } catch (error) {
    logger.error('Failed to initialize agent:', error);
    throw new Error('Agent initialization failed');
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
  
  const current = await redis.get<RateLimitInfo>(key);
  const now = Date.now();
  
  if (!current || now > current.resetTime) {
    await redis.set(key, { count: 1, resetTime: now + windowMs }, { ex: 60 });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  await redis.set(key, { count: current.count + 1, resetTime: current.resetTime }, { ex: 60 });
  return true;
}

async function logRequest(data: {
  sessionId: string;
  userId?: string;
  message: string;
  mode: string;
  timestamp: number;
  ip?: string;
}) {
  await redis.zadd('agent:requests', { score: data.timestamp, member: JSON.stringify(data) });
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
  const session = await redis.get<SessionContext>(key);
  
  if (!session) {
    const newSession: SessionContext = {
      messages: [],
      mode: 'general',
      created: Date.now(),
      lastAccessed: Date.now(),
    };
    await redis.set(key, newSession, { ex: 3600 }); // 1 hour TTL
    return newSession;
  }
  
  return session;
}

async function updateSession(sessionId: string, session: SessionContext) {
  const key = `session:agent:${sessionId}`;
  session.lastAccessed = Date.now();
  await redis.set(key, session, { ex: 3600 });
}

// ===================================================
// 🚀 MAIN API HANDLER
// ===================================================

export async function POST() {
  return NextResponse.json({ 
    message: "Agent API - simplified for deployment. Full GPT-5 integration coming soon.",
    status: 'placeholder',
    features: ['GPT-5 Thinking Mode', 'MCP Document Access', 'SSE Streaming']
  });
}

export async function POST_FULL(req: NextRequest) {
  const startTime = Date.now();
  const sessionId = nanoid();
  
  try {
    // Parse and validate request
    const body = await req.json();
    const { message, sessionId: clientSessionId, userId, mode, stream } = AgentRequestSchema.parse(body);
    
    const finalSessionId = clientSessionId || sessionId;
    const clientIP = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Rate limiting
    const rateLimitKey = userId || clientIP;
    const rateLimitPassed = await checkRateLimit(rateLimitKey);
    
    if (!rateLimitPassed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before making another request.' },
        { status: 429 }
      );
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
          try {
            const result = await run(agent, contextPrompt, {
              // GPT-5 Thinking mode configuration
              model: "gpt-5",
              reasoning: { effort: "high" },           // Enable high reasoning (Thinking mode)
              text: { verbosity: "high" },             // More detailed responses
              max_output_tokens: 1500,
              temperature: 0.7,
              stream: true,
            });

            // Handle streaming response
            for await (const chunk of result) {
              const data = {
                type: 'chunk',
                content: chunk.content || '',
                sessionId: finalSessionId,
                timestamp: Date.now(),
              };
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            }
            
            // Add assistant message to session
            session.messages.push({
              role: 'assistant',
              content: result.finalOutput || '',
              timestamp: Date.now()
            });
            
            await updateSession(finalSessionId, session);
            
            // Send final message
            const finalData = {
              type: 'done',
              sessionId: finalSessionId,
              metrics: {
                duration: Date.now() - startTime,
                tokens: result.usage?.total_tokens || 0,
                reasoning_tokens: result.usage?.reasoning_tokens || 0,
              }
            };
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`));
            controller.close();
            
          } catch (error) {
            logger.error('Streaming error:', error);
            const errorData = {
              type: 'error',
              error: 'An error occurred while processing your request.',
              sessionId: finalSessionId,
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
            controller.close();
          }
        },
      });
      
      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
      
    } else {
      // Non-streaming response
      const result = await run(agent, contextPrompt, {
        model: "gpt-5",
        reasoning: { effort: "high" },
        text: { verbosity: "high" },
        max_output_tokens: 1500,
        temperature: 0.7,
      });
      
      // Add assistant message to session
      session.messages.push({
        role: 'assistant',
        content: result.finalOutput || '',
        timestamp: Date.now()
      });
      
      await updateSession(finalSessionId, session);
      
      return NextResponse.json({
        response: result.finalOutput,
        sessionId: finalSessionId,
        metrics: {
          duration: Date.now() - startTime,
          tokens: result.usage?.total_tokens || 0,
          reasoning_tokens: result.usage?.reasoning_tokens || 0,
        }
      });
    }
    
  } catch (error) {
    logger.error('Agent API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// ===================================================
// 🔍 GET HANDLER (HEALTH CHECK & METRICS)
// ===================================================

export async function GET() {
  return NextResponse.json({
    service: 'CG DAO Agent API',
    version: '1.0.0',
    status: 'placeholder',
    message: 'Simplified for deployment - Full GPT-5 integration coming soon',
    capabilities: [
      'GPT-5 Thinking Mode (planned)',
      'MCP Document Access (planned)', 
      'Session Management (planned)',
      'Rate Limiting (planned)',
      'Streaming Responses (planned)'
    ]
  });
}

export async function GET_FULL(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  
  switch (action) {
    case 'health':
      return NextResponse.json({
        status: 'healthy',
        agent: agentInstance ? 'ready' : 'not initialized',
        mcpServer: mcpDocsServer ? 'connected' : 'not connected',
        timestamp: new Date().toISOString(),
      });
      
    case 'metrics':
      try {
        const recentRequests = await redis.zrange('agent:requests', -100, -1);
        return NextResponse.json({
          totalRequests: recentRequests.length,
          period: 'last 100 requests',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return NextResponse.json({ error: 'Metrics unavailable' }, { status: 500 });
      }
      
    default:
      return NextResponse.json({
        service: 'CG DAO Agent API',
        version: '1.0.0',
        capabilities: [
          'GPT-5 Thinking Mode',
          'MCP Document Access',
          'Session Management',
          'Rate Limiting',
          'Streaming Responses'
        ]
      });
  }
}