import { SampleZapPreset } from '../types';

export const SAMPLE_ZAPS: SampleZapPreset[] = [
  {
    id: 'lead-crm-slack',
    name: '1. Funil de Leads B2B (Webhook → Filter → HubSpot → Slack)',
    badge: 'Mais Popular',
    description:
      'Captura leads via Webhook, filtra apenas orçamentos acima de R$ 2.000, formata metadados, cria contato no HubSpot CRM e notifica o time comercial no Slack.',
    stepsSummary: 'Webhook → Filter → Formatter → HubSpot → Slack (5 passos)',
    payload: {
      id: 'zap-b2b-lead-101',
      title: 'Funil Comercial B2B: Webhook Lead -> HubSpot CRM & Alerta Slack',
      status: 'on',
      steps: [
        {
          id: '1',
          title: 'Catch Lead Webhook',
          app: 'WebhooksByZapier',
          type: 'trigger',
          action: 'catch_hook',
          params: {
            method: 'POST',
            path: 'b2b-inbound-lead',
          },
        },
        {
          id: '2',
          title: 'Apenas Leads Qualificados (> R$ 2.000)',
          app: 'FilterByZapier',
          type: 'filter',
          action: 'filter',
          conditions: [
            {
              field: '{{1__budget}}',
              operator: 'greater_than',
              value: '2000',
            },
            {
              field: '{{1__email}}',
              operator: 'contains',
              value: '@',
            },
          ],
        },
        {
          id: '3',
          title: 'Normalizar Dados do Lead',
          app: 'FormatterByZapier',
          type: 'formatter',
          action: 'text_upper_first',
          params: {
            transform: 'string.capitalize',
            input: '{{1__full_name}}',
            output_key: 'clean_name',
          },
        },
        {
          id: '4',
          title: 'Upsert Contato no HubSpot CRM',
          app: 'HubSpotCLIAPI@2.4.1',
          type: 'action',
          action: 'create_or_update_contact',
          params: {
            email: '{{1__email}}',
            first_name: '{{3__clean_name}}',
            company: '{{1__company_name}}',
            phone: '{{1__whatsapp}}',
          },
        },
        {
          id: '5',
          title: 'Notificar Canal #vendas-vip no Slack',
          app: 'SlackCLIAPI@1.9.0',
          type: 'action',
          action: 'send_channel_message',
          params: {
            channel: '#vendas-vip',
            text: '🔥 *Novo Lead Qualificado!* Nome: {{3__clean_name}} ({{1__email}}) | Empresa: {{1__company_name}} | Orçamento: R$ {{1__budget}} | Recebido em: {{zap_meta_human_now}}',
          },
        },
      ],
    },
  },
  {
    id: 'stripe-paths-router',
    name: '2. E-Commerce Router Multi-Path (Stripe → Paths VIP/Standard)',
    badge: 'Multi-Branch DAG',
    description:
      'Escuta pagamentos aprovados na Stripe e divide em 2 caminhos (Paths by Zapier): compras VIP acima de $500 vão para Google Sheets + Slack, e Standard para Gmail + Airtable.',
    stepsSummary: 'Stripe → Switch Paths (2 Trilhas / 6 Nós)',
    payload: {
      id: 'zap-stripe-router-202',
      title: 'E-Commerce Order Router: Stripe Charge -> Paths (VIP vs Standard)',
      status: 'on',
      steps: [
        {
          id: '1',
          title: 'Novo Pagamento Aprovado na Stripe',
          app: 'StripeCLIAPI@1.5.0',
          type: 'trigger',
          action: 'new_charge',
          params: {
            currency: 'brl',
          },
        },
        {
          id: '2',
          title: 'Roteador por Ticket (VIP vs Standard)',
          app: 'PathsByZapier',
          type: 'path',
          action: 'branch_paths',
          branches: [
            {
              id: 'path_vip',
              name: 'Cliente VIP (> R$ 500)',
              conditions: [
                {
                  field: '{{1__amount}}',
                  operator: 'greater_than',
                  value: '500',
                },
              ],
              steps: [
                {
                  id: '201',
                  title: 'Registrar Venda VIP no Google Sheets',
                  app: 'GoogleSheets',
                  type: 'action',
                  action: 'create_spreadsheet_row',
                  params: {
                    spreadsheet: 'PLANILHA_DIRETORIA_VIP',
                    worksheet: 'Vendas_Acima_500',
                    rows: {
                      cliente: '{{1__customer_name}}',
                      email: '{{1__customer_email}}',
                      valor: '{{1__amount}}',
                      data: '{{zap_meta_utc_iso}}',
                    },
                  },
                },
                {
                  id: '202',
                  title: 'Acionar Concierge no Slack',
                  app: 'Slack',
                  type: 'action',
                  action: 'send_channel_message',
                  params: {
                    channel: '#concierge-vip',
                    text: '💎 Compra VIP de R$ {{1__amount}} realizada por {{1__customer_name}} ({{1__customer_email}})!',
                  },
                },
              ],
            },
            {
              id: 'path_standard',
              name: 'Cliente Standard (<= R$ 500)',
              conditions: [
                {
                  field: '{{1__amount}}',
                  operator: 'less_than',
                  value: '500',
                },
              ],
              steps: [
                {
                  id: '301',
                  title: 'Enviar E-mail de Boas-Vindas via Gmail',
                  app: 'Gmail',
                  type: 'action',
                  action: 'send_email',
                  params: {
                    to: '{{1__customer_email}}',
                    subject: 'Seu pedido foi confirmado! 🚀',
                    body: 'Olá {{1__customer_name}}, recebemos seu pagamento de R$ {{1__amount}}. Seu acesso já está liberado!',
                  },
                },
                {
                  id: '302',
                  title: 'Salvar Cliente no Airtable',
                  app: 'Airtable',
                  type: 'action',
                  action: 'create_record',
                  params: {
                    base: 'appCRMBaseStandard',
                    table: 'Clientes Ativos',
                    email: '{{1__customer_email}}',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'ai-content-notion',
    name: '3. Pipeline IA + Code JS (Schedule → HTTP → Code → OpenAI → Notion)',
    badge: 'Code JS + OpenAI',
    description:
      'Executa todo dia às 08h, busca artigos via HTTP, limpa o payload com Code by Zapier (JavaScript), resume com OpenAI GPT e cria página no Notion.',
    stepsSummary: 'Schedule → HTTP → Code (JS) → OpenAI → Notion',
    payload: {
      id: 'zap-ai-notion-303',
      title: 'Curadoria Diária IA: API Feed -> Code JS -> OpenAI -> Notion Wiki',
      status: 'on',
      steps: [
        {
          id: '1',
          title: 'Disparo Diário às 08:00',
          app: 'ScheduleByZapier',
          type: 'trigger',
          action: 'every_day',
          params: {
            hour: '08:00',
          },
        },
        {
          id: '2',
          title: 'Buscar Artigos Tech via HTTP GET',
          app: 'WebhooksByZapier',
          type: 'action',
          action: 'get',
          params: {
            method: 'GET',
            url: 'https://hn.algolia.com/api/v1/search?tags=front_page',
          },
        },
        {
          id: '3',
          title: 'Higienizar Payload e Calcular Score (Code JS)',
          app: 'CodeByZapier',
          type: 'code',
          action: 'run_javascript',
          language: 'javascript',
          code: `const rawTitle = inputData.title || 'Sem título';\nconst points = Number(inputData.points || 0);\nconst cleanTitle = rawTitle.trim().toUpperCase();\noutput = {\n  cleanTitle,\n  isTrending: points >= 150,\n  processedAt: new Date().toISOString()\n};`,
          params: {
            title: '{{2__title}}',
            points: '{{2__points}}',
          },
        },
        {
          id: '4',
          title: 'Gerar Resumo Executivo com OpenAI',
          app: 'OpenAICLIAPI@1.2.0',
          type: 'action',
          action: 'chat_completion',
          params: {
            model: 'gpt-4o-mini',
            system_prompt: 'Você é um analista sênior de tecnologia. Resuma em 3 tópicos práticos.',
            prompt: 'Artigo: {{3__cleanTitle}} (URL: {{2__url}})',
            temperature: 0.4,
          },
        },
        {
          id: '5',
          title: 'Salvar Resumo na Base do Notion',
          app: 'NotionCLIAPI@2.0.0',
          type: 'action',
          action: 'create_database_item',
          params: {
            database_id: 'NOTION_DB_RADAR_IA',
            title: '{{3__cleanTitle}}',
            content: '{{4__choices__message__content}}',
          },
        },
      ],
    },
  },
  {
    id: 'support-escalation',
    name: '4. Pós-Venda & CS (Typeform → Delay 15m → Trello → Discord)',
    badge: 'Wait + CS Ops',
    description:
      'Recebe avaliação NPS do Typeform, aguarda 15 minutos, cria card priorizado no Trello para o time de Customer Success e dispara alerta no Discord.',
    stepsSummary: 'Typeform → Wait 15m → Trello → Discord',
    payload: {
      id: 'zap-cs-nps-404',
      title: 'CS Escalation: Typeform NPS -> Delay 15min -> Trello Card & Discord',
      status: 'on',
      steps: [
        {
          id: '1',
          title: 'Nova Resposta no Formulário NPS (Typeform)',
          app: 'Typeform',
          type: 'trigger',
          action: 'new_entry',
          params: {
            form_id: 'TF_NPS_PESQUISA_2026',
          },
        },
        {
          id: '2',
          title: 'Aguardar 15 Minutos antes do Follow-up',
          app: 'DelayByZapier',
          type: 'delay',
          action: 'delay_for',
          params: {
            amount: 15,
            unit: 'minutes',
          },
        },
        {
          id: '3',
          title: 'Criar Card na Coluna de Atenção (Trello)',
          app: 'Trello',
          type: 'action',
          action: 'create_card',
          params: {
            list_id: 'LISTA_CS_PRIORIDADE',
            name: 'Follow-up Cliente: {{1__respondent_name}} (Nota {{1__nps_score}})',
            description: 'Feedback enviado: {{1__feedback_comment}} | E-mail: {{1__email}}',
          },
        },
        {
          id: '4',
          title: 'Avisar Esquadrão de CS no Discord',
          app: 'Discord',
          type: 'action',
          action: 'send_webhook_message',
          params: {
            username: 'Radar NPS Bot',
            content: '🔔 Novo card de CS criado no Trello para **{{1__respondent_name}}** (Nota: {{1__nps_score}}/10).',
          },
        },
      ],
    },
  },
  {
    id: 'agency-batch-pack',
    name: '5. 📦 Pacote de Agência em Lote (4 Zaps Simultâneos)',
    badge: 'Batch 4 Zaps',
    isBatch: true,
    description:
      'Demonstra a migração em lote de uma conta inteira do Zapier contendo 4 Zaps independentes (Vendas, Calendly, GitHub DevOps e Supabase Sync) em um único arquivo.',
    stepsSummary: '4 Workflows Completos convertidos de uma só vez',
    payload: {
      zaps: [
        {
          id: 'batch-zap-1',
          title: '01. Calendly Booking -> Google Calendar & Twilio SMS',
          status: 'on',
          steps: [
            {
              id: '1',
              title: 'Reunião Agendada no Calendly',
              app: 'Calendly',
              type: 'trigger',
              action: 'invitee_created',
              params: {},
            },
            {
              id: '2',
              title: 'Bloquear Agenda no Google Calendar',
              app: 'GoogleCalendar',
              type: 'action',
              action: 'create_detailed_event',
              params: {
                calendar_id: 'primary',
                summary: 'Call Comercial com {{1__invitee_name}}',
                start_time: '{{1__start_time}}',
                end_time: '{{1__end_time}}',
              },
            },
            {
              id: '3',
              title: 'Enviar Lembrete SMS via Twilio',
              app: 'Twilio',
              type: 'action',
              action: 'send_sms',
              params: {
                from_number: '+5511999990000',
                to_number: '{{1__invitee_phone}}',
                message: 'Olá {{1__invitee_name}}, sua call está confirmada para {{1__start_time}}!',
              },
            },
          ],
        },
        {
          id: 'batch-zap-2',
          title: '02. Shopify Paid Order -> Supabase Database & Telegram',
          status: 'on',
          steps: [
            {
              id: '1',
              title: 'Pedido Pago na Shopify',
              app: 'Shopify',
              type: 'trigger',
              action: 'new_paid_order',
              params: {},
            },
            {
              id: '2',
              title: 'Gravar Registro na Tabela orders (Supabase)',
              app: 'Supabase',
              type: 'action',
              action: 'insert_row',
              params: {
                table: 'shopify_orders',
                order_id: '{{1__order_number}}',
                total: '{{1__total_price}}',
              },
            },
            {
              id: '3',
              title: 'Notificar Dono da Loja no Telegram',
              app: 'Telegram',
              type: 'action',
              action: 'send_message',
              params: {
                chat_id: '-10099887766',
                text: '🛍️ Pedido #{{1__order_number}} pago na Shopify! Valor: R$ {{1__total_price}}',
              },
            },
          ],
        },
        {
          id: 'batch-zap-3',
          title: '03. Zendesk Ticket Urgente -> GitHub Issue & Microsoft Teams',
          status: 'on',
          steps: [
            {
              id: '1',
              title: 'Novo Ticket no Zendesk',
              app: 'Zendesk',
              type: 'trigger',
              action: 'new_ticket',
              params: {},
            },
            {
              id: '2',
              title: 'Criar Issue para Engenharia no GitHub',
              app: 'GitHub',
              type: 'action',
              action: 'create_issue',
              params: {
                owner: 'jakemerson',
                repo: 'core-platform',
                title: '[Zendesk #{{1__ticket_id}}] {{1__subject}}',
                body: 'Relato do cliente {{1__requester_email}}:\n\n{{1__description}}',
              },
            },
            {
              id: '3',
              title: 'Avisar Canal de Engenharia no Microsoft Teams',
              app: 'MicrosoftTeams',
              type: 'action',
              action: 'send_chat_message',
              params: {
                channel: 'engenharia-oncall',
                message: '🚨 Bug reportado no Zendesk #{{1__ticket_id}} convertido em Issue no GitHub.',
              },
            },
          ],
        },
        {
          id: 'batch-zap-4',
          title: '04. Webhook ERP Custom -> CRM Proprietário (Fallback HTTP) & PostgreSQL',
          status: 'on',
          steps: [
            {
              id: '1',
              title: 'Receber Evento do ERP',
              app: 'WebhooksByZapier',
              type: 'trigger',
              action: 'catch_hook',
              params: {
                path: 'erp-nf-emitida',
              },
            },
            {
              id: '2',
              title: 'Sincronizar com Sistema Legado OmieERP',
              app: 'OmieCustomLegacyApp@1.0.0',
              type: 'action',
              action: 'sync_invoice',
              params: {
                nfe_key: '{{1__chave_nfe}}',
                cnpj: '{{1__cnpj_cliente}}',
              },
            },
            {
              id: '3',
              title: 'Auditar Transação no PostgreSQL',
              app: 'PostgreSQL',
              type: 'action',
              action: 'execute_query',
              params: {
                table: 'nfe_audit_log',
                query: "INSERT INTO nfe_audit_log (nfe_key, cnpj, synced_at) VALUES ('{{1__chave_nfe}}', '{{1__cnpj_cliente}}', '{{zap_meta_utc_iso}}');",
              },
            },
          ],
        },
      ],
    },
  },
];
