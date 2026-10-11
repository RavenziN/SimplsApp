import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

type BreathePhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

interface Technique {
  id: string;
  name: string;
  shortDesc: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
}

const TECHNIQUES: Technique[] = [
  {
    id: 'box',
    name: 'Box 4-4-4-4',
    shortDesc: 'Foco e clareza sob estresse (sem dar sono)',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
  },
  {
    id: 'relax',
    name: 'Calma 4-7-8',
    shortDesc: 'Relaxamento profundo para ansiedade e sono',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
  },
  {
    id: 'balance',
    name: 'Equilíbrio 5-5',
    shortDesc: 'Ritmo contínuo para manter calma no dia a dia',
    inhale: 5,
    hold1: 0,
    exhale: 5,
    hold2: 0,
  },
];

export const BoxBreatheScreen: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentTechnique, setCurrentTechnique] = useState<Technique>(TECHNIQUES[0]);
  const [phase, setPhase] = useState<BreathePhase>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Sync app-wide dark mode via document.documentElement.classList
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const requestRef = useRef<number | null>(null);
  const phaseStartTimeRef = useRef<number>(0);

  // Gentle audio chime on phase transition
  const playPhaseChime = (p: BreathePhase) => {
    if (!isSoundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';

      const freqs: Record<BreathePhase, number> = {
        inhale: 440,
        hold1: 523.25,
        exhale: 392,
        hold2: 349.23,
      };

      osc.frequency.setValueAtTime(freqs[p] || 440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      // Audio fallback
    }
  };

  const getPhaseDuration = (p: BreathePhase, tech: Technique) => {
    switch (p) {
      case 'inhale':
        return tech.inhale;
      case 'hold1':
        return tech.hold1;
      case 'exhale':
        return tech.exhale;
      case 'hold2':
        return tech.hold2;
    }
  };

  const getNextPhase = (current: BreathePhase, tech: Technique): BreathePhase => {
    if (current === 'inhale') {
      return tech.hold1 > 0 ? 'hold1' : 'exhale';
    }
    if (current === 'hold1') {
      return 'exhale';
    }
    if (current === 'exhale') {
      return tech.hold2 > 0 ? 'hold2' : 'inhale';
    }
    return 'inhale';
  };

  useEffect(() => {
    if (!isActive) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      setPhase('inhale');
      setCountdown(currentTechnique.inhale);
      setPhaseProgress(0);
      return;
    }

    phaseStartTimeRef.current = performance.now();

    const tick = (now: number) => {
      const durationSec = getPhaseDuration(phase, currentTechnique);
      const durationMs = durationSec * 1000;
      const elapsedMs = now - phaseStartTimeRef.current;
      const progress = Math.min(1, elapsedMs / durationMs);

      setPhaseProgress(progress);
      const remainingSec = Math.max(1, Math.ceil((durationMs - elapsedMs) / 1000));
      setCountdown(remainingSec);

      if (elapsedMs >= durationMs) {
        const next = getNextPhase(phase, currentTechnique);
        setPhase(next);
        phaseStartTimeRef.current = now;
        playPhaseChime(next);
      }

      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, phase, currentTechnique, isSoundEnabled]);

  const handleStartStop = () => {
    if (!isActive) {
      setPhase('inhale');
      setCountdown(currentTechnique.inhale);
      setPhaseProgress(0);
      playPhaseChime('inhale');
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  const getPhaseTitle = (p: BreathePhase) => {
    switch (p) {
      case 'inhale':
        return 'Inspire';
      case 'hold1':
        return 'Segure';
      case 'exhale':
        return 'Expire';
      case 'hold2':
        return 'Segure';
    }
  };

  // Visual fill calculation for the 4 bars of the box
  const getBarFill = (bar: 'top' | 'right' | 'bottom' | 'left') => {
    if (!isActive) {
      return bar === 'top' || bar === 'left' ? 1 : 0;
    }

    if (bar === 'top') {
      if (phase === 'inhale') return phaseProgress;
      return 1;
    }

    if (bar === 'right') {
      if (phase === 'inhale') return 0;
      if (phase === 'hold1') return phaseProgress;
      return 1;
    }

    if (bar === 'bottom') {
      if (phase === 'inhale' || phase === 'hold1') return 0;
      if (phase === 'exhale') return phaseProgress;
      return 1;
    }

    if (bar === 'left') {
      if (phase === 'hold2') return phaseProgress;
      if (phase === 'inhale') return 0;
      return 0;
    }

    return 0;
  };

  return (
    <div
      className={`flex-1 flex flex-col justify-between min-h-[calc(100vh-4rem)] pb-28 pt-4 px-6 select-none transition-colors duration-300 ${
        isDarkMode ? 'bg-[#121212] text-white' : 'bg-white text-[#0A0A0A]'
      }`}
    >
      {/* Top Bar: Minimalist Switcher & Utilities */}
      <div className="max-w-md mx-auto w-full flex flex-col items-center gap-2">
        <div className="w-full flex items-center justify-between">
          <div className="w-8" /> {/* Spacer */}

          {/* Clean Technique Switcher */}
          <div className="flex items-center gap-1">
            {TECHNIQUES.map((tech) => (
              <button
                key={tech.id}
                type="button"
                onClick={() => {
                  if (isActive) setIsActive(false);
                  setCurrentTechnique(tech);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  currentTechnique.id === tech.id
                    ? isDarkMode
                      ? 'bg-white text-black'
                      : 'bg-[#0A0A0A] text-white'
                    : isDarkMode
                    ? 'text-neutral-400 hover:text-white'
                    : 'text-[#737373] hover:text-[#0A0A0A]'
                }`}
              >
                {tech.name}
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            title={isSoundEnabled ? 'Som ativado' : 'Silencioso'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-[#1A1A1A] border-[#262626] text-neutral-400 hover:text-white'
                : 'bg-[#F7F7F7] border-[#E5E5E5] text-[#737373] hover:text-black'
            }`}
          >
            {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Short & Basic 1-line explanation */}
        <p className="text-[11px] text-[#737373] dark:text-neutral-400 font-medium tracking-tight text-center">
          {currentTechnique.shortDesc}
        </p>
      </div>

      {/* Main Box Area */}
      <div className="flex flex-col items-center justify-center my-auto w-full max-w-sm mx-auto">
        {/* Phase Text */}
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-8">
          {isActive ? getPhaseTitle(phase) : 'Box Breathe'}
        </h2>

        {/* The Box Geometry (4 clean bars) */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* TOP BAR */}
          <div
            className={`absolute top-0 left-0 right-0 h-4 rounded-full overflow-hidden border ${
              isDarkMode ? 'border-[#333333] bg-[#1A1A1A]' : 'border-[#0A0A0A] bg-transparent'
            }`}
          >
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                isDarkMode ? 'bg-white' : 'bg-[#0A0A0A]'
              }`}
              style={{ width: `${getBarFill('top') * 100}%` }}
            />
          </div>

          {/* RIGHT BAR */}
          <div
            className={`absolute top-0 right-0 bottom-0 w-4 rounded-full overflow-hidden border ${
              isDarkMode ? 'border-[#333333] bg-[#1A1A1A]' : 'border-[#0A0A0A] bg-transparent'
            }`}
          >
            <div
              className={`w-full rounded-full transition-all duration-75 ${
                isDarkMode ? 'bg-white' : 'bg-[#0A0A0A]'
              }`}
              style={{ height: `${getBarFill('right') * 100}%` }}
            />
          </div>

          {/* BOTTOM BAR */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-4 rounded-full overflow-hidden border flex justify-end ${
              isDarkMode ? 'border-[#333333] bg-[#1A1A1A]' : 'border-[#0A0A0A] bg-transparent'
            }`}
          >
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                isDarkMode ? 'bg-white' : 'bg-[#0A0A0A]'
              }`}
              style={{ width: `${getBarFill('bottom') * 100}%` }}
            />
          </div>

          {/* LEFT BAR */}
          <div
            className={`absolute top-0 left-0 bottom-0 w-4 rounded-full overflow-hidden border flex flex-col justify-end ${
              isDarkMode ? 'border-[#333333] bg-[#1A1A1A]' : 'border-[#0A0A0A] bg-transparent'
            }`}
          >
            <div
              className={`w-full rounded-full transition-all duration-75 ${
                isDarkMode ? 'bg-white' : 'bg-[#0A0A0A]'
              }`}
              style={{ height: `${getBarFill('left') * 100}%` }}
            />
          </div>

          {/* Big Countdown Number */}
          <span className="text-[7.5rem] sm:text-[9rem] font-black leading-none select-none tracking-tighter">
            {countdown}
          </span>
        </div>

        {/* Start / Stop Button */}
        <div className="mt-10 flex flex-col items-center">
          <button
            type="button"
            onClick={handleStartStop}
            className={`text-lg font-medium tracking-tight cursor-pointer hover:opacity-75 transition-opacity ${
              isDarkMode ? 'text-white' : 'text-[#0A0A0A]'
            }`}
          >
            {isActive ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>

      {/* Empty subtle breathing room at bottom */}
      <div className="h-4" />
    </div>
  );
};
