import React, { useState, useEffect } from 'react';
import {
  X,
  FilePlus,
  AlertTriangle,
  Clock,
  Layers,
  Calendar,
  CheckCircle,
  UserCheck,
} from 'lucide-react';
import { ProductRecipe, ProductionOrder, TechnicalResponsible } from '../types/index.ts';
import { api } from '../services/api.ts';

interface ProductionOrderModalProps {
  products: ProductRecipe[];
  technicalResponsible: TechnicalResponsible | null;
  onClose: () => void;
  onSuccess: (newOP: ProductionOrder) => void;
}

export const ProductionOrderModal: React.FC<ProductionOrderModalProps> = ({
  products,
  technicalResponsible,
  onClose,
  onSuccess,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [priority, setPriority] = useState<'NORMAL' | 'ALTA' | 'URGENTE'>('NORMAL');
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Calculate estimated minutes total
  const estimatedTotalMinutes = selectedProduct
    ? (selectedProduct.processSteps?.reduce((acc, s) => acc + (s.estimatedMinutes || 0), 0) || 0) * quantity
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      setError('Selecione um produto cadastrado.');
      return;
    }
    if (quantity <= 0) {
      setError('A quantidade deve ser maior que zero.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newOP = await api.createProductionOrder({
        productId: selectedProductId,
        quantityToProduce: quantity,
        priority,
        deliveryDatePlanned: new Date(deliveryDate).toISOString(),
        notes: notes.trim(),
      });
      onSuccess(newOP);
    } catch (err: any) {
      setError(err.message || 'Erro ao emitir ordem de produção');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Nova Ordem de Produção (OP)</h2>
              <p className="text-xs text-slate-400">Emissão avulsa de ordem fabril pelo PCP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Technical Responsible Highlight Strip */}
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>
              <strong>Responsável Técnico Emissor:</strong> {technicalResponsible?.name}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Produto Acabado (Ficha Técnica): *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name} ({p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Quantidade a Produzir: *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Prioridade:
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="NORMAL">Normal</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Prazo Previsto de Conclusão: *
              </label>
              <input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Product Preview Info */}
          {selectedProduct && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span>Roteiro de Fabricação:</span>
                <span className="text-blue-700 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Tempo Total Estimado: {Math.round(estimatedTotalMinutes / 60)}h ({estimatedTotalMinutes} min)
                </span>
              </div>

              <div className="text-[11px] text-slate-600">
                <strong>{selectedProduct.processSteps?.length || 0} Etapas: </strong>
                {selectedProduct.processSteps?.map((s) => s.name).join(' → ')}
              </div>

              <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                <strong>Insumos Necessários (BOM): </strong>
                {selectedProduct.materials?.map((m) => {
                  const req = Number(((m.quantityPerUnit || 0) * quantity).toFixed(2));
                  return `${m.materialName || 'Insumo'}: ${req} ${m.materialUnit || ''}`;
                }).join(' | ')}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Observações Operacionais para o Chão de Fábrica:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Embalagem para exportação; atenção redobrada no dimensional da furação..."
              className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
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
              <span>{loading ? 'Emitindo...' : 'Emitir Ordem de Produção'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
