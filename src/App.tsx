import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { ProductionOrdersView } from './components/ProductionOrdersView.tsx';
import { CustomerOrdersView } from './components/CustomerOrdersView.tsx';
import { ProductsView } from './components/ProductsView.tsx';
import { MaterialsView } from './components/MaterialsView.tsx';
import { CapacityView } from './components/CapacityView.tsx';
import { PartnersView } from './components/PartnersView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { ConfigModal } from './components/ConfigModal.tsx';
import { ProductionOrderModal } from './components/ProductionOrderModal.tsx';
import { ProductionTrackingModal } from './components/ProductionTrackingModal.tsx';
import { TutorialTour } from './components/TutorialTour.tsx';

import {
  TechnicalResponsible,
  Material,
  StockMovement,
  ProductRecipe,
  Customer,
  Supplier,
  CompanyCapacity,
  CustomerOrder,
  ProductionOrder,
  DashboardReportData,
} from './types/index.ts';
import { api } from './services/api.ts';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Application Data States
  const [config, setConfig] = useState<TechnicalResponsible | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<ProductRecipe[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [capacity, setCapacity] = useState<CompanyCapacity>({
    workDaysPerWeek: 5,
    sectors: [],
    updatedAt: '',
  });
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardReportData | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Global modals and tutorial state
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isNewOPOpen, setIsNewOPOpen] = useState<boolean>(false);
  const [activeTrackingOP, setActiveTrackingOP] = useState<ProductionOrder | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(() => {
    return !localStorage.getItem('pcp_tutorial_completed');
  });

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        cfg,
        mats,
        movs,
        prods,
        custs,
        sups,
        cap,
        ords,
        prodOrds,
        metrics,
      ] = await Promise.all([
        api.getConfig(),
        api.getMaterials(),
        api.getStockMovements(),
        api.getProducts(),
        api.getCustomers(),
        api.getSuppliers(),
        api.getCapacity(),
        api.getOrders(),
        api.getProductionOrders(),
        api.getDashboardReport(),
      ]);

      setConfig(cfg);
      setMaterials(mats);
      setMovements(movs);
      setProducts(prods);
      setCustomers(custs);
      setSuppliers(sups);
      setCapacity(cap);
      setOrders(ords);
      setProductionOrders(prodOrds);
      setDashboardMetrics(metrics);
    } catch (err: any) {
      console.error('Falha ao carregar dados do servidor:', err);
      setError(err.message || 'Falha ao sincronizar com o banco de dados do servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleResetDemoData = async () => {
    if (
      !confirm(
        'Deseja restaurar a base de dados com as informações de demonstração da fábrica (produtos, matérias-primas e OPs)? Todas as alterações serão redefinidas para o padrão inicial.'
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await api.resetDemoData();
      await loadAllData();
      setIsConfigOpen(false);
    } catch (err: any) {
      alert('Falha ao restaurar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOP = (updatedOP: ProductionOrder) => {
    setProductionOrders((prev) =>
      prev.map((op) => (op.id === updatedOP.id ? updatedOP : op))
    );
    // Refresh background metrics
    api.getDashboardReport().then(setDashboardMetrics).catch(console.error);
    api.getMaterials().then(setMaterials).catch(console.error);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        technicalResponsible={config}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onNewOP={() => setIsNewOPOpen(true)}
        onNewOrder={() => setActiveTab('orders')}
        onResetDemo={handleResetDemoData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadAllData}
              className="flex items-center gap-1 font-bold bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tentar Novamente</span>
            </button>
          </div>
        )}

        {loading && !dashboardMetrics ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-medium">Carregando dados da fábrica e do PCP...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                metrics={dashboardMetrics}
                recentOrders={productionOrders.filter(
                  (op) => op.status === 'EM_ANDAMENTO' || op.status === 'ABERTA'
                )}
                sectors={capacity.sectors}
                technicalResponsible={config}
                onNavigate={setActiveTab}
                onSelectOPForTracking={(op) => setActiveTrackingOP(op)}
              />
            )}

            {activeTab === 'production' && (
              <ProductionOrdersView
                orders={productionOrders}
                products={products}
                technicalResponsible={config}
                onRefresh={loadAllData}
                onUpdateOP={handleUpdateOP}
                onNewOP={() => setIsNewOPOpen(true)}
              />
            )}

            {activeTab === 'orders' && (
              <CustomerOrdersView
                orders={orders}
                customers={customers}
                products={products}
                technicalResponsible={config}
                onRefresh={loadAllData}
                onNavigateToOPs={() => setActiveTab('production')}
              />
            )}

            {activeTab === 'products' && (
              <ProductsView
                products={products}
                materials={materials}
                sectors={capacity.sectors}
                technicalResponsible={config}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'materials' && (
              <MaterialsView
                materials={materials}
                movements={movements}
                suppliers={suppliers}
                technicalResponsible={config}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'capacity' && (
              <CapacityView
                capacity={capacity}
                technicalResponsible={config}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'partners' && (
              <PartnersView
                customers={customers}
                suppliers={suppliers}
                technicalResponsible={config}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                orders={productionOrders}
                materials={materials}
                sectors={capacity.sectors}
                technicalResponsible={config}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      {isConfigOpen && (
        <ConfigModal
          technicalResponsible={config}
          onClose={() => setIsConfigOpen(false)}
          onUpdated={(updated) => setConfig(updated)}
          onResetDemo={handleResetDemoData}
        />
      )}

      {isNewOPOpen && (
        <ProductionOrderModal
          products={products}
          technicalResponsible={config}
          onClose={() => setIsNewOPOpen(false)}
          onSuccess={(newOP) => {
            setIsNewOPOpen(false);
            loadAllData();
            setActiveTab('production');
          }}
        />
      )}

      {activeTrackingOP && (
        <ProductionTrackingModal
          order={activeTrackingOP}
          technicalResponsible={config}
          onClose={() => setActiveTrackingOP(null)}
          onUpdated={(updated) => {
            handleUpdateOP(updated);
            setActiveTrackingOP(updated);
          }}
        />
      )}

      {/* Guided Onboarding Tutorial with Pointers */}
      <TutorialTour
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onSwitchTab={(tabId) => setActiveTab(tabId)}
      />
    </div>
  );
}
