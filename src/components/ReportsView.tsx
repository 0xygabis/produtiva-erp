import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  Calendar,
  Layers,
  UserCheck,
  Package,
} from 'lucide-react';
import {
  ProductionOrder,
  Material,
  WorkSector,
  TechnicalResponsible,
} from '../types/index.ts';
import { SenaiLogo } from './SenaiLogo.tsx';

interface ReportsViewProps {
  orders: ProductionOrder[];
  materials: Material[];
  sectors: WorkSector[];
  technicalResponsible: TechnicalResponsible | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  materials,
  sectors,
  technicalResponsible,
}) => {
  const [reportType, setReportType] = useState<'production' | 'variance' | 'stock' | 'capacity'>('production');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const handlePrintReport = () => {
    window.print();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const filteredOrders = orders.filter((op) => {
    if (statusFilter === 'ALL') return true;
    return op.status === statusFilter;
  });

  const criticalMaterials = materials.filter((m) => m.currentStock <= m.minStock);

  return (
    <div className="space-y-6">
      {/* Top Banner (Hidden in print) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Relatórios Gerenciais de Produção (PCP)</h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono font-semibold">
              Auditoria & Análise
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Acompanhamento de status das ordens, desvios de tempo real vs padrão e posições críticas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-lg text-xs font-medium">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>Resp. Técnica: <strong>{technicalResponsible?.name || 'Gabriela Cares Souza'}</strong></span>
          </div>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs (Hidden in print) */}
      <div className="flex items-center gap-2 overflow-x-auto print:hidden bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
        {[
          { id: 'production', label: '1. Acompanhamento de OPs por Status' },
          { id: 'variance', label: '2. Desvios de Tempo (Previsto vs Real)' },
          { id: 'stock', label: '3. Reposição & Estoque Crítico de Insumos' },
          { id: 'capacity', label: '4. Carga e Capacidade por Setor' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-3 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              reportType === tab.id
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Printable Report Document Container */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 print:border-none print:shadow-none print:p-0">
        {/* Printable Official Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <SenaiLogo className="h-11 shadow-sm rounded" />
              <div>
                <h1 className="text-lg font-black uppercase tracking-wider text-slate-900">
                  {technicalResponsible?.companyName || 'SENAI - Serviço Nacional de Aprendizagem Industrial'}
                </h1>
                <p className="text-xs text-slate-600">
                  CNPJ: {technicalResponsible?.companyCnpj || '03.795.072/0001-22'} | Sistema de Gestão PCP
                </p>
                <h2 className="text-base font-bold text-blue-900 mt-2">
                  {reportType === 'production' && 'Relatório de Acompanhamento de Ordens de Produção'}
                  {reportType === 'variance' && 'Relatório de Desvios de Tempo de Fabricação (Lead Time)'}
                  {reportType === 'stock' && 'Relatório de Posição de Estoque & Itens Abaixo do Mínimo'}
                  {reportType === 'capacity' && 'Relatório de Ocupação da Capacidade Produtiva'}
                </h2>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="block text-slate-500">Data de Emissão:</span>
              <span className="font-mono font-bold text-slate-900">
                {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="mt-3 bg-emerald-50 border border-emerald-300 rounded px-3 py-1.5 flex items-center justify-between text-xs text-emerald-950">
            <span>
              <strong>Responsável Técnico Emissor:</strong> {technicalResponsible?.name}
            </span>
            <span className="font-mono font-semibold text-emerald-800">
              {technicalResponsible?.registrationNumber}
            </span>
          </div>
        </div>

        {/* 1. Report: Acompanhamento de OPs */}
        {reportType === 'production' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between print:hidden">
              <span className="text-xs text-slate-500">Filtrar por Status:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                {['ALL', 'ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                      statusFilter === st ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {st === 'ALL' ? 'Todas' : st}
                  </button>
                ))}
              </div>
            </div>

            <table className="w-full text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <th className="py-2.5 px-3 text-left">Código OP</th>
                  <th className="py-2.5 px-3 text-left">Produto Acabado</th>
                  <th className="py-2.5 px-3 text-left">Cliente / Destino</th>
                  <th className="py-2.5 px-2 text-center">Qtd Prog.</th>
                  <th className="py-2.5 px-2 text-center">Qtd Concl.</th>
                  <th className="py-2.5 px-3 text-center">Prazo</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrders.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{op.code}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{op.productName}</td>
                    <td className="py-2.5 px-3 text-slate-700">{op.customerName || 'Estoque Regular'}</td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold">{op.quantityToProduce}</td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-emerald-800">
                      {op.quantityProduced > 0 ? op.quantityProduced : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{formatDate(op.deliveryDatePlanned)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          op.status === 'CONCLUIDA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : op.status === 'EM_ANDAMENTO'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {op.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Report: Desvios de Tempo Previsto vs Real */}
        {reportType === 'variance' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Demonstrativo de eficiência operacional comparando o tempo padrão de ficha técnica com o tempo real apontado pelos operadores no chão de fábrica:
            </p>

            <table className="w-full text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <th className="py-2.5 px-3 text-left">Código OP</th>
                  <th className="py-2.5 px-3 text-left">Produto</th>
                  <th className="py-2.5 px-3 text-right">Tempo Padrão (Prev.)</th>
                  <th className="py-2.5 px-3 text-right">Tempo Real Apontado</th>
                  <th className="py-2.5 px-3 text-right">Desvio (Variação)</th>
                  <th className="py-2.5 px-3 text-center">Eficiência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((op) => {
                  const variance = op.totalActualMinutes - op.totalEstimatedMinutes;
                  const efficiency = op.totalActualMinutes > 0
                    ? Math.round((op.totalEstimatedMinutes / op.totalActualMinutes) * 100)
                    : 100;

                  return (
                    <tr key={op.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{op.code}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{op.productName}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {op.totalEstimatedMinutes} min ({Math.round(op.totalEstimatedMinutes / 60)}h)
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-900">
                        {op.totalActualMinutes} min ({Math.round(op.totalActualMinutes / 60)}h)
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        <span className={variance > 0 ? 'text-red-600' : 'text-emerald-700'}>
                          {variance > 0 ? `+${variance} min` : `${variance} min`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            efficiency >= 100
                              ? 'bg-emerald-100 text-emerald-800'
                              : efficiency >= 80
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {efficiency}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Report: Estoque Crítico */}
        {reportType === 'stock' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900">
              <strong>Atenção para Compras:</strong> Encontram-se {criticalMaterials.length} insumos com saldo igual ou inferior ao estoque mínimo de segurança.
            </div>

            <table className="w-full text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <th className="py-2.5 px-3 text-left">Código</th>
                  <th className="py-2.5 px-3 text-left">Insumo / Matéria-Prima</th>
                  <th className="py-2.5 px-2 text-center">Unidade</th>
                  <th className="py-2.5 px-3 text-right">Saldo Atual</th>
                  <th className="py-2.5 px-3 text-right">Estoque Mínimo</th>
                  <th className="py-2.5 px-3 text-right">Déficit</th>
                  <th className="py-2.5 px-3 text-center">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {materials.map((m) => {
                  const isCrit = m.currentStock <= m.minStock;
                  const deficit = Math.max(0, m.minStock - m.currentStock);

                  return (
                    <tr key={m.id} className={isCrit ? 'bg-red-50/40' : 'hover:bg-slate-50'}>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{m.code}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{m.name}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{m.unit}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">{m.currentStock}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">{m.minStock}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                        {deficit > 0 ? `-${deficit}` : '0'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isCrit ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isCrit ? 'Comprar Urgente' : 'Regular'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Report: Carga vs Capacidade */}
        {reportType === 'capacity' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Taxa de ocupação dos setores fabris baseada nas Ordens de Produção ativas:
            </p>

            <table className="w-full text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <th className="py-2.5 px-3 text-left">Setor Fabril</th>
                  <th className="py-2.5 px-2 text-center">Operadores</th>
                  <th className="py-2.5 px-3 text-right">Capacidade Semanal (h)</th>
                  <th className="py-2.5 px-3 text-right">Carga Alocada (h)</th>
                  <th className="py-2.5 px-3 text-right">Taxa de Ocupação</th>
                  <th className="py-2.5 px-3 text-center">Avaliação do PCP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sectors.map((sec) => {
                  const occupancy = sec.occupancyRate || 0;
                  const isGargalo = occupancy >= 90;

                  return (
                    <tr key={sec.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{sec.name}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{sec.operatorsCount}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {sec.weeklyEffectiveHours}h
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-900">
                        {sec.allocatedHours}h
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        <span className={isGargalo ? 'text-red-700' : 'text-slate-900'}>
                          {occupancy}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isGargalo
                              ? 'bg-red-100 text-red-800'
                              : occupancy > 60
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isGargalo ? 'Gargalo Crítico' : occupancy > 60 ? 'Carga Alta' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Report Footer with Signatures */}
        <div className="border-t border-slate-300 pt-6 mt-8">
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div className="text-center">
              <div className="border-b border-slate-900 pb-1 mb-1 font-bold text-slate-900">
                {technicalResponsible?.name}
              </div>
              <span className="text-[10px] text-slate-600 block uppercase font-bold">
                Responsável Técnico ({technicalResponsible?.registrationNumber})
              </span>
            </div>

            <div className="text-center">
              <div className="border-b border-slate-900 pb-1 mb-1 font-bold text-slate-900">
                Diretoria Industrial / PCP
              </div>
              <span className="text-[10px] text-slate-600 block uppercase font-bold">
                Visto da Gerência de Produção
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
