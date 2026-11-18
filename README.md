# Agenda Salão & Gestão Boutique (PWA)

Sistema completo de agendamento inteligente, triagem com negociação via WhatsApp, comandas integradas (serviços + revenda com baixa de estoque) e gestão financeira executiva para salões de beleza.

## Stack Tecnológica
- **Framework:** Next.js 14+ (App Router) com TypeScript
- **Estilização:** Tailwind CSS + Tokens Rosé Gold & Cinza Sofisticado + Lucide Icons
- **Gráficos:** Recharts
- **Banco de Dados & Auth:** Supabase (PostgreSQL, RLS, Triggers e Realtime)
- **PWA:** Manifest e ergonomia mobile-first (Thumb Zone)

---

## 1. Configuração do Supabase
1. Crie um projeto no [Supabase](https://supabase.com).
2. Acesse o **SQL Editor** do dashboard do Supabase.
3. Copie todo o conteúdo do arquivo [`supabase/schema.sql`](file:///e:/Ascendfy%20MKT/Trabalhos/Antigravity/Agenda%20Salão/supabase/schema.sql) e execute.
4. No menu **Project Settings > API**, copie a **Project URL** e o **anon public API Key**.
5. Crie o arquivo `.env.local` na raiz do projeto com as chaves:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-publica
   ```

---

## 2. Instalação e Execução Local
```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev
```
Acesse `http://localhost:3000`.

---

## 3. Deploy na Vercel
1. Suba o repositório para o GitHub.
2. Acesse [Vercel](https://vercel.com) e importe o repositório.
3. Nas configurações de **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique em **Deploy**.

---

## 4. Instalação no Smartphone da Proprietária e Equipe (PWA)
O sistema foi construído como Progressive Web App (PWA) otimizado para o polegar (*Thumb Zone*), dispensando taxas das lojas de aplicativos:

### No iPhone (iOS):
1. Abra a URL do sistema no navegador **Safari**.
2. Toque no botão central de **Compartilhar** (ícone de quadrado com seta para cima).
3. Role para baixo e selecione **"Adicionar à Tela de Início"**.
4. Confirme o nome e toque em **"Adicionar"**. O ícone aparecerá como aplicativo nativo em tela cheia sem barra de endereço.

### No Android:
1. Abra o sistema no navegador **Google Chrome**.
2. Toque nos 3 pontinhos no canto superior direito (ou aguarde a barra inferior de instalação).
3. Toque em **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.
4. O app será instalado no launcher com suporte a atalhos rápidos e abertura instantânea.
