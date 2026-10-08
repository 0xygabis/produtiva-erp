import React from 'react';
import {
  Activity,
  Layers,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  Package,
  ShoppingCart,
  UserCheck,
  Play,
  ArrowRight,
  Printer,
  ChevronRight,
} from 'lucide-react';
import {
  DashboardReportData,
  ProductionOrder,
  WorkSector,
  TechnicalResponsible,
} from '../types/index.ts';
import { SenaiLogo } from './SenaiLogo.tsx';

interface DashboardViewProps {
  metrics: DashboardReportData | null;
  recentOrders: ProductionOrder[];
  sectors: WorkSector[];
  technicalResponsible: TechnicalResponsible | null;
  onNavigate: (tab: string) => void;
  onSelectOPForTracking: (op: ProductionOrder) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  recentOrders,
  sectors,
  technicalResponsible,
  onNavigate,
  onSelectOPForTracking,
}) => {
  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Technical Responsible */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-700/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <SenaiLogo className="h-11 shadow-md rounded mt-1" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-500/20 text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-blue-500/30">
                PCP SENAI
              </span>
              <span className="text-slate-400 text-xs">Visão Geral da Fábrica</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Planejamento e Controle de Produção
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Gestão integrada de fichas técnicas, insumos, tempos e rastreabilidade • SENAI
            </p>
          </div>
        </div>

        {/* Technical Responsible Highlight Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-xl flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg text-slate-950 font-bold">
            <UserCheck className="w-5 h-5 text-slate-950" />
          </div>
          <div className="text-xs">
            <span className="text-emerald-300 font-bold uppercase tracking-wider block text-[10px]">
              Responsável Técnico Titular
            </span>
            <span className="font-bold text-white text-sm block">
              {technicalResponsible?.name || 'Não informado'}
            </span>
            <span className="text-slate-300 font-mono text-[11px]">
              {technicalResponsible?.registrationNumber || 'CREA / Matrícula'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: OPs em Andamento */}
        <div
          onClick={() => onNavigate('production')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              OPs em Andamento
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-2">
            {metrics?.inProgressOps ?? 0}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold mt-2">
            <span>+{metrics?.openOps ?? 0} abertas na fila</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: OPs Concluídas */}
        <div
          onClick={() => onNavigate('production')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-500 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              OPs Concluídas
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-900 font-mono mt-2">
            {metrics?.completedOps ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            Total finalizado com baixa de estoque
          </div>
        </div>

        {/* Card 3: Eficiência Operacional */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-500 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Eficiência (Prev. vs Real)
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-950 font-mono mt-2 flex items-baseline gap-1">
            <span>{metrics?.globalEfficiency ?? 100}%</span>
            <span className="text-xs text-slate-500 font-normal">produtividade</span>
          </div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            Lead time médio da fábrica
          </div>
        </div>

        {/* Card 4: Estoque Crítico */}
        <div
          onClick={() => onNavigate('materials')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-500 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Insumos Críticos
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono mt-2 text-amber-900">
            {metrics?.criticalMaterialsCount ?? 0}
          </div>
          <div className="text-xs text-amber-700 font-semibold mt-2 flex items-center gap-1">
            <span>Reposição necessária</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Live Production Tracking + Capacity Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ordens em Andamento no Chão de Fábrica (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Acompanhamento em Chão de Fábrica (Tempo Real)
              </h3>
              <p className="text-xs text-slate-500">
                Ordens com apontamento ativo de etapas e cronômetro
              </p>
            </div>
            <button
              onClick={() => onNavigate('production')}
              className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Todas OPs</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                Nenhuma ordem de produção ativa no momento.
              </div>
            ) : (
              recentOrders.slice(0, 4).map((op) => {
                const completedSteps = op.steps.filter((s) => s.status === 'CONCLUIDO').length;
                const totalSteps = op.steps.length;
                const percent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
                const activeStep = op.steps.find((s) => s.status === 'EM_ANDAMENTO');

                return (
                  <div
                    key={op.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-900 text-xs">{op.code}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {op.quantityToProduce} UN
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs mt-0.5">{op.productName}</h4>
                      </div>

                      <button
                        onClick={() => onSelectOPForTracking(op)}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Apontar</span>
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                        <span>
                          {activeStep ? (
                            <strong className="text-blue-700">Em execução: {activeStep.stepName}</strong>
                          ) : (
                            `${completedSteps} de ${totalSteps} etapas concluídas`
                          )}
                        </span>
                        <span className="font-mono font-bold">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Destino: {op.customerName || 'Estoque'}</span>
                      <span>Prazo: {formatDate(op.deliveryDatePlanned)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Ocupação dos Setores & Detecção de Gargalos (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Carga vs Capacidade Fabril
              </h3>
              <p className="text-xs text-slate-500">
                Ocupação horária dos setores nas OPs ativas
              </p>
            </div>
            <button
              onClick={() => onNavigate('capacity')}
              className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Ajustar Setores</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3.5">
            {sectors.slice(0, 5).map((sec) => {
              const occupancy = sec.occupancyRate || 0;
              const isBottleneck = occupancy >= 90;

              return (
                <div key={sec.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{sec.name}</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-[11px] text-slate-500">
                        {sec.allocatedHours}h / {sec.weeklyEffectiveHours}h
                      </span>
                      <span
                        className={`font-bold text-[11px] ${
                          isBottleneck ? 'text-red-600' : 'text-slate-800'
                        }`}
                      >
                        {occupancy}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all ${
                        occupancy >= 90
                          ? 'bg-red-500'
                          : occupancy >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, occupancy)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-800 block mb-0.5">Indicador do PCP:</span>
            O balanceamento de carga permite remanejar operadores antes que o setor atinja 100% de ocupação e gere atrasos nos pedidos.
          </div>
        </div>
      </div>
    </div>
  );
};
