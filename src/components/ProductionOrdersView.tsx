import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Clock,
  CheckCircle,
  Play,
  Layers,
  Filter,
  Search,
  Plus,
  AlertCircle,
  Calendar,
  UserCheck,
  CheckSquare,
  Check,
  ChevronRight,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { ProductionOrder, ProductRecipe, TechnicalResponsible } from '../types/index.ts';
import { ProductionPrintSheet } from './ProductionPrintSheet.tsx';
import { ProductionTrackingModal } from './ProductionTrackingModal.tsx';
import { ProductionCompletionModal } from './ProductionCompletionModal.tsx';
import { ProductionOrderModal } from './ProductionOrderModal.tsx';

interface ProductionOrdersViewProps {
  orders: ProductionOrder[];
  products: ProductRecipe[];
  technicalResponsible: TechnicalResponsible | null;
  onRefresh: () => void;
  onUpdateOP: (op: ProductionOrder) => void;
  onNewOP: () => void;
}

export const ProductionOrdersView: React.FC<ProductionOrdersViewProps> = ({
  orders,
  products,
  technicalResponsible,
  onRefresh,
  onUpdateOP,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // First-time pointing arrow hints states (disappears after first click)
  const [hasClickedTrackOnce, setHasClickedTrackOnce] = useState(() => {
    return localStorage.getItem('pcp_hint_track_op_seen') === 'true';
  });
  const [hasClickedCompleteOnce, setHasClickedCompleteOnce] = useState(() => {
    return localStorage.getItem('pcp_hint_baixa_op_seen') === 'true';
  });

  // Modals state
  const [selectedForPrint, setSelectedForPrint] = useState<ProductionOrder | null>(null);
  const [selectedForTracking, setSelectedForTracking] = useState<ProductionOrder | null>(null);
  const [selectedForCompletion, setSelectedForCompletion] = useState<ProductionOrder | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);

  // Filtered orders
  const filteredOrders = orders.filter((op) => {
    const matchesStatus = statusFilter === 'ALL' || op.status === statusFilter;
    const matchesSearch =
      op.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (op.customerName && op.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONCLUIDA':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Concluída</span>;
      case 'EM_ANDAMENTO':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold animate-pulse">Em Andamento</span>;
      case 'ABERTA':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Aberta</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-0.5 rounded-full font-bold">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENTE':
        return <span className="bg-red-100 text-red-700 text-[10px] font-black px-1.5 py-0.5 rounded">URGENTE</span>;
      case 'ALTA':
        return <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded">ALTA</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-1.5 py-0.5 rounded">NORMAL</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Technical Responsible Section Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Ordens de Produção (OP)</h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono font-semibold">
              {orders.length} ordens cadastradas
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Emissão, acompanhamento das etapas em tempo real, cronômetro e baixa operacional
          </p>
        </div>

        {/* Responsible Tech Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-lg text-xs font-medium">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <div>
              <span>Responsável Técnico: <strong>{technicalResponsible?.name}</strong></span>
              <span className="block text-[10px] text-emerald-700/80 font-mono">
                {technicalResponsible?.registrationNumber}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova OP</span>
          </button>
        </div>
      </div>

      {/* Filters and View Mode Switcher */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por código da OP, produto ou cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
            {[
              { id: 'ALL', label: 'Todas' },
              { id: 'ABERTA', label: 'Abertas' },
              { id: 'EM_ANDAMENTO', label: 'Em Andamento' },
              { id: 'CONCLUIDA', label: 'Concluídas' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  statusFilter === st.id ? 'bg-white text-blue-700 font-bold shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* List vs Kanban Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Quadro Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Main View: List Mode */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4 text-left">Código / Data</th>
                  <th className="py-3 px-4 text-left">Produto & Destino</th>
                  <th className="py-3 px-3 text-center">Quantidade</th>
                  <th className="py-3 px-4 text-left">Progresso & Roteiro</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Prazo</th>
                  <th className="py-3 px-4 text-right">Ações Operacionais</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Nenhuma ordem de produção encontrada com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((op) => {
                    const completedSteps = op.steps.filter((s) => s.status === 'CONCLUIDO').length;
                    const totalSteps = op.steps.length;
                    const percent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                    return (
                      <tr key={op.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-slate-900 text-sm">{op.code}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Criada: {formatDate(op.createdAt)}
                          </div>
                          <div className="mt-1">{getPriorityBadge(op.priority)}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{op.productName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{op.productCode}</div>
                          <div className="text-[11px] text-blue-700 mt-0.5 font-medium">
                            {op.customerName ? `Cliente: ${op.customerName}` : 'Produção p/ Estoque'}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono">
                          <div className="font-bold text-slate-900 text-sm">{op.quantityToProduce} UN</div>
                          {op.quantityProduced > 0 && (
                            <div className="text-[10px] text-emerald-700 font-semibold">
                              Prontas: {op.quantityProduced}
                            </div>
                          )}
                          {op.quantityScrapped > 0 && (
                            <div className="text-[10px] text-red-600 font-semibold">
                              Refugo: {op.quantityScrapped}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 min-w-[180px]">
                          <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1 font-semibold">
                            <span>{completedSteps}/{totalSteps} etapas</span>
                            <span className="font-mono">{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                op.status === 'CONCLUIDA'
                                  ? 'bg-emerald-500'
                                  : percent > 50
                                  ? 'bg-blue-600'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Real: {op.totalActualMinutes}m / Prev: {op.totalEstimatedMinutes}m</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          {getStatusBadge(op.status)}
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono text-xs">
                          <span className="font-medium text-slate-700">{formatDate(op.deliveryDatePlanned)}</span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Print Sheet */}
                            <button
                              onClick={() => setSelectedForPrint(op)}
                              title="Imprimir Ficha de Chão de Fábrica"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Tracking & Live Timers with First-time Arrow */}
                            <div className="flex items-center gap-1">
                              {!hasClickedTrackOnce && (
                                <div className="hidden sm:flex items-center gap-0.5 bg-blue-100 text-blue-900 font-bold text-[10px] px-2 py-0.5 rounded-full border border-blue-300 animate-bounce">
                                  <span>👉 Apontar</span>
                                  <ArrowRight className="w-3 h-3" />
                                </div>
                              )}
                              <button
                                onClick={() => {
                                  if (!hasClickedTrackOnce) {
                                    localStorage.setItem('pcp_hint_track_op_seen', 'true');
                                    setHasClickedTrackOnce(true);
                                  }
                                  setSelectedForTracking(op);
                                }}
                                className="relative flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                              >
                                <Play className="w-3 h-3" />
                                <span>Apontar</span>
                                {!hasClickedTrackOnce && (
                                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                                  </span>
                                )}
                              </button>
                            </div>

                            {/* Complete / Finalize OP with First-time Arrow */}
                            {op.status !== 'CONCLUIDA' && (
                              <div className="flex items-center gap-1">
                                {!hasClickedCompleteOnce && (
                                  <div className="hidden sm:flex items-center gap-0.5 bg-emerald-100 text-emerald-900 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-300 animate-bounce">
                                    <span>👉 Baixa</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </div>
                                )}
                                <button
                                  onClick={() => {
                                    if (!hasClickedCompleteOnce) {
                                      localStorage.setItem('pcp_hint_baixa_op_seen', 'true');
                                      setHasClickedCompleteOnce(true);
                                    }
                                    setSelectedForCompletion(op);
                                  }}
                                  className="relative flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Dar Baixa</span>
                                  {!hasClickedCompleteOnce && (
                                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                                    </span>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'ABERTA', title: 'Abertas / Aguardando', bg: 'border-amber-300', count: orders.filter((o) => o.status === 'ABERTA').length },
            { id: 'EM_ANDAMENTO', title: 'Em Andamento no Chão de Fábrica', bg: 'border-blue-400', count: orders.filter((o) => o.status === 'EM_ANDAMENTO').length },
            { id: 'CONCLUIDA', title: 'Finalizadas / Concluídas', bg: 'border-emerald-400', count: orders.filter((o) => o.status === 'CONCLUIDA').length },
          ].map((column) => {
            const colOrders = filteredOrders.filter((o) => o.status === column.id);

            return (
              <div key={column.id} className="bg-slate-100/80 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="font-bold text-xs uppercase tracking-wide text-slate-800 flex items-center gap-1.5">
                    <span>{column.title}</span>
                  </h3>
                  <span className="bg-white text-slate-800 text-xs px-2 py-0.5 rounded-full font-bold shadow-xs">
                    {colOrders.length}
                  </span>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {colOrders.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 italic">
                      Nenhuma OP nesta etapa
                    </div>
                  ) : (
                    colOrders.map((op) => (
                      <div
                        key={op.id}
                        className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 hover:shadow-md transition space-y-2.5 text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono font-bold text-blue-900 text-sm block">{op.code}</span>
                            <span className="text-[10px] text-slate-500">{formatDate(op.createdAt)}</span>
                          </div>
                          {getPriorityBadge(op.priority)}
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 text-xs leading-snug">{op.productName}</h4>
                          <p className="text-[11px] text-slate-500 font-mono">{op.productCode}</p>
                          <p className="text-[11px] text-blue-700 font-medium mt-0.5">
                            {op.customerName || 'Estoque Regular'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-[11px] font-mono">
                          <span>Qtd: <strong>{op.quantityToProduce} UN</strong></span>
                          <span>Prazo: <strong>{formatDate(op.deliveryDatePlanned)}</strong></span>
                        </div>

                        {/* Progress */}
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-600 mb-1">
                            <span>Progresso</span>
                            <span className="font-mono">{op.steps.filter((s) => s.status === 'CONCLUIDO').length}/{op.steps.length} etapas</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{
                                width: `${
                                  op.steps.length > 0
                                    ? Math.round(
                                        (op.steps.filter((s) => s.status === 'CONCLUIDO').length /
                                          op.steps.length) *
                                          100
                                      )
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <button
                            onClick={() => setSelectedForPrint(op)}
                            className="text-slate-600 hover:text-slate-900 flex items-center gap-1 text-[11px] p-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Ficha</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedForTracking(op)}
                              className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[11px] font-semibold hover:bg-blue-100 transition cursor-pointer"
                            >
                              Apontar
                            </button>

                            {op.status !== 'CONCLUIDA' && (
                              <button
                                onClick={() => setSelectedForCompletion(op)}
                                className="bg-emerald-600 text-white px-2 py-1 rounded text-[11px] font-semibold hover:bg-emerald-500 transition cursor-pointer"
                              >
                                Baixa
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Print Sheet Modal */}
      {selectedForPrint && (
        <ProductionPrintSheet
          order={selectedForPrint}
          technicalResponsible={technicalResponsible}
          onClose={() => setSelectedForPrint(null)}
        />
      )}

      {/* Real-time Tracking & Stopwatch Modal */}
      {selectedForTracking && (
        <ProductionTrackingModal
          order={selectedForTracking}
          technicalResponsible={technicalResponsible}
          onClose={() => setSelectedForTracking(null)}
          onUpdated={(updated) => {
            onUpdateOP(updated);
            setSelectedForTracking(updated);
          }}
        />
      )}

      {/* Completion & Finalization (Baixa) Modal */}
      {selectedForCompletion && (
        <ProductionCompletionModal
          order={selectedForCompletion}
          technicalResponsible={technicalResponsible}
          onClose={() => setSelectedForCompletion(null)}
          onSuccess={(updated) => {
            onUpdateOP(updated);
            setSelectedForCompletion(null);
            onRefresh();
          }}
        />
      )}

      {/* New OP Modal */}
      {isNewModalOpen && (
        <ProductionOrderModal
          products={products}
          technicalResponsible={technicalResponsible}
          onClose={() => setIsNewModalOpen(false)}
          onSuccess={(newOP) => {
            setIsNewModalOpen(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};
