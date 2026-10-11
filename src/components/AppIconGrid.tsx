import React from 'react';

export interface AppIconOption {
  id: string;
  name: string;
  styleDesc: string;
  badge?: string;
}

export const APP_ICONS: AppIconOption[] = [
  { id: 'classic-dark', name: 'Minimal Dark', styleDesc: 'Fundo preto, tipografia clean' },
  { id: 'classic-light', name: 'Minimal Light', styleDesc: 'Fundo claro, tipografia escura' },
  { id: 'monogram-m', name: 'Monograma M', styleDesc: 'Geometria pura em linhas finas' },
  { id: 'zen-circle', name: 'Enso Zen', styleDesc: 'Círculo de respiração e equilíbrio' },
  { id: 'timeline-grid', name: 'Grade Temporal', styleDesc: 'Três pontos do dia e foco' },
  { id: 'hourglass-modern', name: 'Fluxo do Tempo', styleDesc: 'Ampulheta minimalista' },
  { id: 'dot-focus', name: 'Ponto Focal', styleDesc: 'Um ponto central em silêncio' },
  { id: 'horizon', name: 'Horizonte', styleDesc: 'Linhas paralelas do nascer ao pôr' },
  { id: 'square-pure', name: 'Quadrado Puro', styleDesc: 'Contorno fino e equilíbrio absoluto' },
];

export const AppIconGraphic: React.FC<{ iconId: string; className?: string }> = ({
  iconId,
  className = 'w-16 h-16',
}) => {
  switch (iconId) {
    case 'classic-dark':
      return (
        <div
          className={`${className} bg-[#0A0A0A] rounded-[22%] shadow-md flex flex-col items-center justify-center p-2.5 relative overflow-hidden border border-neutral-800`}
        >
          <span className="text-white text-[13px] tracking-[0.28em] font-semibold uppercase select-none">
            MIN
          </span>
          <div className="w-4 h-[1.5px] bg-white/70 mt-1 rounded-full" />
        </div>
      );

    case 'classic-light':
      return (
        <div
          className={`${className} bg-white rounded-[22%] shadow-md flex flex-col items-center justify-center p-2.5 relative overflow-hidden border border-neutral-200`}
        >
          <span className="text-[#0A0A0A] text-[13px] tracking-[0.28em] font-semibold uppercase select-none">
            MIN
          </span>
          <div className="w-4 h-[1.5px] bg-[#0A0A0A]/70 mt-1 rounded-full" />
        </div>
      );

    case 'monogram-m':
      return (
        <div
          className={`${className} bg-[#111111] rounded-[22%] shadow-md flex items-center justify-center p-3 relative overflow-hidden border border-neutral-800`}
        >
          <svg viewBox="0 0 40 40" className="w-7 h-7 text-white stroke-current fill-none stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
            <polyline points="8,32 8,10 20,24 32,10 32,32" />
          </svg>
        </div>
      );

    case 'zen-circle':
      return (
        <div
          className={`${className} bg-[#0A0A0A] rounded-[22%] shadow-md flex items-center justify-center p-3 relative overflow-hidden border border-neutral-800`}
        >
          <svg viewBox="0 0 40 40" className="w-7 h-7 text-white stroke-current fill-none stroke-[2] stroke-dasharray-[4 2]">
            <circle cx="20" cy="20" r="13" />
          </svg>
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full" />
        </div>
      );

    case 'timeline-grid':
      return (
        <div
          className={`${className} bg-[#171717] rounded-[22%] shadow-md flex flex-col items-center justify-center gap-1.5 p-3 relative overflow-hidden border border-neutral-800`}
        >
          <div className="w-6 h-[2px] bg-white/40 rounded-full" />
          <div className="w-6 h-[2px] bg-white rounded-full flex items-center justify-end">
            <div className="w-1.5 h-1.5 bg-white rounded-full -mr-0.5" />
          </div>
          <div className="w-6 h-[2px] bg-white/40 rounded-full" />
        </div>
      );

    case 'hourglass-modern':
      return (
        <div
          className={`${className} bg-[#0A0A0A] rounded-[22%] shadow-md flex items-center justify-center p-3 relative overflow-hidden border border-neutral-800`}
        >
          <svg viewBox="0 0 40 40" className="w-6 h-6 text-white stroke-current fill-none stroke-[2] stroke-linejoin-round">
            <path d="M10,8 L30,8 L20,20 L30,32 L10,32 L20,20 Z" />
          </svg>
        </div>
      );

    case 'dot-focus':
      return (
        <div
          className={`${className} bg-[#000000] rounded-[22%] shadow-md flex items-center justify-center p-3 relative overflow-hidden border border-neutral-800`}
        >
          <div className="w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
        </div>
      );

    case 'horizon':
      return (
        <div
          className={`${className} bg-[#0E0E0E] rounded-[22%] shadow-md flex flex-col items-center justify-center gap-1.5 p-3 relative overflow-hidden border border-neutral-800`}
        >
          <div className="w-7 h-[1.5px] bg-white/30" />
          <div className="w-7 h-[2px] bg-white" />
          <div className="w-7 h-[1.5px] bg-white/30" />
        </div>
      );

    case 'square-pure':
    default:
      return (
        <div
          className={`${className} bg-[#121212] rounded-[22%] shadow-md flex items-center justify-center p-3 relative overflow-hidden border border-neutral-800`}
        >
          <div className="w-5 h-5 border-2 border-white rounded-[4px] rotate-45" />
        </div>
      );
  }
};
