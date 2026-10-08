import React from 'react';
import {
  Factory,
  UserCheck,
  PlusCircle,
  FileText,
  RotateCcw,
  Settings,
  Printer,
  Calendar,
  Layers,
} from 'lucide-react';
import { TechnicalResponsible } from '../types/index.ts';
import { SenaiLogo } from './SenaiLogo.tsx';

interface HeaderProps {
  technicalResponsible: TechnicalResponsible | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenConfig: () => void;
  onOpenTutorial: () => void;
  onNewOP: () => void;
  onNewOrder: () => void;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  technicalResponsible,
  activeTab,
  onSelectTab,
  onOpenConfig,
  onOpenTutorial,
  onNewOP,
  onNewOrder,
  onResetDemo,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-30 print:hidden">
      {/* Top Banner with Technical Responsible info */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-blue-400 font-semibold tracking-wide">
            <SenaiLogo className="h-4" variant="badge" />
            <span>{technicalResponsible?.companyName || 'SENAI - Serviço Nacional de Aprendizagem Industrial'}</span>
            <span className="text-slate-500 font-normal">| CNPJ: {technicalResponsible?.companyCnpj || '03.795.072/0001-22'}</span>
          </div>
        </div>

        {/* Prominent Technical Responsible Badge (Exigência do Requisito) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={onOpenTutorial}
            title="Abrir o tutorial interativo do sistema"
            className="flex items-center gap-1.5 bg-blue-900/60 hover:bg-blue-800 border border-blue-500 text-blue-200 px-3 py-1 rounded-full font-bold transition cursor-pointer shadow-xs animate-pulse"
          >
            <span>💡</span>
            <span>Tutorial & Guia Rápido</span>
          </button>

          <button
            onClick={onOpenConfig}
            title="Clique para alterar dados da Responsável Técnica"
            className="flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 px-3 py-1 rounded-full font-medium transition cursor-pointer shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Resp. Técnica: <strong>{technicalResponsible?.name || 'Gabriela Cares Souza'}</strong></span>
            {technicalResponsible?.registrationNumber && (
              <span className="text-emerald-400/80 text-[11px] font-mono">({technicalResponsible.registrationNumber})</span>
            )}
          </button>
          
          <button
            onClick={onResetDemo}
            title="Restaurar dados de exemplo da fábrica"
            className="text-slate-400 hover:text-amber-400 flex items-center gap-1 transition text-[11px] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restaurar Demo</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* App Title and SENAI Logo */}
        <div className="flex items-center gap-3">
          <SenaiLogo className="h-9 shadow-md rounded" />
          <div className="h-8 w-px bg-slate-700 mx-1"></div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">PCP Pro</h1>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                PCP & ERP Fabril
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Planejamento e Controle de Produção • Resp. Técnica: <strong>{technicalResponsible?.name || 'Gabriela Cares Souza'}</strong> (SENAI)
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNewOrder}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-2 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-blue-400" />
            <span>Novo Pedido</span>
          </button>

          <button
            onClick={onNewOP}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Nova Ordem (OP)</span>
          </button>

          <button
            onClick={onOpenConfig}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Configurações e Responsável Técnico"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 bg-slate-900 border-t border-slate-800 flex items-center gap-1 overflow-x-auto text-xs font-medium scrollbar-thin">
        {[
          { id: 'dashboard', label: 'Dashboard & Indicadores', icon: '📊' },
          { id: 'production', label: 'Ordens de Produção (OP)', icon: '📋' },
          { id: 'orders', label: 'Pedidos de Clientes', icon: '🛒' },
          { id: 'products', label: 'Fichas Técnicas (BOM)', icon: '⚙️' },
          { id: 'materials', label: 'Matéria-Prima & Estoque', icon: '📦' },
          { id: 'capacity', label: 'Capacidade Produtiva', icon: '🏭' },
          { id: 'partners', label: 'Clientes & Fornecedores', icon: '👥' },
          { id: 'reports', label: 'Relatórios & Desvios', icon: '📑' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-slate-800/60 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
