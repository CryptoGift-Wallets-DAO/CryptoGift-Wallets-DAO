# 🤖 CG DAO OPS Agent

> **Agente inteligente local para operaciones del CryptoGift DAO**  
> Acceso en tiempo real a documentación local con OpenAI SDK + MCP Filesystem

## 🌟 Características Principales

### 🔍 **Acceso en Tiempo Real**
- Lee documentación local sin re-subidas
- Búsqueda instantánea en todos los archivos del proyecto
- Análisis contextual de contratos y configuraciones

### 🛡️ **Seguridad Máxima**
- **Modo Solo-Lectura**: No puede modificar archivos
- **Directorios en Lista Blanca**: Solo accede a rutas autorizadas
- **Audit Logging**: Registro de todas las operaciones
- **Filtrado de Herramientas**: Bloqueo de operaciones de escritura

### 🎯 **Funcionalidades DAO**
- **Análisis de Contratos**: Estado y métricas en Base Mainnet
- **Generación de Propuestas**: Templates para Aragon DAO
- **Monitoreo en Tiempo Real**: Alertas y eventos críticos
- **Asistencia Operacional**: Guías y troubleshooting

### 💬 **Interfaces Múltiples**
- **Chat Interactivo**: Conversación natural con el agente
- **Monitor de Contratos**: Dashboard de métricas en vivo
- **API Programática**: Integración en workflows
- **Modo Servicio**: Ejecución como daemon

## 🚀 Instalación Rápida

### Prerrequisitos
- Node.js 18+ 
- OpenAI API Key
- Proyecto CryptoGift DAO local

### Setup en 3 Pasos

```bash
# 1. Clonar/Navegar al proyecto
cd cryptogift-wallets-DAO/cg-dao-agent

# 2. Instalar dependencias
npm install

# 3. Configurar entorno
cp .env.example .env
# Editar .env con tu OPENAI_API_KEY y rutas
```

## ⚙️ Configuración

### `.env` Mínimo Requerido

```env
# OpenAI (Obligatorio)
OPENAI_API_KEY=sk-proj-xxxxx

# Ruta a documentación (usar ruta absoluta)
DOCS_DIR=C:\Users\rafae\cryptogift-wallets-DAO

# Modelo (opcional, default: gpt-4o-mini)
AGENT_MODEL=gpt-4o-mini

# Seguridad (recomendado dejar en true)
ENABLE_WRITE_PROTECTION=true
```

### Configuración Completa

```env
# Ver .env.example para todas las opciones disponibles:
# - Rate limiting
# - Logging avanzado
# - Integración con Discord/Slack
# - Monitoreo de contratos
# - Y más...
```

## 🎮 Uso

### 📝 Modo Chat Interactivo

```bash
npm run chat
```

**Comandos disponibles:**
- `/help` - Mostrar ayuda
- `/contracts` - Ver contratos desplegados
- `/status` - Estado del proyecto
- `/search <term>` - Buscar en documentación
- `/analyze` - Análisis completo
- `/proposal` - Generar propuesta Aragon
- `/tokenomics` - Ver distribución de tokens
- `/deployment` - Guía de deployment
- `/exit` - Salir

**Ejemplo de uso:**
```
You: ¿Cuál es el estado actual del proyecto según CLAUDE.md?

🤖 Agent: Según CLAUDE.md, el proyecto está en fase PRODUCTION READY...

You: /search EIP-712

🤖 Agent: Encontré 15 referencias a EIP-712 en los siguientes archivos...

You: Genera una propuesta para distribuir 100K tokens

🤖 Agent: Aquí está el template de propuesta para Aragon DAO...
```

### 📊 Monitor de Contratos

```bash
# Monitoreo continuo (cada 5 minutos)
npm run monitor

# Chequeo único
npm run monitor -- --once

# Generar reporte
npm run monitor -- --report

# Intervalo personalizado (cron format)
npm run monitor -- --interval="*/10 * * * *"
```

**Métricas monitoreadas:**
- Total Supply & Circulating Supply
- Tokens en Escrow
- Estado de contratos (pausado/activo)
- Transferencias recientes
- Eventos críticos y alertas

### 🤖 Modo Programático

```javascript
import { CGDAOAgent } from './src/agent.mjs';

// Inicializar agente
const agent = new CGDAOAgent(CONFIG);
await agent.initialize();

// Hacer consulta
const response = await agent.processQuery(
  "¿Cuáles son los próximos pasos según DEVELOPMENT.md?"
);

console.log(response);

// Limpiar recursos
await agent.cleanup();
```

### 🔧 Test Rápido

```bash
# Ejecutar agente con query de ejemplo
npm start

# Test completo
npm test
```

## 🏗️ Arquitectura

### Componentes Principales

```
cg-dao-agent/
├── src/
│   ├── agent.mjs           # Core del agente con MCP
│   ├── chat-interface.mjs  # Interface de chat interactivo
│   ├── monitor.mjs         # Monitor de contratos
│   └── proposal-assistant.mjs # Generador de propuestas
├── scripts/
│   ├── setup.mjs           # Script de configuración inicial
│   └── install-service.mjs # Instalador de servicio
├── .env.example            # Template de configuración
└── package.json           # Dependencias y scripts
```

### Flujo de Datos

```
Usuario → Query → Agent → OpenAI API
                    ↓
              MCP Server (stdio)
                    ↓
            Filesystem (read-only)
                    ↓
              Local Docs (.md, .sol, .js)
```

### Seguridad en Capas

1. **MCP Server**: Solo rutas en lista blanca
2. **Tool Filtering**: Bloqueo de write/edit/delete
3. **Audit Logging**: Registro de todas las operaciones
4. **Rate Limiting**: Control de uso de API
5. **Environment Isolation**: Claves en .env, nunca en código

## 🛠️ Características Avanzadas

### 🔄 Ejecución como Servicio

#### Linux (systemd)
```bash
npm run service:install
sudo systemctl start cg-dao-agent
```

#### Windows (Task Scheduler)
```bash
npm run service:install
# Seguir instrucciones en pantalla
```

#### macOS (launchd)
```bash
npm run service:install
launchctl start com.cgift.agent
```

### 📡 Webhooks y Notificaciones

Configure en `.env`:
```env
# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_ENABLED=true

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_ENABLED=true
```

### 📊 Métricas y Logs

```bash
# Ver logs en tiempo real
tail -f logs/agent.log

# Análisis de uso
npm run metrics

# Exportar logs
npm run export-logs -- --from="2025-01-31" --to="2025-02-01"
```

## 🔍 Casos de Uso

### 1. Análisis Diario del Proyecto
```bash
npm run chat
> /analyze
> /status
> /contracts
```

### 2. Preparación de Propuesta DAO
```bash
npm run chat
> /proposal
> [Seleccionar tipo: Token Distribution]
> [Agent genera template completo]
```

### 3. Debugging de Contratos
```bash
npm run chat
> Muéstrame la implementación de TaskRulesEIP712
> ¿Qué hace la función calculateReward?
> Busca todos los lugares donde se usa EIP-712
```

### 4. Monitoreo 24/7
```bash
# En servidor/VPS
npm run service:install
npm run service:start
```

## 🚨 Troubleshooting

### Error: "OPENAI_API_KEY is required"
```bash
# Verificar que .env existe y tiene la key
cat .env | grep OPENAI_API_KEY
```

### Error: "MCP Server startup timeout"
```bash
# Aumentar timeout en .env
MCP_SERVER_TIMEOUT=60000
```

### Error: "Docs directory not found"
```bash
# Usar ruta absoluta en .env
# Windows: C:\\Users\\user\\project
# Linux/Mac: /home/user/project
```

## 📈 Roadmap

### ✅ Completado
- [x] Agente base con OpenAI SDK
- [x] Integración MCP Filesystem
- [x] Modo solo-lectura con filtros
- [x] Chat interactivo
- [x] Monitor de contratos
- [x] Generación de propuestas

### 🔄 En Progreso
- [ ] API REST para integración externa
- [ ] Dashboard web
- [ ] Análisis predictivo con ML

### 📅 Próximamente
- [ ] Integración con Aragon SDK
- [ ] Automatización de tareas recurrentes
- [ ] Multi-agente para tareas complejas
- [ ] Voice interface con Whisper

## 🤝 Contribuir

1. Fork el repositorio
2. Crear feature branch (`git checkout -b feature/amazing`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing`)
5. Abrir Pull Request

## 📄 Licencia

MIT - Ver [LICENSE](LICENSE) para detalles

## 🔗 Links Útiles

- [CryptoGift DAO](https://dao.cryptogift.com)
- [Documentación OpenAI](https://platform.openai.com/docs)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Base Network](https://base.org)
- [Aragon DAO](https://aragon.org)

## 💬 Soporte

- **Issues**: [GitHub Issues](https://github.com/CryptoGift-Wallets-DAO/cg-dao-agent/issues)
- **Discord**: [CryptoGift Discord](https://discord.gg/cryptogift)
- **Email**: dao@cryptogift.com

---

**Built with ❤️ by CryptoGift DAO Team**

*Powered by OpenAI GPT-4 + Model Context Protocol*