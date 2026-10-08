import fs from 'fs';
import path from 'path';

// Interfaces for all system entities

export interface TechnicalResponsible {
  name: string;
  role: string;
  registrationNumber: string; // CREA, CRQ ou matrícula
  email: string;
  phone: string;
  companyName: string;
  companyCnpj: string;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  unit: string; // kg, m, m², un, l, barra, etc.
  currentStock: number;
  minStock: number;
  costUnit: number; // R$
  supplierId?: string;
  location?: string;
  notes?: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  materialId: string;
  type: 'ENTRADA' | 'SAIDA_PRODUCAO' | 'AJUSTE';
  quantity: number;
  reason: string;
  referenceId?: string; // ID da OP ou Nota
  date: string;
  responsibleName: string;
}

export interface ProcessStepTemplate {
  id?: string;
  order: number;
  name: string; // Ex: Corte, Dobra, Usinagem, Solda, Pintura, Montagem, Controle de Qualidade
  sectorId: string; // Referência à Capacidade Produtiva
  estimatedMinutes: number; // Tempo de processo estimado por unidade
  machineOrWorkstation?: string;
  instructions?: string;
}

export interface BillOfMaterialItem {
  materialId: string;
  quantityPerUnit: number; // Quantidade de insumo gasta por unidade de produto acabado
  notes?: string;
}

export interface ProductRecipe {
  id: string;
  code: string; // SKU
  name: string;
  description: string;
  category: string;
  unit: string;
  specifications: string;
  materials: BillOfMaterialItem[]; // BOM
  processSteps: ProcessStepTemplate[]; // Roteiro de fabricação com tempos
  estimatedLaborCost?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string; // Razão Social / Nome
  tradeName?: string; // Nome Fantasia
  document: string; // CNPJ ou CPF
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
  suppliedItems: string; // Insumos fornecidos
  leadTimeDays: number; // Prazo médio de entrega em dias
  address: string;
  createdAt: string;
}

export interface WorkSector {
  id: string;
  name: string; // Ex: Corte, Usinagem, Montagem, Acabamento, CQ
  workstationsCount: number; // Postos de trabalho
  operatorsCount: number; // Operadores alocados
  shiftsPerDay: number; // Turnos/dia
  hoursPerShift: number; // Horas por turno (ex: 8)
  efficiencyRate: number; // 0 a 100 (ex: 85% de OEE)
  notes?: string;
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
}

export interface CustomerOrder {
  id: string;
  orderNumber: string; // Ex: PED-1001
  customerId: string;
  items: CustomerOrderItem[];
  totalAmount: number;
  issueDate: string;
  deliveryDate: string;
  status: 'PENDENTE' | 'EM_PRODUCAO' | 'CONCLUIDO' | 'CANCELADO';
  notes?: string;
  productionOrderId?: string;
}

export interface ProductionOrderStepLog {
  id: string;
  stepName: string;
  sectorId: string;
  order: number;
  estimatedMinutesTotal: number;
  actualMinutesSpent: number;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'PAUSADO' | 'CONCLUIDO';
  operatorName?: string;
  startedAt?: string;
  finishedAt?: string;
  notes?: string;
}

export interface ProductionOrder {
  id: string;
  code: string; // Ex: OP-2026-001
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
  materialsAllocated: {
    materialId: string;
    materialName: string;
    materialUnit: string;
    requiredQuantity: number;
    withdrawn: boolean;
  }[];
  technicalResponsible: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  technicalResponsible: TechnicalResponsible;
  materials: Material[];
  stockMovements: StockMovement[];
  products: ProductRecipe[];
  customers: Customer[];
  suppliers: Supplier[];
  capacity: CompanyCapacity;
  orders: CustomerOrder[];
  productionOrders: ProductionOrder[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'pcp_database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data) as DatabaseSchema;
    }
  } catch (error) {
    console.error('Erro ao ler base de dados, recriando inicial:', error);
  }
  return getInitialDatabaseData();
}

export function writeDatabase(data: DatabaseSchema): void {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (error) {
    console.error('Erro ao salvar base de dados:', error);
    throw error;
  }
}

export function getInitialDatabaseData(): DatabaseSchema {
  const defaultResponsible: TechnicalResponsible = {
    name: 'Gabriela Cares Souza',
    role: 'Engenheira de Produção & Resp. Técnica - SENAI',
    registrationNumber: 'CREA / Matrícula SENAI',
    email: 'gabriela.souza@sp.senai.br',
    phone: '(11) 3322-0050',
    companyName: 'SENAI - Serviço Nacional de Aprendizagem Industrial',
    companyCnpj: '03.795.072/0001-22',
  };

  const defaultMaterials: Material[] = [
    {
      id: 'mat-1',
      code: 'MP-001',
      name: 'Chapa de Aço Carbono 1020 (3mm x 1200x3000mm)',
      unit: 'kg',
      currentStock: 480,
      minStock: 150,
      costUnit: 14.50,
      location: 'Rua A - Prateleira 01',
      notes: 'Certificado de usinabilidade e ensaio de tração conforme NBR',
      updatedAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'mat-2',
      code: 'MP-002',
      name: 'Tubo de Aço Estrutural Quadrado 50x50x2mm',
      unit: 'm',
      currentStock: 220,
      minStock: 80,
      costUnit: 28.00,
      location: 'Rua A - Prateleira 04',
      notes: 'Barras padrão de 6 metros',
      updatedAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'mat-3',
      code: 'MP-003',
      name: 'Eixo Redondo Trefilado 1045 Ø 25mm',
      unit: 'm',
      currentStock: 110,
      minStock: 40,
      costUnit: 42.50,
      location: 'Rua B - Rack 02',
      notes: 'Excelente para torneamento e chavetas',
      updatedAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'mat-4',
      code: 'MP-004',
      name: 'Tinta Eletrostática a Pó Epóxi Preto Fosco',
      unit: 'kg',
      currentStock: 65,
      minStock: 25,
      costUnit: 36.00,
      location: 'Almoxarifado Químico - Q01',
      notes: 'Armazenar em local seco < 25°C',
      updatedAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'mat-5',
      code: 'MP-005',
      name: 'Rolamento Blindado 6005-2RS',
      unit: 'un',
      currentStock: 85,
      minStock: 30,
      costUnit: 18.20,
      location: 'Gaveteiro C - Gaveta 14',
      notes: 'Linha industrial DDU / 2RS',
      updatedAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'mat-6',
      code: 'MP-006',
      name: 'Parafuso Sextavado M8x35mm Aço 8.8 Galvanizado',
      unit: 'un',
      currentStock: 850,
      minStock: 300,
      costUnit: 1.15,
      location: 'Gaveteiro C - Gaveta 08',
      notes: 'Acompanha porca parlock e arruela',
      updatedAt: '2026-10-01T08:00:00Z',
    },
  ];

  const defaultStockMovements: StockMovement[] = [
    {
      id: 'mov-1',
      materialId: 'mat-1',
      type: 'ENTRADA',
      quantity: 500,
      reason: 'Compra NF-e 44321 - Fornecedor Siderúrgica Gerdau',
      date: '2026-09-25T10:00:00Z',
      responsibleName: 'Eng. Carlos Eduardo Martins',
    },
    {
      id: 'mov-2',
      materialId: 'mat-2',
      type: 'ENTRADA',
      quantity: 250,
      reason: 'Compra NF-e 44380 - Tubos & Perfis Paulista',
      date: '2026-09-28T14:30:00Z',
      responsibleName: 'Eng. Carlos Eduardo Martins',
    },
  ];

  const defaultCapacity: CompanyCapacity = {
    workDaysPerWeek: 5,
    updatedAt: new Date().toISOString(),
    sectors: [
      {
        id: 'sec-1',
        name: 'Corte e Guilhotina / Laser',
        workstationsCount: 2,
        operatorsCount: 2,
        shiftsPerDay: 1,
        hoursPerShift: 8,
        efficiencyRate: 88,
        notes: 'Guilhotina CNC 3000mm e Laser fibra óptica',
      },
      {
        id: 'sec-2',
        name: 'Dobra e Conformação CNC',
        workstationsCount: 2,
        operatorsCount: 2,
        shiftsPerDay: 1,
        hoursPerShift: 8,
        efficiencyRate: 85,
        notes: 'Prensa dobradeira hidráulica 120t',
      },
      {
        id: 'sec-3',
        name: 'Usinagem e Torneamento',
        workstationsCount: 3,
        operatorsCount: 3,
        shiftsPerDay: 1,
        hoursPerShift: 8,
        efficiencyRate: 82,
        notes: 'Tornos CNC Romi e Centro de Usinagem vertical',
      },
      {
        id: 'sec-4',
        name: 'Soldagem MIG/MAG e TIG',
        workstationsCount: 3,
        operatorsCount: 3,
        shiftsPerDay: 1,
        hoursPerShift: 8,
        efficiencyRate: 80,
        notes: 'Cabines com exaustão e tochas refrigeradas',
      },
      {
        id: 'sec-5',
        name: 'Pintura Eletrostática e Forno',
        workstationsCount: 1,
        operatorsCount: 2,
        shiftsPerDay: 1,
        hoursPerShift: 8,
        efficiencyRate: 90,
        notes: 'Cabine de pintura a pó e estufa de polimerização 200°C',
      },
      {
        id: 'sec-6',
        name: 'Montagem Final e Testes',
        workstationsCount: 4,
        operatorsCount: 4,
        shiftsPerDay: 1,
        hoursPerShift: 8,
        efficiencyRate: 85,
        notes: 'Bancadas de montagem com parafusadeiras pneumáticas',
      },
      {
        id: 'sec-7',
        name: 'Controle de Qualidade e Embalagem',
        workstationsCount: 2,
        operatorsCount: 2,
        shiftsPerDay: 1,
        hoursPerShift: 8,
        efficiencyRate: 92,
        notes: 'Inspeção dimensional, ensaio funcional e expedição',
      },
    ],
  };

  const defaultProducts: ProductRecipe[] = [
    {
      id: 'prod-1',
      code: 'PROD-EST-01',
      name: 'Estrutura Metálica para Painel Industrial 800x600',
      description: 'Gabinete reforçado para automação e comandos elétricos industriais',
      category: 'Estruturas Metálicas',
      unit: 'UN',
      specifications: 'Chapa 3mm dobrada, solda MIG contínua, pintura eletrostática texturizada preto 9005.',
      materials: [
        { materialId: 'mat-1', quantityPerUnit: 12.5, notes: 'Chapa aço cortada e dobrada' },
        { materialId: 'mat-2', quantityPerUnit: 4.2, notes: 'Reforços tubulares internos' },
        { materialId: 'mat-4', quantityPerUnit: 1.2, notes: 'Pintura pó eletrostática' },
        { materialId: 'mat-6', quantityPerUnit: 16, notes: 'Fixações da porta e base' },
      ],
      processSteps: [
        {
          id: 'step-t-1',
          order: 1,
          name: 'Corte de Chapas e Perfis',
          sectorId: 'sec-1',
          estimatedMinutes: 25,
          machineOrWorkstation: 'Laser CNC fibra',
          instructions: 'Verificar dimensões conforme desenho DWG rev.03.',
        },
        {
          id: 'step-t-2',
          order: 2,
          name: 'Dobra e Vinco de Painéis',
          sectorId: 'sec-2',
          estimatedMinutes: 30,
          machineOrWorkstation: 'Dobradeira CNC',
          instructions: 'Ângulos 90° tolerância ±0.5°, raio r=3mm.',
        },
        {
          id: 'step-t-3',
          order: 3,
          name: 'Soldagem de Estrutura e Reforços',
          sectorId: 'sec-4',
          estimatedMinutes: 45,
          machineOrWorkstation: 'Solda MIG/MAG 250A',
          instructions: 'Gabarito de solda 01, remover respingos com esmerilhadeira.',
        },
        {
          id: 'step-t-4',
          order: 4,
          name: 'Pintura a Pó e Cura em Estufa',
          sectorId: 'sec-5',
          estimatedMinutes: 40,
          machineOrWorkstation: 'Estufa 200°C',
          instructions: 'Desengraxe prévio, camada de 80 a 100 micras.',
        },
        {
          id: 'step-t-5',
          order: 5,
          name: 'Montagem de Dobradiças e Fechos',
          sectorId: 'sec-6',
          estimatedMinutes: 20,
          machineOrWorkstation: 'Bancada 02',
          instructions: 'Ajuste de vedação borracha de silicone e parafusos torque 12Nm.',
        },
        {
          id: 'step-t-6',
          order: 6,
          name: 'Controle de Qualidade e Embalagem',
          sectorId: 'sec-7',
          estimatedMinutes: 15,
          machineOrWorkstation: 'Bancada Inspeção Final',
          instructions: 'Teste de estanqueidade e camada de tinta. Embalar com plástico bolha e cantoneiras.',
        },
      ],
      estimatedLaborCost: 145.0,
      active: true,
      createdAt: '2026-09-15T09:00:00Z',
      updatedAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 'prod-2',
      code: 'PROD-ROL-02',
      name: 'Mancal Industrial com Eixo Trefilado Ø25mm',
      description: 'Conjunto rotativo para esteiras transportadoras de carga média',
      category: 'Mecânica Industrial',
      unit: 'CJ',
      specifications: 'Eixo 1045 retificado h7, rolamentos 6005 duplos, corpo usinado.',
      materials: [
        { materialId: 'mat-3', quantityPerUnit: 0.65, notes: 'Eixo trefilado 25mm' },
        { materialId: 'mat-5', quantityPerUnit: 2, notes: 'Dois rolamentos 6005-2RS' },
        { materialId: 'mat-6', quantityPerUnit: 4, notes: 'Parafusos de fixação base' },
      ],
      processSteps: [
        {
          id: 'step-t-7',
          order: 1,
          name: 'Corte do Eixo e Faceamento',
          sectorId: 'sec-1',
          estimatedMinutes: 15,
          machineOrWorkstation: 'Serra Fita Automática',
          instructions: 'Comprimento 420mm ±0.5mm.',
        },
        {
          id: 'step-t-8',
          order: 2,
          name: 'Torneamento e Rasgo de Chaveta',
          sectorId: 'sec-3',
          estimatedMinutes: 35,
          machineOrWorkstation: 'Torno CNC Romi',
          instructions: 'Alojamento do rolamento tolerância js6, acabamento rugosidade Ra 0.8.',
        },
        {
          id: 'step-t-9',
          order: 3,
          name: 'Prensagem de Rolamentos e Montagem',
          sectorId: 'sec-6',
          estimatedMinutes: 20,
          machineOrWorkstation: 'Prensa Hidráulica 10t',
          instructions: 'Prensagem alinhada sem impacto na pista externa.',
        },
        {
          id: 'step-t-10',
          order: 4,
          name: 'Inspeção de Batimento e CQ',
          sectorId: 'sec-7',
          estimatedMinutes: 10,
          machineOrWorkstation: 'Mesa de desempeno e relógio comparador',
          instructions: 'Batimento radial máx 0.02mm. Lubrificação e etiqueta técnica.',
        },
      ],
      estimatedLaborCost: 95.0,
      active: true,
      createdAt: '2026-09-18T11:00:00Z',
      updatedAt: '2026-10-02T15:00:00Z',
    },
  ];

  const defaultCustomers: Customer[] = [
    {
      id: 'cust-1',
      code: 'CLI-001',
      name: 'Automação Industrial Alpha S.A.',
      tradeName: 'Alpha Tech Automação',
      document: '45.123.789/0001-44',
      email: 'compras@alphatech.com.br',
      phone: '(11) 3456-7890',
      address: 'Av. das Indústrias, 1500 - Galpão 4',
      city: 'Campinas',
      state: 'SP',
      notes: 'Cliente preferencial - faturamento 28 dias.',
      createdAt: '2026-08-10T10:00:00Z',
    },
    {
      id: 'cust-2',
      code: 'CLI-002',
      name: 'Logística & Transportes Sul-Americana',
      tradeName: 'Sul Log Movimentação',
      document: '19.876.543/0001-22',
      email: 'suprimentos@sullog.com.br',
      phone: '(19) 99876-1122',
      address: 'Rodovia Anhanguera, km 98',
      city: 'Jundiaí',
      state: 'SP',
      notes: 'Entregas sempre nas terças e quintas.',
      createdAt: '2026-09-02T11:00:00Z',
    },
  ];

  const defaultSuppliers: Supplier[] = [
    {
      id: 'sup-1',
      code: 'FOR-001',
      name: 'Siderúrgica Aço Nobre Distribuidora Ltda',
      tradeName: 'Aço Nobre Metais',
      document: '60.444.333/0001-88',
      email: 'vendas@aconobre.com.br',
      phone: '(11) 4004-9000',
      suppliedItems: 'Chapas de aço carbono 1020, barras trefiladas 1045',
      leadTimeDays: 4,
      address: 'Rua do Aço, 400 - São Bernardo do Campo/SP',
      createdAt: '2026-08-01T08:00:00Z',
    },
    {
      id: 'sup-2',
      code: 'FOR-002',
      name: 'Polímeros & Tintas Quimitec Indústria',
      tradeName: 'Quimitec Tintas',
      document: '71.555.222/0001-33',
      email: 'pedidos@quimitec.com.br',
      phone: '(11) 3211-5500',
      suppliedItems: 'Tintas em pó poliéster e epóxi, desengraxantes químicos',
      leadTimeDays: 3,
      address: 'Distrito Industrial 2, Sorocaba/SP',
      createdAt: '2026-08-15T09:00:00Z',
    },
    {
      id: 'sup-3',
      code: 'FOR-003',
      name: 'Rolamentos & Fixadores Brasil S.A.',
      tradeName: 'FixaTech Distribuidora',
      document: '52.111.999/0001-10',
      email: 'contato@fixatech.com.br',
      phone: '(11) 2899-7000',
      suppliedItems: 'Rolamentos industriais 6005, parafusos, porcas parlock e anéis elásticos',
      leadTimeDays: 2,
      address: 'Rua das Máquinas, 85 - São Paulo/SP',
      createdAt: '2026-08-20T10:00:00Z',
    },
  ];

  const defaultOrders: CustomerOrder[] = [
    {
      id: 'ord-101',
      orderNumber: 'PED-2026-101',
      customerId: 'cust-1',
      items: [
        {
          productId: 'prod-1',
          quantity: 10,
          unitPrice: 580.00,
          totalPrice: 5800.00,
        },
      ],
      totalAmount: 5800.00,
      issueDate: '2026-10-02T10:00:00Z',
      deliveryDate: '2026-10-18T17:00:00Z',
      status: 'EM_PRODUCAO',
      notes: 'Entrega única, embalagem para transporte rodoviário.',
      productionOrderId: 'op-2026-001',
    },
    {
      id: 'ord-102',
      orderNumber: 'PED-2026-102',
      customerId: 'cust-2',
      items: [
        {
          productId: 'prod-2',
          quantity: 25,
          unitPrice: 220.00,
          totalPrice: 5500.00,
        },
      ],
      totalAmount: 5500.00,
      issueDate: '2026-10-05T14:00:00Z',
      deliveryDate: '2026-10-22T17:00:00Z',
      status: 'PENDENTE',
      notes: 'Aguardando liberação de OP no PCP.',
    },
  ];

  const defaultProductionOrders: ProductionOrder[] = [
    {
      id: 'op-2026-001',
      code: 'OP-2026-001',
      customerOrderId: 'ord-101',
      customerId: 'cust-1',
      customerName: 'Automação Industrial Alpha S.A.',
      productId: 'prod-1',
      productName: 'Estrutura Metálica para Painel Industrial 800x600',
      productCode: 'PROD-EST-01',
      quantityToProduce: 10,
      quantityProduced: 0,
      quantityScrapped: 0,
      priority: 'ALTA',
      status: 'EM_ANDAMENTO',
      startDatePlanned: '2026-10-06T08:00:00Z',
      deliveryDatePlanned: '2026-10-16T17:00:00Z',
      startDateActual: '2026-10-07T08:15:00Z',
      totalEstimatedMinutes: 1750, // (25+30+45+40+20+15) * 10 = 175 min * 10 = 1750 min (~29h)
      totalActualMinutes: 520,
      technicalResponsible: 'Gabriela Cares Souza (CREA / SENAI-SP)',
      notes: 'Atenção ao esquadro das portas e alinhamento dos fechos rápidos.',
      materialsAllocated: [
        {
          materialId: 'mat-1',
          materialName: 'Chapa de Aço Carbono 1020 (3mm x 1200x3000mm)',
          materialUnit: 'kg',
          requiredQuantity: 125,
          withdrawn: true,
        },
        {
          materialId: 'mat-2',
          materialName: 'Tubo de Aço Estrutural Quadrado 50x50x2mm',
          materialUnit: 'm',
          requiredQuantity: 42,
          withdrawn: true,
        },
        {
          materialId: 'mat-4',
          materialName: 'Tinta Eletrostática a Pó Epóxi Preto Fosco',
          materialUnit: 'kg',
          requiredQuantity: 12,
          withdrawn: true,
        },
        {
          materialId: 'mat-6',
          materialName: 'Parafuso Sextavado M8x35mm Aço 8.8 Galvanizado',
          materialUnit: 'un',
          requiredQuantity: 160,
          withdrawn: true,
        },
      ],
      steps: [
        {
          id: 'op-step-1',
          stepName: 'Corte de Chapas e Perfis',
          sectorId: 'sec-1',
          order: 1,
          estimatedMinutesTotal: 250,
          actualMinutesSpent: 240,
          status: 'CONCLUIDO',
          operatorName: 'Marcos Silva (Op. Laser CNC)',
          startedAt: '2026-10-07T08:30:00Z',
          finishedAt: '2026-10-07T12:30:00Z',
          notes: 'Corte executado sem desvios dimensionais.',
        },
        {
          id: 'op-step-2',
          stepName: 'Dobra e Vinco de Painéis',
          sectorId: 'sec-2',
          order: 2,
          estimatedMinutesTotal: 300,
          actualMinutesSpent: 280,
          status: 'CONCLUIDO',
          operatorName: 'Rodrigo Antunes (Op. Dobra)',
          startedAt: '2026-10-07T13:30:00Z',
          finishedAt: '2026-10-07T18:10:00Z',
          notes: 'Todos os 10 gabinetes dobrados conforme especificações.',
        },
        {
          id: 'op-step-3',
          stepName: 'Soldagem de Estrutura e Reforços',
          sectorId: 'sec-4',
          order: 3,
          estimatedMinutesTotal: 450,
          actualMinutesSpent: 0,
          status: 'EM_ANDAMENTO',
          operatorName: 'André Santos (Soldador MIG)',
          startedAt: '2026-10-08T08:00:00Z',
          notes: 'Soldagem das colunas e travas em andamento.',
        },
        {
          id: 'op-step-4',
          stepName: 'Pintura a Pó e Cura em Estufa',
          sectorId: 'sec-5',
          order: 4,
          estimatedMinutesTotal: 400,
          actualMinutesSpent: 0,
          status: 'PENDENTE',
        },
        {
          id: 'op-step-5',
          stepName: 'Montagem de Dobradiças e Fechos',
          sectorId: 'sec-6',
          order: 5,
          estimatedMinutesTotal: 200,
          actualMinutesSpent: 0,
          status: 'PENDENTE',
        },
        {
          id: 'op-step-6',
          stepName: 'Controle de Qualidade e Embalagem',
          sectorId: 'sec-7',
          order: 6,
          estimatedMinutesTotal: 150,
          actualMinutesSpent: 0,
          status: 'PENDENTE',
        },
      ],
      createdAt: '2026-10-06T08:00:00Z',
      updatedAt: '2026-10-08T08:00:00Z',
    },
  ];

  const db: DatabaseSchema = {
    technicalResponsible: defaultResponsible,
    materials: defaultMaterials,
    stockMovements: defaultStockMovements,
    products: defaultProducts,
    customers: defaultCustomers,
    suppliers: defaultSuppliers,
    capacity: defaultCapacity,
    orders: defaultOrders,
    productionOrders: defaultProductionOrders,
  };

  // Persist initial DB file
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Falha ao escrever DB inicial:', e);
  }

  return db;
}
