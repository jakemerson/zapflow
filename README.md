# ⚡ ZapFlow — Zapier to n8n Workflow Migrator & ROI Engine

> **Projeto 05 do Desafio 12 Projetos em 12 Semanas (12x12)**  
> Transpilador determinístico *client-side* de exportações do Zapier (`.json`) para workflows prontos do **n8n v1+**, com conversor de expressões (`{{1__field}}` $\rightarrow$ `={{ $json.field }}`), injeção automática de *Sticky Notes* de documentação, Co-Piloto IA opcional (BYOK) e motor de afiliado **1-Click Deploy na Railway**.

---

## 🎯 Dor Real & Solução

Empresas e agências que utilizam **Zapier** veem suas faturas explodirem para centenas ou milhares de dólares mensais conforme o volume de tarefas cresce. O **n8n** é o substituto ideal (open-source, self-hosted e até 95% mais barato), mas reescrever 20, 40 ou 100 "Zaps" complexos manualmente — nó por nó, expressão por expressão — consome dezenas de horas técnicas.

O **ZapFlow** automatiza essa migração instantaneamente no navegador (100% privado, zero upload para servidores externos):
1. **Parser Universal do Zapier:** Reconhece exports de Zap único (`{ steps: [...] }`), pacotes de conta em lote (`{ zaps: [...] }`) e grafos v2 (`{ nodes: {...} }`).
2. **Transpilador de Expressões AST:** Converte `{{1__email}}`, `{{step_3__clean_name}}` e `{{zap_meta_human_now}}` para a sintaxe oficial do n8n (`={{ $json.email }}`, `={{ $('NomeDoNo').item.json.clean_name }}`, `={{ $now.toISO() }}`).
3. **Catálogo de 30+ Integrações + Grafo DAG Multi-Branch:** Mapeia gatilhos, ações, filtros (`Filter by Zapier` $\rightarrow$ `n8n-nodes-base.if`), roteadores (`Paths by Zapier` $\rightarrow$ `n8n-nodes-base.switch` com ramificações geométricas `[x, y]`), esperas (`Delay` $\rightarrow$ `Wait`), formatações (`Formatter` $\rightarrow$ `Edit Fields / Set`) e scripts (`Code by Zapier` $\rightarrow$ `n8n-nodes-base.code`).
4. **Sticky Note Automática no Canvas:** Injeta um nó `n8n-nodes-base.stickyNote` no topo do workflow listando as credenciais a conectar e o link para subir o servidor n8n na Railway.
5. **Estratégia de Monetização Dupla:**
   - **Calculadora de ROI Interativa + Deploy 1-Click Railway (`?referralCode=...`):** Mostra a economia anual em USD e BRL e leva o usuário a subir sua instância n8n na Railway por ~$5/mês com código de afiliado customizável.
   - **Licença Pro / Agency Batch (`R$ 59` vitalício):** Desbloqueia exportação de lotes multi-Zap e Sticky Notes *White-Label* (com suporte ao cupom de demonstração `DESAFIO12X12`).

---

## 🛠️ Stack Tecnológica

- **Frontend:** React 19 + TypeScript (Strict) + Vite 8 + Tailwind CSS v4 (`@tailwindcss/vite`) + Lucide React.
- **Engine Client-Side:** Parser AST, Expression Transpiler, DAG Coordinate Calculator e Schema Validator em TypeScript puro.
- **Co-Piloto IA (BYOK Opcional):** Heurística AST offline + suporte a chaves próprias da **Groq (`llama-3.3-70b-versatile`)**, **OpenAI (`gpt-4o-mini`)** e **Anthropic (`claude-3-5-haiku-latest`)**.
- **Deploy Híbrido:** Configurado com `base: './'` no `vite.config.ts` (GitHub Pages) e `railway.json` (Railway Nixpacks).

---

## 🚀 Como Executar Localmente

```bash
cd 05-zapier-to-n8n
npm install
npm run dev
```

### Rodar Testes Automatizados E2E da Engine e Build de Produção

```bash
npm run build
```

---

## 📂 Planejamento GSD (`.planning/`)

- 📄 [**PROJECT.md**](./.planning/PROJECT.md) — Visão, arquitetura e critérios de sucesso.
- 🎯 [**REQUIREMENTS.md**](./.planning/REQUIREMENTS.md) — Requisitos rastreáveis (`REQ-PRS`, `REQ-EXP`, `REQ-GEN`, `REQ-AIC`, `REQ-MON`, `REQ-UI`, `REQ-DEP`).
- 🗺️ [**ROADMAP.md**](./.planning/ROADMAP.md) — Mapa das 7 Fases concluídas.
- 📊 [**STATE.md**](./.planning/STATE.md) — Status de execução e verificação de todas as fases.
