import React, { useState } from 'react';
import {
  X,
  Share,
  Download,
  Smartphone,
  CheckCircle2,
  Calendar,
  Zap,
  Wind,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { usePWAInstall } from '../utils/pwaInstall';

interface DiscoveryTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: 'agenda' | 'foco' | 'respirar' | 'relogio') => void;
}

export const DiscoveryTutorialModal: React.FC<DiscoveryTutorialModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [installStatus, setInstallStatus] = useState<string | null>(null);
  const pwa = usePWAInstall();

  // Smart platform toggle: default to user's device
  const [platformTab, setPlatformTab] = useState<'ios' | 'android'>(() =>
    pwa.isIOS ? 'ios' : 'android'
  );

  if (!isOpen) return null;

  const handleFinishTutorial = () => {
    onClose();
    if (onNavigateToTab) {
      onNavigateToTab('agenda');
    }
  };

  const handleInstallClick = async () => {
    setInstallStatus('Iniciando instalação...');
    const result = await pwa.triggerInstall();
    if (result.outcome === 'accepted') {
      setInstallStatus('Aplicativo instalado com sucesso na tela inicial!');
    } else if (result.outcome === 'dismissed') {
      setInstallStatus('Instalação cancelada. Você pode tentar novamente a qualquer momento.');
    } else {
      setInstallStatus(
        pwa.isIOS
          ? 'No Safari, toque em Compartilhar e selecione "Adicionar à Tela de Início".'
          : 'Toque no menu ⋮ do navegador e selecione "Instalar app" ou "Adicionar à tela inicial".'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-white dark:bg-[#121212] rounded-3xl border border-neutral-200 dark:border-[#262626] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Minimal */}
        <div className="p-4 px-6 border-b border-neutral-100 dark:border-[#202020] flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">
            Conheça o Simpls · {step} de 3
          </span>
          <button
            type="button"
            onClick={handleFinishTutorial}
            className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-[#202020] flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo do Tutorial */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-between">
          {/* TELA A — INTRODUÇÃO AO TUTORIAL */}
          {step === 1 && (
            <div className="flex flex-col h-full justify-between space-y-6">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">
                  Introdução
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A0A0A] dark:text-white mt-1 leading-tight">
                  Vamos começar?
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mt-3">
                  O Simpls foi criado para deixar sua rotina mais clara e simples. Vamos mostrar o essencial para você começar.
                </p>

                {/* 4 Módulos em Destaque Visual */}
                <div className="grid grid-cols-2 gap-2.5 pt-4">
                  <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-100 dark:border-[#262626]">
                    <Calendar className="w-4 h-4 text-[#0A0A0A] dark:text-white mb-2" />
                    <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white">Agenda</h4>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Sua linha do tempo visual
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-100 dark:border-[#262626]">
                    <Zap className="w-4 h-4 text-[#0A0A0A] dark:text-white mb-2" />
                    <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white">Foco</h4>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Blocos com áudio ambiente
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-100 dark:border-[#262626]">
                    <Wind className="w-4 h-4 text-[#0A0A0A] dark:text-white mb-2" />
                    <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white">Respirar</h4>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Pausa consciente Box 4-4
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-100 dark:border-[#262626]">
                    <Clock className="w-4 h-4 text-[#0A0A0A] dark:text-white mb-2" />
                    <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white">Relógio</h4>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Mesa, fusos e cronômetro
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões da Tela A */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] font-semibold text-xs sm:text-sm rounded-full hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-2"
                >
                  <span>Começar tutorial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleFinishTutorial}
                  className="w-full py-2.5 text-xs text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer text-center"
                >
                  Explorar por conta própria
                </button>
              </div>
            </div>
          )}

          {/* TELA B — COMO ADICIONAR À TELA INICIAL */}
          {step === 2 && (
            <div className="flex flex-col h-full justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">
                  Instalação
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0A0A0A] dark:text-white mt-1 leading-tight">
                  Tenha o Simpls sempre à mão.
                </h2>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mt-2">
                  Adicione o Simpls à tela inicial do seu celular para abrir o aplicativo com mais facilidade.
                </p>

                {/* Status quando já instalado */}
                {pwa.isInstalled ? (
                  <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <p className="text-xs font-semibold">
                      O Simpls já está instalado na sua tela inicial!
                    </p>
                  </div>
                ) : null}

                {/* Alternador de Plataforma (iPhone vs Android) */}
                <div className="mt-4 flex items-center p-1 bg-neutral-100 dark:bg-[#1A1A1A] rounded-xl border border-neutral-200 dark:border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setPlatformTab('ios')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      platformTab === 'ios'
                        ? 'bg-white dark:bg-[#2A2A2A] text-[#0A0A0A] dark:text-white shadow-xs'
                        : 'text-neutral-500 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    No iPhone
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformTab('android')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      platformTab === 'android'
                        ? 'bg-white dark:bg-[#2A2A2A] text-[#0A0A0A] dark:text-white shadow-xs'
                        : 'text-neutral-500 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    No Android
                  </button>
                </div>

                {/* Conteúdo iPhone */}
                {platformTab === 'ios' && (
                  <div className="mt-3 p-4 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200/80 dark:border-[#262626] space-y-2.5 animate-fadeIn">
                    <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                      No iPhone
                    </h4>
                    <ol className="text-xs text-neutral-600 dark:text-neutral-300 space-y-2 list-decimal list-inside leading-relaxed">
                      <li>Abra o Simpls no <strong className="text-[#0A0A0A] dark:text-white">Safari</strong>.</li>
                      <li>Toque no botão <strong className="text-[#0A0A0A] dark:text-white">Compartilhar</strong> (ícone com seta para cima).</li>
                      <li>Selecione <strong className="text-[#0A0A0A] dark:text-white">"Adicionar à Tela de Início"</strong>.</li>
                      <li>Confirme em <strong className="text-[#0A0A0A] dark:text-white">"Adicionar"</strong>.</li>
                    </ol>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 pt-1 leading-normal italic">
                      * A localização ou nomenclatura dos comandos pode variar conforme a versão do iOS.
                    </p>
                  </div>
                )}

                {/* Conteúdo Android */}
                {platformTab === 'android' && (
                  <div className="mt-3 p-4 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200/80 dark:border-[#262626] space-y-2.5 animate-fadeIn">
                    <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                      No Android
                    </h4>
                    <ol className="text-xs text-neutral-600 dark:text-neutral-300 space-y-2 list-decimal list-inside leading-relaxed">
                      <li>Abra o Simpls no navegador.</li>
                      <li>Abra o menu do navegador (ícone de três pontos <strong>⋮</strong>).</li>
                      <li>Selecione <strong className="text-[#0A0A0A] dark:text-white">"Instalar app"</strong> ou <strong className="text-[#0A0A0A] dark:text-white">"Adicionar à tela inicial"</strong>, conforme a opção disponível.</li>
                      <li>Confirme a instalação.</li>
                    </ol>

                    {/* Botão nativo direto se o prompt estiver disponível */}
                    {pwa.hasNativePrompt && !pwa.isInstalled && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleInstallClick}
                          className="w-full py-2.5 bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] font-semibold text-xs rounded-xl hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Instalar Simpls diretamente
                        </button>
                      </div>
                    )}

                    {installStatus && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 text-center pt-1 font-medium">
                        {installStatus}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Botão da Tela B */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full py-3.5 bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] font-semibold text-xs sm:text-sm rounded-full hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-2"
                >
                  <span>Entendi →</span>
                </button>
              </div>
            </div>
          )}

          {/* TELA C — DESCUBRA O APLICATIVO */}
          {step === 3 && (
            <div className="flex flex-col h-full justify-between space-y-6">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">
                  Exploração
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A0A0A] dark:text-white mt-1 leading-tight">
                  O resto é com você.
                </h2>
                <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mt-4 space-y-3">
                  <p>
                    O Simpls foi pensado para ser simples de explorar. Conheça sua Agenda, experimente o Foco, faça uma pausa em Respirar e descubra as ferramentas de tempo no Relógio.
                  </p>
                  <p className="font-medium text-[#0A0A0A] dark:text-white pt-1">
                    Não existe uma ordem certa. Explore no seu ritmo e encontre o que funciona melhor para você.
                  </p>
                </div>
              </div>

              {/* Botão da Tela C */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleFinishTutorial}
                  className="w-full py-3.5 bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] font-semibold text-xs sm:text-sm rounded-full hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-sm text-center"
                >
                  Explorar Simpls
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
