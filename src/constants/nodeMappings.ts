import { NodeMappingSpec, ZapStepRole } from '../types';

function pickStr(params: Record<string, unknown>, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const val = params[key];
    if (typeof val === 'string' && val.trim().length > 0) {
      return val;
    }
    if (typeof val === 'number' || typeof val === 'boolean') {
      return String(val);
    }
  }
  return fallback;
}

export const NODE_MAPPINGS: Record<string, NodeMappingSpec> = {
  webhooks: {
    appKey: 'webhooks',
    displayName: 'Webhooks / HTTP',
    category: 'core',
    n8nTriggerType: 'n8n-nodes-base.webhook',
    n8nTriggerVersion: 2,
    n8nActionType: 'n8n-nodes-base.httpRequest',
    n8nActionVersion: 4.2,
    accentColor: '#f97316',
    buildParameters: (role: ZapStepRole, actionKey: string, params: Record<string, unknown>) => {
      if (role === 'trigger' || actionKey.includes('catch_hook') || actionKey.includes('hook')) {
        return {
          httpMethod: pickStr(params, ['method', 'http_method'], 'POST').toUpperCase(),
          path: pickStr(params, ['path', 'hook_path', 'endpoint'], 'zapier-migrated-hook'),
          responseMode: 'onReceived',
          options: {},
        };
      }
      const method = actionKey.includes('get')
        ? 'GET'
        : actionKey.includes('put')
          ? 'PUT'
          : actionKey.includes('delete')
            ? 'DELETE'
            : pickStr(params, ['method'], 'POST').toUpperCase();
      return {
        method,
        url: pickStr(params, ['url', 'endpoint', 'webhook_url'], 'https://api.example.com/v1/resource'),
        sendHeaders: Boolean(params.headers),
        sendBody: method !== 'GET',
        specifyBody: 'json',
        jsonBody: params.data || params.payload || params.body || params,
        options: {},
      };
    },
  },

  schedule: {
    appKey: 'schedule',
    displayName: 'Schedule Trigger',
    category: 'core',
    n8nTriggerType: 'n8n-nodes-base.scheduleTrigger',
    n8nTriggerVersion: 1.2,
    n8nActionType: 'n8n-nodes-base.scheduleTrigger',
    n8nActionVersion: 1.2,
    accentColor: '#10b981',
    buildParameters: (_role, actionKey, params) => {
      const hour = Number(pickStr(params, ['hour', 'time_of_day'], '8').split(':')[0]) || 8;
      if (actionKey.includes('hour')) {
        return {
          rule: {
            interval: [{ field: 'hours', hoursInterval: Number(params.interval || 1) }],
          },
        };
      }
      if (actionKey.includes('week')) {
        return {
          rule: {
            interval: [{ field: 'weeks', triggerAtDay: [1], triggerAtHour: hour }],
          },
        };
      }
      return {
        rule: {
          interval: [{ field: 'days', triggerAtHour: hour, triggerAtMinute: 0 }],
        },
      };
    },
  },

  delay: {
    appKey: 'delay',
    displayName: 'Wait / Delay',
    category: 'core',
    n8nActionType: 'n8n-nodes-base.wait',
    n8nActionVersion: 1.1,
    accentColor: '#eab308',
    buildParameters: (_role, _actionKey, params) => {
      const rawUnit = pickStr(params, ['unit', 'time_unit'], 'minutes').toLowerCase();
      const unit = rawUnit.startsWith('hour')
        ? 'hours'
        : rawUnit.startsWith('day')
          ? 'days'
          : rawUnit.startsWith('sec')
            ? 'seconds'
            : 'minutes';
      return {
        resume: 'timeInterval',
        amount: Number(pickStr(params, ['amount', 'delay_for', 'value', 'duration'], '15')) || 15,
        unit,
      };
    },
  },

  formatter: {
    appKey: 'formatter',
    displayName: 'Edit Fields / Formatter',
    category: 'core',
    n8nActionType: 'n8n-nodes-base.set',
    n8nActionVersion: 3.4,
    accentColor: '#ec4899',
    buildParameters: (_role, actionKey, params) => {
      const transform = pickStr(params, ['transform', 'operation'], actionKey || 'format_value');
      const inputVal = pickStr(params, ['input', 'value', 'values', 'text'], '={{ $json.data }}');
      const outputKey = pickStr(params, ['output_key', 'field_name'], 'formatted_value');
      return {
        mode: 'manual',
        duplicateItem: false,
        assignments: {
          assignments: [
            {
              id: 'fmt-1',
              name: outputKey,
              value: inputVal,
              type: 'string',
            },
            {
              id: 'fmt-meta',
              name: '_zapierFormatterTransform',
              value: transform,
              type: 'string',
            },
          ],
        },
        includeOtherFields: true,
        options: {},
      };
    },
  },

  slack: {
    appKey: 'slack',
    displayName: 'Slack',
    category: 'communication',
    n8nTriggerType: 'n8n-nodes-base.slackTrigger',
    n8nTriggerVersion: 1,
    n8nActionType: 'n8n-nodes-base.slack',
    n8nActionVersion: 2.2,
    credentialType: 'slackOAuth2Api',
    credentialLabel: 'Slack OAuth2 API',
    accentColor: '#e11d48',
    buildParameters: (_role, actionKey, params) => ({
      resource: 'message',
      operation: 'post',
      select: actionKey.includes('direct') ? 'user' : 'channel',
      channelId: {
        __rl: true,
        value: pickStr(params, ['channel', 'channel_id', 'user'], '#general'),
        mode: 'name',
      },
      text: pickStr(params, ['text', 'message', 'body'], 'Notificação automática migrada para o n8n'),
      otherOptions: {
        includeLinkToWorkflow: false,
        botProfile: {
          imageValues: {
            profilePhotoType: 'none',
          },
        },
      },
    }),
  },

  gmail: {
    appKey: 'gmail',
    displayName: 'Gmail',
    category: 'communication',
    n8nTriggerType: 'n8n-nodes-base.gmailTrigger',
    n8nTriggerVersion: 1.1,
    n8nActionType: 'n8n-nodes-base.gmail',
    n8nActionVersion: 2.1,
    credentialType: 'gmailOAuth2',
    credentialLabel: 'Gmail OAuth2 API',
    accentColor: '#ef4444',
    buildParameters: (role, actionKey, params) => {
      if (role === 'trigger') {
        return { pollTimes: { item: [{ mode: 'everyMinute' }] }, filters: {} };
      }
      return {
        resource: actionKey.includes('draft') ? 'draft' : 'message',
        operation: actionKey.includes('reply') ? 'reply' : 'send',
        sendTo: pickStr(params, ['to', 'recipient', 'email'], '={{ $json.email }}'),
        subject: pickStr(params, ['subject', 'title'], 'Notificação Automática'),
        message: pickStr(params, ['body', 'body_html', 'body_plain', 'message'], 'Olá!'),
        options: {
          ccList: pickStr(params, ['cc'], ''),
          bccList: pickStr(params, ['bcc'], ''),
        },
      };
    },
  },

  discord: {
    appKey: 'discord',
    displayName: 'Discord',
    category: 'communication',
    n8nActionType: 'n8n-nodes-base.discord',
    n8nActionVersion: 2,
    credentialType: 'discordWebhookApi',
    credentialLabel: 'Discord Webhook / Bot API',
    accentColor: '#6366f1',
    buildParameters: (_role, _actionKey, params) => ({
      authentication: 'webhook',
      content: pickStr(params, ['content', 'message', 'text'], 'Alerta automático via n8n'),
      options: {
        username: pickStr(params, ['username', 'bot_name'], 'ZapFlow Bot'),
      },
    }),
  },

  telegram: {
    appKey: 'telegram',
    displayName: 'Telegram',
    category: 'communication',
    n8nTriggerType: 'n8n-nodes-base.telegramTrigger',
    n8nTriggerVersion: 1.1,
    n8nActionType: 'n8n-nodes-base.telegram',
    n8nActionVersion: 1.2,
    credentialType: 'telegramApi',
    credentialLabel: 'Telegram Bot API',
    accentColor: '#0ea5e9',
    buildParameters: (_role, _actionKey, params) => ({
      resource: 'message',
      operation: 'sendMessage',
      chatId: pickStr(params, ['chat_id', 'chatId'], '={{ $json.chat_id }}'),
      text: pickStr(params, ['text', 'message'], 'Mensagem enviada via n8n'),
      additionalFields: { parse_mode: 'Markdown' },
    }),
  },

  microsoft_teams: {
    appKey: 'microsoft_teams',
    displayName: 'Microsoft Teams',
    category: 'communication',
    n8nActionType: 'n8n-nodes-base.microsoftTeams',
    n8nActionVersion: 2,
    credentialType: 'microsoftTeamsOAuth2Api',
    credentialLabel: 'Microsoft Teams OAuth2 API',
    accentColor: '#4f46e5',
    buildParameters: (_role, _actionKey, params) => ({
      resource: 'chatMessage',
      operation: 'create',
      channelId: pickStr(params, ['channel', 'channelId'], 'general'),
      messageType: 'html',
      message: pickStr(params, ['message', 'text', 'body'], ''),
    }),
  },

  twilio: {
    appKey: 'twilio',
    displayName: 'Twilio SMS / WhatsApp',
    category: 'communication',
    n8nActionType: 'n8n-nodes-base.twilio',
    n8nActionVersion: 1,
    credentialType: 'twilioApi',
    credentialLabel: 'Twilio Account SID & Token',
    accentColor: '#f43f5e',
    buildParameters: (_role, _actionKey, params) => ({
      resource: 'sms',
      operation: 'send',
      from: pickStr(params, ['from', 'from_number'], '+15550000000'),
      to: pickStr(params, ['to', 'to_number', 'phone'], '={{ $json.phone }}'),
      message: pickStr(params, ['message', 'body'], ''),
      options: {},
    }),
  },

  google_sheets: {
    appKey: 'google_sheets',
    displayName: 'Google Sheets',
    category: 'productivity',
    n8nTriggerType: 'n8n-nodes-base.googleSheetsTrigger',
    n8nTriggerVersion: 1,
    n8nActionType: 'n8n-nodes-base.googleSheets',
    n8nActionVersion: 4.5,
    credentialType: 'googleSheetsOAuth2Api',
    credentialLabel: 'Google Sheets OAuth2 API',
    accentColor: '#22c55e',
    buildParameters: (role, actionKey, params) => {
      const operation =
        role === 'search' || actionKey.includes('lookup')
          ? 'read'
          : actionKey.includes('update')
            ? 'update'
            : 'append';
      return {
        operation,
        documentId: {
          __rl: true,
          value: pickStr(params, ['spreadsheet', 'spreadsheet_id', 'documentId'], 'SELECIONE_PLANILHA_ID'),
          mode: 'id',
        },
        sheetName: {
          __rl: true,
          value: pickStr(params, ['worksheet', 'sheet', 'sheetName'], 'Página1'),
          mode: 'name',
        },
        columns: {
          mappingMode: 'autoMapInputData',
          value: params.rows || params.columns || params,
        },
        options: {},
      };
    },
  },

  airtable: {
    appKey: 'airtable',
    displayName: 'Airtable',
    category: 'productivity',
    n8nTriggerType: 'n8n-nodes-base.airtableTrigger',
    n8nTriggerVersion: 1,
    n8nActionType: 'n8n-nodes-base.airtable',
    n8nActionVersion: 2.1,
    credentialType: 'airtableTokenApi',
    credentialLabel: 'Airtable Personal Access Token',
    accentColor: '#f59e0b',
    buildParameters: (role, actionKey, params) => ({
      operation: role === 'search' || actionKey.includes('search') ? 'search' : 'create',
      base: {
        __rl: true,
        value: pickStr(params, ['base', 'base_id'], 'appXXXXXXXXXXXXXX'),
        mode: 'id',
      },
      table: {
        __rl: true,
        value: pickStr(params, ['table', 'table_name'], 'Records'),
        mode: 'name',
      },
      columns: {
        mappingMode: 'autoMapInputData',
        value: params,
      },
    }),
  },

  notion: {
    appKey: 'notion',
    displayName: 'Notion',
    category: 'productivity',
    n8nTriggerType: 'n8n-nodes-base.notionTrigger',
    n8nTriggerVersion: 1,
    n8nActionType: 'n8n-nodes-base.notion',
    n8nActionVersion: 2.2,
    credentialType: 'notionApi',
    credentialLabel: 'Notion Internal Integration Token',
    accentColor: '#94a3b8',
    buildParameters: (_role, actionKey, params) => ({
      resource: actionKey.includes('database') ? 'databasePage' : 'page',
      operation: 'create',
      databaseId: {
        __rl: true,
        value: pickStr(params, ['database', 'database_id', 'parent_id'], 'NOTION_DATABASE_ID'),
        mode: 'id',
      },
      title: pickStr(params, ['title', 'name'], '={{ $json.title }}'),
      propertiesUi: {
        propertyValues: [
          {
            key: 'Content',
            richTextValue: pickStr(params, ['content', 'body', 'notes'], ''),
          },
        ],
      },
    }),
  },

  trello: {
    appKey: 'trello',
    displayName: 'Trello',
    category: 'productivity',
    n8nTriggerType: 'n8n-nodes-base.trelloTrigger',
    n8nTriggerVersion: 1,
    n8nActionType: 'n8n-nodes-base.trello',
    n8nActionVersion: 1,
    credentialType: 'trelloApi',
    credentialLabel: 'Trello API Key & Token',
    accentColor: '#3b82f6',
    buildParameters: (_role, _actionKey, params) => ({
      resource: 'card',
      operation: 'create',
      listId: pickStr(params, ['list', 'list_id'], 'TRELLO_LIST_ID'),
      name: pickStr(params, ['name', 'title', 'card_name'], 'Novo Card'),
      description: pickStr(params, ['description', 'desc', 'notes'], ''),
      additionalFields: {},
    }),
  },

  asana: {
    appKey: 'asana',
    displayName: 'Asana',
    category: 'productivity',
    n8nActionType: 'n8n-nodes-base.asana',
    n8nActionVersion: 1,
    credentialType: 'asanaApi',
    credentialLabel: 'Asana Personal Access Token',
    accentColor: '#f43f5e',
    buildParameters: (_role, _actionKey, params) => ({
      resource: 'task',
      operation: 'create',
      workspace: pickStr(params, ['workspace'], 'DEFAULT_WORKSPACE'),
      name: pickStr(params, ['name', 'title'], 'Nova Tarefa'),
      otherProperties: {
        notes: pickStr(params, ['notes', 'description'], ''),
      },
    }),
  },

  google_drive: {
    appKey: 'google_drive',
    displayName: 'Google Drive',
    category: 'productivity',
    n8nTriggerType: 'n8n-nodes-base.googleDriveTrigger',
    n8nTriggerVersion: 1,
    n8nActionType: 'n8n-nodes-base.googleDrive',
    n8nActionVersion: 3,
    credentialType: 'googleDriveOAuth2Api',
    credentialLabel: 'Google Drive OAuth2 API',
    accentColor: '#10b981',
    buildParameters: (_role, actionKey, params) => ({
      resource: actionKey.includes('folder') ? 'folder' : 'file',
      operation: actionKey.includes('upload') ? 'upload' : 'copy',
      name: pickStr(params, ['title', 'name', 'filename'], 'arquivo-migrado'),
      folderId: {
        __rl: true,
        value: pickStr(params, ['folder', 'folder_id'], 'root'),
        mode: 'id',
      },
    }),
  },

  google_calendar: {
    appKey: 'google_calendar',
    displayName: 'Google Calendar',
    category: 'productivity',
    n8nTriggerType: 'n8n-nodes-base.googleCalendarTrigger',
    n8nTriggerVersion: 1,
    n8nActionType: 'n8n-nodes-base.googleCalendar',
    n8nActionVersion: 1.2,
    credentialType: 'googleCalendarOAuth2Api',
    credentialLabel: 'Google Calendar OAuth2 API',
    accentColor: '#2563eb',
    buildParameters: (_role, _actionKey, params) => ({
      resource: 'event',
      operation: 'create',
      calendar: {
        __rl: true,
        value: pickStr(params, ['calendar', 'calendar_id'], 'primary'),
        mode: 'id',
      },
      start: pickStr(params, ['start_time', 'start'], '={{ $now.toISO() }}'),
      end: pickStr(params, ['end_time', 'end'], '={{ $now.plus({ hours: 1 }).toISO() }}'),
      additionalFields: {
        summary: pickStr(params, ['summary', 'title'], 'Reunião Agendada'),
        description: pickStr(params, ['description'], ''),
      },
    }),
  },

  zoom: {
    appKey: 'zoom',
    displayName: 'Zoom',
    category: 'communication',
    n8nTriggerType: 'n8n-nodes-base.zoomTrigger',
    n8nTriggerVersion: 1,
    n8nActionType: 'n8n-nodes-base.zoom',
    n8nActionVersion: 1,
    credentialType: 'zoomOAuth2Api',
    credentialLabel: 'Zoom OAuth2 API',
    accentColor: '#2d8cff',
    buildParameters: (role, actionKey, params) => {
      if (role === 'trigger' || actionKey.includes('recording')) {
        return {
          event: 'recording.completed',
        };
      }
      return {
        resource: 'meeting',
        operation: 'create',
        topic: pickStr(params, ['topic', 'name'], 'Reunião Zoom'),
      };
    },
  },

  hubspot: {
    appKey: 'hubspot',
    displayName: 'HubSpot CRM',
    category: 'crm',
    n8nTriggerType: 'n8n-nodes-base.hubspotTrigger',
    n8nTriggerVersion: 1,
    n8nActionType: 'n8n-nodes-base.hubspot',
    n8nActionVersion: 2.1,
    credentialType: 'hubspotOAuth2Api',
    credentialLabel: 'HubSpot OAuth2 / App Token',
    accentColor: '#ff7a59',
    buildParameters: (_role, actionKey, params) => ({
      authentication: 'oAuth2',
      resource: actionKey.includes('deal') ? 'deal' : 'contact',
      operation: 'upsert',
      email: pickStr(params, ['email', 'contact_email'], '={{ $json.email }}'),
      additionalFields: {
        firstName: pickStr(params, ['first_name', 'firstname', 'name'], ''),
        lastName: pickStr(params, ['last_name', 'lastname'], ''),
        company: pickStr(params, ['company', 'company_name'], ''),
        phone: pickStr(params, ['phone', 'mobile'], ''),
      },
    }),
  },

  pipedrive: {
    appKey: 'pipedrive',
    displayName: 'Pipedrive CRM',
    category: 'crm',
    n8nTriggerType: 'n8n-nodes-base.pipedriveTrigger',
    n8nTriggerVersion: 1,
    n8nActionType: 'n8n-nodes-base.pipedrive',
    n8nActionVersion: 1,
    credentialType: 'pipedriveApi',
    credentialLabel: 'Pipedrive API Token',
    accentColor: '#16a34a',
    buildParameters: (_role, actionKey, params) => ({
      resource: actionKey.includes('person') ? 'person' : 'deal',
      operation: 'create',
      title: pickStr(params, ['title', 'name'], 'Novo Negócio'),
      additionalFields: {
        value: Number(pickStr(params, ['value', 'amount'], '0')) || 0,
      },
    }),
  },

  activecampaign: {
    appKey: 'activecampaign',
    displayName: 'ActiveCampaign',
    category: 'crm',
    n8nTriggerType: 'n8n-nodes-base.activeCampaignTrigger',
    n8nTriggerVersion: 1,
    n8nActionType: 'n8n-nodes-base.activeCampaign',
    n8nActionVersion: 1,
    credentialType: 'activeCampaignApi',
    credentialLabel: 'ActiveCampaign API URL & Key',
    accentColor: '#3b82f6',
    buildParameters: (_role, _actionKey, params) => ({
      resource: 'contact',
      operation: 'create',
      email: pickStr(params, ['email'], '={{ $json.email }}'),
      additionalFields: {
        firstName: pickStr(params, ['first_name', 'name'], ''),
        phone: pickStr(params, ['phone'], ''),
      },
    }),
  },

  mailchimp: {
    appKey: 'mailchimp',
    displayName: 'Mailchimp',
    category: 'crm',
    n8nTriggerType: 'n8n-nodes-base.mailchimpTrigger',
    n8nTriggerVersion: 1,
    n8nActionType: 'n8n-nodes-base.mailchimp',
    n8nActionVersion: 1,
    credentialType: 'mailchimpOAuth2Api',
    credentialLabel: 'Mailchimp OAuth2 API',
    accentColor: '#eab308',
    buildParameters: (_role, _actionKey, params) => ({
      resource: 'member',
      operation: 'create',
      list: pickStr(params, ['list', 'list_id'], 'MAILCHIMP_AUDIENCE_ID'),
      email: pickStr(params, ['email'], '={{ $json.email }}'),
      status: 'subscribed',
    }),
  },

  zendesk: {
    appKey: 'zendesk',
    displayName: 'Zendesk Support',
    category: 'crm',
    n8nTriggerType: 'n8n-nodes-base.zendeskTrigger',
    n8nTriggerVersion: 1,
    n8nActionType: 'n8n-nodes-base.zendesk',
    n8nActionVersion: 1,
    credentialType: 'zendeskApi',
    credentialLabel: 'Zendesk API Token',
    accentColor: '#059669',
    buildParameters: (_role, _actionKey, params) => ({
      resource: 'ticket',
      operation: 'create',
      description: pickStr(params, ['description', 'comment', 'body'], 'Novo chamado'),
      additionalFields: {
        subject: pickStr(params, ['subject', 'title'], 'Ticket via Automação'),
      },
    }),
  },

  stripe: {
    appKey: 'stripe',
    displayName: 'Stripe',
    category: 'ecommerce',
    n8nTriggerType: 'n8n-nodes-base.stripeTrigger',
    n8nTriggerVersion: 1,
    n8nActionType: 'n8n-nodes-base.stripe',
    n8nActionVersion: 1,
    credentialType: 'stripeApi',
    credentialLabel: 'Stripe Secret API Key',
    accentColor: '#8b5cf6',
    buildParameters: (role, actionKey, params) => {
      if (role === 'trigger') {
        return {
          events: [actionKey.includes('customer') ? 'customer.created' : 'charge.succeeded'],
        };
      }
      return {
        resource: 'customer',
        operation: 'create',
        name: pickStr(params, ['name'], '={{ $json.name }}'),
        additionalFields: {
          email: pickStr(params, ['email'], '={{ $json.email }}'),
        },
      };
    },
  },

  shopify: {
    appKey: 'shopify',
    displayName: 'Shopify',
    category: 'ecommerce',
    n8nTriggerType: 'n8n-nodes-base.shopifyTrigger',
    n8nTriggerVersion: 1,
    n8nActionType: 'n8n-nodes-base.shopify',
    n8nActionVersion: 1,
    credentialType: 'shopifyApi',
    credentialLabel: 'Shopify Admin API Token',
    accentColor: '#84cc16',
    buildParameters: (role, actionKey, params) => {
      if (role === 'trigger') {
        return { topic: actionKey.includes('paid') ? 'orders/paid' : 'orders/create' };
      }
      return {
        resource: 'order',
        operation: 'getAll',
         additionalFields: params,
      };
    },
  },

  typeform: {
    appKey: 'typeform',
    displayName: 'Typeform',
    category: 'productivity',
    n8nTriggerType: 'n8n-nodes-base.typeformTrigger',
    n8nTriggerVersion: 1.1,
    n8nActionType: 'n8n-nodes-base.typeformTrigger',
    n8nActionVersion: 1.1,
    credentialType: 'typeformApi',
    credentialLabel: 'Typeform Personal Access Token',
    accentColor: '#a855f7',
    buildParameters: (_role, _actionKey, params) => ({
      formId: pickStr(params, ['form_id', 'formId', 'form'], 'TYPEFORM_FORM_ID'),
    }),
  },

  calendly: {
    appKey: 'calendly',
    displayName: 'Calendly',
    category: 'productivity',
    n8nTriggerType: 'n8n-nodes-base.calendlyTrigger',
    n8nTriggerVersion: 1,
    n8nActionType: 'n8n-nodes-base.calendlyTrigger',
    n8nActionVersion: 1,
    credentialType: 'calendlyApi',
    credentialLabel: 'Calendly Personal Access Token',
    accentColor: '#0284c7',
    buildParameters: () => ({
      events: ['invitee.created'],
    }),
  },

  openai: {
    appKey: 'openai',
    displayName: 'OpenAI (GPT / Whisper)',
    category: 'ai',
    n8nActionType: '@n8n/n8n-nodes-langchain.openAi',
    n8nActionVersion: 1.6,
    credentialType: 'openAiApi',
    credentialLabel: 'OpenAI API Key',
    accentColor: '#10b981',
    buildParameters: (_role, _actionKey, params) => ({
      resource: 'text',
      operation: 'message',
      modelId: {
        __rl: true,
        value: pickStr(params, ['model'], 'gpt-4o-mini'),
        mode: 'list',
      },
      messages: {
        values: [
          {
            role: 'system',
            content: pickStr(params, ['system_prompt', 'instructions'], 'Você é um assistente prestativo.'),
          },
          {
            role: 'user',
            content: pickStr(params, ['prompt', 'message', 'user_message'], '={{ $json.text }}'),
          },
        ],
      },
      options: {
        temperature: Number(params.temperature ?? 0.7),
      },
    }),
  },

  github: {
    appKey: 'github',
    displayName: 'GitHub',
    category: 'devtools',
    n8nTriggerType: 'n8n-nodes-base.githubTrigger',
    n8nTriggerVersion: 1,
    n8nActionType: 'n8n-nodes-base.github',
    n8nActionVersion: 1,
    credentialType: 'githubApi',
    credentialLabel: 'GitHub Personal Access Token',
    accentColor: '#64748b',
    buildParameters: (_role, _actionKey, params) => ({
      resource: 'issue',
      operation: 'create',
      owner: pickStr(params, ['owner', 'org'], 'jakemerson'),
      repository: pickStr(params, ['repo', 'repository'], 'meu-repositorio'),
      title: pickStr(params, ['title'], 'Issue criada via n8n'),
      body: pickStr(params, ['body', 'description'], ''),
    }),
  },

  postgres: {
    appKey: 'postgres',
    displayName: 'PostgreSQL',
    category: 'database',
    n8nActionType: 'n8n-nodes-base.postgres',
    n8nActionVersion: 2.5,
    credentialType: 'postgres',
    credentialLabel: 'PostgreSQL Connection Credentials',
    accentColor: '#38bdf8',
    buildParameters: (_role, actionKey, params) => ({
      operation: actionKey.includes('query') || actionKey.includes('select') ? 'executeQuery' : 'insert',
      schema: { __rl: true, value: 'public', mode: 'list' },
      table: { __rl: true, value: pickStr(params, ['table'], 'users'), mode: 'name' },
      query: pickStr(params, ['query', 'sql'], 'SELECT * FROM users LIMIT 10;'),
    }),
  },

  mysql: {
    appKey: 'mysql',
    displayName: 'MySQL',
    category: 'database',
    n8nActionType: 'n8n-nodes-base.mySql',
    n8nActionVersion: 2.4,
    credentialType: 'mySql',
    credentialLabel: 'MySQL Connection Credentials',
    accentColor: '#0284c7',
    buildParameters: (_role, actionKey, params) => ({
      operation: actionKey.includes('query') ? 'executeQuery' : 'insert',
      table: { __rl: true, value: pickStr(params, ['table'], 'records'), mode: 'name' },
      query: pickStr(params, ['query', 'sql'], 'SELECT 1;'),
    }),
  },

  supabase: {
    appKey: 'supabase',
    displayName: 'Supabase',
    category: 'database',
    n8nActionType: 'n8n-nodes-base.supabase',
    n8nActionVersion: 1,
    credentialType: 'supabaseApi',
    credentialLabel: 'Supabase URL & Service Role Key',
    accentColor: '#34d399',
    buildParameters: (_role, _actionKey, params) => ({
      resource: 'row',
      operation: 'create',
      tableId: pickStr(params, ['table', 'table_name'], 'leads'),
      dataToSend: 'autoMapInputData',
    }),
  },
};
