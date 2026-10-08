import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  CheckCircle,
  Clock,
  User,
  UserCheck,
  AlertTriangle,
  Save,
  Timer,
  ChevronRight,
} from 'lucide-react';
import { ProductionOrder, ProductionOrderStepLog, TechnicalResponsible } from '../types/index.ts';
import { api } from '../services/api.ts';

interface ProductionTrackingModalProps {
  order: ProductionOrder;
  technicalResponsible: TechnicalResponsible | null;
  onClose: () => void;
  onUpdated: (updatedOP: ProductionOrder) => void;
}

export const ProductionTrackingModal: React.FC<ProductionTrackingModalProps> = ({
  order,
  technicalResponsible,
  onClose,
  onUpdated,
}) => {
  const [selectedStepId, setSelectedStepId] = useState<string>(
    order.steps.find((s) => s.status === 'EM_ANDAMENTO')?.id || order.steps[0]?.id || ''
  );
  const [operatorName, setOperatorName] = useState<string>('');
  const [minutesInput, setMinutesInput] = useState<number>(0);
  const [notesInput, setNotesInput] = useState<string>('');
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = order.steps.find((s) => s.id === selectedStepId);

  // Sync inputs when selecting another step
  useEffect(() => {
    if (currentStep) {
      setOperatorName(currentStep.operatorName || '');
      setNotesInput(currentStep.notes || '');
      setMinutesInput(currentStep.actualMinutesSpent || 0);
      setIsTimerRunning(false);
      setTimerSeconds(0);
    }
  }, [selectedStepId]);

  // Live stopwatch effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleStopAndAddTimer = () => {
    setIsTimerRunning(false);
    const addedMinutes = Math.ceil(timerSeconds / 60);
    setMinutesInput((prev) => prev + addedMinutes);
    setTimerSeconds(0);
  };

  const handleUpdateStep = async (newStatus?: string) => {
    if (!currentStep) return;
    setLoading(true);
    setError(null);
    try {
      let finalMinutes = minutesInput;
      if (isTimerRunning && timerSeconds > 0) {
        finalMinutes += Math.ceil(timerSeconds / 60);
        setIsTimerRunning(false);
        setTimerSeconds(0);
      }

      const res = await api.logProductionStep(order.id, currentStep.id, {
        status: newStatus || currentStep.status,
        operatorName: operatorName.trim() || undefined,
        actualMinutesSpent: finalMinutes,
        notes: notesInput.trim(),
      });

      onUpdated(res.op);
      // If completed, select next step if available
      if (newStatus === 'CONCLUIDO') {
        const next = res.op.steps.find((s) => s.order === currentStep.order + 1);
        if (next) setSelectedStepId(next.id);
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao atualizar etapa');
    } finally {
      setLoading(false);
    }
  };

  const formatStopwatch = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Acompanhamento em Tempo Real
              </span>
              <span className="bg-blue-600/30 text-blue-300 text-xs px-2 py-0.5 rounded font-mono font-bold">
                {order.code}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">{order.productName}</h2>
            <p className="text-xs text-slate-400">
              Qtd: {order.quantityToProduce} UN | Cliente: {order.customerName || 'Estoque'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Technical Responsible Banner */}
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>
              <strong>Responsável Técnico da Ordem:</strong> {order.technicalResponsible || technicalResponsible?.name}
            </span>
          </div>
          <span className="text-emerald-800 font-mono font-semibold">
            {technicalResponsible?.registrationNumber}
          </span>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Body: Steps Sidebar + Active Step Tracking Panel */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Steps Timeline / List (Left Column) */}
          <div className="md:col-span-5 border-r border-slate-200 pr-4 space-y-2">
            <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">
              Roteiro de Produção ({order.steps.length} Etapas)
            </h3>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {order.steps.map((st) => {
                const isSelected = st.id === selectedStepId;
                const isFinished = st.status === 'CONCLUIDO';
                const isRunning = st.status === 'EM_ANDAMENTO';

                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStepId(st.id)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-500/30'
                        : isFinished
                        ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50'
                        : isRunning
                        ? 'border-amber-300 bg-amber-50/50 hover:bg-amber-50'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isFinished
                            ? 'bg-emerald-600 text-white'
                            : isRunning
                            ? 'bg-amber-500 text-white animate-pulse'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isFinished ? '✓' : st.order}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {st.stepName}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {st.sectorName || 'Setor Fabril'}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600 font-mono">
                          <span>Prev: {st.estimatedMinutesTotal}m</span>
                          <span>|</span>
                          <span className={st.actualMinutesSpent > st.estimatedMinutesTotal ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}>
                            Real: {st.actualMinutesSpent}m
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 transition ${
                        isSelected ? 'text-blue-600 translate-x-0.5' : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Apontamento & Stopwatch (Right Column) */}
          <div className="md:col-span-7 space-y-5">
            {currentStep ? (
              <>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                      Etapa #{currentStep.order} em Foco
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        currentStep.status === 'CONCLUIDO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentStep.status === 'EM_ANDAMENTO'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {currentStep.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{currentStep.stepName}</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Setor Fabril: <strong>{currentStep.sectorName || 'Não especificado'}</strong>
                  </p>
                  {currentStep.notes && (
                    <p className="text-xs text-slate-500 mt-1 bg-white p-2 rounded border border-slate-200 italic">
                      Instruções: {currentStep.notes}
                    </p>
                  )}
                </div>

                {/* Live Stopwatch & Time Tracking Widget */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-4 shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Timer className="w-4 h-4 text-blue-400" />
                      <span>Cronômetro Operacional de Chão de Fábrica</span>
                    </div>
                    {isTimerRunning && (
                      <span className="text-[10px] bg-red-500/30 border border-red-400/40 text-red-300 px-2 py-0.5 rounded-full animate-pulse">
                        Gravando Tempo...
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between my-3">
                    <div className="text-3xl font-black font-mono tracking-wider text-blue-300">
                      {formatStopwatch(timerSeconds)}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isTimerRunning ? (
                        <button
                          onClick={() => setIsTimerRunning(true)}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow transition cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Iniciar Cronômetro</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleStopAndAddTimer}
                          className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow transition cursor-pointer"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pausar e Somar Minutos</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    O tempo decorrido pode ser convertido diretamente para o total de minutos apontados nesta etapa.
                  </p>
                </div>

                {/* Form fields for Operator & Manual Minutes */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Operador / Técnico Responsável pelo Apontamento:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={operatorName}
                        onChange={(e) => setOperatorName(e.target.value)}
                        placeholder="Ex: João Silva (Operador de Usinagem)"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tempo Real Total Apontado (Minutos):
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="number"
                          min="0"
                          value={minutesInput}
                          onChange={(e) => setMinutesInput(Number(e.target.value))}
                          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-bold font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Previsto na Ficha: {currentStep.estimatedMinutesTotal} min
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Desvio de Tempo:
                      </label>
                      <div className="p-2 border rounded-lg text-xs font-mono font-bold flex items-center justify-between h-9 bg-slate-50">
                        <span>Diferença:</span>
                        <span
                          className={
                            minutesInput > currentStep.estimatedMinutesTotal
                              ? 'text-red-600'
                              : 'text-emerald-700'
                          }
                        >
                          {minutesInput - currentStep.estimatedMinutesTotal > 0 ? '+' : ''}
                          {minutesInput - currentStep.estimatedMinutesTotal} min
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Observações de Produção / Ocorrências na Etapa:
                    </label>
                    <textarea
                      rows={2}
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="Ex: Peça ajustada no dispositivo 2; ferramenta substituída..."
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    disabled={loading}
                    onClick={() => handleUpdateStep()}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Apontamento</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {currentStep.status !== 'EM_ANDAMENTO' && currentStep.status !== 'CONCLUIDO' && (
                      <button
                        disabled={loading}
                        onClick={() => handleUpdateStep('EM_ANDAMENTO')}
                        className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition cursor-pointer"
                      >
                        <Play className="w-4 h-4" />
                        <span>Iniciar Etapa</span>
                      </button>
                    )}

                    {currentStep.status !== 'CONCLUIDO' && (
                      <button
                        disabled={loading}
                        onClick={() => handleUpdateStep('CONCLUIDO')}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Concluir Etapa</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm">
                Selecione uma etapa de produção para acompanhar.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
