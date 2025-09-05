/**
 * Tool Executor - Manual Parallel Tool Calls Handler (2025)
 * 
 * Implements sophisticated tool execution with:
 * - Manual parallel tool calls collection (avoiding AI SDK complexity)
 * - MCP integration with error handling
 * - Timeout management and retry logic
 * - Structured tool definitions with Zod schemas
 * - Comprehensive logging and metrics
 */

import { z } from 'zod';
import type { MCPClient } from './mcp-client';
import type { ToolCall, ToolResult } from './ai-provider';

// ===================================================
// 📋 TOOL DEFINITIONS & SCHEMAS
// ===================================================

export const ToolSchemas = {
  read_project_file: z.object({
    path: z.string().describe('Path to the file to read (e.g., "CLAUDE.md", "contracts/CGCToken.sol")'),
  }),
  
  search_project_files: z.object({
    query: z.string().describe('Text to search for in project files'),
    type: z.enum(['contracts', 'docs', 'governance']).optional().describe('Filter by file type'),
  }),
  
  get_project_overview: z.object({}),
  
  list_directory: z.object({
    path: z.string().optional().describe('Directory path to list (default: root)'),
  }),
};

export type ToolName = keyof typeof ToolSchemas;

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

// ===================================================
// 📊 TOOL EXECUTOR CLASS
// ===================================================

export class ToolExecutor {
  private mcpClient: MCPClient;
  private timeout: number;
  private maxRetries: number;
  private enableLogging: boolean;

  constructor(
    mcpClient: MCPClient,
    options: {
      timeout?: number;
      maxRetries?: number;
      enableLogging?: boolean;
    } = {}
  ) {
    this.mcpClient = mcpClient;
    this.timeout = options.timeout ?? 30000;
    this.maxRetries = options.maxRetries ?? 2;
    this.enableLogging = options.enableLogging ?? (process.env.NODE_ENV === 'development');
  }

  // ===================================================
  // 🛠️ TOOL DEFINITIONS FOR AI MODELS
  // ===================================================

  /**
   * Get OpenAI-compatible tool definitions
   */
  getOpenAITools(): Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: {
        type: 'object';
        properties: Record<string, any>;
        required: string[];
      };
      strict?: boolean;
    };
  }> {
    return [
      {
        type: 'function',
        function: {
          name: 'read_project_file',
          description: 'Read any file from the CryptoGift DAO project using MCP',
          parameters: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the file to read (e.g., "CLAUDE.md", "contracts/CGCToken.sol")'
              }
            },
            required: ['path'],
            additionalProperties: false
          } as any,
          strict: true, // 2025 structured outputs
        }
      },
      {
        type: 'function',
        function: {
          name: 'search_project_files',
          description: 'Search for specific text across all project files using MCP',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Text to search for in project files'
              },
              type: {
                type: 'string',
                enum: ['contracts', 'docs', 'governance'],
                description: 'Filter by file type (optional)'
              }
            },
            required: ['query'],
            additionalProperties: false
          } as any,
          strict: true,
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_project_overview',
          description: 'Get an overview of the project structure and key files',
          parameters: {
            type: 'object',
            properties: {},
            required: [],
            additionalProperties: false
          } as any,
          strict: true,
        }
      },
      {
        type: 'function',
        function: {
          name: 'list_directory',
          description: 'List contents of a directory in the project',
          parameters: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Directory path to list (optional, defaults to root)',
                default: ''
              }
            },
            required: [],
            additionalProperties: false
          } as any,
          strict: true,
        }
      }
    ];
  }

  /**
   * Get Vercel AI SDK v5 compatible tool definitions
   */
  getVercelAITools(): Record<string, any> {
    return {
      read_project_file: {
        description: 'Read any file from the CryptoGift DAO project using MCP',
        parameters: ToolSchemas.read_project_file,
        execute: async ({ path }: { path: string }) => {
          return await this.executeTool('read_project_file', { path });
        },
      },
      
      search_project_files: {
        description: 'Search for specific text across all project files using MCP',
        parameters: ToolSchemas.search_project_files,
        execute: async ({ query, type }: { query: string; type?: string }) => {
          return await this.executeTool('search_project_files', { query, type });
        },
      },
      
      get_project_overview: {
        description: 'Get an overview of the project structure and key files',
        parameters: ToolSchemas.get_project_overview,
        execute: async () => {
          return await this.executeTool('get_project_overview', {});
        },
      },
      
      list_directory: {
        description: 'List contents of a directory in the project',
        parameters: ToolSchemas.list_directory,
        execute: async ({ path }: { path?: string }) => {
          return await this.executeTool('list_directory', { path: path || '' });
        },
      },
    };
  }

  // ===================================================
  // 🔧 TOOL EXECUTION
  // ===================================================

  /**
   * Execute a single tool with error handling and retries
   */
  async executeTool(name: ToolName, arguments_: Record<string, any>): Promise<string> {
    const startTime = Date.now();
    this.log('info', `Executing tool: ${name}`, { arguments: arguments_ });

    // Validate arguments against schema
    try {
      const schema = ToolSchemas[name];
      const validatedArgs = schema.parse(arguments_);
      arguments_ = validatedArgs as Record<string, any>;
    } catch (error) {
      const errorMessage = `Invalid arguments for tool ${name}: ${error instanceof Error ? error.message : 'Unknown validation error'}`;
      this.log('error', errorMessage, { arguments: arguments_ });
      return errorMessage;
    }

    // Execute with timeout and retries
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await Promise.race([
          this.executeToolInternal(name, arguments_),
          new Promise<string>((_, reject) => 
            setTimeout(() => reject(new Error('Tool execution timeout')), this.timeout)
          )
        ]);

        const duration = Date.now() - startTime;
        this.log('info', `Tool executed successfully: ${name}`, { 
          duration, 
          attempt, 
          resultLength: result.length 
        });

        return result;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.log('warn', `Tool execution attempt ${attempt} failed: ${name}`, { 
          error: errorMessage, 
          attempt,
          maxRetries: this.maxRetries 
        });

        if (attempt === this.maxRetries) {
          const finalError = `Tool execution failed after ${this.maxRetries} attempts: ${errorMessage}`;
          this.log('error', finalError, { tool: name, arguments: arguments_ });
          return finalError;
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
    }

    return `Tool execution failed: ${name}`;
  }

  /**
   * Internal tool execution routing
   */
  private async executeToolInternal(name: ToolName, arguments_: Record<string, any>): Promise<string> {
    switch (name) {
      case 'read_project_file':
        return await this.mcpClient.readFile(arguments_.path);

      case 'search_project_files':
        return await this.mcpClient.searchFiles(arguments_.query, arguments_.type);

      case 'get_project_overview':
        return await this.mcpClient.getProjectStructure();

      case 'list_directory':
        return await this.mcpClient.callTool('list_directory', { path: arguments_.path || '' });

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  // ===================================================
  // 🔄 PARALLEL TOOL EXECUTION
  // ===================================================

  /**
   * Execute multiple tools in parallel with proper error isolation
   */
  async executeParallelTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    this.log('info', `Executing ${toolCalls.length} tools in parallel`, { 
      tools: toolCalls.map(tc => tc.function.name) 
    });

    const results = await Promise.allSettled(
      toolCalls.map(async (toolCall): Promise<ToolResult> => {
        try {
          // Parse arguments safely
          let parsedArgs: Record<string, any>;
          try {
            parsedArgs = JSON.parse(toolCall.function.arguments);
          } catch (error) {
            throw new Error(`Invalid JSON arguments: ${toolCall.function.arguments}`);
          }

          const result = await this.executeTool(toolCall.function.name as ToolName, parsedArgs);
          
          return {
            id: toolCall.id,
            name: toolCall.function.name,
            result,
          };

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            id: toolCall.id,
            name: toolCall.function.name,
            result: '',
            error: errorMessage,
          };
        }
      })
    );

    // Process results and handle errors
    const finalResults: ToolResult[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const toolCall = toolCalls[index];
        this.log('error', `Tool execution failed: ${toolCall.function.name}`, { 
          error: result.reason,
          toolCallId: toolCall.id 
        });
        
        return {
          id: toolCall.id,
          name: toolCall.function.name,
          result: '',
          error: result.reason instanceof Error ? result.reason.message : 'Execution failed',
        };
      }
    });

    this.log('info', `Parallel tool execution completed`, {
      total: finalResults.length,
      successful: finalResults.filter(r => !r.error).length,
      failed: finalResults.filter(r => r.error).length,
    });

    return finalResults;
  }

  /**
   * Convert tool results to OpenAI message format
   */
  formatToolResultsForOpenAI(toolResults: ToolResult[]): Array<{
    role: 'tool';
    tool_call_id: string;
    content: string;
  }> {
    return toolResults.map(result => ({
      role: 'tool' as const,
      tool_call_id: result.id,
      content: result.error 
        ? `Error executing ${result.name}: ${result.error}`
        : result.result || `Tool ${result.name} executed successfully (no output)`,
    }));
  }

  // ===================================================
  // 🔍 UTILITY METHODS
  // ===================================================

  /**
   * Safe logging that respects MCP protocol
   */
  private log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (!this.enableLogging) return;
    
    const logData = data ? ` ${JSON.stringify(data)}` : '';
    const logMessage = `[TOOL-EXECUTOR:${level.toUpperCase()}] ${message}${logData}`;
    
    // Always log to stderr to avoid corrupting JSON-RPC stream
    console.error(logMessage);
  }

  /**
   * Get execution statistics
   */
  getStats(): {
    timeout: number;
    maxRetries: number;
    toolsAvailable: number;
  } {
    return {
      timeout: this.timeout,
      maxRetries: this.maxRetries,
      toolsAvailable: Object.keys(ToolSchemas).length,
    };
  }

  /**
   * Test tool availability
   */
  async testTools(): Promise<{ available: string[]; errors: Record<string, string> }> {
    const available: string[] = [];
    const errors: Record<string, string> = {};

    // Test MCP connection first
    try {
      await this.mcpClient.listTools();
    } catch (error) {
      errors.mcp_connection = error instanceof Error ? error.message : 'MCP connection failed';
      return { available, errors };
    }

    // Test each tool with minimal arguments
    const testCases: Record<ToolName, Record<string, any>> = {
      read_project_file: { path: 'CLAUDE.md' },
      search_project_files: { query: 'test' },
      get_project_overview: {},
      list_directory: { path: '' },
    };

    for (const [toolName, args] of Object.entries(testCases)) {
      try {
        await this.executeTool(toolName as ToolName, args);
        available.push(toolName);
      } catch (error) {
        errors[toolName] = error instanceof Error ? error.message : 'Tool test failed';
      }
    }

    return { available, errors };
  }
}

// ===================================================
// 🏗️ FACTORY FUNCTIONS
// ===================================================

/**
 * Create tool executor with MCP client
 */
export function createToolExecutor(mcpClient: MCPClient, options?: {
  timeout?: number;
  maxRetries?: number;
  enableLogging?: boolean;
}): ToolExecutor {
  return new ToolExecutor(mcpClient, options);
}