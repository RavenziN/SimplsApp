import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Play,
  ArrowDown,
  Palette,
  Volume2,
  CloudRain,
  Maximize2,
  Smartphone,
  RotateCcw,
} from 'lucide-react';

/**
 * 02 · Motivação Demo
 * Transição visual entre tarefas dispersas e a agenda organizada do Simpls
 */
export const MotivacaoDemo: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center select-none py-[clamp(0.2rem,0.8vh,0.5rem)]">
      {/* Tarefas dispersas */}
      <div className="flex flex-wrap items-center justify-center gap-[clamp(0.3rem,0.8vh,0.5rem)] max-w-[280px]">
        <span className="px-[clamp(0.5rem,1.2vh,0.75rem)] py-[clamp(0.2rem,0.5vh,0.35rem)] rounded-full bg-neutral-100 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-[#262626] text-[clamp(9.5px,1.3vh,11px)] font-medium text-neutral-600 dark:text-neutral-400">
          Trabalho
        </span>
        <span className="px-[clamp(0.5rem,1.2vh,0.75rem)] py-[clamp(0.2rem,0.5vh,0.35rem)] rounded-full bg-neutral-100 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-[#262626] text-[clamp(9.5px,1.3vh,11px)] font-medium text-neutral-600 dark:text-neutral-400">
          Academia
        </span>
        <span className="px-[clamp(0.5rem,1.2vh,0.75rem)] py-[clamp(0.2rem,0.5vh,0.35rem)] rounded-full bg-neutral-100 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-[#262626] text-[clamp(9.5px,1.3vh,11px)] font-medium text-neutral-600 dark:text-neutral-400">
          Estudos
        </span>
        <span className="px-[clamp(0.5rem,1.2vh,0.75rem)] py-[clamp(0.2rem,0.5vh,0.35rem)] rounded-full bg-neutral-100 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-[#262626] text-[clamp(9.5px,1.3vh,11px)] font-medium text-neutral-600 dark:text-neutral-400">
          Tempo para mim
        </span>
      </div>

      {/* Seta direcional */}
      <div className="my-[clamp(0.2rem,0.6vh,0.4rem)] flex flex-col items-center text-neutral-400 dark:text-neutral-500 animate-bounce">
        <ArrowDown className="w-3.5 h-3.5 stroke-[2]" />
      </div>

      {/* Item real da agenda Simpls */}
      <div className="w-full max-w-[280px] p-[clamp(0.4rem,1vh,0.65rem)] rounded-xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[clamp(10px,1.4vh,12px)] font-bold text-[#0A0A0A] dark:text-white">09:00</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A] dark:bg-white" />
          <span className="text-[clamp(10px,1.4vh,12px)] font-medium text-[#0A0A0A] dark:text-white">Planejar meu dia</span>
        </div>
        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
      </div>
    </div>
  );
};

/**
 * 03 · Agenda Demo
 * Reprodução fiel da tela real da Agenda (TimelineHeader + DateStrip + DayProgressSummary + VerticalTimeline)
 */
export const AgendaDemo: React.FC = () => {
  return (
    <div className="w-full max-w-[340px] rounded-2xl bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] p-[clamp(0.5rem,1.2vh,0.75rem)] shadow-sm text-left select-none overflow-hidden">
      {/* Top Header exato do app: Simpls + Ações */}
      <div className="flex items-center justify-between pb-[clamp(0.25rem,0.6vh,0.4rem)] border-b border-neutral-100 dark:border-[#1E1E1E]">
        <div className="flex items-center gap-1.5">
          <span className="text-[clamp(10.5px,1.4vh,12px)] font-extrabold tracking-tight text-[#0A0A0A] dark:text-white">Simpls</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
          <Search className="w-3 h-3" />
          <CalendarIcon className="w-3 h-3" />
          <div className="w-4.5 h-4.5 rounded-md bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center">
            <Plus className="w-2.5 h-2.5 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* DateStrip exato do app: Outubro 2026 + Dias da semana */}
      <div className="py-[clamp(0.25rem,0.6vh,0.4rem)]">
        <div className="flex items-center justify-between text-[clamp(9px,1.2vh,10px)] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
          <span>Outubro 2026</span>
          <span className="text-[8.5px] text-neutral-400">Semana 42</span>
        </div>
        <div className="grid grid-cols-6 gap-1 text-center">
          {[
            { num: '5', day: 'Seg', active: false },
            { num: '6', day: 'Ter', active: false },
            { num: '7', day: 'Qua', active: false },
            { num: '8', day: 'Qui', active: false },
            { num: '9', day: 'Sex', active: false },
            { num: '11', day: 'Dom', active: true },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`py-[clamp(1px,0.4vh,3px)] rounded-md flex flex-col items-center ${
                item.active
                  ? 'bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] font-bold shadow-2xs'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              <span className="text-[clamp(9px,1.2vh,10px)]">{item.num}</span>
              <span className="text-[7.5px] opacity-80">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DayProgressSummary exato do app */}
      <div className="py-[clamp(0.2rem,0.5vh,0.35rem)] border-t border-b border-neutral-100 dark:border-[#1E1E1E] my-0.5">
        <div className="flex items-center justify-between text-[clamp(9px,1.2vh,10px)] mb-0.5">
          <span className="font-semibold text-[#0A0A0A] dark:text-white">4 de 7 tarefas concluídas</span>
          <span className="font-mono font-bold text-[#0A0A0A] dark:text-white">57%</span>
        </div>
        <div className="w-full h-1 bg-neutral-100 dark:bg-[#262626] rounded-full overflow-hidden">
          <div className="h-full bg-[#0A0A0A] dark:bg-white rounded-full w-[57%]" />
        </div>
      </div>

      {/* Linha do tempo real com tarefas */}
      <div className="space-y-1 pt-1">
        {/* Tarefa Concluída */}
        <div className="flex items-center justify-between p-[clamp(3px,0.5vh,5px)] px-2 rounded-lg bg-neutral-50 dark:bg-[#181818] border border-neutral-100 dark:border-[#222222]">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[clamp(9px,1.2vh,10px)] text-neutral-400">08:00</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A] dark:bg-white" />
            <div>
              <p className="text-[clamp(9.5px,1.3vh,11px)] font-semibold text-[#0A0A0A] dark:text-white line-through opacity-60">
                Academia
              </p>
              <p className="text-[8px] text-neutral-400">Saúde · 08:00–09:00</p>
            </div>
          </div>
          <CheckCircle2 className="w-3 h-3 text-[#0A0A0A] dark:text-white" />
        </div>

        {/* Tarefa Pendente */}
        <div className="flex items-center justify-between p-[clamp(3px,0.5vh,5px)] px-2 rounded-lg bg-neutral-50 dark:bg-[#181818] border border-neutral-100 dark:border-[#222222]">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[clamp(9px,1.2vh,10px)] text-neutral-400">10:00</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A] dark:bg-white" />
            <div>
              <p className="text-[clamp(9.5px,1.3vh,11px)] font-semibold text-[#0A0A0A] dark:text-white">Analisar produtos</p>
              <p className="text-[8px] text-neutral-400">Trabalho · 10:00–12:00</p>
            </div>
          </div>
          <Circle className="w-3 h-3 text-neutral-300 dark:text-neutral-600" />
        </div>
      </div>
    </div>
  );
};

/**
 * 04 · Foco Demo
 * Reprodução fiel da tela real do modo Foco (FocusScreen)
 */
export const FocoDemo: React.FC = () => {
  return (
    <div className="w-full max-w-[340px] rounded-2xl bg-[#0A0A0A] text-white border border-[#262626] p-[clamp(0.5rem,1.2vh,0.75rem)] shadow-sm select-none flex flex-col items-center">
      {/* Top Header exato de FocusScreen */}
      <div className="w-full flex items-center justify-between text-[clamp(9px,1.2vh,10px)] font-medium pb-1.5 border-b border-[#1E1E1E]">
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#171717] border border-[#262626] text-neutral-300">
          <Palette className="w-2.5 h-2.5" />
          <span className="text-[8.5px]">Preto Puro</span>
        </div>

        {/* Presets 15m, 25m, 45m */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 text-[9px]">15m</span>
          <span className="text-white font-bold border-b border-white text-[9px] pb-0.5">25m</span>
          <span className="text-neutral-500 text-[9px]">45m</span>
        </div>

        {/* Som Ambiente */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#171717] border border-[#262626] text-blue-400">
          <CloudRain className="w-2.5 h-2.5" />
          <span className="text-[8.5px]">Chuva</span>
        </div>
      </div>

      {/* Mostrador Circular exato com ticks de FocusScreen */}
      <div className="relative w-[clamp(6.5rem,15vh,8rem)] h-[clamp(6.5rem,15vh,8rem)] flex items-center justify-center my-[clamp(0.25rem,0.8vh,0.5rem)]">
        <svg className="w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 200 200">
          {/* Track */}
          <circle cx="100" cy="100" r="80" fill="none" stroke="#1C1C1C" strokeWidth="2.5" />
          {/* Animated Stroke */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeDasharray="502"
            strokeDashoffset="125"
            strokeLinecap="round"
          />
          {/* Ticks radiais */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i * 360) / 36;
            return (
              <line
                key={i}
                x1="100"
                y1="10"
                x2="100"
                y2="15"
                stroke="#222222"
                strokeWidth="1.2"
                transform={`rotate(${angle} 100 100)`}
              />
            );
          })}
        </svg>

        {/* Centro com Play e Dígitos */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="w-[clamp(1.75rem,4vh,2.25rem)] h-[clamp(1.75rem,4vh,2.25rem)] rounded-full bg-white text-[#0A0A0A] flex items-center justify-center shadow-md mb-0.5">
            <Play className="w-3 h-3 fill-current ml-0.5" />
          </div>
          <span className="font-mono text-[clamp(1rem,2.4vh,1.25rem)] font-bold tracking-tight">25:00</span>
          <span className="text-[8px] text-neutral-400">Foco total</span>
        </div>
      </div>

      {/* Controles de ajuste rápido (+5m, Reset, -5m) */}
      <div className="flex items-center gap-2 text-[clamp(8.5px,1.1vh,9.5px)] text-neutral-400 pt-0.5">
        <span className="px-1.5 py-0.5 rounded-md bg-[#171717] border border-[#262626]">-5m</span>
        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#171717] border border-[#262626]">
          <RotateCcw className="w-2 h-2" /> Reset
        </span>
        <span className="px-1.5 py-0.5 rounded-md bg-[#171717] border border-[#262626]">+5m</span>
      </div>
    </div>
  );
};

/**
 * 05 · Respirar Demo
 * Reprodução fiel da tela real de respiração Box Breathe (BoxBreatheScreen)
 */
export const RespirarDemo: React.FC = () => {
  const [phaseProgress, setPhaseProgress] = useState(0.4);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseProgress((prev) => (prev >= 1 ? 0.2 : prev + 0.15));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-[340px] rounded-2xl bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] p-[clamp(0.5rem,1.2vh,0.75rem)] shadow-sm select-none flex flex-col items-center text-center">
      {/* Top Technique Switcher exato do app */}
      <div className="w-full flex items-center justify-between pb-1.5 border-b border-neutral-100 dark:border-[#1E1E1E]">
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] text-[8.5px] font-bold rounded-md">
            Box 4-4-4-4
          </span>
          <span className="px-1.5 py-0.5 text-neutral-400 text-[8.5px] font-medium">
            Calma 4-7-8
          </span>
        </div>
        <div className="p-1 rounded-md bg-neutral-100 dark:bg-[#1C1C1C] text-neutral-500">
          <Volume2 className="w-2.5 h-2.5" />
        </div>
      </div>

      {/* Fase atual */}
      <div className="mt-1 mb-0.5">
        <h4 className="text-[clamp(12px,1.8vh,14px)] font-light tracking-tight text-[#0A0A0A] dark:text-white">
          Inspire
        </h4>
        <p className="text-[8.5px] text-neutral-400 font-medium">
          pelo nariz · 4 segundos
        </p>
      </div>

      {/* A geometria real da caixa (The Box Geometry - 4 barras com preenchimento) */}
      <div className="relative w-[clamp(5.5rem,13vh,7rem)] h-[clamp(5.5rem,13vh,7rem)] my-1.5 flex items-center justify-center">
        {/* Barra Superior */}
        <div className="absolute top-0 left-0 right-0 h-2 rounded-full overflow-hidden bg-neutral-100 dark:bg-[#1C1C1C] border border-neutral-200 dark:border-[#262626]">
          <div
            className="h-full bg-[#0A0A0A] dark:bg-white rounded-full transition-all duration-300"
            style={{ width: `${phaseProgress * 100}%` }}
          />
        </div>
        {/* Barra Direita */}
        <div className="absolute top-0 right-0 bottom-0 w-2 rounded-full overflow-hidden bg-neutral-100 dark:bg-[#1C1C1C] border border-neutral-200 dark:border-[#262626]" />
        {/* Barra Inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-2 rounded-full overflow-hidden bg-neutral-100 dark:bg-[#1C1C1C] border border-neutral-200 dark:border-[#262626]" />
        {/* Barra Esquerda */}
        <div className="absolute top-0 left-0 bottom-0 w-2 rounded-full overflow-hidden bg-neutral-100 dark:bg-[#1C1C1C] border border-neutral-200 dark:border-[#262626]">
          <div className="w-full h-full bg-[#0A0A0A] dark:bg-white rounded-full" />
        </div>

        {/* Dígito central do Box Breathe */}
        <div className="flex flex-col items-center justify-center">
          <span className="font-mono text-[clamp(1.5rem,3.2vh,2rem)] font-light text-[#0A0A0A] dark:text-white leading-none">
            4
          </span>
          <span className="text-[7.5px] font-semibold text-neutral-400 uppercase tracking-widest mt-0.5">
            segundos
          </span>
        </div>
      </div>

      <p className="text-[8.5px] text-neutral-500 dark:text-neutral-400">
        Foco e clareza sob estresse
      </p>
    </div>
  );
};

/**
 * 06 · Relógio Demo
 * Reprodução fiel da tela real do Relógio de Mesa (ClockScreen)
 */
export const RelogioDemo: React.FC = () => {
  return (
    <div className="w-full max-w-[340px] rounded-2xl bg-[#0A0A0A] text-white border border-[#262626] p-[clamp(0.5rem,1.2vh,0.75rem)] shadow-sm select-none flex flex-col items-center">
      {/* Top Floating Controls exatos do ClockScreen */}
      <div className="w-full flex items-center justify-between pb-1.5 border-b border-[#1E1E1E]">
        <span className="px-1.5 py-0.5 bg-[#141414] border border-[#262626] rounded-md text-[8.5px] font-semibold text-neutral-300">
          Formato 24h
        </span>
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded-md bg-white text-[#0A0A0A] text-[8.5px] font-semibold flex items-center gap-0.5">
            <Smartphone className="w-2.5 h-2.5 rotate-90" /> Modo Mesa
          </span>
          <div className="p-0.5 rounded-md bg-[#141414] border border-[#262626] text-neutral-400">
            <Maximize2 className="w-2.5 h-2.5" />
          </div>
        </div>
      </div>

      {/* Data Subtitle em maiúsculas */}
      <div className="text-neutral-400 text-[clamp(8px,1.1vh,9.5px)] font-medium tracking-widest uppercase my-1 text-center">
        Domingo, 11 de Outubro
      </div>

      {/* Painéis reais Flip Clock [ 13 ] [ 51 ] */}
      <div className="flex items-center justify-center gap-2 my-1">
        {/* Painel Hora */}
        <div className="w-[clamp(3.2rem,8vh,3.8rem)] h-[clamp(3.4rem,8.5vh,4.2rem)] rounded-xl bg-[#111111] border border-[#222222] flex items-center justify-center relative overflow-hidden shadow-inner">
          <span className="font-mono text-[clamp(1.4rem,3.2vh,1.75rem)] font-extrabold tracking-tight">13</span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-[#0A0A0A]" />
        </div>

        {/* Painel Minuto */}
        <div className="w-[clamp(3.2rem,8vh,3.8rem)] h-[clamp(3.4rem,8.5vh,4.2rem)] rounded-xl bg-[#111111] border border-[#222222] flex items-center justify-center relative overflow-hidden shadow-inner">
          <span className="font-mono text-[clamp(1.4rem,3.2vh,1.75rem)] font-extrabold tracking-tight">51</span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-[#0A0A0A]" />
        </div>
      </div>

      <div className="text-[7.5px] font-bold tracking-widest text-neutral-500 uppercase my-0.5">
        Relógio de Mesa
      </div>

      {/* Lista de Fusos Horários Mundiais */}
      <div className="w-full space-y-0.5 pt-1 border-t border-[#1C1C1C]">
        {[
          { city: 'São Paulo', time: '13:51' },
          { city: 'Nova York', time: '12:51' },
          { city: 'Londres', time: '17:51' },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-[clamp(8.5px,1.1vh,9.5px)] px-1.5 py-0.5">
            <span className="text-neutral-400">{item.city}</span>
            <span className="font-mono font-bold text-neutral-200">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
