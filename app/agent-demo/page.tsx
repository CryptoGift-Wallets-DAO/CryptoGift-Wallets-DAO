/**
 * 🎯 DEMO PAGE - Nuevo Sistema de Agente con Vercel AI SDK
 * 
 * Esta página demuestra cómo usar el nuevo sistema migrado
 */

'use client';

import { useAgent } from '@/lib/agent/useAgent-v2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AgentDemoPage() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    askAboutContract,
    searchDocumentation,
  } = useAgent({
    mode: 'technical',
    userId: 'demo-user',
  });

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🤖 CG DAO Agent V2 - Demo</span>
            <div className="flex gap-2">
              <Badge variant="secondary">Vercel AI SDK</Badge>
              <Badge variant="secondary">Streaming</Badge>
              <Badge variant="secondary">Rate Limited</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => askAboutContract('0x5e3a61b550328f3D8C44f60b3e10a49D3d806175')}
            >
              📜 Analizar CGC Token
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => searchDocumentation('Aragon DAO integration')}
            >
              🔍 Buscar en Docs
            </Button>
          </div>

          {/* Messages */}
          <div className="border rounded-lg p-4 h-96 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>💬 Inicia una conversación con el agente</p>
                <p className="text-sm mt-2">Usa los botones rápidos o escribe tu pregunta</p>
              </div>
            ) : (
              messages.map((message, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-50 ml-8' 
                      : 'bg-gray-50 mr-8'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">
                    {message.role === 'user' ? '👤 Usuario' : '🤖 Agente'}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="text-center text-gray-500">
                <span className="animate-pulse">🤖 Pensando...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Pregunta sobre el DAO, contratos, o gobernanza..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '⏳' : '📤'} Enviar
            </Button>
          </form>

          {/* Status */}
          <div className="text-xs text-gray-500 flex justify-between">
            <span>API: /api/agent-v2</span>
            <span>Modelo: o3-mini (reasoning)</span>
            <span>{messages.length} mensajes</span>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📚 Instrucciones de Uso</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <h4>Sistema Migrado - Características:</h4>
          <ul>
            <li>✅ <strong>Streaming optimizado</strong> con Vercel AI SDK</li>
            <li>✅ <strong>POST-only</strong> - No más conflictos GET/POST</li>
            <li>✅ <strong>Rate limiting</strong> con Upstash</li>
            <li>✅ <strong>Type-safe</strong> con TypeScript</li>
            <li>✅ <strong>Sin secretos hardcodeados</strong></li>
          </ul>
          
          <h4>Variables de Entorno Requeridas:</h4>
          <pre className="bg-gray-100 p-2 rounded text-xs">
{`UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
AI_MODEL=gpt-4o
OPENAI_API_KEY=sk-...`}
          </pre>
          
          <h4>Próximos Pasos:</h4>
          <ol>
            <li>FASE 2: Integración MCP oficial</li>
            <li>FASE 3: Realtime Voice API (token efímero)</li>
            <li>FASE 4: Production hardening</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}