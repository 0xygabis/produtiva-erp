import React from 'react';
import { Printer, X, CheckSquare, Clock, UserCheck, ShieldCheck, Factory, AlertCircle } from 'lucide-react';
import { ProductionOrder, TechnicalResponsible } from '../types/index.ts';
import { SenaiLogo } from './SenaiLogo.tsx';

interface ProductionPrintSheetProps {
  order: ProductionOrder;
  technicalResponsible: TechnicalResponsible | null;
  onClose: () => void;
}

export const ProductionPrintSheet: React.FC<ProductionPrintSheetProps> = ({
  order,
  technicalResponsible,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatHoursMinutes = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes} min`;
    return `${hours}h ${minutes > 0 ? `${minutes}min` : ''}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static print:z-auto">
      {/* Top Floating Control Bar (Hidden on print) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 print:hidden bg-slate-900/90 p-2 rounded-xl shadow-xl border border-slate-700">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Gerar PDF</span>
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Fechar</span>
        </button>
      </div>

      {/* A4 Sheet Container */}
      <div className="bg-white text-slate-900 w-full max-w-4xl p-8 rounded-lg shadow-2xl print:shadow-none print:w-full print:max-w-none print:p-6 print:rounded-none border border-slate-200">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <SenaiLogo className="h-12 shadow-sm rounded" />
              <div>
                <h1 className="text-xl font-black uppercase tracking-wider text-slate-950">
                  {technicalResponsible?.companyName || 'SENAI - Serviço Nacional de Aprendizagem Industrial'}
                </h1>
                <p className="text-xs text-slate-600">
                  CNPJ: {technicalResponsible?.companyCnpj || '03.795.072/0001-22'} | Tel: {technicalResponsible?.phone || '(11) 3322-0050'}
                </p>
                <p className="text-xs text-slate-600">
                  Sistema de Planejamento e Controle de Produção (PCP)
                </p>
              </div>
            </div>

            {/* OP Identifier Box */}
            <div className="text-right border-2 border-slate-900 rounded p-2.5 bg-slate-50 min-w-[200px]">
              <span className="text-[11px] font-bold uppercase text-slate-600 block">Ordem de Produção</span>
              <span className="text-2xl font-black text-blue-900 font-mono tracking-tight block">{order.code}</span>
              <span className="text-xs font-semibold text-slate-700 block mt-0.5">
                Emissão: {formatDate(order.createdAt)}
              </span>
            </div>
          </div>

          {/* Technical Responsible Highlight Strip */}
          <div className="mt-4 bg-emerald-50 border border-emerald-300 rounded px-3 py-2 flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>
                <strong>Responsável Técnico da Produção:</strong> {order.technicalResponsible || technicalResponsible?.name}
              </span>
            </div>
            <span className="font-mono text-emerald-800 font-semibold">
              {technicalResponsible?.registrationNumber}
            </span>
          </div>
        </div>

        {/* General Data Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-md border border-slate-200 mb-6 text-xs">
          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-semibold">Código / SKU Produto:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{order.productCode}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-semibold">Quantidade a Produzir:</span>
            <span className="font-bold text-slate-900 text-sm text-blue-900">{order.quantityToProduce} UN</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-semibold">Prazo de Entrega:</span>
            <span className="font-bold text-slate-900 text-sm text-amber-700">{formatDate(order.deliveryDatePlanned)}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-semibold">Prioridade:</span>
            <span className={`inline-block font-bold text-xs px-2 py-0.5 rounded ${
              order.priority === 'URGENTE' ? 'bg-red-100 text-red-800' :
              order.priority === 'ALTA' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-800'
            }`}>
              {order.priority}
            </span>
          </div>

          <div className="col-span-2 mt-2">
            <span className="text-slate-500 block uppercase text-[10px] font-semibold">Descrição do Produto:</span>
            <span className="font-semibold text-slate-900 text-sm">{order.productName}</span>
          </div>
          <div className="col-span-2 mt-2">
            <span className="text-slate-500 block uppercase text-[10px] font-semibold">Destino / Cliente:</span>
            <span className="font-semibold text-slate-900 text-sm">
              {order.customerName ? `${order.customerName} (${order.customerOrderId || 'Avulso'})` : 'Estoque Regular de Fábrica'}
            </span>
          </div>
        </div>

        {/* Bill of Materials (BOM) - Separação de Insumos */}
        <div className="mb-6">
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1 mb-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-blue-700" />
              1. Lista de Materiais & Separação de Insumos (BOM)
            </h2>
            <span className="text-[11px] text-slate-500">Almoxarifado & Liberação</span>
          </div>

          <table className="w-full text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                <th className="py-2 px-2 text-left w-10">Sep.</th>
                <th className="py-2 px-3 text-left">Insumo / Matéria-Prima</th>
                <th className="py-2 px-3 text-right">Qtd Requerida</th>
                <th className="py-2 px-3 text-center">Unidade</th>
                <th className="py-2 px-3 text-right">Saldo em Estoque</th>
                <th className="py-2 px-3 text-center">Visto Almoxarife</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.materialsAllocated.map((mat, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-2 px-2 text-center">
                    <input
                      type="checkbox"
                      defaultChecked={mat.withdrawn}
                      className="w-4 h-4 text-blue-600 rounded border-slate-400"
                    />
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-900">
                    {mat.materialName}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">
                    {mat.requiredQuantity}
                  </td>
                  <td className="py-2 px-3 text-center text-slate-600 font-mono">
                    {mat.materialUnit}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">
                    {mat.availableStock !== undefined ? mat.availableStock : '-'}
                  </td>
                  <td className="py-2 px-3 text-center border-l border-slate-200">
                    <div className="w-20 h-4 border-b border-slate-400 mx-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Process Routing Steps with Operator Signatures */}
        <div className="mb-6">
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1 mb-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-700" />
              2. Roteiro de Fabricação & Apontamento de Tempos
            </h2>
            <span className="text-[11px] font-bold text-slate-700">
              Tempo Total Previsto: {formatHoursMinutes(order.totalEstimatedMinutes)}
            </span>
          </div>

          <table className="w-full text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                <th className="py-2 px-2 text-center w-8">Ord</th>
                <th className="py-2 px-3 text-left">Etapa de Produção</th>
                <th className="py-2 px-3 text-left">Setor / Posto</th>
                <th className="py-2 px-2 text-right">Tempo Prev.</th>
                <th className="py-2 px-2 text-right">Tempo Real</th>
                <th className="py-2 px-3 text-left">Operador / Rubrica</th>
                <th className="py-2 px-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.steps.map((step) => (
                <tr key={step.id} className="hover:bg-slate-50">
                  <td className="py-2 px-2 text-center font-bold text-slate-600">{step.order}</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">
                    <div>{step.stepName}</div>
                    {step.notes && <div className="text-[10px] text-slate-500 italic">{step.notes}</div>}
                  </td>
                  <td className="py-2 px-3 text-slate-700">{step.sectorName || 'Setor Fabril'}</td>
                  <td className="py-2 px-2 text-right font-mono font-medium text-slate-700">
                    {formatHoursMinutes(step.estimatedMinutesTotal)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono font-bold text-blue-900">
                    {step.actualMinutesSpent > 0 ? formatHoursMinutes(step.actualMinutesSpent) : '____ min'}
                  </td>
                  <td className="py-2 px-3 text-slate-700">
                    {step.operatorName ? (
                      <span className="font-medium text-slate-900">{step.operatorName}</span>
                    ) : (
                      <div className="w-24 border-b border-slate-400 h-4"></div>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      step.status === 'CONCLUIDO' ? 'bg-emerald-100 text-emerald-800' :
                      step.status === 'EM_ANDAMENTO' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {step.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quality Control & Signatures Section */}
        <div className="border border-slate-300 rounded-md p-4 bg-slate-50 mb-4 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-3 border-b border-slate-200 pb-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>3. Inspeção de Qualidade & Liberação Final</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Qtd Aprovada:</span>
              <div className="h-7 border border-slate-300 bg-white rounded flex items-center px-2 font-bold font-mono">
                {order.quantityProduced > 0 ? `${order.quantityProduced} UN` : '_______ UN'}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Qtd Refugada / Perda:</span>
              <div className="h-7 border border-slate-300 bg-white rounded flex items-center px-2 font-bold font-mono text-red-700">
                {order.quantityScrapped > 0 ? `${order.quantityScrapped} UN` : '0 UN'}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Data Conclusão Real:</span>
              <div className="h-7 border border-slate-300 bg-white rounded flex items-center px-2 font-bold">
                {formatDate(order.finishDateActual)}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 mt-2">
            <div className="text-center">
              <div className="border-b border-slate-950 pb-1 mb-1 font-semibold text-slate-900 text-xs">
                {order.technicalResponsible || technicalResponsible?.name}
              </div>
              <span className="text-[10px] text-slate-600 block uppercase font-bold">
                Assinatura do Responsável Técnico ({technicalResponsible?.registrationNumber || 'CREA'})
              </span>
            </div>

            <div className="text-center">
              <div className="border-b border-slate-950 pb-1 mb-1 font-semibold text-slate-900 text-xs">
                Inspetor de Qualidade & Expedição
              </div>
              <span className="text-[10px] text-slate-600 block uppercase font-bold">
                Carimbo / Visto de Liberação do Lote
              </span>
            </div>
          </div>
        </div>

        {/* Notes & Footer */}
        <div className="text-[10px] text-slate-500 flex justify-between items-center border-t border-slate-200 pt-2">
          <span>Observações: {order.notes || 'Sem observações adicionais.'}</span>
          <span>Impresso via PCP Pro - Sistema de Gestão Industrial</span>
        </div>
      </div>
    </div>
  );
};
