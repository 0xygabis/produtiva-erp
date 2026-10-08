import React, { useState } from 'react';
import {
  Package,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  X,
  History,
  UserCheck,
  Edit,
  Trash2,
} from 'lucide-react';
import { Material, StockMovement, Supplier, TechnicalResponsible } from '../types/index.ts';
import { api } from '../services/api.ts';

interface MaterialsViewProps {
  materials: Material[];
  movements: StockMovement[];
  suppliers: Supplier[];
  technicalResponsible: TechnicalResponsible | null;
  onRefresh: () => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  movements,
  suppliers,
  technicalResponsible,
  onRefresh,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'stock' | 'movements'>('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedMaterialForMove, setSelectedMaterialForMove] = useState<Material | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for material
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('kg');
  const [currentStock, setCurrentStock] = useState(0);
  const [minStock, setMinStock] = useState(0);
  const [costUnit, setCostUnit] = useState(0);
  const [supplierId, setSupplierId] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Movement Form
  const [moveType, setMoveType] = useState<'ENTRADA' | 'SAIDA_PRODUCAO' | 'AJUSTE'>('ENTRADA');
  const [moveQuantity, setMoveQuantity] = useState(10);
  const [moveReason, setMoveReason] = useState('');

  const openNewMaterial = () => {
    setEditingMaterial(null);
    setCode(`MP-${(materials.length + 1).toString().padStart(3, '0')}`);
    setName('');
    setUnit('kg');
    setCurrentStock(100);
    setMinStock(20);
    setCostUnit(15.0);
    setSupplierId(suppliers[0]?.id || '');
    setLocation('Almoxarifado Central');
    setNotes('');
    setError(null);
    setIsNewModalOpen(true);
  };

  const openEditMaterial = (m: Material) => {
    setEditingMaterial(m);
    setCode(m.code);
    setName(m.name);
    setUnit(m.unit);
    setCurrentStock(m.currentStock);
    setMinStock(m.minStock);
    setCostUnit(m.costUnit);
    setSupplierId(m.supplierId || '');
    setLocation(m.location || '');
    setNotes(m.notes || '');
    setError(null);
    setIsNewModalOpen(true);
  };

  const openMoveModal = (m: Material) => {
    setSelectedMaterialForMove(m);
    setMoveType('ENTRADA');
    setMoveQuantity(10);
    setMoveReason('');
    setError(null);
    setIsMovementModalOpen(true);
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome da matéria-prima é obrigatório.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        code,
        name,
        unit,
        currentStock: Number(currentStock),
        minStock: Number(minStock),
        costUnit: Number(costUnit),
        supplierId,
        location,
        notes,
      };

      if (editingMaterial) {
        await api.updateMaterial(editingMaterial.id, payload);
      } else {
        await api.createMaterial(payload);
      }
      setIsNewModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar matéria-prima');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialForMove) return;

    if (moveQuantity <= 0) {
      setError('A quantidade deve ser maior que zero.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createStockMovement(selectedMaterialForMove.id, {
        type: moveType,
        quantity: Number(moveQuantity),
        reason: moveReason || `Movimentação manual (${moveType})`,
      });
      setIsMovementModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Falha ao registrar movimentação');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Deseja excluir esta matéria-prima?')) return;
    try {
      await api.deleteMaterial(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir matéria-prima');
    }
  };

  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Almoxarifado & Controle de Matérias-Primas</h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono font-semibold">
              {materials.length} itens cadastrados
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Controle de saldo em tempo real, estoque mínimo de segurança e movimentações
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-lg text-xs font-medium">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>Resp. Técnico: <strong>{technicalResponsible?.name}</strong></span>
          </div>

          <button
            onClick={openNewMaterial}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Matéria-Prima</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs: Estoque vs Histórico de Movimentações */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('stock')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition cursor-pointer ${
              activeSubTab === 'stock'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Posição de Estoque Atual</span>
          </button>
          <button
            onClick={() => setActiveSubTab('movements')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition cursor-pointer ${
              activeSubTab === 'movements'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Histórico de Movimentações ({movements.length})</span>
          </button>
        </div>

        {activeSubTab === 'stock' && (
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filtrar por nome ou código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* SubTab 1: Posição de Estoque */}
      {activeSubTab === 'stock' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4 text-left">Código / Descrição</th>
                  <th className="py-3 px-3 text-center">Unidade</th>
                  <th className="py-3 px-3 text-right">Saldo Atual</th>
                  <th className="py-3 px-3 text-right">Estoque Mínimo</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Custo Unitário</th>
                  <th className="py-3 px-4 text-left">Localização</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map((mat) => {
                  const isCritical = mat.currentStock <= mat.minStock;

                  return (
                    <tr
                      key={mat.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isCritical ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">{mat.code}</div>
                        <div className="font-semibold text-slate-800 text-xs mt-0.5">{mat.name}</div>
                        {mat.notes && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5">{mat.notes}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">
                        {mat.unit}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-black text-sm">
                        <span className={isCritical ? 'text-red-700' : 'text-slate-900'}>
                          {mat.currentStock}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                        {mat.minStock}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            Crítico
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <CheckCircle className="w-3 h-3" />
                            Normal
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                        R$ {mat.costUnit.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        {mat.location || 'Almoxarifado'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openMoveModal(mat)}
                            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3 text-blue-600" />
                            <span>Movimentar</span>
                          </button>
                          <button
                            onClick={() => openEditMaterial(mat)}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded transition cursor-pointer"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(mat.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition cursor-pointer"
                            title="Excluir"
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
      )}

      {/* SubTab 2: Histórico de Movimentações */}
      {activeSubTab === 'movements' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4 text-left">Data / Hora</th>
                  <th className="py-3 px-4 text-left">Matéria-Prima</th>
                  <th className="py-3 px-3 text-center">Tipo</th>
                  <th className="py-3 px-3 text-right">Quantidade</th>
                  <th className="py-3 px-4 text-left">Motivo / Documento</th>
                  <th className="py-3 px-4 text-left">Resp. Técnico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Nenhuma movimentação de estoque registrada.
                    </td>
                  </tr>
                ) : (
                  movements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {formatDate(mov.date)}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div>{mov.materialName}</div>
                        <span className="text-[10px] text-slate-500 font-mono">{mov.materialCode}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            mov.type === 'ENTRADA'
                              ? 'bg-emerald-100 text-emerald-800'
                              : mov.type === 'SAIDA_PRODUCAO'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {mov.type === 'ENTRADA'
                            ? 'Entrada'
                            : mov.type === 'SAIDA_PRODUCAO'
                            ? 'Baixa OP'
                            : 'Ajuste'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {mov.type === 'ENTRADA' ? '+' : '-'}
                        {mov.quantity} {mov.materialUnit}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {mov.reason}
                        {mov.referenceId && (
                          <span className="block text-[10px] text-blue-700 font-mono font-semibold">
                            Ref: {mov.referenceId}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {mov.responsibleName}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New / Edit Material Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingMaterial ? 'Editar Matéria-Prima' : 'Nova Matéria-Prima'}
                </h3>
                <p className="text-xs text-slate-400">Cadastro de insumo fabril</p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
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

            <form onSubmit={handleSaveMaterial} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Código: *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Nome do Insumo: *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Chapa de Aço 1020 3mm"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Unidade: *</label>
                  <input
                    type="text"
                    required
                    placeholder="kg, m, un, l..."
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Saldo Atual:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Estoque Mínimo:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Custo Unitário (R$):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={costUnit}
                    onChange={(e) => setCostUnit(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Localização no Almoxarifado:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Rua A - Prateleira 01"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Observações Técnicas / Certificado:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Certificado de ensaio de tração NBR..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
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
                  <span>{loading ? 'Salvando...' : 'Salvar Matéria-Prima'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {isMovementModalOpen && selectedMaterialForMove && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Movimentar Estoque</h3>
                <p className="text-xs text-slate-400">{selectedMaterialForMove.name}</p>
              </div>
              <button
                onClick={() => setIsMovementModalOpen(false)}
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

            <form onSubmit={handleExecuteMovement} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between items-center font-mono">
                <span>Saldo Atual:</span>
                <span className="font-bold text-sm text-blue-900">
                  {selectedMaterialForMove.currentStock} {selectedMaterialForMove.unit}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Tipo de Movimentação: *
                </label>
                <select
                  value={moveType}
                  onChange={(e) => setMoveType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="ENTRADA">Entrada (Compra / Recebimento de Fornecedor)</option>
                  <option value="SAIDA_PRODUCAO">Saída Avulsa / Consumo</option>
                  <option value="AJUSTE">Ajuste de Inventário Físico</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Quantidade ({selectedMaterialForMove.unit}): *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={moveQuantity}
                  onChange={(e) => setMoveQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Motivo / Nota Fiscal / Observação:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Compra NF-e 12345 ou Ajuste de contagem"
                  value={moveReason}
                  onChange={(e) => setMoveReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
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
                  <span>{loading ? 'Processando...' : 'Confirmar Movimentação'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
