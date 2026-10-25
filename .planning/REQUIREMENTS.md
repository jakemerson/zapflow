# Requisitos Escopados — ZapFlow (05-zapier-to-n8n)

> Todos os requisitos possuem identificadores únicos (`REQ-*`) para rastreabilidade direta nos planos de fase (`PLAN.md`) e na verificação de entrega (`VERIFICATION.md`).

---

## 1. Parser Universal de Exportações do Zapier (`REQ-PRS`)
- **REQ-PRS-01 (Suporte Multi-Formato Zapier):** O parser deve aceitar e normalizar automaticamente:
  1. Exportação oficial de conta do Zapier contendo múltiplos Zaps (`{ "zaps": [ ... ] }`).
  2. Exportação de um único Zap (`{ "title": "...", "steps": [ ... ] }` ou `{ "nodes": { ... } }`).
  3. Formato Blueprint / Shared Template do Zapier.
- **REQ-PRS-02 (Extração Completa de Metadados do Passo):** Para cada passo (*step*) do Zap, o parser deve extrair: `id`, `index`, `title`, `app` (ex: `slack`, `webhooks`, `google_sheets`, `filter`, `paths`), `EventType` (`trigger` | `action` | `search` | `filter` | `path` | `code` | `delay` | `formatter`), `actionType` (ex: `catch_hook`, `post`, `send_channel_message`, `create_spreadsheet_row`), `params` (dicionário de entradas) e ramificações filhas (`children` para *Paths*).
- **REQ-PRS-03 (Validação e Diagnóstico de Entrada):** Se o arquivo ou texto colado não for um JSON válido ou não contiver estrutura reconhecível de automação, o sistema deve exibir mensagem de erro clara em português indicando a linha/motivo e oferecendo o carregamento de um template de exemplo em 1 clique.
- **REQ-PRS-04 (Galeria Integrada de 5 Zaps Reais):** O sistema deve incluir 5 templates reais e ricos do Zapier prontos para testar sem precisar de arquivo externo:
  1. *Lead Capture & CRM Sync:* Webhook Catch Hook $\rightarrow$ Filter by Zapier $\rightarrow$ Formatter (Text) $\rightarrow$ HubSpot Create Contact $\rightarrow$ Slack Channel Alert.
  2. *E-Commerce Order Router (Multi-Path):* Stripe New Charge $\rightarrow$ Paths by Zapier (VIP `> $500` vs Standard) $\rightarrow$ Google Sheets Append Row + Gmail Send Email.
  3. *AI Content & Notion Pipeline:* Schedule by Zapier $\rightarrow$ HTTP Request (RSS/API) $\rightarrow$ OpenAI Prompt $\rightarrow$ Code by Zapier (JS) $\rightarrow$ Notion Create Page.
  4. *Customer Support Escalation:* Typeform Entry $\rightarrow$ Delay by Zapier (15m) $\rightarrow$ Airtable Search/Create $\rightarrow$ Discord Webhook + Trello Card.
  5. *Pacote em Lote (Batch Agency Pack):* Arquivo contendo 4 Zaps simultâneos para demonstrar a conversão em lote e o relatório executivo de migração.

---

## 2. Transpilador de Expressões e Mapeamento de Dados (`REQ-EXP`)
- **REQ-EXP-01 (Conversão de Tokens de Passo do Zapier):** Expressões no formato `{{12345__campo}}`, `{{step_1__user__email}}` ou `{{1.email}}` devem ser convertidas para a sintaxe oficial do n8n:
  - Quando referenciarem o passo imediatamente anterior: `={{ $json.campo }}` ou `={{ $json.user.email }}`.
  - Quando referenciarem um passo anterior específico pelo ID ou índice: `={{ $('Nome do Nó').item.json.campo }}`.
- **REQ-EXP-02 (Variáveis de Sistema e Datas do Zapier):** Variáveis especiais do Zapier devem ser convertidas para equivalentes nativos do Luxon/n8n:
  - `{{zap_meta_human_now}}` / `{{zap_meta_utc_iso}}` $\rightarrow$ `={{ $now.toISO() }}`.
  - `{{zap_meta_timestamp}}` $\rightarrow$ `={{ $now.toUnixInteger() }}`.
- **REQ-EXP-03 (Interpolação Mista Texto + Expressão):** Textos que combinam strings estáticas e múltiplas variáveis (ex: `"Novo lead: {{1__name}} ({{1__email}})"`) devem gerar uma única expressão n8n limpa ou template string válido (`=Novo lead: {{ $json.name }} ({{ $json.email }})`).

---

## 3. Gerador de Workflows n8n & Catálogo de Nós (`REQ-GEN`)
- **REQ-GEN-01 (Catálogo de 30+ Integrações Mapeadas):** O gerador deve mapear nativamente os principais apps do Zapier para seus nós oficiais do n8n (`typeVersion` moderno), incluindo:
  - **Gatilhos & Utilitários Core:** `n8n-nodes-base.webhook`, `n8n-nodes-base.scheduleTrigger`, `n8n-nodes-base.httpRequest`, `n8n-nodes-base.if` (Filter by Zapier), `n8n-nodes-base.switch` (Paths by Zapier), `n8n-nodes-base.wait` (Delay by Zapier), `n8n-nodes-base.code` (Code by Zapier), `n8n-nodes-base.dateTime` e `n8n-nodes-base.set` (Formatter by Zapier).
  - **Comunicação & Mensageria:** Slack (`n8n-nodes-base.slack`), Gmail (`n8n-nodes-base.gmail`), Discord (`n8n-nodes-base.discord`), Telegram (`n8n-nodes-base.telegram`), Microsoft Teams (`n8n-nodes-base.microsoftTeams`), Twilio (`n8n-nodes-base.twilio`).
  - **Planilhas, Bancos & Produtividade:** Google Sheets (`n8n-nodes-base.googleSheets`), Airtable (`n8n-nodes-base.airtable`), Notion (`n8n-nodes-base.notion`), Trello (`n8n-nodes-base.trello`), Asana (`n8n-nodes-base.asana`), Google Drive (`n8n-nodes-base.googleDrive`), Google Calendar (`n8n-nodes-base.googleCalendar`).
  - **CRM, Vendas & Pagamentos:** HubSpot (`n8n-nodes-base.hubspot`), Pipedrive (`n8n-nodes-base.pipedrive`), Stripe (`n8n-nodes-base.stripe`), Shopify (`n8n-nodes-base.shopify`), ActiveCampaign (`n8n-nodes-base.activeCampaign`), Mailchimp (`n8n-nodes-base.mailchimp`), Zendesk (`n8n-nodes-base.zendesk`).
  - **IA & DevTools:** OpenAI (`@n8n/n8n-nodes-langchain.openAi` / `n8n-nodes-base.openAi`), GitHub (`n8n-nodes-base.github`), Postgres (`n8n-nodes-base.postgres`), MySQL (`n8n-nodes-base.mySql`).
- **REQ-GEN-02 (Fallback Inteligente via HTTP Request + Nota Explicativa):** Quando um passo do Zapier utilizar um aplicativo de nicho sem nó nativo direto no catálogo, o gerador nunca deve falhar: deve criar um nó `n8n-nodes-base.httpRequest` pré-configurado com os parâmetros originais no payload e anexar um aviso claro no relatório de migração.
- **REQ-GEN-03 (Auto-Layout Geométrico do Grafo DAG):** Os nós gerados devem receber coordenadas `[x, y]` espaçadas horizontalmente (`x += 280`) e verticalmente em caso de ramificações (`If` / `Switch` com `y` divergente), evitando sobreposição visual quando o usuário colar o JSON no canvas do n8n.
- **REQ-GEN-04 (Sticky Note de Documentação Automática no Canvas):** Todo workflow n8n gerado deve incluir automaticamente um nó `n8n-nodes-base.stickyNote` posicionado acima do fluxo com: nome original do Zap, data da migração, lista de credenciais que precisam ser vinculadas no n8n e link rápido para subir ou escalar a instância n8n na Railway.
- **REQ-GEN-05 (Validador de Conformidade e Score de Confiança):** O validador interno deve inspecionar o JSON gerado, verificando integridade de `nodes`, `connections`, sintaxe de expressões e calculando o **Score de Confiança da Migração (0% a 100%)** (ex: 100% para nós com mapeamento 1:1 direto; redução proporcional quando exigir revisão manual de script ou endpoint HTTP genérico).

---

## 4. Co-Piloto IA BYOK para Conversão de Código (`REQ-AIC`)
- **REQ-AIC-01 (Conversor Heurístico Local + Refinamento IA Opcional):** Para passos `Code by Zapier` (JavaScript ou Python), o sistema deve aplicar primeiro uma transformação estática local (`inputData.x` $\rightarrow$ `$input.first().json.x` e `output = {...}` $\rightarrow$ `return [{ json: {...} }]`) e permitir acionar um motor de IA opcional (Groq `llama-3.3-70b-versatile`, OpenAI `gpt-4o-mini` ou Anthropic `claude-3-5-haiku`) com a chave do próprio usuário (BYOK) para reescrever scripts complexos no padrão exato do Code Node do n8n.

---

## 5. Calculadora de ROI, Motor de Afiliado Railway & Monetização (`REQ-MON`)
- **REQ-MON-01 (Calculadora Interativa Zapier vs. n8n Railway):** O usuário deve poder ajustar um slider com seu volume mensal de tarefas no Zapier (ex: `2.000`, `10.000`, `50.000`, `100.000`, `500.000` tarefas/mês) e visualizar instantaneamente:
  - Custo mensal estimado no Zapier (em USD e BRL).
  - Custo mensal do n8n rodando na Railway (~$5 a $10/mês).
  - **Economia Mensal e Economia Anual Acumulada** (em USD e BRL) + percentual poupado (ex: `94% de economia`).
- **REQ-MON-02 (Assistente de 1 Clique Railway com Link de Afiliado):** Exibir CTA estratégico (no topo, na calculadora e no card de conclusão da conversão):
  - Botão principal: **"🚀 Subir n8n na Railway em 60s (~$5/mês)"** apontando para a URL do template Railway configurada com `?referralCode=...`.
  - Modal/Painel expansível de "Configurar Link de Afiliado (Parceiros/Agências)" permitindo customizar o `referralCode` e a URL do template Railway (com persistência em `localStorage`).
- **REQ-MON-03 (Modelo Freemium + Licença Pro de Lote & Cupons):**
  - **Plano Gratuito:** Conversão individual ilimitada de Zaps (1 Zap por vez) + cópia direta para o n8n + calculadora de ROI.
  - **Plano Pro / Agency Batch (`R$ 59` vitalício):** Desbloqueia conversão em lote simultânea (múltiplos Zaps de uma vez), download de pacote consolidado, remoção de marca d'água nas Sticky Notes do canvas e personalização White-Label do cabeçalho da Sticky Note para agências entregarem aos seus clientes.
  - **Sistema de Cupons:** Suporte a resgate imediato de cupons promocionais (`DESAFIO12X12`, `ZAPFLOWPRO`, `RAILWAYVIP`, `TESTEPRO`) para testes e demonstrações.

---

## 6. Experiência de Uso, Workbench Visual & Deploy (`REQ-UI` & `REQ-DEP`)
- **REQ-UI-01 (Workbench em 3 Colunas / Abas Responsivas):**
  1. **Entrada & Lote:** Upload `.json`, editor de colagem rápida, seletor dos 5 Zaps de exemplo e lista de Zaps detectados no arquivo.
  2. **Visualização & Auditoria:** Diagrama visual comparativo (Passos Zapier $\rightarrow$ Grafo de Nós n8n), Score de Confiança e Checklist de Credenciais/Webhooks pós-migração.
  3. **Código n8n & Exportação:** JSON formatado com botões **"Copiar Workflow (Colar com Ctrl+V no n8n)"** (com toast de confirmação), **"Baixar .json"** e card de deploy na Railway.
- **REQ-DEP-01 (Build Limpo & Caminhos Relativos):** `vite.config.ts` configurado com `base: './'`, zero erros em `npx tsc --noEmit` e `npm run build`, e `railway.json` pronto para deploy.
