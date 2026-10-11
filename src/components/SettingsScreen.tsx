import React, { useState, useRef, useEffect } from 'react';
import {
  User as UserIcon,
  Sun,
  Moon,
  Sliders,
  LogOut,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Camera,
  X,
  Compass,
  Sparkles,
  ChevronRight,
  Smartphone,
  Check,
  Palette,
  Layers,
} from 'lucide-react';
import { User, UserPreferences } from '../types';
import {
  exportTasksAsJSON,
  importTasksFromJSON,
  resetDemoTasks,
  clearUserTasks,
} from '../services/storage';
import { DiscoveryTutorialModal } from './DiscoveryTutorialModal';
import { usePWAInstall } from '../utils/pwaInstall';

interface SettingsScreenProps {
  user: User;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onTasksChanged: () => void;
  onReplayOnboarding?: () => void;
  onNavigateToTab?: (tab: 'agenda' | 'foco' | 'respirar' | 'relogio') => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  user,
  preferences,
  onUpdatePreferences,
  onUpdateUser,
  onLogout,
  onTasksChanged,
  onReplayOnboarding,
  onNavigateToTab,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    setPhotoFailed(false);
  }, [user.photoUrl]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDiscoveryTutorial, setShowDiscoveryTutorial] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pwa = usePWAInstall();

  // Extract initials
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFeedback('Erro: A imagem deve ter no máximo 5MB.');
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 512;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height >= width && height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          onUpdateUser({
            ...user,
            photoUrl: dataUrl,
          });
          setFeedback('Foto de perfil atualizada com sucesso!');
          setTimeout(() => setFeedback(null), 3000);
        }
      };
      img.onerror = () => {
        setFeedback('Erro ao processar a imagem.');
        setTimeout(() => setFeedback(null), 3000);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setFeedback('Erro ao ler o arquivo.');
      setTimeout(() => setFeedback(null), 3000);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    onUpdateUser({
      ...user,
      photoUrl: undefined,
    });
    setFeedback('Foto de perfil removida.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExport = () => {
    const jsonStr = exportTasksAsJSON(user.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `day-agenda-${user.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setFeedback('Tarefas exportadas com sucesso!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importTasksFromJSON(user.id, content);
      if (result.success) {
        setFeedback(`${result.count} tarefas importadas com sucesso!`);
        onTasksChanged();
      } else {
        setFeedback(`Erro ao importar: ${result.error}`);
      }
      setTimeout(() => setFeedback(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDemo = () => {
    resetDemoTasks(user.id);
    onTasksChanged();
    setFeedback('Tarefas de demonstração restauradas!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleClearAll = () => {
    clearUserTasks(user.id);
    onTasksChanged();
    setShowClearConfirm(false);
    setFeedback('Todas as tarefas foram removidas.');
    setTimeout(() => setFeedback(null), 3000);
  };

  // Instalação do PWA
  const handleInstallPWA = async () => {
    if (pwa.hasNativePrompt) {
      const result = await pwa.triggerInstall();
      if (result.outcome === 'accepted') {
        setFeedback('Simpls instalado com sucesso na tela inicial!');
      } else if (result.outcome === 'dismissed') {
        setFeedback('Instalação cancelada pelo usuário.');
      }
      setTimeout(() => setFeedback(null), 3500);
    } else {
      // Abre o tutorial na seção de instalação
      setShowDiscoveryTutorial(true);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white pb-28 transition-colors select-none">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        {/* Title */}
        <div className="mb-2">
          <h2 className="text-xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">Conta & Configurações</h2>
        </div>

        {feedback && (
          <div className="p-3 bg-neutral-100 dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-xl flex items-center gap-2 text-xs text-[#0A0A0A] dark:text-white animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#0A0A0A] dark:text-white shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* 1. PERFIL */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373] dark:text-neutral-400 px-1">
            Perfil
          </h3>
          <div className="p-4 bg-[#F7F7F7] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative group shrink-0">
                {user.photoUrl && !photoFailed ? (
                  <img
                    src={user.photoUrl}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    onError={() => setPhotoFailed(true)}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#E5E5E5] dark:border-[#262626]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#E5E5E5] dark:bg-[#262626] text-[#0A0A0A] dark:text-white flex items-center justify-center font-bold text-lg select-none border-2 border-[#E5E5E5] dark:border-[#333333]">
                    {initials || 'U'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] rounded-full shadow-md hover:scale-105 transition-all cursor-pointer"
                  title="Alterar foto"
                  aria-label="Alterar foto"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="min-w-0">
                <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white truncate">{user.name}</h3>
                <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5 truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />
              {user.photoUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3 py-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors cursor-pointer"
                >
                  Remover
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. APARÊNCIA & ÍCONE DO APLICATIVO */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373] dark:text-neutral-400 px-1">
            Aparência
          </h3>

          {/* Tema Claro / Escuro */}
          <div className="p-3.5 bg-[#F7F7F7] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sun className="w-4 h-4 text-[#737373] dark:text-neutral-400" />
              <span className="text-xs font-semibold text-[#0A0A0A] dark:text-white">Tema</span>
            </div>
            <div className="flex items-center gap-1 p-0.5 bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] rounded-xl">
              {([
                ['light', 'Claro'],
                ['dark', 'Escuro'],
                ['system', 'Automático'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onUpdatePreferences({ theme: value })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all ${
                    preferences.theme === value
                      ? 'bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] shadow-xs'
                      : 'text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. TELA INICIAL & INSTALAÇÃO (PWA) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373] dark:text-neutral-400 px-1">
            Instalação no Celular
          </h3>

          <div className="p-4 bg-[#F7F7F7] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-200 dark:bg-[#222222] text-[#0A0A0A] dark:text-white flex items-center justify-center font-bold shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white">
                  {pwa.isInstalled ? 'Instalado na tela inicial' : 'Adicionar à tela inicial'}
                </h4>
                <p className="text-[11px] text-[#737373] dark:text-neutral-400">
                  {pwa.isInstalled
                    ? 'O Simpls já está rodando como app autônomo no seu dispositivo.'
                    : 'Abra em tela cheia com acesso instantâneo no seu celular.'}
                </p>
              </div>
            </div>

            {pwa.isInstalled ? (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Instalado</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInstallPWA}
                className="w-full sm:w-auto px-4 py-2 bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] rounded-xl text-xs font-semibold hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Adicionar à tela inicial</span>
              </button>
            )}
          </div>
        </div>

        {/* 5. AGENDA */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373] dark:text-neutral-400 px-1">
            Agenda
          </h3>
          <div className="p-3.5 bg-[#F7F7F7] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sliders className="w-4 h-4 text-[#737373] dark:text-neutral-400" />
              <span className="text-xs font-semibold text-[#0A0A0A] dark:text-white">
                Horário inicial da grade diária
              </span>
            </div>
            <select
              value={preferences.startHour}
              onChange={(e) => onUpdatePreferences({ startHour: Number(e.target.value) })}
              className="px-3 py-1.5 bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] rounded-xl text-xs font-medium text-[#0A0A0A] dark:text-white focus:outline-none cursor-pointer"
            >
              <option value={0}>00:00 (Dia inteiro)</option>
              <option value={5}>05:00</option>
              <option value={6}>06:00</option>
              <option value={7}>07:00</option>
              <option value={8}>08:00</option>
            </select>
          </div>
        </div>

        {/* 6. CONTA & SESSÃO */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373] dark:text-neutral-400 px-1">
            Sessão
          </h3>
          <button
            type="button"
            onClick={onLogout}
            className="w-full p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl flex items-center justify-between text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors cursor-pointer font-semibold text-xs"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4" />
              <span>Sair da conta</span>
            </div>
          </button>
        </div>
      </div>

      {/* Discovery Tutorial Modal */}
      <DiscoveryTutorialModal
        isOpen={showDiscoveryTutorial}
        onClose={() => setShowDiscoveryTutorial(false)}
        onNavigateToTab={onNavigateToTab}
      />
    </div>
  );
};
