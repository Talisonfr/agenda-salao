# ROLE & CONTEXTO DO PROJETO
Você é um Arquiteto de Software Sênior, Especialista em Product Design (UI/UX Mobile-First) e Engenheiro Full-Stack. Sua missão é projetar e construir um **aplicativo web progressivo (PWA) de gestão completa e agendamento inteligente para um salão de beleza**.

O aplicativo será utilizado no celular (mobile-first, instalável na tela inicial como app nativo) pela proprietária (gestora principal) e sua equipe de profissionais, além de possuir uma interface pública e elegante para que as clientes solicitem horários.

---

# 1. DIRETRIZES DE DESIGN, SKILLS E REFERÊNCIAS VISUAIS

### Ativação de Mentalidade / Skills de Desenvolvimento
Ao planejar e codificar este projeto, aplique rigorosamente os padrões das seguintes metodologias/skills:
1. **`ui-ux-pro-max` & `awesome-design-md` (Design System & Experiência):**
   - **Paleta de Cores Sofisticada:** Base em Cinza Sofisticado (`#1E1E24` para textos principais e elementos de contraste, `#F7F6F8` e `#EFECEF` para fundos limpos e cards elevados) combinado com acentos em **Rosé Gold** (`#B76E79` primário, `#D49A9A` hover/highlights, `#F4E7E8` badges suaves).
   - **Tipografia & Hierarquia:** Fontes modernas com contraste editorial (ex: *Plus Jakarta Sans* ou *Inter* para UI e números tabulares `tabular-nums` nos valores financeiros, combinada com *Playfair Display* ou *Cormorant Garamond* apenas em títulos de destaque da vitrine pública da cliente).
   - **Ergonomia Mobile-First (Thumb Zone):** Navegação inferior fixa (*Bottom Navigation Bar*) com 4 a 5 abas principais de fácil alcance com o polegar; botões de ação rápida (*FAB*); gestos fluidos; feedback visual imediato (*toasts*, estados de carregamento *skeleton*, micro-interações suaves).
   - **Zero Poluição Visual:** Cards respiráveis, bordas sutis (`1px solid #E5E0E2`), sombras difusas elegantes e leitura instantânea de status por cores semânticas discretas.
2. **`get-shit-done` (Execução Prática & Código Completo):**
   - Entregue código limpo, modular, tipado com TypeScript, pronto para produção, sem placeholders genéricos (`// TODO`). Estruture desde o schema SQL do Supabase (com RLS) até os componentes React funcionais e responsivos.

### Referências de Mercado e UX (Benchmarks Modernos)
Inspire-se nos melhores fluxos de UX das plataformas líderes atuais do setor de beleza e bem-estar:
- **Fresha (`fresha.com`) & Squire (`getsquire.com`):** Clareza na grade de agenda por profissional, cards de status de agendamento limpos, checkout rápido somando serviços + produtos no mesmo carrinho/comanda.
- **Booksy (`booksy.com`) & Trinks (`trinks.com`):** Fluxo público intuitivo onde a cliente escolhe o serviço, vê a duração estimada e seleciona a preferência de data/hora sem fricção.
- **GlossGenius (`glossgenius.com`):** Estética boutique luxuosa, cartões de clientes VIP/mensalistas e relatórios financeiros visuais de alto impacto.

---

# 2. STACK TECNOLÓGICA OBRIGATÓRIA
- **Framework:** Next.js 14+ (App Router) com TypeScript.
- **Estilização & UI:** Tailwind CSS + Lucide React (ícones) + componentes acessíveis (estilo Shadcn/UI customizado na paleta Rosé Gold & Cinza Sofisticado).
- **Gráficos & Relatórios:** Recharts (gráficos responsivos para faturamento mensal, serviços vs. produtos e formas de pagamento).
- **Backend & Banco de Dados:** Supabase (PostgreSQL, Supabase Auth para login da proprietária e equipe, Row Level Security - RLS, e Realtime para notificar novas solicitações de agendamento).
- **PWA (Progressive Web App):** Configuração completa (`manifest.json`, ícones, meta tags Apple/Android e Service Worker) para instalação direta no smartphone da proprietária e da equipe com experiência full-screen.

---

# 3. REGRAS DE NEGÓCIO E FUNCIONALIDADES ESSENCIAIS

## A. Perfil de Usuários e Permissões (RBAC)
1. **Administradora / Proprietária (Acesso Total):**
   - Gerencia toda a equipe, aprova/negocia agendamentos, cadastra serviços e produtos, controla estoque, gerencia clientes mensalistas, visualiza todo o faturamento financeiro e comissões.
2. **Profissionais da Equipe (Acesso Restrito):**
   - Visualizam sua própria agenda (e a agenda geral se permitido), atualizam status dos seus atendimentos (Em andamento / Concluído) e visualizam apenas seus próprios atendimentos/comissões, sem acesso ao caixa global ou relatórios financeiros da proprietária.
3. **Cliente Final (Acesso Público via Link sem burocracia):**
   - Não precisa criar senha complexa; informa apenas Nome, WhatsApp (para identificação e vínculo histórico) e faz sua solicitação.

## B. Fluxo Inteligente de Agendamento com "Negociação de Horário" (Core Feature)
A proprietária não quer agenda aberta com confirmação automática para evitar horários isolados ("buracos" na semana). O fluxo deve funcionar assim:
1. **Solicitação da Cliente (Link Público):**
   - A cliente escolhe um ou mais serviços, escolhe a profissional de preferência (ou "Sem preferência"), seleciona uma data e faixa de horário desejada e envia a solicitação.
   - Status inicial: `PENDENTE_APROVACAO`.
2. **Triagem e Negociação pela Proprietária (Painel Admin):**
   - A proprietária recebe um alerta destacado na aba de **Solicitações** e tem **3 ações rápidas**:
     - **Aprovar:** Confirma exatamente o dia/horário pedido (`CONFIRMADO`).
     - **Propor Novo Horário / Remanejar (Contraproposta):** Abre um modal rápido onde a proprietária sugere outro dia ou horário (ex.: *"Olá [Nome], na quarta tenho agenda cheia às 14h, consigo te encaixar na quinta às 15h ou sexta às 10h, qual prefere?"*) e já gera um botão **"Enviar Proposta no WhatsApp"** com a mensagem pré-formatada via link `wa.me`, alterando o status para `EM_NEGOCIACAO`.
     - **Recusar / Sugerir Lista de Espera:** Com motivo opcional.
3. **Agenda Visual da Equipe:**
   - Visão diária e semanal com filtro por profissional, bloqueio manual de horários (almoço, folga) e encaixe rápido criado diretamente pela proprietária.

## C. Catálogo de Serviços & Comanda Integrada (Serviços + Revenda de Produtos)
1. **CRUD de Serviços:** Nome, categoria (Cabelo, Unhas, Estética, Sobrancelha, etc.), preço, duração estimada (em minutos) e % de comissão padrão.
2. **CRUD de Produtos (Revenda):**
   - Categorias específicas: **Cosméticos**, **Semi-joias / Acessórios** e **Kits Capilares**.
   - Campos: Nome, categoria, preço de custo, preço de venda, **quantidade em estoque atual** e **estoque mínimo** (com badge de alerta visual "Estoque Baixo" quando atingir o limite).
   - Registro rápido de **Entrada de Mercadoria** (compra/reposição) e **Saída por Venda** (baixa automática no estoque ao finalizar venda).
3. **Fechamento de Atendimento / Venda Avulsa (Checkout):**
   - Ao finalizar um serviço na agenda (ou abrir uma venda rápida de balcão), a proprietária pode adicionar facilmente produtos extras vendidos na hora (ex.: Escova + Kit Capilar + Brinco semi-joia).
   - Seleção da forma de pagamento: **Pix**, **Cartão de Crédito** (com opção de parcelas e taxa opcional), **Cartão de Débito**, **Dinheiro** ou **Abater do Plano Mensal**.

## D. Gestão de Clientes e Planos Mensais (Mensalistas)
1. **Ficha da Cliente:** Nome, WhatsApp, data de aniversário, observações técnicas (ex.: fórmula de coloração, alergias) e histórico completo de serviços e produtos comprados.
2. **Controle de Clientes Mensalistas:**
   - Cadastro de planos recorrentes (ex.: *Pacote 4 Escovas/Mês*, *Pé e Mão Mensal*, *Cronograma Capilar*).
   - Controle de status de pagamento do mês (`PAGO`, `PENDENTE`, `ATRASADO`), data de vencimento, valor da mensalidade e **contador de sessões utilizadas vs. disponíveis no mês** (ex.: 2 de 4 atendimentos usados).
   - Lembrete rápido de cobrança via WhatsApp com 1 clique.

## E. Módulo Financeiro e Relatórios Gerenciais (Visão Executiva)
Hoje o salão não possui controle financeiro; este módulo deve ser cristalino e direto ao ponto:
1. **Dashboard Resumo (Hoje / Semana / Mês):**
   - Faturamento Bruto Total.
   - Separação clara: **Receita de Serviços** vs. **Receita de Venda de Produtos** vs. **Receita de Planos Mensalistas**.
   - Lucro estimado em produtos (Venda - Custo).
   - Ticket Médio por cliente.
2. **Relatórios Mensais Filtráveis:**
   - Gráfico de evolução diária/mensal de entradas.
   - Distribuição por **Forma de Pagamento** (quanto entrou via Pix, Crédito, Débito, Dinheiro).
   - Ranking de **Serviços Mais Realizados** e **Produtos Mais Vendidos**.
   - Resumo de repasse/comissão por profissional da equipe.
   - Botão de exportação do fechamento mensal (CSV / PDF limpo para impressão ou envio).

---

# 4. FORMATO DE ENTREGA ESPERADO
Estruture sua resposta em etapas organizadas e executáveis:
1. **Arquitetura e Estrutura de Pastas (Next.js App Router):** Árvore completa de arquivos e rotas (`/`, `/agendar`, `/admin/agenda`, `/admin/solicitacoes`, `/admin/catalogo`, `/admin/clientes`, `/admin/financeiro`).
2. **Modelagem do Banco de Dados (SQL completo para Supabase):** Tabelas (`profiles`, `services`, `products`, `stock_movements`, `customers`, `monthly_plans`, `appointments`, `appointment_items`, `transactions`), enums, índices e políticas básicas de segurança (RLS).
3. **Configuração do Design System & PWA:** `tailwind.config.ts` com os tokens exatos de **Rosé Gold & Cinza Sofisticado**, `globals.css` e `manifest.json`.
4. **Implementação dos Componentes-Chave (Código Completo e Funcional):**
   - Tela pública de solicitação de agendamento (`/agendar`).
   - Painel de Triagem e Negociação de Horários com integração WhatsApp (`wa.me`).
   - Modal de Checkout/Comanda (somando serviços + produtos com baixa automática de estoque).
   - Dashboard Financeiro Mensal com gráficos Recharts e controle de mensalistas.
5. **Guia Rápido de Deploy e Instalação no Celular:** Passos objetivos para subir no Vercel + Supabase e instalar como aplicativo no iOS/Android da proprietária.