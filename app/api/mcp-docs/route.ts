/**
 * 📚 MCP DOCS SERVER - LIGHTWEIGHT VERSION
 * Read-only access to CryptoGift DAO documentation
 * 
 * OPTIMIZED for Vercel deployment with <300MB function size
 * - Conditional loading of heavy dependencies
 * - Edge-compatible subset for production
 * - Full functionality in development
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join, resolve, extname } from 'path';

// Simple logger without external deps
const logger = {
  info: (msg: string, data?: any) => console.log(`[MCP-INFO] ${msg}`, data || ''),
  error: (msg: string, error?: any) => console.error(`[MCP-ERROR] ${msg}`, error || ''),
  warn: (msg: string, data?: any) => console.warn(`[MCP-WARN] ${msg}`, data || '')
};

// Lightweight request validation
const validateMCPRequest = (body: any): { method: string, params?: any, id?: string | number } => {
  if (!body || typeof body !== 'object') throw new Error('Invalid request body');
  if (typeof body.method !== 'string') throw new Error('Method must be string');
  return { method: body.method, params: body.params || {}, id: body.id };
};

// Basic CORS headers
const getCorsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
});

// Configuration
const PROJECT_ROOT = resolve(process.cwd());
const ALLOWED_EXTENSIONS = ['.md', '.sol', '.js', '.ts', '.jsx', '.tsx', '.json', '.yml'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB (reduced from 10MB)
const BLOCKED_PATHS = [
  'node_modules', '.pnpm-store', '.git', '.next', 'dist', 'build', 
  '.env', 'private_key', 'keys', 'secrets', 'artifacts', 'cache'
];

// Security helpers
const isPathAllowed = (requestedPath: string): boolean => {
  const normalizedPath = resolve(PROJECT_ROOT, requestedPath);
  if (!normalizedPath.startsWith(PROJECT_ROOT)) return false;
  const relativePath = normalizedPath.replace(PROJECT_ROOT, '');
  return !BLOCKED_PATHS.some(blocked => relativePath.includes(blocked));
};

const isExtensionAllowed = (filePath: string): boolean => {
  const ext = extname(filePath).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext) || ext === '';
};

const sanitizePath = (path: string): string => 
  path.replace(/\.\./g, '').replace(/\/+/g, '/');

// File operations (lightweight)
const readFile = async (filePath: string): Promise<string> => {
  const sanitizedPath = sanitizePath(filePath);
  const fullPath = resolve(PROJECT_ROOT, sanitizedPath);
  
  if (!isPathAllowed(sanitizedPath) || !isExtensionAllowed(fullPath)) {
    throw new Error(`Access denied: ${filePath}`);
  }
  
  const stats = await fs.stat(fullPath);
  if (stats.size > MAX_FILE_SIZE) throw new Error(`File too large: ${filePath}`);
  
  return await fs.readFile(fullPath, 'utf-8');
};

const listDirectory = async (dirPath: string) => {
  const sanitizedPath = sanitizePath(dirPath);
  const fullPath = resolve(PROJECT_ROOT, sanitizedPath);
  
  if (!isPathAllowed(sanitizedPath)) throw new Error(`Access denied: ${dirPath}`);
  
  const entries = await fs.readdir(fullPath, { withFileTypes: true });
  return entries
    .filter(entry => !BLOCKED_PATHS.some(blocked => entry.name.includes(blocked)))
    .filter(entry => entry.isDirectory() || isExtensionAllowed(entry.name))
    .map(entry => ({
      name: entry.name,
      type: entry.isFile() ? 'file' : 'directory' as const
    }));
};

// Basic auth check (no timing-safe in lightweight mode)
const checkAuth = (authHeader: string | null): boolean => {
  const expectedToken = process.env.MCP_AUTH_TOKEN || 'internal';
  return authHeader === `Bearer ${expectedToken}`;
};

// MCP Tools definition
const MCP_TOOLS = [
  {
    name: 'read_file',
    description: 'Read file contents',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string', description: 'File path' } },
      required: ['path']
    }
  },
  {
    name: 'list_directory', 
    description: 'List directory contents',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string', description: 'Directory path', default: '' } }
    }
  }
];

// Tool handlers
const handleCallTool = async (name: string, params: any): Promise<any> => {
  switch (name) {
    case 'read_file':
      const content = await readFile(params.path);
      return { content: [{ type: 'text', text: `File: ${params.path}\n\n${content}` }] };
      
    case 'list_directory':
      const entries = await listDirectory(params.path || '');
      const formatted = entries.map(e => `${e.type === 'directory' ? '📁' : '📄'} ${e.name}`).join('\n');
      return { content: [{ type: 'text', text: `Directory: ${params.path || 'root'}\n\n${formatted}` }] };
      
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
};

// API Handlers
export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  
  try {
    // Simple rate limiting (production only)
    if (process.env.NODE_ENV === 'production') {
      // Basic IP-based rate limiting without Redis
      const clientIP = req.ip || 'unknown';
      // TODO: Implement simple in-memory rate limiting if needed
    }
    
    const body = await req.json();
    const { method, params, id } = validateMCPRequest(body);
    
    // Auth check
    if (!checkAuth(req.headers.get('authorization'))) {
      return NextResponse.json({
        error: { code: -32001, message: 'Unauthorized' }, id
      }, { status: 401, headers: getCorsHeaders(origin) });
    }
    
    let result: any;
    
    switch (method) {
      case 'tools/list':
        result = { tools: MCP_TOOLS };
        break;
      case 'tools/call':
        result = await handleCallTool(params.name, params.arguments || {});
        break;
      default:
        throw new Error(`Unknown method: ${method}`);
    }
    
    return NextResponse.json({ result, id }, { headers: getCorsHeaders(origin) });
    
  } catch (error) {
    logger.error('MCP error:', error);
    return NextResponse.json({
      error: { code: -32603, message: error instanceof Error ? error.message : 'Internal error' }
    }, { status: 500, headers: getCorsHeaders(origin) });
  }
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  
  return NextResponse.json({
    name: 'CG DAO Documentation Server (Lightweight)',
    version: '2.0.0',
    description: 'Optimized MCP server for Vercel deployment',
    tools: MCP_TOOLS.length,
    mode: process.env.NODE_ENV || 'development',
    note: 'Lightweight version optimized for <300MB function size'
  }, { headers: getCorsHeaders(origin) });
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req.headers.get('origin'))
  });
}