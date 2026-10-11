/**
 * PWA Installation and Platform Detection Helper
 * Provides real browser install prompts (beforeinstallprompt) and
 * platform-specific instructions for iOS Safari and Android.
 */
import { useState, useEffect } from 'react';

export interface PWAInstallState {
  isInstallable: boolean;
  hasNativePrompt: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore
    }
  });
}

// Listen to beforeinstallprompt event globally
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notifyListeners();
  });
}

export function getPWAState(): PWAInstallState {
  if (typeof window === 'undefined') {
    return {
      isInstallable: false,
      hasNativePrompt: false,
      isInstalled: false,
      isIOS: false,
      isAndroid: false,
      isSafari: false,
    };
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isSafari = isIOS && /safari/.test(userAgent) && !/crios|fxios/.test(userAgent);

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;

  const hasNativePrompt = Boolean(deferredPrompt);
  const isInstallable = hasNativePrompt || isIOS || isAndroid;

  return {
    isInstallable,
    hasNativePrompt,
    isInstalled: isStandalone,
    isIOS,
    isAndroid,
    isSafari,
  };
}

export async function triggerNativeInstall(): Promise<{ outcome: 'accepted' | 'dismissed' | 'unsupported' }> {
  if (!deferredPrompt) {
    return { outcome: 'unsupported' };
  }

  try {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    notifyListeners();
    return { outcome: choice.outcome };
  } catch (err) {
    console.error('Error triggering PWA install:', err);
    return { outcome: 'unsupported' };
  }
}

export function usePWAInstall() {
  const [state, setState] = useState<PWAInstallState>(() => getPWAState());

  useEffect(() => {
    const update = () => setState(getPWAState());
    listeners.add(update);
    update();
    return () => {
      listeners.delete(update);
    };
  }, []);

  return {
    ...state,
    triggerInstall: triggerNativeInstall,
  };
}
