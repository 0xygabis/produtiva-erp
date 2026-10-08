# PCP Pro - Sistema de Planejamento e Controle de Produção (ERP Fabril Leve)

Sistema web full-stack desenvolvido para indústrias e empresas de manufatura realizarem o planejamento, apontamento e controle operacional da produção (PCP).

---

## 🛠️ Stack Tecnológica

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend:** Node.js, Express, TypeScript (TSX)
- **Persistência de Dados:** Banco de dados JSON com escrita atômica transacional em `/data/pcp_database.json` (zero dependências externas de banco, totalmente portátil e pronto para rodar localmente ou em nuvem)
- **Modo de Impressão:** Folhas de estilo dedicadas para impressão A4 (`@media print`) para fichas de chão de fábrica e relatórios técnicos.

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- **Node.js** (versão 18 ou superior instalada)
- **npm** (incluso com o Node.js)

### 2. Instalação das Dependências
Na raiz do projeto, execute:
```bash
npm install
```

### 3. Inicialização em Modo de Desenvolvimento
Inicie o servidor integrado (Express + Vite) na porta 3000:
```bash
npm run dev
```
O sistema estará acessível em: **`http://localhost:3000`**

### 4. Build de Produção
Para compilar os arquivos estáticos e executar em produção:
```bash
npm run build
npm start
```

---

## 🏭 Módulos e Funcionalidades Implementadas

### 1. Ficha Técnica do Produto (BOM & Processos)
- Cadastro de produtos com especificações técnicas e SKU.
- **Lista de Materiais (BOM):** definição dos insumos consumidos por unidade produzida.
- **Roteiro de Produção:** etapas sequenciais (ex: Corte, Dobra, Solda, Pintura, Montagem, Controle de Qualidade) com tempo padrão em minutos e máquina/dispositivo indicado.
- Cálculo automático de custos de insumos e tempo total de fabricação por unidade.

### 2. Matéria-Prima & Controle de Estoque
- Saldo atual e estoque mínimo de segurança com alertas visuais para reposição.
- Entrada manual de compras, ajustes de inventário físico e saídas.
- **Baixa Automática:** Ao finalizar uma Ordem de Produção (OP), os insumos consumidos são abatidos automaticamente do estoque físico.
- Histórico completo de movimentações com data, motivo, documento e responsável técnico.

### 3. Clientes & Fornecedores
- Cadastro completo de clientes (Razão Social, CNPJ/CPF, contatos e endereços).
- Cadastro de fornecedores com prazo médio de entrega (*Lead Time* em dias) e insumos fornecidos.

### 4. Capacidade Produtiva da Empresa
- Definição de setores fabris, postos/máquinas e operadores alocados.
- Turnos de trabalho diários, horas por turno e taxa de eficiência (OEE %).
- Análise em tempo real de **Carga Horária Alocada em OPs Ativas vs. Capacidade Semanal Disponível** com detecção automática de gargalos de produção.

### 5. Pedidos de Clientes & Geração de OPs
- Registro de pedidos de vendas com itens, quantidades, valores e prazos.
- **Emissão de OP em 1 clique:** Gera a Ordem de Produção a partir do pedido, calculando automaticamente insumos necessários e tempos totais pelo roteiro da ficha técnica.

### 6. Acompanhamento de Produção em Tempo Real (Chão de Fábrica)
- Visão em Lista e Quadro Kanban interativo (Aberta, Em Andamento, Concluída).
- **Apontamento em Tempo Real:** Cronômetro integrado para medir o tempo exato de cada etapa no chão de fábrica, com identificação do operador responsável.
- Comparativo contínuo entre **Tempo Previsto vs. Tempo Real**.

### 7. Baixa e Finalização de Produção
- Modal de baixa operacional: apuração de peças conformes e refugos com motivo.
- Abate automático no estoque de matérias-primas e liberação do produto final.
- Assinatura e chancela do Responsável Técnico.

### 8. Emissão e Impressão de Ordens de Produção e Relatórios
- **Ficha de Chão de Fábrica (Padrão A4):** layout industrial limpo com checklist de separação do almoxarifado, roteiro de fabricação para rubrica dos operadores e campo de Controle de Qualidade.
- Relatórios analíticos com impressão direta em papel ou PDF:
  - Acompanhamento de Ordens de Produção por Status.
  - Análise de Desvios de Tempo e Eficiência (Previsto vs. Real).
  - Posição Crítica de Estoque para Compras.
  - Carga e Ocupação dos Setores Fabris.

### 9. Responsável Técnico
- Exibição destacada do **Nome e Registro Profissional (CREA/CRQ)** do Responsável Técnico em todas as telas principais, cabeçalhos, relatórios e fichas de produção.
- Modal dedicado para alterar dados cadastrais do responsável técnico e da empresa.
