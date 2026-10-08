import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  Play,
  Printer,
  Package,
} from 'lucide-react';

export interface TourStep {
  id: string;
  targetSelector?: string;
  title: string;
  description: string;
  actionHint?: string;
  arrowDirection: 'up' | 'down' | 'left' | 'right';
  tabToSwitch?: string;
}

interface TutorialTourProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchTab: (tabId: string) => void;
}

export const TutorialTour: React.FC<TutorialTourProps> = ({
  isOpen,
  onClose,
  onSwitchTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps: TourStep[] = [
    {
      id: 'welcome',
      title: '1. Bem-vindo ao PCP Pro (ERP Fabril)',
      description:
        'Este tour rápido vai te mostrar o fluxo completo da fábrica: desde a Ficha Técnica e Matéria-Prima até a emissão do Pedido, Cronômetro de Produção e Baixa.',
      actionHint: 'Veja no topo: o nome e registro (CREA) do Responsável Técnico aparecem em todas as telas.',
      arrowDirection: 'up',
      tabToSwitch: 'dashboard',
    },
    {
      id: 'technical-spec',
      title: '2. Ficha Técnica do Produto (BOM & Tempos)',
      description:
        'Aqui você cadastra a receita do produto: insumos consumidos por unidade (Lista de Materiais - BOM) e o Roteiro sequencial de fabricação com tempo padrão em minutos.',
      actionHint: 'Acesse esta aba para criar ou inspecionar desenhos técnicos e tempos de processo.',
      arrowDirection: 'down',
      tabToSwitch: 'products',
    },
    {
      id: 'materials-stock',
      title: '3. Matéria-Prima & Controle de Estoque',
      description:
        'Controle saldos em tempo real e estoque mínimo de segurança. Ao finalizar uma Ordem de Produção (OP), o consumo de insumos é baixado automaticamente aqui!',
      actionHint: 'Você também pode fazer entradas manuais de notas fiscais ou ajustes de contagem.',
      arrowDirection: 'down',
      tabToSwitch: 'materials',
    },
    {
      id: 'capacity',
      title: '4. Capacidade Produtiva & Análise de Gargalos',
      description:
        'Configure postos de trabalho, operadores, turnos e horas/dia por setor (Corte, Solda, Usinagem, etc.). O sistema calcula se a fábrica aguenta a carga das OPs programadas.',
      actionHint: 'Setores acima de 90% de ocupação são sinalizados em vermelho como gargalos críticos.',
      arrowDirection: 'down',
      tabToSwitch: 'capacity',
    },
    {
      id: 'orders',
      title: '5. Pedidos de Clientes & Geração de OP em 1 Clique',
      description:
        'Quando uma venda é registrada, você pode gerar a Ordem de Produção (OP) diretamente com 1 clique no botão "Gerar OP".',
      actionHint: 'O PCP calcula na hora todas as matérias-primas e horas necessárias para fabricar o lote!',
      arrowDirection: 'down',
      tabToSwitch: 'orders',
    },
    {
      id: 'production-orders',
      title: '6. Chão de Fábrica, Apontamento & Cronômetro',
      description:
        'Acompanhe as OPs em Lista ou no Quadro Kanban. Clique em "Apontar" para acionar o cronômetro em tempo real, registrar tempos gastos por etapa e operador.',
      actionHint: 'Quando o lote estiver pronto, clique em "Dar Baixa" para aprovar as peças e abater o estoque.',
      arrowDirection: 'down',
      tabToSwitch: 'production',
    },
    {
      id: 'print-and-reports',
      title: '7. Ficha de Impressão A4 & Relatórios Gerenciais',
      description:
        'Gere a Ficha de Chão de Fábrica formatada para folha A4 com checklist para o almoxarifado e campo de rubrica dos operadores, além de relatórios de desvios de tempo.',
      actionHint: 'Pronto! Você já conhece o fluxo completo do PCP Pro.',
      arrowDirection: 'down',
      tabToSwitch: 'reports',
    },
  ];

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (isOpen && currentStep.tabToSwitch) {
      onSwitchTab(currentStep.tabToSwitch);
    }
  }, [isOpen, currentStepIndex, currentStep.tabToSwitch, onSwitchTab]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('pcp_tutorial_completed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex items-end sm:items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Animated Floating Pointer Arrow Box */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border-2 border-blue-500 p-6 space-y-4 animate-in zoom-in-95 duration-200">
        {/* Animated Arrow Indicators based on direction */}
        {currentStep.arrowDirection === 'up' && (
          <div className="absolute -top-7 left-12 flex flex-col items-center animate-bounce">
            <ArrowUp className="w-8 h-8 text-blue-500 drop-shadow-md stroke-[3]" />
          </div>
        )}

        {currentStep.arrowDirection === 'down' && (
          <div className="absolute -top-7 right-14 flex flex-col items-center animate-bounce">
            <ArrowUp className="w-8 h-8 text-blue-500 drop-shadow-md stroke-[3]" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Guia Rápido Passo a Passo ({currentStepIndex + 1}/{steps.length})
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {currentStep.title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleFinish}
            title="Fechar tutorial"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <p className="text-xs text-slate-600 leading-relaxed">
          {currentStep.description}
        </p>

        {currentStep.actionHint && (
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-start gap-2 text-xs text-blue-900 font-medium">
            <span className="text-blue-600 font-bold shrink-0">👉 Dica Prática:</span>
            <span>{currentStep.actionHint}</span>
          </div>
        )}

        {/* Steps Progress dots */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStepIndex(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === currentStepIndex
                    ? 'w-6 bg-blue-600'
                    : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
                title={`Ir para passo ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
            >
              <span>{currentStepIndex === steps.length - 1 ? 'Concluir Tutorial' : 'Próximo Passo'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
