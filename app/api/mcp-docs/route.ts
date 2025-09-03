/**
 * 📚 MCP DOCS SERVER - STREAMABLE HTTP
 * Read-only access to CryptoGift DAO documentation
 * 
 * Provides MCP-compliant API for agent to access project documentation:
 * - All .md files in project root
 * - Contract source files
 * - Scripts and configuration
 * - With proper security and access control
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join, resolve, extname, basename } from 'path';
import { z } from 'zod';
import { validateBearerToken } from '@/lib/security/timing-safe';
import { getCorsHeadersJson } from '@/lib/security/cors';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
// Simplified for deployment - removed winston dependency

// ===================================================
// 📋 TYPES & VALIDATION
// ===================================================

const MCPRequestSchema = z.object({
  method: z.string(),
  params: z.record(z.any()).optional(),
  id: z.string().or(z.number()).optional(),
});

interface MCPResponse {
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id?: string | number;
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

// ===================================================
// 🔧 CONFIGURATION
// ===================================================

const PROJECT_ROOT = resolve(process.cwd());
const ALLOWED_EXTENSIONS = ['.md', '.sol', '.js', '.ts', '.jsx', '.tsx', '.json', '.yml', '.yaml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const BLOCKED_PATHS = [
  'node_modules',
  '.pnpm-store',
  '.git',
  '.next',
  'dist',
  'build',
  '.env',
  '.env.local',
  '.env.production',
  'private_key',
  'keys',
  'secrets',
  'frontend',
  'ranking-frontend',
  'ranking-backend',
  'bots',
  'artifacts',
  'cache',
  'coverage',
  'typechain-types'
];

const logger = {
  info: (msg: string, data?: any) => console.log(`[MCP-INFO] ${msg}`, data || ''),
  error: (msg: string, error?: any) => console.error(`[MCP-ERROR] ${msg}`, error || ''),
  warn: (msg: string, data?: any) => console.warn(`[MCP-WARN] ${msg}`, data || '')
};

// ===================================================
// 🛡️ RATE LIMITING & ALLOWLIST
// ===================================================

// Initialize Redis client for rate limiting (use same as agent if available)
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

const initializeRateLimit = () => {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    
    // MCP docs gets stricter rate limiting (5 requests per minute)
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
    });
  }
};

// IP allowlist for MCP docs access
const getAllowedIPs = (): string[] => {
  const allowedIPs = process.env.MCP_ALLOWED_IPS;
  if (!allowedIPs) {
    // Development defaults
    if (process.env.NODE_ENV === 'development') {
      return ['127.0.0.1', '::1', 'localhost'];
    }
    return []; // Production requires explicit allowlist
  }
  return allowedIPs.split(',').map(ip => ip.trim()).filter(Boolean);
};

const isIPAllowed = (clientIP: string | null): boolean => {
  if (!clientIP) return false;
  
  const allowedIPs = getAllowedIPs();
  if (allowedIPs.length === 0 && process.env.NODE_ENV === 'production') {
    logger.warn('No MCP IP allowlist configured for production');
    return false;
  }
  
  // Check exact IP match
  if (allowedIPs.includes(clientIP)) {
    return true;
  }
  
  // Check if it's localhost variations
  if (clientIP === '::1' || clientIP === '127.0.0.1' || clientIP.startsWith('::ffff:127.0.0.1')) {
    return allowedIPs.includes('localhost') || allowedIPs.includes('127.0.0.1');
  }
  
  return false;
};

const checkRateLimit = async (identifier: string): Promise<boolean> => {
  initializeRateLimit();
  
  if (!ratelimit) {
    logger.warn('Rate limiting not configured for MCP docs');
    return true; // Allow if rate limiting not configured
  }
  
  try {
    const { success } = await ratelimit.limit(identifier);
    return success;
  } catch (error) {
    logger.error('Rate limit check error:', error);
    return true; // Allow on error to avoid blocking service
  }
};

// ===================================================
// 🛡️ SECURITY HELPERS
// ===================================================

function isPathAllowed(requestedPath: string): boolean {
  const normalizedPath = resolve(PROJECT_ROOT, requestedPath);
  
  // Must be within project root
  if (!normalizedPath.startsWith(PROJECT_ROOT)) {
    return false;
  }
  
  // Check blocked paths
  const relativePath = normalizedPath.replace(PROJECT_ROOT, '');
  for (const blockedPath of BLOCKED_PATHS) {
    if (relativePath.includes(blockedPath)) {
      return false;
    }
  }
  
  return true;
}

function isExtensionAllowed(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext) || ext === '';
}

function sanitizePath(path: string): string {
  return path.replace(/\.\./g, '').replace(/\/+/g, '/');
}

// ===================================================
// 🔍 FILE OPERATIONS
// ===================================================

async function readFile(filePath: string): Promise<string> {
  const sanitizedPath = sanitizePath(filePath);
  const fullPath = resolve(PROJECT_ROOT, sanitizedPath);
  
  if (!isPathAllowed(sanitizedPath) || !isExtensionAllowed(fullPath)) {
    throw new Error(`Access denied to file: ${filePath}`);
  }
  
  try {
    const stats = await fs.stat(fullPath);
    if (stats.size > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${filePath}`);
    }
    
    const content = await fs.readFile(fullPath, 'utf-8');
    return content;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }
}

async function listDirectory(dirPath: string): Promise<Array<{name: string, type: 'file' | 'directory', size?: number}>> {
  const sanitizedPath = sanitizePath(dirPath);
  const fullPath = resolve(PROJECT_ROOT, sanitizedPath);
  
  if (!isPathAllowed(sanitizedPath)) {
    throw new Error(`Access denied to directory: ${dirPath}`);
  }
  
  try {
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    const result = [];
    
    for (const entry of entries) {
      // Skip blocked paths
      if (BLOCKED_PATHS.some(blocked => entry.name.includes(blocked))) {
        continue;
      }
      
      if (entry.isFile()) {
        if (!isExtensionAllowed(entry.name)) continue;
        
        const stats = await fs.stat(join(fullPath, entry.name));
        result.push({
          name: entry.name,
          type: 'file' as const,
          size: stats.size
        });
      } else if (entry.isDirectory()) {
        result.push({
          name: entry.name,
          type: 'directory' as const
        });
      }
    }
    
    return result;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Directory not found: ${dirPath}`);
    }
    throw error;
  }
}

async function searchFiles(query: string, directory?: string): Promise<Array<{file: string, matches: Array<{line: number, content: string}>}>> {
  const searchDir = directory ? resolve(PROJECT_ROOT, sanitizePath(directory)) : PROJECT_ROOT;
  
  if (!isPathAllowed(directory || '')) {
    throw new Error(`Access denied to search directory: ${directory}`);
  }
  
  const results: Array<{file: string, matches: Array<{line: number, content: string}>}> = [];
  
  async function searchInFile(filePath: string) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      const matches: Array<{line: number, content: string}> = [];
      
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
          matches.push({
            line: index + 1,
            content: line.trim()
          });
        }
      });
      
      if (matches.length > 0) {
        results.push({
          file: filePath.replace(PROJECT_ROOT, '').replace(/^\//, ''),
          matches
        });
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  async function walkDirectory(dir: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        // Skip blocked paths
        if (BLOCKED_PATHS.some(blocked => entry.name.includes(blocked))) {
          continue;
        }
        
        if (entry.isFile() && isExtensionAllowed(entry.name)) {
          await searchInFile(fullPath);
        } else if (entry.isDirectory() && results.length < 50) { // Limit results
          await walkDirectory(fullPath);
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }
  
  await walkDirectory(searchDir);
  return results.slice(0, 20); // Limit to 20 results
}

// ===================================================
// 🔧 MCP TOOLS DEFINITION
// ===================================================

const MCP_TOOLS: MCPTool[] = [
  {
    name: 'read_file',
    description: 'Read the contents of a file in the project',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file relative to project root'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'list_directory',
    description: 'List files and directories in a given path',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the directory relative to project root (empty string for root)',
          default: ''
        }
      }
    }
  },
  {
    name: 'search_files',
    description: 'Search for text content across project files',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Text to search for'
        },
        directory: {
          type: 'string',
          description: 'Directory to search in (optional, defaults to project root)'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'get_project_structure',
    description: 'Get an overview of the project structure with key files',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

// ===================================================
// 🛠️ MCP HANDLERS
// ===================================================

async function handleListTools(): Promise<{tools: MCPTool[]}> {
  return { tools: MCP_TOOLS };
}

async function handleCallTool(name: string, params: any): Promise<any> {
  logger.info('MCP Tool Call', { tool: name, params });
  
  switch (name) {
    case 'read_file':
      const content = await readFile(params.path);
      return {
        content: [
          {
            type: 'text',
            text: `File: ${params.path}\n\n${content}`
          }
        ]
      };
      
    case 'list_directory':
      const entries = await listDirectory(params.path || '');
      const formatted = entries.map(entry => 
        `${entry.type === 'directory' ? '📁' : '📄'} ${entry.name}${entry.size ? ` (${entry.size} bytes)` : ''}`
      ).join('\n');
      
      return {
        content: [
          {
            type: 'text',
            text: `Directory: ${params.path || 'project root'}\n\n${formatted}`
          }
        ]
      };
      
    case 'search_files':
      const results = await searchFiles(params.query, params.directory);
      if (results.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No results found for: "${params.query}"`
            }
          ]
        };
      }
      
      const searchOutput = results.map(result => 
        `📄 **${result.file}**\n${result.matches.map(match => 
          `  Line ${match.line}: ${match.content}`
        ).join('\n')}`
      ).join('\n\n');
      
      return {
        content: [
          {
            type: 'text',
            text: `Search results for: "${params.query}"\n\n${searchOutput}`
          }
        ]
      };
      
    case 'get_project_structure':
      const structure = await getProjectStructure();
      return {
        content: [
          {
            type: 'text',
            text: structure
          }
        ]
      };
      
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function getProjectStructure(): Promise<string> {
  const keyFiles = [
    'CLAUDE.md',
    'README.md', 
    'DEVELOPMENT.md',
    'package.json',
    'contracts/core/',
    'scripts/deploy/',
    'app/',
  ];
  
  let structure = '# CryptoGift DAO Project Structure\n\n';
  
  for (const file of keyFiles) {
    try {
      const fullPath = resolve(PROJECT_ROOT, file);
      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory()) {
        const entries = await listDirectory(file);
        structure += `## 📁 ${file}\n`;
        structure += entries.slice(0, 10).map(e => `- ${e.name}`).join('\n') + '\n\n';
      } else {
        structure += `## 📄 ${file}\n`;
        const content = await readFile(file);
        const lines = content.split('\n').slice(0, 5);
        structure += `Preview:\n\`\`\`\n${lines.join('\n')}\n\`\`\`\n\n`;
      }
    } catch (error) {
      structure += `## ❌ ${file} (not accessible)\n\n`;
    }
  }
  
  return structure;
}

// ===================================================
// 🚀 API HANDLERS
// ===================================================

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  
  try {
    // IP allowlist check
    const clientIP = req.ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!isIPAllowed(clientIP)) {
      logger.warn('MCP IP not allowed', { 
        ip: clientIP,
        userAgent: req.headers.get('user-agent')
      });
      
      return NextResponse.json({
        error: {
          code: -32002,
          message: 'IP not allowed'
        }
      } as MCPResponse, { 
        status: 403,
        headers: getCorsHeadersJson(origin)
      });
    }
    
    // Rate limiting check
    const rateLimitPassed = await checkRateLimit(clientIP);
    if (!rateLimitPassed) {
      logger.warn('MCP rate limit exceeded', { ip: clientIP });
      
      return NextResponse.json({
        error: {
          code: -32003,
          message: 'Rate limit exceeded'
        }
      } as MCPResponse, { 
        status: 429,
        headers: getCorsHeadersJson(origin)
      });
    }
    
    const body = await req.json();
    const { method, params, id } = MCPRequestSchema.parse(body);
    
    // Timing-safe auth check
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.MCP_AUTH_TOKEN || 'internal';
    
    if (!validateBearerToken(authHeader, expectedToken)) {
      logger.warn('MCP unauthorized access attempt', {
        hasAuthHeader: !!authHeader,
        ip: clientIP,
        userAgent: req.headers.get('user-agent')
      });
      
      return NextResponse.json({
        error: {
          code: -32001,
          message: 'Unauthorized'
        },
        id
      } as MCPResponse, { 
        status: 401,
        headers: getCorsHeadersJson(origin)
      });
    }
    
    let result: any;
    
    switch (method) {
      case 'tools/list':
        result = await handleListTools();
        break;
        
      case 'tools/call':
        if (!params?.name) {
          throw new Error('Tool name is required');
        }
        result = await handleCallTool(params.name, params.arguments || {});
        break;
        
      default:
        throw new Error(`Unknown method: ${method}`);
    }
    
    return NextResponse.json({
      result,
      id
    } as MCPResponse, {
      headers: getCorsHeadersJson(origin)
    });
    
  } catch (error) {
    logger.error('MCP Server error:', error);
    
    const errorResponse: MCPResponse = {
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error'
      },
      id: (error as any).id
    };
    
    return NextResponse.json(errorResponse, { 
      status: 500,
      headers: getCorsHeadersJson(origin)
    });
  }
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  
  return NextResponse.json({
    name: 'CG DAO Documentation Server',
    version: '1.0.0',
    description: 'MCP Streamable HTTP server for CryptoGift DAO documentation',
    tools: MCP_TOOLS.length,
    capabilities: [
      'read_file',
      'list_directory', 
      'search_files',
      'get_project_structure'
    ],
    security: [
      'IP allowlist',
      'Rate limiting (5 req/min)',
      'Bearer token auth',
      'Timing-safe comparison'
    ]
  }, {
    headers: getCorsHeadersJson(origin)
  });
}

// OPTIONS handler for CORS preflight
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: getCorsHeadersJson(origin)
  });
}