export interface TechnicalResponsible {
  name: string;
  role: string;
  registrationNumber: string;
  email: string;
  phone: string;
  companyName: string;
  companyCnpj: string;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  costUnit: number;
  supplierId?: string;
  location?: string;
  notes?: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  materialId: string;
  materialCode?: string;
  materialName?: string;
  materialUnit?: string;
  type: 'ENTRADA' | 'SAIDA_PRODUCAO' | 'AJUSTE';
  quantity: number;
  reason: string;
  referenceId?: string;
  date: string;
  responsibleName: string;
}

export interface ProcessStepTemplate {
  id?: string;
  order: number;
  name: string;
  sectorId: string;
  estimatedMinutes: number;
  machineOrWorkstation?: string;
  instructions?: string;
}

export interface BillOfMaterialItem {
  materialId: string;
  quantityPerUnit: number;
  notes?: string;
  materialName?: string;
  materialCode?: string;
  materialUnit?: string;
  currentStock?: number;
  costUnit?: number;
  costTotal?: number;
}

export interface ProductRecipe {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  specifications: string;
  materials: BillOfMaterialItem[];
  processSteps: ProcessStepTemplate[];
  estimatedLaborCost?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  materialsWithDetails?: BillOfMaterialItem[];
  totalMaterialCost?: number;
  totalProcessMinutes?: number;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  tradeName?: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  tradeName?: string;
  document: string;
  email: string;
  phone: string;
  suppliedItems: string;
  leadTimeDays: number;
  address: string;
  createdAt: string;
}

export interface WorkSector {
  id: string;
  name: string;
  workstationsCount: number;
  operatorsCount: number;
  shiftsPerDay: number;
  hoursPerShift: number;
  efficiencyRate: number;
  notes?: string;
  dailyGrossHours?: number;
  dailyEffectiveHours?: number;
  weeklyEffectiveHours?: number;
  allocatedHours?: number;
  occupancyRate?: number;
}

export interface CompanyCapacity {
  workDaysPerWeek: number;
  sectors: WorkSector[];
  updatedAt: string;
}

export interface CustomerOrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName?: string;
  productCode?: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  customerDocument?: string;
  items: CustomerOrderItem[];
  itemsWithProduct?: CustomerOrderItem[];
  totalAmount: number;
  issueDate: string;
  deliveryDate: string;
  status: 'PENDENTE' | 'EM_PRODUCAO' | 'CONCLUIDO' | 'CANCELADO';
  notes?: string;
  productionOrderId?: string;
  linkedOPCode?: string;
  linkedOPStatus?: string;
}

export interface ProductionOrderStepLog {
  id: string;
  stepName: string;
  sectorId: string;
  sectorName?: string;
  order: number;
  estimatedMinutesTotal: number;
  actualMinutesSpent: number;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'PAUSADO' | 'CONCLUIDO';
  operatorName?: string;
  startedAt?: string;
  finishedAt?: string;
  notes?: string;
}

export interface MaterialAllocation {
  materialId: string;
  materialName: string;
  materialUnit: string;
  requiredQuantity: number;
  withdrawn: boolean;
  availableStock?: number;
  isStockSufficient?: boolean;
}

export interface ProductionOrder {
  id: string;
  code: string;
  customerOrderId?: string;
  customerId?: string;
  customerName?: string;
  productId: string;
  productName: string;
  productCode: string;
  quantityToProduce: number;
  quantityProduced: number;
  quantityScrapped: number;
  scrapReason?: string;
  priority: 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE';
  status: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';
  startDatePlanned: string;
  deliveryDatePlanned: string;
  startDateActual?: string;
  finishDateActual?: string;
  totalEstimatedMinutes: number;
  totalActualMinutes: number;
  steps: ProductionOrderStepLog[];
  materialsAllocated: MaterialAllocation[];
  technicalResponsible: string;
  notes?: string;
  progressPercent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardReportData {
  totalOps: number;
  openOps: number;
  inProgressOps: number;
  completedOps: number;
  criticalMaterialsCount: number;
  criticalMaterials: Material[];
  totalEstimatedCompletedHours: number;
  totalActualCompletedHours: number;
  globalEfficiency: number;
  pendingOrders: number;
  totalOrderRevenue: number;
  technicalResponsible: TechnicalResponsible;
}
