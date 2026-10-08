import React, { useState } from 'react';
import {
  Users,
  Truck,
  Plus,
  Edit,
  Trash2,
  Search,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertTriangle,
  X,
  UserCheck,
} from 'lucide-react';
import { Customer, Supplier, TechnicalResponsible } from '../types/index.ts';
import { api } from '../services/api.ts';

interface PartnersViewProps {
  customers: Customer[];
  suppliers: Supplier[];
  technicalResponsible: TechnicalResponsible | null;
  onRefresh: () => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  customers,
  suppliers,
  technicalResponsible,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer Form
  const [cName, setCName] = useState('');
  const [cTradeName, setCTradeName] = useState('');
  const [cDocument, setCDocument] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cAddress, setCAddress] = useState('');
  const [cCity, setCCity] = useState('');
  const [cState, setCState] = useState('');
  const [cNotes, setCNotes] = useState('');

  // Supplier Form
  const [sName, setSName] = useState('');
  const [sTradeName, setSTradeName] = useState('');
  const [sDocument, setSDocument] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sItems, setSItems] = useState('');
  const [sLeadTime, setSLeadTime] = useState(3);
  const [sAddress, setSAddress] = useState('');

  const openNewCustomer = () => {
    setEditingCustomer(null);
    setCName('');
    setCTradeName('');
    setCDocument('');
    setCEmail('');
    setCPhone('');
    setCAddress('');
    setCCity('');
    setCState('SP');
    setCNotes('');
    setError(null);
    setIsCustomerModalOpen(true);
  };

  const openEditCustomer = (c: Customer) => {
    setEditingCustomer(c);
    setCName(c.name);
    setCTradeName(c.tradeName || '');
    setCDocument(c.document);
    setCEmail(c.email);
    setCPhone(c.phone);
    setCAddress(c.address);
    setCCity(c.city);
    setCState(c.state);
    setCNotes(c.notes || '');
    setError(null);
    setIsCustomerModalOpen(true);
  };

  const openNewSupplier = () => {
    setEditingSupplier(null);
    setSName('');
    setSTradeName('');
    setSDocument('');
    setSEmail('');
    setSPhone('');
    setSItems('');
    setSLeadTime(3);
    setSAddress('');
    setError(null);
    setIsSupplierModalOpen(true);
  };

  const openEditSupplier = (s: Supplier) => {
    setEditingSupplier(s);
    setSName(s.name);
    setSTradeName(s.tradeName || '');
    setSDocument(s.document);
    setSEmail(s.email);
    setSPhone(s.phone);
    setSItems(s.suppliedItems);
    setSLeadTime(s.leadTimeDays);
    setSAddress(s.address);
    setError(null);
    setIsSupplierModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) {
      setError('A Razão Social / Nome é obrigatória.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name: cName,
      tradeName: cTradeName,
      document: cDocument,
      email: cEmail,
      phone: cPhone,
      address: cAddress,
      city: cCity,
      state: cState,
      notes: cNotes,
    };

    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, payload);
      } else {
        await api.createCustomer(payload);
      }
      setIsCustomerModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim()) {
      setError('O nome do fornecedor é obrigatório.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name: sName,
      tradeName: sTradeName,
      document: sDocument,
      email: sEmail,
      phone: sPhone,
      suppliedItems: sItems,
      leadTimeDays: Number(sLeadTime),
      address: sAddress,
    };

    try {
      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.id, payload);
      } else {
        await api.createSupplier(payload);
      }
      setIsSupplierModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar fornecedor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Deseja excluir este cliente?')) return;
    try {
      await api.deleteCustomer(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir cliente');
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Deseja excluir este fornecedor?')) return;
    try {
      await api.deleteSupplier(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir fornecedor');
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.tradeName && c.tradeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.document.includes(searchQuery)
  );

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.tradeName && s.tradeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.suppliedItems.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Cadastro de Clientes & Fornecedores</h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono font-semibold">
              {customers.length} clientes | {suppliers.length} fornecedores
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Gestão cadastral, contatos, dados fiscais e prazos de entrega (Lead Time)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-lg text-xs font-medium">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>Resp. Técnico: <strong>{technicalResponsible?.name}</strong></span>
          </div>

          {activeTab === 'customers' ? (
            <button
              onClick={openNewCustomer}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Cliente</span>
            </button>
          ) : (
            <button
              onClick={openNewSupplier}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Fornecedor</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Clientes ({customers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'suppliers'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Fornecedores ({suppliers.length})</span>
          </button>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={
              activeTab === 'customers'
                ? 'Buscar por cliente ou CNPJ...'
                : 'Buscar por fornecedor ou insumos...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4 text-left">Código / Razão Social</th>
                  <th className="py-3 px-4 text-left">CNPJ / CPF</th>
                  <th className="py-3 px-4 text-left">Contatos</th>
                  <th className="py-3 px-4 text-left">Localização</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[10px] text-slate-500 block font-bold">
                          {cust.code}
                        </span>
                        <div className="font-bold text-slate-900 text-xs">{cust.name}</div>
                        {cust.tradeName && (
                          <div className="text-[11px] text-blue-700">{cust.tradeName}</div>
                        )}
                        {cust.notes && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5">{cust.notes}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {cust.document || 'Não informado'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 space-y-0.5">
                        {cust.email && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{cust.email}</span>
                          </div>
                        )}
                        {cust.phone && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{cust.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {cust.city ? `${cust.city}/${cust.state}` : cust.address || 'Não informado'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditCustomer(cust)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(cust.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4 text-left">Código / Fornecedor</th>
                  <th className="py-3 px-4 text-left">CNPJ</th>
                  <th className="py-3 px-4 text-left">Insumos Fornecidos</th>
                  <th className="py-3 px-3 text-center">Lead Time (Entrega)</th>
                  <th className="py-3 px-4 text-left">Contatos</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Nenhum fornecedor encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[10px] text-slate-500 block font-bold">
                          {sup.code}
                        </span>
                        <div className="font-bold text-slate-900 text-xs">{sup.name}</div>
                        {sup.tradeName && (
                          <div className="text-[11px] text-blue-700">{sup.tradeName}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {sup.document}
                      </td>

                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {sup.suppliedItems || 'Diversos insumos industriais'}
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono font-bold text-blue-900">
                        {sup.leadTimeDays} dias
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 space-y-0.5">
                        {sup.email && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{sup.email}</span>
                          </div>
                        )}
                        {sup.phone && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{sup.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditSupplier(sup)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSupplier(sup.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
                </h3>
                <p className="text-xs text-slate-400">Dados cadastrais do comprador</p>
              </div>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Razão Social / Nome Completo: *
                  </label>
                  <input
                    type="text"
                    required
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Nome Fantasia:
                  </label>
                  <input
                    type="text"
                    value={cTradeName}
                    onChange={(e) => setCTradeName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    CNPJ ou CPF:
                  </label>
                  <input
                    type="text"
                    value={cDocument}
                    onChange={(e) => setCDocument(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">E-mail:</label>
                  <input
                    type="email"
                    value={cEmail}
                    onChange={(e) => setCEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Telefone / WhatsApp:
                  </label>
                  <input
                    type="text"
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Cidade:</label>
                  <input
                    type="text"
                    value={cCity}
                    onChange={(e) => setCCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">UF:</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={cState}
                    onChange={(e) => setCState(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Endereço:</label>
                <input
                  type="text"
                  value={cAddress}
                  onChange={(e) => setCAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
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
                  <span>{loading ? 'Salvando...' : 'Salvar Cliente'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                </h3>
                <p className="text-xs text-slate-400">Cadastro de parceiro de matérias-primas</p>
              </div>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveSupplier} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Razão Social do Fornecedor: *
                  </label>
                  <input
                    type="text"
                    required
                    value={sName}
                    onChange={(e) => setSName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Nome Fantasia:
                  </label>
                  <input
                    type="text"
                    value={sTradeName}
                    onChange={(e) => setSTradeName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">CNPJ:</label>
                  <input
                    type="text"
                    value={sDocument}
                    onChange={(e) => setSDocument(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Insumos Fornecidos:
                </label>
                <input
                  type="text"
                  value={sItems}
                  onChange={(e) => setSItems(e.target.value)}
                  placeholder="Ex: Chapas de aço 1020, parafusos, tintas em pó..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Prazo Médio de Entrega (Lead Time em Dias):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sLeadTime}
                    onChange={(e) => setSLeadTime(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Telefone:</label>
                  <input
                    type="text"
                    value={sPhone}
                    onChange={(e) => setSPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">E-mail Comercial:</label>
                <input
                  type="email"
                  value={sEmail}
                  onChange={(e) => setSEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
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
                  <span>{loading ? 'Salvando...' : 'Salvar Fornecedor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
