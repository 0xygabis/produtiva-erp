import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Play,
  CheckCircle,
  Clock,
  UserCheck,
  AlertTriangle,
  FilePlus,
  Calendar,
  X,
  Check,
  ArrowRight,
} from 'lucide-react';
import { CustomerOrder, Customer, ProductRecipe, TechnicalResponsible } from '../types/index.ts';
import { api } from '../services/api.ts';

interface CustomerOrdersViewProps {
  orders: CustomerOrder[];
  customers: Customer[];
  products: ProductRecipe[];
  technicalResponsible: TechnicalResponsible | null;
  onRefresh: () => void;
  onNavigateToOPs: () => void;
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({
  orders,
  customers,
  products,
  technicalResponsible,
  onRefresh,
  onNavigateToOPs,
}) => {
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [generatingForOrderId, setGeneratingForOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // First-time pointing arrow hint state (disappears after first click)
  const [hasClickedGenerateOpOnce, setHasClickedGenerateOpOnce] = useState(() => {
    return localStorage.getItem('pcp_hint_generate_op_seen') === 'true';
  });

  // New Order Form state
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(10);
  const [unitPrice, setUnitPrice] = useState(150);
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  const handleGenerateOP = async (orderId: string) => {
    // Dismiss pointing arrow after first click
    if (!hasClickedGenerateOpOnce) {
      localStorage.setItem('pcp_hint_generate_op_seen', 'true');
      setHasClickedGenerateOpOnce(true);
    }
    setLoading(true);
    setError(null);
    try {
      await api.generateOPFromOrder(orderId);
      setSuccessMsg('Ordem de Produção (OP) emitida com sucesso a partir do pedido!');
      onRefresh();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar Ordem de Produção a partir do pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError('Selecione um cliente.');
      return;
    }
    if (!selectedProductId) {
      setError('Selecione um produto.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createOrder({
        customerId,
        items: [
          {
            productId: selectedProductId,
            quantity: Number(quantity),
            unitPrice: Number(unitPrice),
            totalPrice: Number(quantity) * Number(unitPrice),
          },
        ],
        deliveryDate: new Date(deliveryDate).toISOString(),
        notes: notes.trim(),
      });
      setIsNewOrderModalOpen(false);
      onRefresh();
      setSuccessMsg('Pedido cadastrado com sucesso!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
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
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Carteira de Pedidos de Clientes</h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono font-semibold">
              {orders.length} pedidos registrados
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Geração direta de Ordens de Produção (OP) a partir da demanda de vendas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-lg text-xs font-medium">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>Resp. Técnico: <strong>{technicalResponsible?.name}</strong></span>
          </div>

          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Pedido</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={onNavigateToOPs}
            className="font-bold underline hover:text-emerald-950 cursor-pointer"
          >
            Ver nas Ordens de Produção →
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4 text-left">Pedido / Emissão</th>
                <th className="py-3 px-4 text-left">Cliente</th>
                <th className="py-3 px-4 text-left">Itens Solicitados</th>
                <th className="py-3 px-3 text-right">Valor Total</th>
                <th className="py-3 px-3 text-center">Prazo Entrega</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Geração de OP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhum pedido de cliente cadastrado no momento.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 text-sm block">
                        {ord.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Emissão: {formatDate(ord.issueDate)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{ord.customerName}</div>
                      {ord.customerDocument && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          Doc: {ord.customerDocument}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {ord.itemsWithProduct?.map((it, idx) => (
                        <div key={idx} className="font-medium text-slate-800">
                          <span className="font-bold font-mono text-blue-900">{it.quantity}x</span>{' '}
                          {it.productName}
                        </div>
                      ))}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(ord.totalAmount)}
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-700">
                      {formatDate(ord.deliveryDate)}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          ord.status === 'CONCLUIDO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'EM_PRODUCAO'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'CANCELADO'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.status === 'EM_PRODUCAO'
                          ? 'Em Produção'
                          : ord.status === 'CONCLUIDO'
                          ? 'Concluído'
                          : ord.status === 'PENDENTE'
                          ? 'Pendente'
                          : ord.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {ord.status === 'PENDENTE' ? (
                        <div className="flex items-center justify-end gap-2">
                          {!hasClickedGenerateOpOnce && (
                            <div className="hidden sm:flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-full shadow-md animate-bounce border border-amber-500">
                              <span>👉 Clique aqui para emitir a OP!</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <button
                            disabled={loading}
                            onClick={() => handleGenerateOP(ord.id)}
                            className="relative flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs transition ml-auto cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Gerar OP</span>
                            {!hasClickedGenerateOpOnce && (
                              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                              </span>
                            )}
                          </button>
                        </div>
                      ) : ord.linkedOPCode ? (
                        <button
                          onClick={onNavigateToOPs}
                          className="text-blue-700 hover:underline font-mono font-bold text-xs"
                        >
                          Ver OP: {ord.linkedOPCode}
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">OP Concluída</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Novo Pedido de Cliente</h2>
                  <p className="text-xs text-slate-400">Registrar demanda comercial</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Cliente Solicitante: *
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.tradeName ? `(${c.tradeName})` : ''} - {c.city}/{c.state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Produto Solicitado: *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Quantidade Solicitada: *
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
                    Preço Unitário (R$): *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Prazo Prometido de Entrega: *
                  </label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Total Calculado:
                  </label>
                  <div className="h-9 border border-slate-200 bg-slate-50 rounded-lg flex items-center px-3 font-mono font-bold text-sm text-blue-900">
                    {formatCurrency(quantity * unitPrice)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Observações do Pedido:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Entrega única; embalagem reforçada para transporte rodoviário..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{loading ? 'Cadastrando...' : 'Salvar Pedido'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
