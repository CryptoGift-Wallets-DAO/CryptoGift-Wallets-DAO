/**
 * 🤖 AGENT DEMO PAGE
 * Demonstration page for the CG DAO Agent integration
 */

'use client';

import { AgentChat } from '@/components/agent/AgentChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Zap, 
  Shield, 
  Globe, 
  Database, 
  Activity,
  MessageSquare,
  Settings,
  FileSearch,
  Brain
} from 'lucide-react';

export default function AgentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bot className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">CG DAO Agent</h1>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Activity className="h-3 w-3 mr-1" />
                Live & Ready
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline">GPT-5 Thinking</Badge>
              <Badge variant="outline">MCP Enabled</Badge>
              <Badge variant="outline">SSE Streaming</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Interactive Assistant</span>
                </CardTitle>
                <CardDescription>
                  Chat with your intelligent DAO assistant powered by GPT-5 with real-time document access
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <AgentChat 
                  className="border-0 shadow-none"
                  maxHeight="h-[600px]"
                  showHeader={false}
                />
              </CardContent>
            </Card>
          </div>

          {/* Features & Info */}
          <div className="space-y-6">
            
            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Key Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Brain className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">GPT-5 Thinking Mode</h4>
                    <p className="text-sm text-gray-600">Advanced reasoning with chain-of-thought processing</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <FileSearch className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Real-time Document Access</h4>
                    <p className="text-sm text-gray-600">Live access to all DAO documentation via MCP</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Globe className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">SSE Streaming</h4>
                    <p className="text-sm text-gray-600">Real-time streaming responses for instant feedback</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Enterprise Security</h4>
                    <p className="text-sm text-gray-600">Rate limiting, audit logging, and access control</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contract Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Live Contract Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm">CGC Token</h4>
                  <p className="text-xs text-gray-600 font-mono">0x5e3a61b550328f3D8C44f60b3e10a49D3d806175</p>
                  <p className="text-xs text-green-600">2M Total Supply</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm">Aragon DAO</h4>
                  <p className="text-xs text-gray-600 font-mono">0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31</p>
                  <p className="text-xs text-blue-600">Base Mainnet</p>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  View All Contracts
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  📊 Project Status Report
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  📜 Analyze Smart Contracts
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  🏛️ Create DAO Proposal
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  💰 Review Tokenomics
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  🔍 Search Documentation
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Agent API</span>
                  <Badge variant="outline" className="text-green-700">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">MCP Server</span>
                  <Badge variant="outline" className="text-green-700">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Documentation</span>
                  <Badge variant="outline" className="text-blue-700">Synced</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rate Limits</span>
                  <Badge variant="outline" className="text-gray-700">Normal</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Implementation Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🚀 Integration Guide</CardTitle>
            <CardDescription>
              How to integrate this agent into your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">1. Install Dependencies</h4>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <code>pnpm add @openai/agents @modelcontextprotocol/server-filesystem</code>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">2. Add API Endpoint</h4>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <code>app/api/agent/route.ts</code>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">3. Use React Component</h4>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <code>&lt;AgentChat userId=&quot;user123&quot; /&gt;</code>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium mb-3">Environment Variables Required:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div><code>OPENAI_API_KEY</code> - Your OpenAI API key</div>
                <div><code>UPSTASH_REDIS_REST_URL</code> - Redis URL for session storage</div>
                <div><code>UPSTASH_REDIS_REST_TOKEN</code> - Redis token</div>
                <div><code>MCP_AUTH_TOKEN</code> - Internal auth token for MCP server</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

