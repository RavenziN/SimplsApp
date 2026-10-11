import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  CloudRain,
  Music,
  VolumeX,
  Volume2,
  Palette,
  Plus,
  Minus,
  X,
  SkipBack,
  SkipForward,
  Link2,
  ListMusic,
  ExternalLink,
  Zap,
  Radio,
} from 'lucide-react';
import { ambientSound, AmbientSoundType } from '../utils/ambientSound';
import { lofiPlayer, LofiPlayerState } from '../services/lofiPlayer';
import { LofiSongsModal } from './LofiSongsModal';

// Animated audio equalizer wave indicator
const EqualizerWave: React.FC<{ isPlaying: boolean; color?: string }> = ({
  isPlaying,
  color = 'bg-purple-400',
}) => {
  return (
    <div className="flex items-end gap-0.5 h-3 px-0.5" title={isPlaying ? 'Reproduzindo' : 'Pausado'}>
      <span
        className={`w-0.5 rounded-full ${color} transition-all duration-300 ${
          isPlaying ? 'animate-[pulse_0.6s_ease-in-out_infinite] h-3' : 'h-1 opacity-40'
        }`}
      />
      <span
        className={`w-0.5 rounded-full ${color} transition-all duration-300 ${
          isPlaying ? 'animate-[pulse_0.9s_ease-in-out_infinite_0.15s] h-2.5' : 'h-1.5 opacity-40'
        }`}
      />
      <span
        className={`w-0.5 rounded-full ${color} transition-all duration-300 ${
          isPlaying ? 'animate-[pulse_0.7s_ease-in-out_infinite_0.3s] h-3' : 'h-2 opacity-40'
        }`}
      />
      <span
        className={`w-0.5 rounded-full ${color} transition-all duration-300 ${
          isPlaying ? 'animate-[pulse_0.8s_ease-in-out_infinite_0.1s] h-2' : 'h-1 opacity-40'
        }`}
      />
    </div>
  );
};

// Clean up track title and artist cleanly without wiping emojis or titles
const formatTrackDisplay = (track?: { title?: string; artist?: string }) => {
  if (!track || !track.title) {
    return { title: 'Lo-Fi Chill Radio', artist: 'Lo-Fi FM' };
  }
  let cleanTitle = track.title
    .replace(/\[\s*beats to relax\/study to\s*\]/gi, '')
    .replace(/\(\s*beats to (relax|study)(\/relax|\/study)? to\s*\)/gi, '')
    .replace(/-\s*beats to (study|relax).*$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanTitle.endsWith('-')) {
    cleanTitle = cleanTitle.slice(0, -1).trim();
  }

  return {
    title: cleanTitle || track.title,
    artist: track.artist || 'Lo-Fi FM Curadoria',
  };
};

// Color themes for Focus Mode
export type FocusColorTheme = 'black' | 'forest' | 'amber' | 'midnight' | 'paper';

interface ThemeStyles {
  id: FocusColorTheme;
  name: string;
  dotColor: string;
  bg: string;
  text: string;
  subtext: string;
  track: string;
  progress: string;
  buttonBg: string;
  buttonText: string;
  pillBg: string;
  pillBorder: string;
}

const THEMES: Record<FocusColorTheme, ThemeStyles> = {
  black: {
    id: 'black',
    name: 'Preto Puro',
    dotColor: '#0A0A0A',
    bg: 'bg-[#0A0A0A]',
    text: 'text-white',
    subtext: 'text-neutral-400',
    track: '#1C1C1C',
    progress: '#FFFFFF',
    buttonBg: 'bg-white text-[#0A0A0A] hover:bg-neutral-200',
    buttonText: 'text-[#0A0A0A]',
    pillBg: 'bg-[#171717] hover:bg-[#222222]',
    pillBorder: 'border-[#262626]',
  },
  forest: {
    id: 'forest',
    name: 'Verde Floresta',
    dotColor: '#16281D',
    bg: 'bg-[#0E1711]',
    text: 'text-[#DDEEE2]',
    subtext: 'text-[#8DA994]',
    track: '#1B2C20',
    progress: '#C6E4CD',
    buttonBg: 'bg-[#C6E4CD] text-[#0E1711] hover:bg-[#B3DAB9]',
    buttonText: 'text-[#0E1711]',
    pillBg: 'bg-[#18281D] hover:bg-[#203326]',
    pillBorder: 'border-[#284030]',
  },
  amber: {
    id: 'amber',
    name: 'Âmbar Quente',
    dotColor: '#2B1C13',
    bg: 'bg-[#140E0A]',
    text: 'text-[#F9DEC6]',
    subtext: 'text-[#A98971]',
    track: '#261912',
    progress: '#F7CEAB',
    buttonBg: 'bg-[#F7CEAB] text-[#140E0A] hover:bg-[#F2BD8F]',
    buttonText: 'text-[#140E0A]',
    pillBg: 'bg-[#221610] hover:bg-[#2D1E16]',
    pillBorder: 'border-[#3D291F]',
  },
  midnight: {
    id: 'midnight',
    name: 'Azul Noite',
    dotColor: '#111B29',
    bg: 'bg-[#0A101A]',
    text: 'text-[#DCE7F7]',
    subtext: 'text-[#7D94B8]',
    track: '#162338',
    progress: '#C5D9F7',
    buttonBg: 'bg-[#C5D9F7] text-[#0A101A] hover:bg-[#ACCAFA]',
    buttonText: 'text-[#0A101A]',
    pillBg: 'bg-[#141F30] hover:bg-[#1B2940]',
    pillBorder: 'border-[#223552]',
  },
  paper: {
    id: 'paper',
    name: 'Papel Claro',
    dotColor: '#F7F7F7',
    bg: 'bg-[#F7F7F7]',
    text: 'text-[#0A0A0A]',
    subtext: 'text-[#737373]',
    track: '#E5E5E5',
    progress: '#0A0A0A',
    buttonBg: 'bg-[#0A0A0A] text-white hover:bg-[#262626]',
    buttonText: 'text-white',
    pillBg: 'bg-white hover:bg-[#EEEEEE]',
    pillBorder: 'border-[#E0E0E0]',
  },
};

export const FocusScreen: React.FC = () => {
  const [presetMinutes, setPresetMinutes] = useState(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTag, setActiveTag] = useState('Foco');
  const [soundMode, setSoundMode] = useState<AmbientSoundType>('off');
  const [isSoundMenuOpen, setIsSoundMenuOpen] = useState(false);
  const [colorTheme, setColorTheme] = useState<FocusColorTheme>('black');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isLofiModalOpen, setIsLofiModalOpen] = useState(false);
  const [isQuickLinkModalOpen, setIsQuickLinkModalOpen] = useState(false);
  const [quickLinkInput, setQuickLinkInput] = useState('');
  const [quickLinkError, setQuickLinkError] = useState('');
  const [customInputValue, setCustomInputValue] = useState('30');
  const [lofiState, setLofiState] = useState<LofiPlayerState>(() => lofiPlayer.getState());
  const [wakeLockOption, setWakeLockOption] = useState<boolean>(() => {
    const saved = localStorage.getItem('lofi_wake_lock');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isCharging, setIsCharging] = useState<boolean | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);

  // Monitor charging status via Battery Status API
  useEffect(() => {
    let batteryObj: any = null;
    let isMounted = true;

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        if (!isMounted) return;
        batteryObj = battery;
        setIsCharging(battery.charging);

        const handleChargingChange = () => {
          if (isMounted) setIsCharging(battery.charging);
        };
        battery.addEventListener('chargingchange', handleChargingChange);
        return () => {
          battery.removeEventListener('chargingchange', handleChargingChange);
        };
      }).catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Screen Wake Lock API management when charging
  useEffect(() => {
    let wakeLockSentinel: any = null;
    let isMounted = true;

    const requestLock = async () => {
      if (!wakeLockOption) return;
      if (isCharging === false) {
        if (wakeLockSentinel) {
          try {
            await wakeLockSentinel.release();
          } catch {}
          wakeLockSentinel = null;
        }
        if (isMounted) setWakeLockActive(false);
        return;
      }

      if ('wakeLock' in navigator && document.visibilityState === 'visible') {
        try {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
          if (isMounted) setWakeLockActive(true);
          wakeLockSentinel.addEventListener('release', () => {
            if (isMounted) setWakeLockActive(false);
          });
        } catch {
          if (isMounted) setWakeLockActive(false);
        }
      }
    };

    if (wakeLockOption && isCharging !== false) {
      requestLock();
    } else {
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
        wakeLockSentinel = null;
      }
      setWakeLockActive(false);
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && wakeLockOption && isCharging !== false) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, [wakeLockOption, isCharging]);

  const currentTheme = THEMES[colorTheme];
  const TAGS = ['Foco', 'Leitura', 'Trabalho', 'Estudos'];
  const COMMON_PRESETS = [15, 25, 45, 60];

  // Subscribe to LoFi FM player state changes
  useEffect(() => {
    const unsubscribe = lofiPlayer.subscribe((state) => {
      setLofiState(state);
      if (state.isPlaying) {
        setSoundMode((prev) => (prev !== 'lofi' ? 'lofi' : prev));
      }
    });
    return unsubscribe;
  }, []);

  // Manage rain sound state based on timer execution
  useEffect(() => {
    if (soundMode === 'rain') {
      if (isRunning) {
        ambientSound.play('rain');
      } else {
        ambientSound.stop();
      }
    } else if (soundMode === 'off') {
      ambientSound.stop();
    }
  }, [isRunning, soundMode]);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeftSeconds]);

  const handleTogglePlay = () => {
    if (timeLeftSeconds === 0) {
      setTimeLeftSeconds(presetMinutes * 60);
    }
    const nextState = !isRunning;
    setIsRunning(nextState);

    // If starting timer with sound, ensure playback
    if (nextState) {
      if (soundMode === 'lofi') {
        lofiPlayer.play();
      } else if (soundMode === 'rain') {
        ambientSound.play('rain');
      }
    } else {
      if (soundMode === 'rain') {
        ambientSound.stop();
      }
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeftSeconds(presetMinutes * 60);
    if (soundMode === 'rain') {
      ambientSound.stop();
    }
  };

  const handleSelectMinutes = (mins: number) => {
    const valid = Math.max(1, Math.min(180, mins));
    setPresetMinutes(valid);
    setTimeLeftSeconds(valid * 60);
    setIsRunning(false);
  };

  const handleAdjustDelta = (deltaMinutes: number) => {
    if (isRunning) return;
    const newMins = Math.max(1, Math.min(180, presetMinutes + deltaMinutes));
    handleSelectMinutes(newMins);
  };

  const handleSelectSoundMode = (mode: AmbientSoundType) => {
    setSoundMode(mode);
    setIsSoundMenuOpen(false);
    if (mode === 'lofi') {
      ambientSound.stop();
      lofiPlayer.play();
    } else if (mode === 'rain') {
      lofiPlayer.pause();
      if (isRunning) {
        ambientSound.play('rain');
      }
    } else {
      ambientSound.stop();
      lofiPlayer.pause();
    }
  };

  const handleCycleSound = () => {
    if (soundMode === 'off') {
      handleSelectSoundMode('rain');
    } else if (soundMode === 'rain') {
      handleSelectSoundMode('lofi');
    } else {
      handleSelectSoundMode('off');
    }
  };

  const handleSaveCustomTime = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInputValue, 10);
    if (!isNaN(val) && val >= 1 && val <= 180) {
      handleSelectMinutes(val);
      setIsCustomModalOpen(false);
    }
  };

  const handleCycleTag = () => {
    const nextIdx = (TAGS.indexOf(activeTag) + 1) % TAGS.length;
    setActiveTag(TAGS[nextIdx]);
  };

  const handlePlayQuickLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLinkInput.trim()) return;
    const ok = lofiPlayer.playExternalUrl(quickLinkInput);
    if (ok) {
      setQuickLinkInput('');
      setQuickLinkError('');
      setIsQuickLinkModalOpen(false);
      handleSelectSoundMode('lofi');
    } else {
      setQuickLinkError('Link ou ID inválido. Insira um link válido do YouTube (ex: https://youtu.be/...)');
    }
  };

  const formatTrackTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
    if (seconds > 86400 * 7) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Ring geometry
  const radius = 105;
  const circumference = 2 * Math.PI * radius;
  const totalSeconds = presetMinutes * 60;
  const progress = (totalSeconds - timeLeftSeconds) / totalSeconds;
  const strokeDashoffset = circumference - progress * circumference;

  const minutesFormatted = String(Math.floor(timeLeftSeconds / 60)).padStart(2, '0');
  const secondsFormatted = String(timeLeftSeconds % 60).padStart(2, '0');

  // Formatted track details
  const trackInfo = formatTrackDisplay(lofiState.currentTrack);
  const isLofiActive = soundMode === 'lofi' || lofiState.isPlaying;

  return (
    <div
      className={`flex-1 min-h-full w-full flex flex-col items-center ${
        isLofiActive ? 'justify-start gap-y-2 py-2 pb-14 sm:pb-8' : 'justify-between py-3 sm:py-4 pb-8'
      } px-3 sm:px-6 select-none transition-colors duration-500 overflow-y-auto no-scrollbar ${currentTheme.bg} ${currentTheme.text}`}
    >
      {/* Top Header: Duration Presets & Theme / Sound Switchers */}
      <div className="w-full max-w-md flex items-center justify-between text-xs font-medium shrink-0 mb-1">
        {/* Left: Color Theme Switcher & Wake Lock Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              title="Alterar modo de cor"
              className={`p-1.5 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${currentTheme.pillBg} ${currentTheme.pillBorder} ${currentTheme.text}`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">{currentTheme.name}</span>
            </button>

            {/* Theme Dropdown Menu */}
            {isThemeMenuOpen && (
              <div
                className={`absolute left-0 top-9 z-50 w-36 rounded-2xl border shadow-xl p-1.5 text-xs backdrop-blur-md ${
                  colorTheme === 'paper' ? 'bg-white border-[#E0E0E0]' : 'bg-[#141414] border-[#2A2A2A]'
                }`}
              >
                {(Object.keys(THEMES) as FocusColorTheme[]).map((themeKey) => {
                  const t = THEMES[themeKey];
                  return (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => {
                        setColorTheme(themeKey);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-left transition-colors cursor-pointer ${
                        colorTheme === themeKey
                          ? colorTheme === 'paper'
                            ? 'bg-neutral-100 font-bold text-black'
                            : 'bg-neutral-800 font-bold text-white'
                          : colorTheme === 'paper'
                          ? 'hover:bg-neutral-50 text-neutral-600'
                          : 'hover:bg-neutral-900 text-neutral-400'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/20"
                        style={{ backgroundColor: t.dotColor }}
                      />
                      <span>{t.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Wake Lock Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !wakeLockOption;
              setWakeLockOption(next);
              localStorage.setItem('lofi_wake_lock', JSON.stringify(next));
            }}
            title={wakeLockOption ? 'Wake Lock ativado (tela sempre ligada ao carregar)' : 'Wake Lock desativado'}
            className={`p-1.5 rounded-xl border flex items-center gap-1 transition-colors cursor-pointer ${
              wakeLockOption
                ? colorTheme === 'paper' ? 'bg-neutral-200 border-neutral-300 text-black' : 'bg-neutral-800 border-neutral-700 text-white'
                : `${currentTheme.pillBg} ${currentTheme.pillBorder} ${currentTheme.subtext}`
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${wakeLockActive ? 'text-amber-400 fill-amber-400 animate-pulse' : ''}`} />
            <span className="hidden md:inline text-[10px]">
              {wakeLockOption ? (isCharging === false ? 'Aguardando Carga' : 'Tela Ligada') : 'Tela Normal'}
            </span>
          </button>
        </div>

        {/* Center: Presets */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {COMMON_PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleSelectMinutes(m)}
              className={`transition-colors cursor-pointer py-1 ${
                presetMinutes === m
                  ? `${currentTheme.text} font-bold border-b-2 border-current`
                  : `${currentTheme.subtext} hover:opacity-100`
              }`}
            >
              {m}m
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setCustomInputValue(String(presetMinutes));
              setIsCustomModalOpen(true);
            }}
            className={`transition-colors cursor-pointer py-1 ${
              !COMMON_PRESETS.includes(presetMinutes)
                ? `${currentTheme.text} font-bold border-b-2 border-current`
                : `${currentTheme.subtext} hover:opacity-100`
            }`}
          >
            {!COMMON_PRESETS.includes(presetMinutes) ? `${presetMinutes}m` : '+'}
          </button>
        </div>

        {/* Right: Ambient Sound Selector (Chuva / Lo-Fi FM / Off) with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSoundMenuOpen(!isSoundMenuOpen)}
            title={`Som ambiente: ${
              soundMode === 'rain' ? 'Chuva' : soundMode === 'lofi' ? 'Lo-Fi FM' : 'Desligado'
            }`}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
              soundMode === 'lofi'
                ? colorTheme === 'paper'
                  ? 'bg-purple-100 border-purple-300 text-purple-900 font-bold shadow-sm'
                  : 'bg-purple-950/60 border-purple-500/40 text-purple-300 font-bold shadow-sm'
                : `${currentTheme.pillBg} ${currentTheme.pillBorder} ${currentTheme.text}`
            }`}
          >
            {soundMode === 'rain' && (
              <>
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] font-semibold">Chuva</span>
              </>
            )}
            {soundMode === 'lofi' && (
              <>
                <Music className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-purple-400">Lo-Fi FM</span>
              </>
            )}
            {soundMode === 'off' && (
              <>
                <VolumeX className="w-3.5 h-3.5 opacity-60" />
                <span className="text-[11px] opacity-60">Mudo</span>
              </>
            )}
          </button>

          {/* Sound Menu Dropdown */}
          {isSoundMenuOpen && (
            <div
              className={`absolute right-0 top-9 z-50 w-36 rounded-2xl border shadow-xl p-1.5 text-xs backdrop-blur-md ${
                colorTheme === 'paper' ? 'bg-white border-[#E0E0E0]' : 'bg-[#141414] border-[#2A2A2A]'
              }`}
            >
              <button
                type="button"
                onClick={() => handleSelectSoundMode('off')}
                className={`w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-left transition-colors cursor-pointer ${
                  soundMode === 'off'
                    ? colorTheme === 'paper' ? 'bg-neutral-100 font-bold' : 'bg-neutral-800 font-bold'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Mudo</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSoundMode('rain')}
                className={`w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-left transition-colors cursor-pointer ${
                  soundMode === 'rain'
                    ? colorTheme === 'paper' ? 'bg-neutral-100 font-bold text-blue-600' : 'bg-neutral-800 font-bold text-blue-400'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                <span>Chuva</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSoundMode('lofi')}
                className={`w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-left transition-colors cursor-pointer ${
                  soundMode === 'lofi'
                    ? colorTheme === 'paper' ? 'bg-purple-50 font-bold text-purple-600' : 'bg-purple-950/60 font-bold text-purple-400'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Music className="w-3.5 h-3.5 text-purple-400" />
                <span>Lo-Fi FM</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Minimalist Circular Dial (Dimensionado dinamicamente para acomodar o Lo-Fi player sem scroll ou clipping) */}
      <div className={`flex flex-col items-center justify-center shrink-0 ${isLofiActive ? 'my-0.5' : 'my-auto'}`}>
        <div
          className={`relative ${
            isLofiActive ? 'w-40 h-40 sm:w-48 sm:h-48' : 'w-68 h-68 sm:w-80 sm:h-80'
          } flex items-center justify-center transition-all duration-300`}
        >
          {/* Circular SVG Dial */}
          <svg className="w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 260 260">
            {/* Background thin track */}
            <circle
              cx="130"
              cy="130"
              r={radius}
              fill="none"
              stroke={currentTheme.track}
              strokeWidth="2.5"
            />
            {/* Animated progress stroke */}
            <circle
              cx="130"
              cy="130"
              r={radius}
              fill="none"
              stroke={currentTheme.progress}
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
            {/* Subtle radial ticks */}
            {Array.from({ length: 48 }).map((_, i) => {
              const angle = (i * 360) / 48;
              return (
                <line
                  key={i}
                  x1="130"
                  y1="10"
                  x2="130"
                  y2="16"
                  stroke={currentTheme.track}
                  strokeWidth="1.2"
                  transform={`rotate(${angle} 130 130)`}
                />
              );
            })}
          </svg>

          {/* Center Play/Pause & Time */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            {/* Circular Play Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isRunning ? 'Pausar' : 'Iniciar'}
              className={`${
                isLofiActive ? 'w-12 h-12 mb-1' : 'w-20 h-20 mb-3'
              } rounded-full transition-all flex items-center justify-center shadow-xl cursor-pointer active:scale-95 ${
                currentTheme.buttonBg
              }`}
            >
              {isRunning ? (
                <Pause className={`${isLofiActive ? 'w-4 h-4' : 'w-7 h-7'} fill-current`} />
              ) : (
                <Play className={`${isLofiActive ? 'w-4 h-4' : 'w-7 h-7'} fill-current ml-0.5`} />
              )}
            </button>

            {/* Clickable Time display */}
            <button
              type="button"
              onClick={() => {
                if (!isRunning) {
                  setCustomInputValue(String(presetMinutes));
                  setIsCustomModalOpen(true);
                }
              }}
              title={isRunning ? undefined : 'Clique para editar o tempo'}
              className={`${
                isLofiActive ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'
              } font-light font-mono tabular-nums tracking-widest cursor-pointer ${
                !isRunning ? 'hover:opacity-80' : ''
              }`}
            >
              <span>
                {minutesFormatted}:{secondsFormatted}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Stepper Controls (-5m / +5m) when idle */}
        {!isRunning && (
          <div className={`flex items-center gap-2.5 ${isLofiActive ? 'mt-1' : 'mt-3'}`}>
            <button
              type="button"
              onClick={() => handleAdjustDelta(-5)}
              title="Diminuir 5 minutos"
              className={`${
                isLofiActive ? 'w-6 h-6' : 'w-8 h-8'
              } rounded-full border flex items-center justify-center transition-colors cursor-pointer text-xs ${
                currentTheme.pillBg
              } ${currentTheme.pillBorder}`}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className={`text-[11px] font-medium ${currentTheme.subtext}`}>
              {presetMinutes} min
            </span>
            <button
              type="button"
              onClick={() => handleAdjustDelta(5)}
              title="Aumentar 5 minutos"
              className={`${
                isLofiActive ? 'w-6 h-6' : 'w-8 h-8'
              } rounded-full border flex items-center justify-center transition-colors cursor-pointer text-xs ${
                currentTheme.pillBg
              } ${currentTheme.pillBorder}`}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Minimalist Activity Tag Button */}
        <button
          type="button"
          onClick={handleCycleTag}
          title="Clique para alternar atividade"
          className={`${
            isLofiActive ? 'mt-1 px-2.5 py-0.5 text-[10px]' : 'mt-4 px-4 py-1.5 text-xs'
          } rounded-full border font-medium transition-colors cursor-pointer ${
            currentTheme.pillBg
          } ${currentTheme.pillBorder}`}
        >
          {activeTag}
        </button>
      </div>

      {/* LoFi FM Music Player Completo & Responsivo */}
      {isLofiActive && (
        <div
          className={`w-full max-w-sm sm:max-w-md mx-auto my-1 px-3.5 py-3 rounded-2xl sm:rounded-3xl shadow-xl backdrop-blur-xl border transition-all select-none shrink-0 ${
            colorTheme === 'paper'
              ? 'bg-white/95 border-neutral-200 text-neutral-900 shadow-neutral-300/40'
              : 'bg-[#141414]/95 border-neutral-800 text-white shadow-black/60'
          }`}
        >
          {/* Linha 1: Capa/Thumbnail + Título + Artista + Ações Rápidas */}
          <div className="flex items-center justify-between gap-2.5 mb-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Artwork / Thumbnail com Equalizador dinâmico */}
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-neutral-800 border border-black/10 dark:border-white/10 shadow-sm flex items-center justify-center">
                {lofiState.currentTrack?.thumbnailUrl ? (
                  <img
                    src={lofiState.currentTrack.thumbnailUrl}
                    alt={trackInfo.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Radio className="w-5 h-5 text-purple-400" />
                )}
                {/* Overlay de Equalizador animado quando tocando */}
                {lofiState.isPlaying && (
                  <div className="absolute inset-x-0 bottom-0 py-0.5 bg-black/65 backdrop-blur-xs flex items-center justify-center">
                    <EqualizerWave isPlaying={lofiState.isPlaying} />
                  </div>
                )}
              </div>

              {/* Informações da Faixa / Estação */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold truncate leading-tight tracking-tight">
                    {trackInfo.title}
                  </span>
                  {lofiState.currentTrack?.isCustom ? (
                    <span className="shrink-0 px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-purple-500/20 text-purple-400">
                      YouTube
                    </span>
                  ) : (
                    <span className="shrink-0 px-1.5 py-0.2 rounded-md text-[9px] font-semibold bg-purple-500/15 text-purple-400 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full bg-purple-400 ${lofiState.isPlaying ? 'animate-pulse' : ''}`} />
                      FM
                    </span>
                  )}
                </div>
                <p className={`text-[11px] truncate mt-0.5 font-medium ${
                  colorTheme === 'paper' ? 'text-neutral-500' : 'text-neutral-400'
                }`}>
                  {trackInfo.artist}
                </p>
              </div>
            </div>

            {/* Ações Rápidas: Link YouTube + Lista de Rádios + Fechar Lo-Fi */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsQuickLinkModalOpen(true)}
                title="Tocar link personalizado (YouTube)"
                className={`p-1.5 rounded-xl transition-colors cursor-pointer active:scale-95 ${
                  colorTheme === 'paper'
                    ? 'hover:bg-neutral-200/70 text-neutral-600'
                    : 'hover:bg-neutral-800 text-neutral-300'
                }`}
              >
                <Link2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsLofiModalOpen(true)}
                title="Abrir catálogo com 14 rádios Lo-Fi"
                className={`p-1.5 rounded-xl transition-colors cursor-pointer active:scale-95 ${
                  colorTheme === 'paper'
                    ? 'hover:bg-neutral-200/70 text-neutral-600'
                    : 'hover:bg-neutral-800 text-neutral-300'
                }`}
              >
                <ListMusic className="w-4 h-4 text-purple-400" />
              </button>
              <button
                type="button"
                onClick={() => handleSelectSoundMode('off')}
                title="Desligar som Lo-Fi"
                className={`p-1.5 rounded-xl transition-colors cursor-pointer active:scale-95 opacity-60 hover:opacity-100 ${
                  colorTheme === 'paper' ? 'hover:bg-neutral-200/70' : 'hover:bg-neutral-800'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Linha 2: Tempo & Barra de Progresso / Scrubber */}
          <div className="px-0.5 py-1">
            <div className="flex items-center justify-between text-[11px] font-mono mb-1 font-semibold tabular-nums">
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${lofiState.isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
                <span>{formatTrackTime(lofiState.currentTime)}</span>
              </span>
              <span className={colorTheme === 'paper' ? 'text-neutral-500' : 'text-neutral-400'}>
                {lofiState.duration > 0 ? (
                  formatTrackTime(lofiState.duration)
                ) : (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    AO VIVO
                  </span>
                )}
              </span>
            </div>

            {/* Scrubber slider */}
            <input
              type="range"
              min="0"
              max={lofiState.duration > 0 ? lofiState.duration : 100}
              step="1"
              value={lofiState.duration > 0 ? lofiState.currentTime : 0}
              onChange={(e) => lofiPlayer.seekTo(parseFloat(e.target.value))}
              disabled={lofiState.duration <= 0 && !lofiState.currentTrack?.isCustom}
              title={
                lofiState.duration > 0 || lofiState.currentTrack?.isCustom
                  ? 'Arrastar para adiantar ou voltar a música'
                  : 'Transmissão de rádio contínua ao vivo'
              }
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-purple-500 ${
                colorTheme === 'paper' ? 'bg-neutral-200' : 'bg-neutral-800'
              } ${lofiState.duration <= 0 && !lofiState.currentTrack?.isCustom ? 'opacity-40 cursor-default' : ''}`}
            />
          </div>

          {/* Linha 3: Controles de Reprodução Completos (Anterior, -10s, Play/Pause, +10s, Próxima) */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 py-1.5">
            {/* Rádio / Faixa Anterior */}
            <button
              type="button"
              onClick={() => lofiPlayer.prevTrack()}
              title="Estação anterior"
              className={`p-2 rounded-full transition-all cursor-pointer active:scale-90 ${
                colorTheme === 'paper'
                  ? 'hover:bg-neutral-200/70 text-neutral-700'
                  : 'hover:bg-neutral-800 text-neutral-300'
              }`}
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Pular -10s */}
            <button
              type="button"
              onClick={() => lofiPlayer.seekBy(-10)}
              title="Retroceder 10 segundos (-10s)"
              className={`px-2.5 py-1 rounded-full flex items-center gap-0.5 transition-all cursor-pointer active:scale-90 ${
                colorTheme === 'paper'
                  ? 'hover:bg-neutral-200/70 text-neutral-700'
                  : 'hover:bg-neutral-800 text-neutral-300'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold font-mono">10</span>
            </button>

            {/* Play / Pause Principal */}
            <button
              type="button"
              onClick={() => lofiPlayer.togglePlay()}
              title={lofiState.isPlaying ? 'Pausar música' : 'Tocar música'}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-transform cursor-pointer shadow-md active:scale-95 ${
                colorTheme === 'paper'
                  ? 'bg-neutral-900 text-white hover:bg-black'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              {lofiState.isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Pular +10s */}
            <button
              type="button"
              onClick={() => lofiPlayer.seekBy(10)}
              title="Avançar 10 segundos (+10s)"
              className={`px-2.5 py-1 rounded-full flex items-center gap-0.5 transition-all cursor-pointer active:scale-90 ${
                colorTheme === 'paper'
                  ? 'hover:bg-neutral-200/70 text-neutral-700'
                  : 'hover:bg-neutral-800 text-neutral-300'
              }`}
            >
              <span className="text-[10px] font-bold font-mono">10</span>
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Próxima Rádio / Faixa */}
            <button
              type="button"
              onClick={() => lofiPlayer.nextTrack()}
              title="Próxima estação"
              className={`p-2 rounded-full transition-all cursor-pointer active:scale-90 ${
                colorTheme === 'paper'
                  ? 'hover:bg-neutral-200/70 text-neutral-700'
                  : 'hover:bg-neutral-800 text-neutral-300'
              }`}
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Linha 4: Controle de Volume iOS */}
          <div className="flex items-center gap-2 pt-1 px-1 border-t border-neutral-500/10 mt-1">
            <button
              type="button"
              onClick={() => lofiPlayer.toggleMute()}
              title={lofiState.volume === 0 || lofiState.isMuted ? 'Ativar som' : 'Silenciar som'}
              className={`p-1 rounded transition-opacity cursor-pointer active:scale-90 ${
                colorTheme === 'paper' ? 'text-neutral-500 hover:text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {lofiState.volume === 0 || lofiState.isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-purple-400" />
              )}
            </button>

            <div className="flex-1 flex items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={lofiState.isMuted ? 0 : lofiState.volume}
                onChange={(e) => lofiPlayer.setVolume(parseFloat(e.target.value))}
                title={`Volume: ${Math.round((lofiState.isMuted ? 0 : lofiState.volume) * 100)}%`}
                className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-purple-500 ${
                  colorTheme === 'paper' ? 'bg-neutral-200' : 'bg-neutral-800'
                }`}
              />
            </div>

            <button
              type="button"
              onClick={() => lofiPlayer.setVolume(Math.min(1, lofiState.volume + 0.1))}
              title="Aumentar volume"
              className={`p-1 rounded transition-opacity cursor-pointer active:scale-90 ${
                colorTheme === 'paper' ? 'text-neutral-500' : 'text-neutral-400'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <span
              className={`text-[9px] font-mono w-7 text-right tabular-nums ${
                colorTheme === 'paper' ? 'text-neutral-500' : 'text-neutral-400'
              }`}
            >
              {Math.round((lofiState.isMuted ? 0 : lofiState.volume) * 100)}%
            </span>
          </div>

          {/* Quick Station Switcher Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-neutral-500/10 mt-1">
            {[
              { id: 'jfKfPfyJRdk', name: 'Lofi Girl' },
              { id: '5yx6BWlEVcY', name: 'Chillhop' },
              { id: 'OFsJen4j9VY', name: 'Purrple Cat' },
              { id: '4Q9jq-tdOoE', name: 'Tokyo 90s' },
            ].map((chip) => {
              const isSelected = lofiState.currentTrack?.id === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => {
                    lofiPlayer.setTrack(chip.id);
                    lofiPlayer.play();
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500 text-white shadow-xs'
                      : colorTheme === 'paper'
                      ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {chip.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Quiet Reset */}
      <div className="flex items-center justify-center shrink-0 py-1">
        {timeLeftSeconds !== presetMinutes * 60 && (
          <button
            type="button"
            onClick={handleReset}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer text-xs ${currentTheme.subtext} hover:opacity-100`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar timer</span>
          </button>
        )}
      </div>

      {/* Modal / Dialog para Escolher Músicas de LoFi FM */}
      <LofiSongsModal
        isOpen={isLofiModalOpen}
        onClose={() => setIsLofiModalOpen(false)}
        playerState={lofiState}
        colorTheme={colorTheme}
      />

      {/* Modal / Dialog para Definir Tempo Personalizado */}
      {isCustomModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsCustomModalOpen(false)}
        >
          <div
            className={`w-full max-w-xs border rounded-3xl p-6 shadow-2xl ${
              colorTheme === 'paper' ? 'bg-white border-[#E0E0E0] text-black' : 'bg-[#141414] border-[#262626] text-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold tracking-tight">Definir tempo de foco</h4>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="opacity-50 hover:opacity-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomTime} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium opacity-60 mb-1.5">
                  Duração em minutos (1 a 180 min):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customInputValue}
                    onChange={(e) => setCustomInputValue(e.target.value)}
                    autoFocus
                    className={`w-full px-4 py-2.5 border rounded-xl text-lg font-bold font-mono text-center focus:outline-none ${
                      colorTheme === 'paper'
                        ? 'bg-neutral-100 border-neutral-300 text-black'
                        : 'bg-[#1F1F1F] border-[#333333] text-white'
                    }`}
                  />
                  <span className="text-xs opacity-60">min</span>
                </div>
              </div>

              {/* Quick preset buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[10, 20, 30, 40, 50, 90].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCustomInputValue(String(m))}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                      customInputValue === String(m)
                        ? colorTheme === 'paper'
                          ? 'bg-black text-white'
                          : 'bg-white text-black'
                        : colorTheme === 'paper'
                        ? 'bg-neutral-50 border-neutral-200'
                        : 'bg-[#1C1C1C] border-[#2A2A2A] text-neutral-400'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className={`flex-1 py-2.5 font-bold text-xs rounded-xl cursor-pointer ${
                    colorTheme === 'paper' ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2.5 opacity-60 hover:opacity-100 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Rápido: Link por fora (Colar Link do YouTube) */}
      {isQuickLinkModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsQuickLinkModalOpen(false)}
        >
          <div
            className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl ${
              colorTheme === 'paper' ? 'bg-white text-black' : 'bg-[#181818] text-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold tracking-tight">Tocar link por fora</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickLinkModalOpen(false)}
                className="opacity-50 hover:opacity-100 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs opacity-70 mb-3 leading-relaxed">
              Cole um link do YouTube (música, vídeo ou lofi) para tocar diretamente no reprodutor com controle de avançar e retroceder:
            </p>

            <form onSubmit={handlePlayQuickLink} className="space-y-3">
              <input
                type="text"
                placeholder="https://youtube.com/watch?v=... ou ID"
                value={quickLinkInput}
                onChange={(e) => {
                  setQuickLinkInput(e.target.value);
                  setQuickLinkError('');
                }}
                autoFocus
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono focus:outline-none ${
                  colorTheme === 'paper'
                    ? 'bg-neutral-100 text-black border border-neutral-200'
                    : 'bg-[#222222] text-white border border-[#333333]'
                }`}
              />

              {quickLinkError && (
                <p className="text-[11px] text-red-400 font-medium">{quickLinkError}</p>
              )}

              <div className="pt-1 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 font-bold text-xs rounded-xl cursor-pointer bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                >
                  Tocar agora
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuickLinkModalOpen(false)}
                  className="px-4 py-2.5 opacity-60 hover:opacity-100 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
