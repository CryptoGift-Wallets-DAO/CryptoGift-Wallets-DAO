/**
 * AI Provider - Unified OpenAI & Vercel AI SDK v5
 * 
 * Implements best practices for 2025:
 * - Structured Outputs with strict: true
 * - toDataStreamResponse() for proper streaming
 * - maxToolRoundtrips for loop control
 * - Manual parallel tool calls handling
 * - Support for both direct OpenAI and AI SDK patterns
 */

import OpenAI from 'openai';
import { openai } from '@ai-sdk/openai';
import { streamText, generateText, CoreMessage, ToolInvocation } from 'ai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// ===================================================
// 📋 TYPES & INTERFACES
// ===================================================

export interface AIProviderConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  maxToolRoundtrips?: number;
  timeout?: number;
  apiKey?: string;
  enableStructuredOutputs?: boolean;
}

export interface StreamingResponse {
  stream: ReadableStream;
  controller: ReadableStreamDefaultController;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolResult {
  id: string;
  name: string;
  result: string;
  error?: string;
}

export type AIMessage = CoreMessage | ChatCompletionMessageParam;

// ===================================================
// 📊 AI PROVIDER CLASS
// ===================================================

export class AIProvider {
  private openaiClient: OpenAI;
  private config: Required<AIProviderConfig>;

  constructor(config: AIProviderConfig = {}) {
    this.config = {
      model: config.model || process.env.AI_MODEL || 'gpt-4o',
      temperature: config.temperature ?? parseFloat(process.env.AI_TEMPERATURE || '0.7'),
      maxTokens: config.maxTokens ?? parseInt(process.env.MAX_TOKENS || '3000'),
      maxToolRoundtrips: config.maxToolRoundtrips ?? 5,
      timeout: config.timeout ?? 30000,
      apiKey: config.apiKey || process.env.OPENAI_API_KEY || '',
      enableStructuredOutputs: config.enableStructuredOutputs ?? true,
    };

    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    this.openaiClient = new OpenAI({
      apiKey: this.config.apiKey,
    });
  }

  // ===================================================
  // 🔧 DIRECT OPENAI METHODS
  // ===================================================

  /**
   * Direct OpenAI streaming with manual tool calls handling
   * Best for complex tool orchestration and custom streaming logic
   */
  async streamWithOpenAI(
    messages: ChatCompletionMessageParam[],
    tools: Array<OpenAI.Chat.Completions.ChatCompletionTool> = [],
    onToolCall?: (toolCall: ToolCall) => Promise<string>
  ): Promise<{
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
    handleToolCalls: () => Promise<string>;
  }> {
    const stream = await this.openaiClient.chat.completions.create({
      model: this.config.model,
      messages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      stream: true,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: tools.length > 0 ? 'auto' : undefined,
      // Enable structured outputs for function calling
      ...(this.config.enableStructuredOutputs && tools.length > 0 && {
        response_format: { type: 'json_object' }
      }),
    });

    const handleToolCalls = async (): Promise<string> => {
      let fullResponse = '';
      const toolCalls: ToolCall[] = [];
      let currentToolCall: Partial<ToolCall> | null = null;

      // Collect streaming response and tool calls
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        
        // Collect text content
        if (delta?.content) {
          fullResponse += delta.content;
        }

        // Collect tool calls (manual handling for parallel calls)
        if (delta?.tool_calls) {
          for (const toolCall of delta.tool_calls) {
            if (toolCall.index !== undefined) {
              if (!toolCalls[toolCall.index]) {
                toolCalls[toolCall.index] = {
                  id: '',
                  type: 'function',
                  function: { name: '', arguments: '' }
                };
              }

              const tc = toolCalls[toolCall.index];
              if (toolCall.id) tc.id = toolCall.id;
              if (toolCall.function?.name) tc.function.name += toolCall.function.name;
              if (toolCall.function?.arguments) tc.function.arguments += toolCall.function.arguments;
            }
          }
        }
      }

      // Execute tool calls if present and onToolCall handler provided
      if (toolCalls.length > 0 && onToolCall) {
        const toolResults = await Promise.all(
          toolCalls.filter(tc => tc.id && tc.function.name).map(async (toolCall) => {
            try {
              const result = await onToolCall(toolCall);
              return { role: 'tool' as const, tool_call_id: toolCall.id, content: result };
            } catch (error) {
              return { 
                role: 'tool' as const, 
                tool_call_id: toolCall.id, 
                content: `Error: ${error instanceof Error ? error.message : 'Tool execution failed'}` 
              };
            }
          })
        );

        // Second completion with tool results
        if (toolResults.length > 0) {
          const followupMessages: ChatCompletionMessageParam[] = [
            ...messages,
            { role: 'assistant', content: fullResponse, tool_calls: toolCalls },
            ...toolResults,
          ];

          const followupResponse = await this.openaiClient.chat.completions.create({
            model: this.config.model,
            messages: followupMessages,
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens,
            stream: false, // Non-streaming for tool results
          });

          return followupResponse.choices[0]?.message?.content || fullResponse;
        }
      }

      return fullResponse;
    };

    return { stream, handleToolCalls };
  }

  // ===================================================
  // 🚀 VERCEL AI SDK V5 METHODS
  // ===================================================

  /**
   * Vercel AI SDK v5 streamText with tool roundtrips
   * Best for React integration and automatic tool handling
   */
  async streamWithVercelAI(
    messages: CoreMessage[],
    tools: Record<string, any> = {},
    systemPrompt?: string
  ) {
    return await streamText({
      model: openai(this.config.model),
      messages,
      system: systemPrompt,
      temperature: this.config.temperature,
      maxOutputTokens: this.config.maxTokens,
      tools,
      toolChoice: Object.keys(tools).length > 0 ? 'auto' : undefined,
      maxToolRoundtrips: this.config.maxToolRoundtrips,
      
      // 2025 best practice: use stopWhen for agent loop control
      stopWhen: (step) => {
        // Stop if no tool calls in current step (conversation complete)
        return step.toolCalls.length === 0 && step.text.length > 0;
      },

      // Advanced step preparation for context management
      prepareStep: ({ messages, tools, toolChoice }) => ({
        messages: messages.slice(-10), // Keep last 10 messages for context
        tools,
        toolChoice,
      }),
    });
  }

  /**
   * Non-streaming text generation with tools
   */
  async generateWithTools(
    messages: CoreMessage[],
    tools: Record<string, any> = {},
    systemPrompt?: string
  ) {
    return await generateText({
      model: openai(this.config.model),
      messages,
      system: systemPrompt,
      temperature: this.config.temperature,
      maxOutputTokens: this.config.maxTokens,
      tools,
      toolChoice: Object.keys(tools).length > 0 ? 'auto' : undefined,
      maxToolRoundtrips: this.config.maxToolRoundtrips,
    });
  }

  // ===================================================
  // 🛠️ HELPER METHODS
  // ===================================================

  /**
   * Convert OpenAI messages to CoreMessage format
   */
  convertToCoreMessages(messages: ChatCompletionMessageParam[]): CoreMessage[] {
    return messages.map(msg => {
      if (msg.role === 'system') {
        return { role: 'system', content: msg.content as string };
      } else if (msg.role === 'user') {
        return { role: 'user', content: msg.content as string };
      } else if (msg.role === 'assistant') {
        return { role: 'assistant', content: msg.content as string };
      } else {
        return { role: 'user', content: JSON.stringify(msg) };
      }
    });
  }

  /**
   * Convert CoreMessage to OpenAI format
   */
  convertToOpenAIMessages(messages: CoreMessage[]): ChatCompletionMessageParam[] {
    return messages.map(msg => {
      const content = typeof msg.content === 'string' 
        ? msg.content 
        : Array.isArray(msg.content) 
          ? msg.content.map(part => typeof part === 'string' ? part : part.text || '').join('') 
          : '';

      return {
        role: msg.role,
        content,
      } as ChatCompletionMessageParam;
    });
  }

  /**
   * Create streaming response with proper headers (2025 best practice)
   */
  createStreamResponse(stream: ReadableStream, headers: Record<string, string> = {}): Response {
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable Nginx buffering
        ...headers,
      },
    });
  }

  /**
   * Get model configuration info
   */
  getConfig(): Required<AIProviderConfig> {
    return { ...this.config };
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; model: string; error?: string }> {
    try {
      const response = await this.openaiClient.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 10,
      });

      return {
        success: true,
        model: response.model || this.config.model,
      };
    } catch (error) {
      return {
        success: false,
        model: this.config.model,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// ===================================================
// 🏗️ FACTORY FUNCTIONS
// ===================================================

/**
 * Create AI provider with environment-based configuration
 */
export function createAIProvider(config: AIProviderConfig = {}): AIProvider {
  return new AIProvider(config);
}

/**
 * Create AI provider with development defaults
 */
export function createDevAIProvider(): AIProvider {
  return new AIProvider({
    enableStructuredOutputs: true,
    maxToolRoundtrips: 3, // Lower for dev to avoid costs
    temperature: 0.1, // More deterministic for testing
  });
}