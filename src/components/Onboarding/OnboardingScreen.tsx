import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ArrowRight,
} from 'lucide-react';
import {
  AgendaDemo,
  FocoDemo,
  RespirarDemo,
} from './OnboardingDemos';
import { PedroSignature } from './PedroSignature';

export const ONBOARDING_STORAGE_KEY = 'minimal_onboarding_completed';

export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
}

export function setCompletedOnboarding(completed = true): void {
  if (typeof window === 'undefined') return;
  if (completed) {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  } else {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  }
}

interface OnboardingScreenProps {
  onComplete: (mode: 'register' | 'login') => void;
  onClose?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  onClose,
}) => {
  // 5 TELAS DO ONBOARDING
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 5;

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentStep < totalSteps - 1) {
        setCurrentStep((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep((prev) => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, totalSteps]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish('register');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else if (onClose) {
      onClose();
    }
  };

  const handleFinish = (mode: 'register' | 'login') => {
    setCompletedOnboarding(true);
    onComplete(mode);
  };

  const handleSkip = () => {
    setCompletedOnboarding(true);
    if (onClose) {
      onClose();
    } else {
      onComplete('login');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#F7F7F7] dark:bg-[#0A0A0A] flex flex-col items-center justify-center w-full overflow-hidden select-none sm:p-[clamp(0.5rem,1.5vh,1rem)]"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Container Principal com Flexbox 100% vh, sem rolagem */}
      <div className="w-full h-full max-w-[430px] sm:max-h-[min(880px,100vh)] sm:rounded-[36px] bg-white dark:bg-[#0A0A0A] shadow-2xl flex flex-col justify-between relative overflow-hidden border-0 sm:border border-neutral-200/80 dark:border-[#262626]">
        {/* Barra de Progresso Segmentada (7 passos) & Top Bar */}
        <div className="shrink-0 px-[clamp(1rem,4vw,1.5rem)] pt-[clamp(0.75rem,2vh,1.25rem)] pb-[clamp(0.35rem,1vh,0.6rem)] z-20">
          {/* 7 Segmentos */}
          <div className="flex items-center gap-1 mb-[clamp(0.35rem,0.8vh,0.5rem)]">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className="h-[clamp(2.5px,0.45vh,3.5px)] flex-1 rounded-full overflow-hidden bg-neutral-200 dark:bg-[#262626] transition-colors"
              >
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    idx <= currentStep
                      ? 'bg-[#0A0A0A] dark:bg-white w-full'
                      : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Ações superiores */}
          <div className="flex items-center justify-between min-h-[clamp(18px,2.4vh,22px)]">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-0.5 text-[clamp(11px,1.4vh,12px)] text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>
            ) : (
              <span className="text-[clamp(9px,1.2vh,10px)] font-bold tracking-widest uppercase text-neutral-400">
                Apresentação · 1 de 5
              </span>
            )}

            {currentStep < totalSteps - 1 && (
              <button
                type="button"
                onClick={handleSkip}
                className="text-[clamp(11px,1.4vh,12px)] font-medium text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                Pular
              </button>
            )}
          </div>
        </div>

        {/* Área Narrativa e Demos — Flexbox ajustado sem rolagem */}
        <div className="flex-1 min-h-0 px-[clamp(1rem,4vw,1.5rem)] py-[clamp(0.2rem,0.8vh,0.5rem)] flex flex-col justify-between overflow-hidden">
          {/* TELA 1 — APRESENTAÇÃO DO FUNDADOR */}
          {currentStep === 0 && (
            <div className="flex flex-col h-full justify-between animate-fadeIn overflow-hidden">
              <div className="shrink-0 pt-[clamp(0.25rem,1vh,0.75rem)]">
                <span className="font-extrabold tracking-widest text-[clamp(10.5px,1.4vh,12px)] text-[#0A0A0A] dark:text-white uppercase">
                  Simpls
                </span>

                <h1 className="text-[clamp(1.5rem,4vh,2.15rem)] font-extrabold tracking-tight text-[#0A0A0A] dark:text-white mt-[clamp(0.4rem,1.2vh,0.85rem)] mb-[clamp(0.4rem,1.2vh,0.85rem)] leading-[1.12]">
                  Oi, eu sou
                  <br />
                  o Pedro.
                </h1>

                <div className="space-y-[clamp(0.35rem,1vh,0.65rem)] text-[clamp(0.72rem,1.7vh,0.85rem)] text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
                  <p>
                    Criei o Simpls por um motivo muito pessoal: queria encontrar uma forma mais simples de organizar meus dias e cuidar melhor de mim no meio de tanta coisa acontecendo.
                  </p>
                  <p>
                    Às vezes, são tantas tarefas e horários que até o simples parece difícil. Eu queria enxergar melhor meu dia, focar no que importava e encontrar espaço para respirar.
                  </p>
                </div>
              </div>

              {/* Cartão Conceitual Editorial */}
              <div className="mt-[clamp(1rem,3vh,1.75rem)] mb-auto py-[clamp(0.25rem,1vh,0.5rem)] shrink-0">
                <div className="p-[clamp(0.75rem,2vh,1.15rem)] rounded-2xl bg-neutral-100 dark:bg-[#141414] border border-neutral-200 dark:border-[#222222]">
                  <span className="text-[clamp(8.5px,1.1vh,10px)] font-bold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 block mb-1">
                    Filosofia
                  </span>
                  <p className="font-mono text-[clamp(11px,1.4vh,12.5px)] font-bold tracking-wider text-[#0A0A0A] dark:text-white">
                    SEU DIA. NO SEU RITMO.
                  </p>
                </div>
              </div>

              {/* Botão Inferior sempre visível */}
              <div className="shrink-0 pt-[clamp(0.25rem,0.8vh,0.5rem)] pb-[clamp(0.75rem,2vh,1.25rem)]">
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-[clamp(0.65rem,1.8vh,0.85rem)] bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] font-semibold text-[clamp(0.75rem,1.6vh,0.875rem)] rounded-full hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Ver como funciona</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TELA 3 — AGENDA */}
          {currentStep === 1 && (
            <div className="flex flex-col h-full justify-between animate-fadeIn overflow-hidden">
              <div className="shrink-0 pt-[clamp(0.2rem,0.8vh,0.5rem)]">
                <span className="text-[clamp(9px,1.2vh,10.5px)] font-bold tracking-widest uppercase text-neutral-400">
                  Organização · 2 de 5
                </span>

                <h2 className="text-[clamp(1.35rem,3.4vh,1.85rem)] font-extrabold tracking-tight text-[#0A0A0A] dark:text-white mt-[clamp(0.15rem,0.6vh,0.4rem)] mb-[clamp(0.15rem,0.5vh,0.35rem)] leading-tight">
                  Seu dia, com mais clareza.
                </h2>

                <p className="text-[clamp(0.7rem,1.6vh,0.825rem)] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Transforme o que está na sua cabeça em um plano claro para o dia.
                </p>
              </div>

              {/* Demonstração exata da Agenda do app */}
              <div className="flex-1 min-h-0 flex items-start justify-center overflow-hidden pt-[clamp(1rem,3vh,2rem)]">
                <AgendaDemo />
              </div>

              {/* Botão Inferior sempre visível */}
              <div className="shrink-0 pt-[clamp(0.25rem,0.8vh,0.5rem)] pb-[clamp(0.75rem,2vh,1.25rem)]">
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-[clamp(0.65rem,1.8vh,0.85rem)] bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] font-semibold text-[clamp(0.75rem,1.6vh,0.875rem)] rounded-full hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TELA 4 — FOCO */}
          {currentStep === 2 && (
            <div className="flex flex-col h-full justify-between animate-fadeIn overflow-hidden">
              <div className="shrink-0 pt-[clamp(0.2rem,0.8vh,0.5rem)]">
                <span className="text-[clamp(9px,1.2vh,10.5px)] font-bold tracking-widest uppercase text-neutral-400">
                  Concentração · 3 de 5
                </span>

                <h2 className="text-[clamp(1.35rem,3.4vh,1.85rem)] font-extrabold tracking-tight text-[#0A0A0A] dark:text-white mt-[clamp(0.15rem,0.6vh,0.4rem)] mb-[clamp(0.15rem,0.5vh,0.35rem)] leading-tight">
                  Uma coisa de cada vez.
                </h2>

                <p className="text-[clamp(0.7rem,1.6vh,0.825rem)] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Nem tudo precisa da sua atenção ao mesmo tempo. Reserve um momento para aquilo que está fazendo agora.
                </p>
              </div>

              {/* Demonstração exata do modo Foco do app */}
              <div className="flex-1 min-h-0 flex items-start justify-center overflow-hidden pt-[clamp(1rem,3vh,2rem)]">
                <FocoDemo />
              </div>

              {/* Botão Inferior sempre visível */}
              <div className="shrink-0 pt-[clamp(0.25rem,0.8vh,0.5rem)] pb-[clamp(0.75rem,2vh,1.25rem)]">
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-[clamp(0.65rem,1.8vh,0.85rem)] bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] font-semibold text-[clamp(0.75rem,1.6vh,0.875rem)] rounded-full hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TELA 5 — RESPIRAR */}
          {currentStep === 3 && (
            <div className="flex flex-col h-full justify-between animate-fadeIn overflow-hidden">
              <div className="shrink-0 pt-[clamp(0.2rem,0.8vh,0.5rem)]">
                <span className="text-[clamp(9px,1.2vh,10.5px)] font-bold tracking-widest uppercase text-neutral-400">
                  Pausa · 4 de 5
                </span>

                <h2 className="text-[clamp(1.35rem,3.4vh,1.85rem)] font-extrabold tracking-tight text-[#0A0A0A] dark:text-white mt-[clamp(0.15rem,0.6vh,0.4rem)] mb-[clamp(0.15rem,0.5vh,0.35rem)] leading-tight">
                  Você também faz parte da sua rotina.
                </h2>

                <p className="text-[clamp(0.7rem,1.6vh,0.825rem)] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Entre compromissos e tarefas, vale reservar alguns instantes para desacelerar e voltar ao momento presente.
                </p>
              </div>

              {/* Demonstração exata do Box Breathe do app */}
              <div className="flex-1 min-h-0 flex items-start justify-center overflow-hidden pt-[clamp(1rem,3vh,2rem)]">
                <RespirarDemo />
              </div>

              {/* Botão Inferior sempre visível */}
              <div className="shrink-0 pt-[clamp(0.25rem,0.8vh,0.5rem)] pb-[clamp(0.75rem,2vh,1.25rem)]">
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-[clamp(0.65rem,1.8vh,0.85rem)] bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] font-semibold text-[clamp(0.75rem,1.6vh,0.875rem)] rounded-full hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TELA 7 — CONVITE FINAL & CADASTRO */}
          {currentStep === 4 && (
            <div className="flex flex-col h-full justify-between animate-fadeIn overflow-hidden">
              <div className="shrink-0 pt-[clamp(0.25rem,1vh,0.75rem)]">
                <span className="font-extrabold tracking-widest text-[clamp(10.5px,1.4vh,12px)] text-[#0A0A0A] dark:text-white uppercase">
                  Simpls
                </span>

                <h2 className="text-[clamp(1.35rem,3.4vh,1.85rem)] font-extrabold tracking-tight text-[#0A0A0A] dark:text-white mt-[clamp(0.25rem,0.8vh,0.5rem)] mb-[clamp(0.25rem,0.8vh,0.45rem)] leading-tight">
                  Eu criei para mim.
                  <br />
                  Agora, quero compartilhar com você.
                </h2>

                <p className="text-[clamp(0.7rem,1.6vh,0.825rem)] text-neutral-600 dark:text-neutral-300 leading-relaxed mb-[clamp(0.35rem,1vh,0.75rem)]">
                  O Simpls nasceu da minha vontade de viver os dias com mais organização, foco e equilíbrio. Espero que ele também encontre um espaço na sua rotina.
                </p>

                {/* Assinatura real de Pedro Otávio */}
                <div className="pt-[clamp(0.25rem,0.8vh,0.5rem)] border-t border-neutral-100 dark:border-[#202020] space-y-0.5">
                  <div className="w-[clamp(9rem,26vw,12rem)] h-[clamp(2.4rem,5vh,3rem)] flex items-center">
                    <PedroSignature className="h-full" />
                  </div>
                  <p className="text-[clamp(11px,1.4vh,13px)] font-bold text-[#0A0A0A] dark:text-white tracking-tight">
                    Pedro Otávio
                  </p>
                  <p className="text-[clamp(9.5px,1.2vh,11px)] text-neutral-500 dark:text-neutral-400">
                    Criador do Simpls
                  </p>
                </div>
              </div>

              {/* Botões de Ação Final (sem rolagem) */}
              <div className="shrink-0 space-y-[clamp(0.25rem,0.8vh,0.5rem)] pt-[clamp(0.25rem,0.8vh,0.5rem)] pb-[clamp(0.75rem,2vh,1.25rem)]">
                <button
                  type="button"
                  onClick={() => handleFinish('register')}
                  className="w-full py-[clamp(0.65rem,1.8vh,0.85rem)] bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] font-semibold text-[clamp(0.75rem,1.6vh,0.875rem)] rounded-full hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-sm text-center"
                >
                  Criar minha conta
                </button>

                <button
                  type="button"
                  onClick={() => handleFinish('login')}
                  className="w-full py-[clamp(0.35rem,1vh,0.5rem)] text-[clamp(10.5px,1.4vh,12px)] font-semibold text-neutral-600 dark:text-neutral-300 hover:text-[#0A0A0A] dark:hover:text-white transition-colors cursor-pointer text-center"
                >
                  Já tenho uma conta · Entrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
