# 📊 Metabase Setup Guide

## Guía Completa de Configuración de Metabase para CryptoGift

Esta guía proporciona instrucciones paso a paso para configurar Metabase y conectarlo a los sistemas de CryptoGift.

---

## 📋 Requisitos Previos

### 1. Ejecutar la Migración de Supabase

Antes de configurar Metabase, ejecuta la migración SQL:

```bash
# Opción A: Desde Supabase Dashboard
# 1. Ve a tu proyecto en app.supabase.com
# 2. SQL Editor → New query
# 3. Copia el contenido de: supabase/migrations/20260122_gift_analytics_system.sql
# 4. Ejecuta la query

# Opción B: Usando Supabase CLI
supabase db push
```

### 2. Configurar Variables de Entorno

Asegúrate de tener estas variables en tu `.env.local`:

```bash
# Supabase (ya deberían existir)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Redis/Upstash (ya deberían existir)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...

# Nuevo: Cron Secret (para el sync job)
CRON_SECRET=your-secure-random-string-here
```

### 3. Verificar Sync API

Después del deploy, verifica que el sync funcione:

```bash
# Verificar status
curl https://your-app.vercel.app/api/analytics/sync

# Ejecutar sync manualmente (con CRON_SECRET)
curl -X POST https://your-app.vercel.app/api/analytics/sync \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🚀 Instalación de Metabase

### Opción A: Metabase Cloud (Recomendado para producción)

1. **Registrarse en Metabase Cloud**
   - Ve a https://www.metabase.com/start/
   - Crea una cuenta con tu email
   - Selecciona el plan (hay trial gratuito de 14 días)

2. **Crear una instancia**
   - Click "Create a new instance"
   - Nombre: `CryptoGift Analytics`
   - Región: Selecciona la más cercana a tu servidor Supabase

### Opción B: Self-Hosted con Docker (Desarrollo/Testing)

```bash
# Crear directorio para datos
mkdir -p ~/metabase-data

# Ejecutar Metabase
docker run -d -p 3001:3000 \
  -v ~/metabase-data:/metabase.db \
  --name metabase \
  metabase/metabase

# Acceder en: http://localhost:3001
```

### Opción C: Deploy en Vercel/Railway

Para una solución serverless, puedes usar:
- **Railway**: https://railway.app/template/metabase
- **Render**: https://render.com/docs/deploy-metabase

---

## 🔌 Conectar Base de Datos

### Paso 1: Obtener Credenciales de Supabase

1. Ve a tu proyecto en https://app.supabase.com
2. Settings → Database
3. Copia los valores de "Connection string":

```
Host: db.YOUR_PROJECT_REF.supabase.co
Database: postgres
Port: 5432
User: postgres
Password: [tu password de proyecto]
```

### Paso 2: Agregar Conexión en Metabase

1. En Metabase, ve a **Admin → Databases → Add database**

2. Configura la conexión:
   - **Database type**: PostgreSQL
   - **Display name**: `CryptoGift DAO - Production`
   - **Host**: `db.YOUR_PROJECT_REF.supabase.co`
   - **Port**: `5432`
   - **Database name**: `postgres`
   - **Username**: `postgres`
   - **Password**: `[tu password]`

3. **Opciones avanzadas**:
   - **SSL**: Enabled (requerido para Supabase)
   - **SSH tunnel**: No
   - **Auto-sync**: Yes (recomendado cada 1 hora)

4. Click "Save" y espera a que se sincronice el schema

### Paso 3: Agregar Segunda Base (si tienes dos proyectos)

Si tienes bases separadas para `cryptogift-wallets` y `cryptogift-wallets-DAO`:

1. Repite el proceso con la segunda conexión
2. Usa nombres descriptivos: `CryptoGift Gifts - Production`

---

## 📈 Crear Dashboards

### Dashboard 1: Gift Funnel Analytics

#### Query: Funnel Diario
```sql
SELECT
  date,
  campaign_id,
  total_created,
  total_viewed,
  total_preclaim,
  total_education,
  total_claimed,
  claim_rate as conversion_rate,
  avg_claim_time_min,
  total_value_usd
FROM mv_gift_funnel_daily
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

#### Visualizaciones Recomendadas:
- **Line Chart**: total_created, total_claimed por fecha
- **Funnel Chart**: Etapas del funnel (created → viewed → preclaim → claimed)
- **Number Card**: Conversion rate total
- **Bar Chart**: Breakdown por campaign_id

### Dashboard 2: Task Operations

#### Query: Operaciones de Tasks
```sql
SELECT
  date,
  domain,
  task_type,
  total_tasks,
  completed,
  completion_rate,
  avg_completion_hours,
  total_rewards_paid
FROM mv_task_operations_daily
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

#### Visualizaciones:
- **Stacked Bar**: Tasks por status y dominio
- **Line Chart**: Completion rate trend
- **Pie Chart**: Distribución por task_type
- **Table**: Top tasks completados

### Dashboard 3: Referral Network

#### Query: Red de Referidos
```sql
SELECT
  date,
  referrer_wallet,
  total_referrals,
  level_1_referrals,
  level_2_referrals,
  level_3_referrals,
  total_clicks,
  total_rewards_earned
FROM mv_referral_network_daily
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY total_rewards_earned DESC;
```

#### Visualizaciones:
- **Leaderboard Table**: Top referrers
- **Stacked Area**: Referrals por nivel
- **Line Chart**: Clicks vs conversiones
- **Number Cards**: Totales de la red

---

## 🔒 Configurar Embedding Seguro

### Paso 1: Habilitar Embedding en Metabase

1. Admin → Settings → Embedding
2. Enable "Standalone Embeds"
3. Copia el **Embedding secret key**

### Paso 2: Crear Vista Pública (CRÍTICO para seguridad)

En lugar de exponer la tabla completa, usa la materialized view:

```sql
-- Esta vista ya está creada en la migración
-- Solo exponer datos agregados, NUNCA datos individuales
SELECT * FROM mv_gift_funnel_daily;
```

### Paso 3: Configurar Locked Parameters

En el dashboard de Metabase:

1. Click en el ícono de compartir del dashboard
2. "Embedding" → "Enable embedding"
3. Para cada filtro sensible:
   - Click "Locked" en lugar de "Editable"
   - Esto previene que usuarios modifiquen los filtros via URL

### Paso 4: Generar URL de Embedding

```typescript
// En tu API o servidor
import jwt from 'jsonwebtoken'

const METABASE_SECRET = process.env.METABASE_EMBEDDING_SECRET

function getEmbeddingUrl(dashboardId: number, params: Record<string, any>) {
  const payload = {
    resource: { dashboard: dashboardId },
    params: params,  // Estos valores quedan LOCKED
    exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 min expiry
  }

  const token = jwt.sign(payload, METABASE_SECRET)

  return `https://your-metabase.com/embed/dashboard/${token}`
}

// Uso
const url = getEmbeddingUrl(1, {
  campaign_id: 'specific_campaign',
  date_range: 'last_30_days'
})
```

---

## 🔄 Refresh de Materialized Views

### Configurar Cron en Supabase

1. Ve a Database → Functions
2. Crea una función scheduled:

```sql
-- Refresh cada hora
SELECT cron.schedule(
  'refresh-analytics-views',
  '0 * * * *',  -- Cada hora
  $$SELECT refresh_analytics_views()$$
);
```

### Alternativamente, usa Edge Function

```typescript
// supabase/functions/refresh-views/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { error } = await supabase.rpc('refresh_analytics_views')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true }))
})
```

---

## 📱 Integrar en tu App

### Componente React para Embedding

```tsx
// components/analytics/MetabaseDashboard.tsx
'use client'

import { useEffect, useState } from 'react'

interface MetabaseDashboardProps {
  dashboardId: number
  params?: Record<string, string>
  height?: number
}

export function MetabaseDashboard({
  dashboardId,
  params = {},
  height = 600
}: MetabaseDashboardProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)

  useEffect(() => {
    // Fetch the signed URL from your API
    fetch('/api/metabase/embed', {
      method: 'POST',
      body: JSON.stringify({ dashboardId, params })
    })
      .then(res => res.json())
      .then(data => setEmbedUrl(data.url))
  }, [dashboardId, params])

  if (!embedUrl) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />
  }

  return (
    <iframe
      src={embedUrl}
      frameBorder={0}
      width="100%"
      height={height}
      allowTransparency
      className="rounded-lg shadow-lg"
    />
  )
}
```

### API Route para Generar Token

```typescript
// app/api/metabase/embed/route.ts
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const METABASE_SECRET = process.env.METABASE_EMBEDDING_SECRET!
const METABASE_SITE_URL = process.env.METABASE_SITE_URL!

export async function POST(request: NextRequest) {
  const { dashboardId, params } = await request.json()

  const payload = {
    resource: { dashboard: dashboardId },
    params: params || {},
    exp: Math.round(Date.now() / 1000) + (10 * 60)
  }

  const token = jwt.sign(payload, METABASE_SECRET)
  const url = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=false&titled=false`

  return NextResponse.json({ url })
}
```

---

## ✅ Checklist Final

- [ ] Migración SQL ejecutada en Supabase
- [ ] Variables de entorno configuradas (CRON_SECRET)
- [ ] Deploy realizado con nuevo vercel.json
- [ ] Sync API funcionando (verificar con GET /api/analytics/sync)
- [ ] Metabase instalado (Cloud o self-hosted)
- [ ] Conexión a Supabase configurada
- [ ] Schema sincronizado en Metabase
- [ ] Dashboard de Gift Funnel creado
- [ ] Dashboard de Task Operations creado
- [ ] Dashboard de Referral Network creado
- [ ] Embedding habilitado (si se requiere)
- [ ] Cron de refresh de views configurado

---

## 🆘 Troubleshooting

### Error: "Connection refused" al conectar Supabase
- Verifica que SSL esté habilitado
- Confirma que la IP de Metabase no esté bloqueada
- Usa el pooler de Supabase si hay límite de conexiones

### Error: "No data" en dashboards
- Verifica que las materialized views tengan datos
- Ejecuta `SELECT refresh_analytics_views()` manualmente
- Revisa que el sync API esté corriendo (check /api/analytics/sync)

### Error: "Embedding not working"
- Verifica el METABASE_EMBEDDING_SECRET
- Confirma que el dashboard tenga embedding habilitado
- Revisa que los parámetros locked coincidan

---

Made by mbxarts.com The Moon in a Box property

Co-Author: Godez22
