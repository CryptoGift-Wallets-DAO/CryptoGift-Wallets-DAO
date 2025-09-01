/**
 * 🤖 AGENT SIDEBAR
 * Sidebar integrado para el asesor técnico DAO
 */

'use client';

import React, { useState } from 'react';
import { AgentChat } from '@/components/agent/AgentChat';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  Shield, 
  Database,
  Zap,
  FileText,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentSidebarProps {
  userId?: string;
  defaultCollapsed?: boolean;
  className?: string;
  showQuickStats?: boolean;
}

export function AgentSidebar({ 
  userId, 
  defaultCollapsed = false, 
  className,
  showQuickStats = true 
}: AgentSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isCollapsed) {
    return (
      <div className={cn(
        'w-16 bg-gradient-to-b from-blue-50 to-indigo-50 border-r border-gray-200',
        'flex flex-col items-center py-4',
        className
      )}>
        {/* Collapsed header */}
        <div className="mb-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Status indicators */}
        <div className="space-y-3 mb-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Sistema Online" />
          <div className="w-2 h-2 bg-blue-500 rounded-full" title="DAO Conectado" />
          <div className="w-2 h-2 bg-purple-500 rounded-full" title="Contratos OK" />
        </div>

        <Separator className="w-8 mb-4" />

        {/* Expand button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className="p-2 hover:bg-blue-100"
          title="Expandir Asesor Técnico"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      'w-96 bg-gradient-to-b from-blue-50 to-indigo-50 border-r border-gray-200',
      'flex flex-col h-full',
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b bg-white/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Asesor Técnico CryptoGift
              </h3>
              <p className="text-xs text-gray-600">
                Especialista DAO Operativo
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="p-1.5 hover:bg-blue-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Status badges */}
        <div className="flex items-center space-x-2 flex-wrap gap-1">
          <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
            <Activity className="h-2 w-2 mr-1" />
            Online
          </Badge>
          <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
            <Database className="h-2 w-2 mr-1" />
            DAO OK
          </Badge>
          <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
            <Shield className="h-2 w-2 mr-1" />
            Seguro
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      {showQuickStats && (
        <div className="p-4 space-y-3 border-b bg-white/30">
          <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
            Estado del Sistema
          </h4>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/60 rounded-lg p-2 text-center">
              <div className="text-green-600 font-semibold">2M CGC</div>
              <div className="text-gray-600">Total Supply</div>
            </div>
            <div className="bg-white/60 rounded-lg p-2 text-center">
              <div className="text-blue-600 font-semibold">Base</div>
              <div className="text-gray-600">Mainnet</div>
            </div>
            <div className="bg-white/60 rounded-lg p-2 text-center">
              <div className="text-purple-600 font-semibold">4 Contratos</div>
              <div className="text-gray-600">Desplegados</div>
            </div>
            <div className="bg-white/60 rounded-lg p-2 text-center">
              <div className="text-orange-600 font-semibold">Aragon</div>
              <div className="text-gray-600">DAO Activo</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4 border-b bg-white/20">
        <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-3">
          Acciones Rápidas
        </h4>
        
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-xs h-8 hover:bg-white/60"
          >
            <FileText className="h-3 w-3 mr-2" />
            Revisar CLAUDE.md
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-xs h-8 hover:bg-white/60"
          >
            <Shield className="h-3 w-3 mr-2" />
            Auditar Contratos
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-xs h-8 hover:bg-white/60"
          >
            <Zap className="h-3 w-3 mr-2" />
            Estado del DAO
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-xs h-8 hover:bg-white/60"
          >
            <Settings className="h-3 w-3 mr-2" />
            Configurar EAS
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden">
        <AgentChat
          userId={userId}
          initialMode="technical"
          maxHeight="h-full"
          showHeader={false}
          showModeSelector={false}
          className="border-0 shadow-none bg-transparent"
        />
      </div>
    </div>
  );
}

// Badge component simplificado si no existe
function Badge({ children, variant = 'default', className }: { 
  children: React.ReactNode; 
  variant?: 'default' | 'outline'; 
  className?: string; 
}) {
  const baseClasses = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
  const variants = {
    default: "bg-gray-100 text-gray-800",
    outline: "border bg-background"
  };
  
  return (
    <div className={cn(baseClasses, variants[variant], className)}>
      {children}
    </div>
  );
}