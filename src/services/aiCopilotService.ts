import { AiCopilotSettings } from '../types';
import { transpileZapierCodeHeuristic } from './n8nGenerator';

const SYSTEM_PROMPT = `Você é um engenheiro especialista em migração de scripts "Code by Zapier" para o nó "Code" (typeVersion 2) do n8n.
Regras obrigatórias do n8n Code Node:
1. No Zapier, os dados de entrada vêm no dicionário "inputData". No n8n (modo Run Once for All Items), os dados do item atual são lidos via "$input.first().json" ou iterando sobre "for (const item of $input.all())".
2. No Zapier, a saída é atribuída à variável "output = {...}". No n8n, o código DEVE encerrar retornando um array de objetos no formato "[{ json: { ... } }]".
3. Retorne APENAS o código-fonte limpo sem blocos markdown (\`\`\`), pronto para colar no parâmetro jsCode/pythonCode do n8n.`;

export async function refineCodeWithAi(
  sourceCode: string,
  language: 'javascript' | 'python',
  settings: AiCopilotSettings
): Promise<{
  ok: boolean;
  code: string;
  providerUsed: string;
  note: string;
}> {
  const heuristicCode = transpileZapierCodeHeuristic(sourceCode, language);

  if (settings.provider === 'heuristic') {
    return {
      ok: true,
      code: heuristicCode,
      providerUsed: 'Motor Heurístico AST Local (Offline)',
      note: 'Código convertido instantaneamente no navegador mapeando inputData → $input.first().json.',
    };
  }

  try {
    if (settings.provider === 'groq' && settings.groqKey.trim()) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.groqKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.1,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Converta este script ${language} do Code by Zapier para n8n Code Node v2:\n\n${sourceCode}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API retornou status ${response.status}`);
      }
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) {
        return {
          ok: true,
          code: content.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, ''),
          providerUsed: 'Groq Cloud (Llama 3.3 70B)',
          note: 'Script otimizado pela IA do Groq para o padrão n8n v2.',
        };
      }
    }

    if (settings.provider === 'openai' && settings.openaiKey.trim()) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.openaiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.1,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Converta este script ${language} do Code by Zapier para n8n Code Node v2:\n\n${sourceCode}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API retornou status ${response.status}`);
      }
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) {
        return {
          ok: true,
          code: content.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, ''),
          providerUsed: 'OpenAI (GPT-4o-mini)',
          note: 'Script otimizado via OpenAI para o padrão n8n v2.',
        };
      }
    }

    if (settings.provider === 'anthropic' && settings.anthropicKey.trim()) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.anthropicKey.trim(),
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-latest',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `Converta este script ${language} do Code by Zapier para n8n Code Node v2:\n\n${sourceCode}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API retornou status ${response.status}`);
      }
      const data = (await response.json()) as {
        content?: Array<{ text?: string }>;
      };
      const content = data.content?.[0]?.text?.trim();
      if (content) {
        return {
          ok: true,
          code: content.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, ''),
          providerUsed: 'Anthropic (Claude 3.5 Haiku)',
          note: 'Script otimizado via Claude 3.5 Haiku para o padrão n8n v2.',
        };
      }
    }

    return {
      ok: true,
      code: heuristicCode,
      providerUsed: 'Motor Heurístico AST Local (Fallback)',
      note: 'Nenhuma chave de API ativa para o provedor selecionado; aplicada conversão heurística local.',
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Falha de conexão';
    return {
      ok: false,
      code: heuristicCode,
      providerUsed: 'Motor Heurístico AST Local (Fallback Seguro)',
      note: `Aviso API (${msg}). Aplicada transpilação heurística local com sucesso.`,
    };
  }
}
