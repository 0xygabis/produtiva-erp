import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  UserCheck,
  ShieldAlert,
  ArrowDownCircle,
} from 'lucide-react';
import { ProductionOrder, TechnicalResponsible } from '../types/index.ts';
import { api } from '../services/api.ts';

interface ProductionCompletionModalProps {
  order: ProductionOrder;
  technicalResponsible: TechnicalResponsible | null;
  onClose: () => void;
  onSuccess: (updatedOP: ProductionOrder) => void;
}

export const ProductionCompletionModal: React.FC<ProductionCompletionModalProps> = ({
  order,
  technicalResponsible,
  onClose,
  onSuccess,
}) => {
  const [quantityProduced, setQuantityProduced] = useState<number>(order.quantityToProduce);
  const [quantityScrapped, setQuantityScrapped] = useState<number>(0);
  const [scrapReason, setScrapReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityProduced <= 0) {
      setError('A quantidade produzida aprovada deve ser maior que zero.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.completeProductionOrder(order.id, {
        quantityProduced,
        quantityScrapped,
        scrapReason: scrapReason.trim(),
        notes: notes.trim(),
      });
      onSuccess(res.op);
    } catch (err: any) {
      setError(err.message || 'Falha ao efetuar baixa da ordem de produção');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Baixa & Finalização de Produção
              </span>
              <span className="bg-emerald-600/30 text-emerald-300 text-xs px-2 py-0.5 rounded font-mono font-bold">
                {order.code}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">Encerramento da Ordem de Produção</h2>
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
              <strong>Responsável Técnico da Liberação:</strong> {technicalResponsible?.name}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-semibold">Produto Acabado:</span>
                <span className="font-bold text-slate-900 text-sm">{order.productName}</span>
                <span className="text-slate-500 font-mono block text-[11px]">{order.productCode}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-semibold">Meta Planejada:</span>
                <span className="font-bold text-blue-900 text-sm font-mono">{order.quantityToProduce} UN</span>
                <span className="text-slate-500 block text-[11px]">
                  Destino: {order.customerName || 'Estoque Regular'}
                </span>
              </div>
            </div>
          </div>

          {/* Quantities Form */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Quantidade Concluída e Aprovada (UN): *
              </label>
              <div className="relative">
                <Package className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="1"
                  required
                  value={quantityProduced}
                  onChange={(e) => setQuantityProduced(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-bold font-mono text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Itens prontos liberados para expedição / estoque
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Perdas / Refugo (UN):
              </label>
              <div className="relative">
                <ShieldAlert className="w-4 h-4 text-amber-600 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="0"
                  value={quantityScrapped}
                  onChange={(e) => setQuantityScrapped(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-bold font-mono text-amber-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Peças reprovadas no controle dimensional / visual
              </span>
            </div>
          </div>

          {quantityScrapped > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Motivo do Refugo / Análise de Causa:
              </label>
              <input
                type="text"
                value={scrapReason}
                onChange={(e) => setScrapReason(e.target.value)}
                placeholder="Ex: Trinca na dobra, porosidade na solda, erro dimensional..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Automatic Inventory Deduction Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900">
            <div className="flex items-center gap-2 font-bold mb-2 text-blue-950">
              <ArrowDownCircle className="w-4 h-4 text-blue-600" />
              <span>Baixa Automática no Estoque de Matérias-Primas:</span>
            </div>
            <p className="mb-2 text-[11px] text-blue-800">
              Ao confirmar a baixa desta OP, os seguintes insumos serão baixados imediatamente do estoque central:
            </p>
            <ul className="space-y-1 max-h-28 overflow-y-auto pr-1">
              {order.materialsAllocated.map((m, idx) => (
                <li key={idx} className="flex justify-between font-mono bg-white/70 px-2 py-1 rounded">
                  <span className="text-slate-800">{m.materialName}</span>
                  <span className="font-bold text-blue-950">
                    - {m.requiredQuantity} {m.materialUnit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Observações Finais de Liberação do Lote:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Lote inspecionado e liberado 100% conforme tolerâncias técnicas."
              className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Footer Actions */}
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
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Efetivando Baixa...' : 'Confirmar Baixa & Concluir OP'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
