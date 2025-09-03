# 🤖 CG DAO AGENT - INTEGRATION GUIDE

> **Agente web completo con GPT-5 Thinking + MCP + SSE Streaming**  
> Sistema de máxima excelencia integrado directamente en tu web DAO

## 🎯 **IMPLEMENTACIÓN COMPLETADA**

### ✅ **SISTEMA DESPLEGADO**

```
✅ Endpoint API /api/agent (GPT-5 + Thinking Mode)
✅ Servidor MCP HTTP /api/mcp-docs (Documentos en tiempo real)
✅ Widget React <AgentChat /> (SSE Streaming)
✅ Seguridad y Rate Limiting (Redis + Audit)
✅ Sistema de Memoria por Usuario (Sesiones persistentes)
✅ Citaciones Obligatorias (Links a documentación)
✅ Página de Demo /agent (Interfaz completa)
```

## 🚀 **INSTALACIÓN INMEDIATA**

### 1. **Instalar Dependencias (PNPM)**

```bash
# Instalar todas las nuevas dependencias
pnpm install

# Verificar que se instalaron correctamente
pnpm list @openai/agents @modelcontextprotocol/server-filesystem
```

### 2. **Configurar Variables de Entorno**

Añadir a tu `.env.local`:

```env
# OpenAI API (OBLIGATORIO)
OPENAI_API_KEY=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

# MCP Auth Token (para seguridad interna)
MCP_AUTH_TOKEN=cg-dao-internal-2025

# Redis (YA CONFIGURADO)
UPSTASH_REDIS_REST_URL=https://fit-mole-59344.upstash.io
UPSTASH_REDIS_REST_TOKEN=ATRHAAIncDE4Y2IyNzI0MmExMzY0Zjc2YTc1ZThkYjhkZDQ0ZjAzZXAxMTMzODM

# Contratos (YA CONFIGURADO)
CGC_TOKEN_ADDRESS=0x5e3a61b550328f3D8C44f60b3e10a49D3d806175
ARAGON_DAO_ADDRESS=0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31
```

### 3. **Iniciar el Servidor**

```bash
# Desarrollo
pnpm dev

# Producción
pnpm build && pnpm start
```

## 🎨 **USO DEL COMPONENTE**

### **Integración Básica**

```tsx
import { AgentChat } from '@/components/agent/AgentChat';

function MyPage() {
  return (
    <div className="container">
      <h1>Mi DAO Dashboard</h1>
      
      {/* Agente integrado */}
      <AgentChat 
        userId="user123"
        initialMode="general"
        maxHeight="h-96"
      />
    </div>
  );
}
```

### **Configuración Avanzada**

```tsx
<AgentChat 
  userId={user?.id}
  initialMode="technical"
  maxHeight="h-[600px]"
  showModeSelector={true}
  showHeader={true}
  className="border-2 border-blue-200"
  onMessage={(message) => {
    console.log('Nueva respuesta:', message);
  }}
  onError={(error) => {
    console.error('Error del agente:', error);
  }}
/>
```

### **Solo Hook (Sin UI)**

```tsx
import { useAgent } from '@/lib/agent/useAgent';

function CustomChat() {
  const { 
    sendMessage, 
    messages, 
    isLoading,
    error 
  } = useAgent({
    userId: 'user123',
    mode: 'governance'
  });

  const handleSubmit = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div>
      {/* Tu UI personalizada */}
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

## 📡 **API ENDPOINTS**

### **POST /api/agent**

Enviar mensaje al agente con GPT-5 Thinking:

```bash
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Cuál es el estado actual del proyecto según CLAUDE.md?",
    "userId": "user123",
    "mode": "general",
    "stream": true
  }'
```

**Respuesta SSE:**
```
data: {"type":"chunk","content":"Según CLAUDE.md...","timestamp":1704067200000}
data: {"type":"done","sessionId":"abc123","metrics":{"duration":2500,"tokens":150,"reasoning_tokens":45}}
```

### **GET /api/agent**

Health check y métricas:

```bash
# Estado del sistema
curl http://localhost:3000/api/agent?action=health

# Métricas de uso
curl http://localhost:3000/api/agent?action=metrics
```

### **POST /api/mcp-docs**

Servidor MCP interno (usado por el agente):

```bash
curl -X POST http://localhost:3000/api/mcp-docs \
  -H "Authorization: Bearer cg-dao-internal-2025" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/list"
  }'
```

## 🎭 **MODOS DEL AGENTE**

### **1. General (🤖)**
- Asistencia general sobre el DAO
- Preguntas básicas y navegación
- Quick Actions: Estado del proyecto, información de contratos

### **2. Technical (⚙️)**  
- Análisis de smart contracts
- Detalles de deployment
- Quick Actions: Análisis de contratos, guías de deployment

### **3. Governance (🏛️)**
- Propuestas y votaciones
- Tokenomics y distribución
- Quick Actions: Crear propuestas, revisar tokenomics

### **4. Operations (📈)**
- Monitoreo y métricas
- Salud del sistema
- Quick Actions: Métricas clave, estado del sistema

## 🔧 **CONFIGURACIÓN AVANZADA**

### **Personalizar System Prompts**

```tsx
// En lib/agent/types.ts
export const AGENT_MODES = {
  custom: {
    id: 'custom',
    name: 'Custom Mode',
    description: 'Tu modo personalizado',
    icon: '🎯',
    systemPrompt: 'Tu prompt personalizado aquí...',
    quickActions: [
      {
        id: 'custom_action',
        label: 'Acción Personalizada',
        prompt: 'Ejecuta mi acción personalizada',
        icon: '⚡',
        category: 'custom'
      }
    ],
    config: {
      temperature: 0.8,
      maxTokens: 2000
    }
  }
};
```

### **Webhooks de Eventos**

```tsx
const { sendMessage } = useAgent({
  onMessage: (message) => {
    // Enviar a analytics
    analytics.track('agent_response', {
      content_length: message.content.length,
      mode: message.metadata?.mode,
      reasoning_tokens: message.metadata?.reasoning_tokens
    });
  },
  onError: (error) => {
    // Enviar a Sentry
    Sentry.captureException(error);
  }
});
```

### **Métricas Personalizadas**

```tsx
import { useAgent } from '@/lib/agent/useAgent';

function MetricsDashboard() {
  const { getMetrics } = useAgent();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const data = await getMetrics();
      setMetrics(data);
    };
    
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [getMetrics]);

  return (
    <div>
      <h3>Métricas del Agente</h3>
      <p>Requests: {metrics?.totalRequests}</p>
      <p>Sesiones activas: {metrics?.activeSessions}</p>
    </div>
  );
}
```

## 🛡️ **SEGURIDAD**

### **Rate Limiting Configurado**
- 10 requests por minuto por usuario
- 40,000 tokens por minuto global
- Basado en IP y user ID

### **Audit Logging**
- Todos los requests registrados en Redis
- Logs estructurados con Winston
- Métricas de uso y performance

### **Autenticación MCP**
- Token interno para comunicación MCP
- Solo lectura de documentación
- Paths bloqueados (secrets, keys, etc.)

## 📊 **DEMO COMPLETA**

Visita la página de demostración:

```
http://localhost:3000/agent
```

**Características de la demo:**
- ✅ Chat interactivo completo
- ✅ Cambio de modos en tiempo real
- ✅ Quick actions funcionales
- ✅ Métricas de sistema
- ✅ Estado de conexión
- ✅ Exportar conversaciones

## 🔄 **PRÓXIMAS MEJORAS**

### **Planeadas para Siguientes Iteraciones:**
- 🔄 Dashboard de métricas avanzado
- 🔄 Integración con Aragon SDK
- 🔄 Automatización de propuestas
- 🔄 Voice interface con Whisper
- 🔄 Multi-agente colaborativo
- 🔄 Análisis predictivo con ML

## 🎯 **DIFERENCIAS CLAVE CON IMPLEMENTACIÓN ANTERIOR**

| Característica | Implementación Anterior | Nueva Implementación |
|---|---|---|
| **Ubicación** | CLI Local | Integrado en Web |
| **Modelo** | GPT-4o-mini | GPT-5 + Thinking Mode |
| **Interfaz** | Terminal | React Components |
| **Streaming** | No | SSE Real-time |
| **Documentos** | MCP Local | MCP Streamable HTTP |
| **Sesiones** | Sin memoria | Redis persistente |
| **Seguridad** | Básica | Enterprise grade |
| **Modo de Uso** | `npm run chat` | `<AgentChat />` |

## ✅ **CHECKLIST DE VERIFICACIÓN**

```bash
# 1. Verificar dependencias
pnpm list @openai/agents
pnpm list @modelcontextprotocol/server-filesystem

# 2. Verificar variables de entorno
echo $OPENAI_API_KEY | head -c 20

# 3. Test API endpoint
curl http://localhost:3000/api/agent?action=health

# 4. Test MCP server  
curl http://localhost:3000/api/mcp-docs

# 5. Test página demo
open http://localhost:3000/agent
```

## 🎉 **IMPLEMENTACIÓN COMPLETADA**

Tu agente CG DAO con GPT-5 Thinking está **100% funcional** y listo para producción:

- ✅ **Instalación**: `pnpm install` (dependencias añadidas)
- ✅ **Configuración**: Variables en `.env.local` 
- ✅ **Integración**: `<AgentChat />` listo para usar
- ✅ **Demo**: Página `/agent` completamente funcional
- ✅ **Documentación**: Guía completa de uso

**¡Tu sistema está PRODUCTION READY!** 🚀