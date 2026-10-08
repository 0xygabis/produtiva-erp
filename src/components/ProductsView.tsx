import React, { useState } from 'react';
import {
  FileCode,
  Plus,
  Clock,
  Trash2,
  Edit,
  CheckCircle,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  UserCheck,
  Package,
} from 'lucide-react';
import { ProductRecipe, Material, WorkSector, TechnicalResponsible } from '../types/index.ts';
import { api } from '../services/api.ts';

interface ProductsViewProps {
  products: ProductRecipe[];
  materials: Material[];
  sectors: WorkSector[];
  technicalResponsible: TechnicalResponsible | null;
  onRefresh: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  materials,
  sectors,
  technicalResponsible,
  onRefresh,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(products[0]?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Metalmecânica');
  const [unit, setUnit] = useState('UN');
  const [specifications, setSpecifications] = useState('');
  const [formMaterials, setFormMaterials] = useState<
    { materialId: string; quantityPerUnit: number; notes: string }[]
  >([]);
  const [formSteps, setFormSteps] = useState<
    { order: number; name: string; sectorId: string; estimatedMinutes: number; machineOrWorkstation: string; instructions: string }[]
  >([]);

  const openNewModal = () => {
    setEditingProduct(null);
    setCode(`PROD-${(products.length + 1).toString().padStart(3, '0')}`);
    setName('');
    setDescription('');
    setCategory('Metalmecânica');
    setUnit('UN');
    setSpecifications('');
    setFormMaterials(
      materials.length > 0
        ? [{ materialId: materials[0].id, quantityPerUnit: 1, notes: '' }]
        : []
    );
    setFormSteps(
      sectors.length > 0
        ? [
            {
              order: 1,
              name: 'Preparação e Corte',
              sectorId: sectors[0].id,
              estimatedMinutes: 20,
              machineOrWorkstation: '',
              instructions: '',
            },
          ]
        : []
    );
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: ProductRecipe) => {
    setEditingProduct(prod);
    setCode(prod.code);
    setName(prod.name);
    setDescription(prod.description);
    setCategory(prod.category);
    setUnit(prod.unit);
    setSpecifications(prod.specifications);
    setFormMaterials(
      prod.materials?.map((m) => ({
        materialId: m.materialId,
        quantityPerUnit: m.quantityPerUnit,
        notes: m.notes || '',
      })) || []
    );
    setFormSteps(
      prod.processSteps?.map((s, idx) => ({
        order: idx + 1,
        name: s.name,
        sectorId: s.sectorId,
        estimatedMinutes: s.estimatedMinutes,
        machineOrWorkstation: s.machineOrWorkstation || '',
        instructions: s.instructions || '',
      })) || []
    );
    setError(null);
    setIsModalOpen(true);
  };

  const handleAddMaterialRow = () => {
    if (materials.length === 0) return;
    setFormMaterials((prev) => [
      ...prev,
      { materialId: materials[0].id, quantityPerUnit: 1, notes: '' },
    ]);
  };

  const handleRemoveMaterialRow = (idx: number) => {
    setFormMaterials((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddStepRow = () => {
    setFormSteps((prev) => [
      ...prev,
      {
        order: prev.length + 1,
        name: `Etapa ${prev.length + 1}`,
        sectorId: sectors[0]?.id || '',
        estimatedMinutes: 15,
        machineOrWorkstation: '',
        instructions: '',
      },
    ]);
  };

  const handleRemoveStepRow = (idx: number) => {
    setFormSteps((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, order: i + 1 }))
    );
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do produto é obrigatório.');
      return;
    }
    if (formSteps.length === 0) {
      setError('O produto deve conter ao menos uma etapa de processo.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      code,
      name,
      description,
      category,
      unit,
      specifications,
      materials: formMaterials,
      processSteps: formSteps,
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar ficha técnica');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Deseja realmente remover esta Ficha Técnica?')) return;
    try {
      await api.deleteProduct(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir produto');
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Fichas Técnicas dos Produtos (BOM & Processos)</h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono font-semibold">
              {products.length} cadastrados
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Estrutura de materiais consumidos (BOM) e roteiro de etapas com tempos de fabricação
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-lg text-xs font-medium">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>Resp. Técnico: <strong>{technicalResponsible?.name}</strong></span>
          </div>

          <button
            onClick={openNewModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Ficha Técnica</span>
          </button>
        </div>
      </div>

      {/* Main Content: Products List on Left + Detailed Recipe on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Products Sidebar (4 cols) */}
        <div className="md:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Produtos Cadastrados
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {products.map((prod) => {
              const isSelected = prod.id === selectedProduct?.id;
              return (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProductId(prod.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-900">{prod.code}</span>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5 leading-tight">{prod.name}</h4>
                    </div>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {prod.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
                    <span>Insumos: {prod.materials?.length || 0}</span>
                    <span>Etapas: {prod.processSteps?.length || 0}</span>
                    <span className="font-bold text-slate-700">
                      {prod.totalProcessMinutes || 0} min/un
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Product Recipe View (8 cols) */}
        <div className="md:col-span-8">
          {selectedProduct ? (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
              {/* Product Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {selectedProduct.code}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      Categoria: {selectedProduct.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedProduct.name}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">{selectedProduct.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(selectedProduct)}
                    className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(selectedProduct.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Excluir produto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Technical Specifications */}
              {selectedProduct.specifications && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold uppercase text-[10px] text-slate-500 block mb-1">
                    Especificações Técnicas de Engenharia:
                  </span>
                  <p className="text-slate-800">{selectedProduct.specifications}</p>
                </div>
              )}

              {/* Bill of Materials (BOM) Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-blue-600" />
                    1. Lista de Matérias-Primas por Unidade (BOM)
                  </h4>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    Custo Insumos: R$ {(selectedProduct.totalMaterialCost || 0).toFixed(2)}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold">
                      <tr>
                        <th className="py-2.5 px-3 text-left">Insumo</th>
                        <th className="py-2.5 px-3 text-right">Qtd Consumida</th>
                        <th className="py-2.5 px-2 text-center">Unidade</th>
                        <th className="py-2.5 px-3 text-right">Custo Unit.</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedProduct.materialsWithDetails?.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-medium text-slate-900">
                            {m.materialName}
                            {m.notes && <span className="block text-[10px] text-slate-500">{m.notes}</span>}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {m.quantityPerUnit}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                            {m.materialUnit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                            R$ {(m.costUnit || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            R$ {(m.costTotal || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sequential Process Steps Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    2. Roteiro de Processo & Tempos Padrão de Fabricação
                  </h4>
                  <span className="text-xs font-mono font-bold text-blue-900">
                    Tempo Total: {selectedProduct.totalProcessMinutes} minutos ({((selectedProduct.totalProcessMinutes || 0) / 60).toFixed(1)}h)
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold">
                      <tr>
                        <th className="py-2.5 px-2 text-center w-8">Ord</th>
                        <th className="py-2.5 px-3 text-left">Etapa de Produção</th>
                        <th className="py-2.5 px-3 text-left">Setor Responsável</th>
                        <th className="py-2.5 px-3 text-right">Tempo Padrão</th>
                        <th className="py-2.5 px-3 text-left">Instruções / Máquina</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedProduct.processSteps?.map((s) => {
                        const sec = sectors.find((sec) => sec.id === s.sectorId);
                        return (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-500">
                              {s.order}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {s.name}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700">
                              {sec?.name || 'Setor Fabril'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-900">
                              {s.estimatedMinutes} min
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                              {s.machineOrWorkstation && (
                                <span className="font-semibold text-slate-800 block">
                                  Posto: {s.machineOrWorkstation}
                                </span>
                              )}
                              {s.instructions || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
              Nenhum produto cadastrado. Clique em &quot;Nova Ficha Técnica&quot; para começar.
            </div>
          )}
        </div>
      </div>

      {/* New/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingProduct ? 'Editar Ficha Técnica' : 'Cadastrar Nova Ficha Técnica de Produto'}
                </h3>
                <p className="text-xs text-slate-400">
                  Definição de especificações, insumos (BOM) e tempos de fabricação
                </p>
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

            <form onSubmit={handleSaveProduct} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Código / SKU: *
                  </label>
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
                    Nome do Produto: *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Gabinete Elétrico 800x600"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Categoria:
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Unidade de Medida: *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="UN">UN (Unidade)</option>
                    <option value="CJ">CJ (Conjunto)</option>
                    <option value="PC">PC (Peça)</option>
                    <option value="KG">KG (Quilograma)</option>
                    <option value="M">M (Metro)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Descrição Breve:
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Aplicação ou linha do produto"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Especificações Técnicas de Engenharia:
                </label>
                <textarea
                  rows={2}
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  placeholder="Ex: Tolerância dimensional ±0.5mm, acabamento superficial texturizado..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Bill of Materials (BOM) Editor */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-800">
                    1. Insumos Consumidos (Lista de Materiais - BOM)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddMaterialRow}
                    className="flex items-center gap-1 text-blue-700 hover:text-blue-900 text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Insumo</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formMaterials.map((matRow, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                      <select
                        value={matRow.materialId}
                        onChange={(e) => {
                          const updated = [...formMaterials];
                          updated[idx].materialId = e.target.value;
                          setFormMaterials(updated);
                        }}
                        className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-xs"
                      >
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.unit})
                          </option>
                        ))}
                      </select>

                      <div className="w-32">
                        <input
                          type="number"
                          step="0.01"
                          min="0.001"
                          placeholder="Qtd/un"
                          value={matRow.quantityPerUnit}
                          onChange={(e) => {
                            const updated = [...formMaterials];
                            updated[idx].quantityPerUnit = Number(e.target.value);
                            setFormMaterials(updated);
                          }}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs font-mono font-bold"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMaterialRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process Steps (Routing) Editor */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-800">
                    2. Roteiro de Fabricação (Etapas & Tempos Padrão)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddStepRow}
                    className="flex items-center gap-1 text-blue-700 hover:text-blue-900 text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Etapa</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formSteps.map((stepRow, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        <input
                          type="text"
                          placeholder="Nome da etapa (ex: Corte, Solda...)"
                          value={stepRow.name}
                          onChange={(e) => {
                            const updated = [...formSteps];
                            updated[idx].name = e.target.value;
                            setFormSteps(updated);
                          }}
                          className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs font-bold"
                        />

                        <select
                          value={stepRow.sectorId}
                          onChange={(e) => {
                            const updated = [...formSteps];
                            updated[idx].sectorId = e.target.value;
                            setFormSteps(updated);
                          }}
                          className="w-44 px-2 py-1 border border-slate-300 rounded text-xs"
                        >
                          {sectors.map((sec) => (
                            <option key={sec.id} value={sec.id}>
                              {sec.name}
                            </option>
                          ))}
                        </select>

                        <div className="w-28 flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            placeholder="Min"
                            value={stepRow.estimatedMinutes}
                            onChange={(e) => {
                              const updated = [...formSteps];
                              updated[idx].estimatedMinutes = Number(e.target.value);
                              setFormSteps(updated);
                            }}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono font-bold text-blue-900"
                          />
                          <span className="text-[10px] text-slate-500 font-mono">min</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveStepRow(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          placeholder="Máquina / Posto (opcional)"
                          value={stepRow.machineOrWorkstation}
                          onChange={(e) => {
                            const updated = [...formSteps];
                            updated[idx].machineOrWorkstation = e.target.value;
                            setFormSteps(updated);
                          }}
                          className="px-2 py-1 border border-slate-200 rounded text-[11px]"
                        />
                        <input
                          type="text"
                          placeholder="Instruções operacionais / tolerâncias"
                          value={stepRow.instructions}
                          onChange={(e) => {
                            const updated = [...formSteps];
                            updated[idx].instructions = e.target.value;
                            setFormSteps(updated);
                          }}
                          className="px-2 py-1 border border-slate-200 rounded text-[11px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Footer */}
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
                  <span>{loading ? 'Salvando...' : 'Salvar Ficha Técnica'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
