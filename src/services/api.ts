import {
  TechnicalResponsible,
  Material,
  StockMovement,
  ProductRecipe,
  Customer,
  Supplier,
  CompanyCapacity,
  WorkSector,
  CustomerOrder,
  ProductionOrder,
  DashboardReportData,
} from '../types/index.ts';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Erro de comunicação com o servidor' }));
    throw new Error(errorData.error || `Erro HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Config & Responsável Técnico
  async getConfig(): Promise<TechnicalResponsible> {
    const res = await fetch('/api/config');
    return handleResponse<TechnicalResponsible>(res);
  },
  async updateConfig(data: Partial<TechnicalResponsible>): Promise<TechnicalResponsible> {
    const res = await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<TechnicalResponsible>(res);
  },

  // Matérias-Primas & Estoque
  async getMaterials(): Promise<Material[]> {
    const res = await fetch('/api/materials');
    return handleResponse<Material[]>(res);
  },
  async createMaterial(data: Partial<Material>): Promise<Material> {
    const res = await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Material>(res);
  },
  async updateMaterial(id: string, data: Partial<Material>): Promise<Material> {
    const res = await fetch(`/api/materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Material>(res);
  },
  async deleteMaterial(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/materials/${id}`, { method: 'DELETE' });
    return handleResponse<{ success: boolean }>(res);
  },
  async createStockMovement(
    id: string,
    movement: { type: string; quantity: number; reason: string; referenceId?: string }
  ): Promise<{ material: Material; movement: StockMovement }> {
    const res = await fetch(`/api/materials/${id}/movement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movement),
    });
    return handleResponse<{ material: Material; movement: StockMovement }>(res);
  },
  async getStockMovements(): Promise<StockMovement[]> {
    const res = await fetch('/api/stock-movements');
    return handleResponse<StockMovement[]>(res);
  },

  // Fichas Técnicas dos Produtos
  async getProducts(): Promise<ProductRecipe[]> {
    const res = await fetch('/api/products');
    return handleResponse<ProductRecipe[]>(res);
  },
  async getProduct(id: string): Promise<ProductRecipe> {
    const res = await fetch(`/api/products/${id}`);
    return handleResponse<ProductRecipe>(res);
  },
  async createProduct(data: Partial<ProductRecipe>): Promise<ProductRecipe> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<ProductRecipe>(res);
  },
  async updateProduct(id: string, data: Partial<ProductRecipe>): Promise<ProductRecipe> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<ProductRecipe>(res);
  },
  async deleteProduct(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    return handleResponse<{ success: boolean }>(res);
  },

  // Clientes
  async getCustomers(): Promise<Customer[]> {
    const res = await fetch('/api/customers');
    return handleResponse<Customer[]>(res);
  },
  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Customer>(res);
  },
  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Customer>(res);
  },
  async deleteCustomer(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    return handleResponse<{ success: boolean }>(res);
  },

  // Fornecedores
  async getSuppliers(): Promise<Supplier[]> {
    const res = await fetch('/api/suppliers');
    return handleResponse<Supplier[]>(res);
  },
  async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Supplier>(res);
  },
  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const res = await fetch(`/api/suppliers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Supplier>(res);
  },
  async deleteSupplier(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
    return handleResponse<{ success: boolean }>(res);
  },

  // Capacidade Produtiva
  async getCapacity(): Promise<CompanyCapacity> {
    const res = await fetch('/api/capacity');
    return handleResponse<CompanyCapacity>(res);
  },
  async updateCapacity(data: Partial<CompanyCapacity>): Promise<CompanyCapacity> {
    const res = await fetch('/api/capacity', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<CompanyCapacity>(res);
  },
  async createWorkSector(data: Partial<WorkSector>): Promise<WorkSector> {
    const res = await fetch('/api/capacity/sectors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<WorkSector>(res);
  },
  async updateWorkSector(id: string, data: Partial<WorkSector>): Promise<WorkSector> {
    const res = await fetch(`/api/capacity/sectors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<WorkSector>(res);
  },
  async deleteWorkSector(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/capacity/sectors/${id}`, { method: 'DELETE' });
    return handleResponse<{ success: boolean }>(res);
  },

  // Pedidos de Clientes
  async getOrders(): Promise<CustomerOrder[]> {
    const res = await fetch('/api/orders');
    return handleResponse<CustomerOrder[]>(res);
  },
  async createOrder(data: Partial<CustomerOrder>): Promise<CustomerOrder> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<CustomerOrder>(res);
  },
  async updateOrder(id: string, data: Partial<CustomerOrder>): Promise<CustomerOrder> {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<CustomerOrder>(res);
  },
  async deleteOrder(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    return handleResponse<{ success: boolean }>(res);
  },
  async generateOPFromOrder(
    orderId: string,
    options?: { productId?: string; quantity?: number; priority?: string; notes?: string }
  ): Promise<ProductionOrder> {
    const res = await fetch(`/api/orders/${orderId}/generate-op`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options || {}),
    });
    return handleResponse<ProductionOrder>(res);
  },

  // Ordens de Produção
  async getProductionOrders(): Promise<ProductionOrder[]> {
    const res = await fetch('/api/production-orders');
    return handleResponse<ProductionOrder[]>(res);
  },
  async getProductionOrder(id: string): Promise<ProductionOrder> {
    const res = await fetch(`/api/production-orders/${id}`);
    return handleResponse<ProductionOrder>(res);
  },
  async createProductionOrder(data: Partial<ProductionOrder>): Promise<ProductionOrder> {
    const res = await fetch('/api/production-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<ProductionOrder>(res);
  },
  async updateProductionOrder(id: string, data: Partial<ProductionOrder>): Promise<ProductionOrder> {
    const res = await fetch(`/api/production-orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<ProductionOrder>(res);
  },
  async logProductionStep(
    opId: string,
    stepId: string,
    data: {
      status?: string;
      operatorName?: string;
      addMinutes?: number;
      actualMinutesSpent?: number;
      notes?: string;
    }
  ): Promise<{ op: ProductionOrder; step: any }> {
    const res = await fetch(`/api/production-orders/${opId}/steps/${stepId}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ op: ProductionOrder; step: any }>(res);
  },
  async completeProductionOrder(
    opId: string,
    data: {
      quantityProduced: number;
      quantityScrapped?: number;
      scrapReason?: string;
      notes?: string;
    }
  ): Promise<{ success: boolean; op: ProductionOrder }> {
    const res = await fetch(`/api/production-orders/${opId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; op: ProductionOrder }>(res);
  },
  async deleteProductionOrder(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/production-orders/${id}`, { method: 'DELETE' });
    return handleResponse<{ success: boolean }>(res);
  },

  // Relatórios
  async getDashboardReport(): Promise<DashboardReportData> {
    const res = await fetch('/api/reports/dashboard');
    return handleResponse<DashboardReportData>(res);
  },

  // Reset dados de teste
  async resetDemoData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/reset-data', { method: 'POST' });
    return handleResponse<{ success: boolean; message: string }>(res);
  },
};
