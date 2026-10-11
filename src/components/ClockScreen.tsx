import React, { useState, useEffect } from 'react';
import { Smartphone, Maximize2, Minimize2 } from 'lucide-react';

export const ClockScreen: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLandscape, setIsLandscape] = useState(false);
  const [forceLandscape, setForceLandscape] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [use24Hour, setUse24Hour] = useState(false);

  const activeLandscape = isLandscape || forceLandscape;

  // Detect orientation change
  useEffect(() => {
    const checkOrientation = () => {
      const isLand =
        window.matchMedia('(orientation: landscape)').matches &&
        window.innerWidth > window.innerHeight;
      setIsLandscape(isLand);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Update real-time clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Compute digits with fixed-width 2-digit padding for flip-clock aesthetic
  let hours = currentTime.getHours();
  let ampm = '';
  if (!use24Hour) {
    ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
  }
  const displayHour = String(hours).padStart(2, '0');
  const displayMinute = String(currentTime.getMinutes()).padStart(2, '0');
  const displaySecond = String(currentTime.getSeconds()).padStart(2, '0');
  const currentDateFormatted = currentTime.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div
      className={`flex-1 flex flex-col justify-between transition-all select-none ${
        activeLandscape
          ? 'fixed inset-0 z-50 bg-[#0A0A0A] text-white overflow-hidden p-6'
          : 'bg-[#0A0A0A] text-white min-h-[calc(100vh-4rem)] pb-28 pt-4 px-4 sm:px-6'
      }`}
    >
      {/* Top Floating Controls */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between mb-2 z-20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setUse24Hour(!use24Hour)}
            className="px-3.5 py-1.5 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] rounded-xl text-xs font-semibold text-[#A3A3A3] hover:text-white transition-colors cursor-pointer shadow-sm"
          >
            {use24Hour ? 'Formato 24h' : 'Formato 12h'}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setForceLandscape(!forceLandscape)}
            title="Girar para modo mesa de lado"
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-sm ${
              forceLandscape
                ? 'bg-white text-[#0A0A0A] border-white shadow-md'
                : 'bg-[#141414] text-[#A3A3A3] hover:text-white border-[#262626]'
            }`}
          >
            <Smartphone className="w-4 h-4 rotate-90" />
            <span className="hidden sm:inline">Modo Mesa</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title="Tela cheia"
            className="p-2 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] rounded-xl text-[#A3A3A3] hover:text-white transition-colors cursor-pointer shadow-sm"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CENTERED FLIP CLOCK CONTAINER */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto w-full">
        {/* Date Subtitle */}
        <div className="text-neutral-400 text-xs sm:text-sm font-medium tracking-widest uppercase mb-6 text-center">
          {currentDateFormatted}
        </div>

        <div
          className={`flex items-center justify-center gap-4 sm:gap-6 w-full max-w-4xl transition-all ${
            activeLandscape ? 'flex-row' : 'flex-col sm:flex-row'
          }`}
        >
          {/* HOUR PANEL */}
          <div
            className={`relative bg-[#111111] border border-[#222222] rounded-[28px] sm:rounded-[36px] flex items-center justify-center shadow-2xl overflow-hidden ${
              activeLandscape
                ? 'w-[42vw] max-w-[320px] h-[58vh] max-h-[280px]'
                : 'w-[82vw] max-w-[300px] h-[30vh] max-h-[200px]'
            }`}
          >
            {/* AM / PM Badge */}
            {ampm && (
              <span className="absolute top-4 left-5 text-xs sm:text-sm font-bold tracking-widest text-neutral-400 font-mono">
                {ampm}
              </span>
            )}

            {/* Seconds indicator in corner */}
            <span className="absolute top-4 right-5 text-[11px] sm:text-xs font-mono text-neutral-600 tracking-wider">
              {displaySecond}s
            </span>

            {/* Hour Digit with tabular fixed-width font */}
            <span className="font-mono font-bold text-white text-[6.5rem] sm:text-[9rem] leading-none select-none tracking-tighter tabular-nums">
              {displayHour}
            </span>

            {/* Center Flap Crease / Split Seam */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-[#050505] shadow-inner z-10" />
            {/* Subtle top half reflection gradient */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
          </div>

          {/* MINUTE PANEL */}
          <div
            className={`relative bg-[#111111] border border-[#222222] rounded-[28px] sm:rounded-[36px] flex items-center justify-center shadow-2xl overflow-hidden ${
              activeLandscape
                ? 'w-[42vw] max-w-[320px] h-[58vh] max-h-[280px]'
                : 'w-[82vw] max-w-[300px] h-[30vh] max-h-[200px]'
            }`}
          >
            {/* Minute Digit with tabular fixed-width font */}
            <span className="font-mono font-bold text-white text-[6.5rem] sm:text-[9rem] leading-none select-none tracking-tighter tabular-nums">
              {displayMinute}
            </span>

            {/* Center Flap Crease / Split Seam */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-[#050505] shadow-inner z-10" />
            {/* Subtle top half reflection gradient */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-[11px] text-neutral-500 tracking-wider uppercase font-medium">
            {activeLandscape
              ? 'Modo Mesa Paisagem Ativo'
              : 'Relógio de Mesa • Perfeito para suporte ou carregando'}
          </p>
        </div>
      </div>
    </div>
  );
};
