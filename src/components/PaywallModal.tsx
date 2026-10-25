import React, { useState } from 'react';
import { X, Crown, Check, Ticket, Sparkles } from 'lucide-react';
import { PRO_LICENSE_PRICE_BRL } from '../constants/defaults';
import { useMigration } from '../context/MigrationContext';

export const PaywallModal: React.FC = () => {
  const {
    paywallModalOpen,
    closePaywall,
    paywallReason,
    redeemCoupon,
    toggleProTestMode,
  } = useMigration();

  const [couponInput, setCouponInput] = useState('DESAFIO12X12');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!paywallModalOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const res = redeemCoupon(couponInput);
    if (!res.valid) {
      setFeedback(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl overflow-hidden">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-600/20 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                ZapFlow Pro • Agency Batch Suite
              </h3>
              <p className="text-xs text-amber-200/80">
                Licença Vitalícia • R$ {PRO_LICENSE_PRICE_BRL} pagamento único
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closePaywall}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed">
            {paywallReason}
          </p>

          <ul className="space-y-2 text-slate-200">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Exportação em lote ilimitada (converta 20, 50 ou 100 Zaps de uma vez)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sticky Notes White-Label com o nome da sua agência/consultoria</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Injeção automática do seu link de afiliado Railway nos fluxos entregues</span>
            </li>
          </ul>

          {/* Coupon Form */}
          <form
            onSubmit={handleApplyCoupon}
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
          >
            <label className="block font-bold text-amber-300 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5" />
              Possui um cupom do Desafio 12x12 ou código VIP?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="DESAFIO12X12"
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold transition cursor-pointer"
              >
                Ativar Cupom
              </button>
            </div>
            {feedback && <p className="text-[11px] text-rose-400">{feedback}</p>}
          </form>

          <button
            type="button"
            onClick={() => {
              toggleProTestMode();
              closePaywall();
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Desbloquear ZapFlow Pro Instantaneamente (Demo)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
