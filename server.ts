import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import {
  readDatabase,
  writeDatabase,
  getInitialDatabaseData,
  DatabaseSchema,
  Material,
  StockMovement,
  ProductRecipe,
  Customer,
  Supplier,
  CompanyCapacity,
  WorkSector,
  CustomerOrder,
  ProductionOrder,
  ProductionOrderStepLog,
} from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // Ensure DB is initialized
  let db = readDatabase();

  // Helper to persist
  const save = () => writeDatabase(db);

  // -------------------------------------------------------------------------
  // Config & Responsável Técnico
  // -------------------------------------------------------------------------
  app.get('/api/config', (req, res) => {
    res.json(db.technicalResponsible);
  });

  app.put('/api/config', (req, res) => {
    db.technicalResponsible = {
      ...db.technicalResponsible,
      ...req.body,
    };
    save();
    res.json(db.technicalResponsible);
  });

  // -------------------------------------------------------------------------
  // Matérias-Primas & Estoque
  // -------------------------------------------------------------------------
  app.get('/api/materials', (req, res) => {
    res.json(db.materials);
  });

  app.post('/api/materials', (req, res) => {
    const { code, name, unit, currentStock, minStock, costUnit, supplierId, location, notes } = req.body;
    if (!name || !unit) {
      return res.status(400).json({ error: 'Nome e unidade de medida são obrigatórios' });
    }

    const newMaterial: Material = {
      id: `mat-${crypto.randomUUID().slice(0, 8)}`,
      code: code || `MP-${(db.materials.length + 1).toString().padStart(3, '0')}`,
      name,
      unit,
      currentStock: Number(currentStock) || 0,
      minStock: Number(minStock) || 0,
      costUnit: Number(costUnit) || 0,
      supplierId: supplierId || '',
      location: location || '',
      notes: notes || '',
      updatedAt: new Date().toISOString(),
    };

    db.materials.push(newMaterial);

    if (newMaterial.currentStock > 0) {
      db.stockMovements.push({
        id: `mov-${crypto.randomUUID().slice(0, 8)}`,
        materialId: newMaterial.id,
        type: 'ENTRADA',
        quantity: newMaterial.currentStock,
        reason: 'Saldo inicial de estoque',
        date: new Date().toISOString(),
        responsibleName: db.technicalResponsible.name,
      });
    }

    save();
    res.status(201).json(newMaterial);
  });

  app.put('/api/materials/:id', (req, res) => {
    const idx = db.materials.findIndex((m) => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Matéria-prima não encontrada' });

    db.materials[idx] = {
      ...db.materials[idx],
      ...req.body,
      id: db.materials[idx].id,
      currentStock: Number(req.body.currentStock ?? db.materials[idx].currentStock),
      minStock: Number(req.body.minStock ?? db.materials[idx].minStock),
      costUnit: Number(req.body.costUnit ?? db.materials[idx].costUnit),
      updatedAt: new Date().toISOString(),
    };
    save();
    res.json(db.materials[idx]);
  });

  app.post('/api/materials/:id/movement', (req, res) => {
    const idx = db.materials.findIndex((m) => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Matéria-prima não encontrada' });

    const { type, quantity, reason, referenceId } = req.body;
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      return res.status(400).json({ error: 'Quantidade informada deve ser maior que zero' });
    }

    const material = db.materials[idx];
    if (type === 'SAIDA_PRODUCAO' && material.currentStock < qty) {
      return res.status(400).json({ error: `Estoque insuficiente. Saldo atual: ${material.currentStock} ${material.unit}` });
    }

    if (type === 'ENTRADA') {
      material.currentStock += qty;
    } else if (type === 'SAIDA_PRODUCAO') {
      material.currentStock -= qty;
    } else if (type === 'AJUSTE') {
      material.currentStock = qty; // Se ajuste for o novo saldo total
    }

    material.updatedAt = new Date().toISOString();

    const movement: StockMovement = {
      id: `mov-${crypto.randomUUID().slice(0, 8)}`,
      materialId: material.id,
      type: type || 'AJUSTE',
      quantity: qty,
      reason: reason || 'Movimentação manual pelo Resp. Técnico',
      referenceId: referenceId || '',
      date: new Date().toISOString(),
      responsibleName: db.technicalResponsible.name,
    };

    db.stockMovements.unshift(movement);
    save();

    res.json({ material, movement });
  });

  app.get('/api/stock-movements', (req, res) => {
    const movementsWithDetails = db.stockMovements.map((mov) => {
      const mat = db.materials.find((m) => m.id === mov.materialId);
      return {
        ...mov,
        materialCode: mat?.code || 'N/A',
        materialName: mat?.name || 'Insumo Desconhecido',
        materialUnit: mat?.unit || '',
      };
    });
    res.json(movementsWithDetails);
  });

  app.delete('/api/materials/:id', (req, res) => {
    // Check if used in any product
    const inUse = db.products.some((p) => p.materials.some((m) => m.materialId === req.params.id));
    if (inUse) {
      return res.status(400).json({ error: 'Esta matéria-prima está em uso na Ficha Técnica de um ou mais produtos cadastrados.' });
    }

    db.materials = db.materials.filter((m) => m.id !== req.params.id);
    db.stockMovements = db.stockMovements.filter((m) => m.materialId !== req.params.id);
    save();
    res.json({ success: true });
  });

  // -------------------------------------------------------------------------
  // Ficha Técnica do Produto (BOM + Roteiro de Processo com Tempos)
  // -------------------------------------------------------------------------
  app.get('/api/products', (req, res) => {
    // Enrich with material names and calculated costs
    const enriched = db.products.map((prod) => {
      let materialCost = 0;
      const materialsWithDetails = prod.materials.map((item) => {
        const mat = db.materials.find((m) => m.id === item.materialId);
        const cost = (mat?.costUnit || 0) * (item.quantityPerUnit || 0);
        materialCost += cost;
        return {
          ...item,
          materialName: mat?.name || 'Insumo não encontrado',
          materialCode: mat?.code || '',
          materialUnit: mat?.unit || 'un',
          currentStock: mat?.currentStock || 0,
          costUnit: mat?.costUnit || 0,
          costTotal: cost,
        };
      });

      const totalProcessMinutes = prod.processSteps.reduce(
        (acc, step) => acc + (step.estimatedMinutes || 0),
        0
      );

      return {
        ...prod,
        materialsWithDetails,
        totalMaterialCost: materialCost,
        totalProcessMinutes,
      };
    });

    res.json(enriched);
  });

  app.get('/api/products/:id', (req, res) => {
    const prod = db.products.find((p) => p.id === req.params.id);
    if (!prod) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(prod);
  });

  app.post('/api/products', (req, res) => {
    const {
      code,
      name,
      description,
      category,
      unit,
      specifications,
      materials,
      processSteps,
      estimatedLaborCost,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'O nome do produto é obrigatório' });
    }

    const newProduct: ProductRecipe = {
      id: `prod-${crypto.randomUUID().slice(0, 8)}`,
      code: code || `PROD-${(db.products.length + 1).toString().padStart(3, '0')}`,
      name,
      description: description || '',
      category: category || 'Geral',
      unit: unit || 'UN',
      specifications: specifications || '',
      materials: Array.isArray(materials) ? materials : [],
      processSteps: Array.isArray(processSteps)
        ? processSteps.map((s: any, idx: number) => ({
            ...s,
            id: s.id || `step-${crypto.randomUUID().slice(0, 6)}`,
            order: idx + 1,
            estimatedMinutes: Number(s.estimatedMinutes) || 0,
          }))
        : [],
      estimatedLaborCost: Number(estimatedLaborCost) || 0,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.products.push(newProduct);
    save();
    res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', (req, res) => {
    const idx = db.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Produto não encontrado' });

    const p = db.products[idx];
    db.products[idx] = {
      ...p,
      ...req.body,
      id: p.id,
      materials: Array.isArray(req.body.materials) ? req.body.materials : p.materials,
      processSteps: Array.isArray(req.body.processSteps)
        ? req.body.processSteps.map((s: any, i: number) => ({
            ...s,
            id: s.id || `step-${crypto.randomUUID().slice(0, 6)}`,
            order: i + 1,
            estimatedMinutes: Number(s.estimatedMinutes) || 0,
          }))
        : p.processSteps,
      estimatedLaborCost: Number(req.body.estimatedLaborCost ?? p.estimatedLaborCost),
      updatedAt: new Date().toISOString(),
    };

    save();
    res.json(db.products[idx]);
  });

  app.delete('/api/products/:id', (req, res) => {
    // Check if in any open production order
    const inUse = db.productionOrders.some(
      (op) => op.productId === req.params.id && op.status !== 'CONCLUIDA' && op.status !== 'CANCELADA'
    );
    if (inUse) {
      return res.status(400).json({ error: 'Produto possui Ordens de Produção ativas em andamento.' });
    }

    db.products = db.products.filter((p) => p.id !== req.params.id);
    save();
    res.json({ success: true });
  });

  // -------------------------------------------------------------------------
  // Clientes
  // -------------------------------------------------------------------------
  app.get('/api/customers', (req, res) => {
    res.json(db.customers);
  });

  app.post('/api/customers', (req, res) => {
    const { name, tradeName, document, email, phone, address, city, state, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Razão Social / Nome é obrigatório' });

    const newCustomer: Customer = {
      id: `cust-${crypto.randomUUID().slice(0, 8)}`,
      code: `CLI-${(db.customers.length + 1).toString().padStart(3, '0')}`,
      name,
      tradeName: tradeName || '',
      document: document || '',
      email: email || '',
      phone: phone || '',
      address: address || '',
      city: city || '',
      state: state || '',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    db.customers.push(newCustomer);
    save();
    res.status(201).json(newCustomer);
  });

  app.put('/api/customers/:id', (req, res) => {
    const idx = db.customers.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Cliente não encontrado' });
    db.customers[idx] = { ...db.customers[idx], ...req.body, id: db.customers[idx].id };
    save();
    res.json(db.customers[idx]);
  });

  app.delete('/api/customers/:id', (req, res) => {
    const hasOrders = db.orders.some((o) => o.customerId === req.params.id);
    if (hasOrders) {
      return res.status(400).json({ error: 'Cliente possui pedidos registrados no sistema.' });
    }
    db.customers = db.customers.filter((c) => c.id !== req.params.id);
    save();
    res.json({ success: true });
  });

  // -------------------------------------------------------------------------
  // Fornecedores
  // -------------------------------------------------------------------------
  app.get('/api/suppliers', (req, res) => {
    res.json(db.suppliers);
  });

  app.post('/api/suppliers', (req, res) => {
    const { name, tradeName, document, email, phone, suppliedItems, leadTimeDays, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome do fornecedor é obrigatório' });

    const newSupplier: Supplier = {
      id: `sup-${crypto.randomUUID().slice(0, 8)}`,
      code: `FOR-${(db.suppliers.length + 1).toString().padStart(3, '0')}`,
      name,
      tradeName: tradeName || '',
      document: document || '',
      email: email || '',
      phone: phone || '',
      suppliedItems: suppliedItems || '',
      leadTimeDays: Number(leadTimeDays) || 3,
      address: address || '',
      createdAt: new Date().toISOString(),
    };

    db.suppliers.push(newSupplier);
    save();
    res.status(201).json(newSupplier);
  });

  app.put('/api/suppliers/:id', (req, res) => {
    const idx = db.suppliers.findIndex((s) => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Fornecedor não encontrado' });
    db.suppliers[idx] = {
      ...db.suppliers[idx],
      ...req.body,
      id: db.suppliers[idx].id,
      leadTimeDays: Number(req.body.leadTimeDays ?? db.suppliers[idx].leadTimeDays),
    };
    save();
    res.json(db.suppliers[idx]);
  });

  app.delete('/api/suppliers/:id', (req, res) => {
    db.suppliers = db.suppliers.filter((s) => s.id !== req.params.id);
    save();
    res.json({ success: true });
  });

  // -------------------------------------------------------------------------
  // Capacidade Produtiva da Empresa
  // -------------------------------------------------------------------------
  app.get('/api/capacity', (req, res) => {
    // Calculate total hours per day and week for each sector
    const sectorsWithHours = db.capacity.sectors.map((sec) => {
      // Horas disponíveis por dia = operadores * turnos * horas/turno * (eficiencia / 100)
      const dailyGrossHours = sec.operatorsCount * sec.shiftsPerDay * sec.hoursPerShift;
      const dailyEffectiveHours = dailyGrossHours * (sec.efficiencyRate / 100);
      const weeklyEffectiveHours = dailyEffectiveHours * db.capacity.workDaysPerWeek;

      // Carga alocada: horas de OPs abertas e em andamento que usam este setor
      let allocatedMinutes = 0;
      db.productionOrders
        .filter((op) => op.status === 'ABERTA' || op.status === 'EM_ANDAMENTO')
        .forEach((op) => {
          op.steps
            .filter((s) => s.sectorId === sec.id && s.status !== 'CONCLUIDO')
            .forEach((s) => {
              allocatedMinutes += Math.max(0, s.estimatedMinutesTotal - s.actualMinutesSpent);
            });
        });

      const allocatedHours = Number((allocatedMinutes / 60).toFixed(1));
      const weeklyCapacityHours = Number(weeklyEffectiveHours.toFixed(1));
      const occupancyRate = weeklyCapacityHours > 0
        ? Math.min(200, Math.round((allocatedHours / weeklyCapacityHours) * 100))
        : 0;

      return {
        ...sec,
        dailyGrossHours,
        dailyEffectiveHours: Number(dailyEffectiveHours.toFixed(1)),
        weeklyEffectiveHours: weeklyCapacityHours,
        allocatedHours,
        occupancyRate,
      };
    });

    res.json({
      workDaysPerWeek: db.capacity.workDaysPerWeek,
      updatedAt: db.capacity.updatedAt,
      sectors: sectorsWithHours,
    });
  });

  app.put('/api/capacity', (req, res) => {
    const { workDaysPerWeek, sectors } = req.body;
    db.capacity = {
      workDaysPerWeek: Number(workDaysPerWeek) || 5,
      sectors: Array.isArray(sectors) ? sectors : db.capacity.sectors,
      updatedAt: new Date().toISOString(),
    };
    save();
    res.json(db.capacity);
  });

  app.post('/api/capacity/sectors', (req, res) => {
    const { name, workstationsCount, operatorsCount, shiftsPerDay, hoursPerShift, efficiencyRate, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome do setor é obrigatório' });

    const newSector: WorkSector = {
      id: `sec-${crypto.randomUUID().slice(0, 8)}`,
      name,
      workstationsCount: Number(workstationsCount) || 1,
      operatorsCount: Number(operatorsCount) || 1,
      shiftsPerDay: Number(shiftsPerDay) || 1,
      hoursPerShift: Number(hoursPerShift) || 8,
      efficiencyRate: Number(efficiencyRate) || 85,
      notes: notes || '',
    };

    db.capacity.sectors.push(newSector);
    db.capacity.updatedAt = new Date().toISOString();
    save();
    res.status(201).json(newSector);
  });

  app.put('/api/capacity/sectors/:id', (req, res) => {
    const idx = db.capacity.sectors.findIndex((s) => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Setor não encontrado' });

    db.capacity.sectors[idx] = {
      ...db.capacity.sectors[idx],
      ...req.body,
      id: db.capacity.sectors[idx].id,
      workstationsCount: Number(req.body.workstationsCount ?? db.capacity.sectors[idx].workstationsCount),
      operatorsCount: Number(req.body.operatorsCount ?? db.capacity.sectors[idx].operatorsCount),
      shiftsPerDay: Number(req.body.shiftsPerDay ?? db.capacity.sectors[idx].shiftsPerDay),
      hoursPerShift: Number(req.body.hoursPerShift ?? db.capacity.sectors[idx].hoursPerShift),
      efficiencyRate: Number(req.body.efficiencyRate ?? db.capacity.sectors[idx].efficiencyRate),
    };
    db.capacity.updatedAt = new Date().toISOString();
    save();
    res.json(db.capacity.sectors[idx]);
  });

  app.delete('/api/capacity/sectors/:id', (req, res) => {
    db.capacity.sectors = db.capacity.sectors.filter((s) => s.id !== req.params.id);
    db.capacity.updatedAt = new Date().toISOString();
    save();
    res.json({ success: true });
  });

  // -------------------------------------------------------------------------
  // Pedidos de Clientes
  // -------------------------------------------------------------------------
  app.get('/api/orders', (req, res) => {
    const ordersWithDetails = db.orders.map((ord) => {
      const cust = db.customers.find((c) => c.id === ord.customerId);
      const itemsWithProduct = ord.items.map((it) => {
        const prod = db.products.find((p) => p.id === it.productId);
        return {
          ...it,
          productName: prod?.name || 'Produto não encontrado',
          productCode: prod?.code || '',
        };
      });

      const linkedOP = db.productionOrders.find((op) => op.customerOrderId === ord.id);

      return {
        ...ord,
        customerName: cust?.name || cust?.tradeName || 'Cliente não encontrado',
        customerDocument: cust?.document || '',
        itemsWithProduct,
        linkedOPCode: linkedOP?.code,
        linkedOPStatus: linkedOP?.status,
      };
    });

    res.json(ordersWithDetails);
  });

  app.post('/api/orders', (req, res) => {
    const { customerId, items, deliveryDate, notes } = req.body;
    if (!customerId) return res.status(400).json({ error: 'Cliente é obrigatório' });
    if (!items || !items.length) return res.status(400).json({ error: 'Pedido deve conter ao menos um item' });

    const processedItems: any[] = items.map((it: any) => ({
      productId: it.productId,
      quantity: Number(it.quantity) || 1,
      unitPrice: Number(it.unitPrice) || 0,
      totalPrice: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
    }));

    const totalAmount = processedItems.reduce((acc, it) => acc + it.totalPrice, 0);

    const newOrder: CustomerOrder = {
      id: `ord-${crypto.randomUUID().slice(0, 8)}`,
      orderNumber: `PED-2026-${(db.orders.length + 101).toString()}`,
      customerId,
      items: processedItems,
      totalAmount,
      issueDate: new Date().toISOString(),
      deliveryDate: deliveryDate || new Date(Date.now() + 14 * 86400000).toISOString(),
      status: 'PENDENTE',
      notes: notes || '',
    };

    db.orders.unshift(newOrder);
    save();
    res.status(201).json(newOrder);
  });

  app.put('/api/orders/:id', (req, res) => {
    const idx = db.orders.findIndex((o) => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Pedido não encontrado' });

    db.orders[idx] = {
      ...db.orders[idx],
      ...req.body,
      id: db.orders[idx].id,
    };
    save();
    res.json(db.orders[idx]);
  });

  app.delete('/api/orders/:id', (req, res) => {
    const ord = db.orders.find((o) => o.id === req.params.id);
    if (ord && ord.productionOrderId) {
      return res.status(400).json({ error: 'Este pedido possui Ordem de Produção vinculada.' });
    }
    db.orders = db.orders.filter((o) => o.id !== req.params.id);
    save();
    res.json({ success: true });
  });

  // -------------------------------------------------------------------------
  // Gerar Ordem de Produção a partir de Pedido de Cliente (Ponto Central do Fluxo)
  // -------------------------------------------------------------------------
  app.post('/api/orders/:id/generate-op', (req, res) => {
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });

    const { productId, quantity } = req.body;
    // Se não especificado, pega o primeiro item do pedido
    const targetItem = productId
      ? order.items.find((it) => it.productId === productId)
      : order.items[0];

    if (!targetItem) {
      return res.status(400).json({ error: 'Nenhum produto válido encontrado no pedido' });
    }

    const product = db.products.find((p) => p.id === targetItem.productId);
    if (!product) {
      return res.status(400).json({ error: 'Ficha técnica do produto não encontrada' });
    }

    const cust = db.customers.find((c) => c.id === order.customerId);
    const qtyToProduce = Number(quantity) || targetItem.quantity;

    // Calcular insumos requeridos conforme a Ficha Técnica (BOM)
    const materialsAllocated = product.materials.map((bomItem) => {
      const mat = db.materials.find((m) => m.id === bomItem.materialId);
      const reqQty = Number(((bomItem.quantityPerUnit || 0) * qtyToProduce).toFixed(3));
      return {
        materialId: bomItem.materialId,
        materialName: mat?.name || 'Insumo',
        materialUnit: mat?.unit || '',
        requiredQuantity: reqQty,
        withdrawn: false,
      };
    });

    // Calcular etapas com tempos totais estimados
    const steps: ProductionOrderStepLog[] = product.processSteps.map((pStep, index) => ({
      id: `op-step-${crypto.randomUUID().slice(0, 6)}`,
      stepName: pStep.name,
      sectorId: pStep.sectorId,
      order: index + 1,
      estimatedMinutesTotal: (pStep.estimatedMinutes || 0) * qtyToProduce,
      actualMinutesSpent: 0,
      status: index === 0 ? 'EM_ANDAMENTO' : 'PENDENTE',
      notes: pStep.instructions || '',
      startedAt: index === 0 ? new Date().toISOString() : undefined,
    }));

    const totalEstimatedMinutes = steps.reduce((sum, s) => sum + s.estimatedMinutesTotal, 0);

    const opCode = `OP-2026-${(db.productionOrders.length + 1).toString().padStart(3, '0')}`;

    const newOP: ProductionOrder = {
      id: `op-${crypto.randomUUID().slice(0, 8)}`,
      code: opCode,
      customerOrderId: order.id,
      customerId: order.customerId,
      customerName: cust?.name || cust?.tradeName || 'Cliente',
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      quantityToProduce: qtyToProduce,
      quantityProduced: 0,
      quantityScrapped: 0,
      priority: req.body.priority || 'NORMAL',
      status: 'EM_ANDAMENTO',
      startDatePlanned: new Date().toISOString(),
      deliveryDatePlanned: order.deliveryDate,
      startDateActual: new Date().toISOString(),
      totalEstimatedMinutes,
      totalActualMinutes: 0,
      steps,
      materialsAllocated,
      technicalResponsible: `${db.technicalResponsible.name} (${db.technicalResponsible.registrationNumber})`,
      notes: `Gerada automaticamente a partir do pedido ${order.orderNumber}. ${req.body.notes || ''}`.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.productionOrders.unshift(newOP);

    // Atualizar status do pedido para 'EM_PRODUCAO'
    order.status = 'EM_PRODUCAO';
    order.productionOrderId = newOP.id;

    save();
    res.status(201).json(newOP);
  });

  // -------------------------------------------------------------------------
  // Ordens de Produção (PCP Core: Acompanhamento, Apontamento e Baixa)
  // -------------------------------------------------------------------------
  app.get('/api/production-orders', (req, res) => {
    // Enrich with sector names in steps
    const enriched = db.productionOrders.map((op) => {
      const stepsWithSector = op.steps.map((st) => {
        const sec = db.capacity.sectors.find((s) => s.id === st.sectorId);
        return {
          ...st,
          sectorName: sec?.name || 'Setor Fabril',
        };
      });

      // Calculate progress percentage
      const totalSteps = op.steps.length;
      const completedSteps = op.steps.filter((s) => s.status === 'CONCLUIDO').length;
      const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

      // Check material availability
      const materialsChecked = op.materialsAllocated.map((mAlloc) => {
        const currentMat = db.materials.find((m) => m.id === mAlloc.materialId);
        return {
          ...mAlloc,
          availableStock: currentMat?.currentStock ?? 0,
          isStockSufficient: (currentMat?.currentStock ?? 0) >= mAlloc.requiredQuantity,
        };
      });

      return {
        ...op,
        steps: stepsWithSector,
        materialsAllocated: materialsChecked,
        progressPercent,
      };
    });

    res.json(enriched);
  });

  app.get('/api/production-orders/:id', (req, res) => {
    const op = db.productionOrders.find((p) => p.id === req.params.id);
    if (!op) return res.status(404).json({ error: 'Ordem de Produção não encontrada' });

    const stepsWithSector = op.steps.map((st) => {
      const sec = db.capacity.sectors.find((s) => s.id === st.sectorId);
      return {
        ...st,
        sectorName: sec?.name || 'Setor Fabril',
      };
    });

    const materialsChecked = op.materialsAllocated.map((mAlloc) => {
      const currentMat = db.materials.find((m) => m.id === mAlloc.materialId);
      return {
        ...mAlloc,
        availableStock: currentMat?.currentStock ?? 0,
        isStockSufficient: (currentMat?.currentStock ?? 0) >= mAlloc.requiredQuantity,
      };
    });

    res.json({
      ...op,
      steps: stepsWithSector,
      materialsAllocated: materialsChecked,
    });
  });

  // Criar OP manual avulsa (ex: para estoque de segurança)
  app.post('/api/production-orders', (req, res) => {
    const { productId, quantityToProduce, priority, deliveryDatePlanned, notes } = req.body;
    if (!productId) return res.status(400).json({ error: 'Produto é obrigatório' });

    const product = db.products.find((p) => p.id === productId);
    if (!product) return res.status(404).json({ error: 'Ficha Técnica do produto não encontrada' });

    const qty = Number(quantityToProduce) || 1;

    // Calcular insumos requeridos conforme a Ficha Técnica
    const materialsAllocated = product.materials.map((bomItem) => {
      const mat = db.materials.find((m) => m.id === bomItem.materialId);
      const reqQty = Number(((bomItem.quantityPerUnit || 0) * qty).toFixed(3));
      return {
        materialId: bomItem.materialId,
        materialName: mat?.name || 'Insumo',
        materialUnit: mat?.unit || '',
        requiredQuantity: reqQty,
        withdrawn: false,
      };
    });

    const steps: ProductionOrderStepLog[] = product.processSteps.map((pStep, index) => ({
      id: `op-step-${crypto.randomUUID().slice(0, 6)}`,
      stepName: pStep.name,
      sectorId: pStep.sectorId,
      order: index + 1,
      estimatedMinutesTotal: (pStep.estimatedMinutes || 0) * qty,
      actualMinutesSpent: 0,
      status: index === 0 ? 'EM_ANDAMENTO' : 'PENDENTE',
      notes: pStep.instructions || '',
      startedAt: index === 0 ? new Date().toISOString() : undefined,
    }));

    const totalEstimatedMinutes = steps.reduce((sum, s) => sum + s.estimatedMinutesTotal, 0);
    const opCode = `OP-2026-${(db.productionOrders.length + 1).toString().padStart(3, '0')}`;

    const newOP: ProductionOrder = {
      id: `op-${crypto.randomUUID().slice(0, 8)}`,
      code: opCode,
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      quantityToProduce: qty,
      quantityProduced: 0,
      quantityScrapped: 0,
      priority: priority || 'NORMAL',
      status: 'EM_ANDAMENTO',
      startDatePlanned: new Date().toISOString(),
      deliveryDatePlanned: deliveryDatePlanned || new Date(Date.now() + 7 * 86400000).toISOString(),
      startDateActual: new Date().toISOString(),
      totalEstimatedMinutes,
      totalActualMinutes: 0,
      steps,
      materialsAllocated,
      technicalResponsible: `${db.technicalResponsible.name} (${db.technicalResponsible.registrationNumber})`,
      notes: notes || 'Ordem de Produção avulsa para estoque de segurança.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.productionOrders.unshift(newOP);
    save();
    res.status(201).json(newOP);
  });

  // Apontamento em tempo real de etapa (iniciar, pausar, registrar tempo e operador)
  app.post('/api/production-orders/:id/steps/:stepId/log', (req, res) => {
    const op = db.productionOrders.find((p) => p.id === req.params.id);
    if (!op) return res.status(404).json({ error: 'Ordem de Produção não encontrada' });

    const step = op.steps.find((s) => s.id === req.params.stepId);
    if (!step) return res.status(404).json({ error: 'Etapa não encontrada' });

    const { status, operatorName, addMinutes, actualMinutesSpent, notes } = req.body;

    if (operatorName) step.operatorName = operatorName;
    if (notes !== undefined) step.notes = notes;

    if (addMinutes) {
      step.actualMinutesSpent = Math.max(0, step.actualMinutesSpent + Number(addMinutes));
    } else if (actualMinutesSpent !== undefined) {
      step.actualMinutesSpent = Math.max(0, Number(actualMinutesSpent));
    }

    if (status) {
      step.status = status;
      if (status === 'EM_ANDAMENTO' && !step.startedAt) {
        step.startedAt = new Date().toISOString();
      }
      if (status === 'CONCLUIDO') {
        step.finishedAt = new Date().toISOString();

        // Se houver próxima etapa pendente, colocar a próxima em andamento se desejado
        const currentOrder = step.order;
        const nextStep = op.steps.find((s) => s.order === currentOrder + 1);
        if (nextStep && nextStep.status === 'PENDENTE') {
          nextStep.status = 'EM_ANDAMENTO';
          nextStep.startedAt = new Date().toISOString();
        }
      }
    }

    // Recalcular tempo real total da OP
    op.totalActualMinutes = op.steps.reduce((acc, s) => acc + (s.actualMinutesSpent || 0), 0);
    op.updatedAt = new Date().toISOString();

    save();
    res.json({ op, step });
  });

  // -------------------------------------------------------------------------
  // Baixa (Finalização) de Ordem de Produção
  // -------------------------------------------------------------------------
  app.post('/api/production-orders/:id/complete', (req, res) => {
    const op = db.productionOrders.find((p) => p.id === req.params.id);
    if (!op) return res.status(404).json({ error: 'Ordem de Produção não encontrada' });

    const { quantityProduced, quantityScrapped, scrapReason, notes } = req.body;
    const qtyProduced = Number(quantityProduced) ?? op.quantityToProduce;
    const qtyScrapped = Number(quantityScrapped) || 0;

    op.quantityProduced = qtyProduced;
    op.quantityScrapped = qtyScrapped;
    op.scrapReason = scrapReason || '';
    op.finishDateActual = new Date().toISOString();
    op.status = 'CONCLUIDA';
    if (notes) {
      op.notes = `${op.notes || ''} [Baixa realizada: ${notes}]`.trim();
    }

    // Marcar todas as etapas restantes como concluídas se não estiverem
    op.steps.forEach((s) => {
      if (s.status !== 'CONCLUIDO') {
        s.status = 'CONCLUIDO';
        if (!s.finishedAt) s.finishedAt = new Date().toISOString();
        if (s.actualMinutesSpent === 0) s.actualMinutesSpent = s.estimatedMinutesTotal;
      }
    });

    op.totalActualMinutes = op.steps.reduce((acc, s) => acc + (s.actualMinutesSpent || 0), 0);

    // BAIXA AUTOMÁTICA NO ESTOQUE DE MATÉRIAS-PRIMAS:
    // Abate as matérias-primas consumidas no estoque real e registra no histórico de movimentações
    op.materialsAllocated.forEach((mAlloc) => {
      const mat = db.materials.find((m) => m.id === mAlloc.materialId);
      if (mat) {
        mat.currentStock = Math.max(0, Number((mat.currentStock - mAlloc.requiredQuantity).toFixed(3)));
        mat.updatedAt = new Date().toISOString();
        mAlloc.withdrawn = true;

        // Registrar saída
        db.stockMovements.unshift({
          id: `mov-${crypto.randomUUID().slice(0, 8)}`,
          materialId: mat.id,
          type: 'SAIDA_PRODUCAO',
          quantity: mAlloc.requiredQuantity,
          reason: `Baixa de produção OP ${op.code} - ${op.productName} (Qtd: ${qtyProduced})`,
          referenceId: op.code,
          date: new Date().toISOString(),
          responsibleName: db.technicalResponsible.name,
        });
      }
    });

    // Se a OP estiver vinculada a um Pedido de Cliente, marcar pedido como CONCLUIDO
    if (op.customerOrderId) {
      const linkedOrder = db.orders.find((o) => o.id === op.customerOrderId);
      if (linkedOrder) {
        linkedOrder.status = 'CONCLUIDO';
      }
    }

    op.updatedAt = new Date().toISOString();
    save();

    res.json({ success: true, op });
  });

  app.put('/api/production-orders/:id/status', (req, res) => {
    const op = db.productionOrders.find((p) => p.id === req.params.id);
    if (!op) return res.status(404).json({ error: 'Ordem de Produção não encontrada' });

    const { status } = req.body;
    if (status) {
      op.status = status;
      op.updatedAt = new Date().toISOString();
      save();
    }
    res.json(op);
  });

  app.delete('/api/production-orders/:id', (req, res) => {
    const op = db.productionOrders.find((p) => p.id === req.params.id);
    if (op && op.status === 'CONCLUIDA') {
      return res.status(400).json({ error: 'Ordens de Produção já finalizadas não podem ser excluídas para manter a rastreabilidade.' });
    }

    db.productionOrders = db.productionOrders.filter((p) => p.id !== req.params.id);
    save();
    res.json({ success: true });
  });

  // -------------------------------------------------------------------------
  // Relatórios & Dashboard Analítico
  // -------------------------------------------------------------------------
  app.get('/api/reports/dashboard', (req, res) => {
    const totalOps = db.productionOrders.length;
    const openOps = db.productionOrders.filter((op) => op.status === 'ABERTA').length;
    const inProgressOps = db.productionOrders.filter((op) => op.status === 'EM_ANDAMENTO').length;
    const completedOps = db.productionOrders.filter((op) => op.status === 'CONCLUIDA').length;

    // Matérias primas com estoque crítico (menor ou igual ao estoque mínimo)
    const criticalMaterials = db.materials.filter((m) => m.currentStock <= m.minStock);

    // Total de horas planejadas vs horas reais nas OPs concluídas
    const completedOrdersList = db.productionOrders.filter((op) => op.status === 'CONCLUIDA');
    const totalEstimatedCompletedHours = Number(
      (completedOrdersList.reduce((acc, op) => acc + op.totalEstimatedMinutes, 0) / 60).toFixed(1)
    );
    const totalActualCompletedHours = Number(
      (completedOrdersList.reduce((acc, op) => acc + op.totalActualMinutes, 0) / 60).toFixed(1)
    );

    // Eficiência média = (Tempo Planejado / Tempo Real) * 100
    const globalEfficiency = totalActualCompletedHours > 0
      ? Math.round((totalEstimatedCompletedHours / totalActualCompletedHours) * 100)
      : 100;

    // Pedidos pendentes e faturados
    const pendingOrders = db.orders.filter((o) => o.status === 'PENDENTE' || o.status === 'EM_PRODUCAO').length;
    const totalOrderRevenue = db.orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    res.json({
      totalOps,
      openOps,
      inProgressOps,
      completedOps,
      criticalMaterialsCount: criticalMaterials.length,
      criticalMaterials,
      totalEstimatedCompletedHours,
      totalActualCompletedHours,
      globalEfficiency,
      pendingOrders,
      totalOrderRevenue,
      technicalResponsible: db.technicalResponsible,
    });
  });

  // Resetar base de dados para dados de demonstração originais
  app.post('/api/reset-data', (req, res) => {
    db = getInitialDatabaseData();
    save();
    res.json({ success: true, message: 'Dados de demonstração da fábrica restaurados com sucesso!' });
  });

  // -------------------------------------------------------------------------
  // Vite Integration (Development Middleware Mode & Production Serving)
  // -------------------------------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PCP Pro Server rodando na porta ${PORT} (http://0.0.0.0:${PORT})`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err);
  process.exit(1);
});
