# ZapFlow (ZapierToN8N MigrationHelper) — Conversor Inteligente de Zaps para Workflows n8n
**Projeto 05 do Desafio 12 Projetos em 12 Semanas (12x12)**

---

## 🎯 Visão e Proposta de Valor
**ZapFlow** é uma plataforma web *local-first* (100% client-side, zero upload obrigatório de dados sensíveis para servidores) que resolve uma das maiores dores financeiras e operacionais de empresas digitais e agências de automação: **a migração em massa do Zapier para o n8n**.

À medida que o volume de tarefas cresce no Zapier, as faturas mensais explodem para $100 a $1.500+/mês. O **n8n** é a alternativa ideal (open-source, self-hosted e até 95% mais barato), mas reescrever 20, 40 ou 100 "Zaps" complexos manualmente — recriando gatilhos, mapeando variáveis, reescrevendo filtros, convertendo *Formatter*, *Paths* e scripts de código — consome dezenas de horas de engenharia.

O **ZapFlow** automatiza essa transição em segundos através de 4 pilares:
1. **Motor de Transpilação Determinístico (Zapier AST $\rightarrow$ n8n Workflow JSON):** Importa arquivos `.json` de exportação do Zapier (único ou em lote de dezenas de Zaps) e gera workflows `.json` estruturados para o n8n com posicionamento automático em grafo (DAG), conexões multi-branch (`If` / `Switch`), conversão de mais de 30 integrações líderes e geração automática de *Sticky Notes* (`n8n-nodes-base.stickyNote`) documentando credenciais e passos de revisão direto no canvas do n8n.
2. **Transpilador de Expressões e Variáveis:** Converte sintaxes proprietárias do Zapier (`{{12345__email}}`, `{{step_1__data__id}}`, `{{zap_meta_human_now}}`) para a sintaxe oficial de expressões do n8n (`={{ $json.email }}`, `={{ $('Webhook').item.json.data.id }}`, `={{ $now.toISO() }}`).
3. **Co-Piloto IA Opcional (BYOK — Groq / OpenAI / Claude):** Traduz blocos de código customizados do *Code by Zapier* (JavaScript/Python baseados em `inputData` e `output`) para o padrão estrito do nó *Code* do n8n (`$input.all()`, `$json`, retorno `[{ json: ... }]`).
4. **Estratégia de Monetização Dupla (Licença de Lote + Afiliado Recorrente Railway):**
   - **Calculadora Interativa de ROI:** Mostra em tempo real quanto o usuário economizará por mês e por ano trocando sua fatura atual do Zapier por uma instância n8n na Railway (~$5/mês).
   - **Assistente de Deploy 1-Click na Railway (Link de Afiliado):** Botão de alta conversão pós-migração e no cabeçalho: *"Não tem o n8n rodando ainda? Suba agora na Railway com nosso template otimizado (PostgreSQL + Redis + SSL) por ~$5/mês"*, utilizando o link de afiliado da Railway (`?referralCode=...`) para gerar receita recorrente passiva em dólar.

---

## 👤 Público-Alvo
- **Agências de No-Code, IA e Automação:** Consultores que migram clientes do Zapier para o n8n e precisam entregar dezenas de fluxos funcionando em horas em vez de semanas.
- **Startups, SaaS e PMEs:** Times de operações (RevOps, Marketing Ops, CS) sufocados pelo aumento progressivo de preços por tarefa (*task-based pricing*) do Zapier.
- **Desenvolvedores & Freelancers:** Profissionais que querem adotar o n8n self-hosted na Railway sem passar pelo trabalho braçal de recriar automações legadas do zero.

---

## 🛠️ Stack Tecnológica (Alinhada às Regras de Ouro 12x12)
- **Frontend Core:** Vite + React 19 + TypeScript (estrito, zero `any`) + Tailwind CSS v4 (`@tailwindcss/vite`) + Lucide React.
- **Processamento Local (100% Client-Side):**
  - Engine própria de parsing e transpilação AST (`src/services/zapierParser.ts`, `src/services/expressionTranspiler.ts`, `src/services/n8nGenerator.ts`).
  - Validador estrutural e sintático de workflows n8n (`src/services/n8nValidator.ts`).
  - Empacotamento em lote `.zip` no navegador para múltiplos workflows convertidos (`jszip` ou gerador ZIP nativo).
- **Persistência Local:** `localStorage` tipado para histórico de migrações, configurações de link de afiliado Railway, chaves BYOK de IA e estado da licença Pro.
- **Roteamento & Deploy Híbrido:**
  - `base: './'` no `vite.config.ts` para compatibilidade imediata com **GitHub Pages**.
  - `railway.json` configurado para deploy instantâneo na **Railway**.

---

## 🏛️ Arquitetura do Projeto

```text
05-zapier-to-n8n/
├── .planning/                      # Planejamento completo GSD (PROJECT, REQUIREMENTS, ROADMAP, STATE, phases/)
├── index.html                      # Entrypoint HTML com metadados SEO e fonte Inter/JetBrains Mono
├── package.json                    # Dependências React 19, Vite, Tailwind v4, Lucide
├── tsconfig.json                   # TypeScript estrito
├── vite.config.ts                  # Configurado com base: './' e @tailwindcss/vite
├── railway.json                    # Deploy one-click na Railway
└── src/
    ├── types/
    │   └── index.ts                # Interfaces completas (ZapierExport, ZapStep, N8nWorkflow, N8nNode, MigrationReport, RoiCalculation, AffiliateConfig)
    ├── constants/
    │   ├── nodeMappings.ts         # Catálogo de 30+ mapeamentos Zapier App/Action -> n8n Node Type & Parameters
    │   ├── sampleZaps.ts           # 5 Zaps reais complexos prontos para teste em 1 clique
    │   └── defaults.ts             # Planos do Zapier (preços oficiais), config Railway Affiliate, limites Free/Pro e cupons
    ├── services/                   # LÓGICA DE NEGÓCIO PURA (Isolada da UI)
    │   ├── zapierParser.ts         # Detecção de formato (v1, v2, Blueprint, Lote) e normalização em ZapierAST
    │   ├── expressionTranspiler.ts # Conversão de {{step__field}} para ={{ $json.field }} e variáveis de sistema
    │   ├── n8nGenerator.ts         # Construção do DAG n8n, coordenadas [x,y], conexões, Sticky Notes e HTTP fallbacks
    │   ├── n8nValidator.ts         # Validação de schema n8n, score de confiança (0-100%) e checklist de credenciais
    │   ├── aiCopilotService.ts     # Conversão opcional BYOK (Groq/OpenAI/Claude) para Code by Zapier (JS/Python)
    │   ├── roiCalculatorService.ts # Cálculo matemático de economia mensal/anual (USD e BRL) Zapier vs n8n Railway
    │   └── storageService.ts       # Persistência em localStorage (histórico, chaves BYOK, config afiliado, licença Pro)
    ├── context/
    │   └── MigrationContext.tsx    # Estado global do workbench, conversão em lote, calculadora ROI e modal Pro
    └── components/                 # INTERFACE DE USUÁRIO (Dark Mode Moderno & Micro-interações)
        ├── Header.tsx              # Topo com badge Pro, botão Deploy n8n Railway ($5/mês) e seletor de abas
        ├── UploadDropzone.tsx      # Drag & Drop de .json, colagem de JSON bruto ou seleção de 5 Zaps de Exemplo
        ├── VisualFlowDiff.tsx      # Grafo visual lado a lado: Passos do Zapier vs. Nós do n8n + Sticky Notes
        ├── CodeInspector.tsx       # Visualizador do JSON n8n com Copy-to-Canvas (Ctrl+V no n8n) e Download .json/.zip
        ├── MigrationReportCard.tsx # Score de confiança, checklist de credenciais, alertas de webhook e status de validação
        ├── RoiAffiliateBanner.tsx  # Calculadora interativa de economia + CTA para Template Railway com link de afiliado
        ├── AiCopilotModal.tsx      # Configuração BYOK para refinar scripts JS/Python com IA
        └── PaywallModal.tsx        # Desbloqueio de conversão em lote ilimitada (R$ 59) + sistema de cupons
```

---

## ✅ Critérios de Sucesso (Definition of Done)
1. O usuário consegue arrastar qualquer arquivo `.json` exportado do Zapier (único ou pacote com múltiplos Zaps) ou escolher um dos **5 exemplos reais inclusos** com 1 clique.
2. O motor converte gatilhos, ações, filtros (`Filter by Zapier` $\rightarrow$ `n8n-nodes-base.if`), ramificações (`Paths by Zapier` $\rightarrow$ `n8n-nodes-base.switch`), formatações (`Formatter` $\rightarrow$ `DateTime` / `Set` / `Code`), webhooks e mais de 30 apps populares para nós nativos do n8n v1+.
3. Todas as expressões de variáveis do Zapier (`{{...}}`) são transpiladas para a sintaxe `={{ $json... }}` ou `={{ $('NomeDoNo').item.json... }}` do n8n.
4. O workflow gerado inclui automaticamente um `n8n-nodes-base.stickyNote` amarelo/roxo no topo do canvas do n8n listando as credenciais que o usuário precisa conectar após colar o fluxo.
5. O usuário pode clicar em **"Copiar para Área de Transferência (Colar no n8n)"** e dar `Ctrl+V` / `Cmd+V` diretamente dentro do canvas aberto do n8n, ou baixar o arquivo `.json` individual / lote completo.
6. A **Calculadora de ROI + Card de Afiliado Railway** calcula a economia anual do usuário e direciona para o deploy de 1 clique do n8n na Railway com o código de referência (`?referralCode=...`).
7. O projeto compila com zero erros ou avisos (`npm run build` e `npx tsc --noEmit`).
