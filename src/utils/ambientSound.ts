import { lofiPlayer } from '../services/lofiPlayer';
import { getLofiVolume } from './lofiFmSongs';

export type AmbientSoundType = 'off' | 'rain' | 'lofi';

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentType: AmbientSoundType = 'off';
  private gainNode: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private volume: number = 0.5;
  private rainAudio: HTMLAudioElement | null = null;

  constructor() {
    this.volume = getLofiVolume();
    // Keep ambient sound volume perfectly synced with player volume
    lofiPlayer.subscribe((state) => {
      if (this.volume !== state.volume) {
        this.volume = state.volume;
        if (this.rainAudio) {
          this.rainAudio.volume = this.volume;
        }
        if (this.gainNode && this.ctx) {
          this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
      }
    });
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.rainAudio) {
      this.rainAudio.volume = this.volume;
    }
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    lofiPlayer.setVolume(this.volume);
  }

  public getVolume(): number {
    return this.volume;
  }

  public stop() {
    this.currentType = 'off';
    if (this.rainAudio) {
      this.rainAudio.pause();
      this.rainAudio.currentTime = 0;
    }
    this.cleanupNodes();
    lofiPlayer.pause();
  }

  public getCurrentType(): AmbientSoundType {
    return this.currentType;
  }

  private cleanupNodes() {
    this.activeNodes.forEach((item) => {
      if (typeof item === 'number') {
        clearInterval(item);
      } else {
        try {
          if ('stop' in item && typeof (item as any).stop === 'function') {
            (item as any).stop();
          }
          item.disconnect();
        } catch {
          // ignore cleanup errors
        }
      }
    });
    this.activeNodes = [];
  }

  public play(type: AmbientSoundType) {
    if (type === 'off') {
      this.stop();
      return;
    }

    if (type === 'lofi') {
      // Stop rain audio and start LoFi FM
      this.currentType = 'lofi';
      if (this.rainAudio) {
        this.rainAudio.pause();
      }
      this.cleanupNodes();
      lofiPlayer.play();
      return;
    }

    if (type === 'rain') {
      // Stop LoFi FM and start infinite rain loop
      lofiPlayer.pause();
      this.currentType = 'rain';
      this.cleanupNodes();

      if (!this.rainAudio) {
        this.rainAudio = new Audio('/rain.mp3');
        this.rainAudio.loop = true;
        this.rainAudio.preload = 'auto';

        // Garante repetição contínua em loop infinito em todos os navegadores
        this.rainAudio.addEventListener('ended', () => {
          if (this.currentType === 'rain' && this.rainAudio) {
            this.rainAudio.currentTime = 0;
            this.rainAudio.play().catch(() => {});
          }
        });
      }

      this.rainAudio.volume = this.volume;
      this.rainAudio.loop = true;

      const playPromise = this.rainAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio tag play deferred or restricted, falling back to Web Audio procedural rain:', err);
          // Fallback seguro usando Web Audio caso a tag de áudio seja restringida
          if (this.currentType === 'rain') {
            this.initCtx();
            if (!this.ctx) return;
            const masterGain = this.ctx.createGain();
            masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
            masterGain.connect(this.ctx.destination);
            this.gainNode = masterGain;
            this.startRainSound(this.ctx, masterGain);
          }
        });
      }
    }
  }

  // Rain sound fallback: Filtered pink/brownian noise
  private startRainSound(ctx: AudioContext, destination: GainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Bandpass / Lowpass for rain effect
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, ctx.currentTime);

    const filter2 = ctx.createBiquadFilter();
    filter2.type = 'highpass';
    filter2.frequency.setValueAtTime(180, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(filter2);
    filter2.connect(destination);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, filter2);
  }
}

export const ambientSound = new AmbientSoundEngine();

