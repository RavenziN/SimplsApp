import React from 'react';
import { Share, PlusSquare, MoreVertical, Smartphone, CheckCircle2, ArrowRight } from 'lucide-react';

interface InstallPWAProps {
  onDismiss?: () => void;
  deferredPrompt?: any;
}

export const InstallPWASection: React.FC<InstallPWAProps> = ({ onDismiss, deferredPrompt }) => {
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const [promptInstalled, setPromptInstalled] = React.useState(false);
  const [canPrompt, setCanPrompt] = React.useState(Boolean(deferredPrompt));

  React.useEffect(() => {
    setCanPrompt(Boolean(deferredPrompt));
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setPromptInstalled(true);
      }
    }
  };

  return (
    <div className="bg-neutral-50 dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
            Adicionar à Tela de Início
          </h4>
          <p className="text-xs text-[#737373] dark:text-neutral-400">
            Acesse o MINIMAL como um app nativo, sem barras de navegador.
          </p>
        </div>
      </div>

      {canPrompt && !promptInstalled ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full py-3 px-4 bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] font-semibold text-xs rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
        >
          <span>Instalar Agora no Dispositivo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ) : promptInstalled ? (
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Solicitação de instalação enviada com sucesso!</span>
        </div>
      ) : isIOS ? (
        <div className="space-y-2 text-xs text-[#525252] dark:text-neutral-300 bg-white dark:bg-[#0A0A0A] p-3.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
          <p className="font-semibold text-[#0A0A0A] dark:text-white mb-1.5 flex items-center gap-1.5">
            <span>No Safari (iPhone / iPad):</span>
          </p>
          <div className="flex items-center gap-2 text-[11px] leading-relaxed">
            <span className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold text-[10px] shrink-0">
              1
            </span>
            <span className="flex items-center gap-1 flex-wrap">
              Toque no botão <Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" /> <b>Compartilhar</b> na barra inferior do Safari.
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] leading-relaxed">
            <span className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold text-[10px] shrink-0">
              2
            </span>
            <span className="flex items-center gap-1 flex-wrap">
              Role a lista e escolha <PlusSquare className="w-3.5 h-3.5 inline mx-0.5" /> <b>Adicionar à Tela de Início</b>.
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] leading-relaxed">
            <span className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold text-[10px] shrink-0">
              3
            </span>
            <span>Toque em <b>Adicionar</b> no canto superior direito.</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-xs text-[#525252] dark:text-neutral-300 bg-white dark:bg-[#0A0A0A] p-3.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
          <p className="font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
            No Chrome ou Navegador Android:
          </p>
          <div className="flex items-center gap-2 text-[11px] leading-relaxed">
            <span className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold text-[10px] shrink-0">
              1
            </span>
            <span className="flex items-center gap-1">
              Toque no menu <MoreVertical className="w-3.5 h-3.5 inline text-neutral-600 dark:text-neutral-400" /> (três pontinhos).
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] leading-relaxed">
            <span className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold text-[10px] shrink-0">
              2
            </span>
            <span>Selecione <b>Instalar aplicativo</b> ou <b>Adicionar à tela inicial</b>.</span>
          </div>
        </div>
      )}
    </div>
  );
};
