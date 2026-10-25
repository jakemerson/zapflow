import React from 'react';
import {
  Zap,
  ArrowRight,
  Upload,
  Copy,
  CheckCircle2,
  Server,
  TrendingDown,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Video,
  Mail,
  CreditCard,
  MessageSquare,
} from 'lucide-react';
import { useMigration } from '../context/MigrationContext';

interface LandingPageProps {
  onOpenMigrator: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenMigrator }) => {
  const { railwayDeployUrl, loadSampleZap } = useMigration();

  const handleTrySampleAndOpen = (sampleId: string) => {
    loadSampleZap(sampleId);
    onOpenMigrator();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/20">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900">ZapFlow</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                100% Grátis & Seguro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 1-Click Hosting Action */}
            <a
              href={railwayDeployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
            >
              <Server className="w-4 h-4 text-indigo-600" />
              <span>Ainda não tem seu n8n hospedado?</span>
              <span className="text-indigo-600 font-bold">Criar com 1 clique ↗</span>
            </a>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={onOpenMigrator}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm shadow-orange-500/25 transition transform active:scale-95 cursor-pointer"
            >
              <span>Usar Grátis Agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-orange-50/80 via-amber-50/40 to-transparent pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-semibold text-slate-700 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Compatível com arquivos .zip e .json do Zapier para n8n v1</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.15] mb-6">
            Migre seus fluxos do Zapier para o{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600">
              n8n em segundos
            </span>
            .
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Não perca horas recriando nós na mão. Arraste seu arquivo do Zapier, converta instantaneamente direto no seu navegador e cole no n8n com um simples{' '}
            <kbd className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-mono text-xs font-semibold">Ctrl+V</kbd>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              type="button"
              onClick={onOpenMigrator}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-base px-7 py-3.5 rounded-xl shadow-lg shadow-orange-600/25 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>Abrir Migrador Grátis</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href={railwayDeployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base px-6 py-3.5 rounded-xl border border-slate-300 shadow-xs transition hover:border-slate-400"
            >
              <Server className="w-5 h-5 text-indigo-600" />
              <span>Ainda não tem seu n8n? Criar com 1 clique</span>
            </a>
          </div>

          {/* Social Proof / Security Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Sem necessidade de cadastro ou cartão</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Privado (processamento no seu browser)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>Suporte a filtros, caminhos e variáveis</span>
            </div>
          </div>
        </div>

        {/* Visual Product Showcase Card */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-14">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-8">
            <div className="text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Como a mágica acontece
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                De um Zapier de $299/mês para seu n8n de ~$5/mês
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Step 1 Visual Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left relative">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm mb-3">
                  1
                </div>
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 text-sm">
                  <Upload className="w-4 h-4 text-orange-600" />
                  <span>Exporte do Zapier</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Baixe seu arquivo <strong className="text-slate-800">.zip</strong> ou <strong className="text-slate-800">.json</strong> direto das configurações do Zapier e arraste aqui.
                </p>
                <div className="mt-4 p-2.5 rounded bg-white border border-slate-200 text-[11px] font-mono text-slate-500 truncate">
                  📦 zapier_export.zip (3 workflows)
                </div>
              </div>

              {/* Step 2 Visual Card */}
              <div className="bg-orange-50/60 border border-orange-200 rounded-xl p-5 text-left relative">
                <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-sm mb-3">
                  2
                </div>
                <div className="flex items-center gap-2 mb-2 font-bold text-orange-950 text-sm">
                  <Cpu className="w-4 h-4 text-orange-600" />
                  <span>Conversão Automática</span>
                </div>
                <p className="text-xs text-orange-900/80 leading-relaxed">
                  O ZapFlow traduz os nós, credenciais e variáveis (<code className="font-mono text-orange-800">{"{{ $json.campo }}"}</code>) em 0.2 segundos.
                </p>
                <div className="mt-4 p-2.5 rounded bg-white border border-orange-200 text-[11px] font-mono text-emerald-700 font-semibold truncate flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% compatível com n8n v1</span>
                </div>
              </div>

              {/* Step 3 Visual Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left relative">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-3">
                  3
                </div>
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 text-sm">
                  <Copy className="w-4 h-4 text-emerald-600" />
                  <span>Cole no seu n8n</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Clique em Copiar, abra o editor do seu n8n e aperte <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono text-[10px] font-semibold">Ctrl+V</kbd>. O fluxo surge montado na hora!
                </p>
                <div className="mt-4 p-2.5 rounded bg-white border border-slate-200 text-[11px] font-mono text-indigo-700 font-semibold truncate flex items-center gap-1.5">
                  <span>⚡ Pronto para ativar</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-600 text-center sm:text-left">
                <strong>Quer testar agora mesmo sem arquivo?</strong> Escolha um fluxo de demonstração:
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTrySampleAndOpen('zoom-tldv')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5 text-blue-600" />
                  <span>Zoom → tl;dv</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTrySampleAndOpen('webhook-gmail')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-red-600" />
                  <span>Webhook → Gmail</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTrySampleAndOpen('stripe-slack-sheets')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                  <span>Stripe → Slack</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Callout: Ainda não tem seu n8n hospedado? */}
      <section className="py-12 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 border-y border-indigo-100/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border-2 border-indigo-200/80 shadow-md p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
                <Server className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hospedagem Recomendada na Nuvem</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Ainda não tem seu n8n hospedado?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Coloque sua própria central de automação no ar em menos de 2 minutos. Servidor dedicado com banco de dados PostgreSQL integrado, certificado HTTPS automático e <strong>execuções ilimitadas</strong> por apenas cerca de $5/mês.
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <a
                href={railwayDeployUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md shadow-indigo-600/20 transition transform hover:-translate-y-0.5"
              >
                <Server className="w-4 h-4" />
                <span>Criar meu n8n com 1 clique</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
              </a>
              <div className="text-center text-[11px] text-slate-400 mt-2">
                Template pronto para produção no Railway
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Detailed Steps */}
      <section className="py-16 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Passo a Passo Simples
          </span>
          <h2 className="text-3xl font-bold text-slate-950 mt-1">
            Como migrar sem dor de cabeça
          </h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto mt-2">
            O ZapFlow foi construído para que qualquer pessoa consiga migrar em menos de 3 minutos, mesmo sem ser programador.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg mb-4">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Exporte seus Zaps</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Acesse sua conta do Zapier, abra o menu de configurações e clique em <strong className="text-slate-800">Export Data</strong> para baixar o arquivo <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">.zip</code> completo.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Suporta múltiplos Zaps em lote</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Ou copie o JSON de um único Zap</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg mb-4">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Carregue no ZapFlow</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Arraste seu arquivo para o ZapFlow. Nosso motor inteligente analisa a árvore de nós, converte os tipos e mapeia as variáveis para a sintaxe nativa do n8n.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero dados saem da sua máquina</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Relatório com credenciais necessárias</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-4">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Cole no n8n e Ative</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Clique em <strong className="text-slate-800">Copiar para n8n</strong>. Abra uma tela em branco no seu n8n e pressione <kbd className="px-1 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-[10px]">Ctrl+V</kbd>. Todos os nós aparecem conectados!
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Estrutura 100% editável</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Basta plugar suas credenciais</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Comparison & ROI Section */}
      <section className="py-16 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Economia Real
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-1">
              Compare os custos
            </h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto mt-2">
              Veja quanto sua empresa ou agência economiza ao trocar o modelo por tarefa do Zapier pelo modelo ilimitado do n8n.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Zapier Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-xs relative">
              <div className="text-xs font-semibold text-slate-500 mb-1">Zapier (Plano Pro/Team)</div>
              <div className="text-3xl font-extrabold text-slate-900 mb-4">
                $299 <span className="text-sm font-normal text-slate-500">/ mês</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Cobrança por cada tarefa executada (tarefas extras são caras)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Gatilhos rápidos limitados a planos superiores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Custo total anual estimado: <strong>$3.588/ano</strong></span>
                </li>
              </ul>
            </div>

            {/* n8n Self-Hosted Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl p-6 border-2 border-emerald-400 shadow-md relative">
              <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Economia de 98%
              </div>
              <div className="text-xs font-semibold text-emerald-800 mb-1">n8n Hospedado na Nuvem</div>
              <div className="text-3xl font-extrabold text-emerald-950 mb-4">
                ~$5 <span className="text-sm font-normal text-emerald-800">/ mês</span>
              </div>
              <ul className="space-y-3 text-xs text-emerald-950 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Tarefas ilimitadas</strong> sem cobrança surpresa</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Execuções em tempo real sem limite artificial</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Custo total anual estimado: <strong>~$60/ano</strong> (Economia de mais de $3.500)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Perguntas Frequentes</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">O ZapFlow é realmente gratuito?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sim! Você pode converter quantos Zaps quiser sem limites, sem criar conta e sem fornecer dados de pagamento.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">Meus dados ficam salvos em algum servidor?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Não. O ZapFlow opera 100% no seu navegador através de um motor AST local em TypeScript. Nenhum arquivo ou dado de fluxo é enviado para servidores externos.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">Como colar o fluxo dentro do n8n?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Basta clicar no botão "Copiar para n8n" no ZapFlow. Depois, abra seu n8n no navegador, clique em qualquer área livre do canvas de edição e pressione <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-xs">Ctrl+V</kbd> (ou <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-xs">⌘V</kbd> no Mac). Os nós serão inseridos instantaneamente.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Final CTA */}
      <section className="py-16 bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold mb-4">Pronto para economizar milhares de dólares?</h2>
          <p className="text-orange-100 text-sm mb-8 max-w-xl mx-auto">
            Carregue seu arquivo do Zapier e veja seus fluxos convertidos para n8n em segundos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onOpenMigrator}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-bold text-base px-8 py-4 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Abrir Migrador Grátis</span>
              <ArrowRight className="w-5 h-5 text-orange-600" />
            </button>

            <a
              href={railwayDeployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black/25 hover:bg-black/35 text-white font-semibold text-sm px-6 py-4 rounded-xl border border-white/20 transition"
            >
              <Server className="w-4 h-4" />
              <span>Ainda não tem seu n8n? Criar com 1 clique</span>
            </a>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">
              ⚡
            </div>
            <span className="font-semibold text-slate-700">ZapFlow</span>
            <span>— Projeto 05 do Desafio 12 Projetos em 12 Semanas</span>
          </div>
          <div className="text-slate-400">
            Conversão 100% Client-Side • Compatível com n8n v1.x
          </div>
        </div>
      </footer>
    </div>
  );
};
