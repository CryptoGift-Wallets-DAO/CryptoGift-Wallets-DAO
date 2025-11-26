/**
 * 🤖 AGENT DEMO PAGE
 * Demonstration page for the CG DAO Agent integration
 * Protected with CGC token-based access control
 * 🌐 i18n: Full translation support for EN/ES
 */

'use client';

import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/Navbar';
import { AgentChat } from '@/components/agent/AgentChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CGCAccessGate } from '@/components/auth/CGCAccessGate';
import {
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
  // 🌐 Translation hooks
  const t = useTranslations('agent');

  return (
    <>
      {/* Navbar always visible */}
      <Navbar />

      {/* Token-gated content */}
      <CGCAccessGate
        title={`🤖 ${t('page.accessTitle')}`}
        description={t('page.accessDescription')}
        requiredBalance="0.01"
      >
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/apeX-avatar.png" alt="apeX" />
                    <AvatarFallback className="bg-blue-600 text-white font-bold">aX</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-gray-900">apeX</h1>
                    <span className="text-sm text-gray-500">{t('page.headerTitle')}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Activity className="h-3 w-3 mr-1" />
                  {t('page.liveReady')}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="outline">{t('page.gpt5Thinking')}</Badge>
                <Badge variant="outline">{t('page.mcpEnabled')}</Badge>
                <Badge variant="outline">{t('page.sseStreaming')}</Badge>
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
                  <span>{t('page.interactiveAssistant')}</span>
                </CardTitle>
                <CardDescription>
                  {t('page.chatDescription')}
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
                  <span>{t('features.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Brain className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">{t('features.gpt5Thinking')}</h4>
                    <p className="text-sm text-gray-600">{t('features.gpt5ThinkingDesc')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FileSearch className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">{t('features.documentAccess')}</h4>
                    <p className="text-sm text-gray-600">{t('features.documentAccessDesc')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Globe className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">{t('features.sseStreaming')}</h4>
                    <p className="text-sm text-gray-600">{t('features.sseStreamingDesc')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">{t('features.enterpriseSecurity')}</h4>
                    <p className="text-sm text-gray-600">{t('features.enterpriseSecurityDesc')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contract Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>{t('contracts.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm">{t('contracts.cgcToken')}</h4>
                  <p className="text-xs text-gray-600 font-mono">0x5e3a61b550328f3D8C44f60b3e10a49D3d806175</p>
                  <p className="text-xs text-green-600">{t('contracts.totalSupply')}</p>
                </div>

                <div>
                  <h4 className="font-medium text-sm">{t('contracts.aragonDAO')}</h4>
                  <p className="text-xs text-gray-600 font-mono">0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31</p>
                  <p className="text-xs text-blue-600">{t('contracts.baseMainnet')}</p>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  {t('contracts.viewAllContracts')}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>{t('quickActions.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  📊 {t('quickActions.statusReport')}
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  📜 {t('quickActions.analyzeContracts')}
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  🏛️ {t('quickActions.createProposal')}
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  💰 {t('quickActions.reviewTokenomics')}
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  🔍 {t('quickActions.searchDocs')}
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>{t('systemStatus.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('systemStatus.agentApi')}</span>
                  <Badge variant="outline" className="text-green-700">{t('systemStatus.online')}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('systemStatus.mcpServer')}</span>
                  <Badge variant="outline" className="text-green-700">{t('systemStatus.connected')}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('systemStatus.documentation')}</span>
                  <Badge variant="outline" className="text-blue-700">{t('systemStatus.synced')}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('systemStatus.rateLimits')}</span>
                  <Badge variant="outline" className="text-gray-700">{t('systemStatus.normal')}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Implementation Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🚀 {t('guide.title')}</CardTitle>
            <CardDescription>
              {t('guide.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">{t('guide.step1Title')}</h4>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <code>pnpm add @openai/agents @modelcontextprotocol/server-filesystem</code>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">{t('guide.step2Title')}</h4>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <code>app/api/agent/route.ts</code>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">{t('guide.step3Title')}</h4>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <code>&lt;AgentChat userId=&quot;user123&quot; /&gt;</code>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">{t('guide.envVarsTitle')}</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div><code>OPENAI_API_KEY</code> - {t('guide.envOpenAI')}</div>
                <div><code>UPSTASH_REDIS_REST_URL</code> - {t('guide.envRedisUrl')}</div>
                <div><code>UPSTASH_REDIS_REST_TOKEN</code> - {t('guide.envRedisToken')}</div>
                <div><code>MCP_AUTH_TOKEN</code> - {t('guide.envMcpAuth')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </div>
      </CGCAccessGate>
    </>
  );
}

