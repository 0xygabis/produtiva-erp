import React, { useState } from 'react';
import {
  Factory,
  Plus,
  Edit,
  Trash2,
  Users,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Save,
  UserCheck,
  TrendingUp,
  X,
} from 'lucide-react';
import { CompanyCapacity, WorkSector, TechnicalResponsible } from '../types/index.ts';
import { api } from '../services/api.ts';

interface CapacityViewProps {
  capacity: CompanyCapacity;
  technicalResponsible: TechnicalResponsible | null;
  onRefresh: () => void;
}

export const CapacityView: React.FC<CapacityViewProps> = ({
  capacity,
  technicalResponsible,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<WorkSector | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [workstationsCount, setWorkstationsCount] = useState(2);
  const [operatorsCount, setOperatorsCount] = useState(2);
  const [shiftsPerDay, setShiftsPerDay] = useState(1);
  const [hoursPerShift, setHoursPerShift] = useState(8);
  const [efficiencyRate, setEfficiencyRate] = useState(85);
  const [notes, setNotes] = useState('');

  const openNewSector = () => {
    setEditingSector(null);
    setName('');
    setWorkstationsCount(2);
    setOperatorsCount(2);
    setShiftsPerDay(1);
    setHoursPerShift(8);
    setEfficiencyRate(85);
    setNotes('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditSector = (sec: WorkSector) => {
    setEditingSector(sec);
    setName(sec.name);
    setWorkstationsCount(sec.workstationsCount);
    setOperatorsCount(sec.operatorsCount);
    setShiftsPerDay(sec.shiftsPerDay);
    setHoursPerShift(sec.hoursPerShift);
    setEfficiencyRate(sec.efficiencyRate);
    setNotes(sec.notes || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveSector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do setor é obrigatório.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name,
      workstationsCount: Number(workstationsCount),
      operatorsCount: Number(operatorsCount),
      shiftsPerDay: Number(shiftsPerDay),
      hoursPerShift: Number(hoursPerShift),
      efficiencyRate: Number(efficiencyRate),
      notes,
    };

    try {
      if (editingSector) {
        await api.updateWorkSector(editingSector.id, payload);
      } else {
        await api.createWorkSector(payload);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar setor fabril');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSector = async (id: string) => {
    if (!confirm('Deseja excluir este setor fabril?')) return;
    try {
      await api.deleteWorkSector(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir setor');
    }
  };

  // Total capacity calculations
  const totalWeeklyCapacityHours = capacity.sectors.reduce(
    (acc, s) => acc + (s.weeklyEffectiveHours || 0),
    0
  );
  const totalAllocatedHours = capacity.sectors.reduce(
    (acc, s) => acc + (s.allocatedHours || 0),
    0
  );
  const overallOccupancyRate = totalWeeklyCapacityHours > 0
    ? Math.round((totalAllocatedHours / totalWeeklyCapacityHours) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Capacidade Produtiva da Indústria</h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono font-semibold">
              {capacity.sectors.length} setores ativos
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Dimensionamento de postos, operadores, turnos de trabalho e análise de carga horária vs capacidade
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-lg text-xs font-medium">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>Resp. Técnico: <strong>{technicalResponsible?.name}</strong></span>
          </div>

          <button
            onClick={openNewSector}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Setor</span>
          </button>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">
            Capacidade Efetiva Semanal
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {totalWeeklyCapacityHours.toFixed(1)}h
          </div>
          <span className="text-[11px] text-slate-500">
            Considerando {capacity.workDaysPerWeek} dias úteis/semana e taxas de eficiência
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">
            Carga Alocada em OPs Ativas
          </span>
          <div className="text-2xl font-black text-blue-900 font-mono mt-1">
            {totalAllocatedHours.toFixed(1)}h
          </div>
          <span className="text-[11px] text-slate-500">
            Horas demandadas para concluir as ordens abertas
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">
            Taxa de Ocupação Geral
          </span>
          <div className="text-2xl font-black font-mono mt-1 flex items-center gap-2">
            <span
              className={
                overallOccupancyRate > 90
                  ? 'text-red-600'
                  : overallOccupancyRate > 70
                  ? 'text-amber-600'
                  : 'text-emerald-700'
              }
            >
              {overallOccupancyRate}%
            </span>
            <span className="text-xs font-bold text-slate-500 font-sans">
              {overallOccupancyRate > 90 ? 'Gargalo Fabril' : 'Equilibrado'}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                overallOccupancyRate > 90
                  ? 'bg-red-500'
                  : overallOccupancyRate > 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallOccupancyRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sectors Table and Load vs Capacity Analysis */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
            Detalhamento por Setor Fabril & Verificação de Gargalos
          </h3>
          <span className="text-xs text-slate-500">
            Horas Disponíveis vs Carga Programada
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4 text-left">Setor Fabril</th>
                <th className="py-3 px-3 text-center">Postos / Máquinas</th>
                <th className="py-3 px-3 text-center">Operadores</th>
                <th className="py-3 px-3 text-center">Turnos / Horas</th>
                <th className="py-3 px-3 text-center">Eficiência (OEE)</th>
                <th className="py-3 px-3 text-right">Capacidade Semanal</th>
                <th className="py-3 px-3 text-right">Carga Alocada</th>
                <th className="py-3 px-4 text-left">Ocupação / Gargalo</th>
                <th className="py-3 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {capacity.sectors.map((sec) => {
                const occupancy = sec.occupancyRate || 0;
                const isBottleneck = occupancy >= 90;

                return (
                  <tr key={sec.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{sec.name}</div>
                      {sec.notes && (
                        <div className="text-[10px] text-slate-500 font-normal italic">
                          {sec.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800">
                      {sec.workstationsCount}
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono font-bold text-blue-900">
                      {sec.operatorsCount}
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono text-slate-700">
                      {sec.shiftsPerDay}t x {sec.hoursPerShift}h/dia
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800">
                      {sec.efficiencyRate}%
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {sec.weeklyEffectiveHours}h
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-black text-blue-900">
                      {sec.allocatedHours}h
                    </td>

                    <td className="py-3.5 px-4 min-w-[150px]">
                      <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                        <span
                          className={`font-bold ${
                            isBottleneck ? 'text-red-700' : 'text-slate-700'
                          }`}
                        >
                          {occupancy}%
                        </span>
                        {isBottleneck && (
                          <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-bold">
                            Gargalo!
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            occupancy >= 90
                              ? 'bg-red-500'
                              : occupancy >= 70
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, occupancy)}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditSector(sec)}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
                          title="Editar setor"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSector(sec.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                          title="Excluir setor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Sector */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingSector ? 'Editar Setor Fabril' : 'Novo Setor Produtivo'}
                </h3>
                <p className="text-xs text-slate-400">Configuração de capacidade instalada</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveSector} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Nome do Setor Fabril: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Solda MIG/MAG ou Usinagem CNC"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Postos / Máquinas Ativas: *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={workstationsCount}
                    onChange={(e) => setWorkstationsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Operadores Alocados: *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={operatorsCount}
                    onChange={(e) => setOperatorsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Turnos/Dia: *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="3"
                    required
                    value={shiftsPerDay}
                    onChange={(e) => setShiftsPerDay(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Horas/Turno: *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={hoursPerShift}
                    onChange={(e) => setHoursPerShift(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    OEE / Eficiência (%): *
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    required
                    value={efficiencyRate}
                    onChange={(e) => setEfficiencyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Observações / Equipamentos:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Tornos CNC Romi, dobradeira hidráulica 120t..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{loading ? 'Salvando...' : 'Salvar Setor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
