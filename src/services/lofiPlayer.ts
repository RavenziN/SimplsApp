import {
  LofiTrack,
  findTrackById,
  getAllTracks,
  getActiveSongId,
  saveActiveSongId,
  getLofiVolume,
  saveLofiVolume,
  addCustomSong,
  extractYouTubeId,
} from '../utils/lofiFmSongs';

export interface LofiPlayerState {
  currentTrack: LofiTrack;
  isPlaying: boolean;
  isBuffering: boolean;
  volume: number; // 0 to 1
  isMuted: boolean;
  currentTime: number; // in seconds
  duration: number; // in seconds
}

type Listener = (state: LofiPlayerState) => void;

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

class LofiPlayerService {
  private currentTrackId: string;
  private isPlaying: boolean = false;
  private isBuffering: boolean = false;
  private volume: number = 0.6;
  private isMuted: boolean = false;
  private currentTime: number = 0;
  private duration: number = 0;
  private sessionElapsedSeconds: number = 0;
  private timeTrackingTimer: any = null;
  private ytPlayer: any = null;
  private isYtReady: boolean = false;
  private listeners: Set<Listener> = new Set();
  private containerElement: HTMLDivElement | null = null;
  private fallbackAudio: HTMLAudioElement | null = null;
  private isUsingFallback: boolean = false;

  constructor() {
    this.currentTrackId = getActiveSongId();
    this.volume = getLofiVolume();
    this.initYouTubeAPI();
  }

  private emit() {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): LofiPlayerState {
    return {
      currentTrack: findTrackById(this.currentTrackId),
      isPlaying: this.isPlaying,
      isBuffering: this.isBuffering,
      volume: this.volume,
      isMuted: this.isMuted,
      currentTime: this.currentTime,
      duration: this.duration,
    };
  }

  private initYouTubeAPI() {
    if (typeof window === 'undefined') return;

    // Check if script already exists
    if (!document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }

    const onReadyCallback = () => {
      this.createPlayer();
    };

    if (window.YT && window.YT.Player) {
      this.createPlayer();
    } else {
      const existingHandler = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (existingHandler) existingHandler();
        onReadyCallback();
      };
    }
  }

  private ensureContainer(): HTMLDivElement {
    if (this.containerElement && document.body.contains(this.containerElement)) {
      return this.containerElement;
    }

    let existing = document.getElementById('lofifm-player-holder') as HTMLDivElement;
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'lofifm-player-holder';
      // Keep rendered within viewport boundaries so browser media pipeline does not throttle playback
      existing.style.position = 'fixed';
      existing.style.bottom = '0px';
      existing.style.right = '0px';
      existing.style.width = '240px';
      existing.style.height = '180px';
      existing.style.opacity = '0.001';
      existing.style.pointerEvents = 'none';
      existing.style.zIndex = '-999';
      document.body.appendChild(existing);
    }
    this.containerElement = existing;
    return existing;
  }

  private createPlayer() {
    if (!window.YT || !window.YT.Player) return;

    const container = this.ensureContainer();
    const playerTargetId = 'lofifm-yt-target';

    let target = document.getElementById(playerTargetId);
    if (!target) {
      target = document.createElement('div');
      target.id = playerTargetId;
      container.appendChild(target);
    }

    try {
      this.ytPlayer = new window.YT.Player(playerTargetId, {
        height: '180',
        width: '240',
        videoId: this.currentTrackId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            this.isYtReady = true;
            try {
              event.target.setVolume(Math.round(this.volume * 100));
            } catch {
              // ignore
            }
            if (this.isPlaying) {
              try {
                event.target.playVideo();
              } catch {
                this.fallbackPlay();
              }
            }
            this.emit();
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
            switch (event.data) {
              case 0: // Ended -> Auto-advance to next song (just like lofi-fm)
                this.stopTimeTracking();
                this.nextTrack();
                break;
              case 1: // Playing
                this.isPlaying = true;
                this.isBuffering = false;
                this.isUsingFallback = false;
                this.stopFallback();
                this.startTimeTracking();
                this.emit();
                break;
              case 2: // Paused
                this.isPlaying = false;
                this.isBuffering = false;
                this.stopTimeTracking();
                this.emit();
                break;
              case 3: // Buffering
                this.isBuffering = true;
                this.emit();
                break;
              default:
                break;
            }
          },
          onError: () => {
            // If YouTube video is unavailable or restricted, switch to next track or fallback stream
            if (this.isPlaying) {
              this.fallbackPlay();
            }
          },
        },
      });
    } catch {
      // Fallback gracefully
    }
  }

  // Backup HTML5 radio stream in case YouTube iframe API is blocked by browser policies
  private fallbackPlay() {
    if (!this.fallbackAudio) {
      this.fallbackAudio = new Audio('https://ilm.stream27.radiohost.de/ilm_ilovechillhop_mp3-192');
      this.fallbackAudio.crossOrigin = 'anonymous';
    }
    this.fallbackAudio.volume = this.volume;
    this.fallbackAudio.play().catch(() => {
      // Autoplay without user gesture may be blocked
    });
    this.isUsingFallback = true;
    this.isPlaying = true;
    this.isBuffering = false;
    this.emit();
  }

  private stopFallback() {
    if (this.fallbackAudio) {
      this.fallbackAudio.pause();
    }
  }

  public play() {
    this.isPlaying = true;
    this.isBuffering = true;
    this.startTimeTracking();
    this.emit();

    if (this.isYtReady && this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
      try {
        this.ytPlayer.playVideo();
      } catch {
        this.fallbackPlay();
      }
    } else {
      // If YT is not ready yet, retry or use fallback
      setTimeout(() => {
        if (this.isYtReady && this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
          try {
            this.ytPlayer.playVideo();
          } catch {
            this.fallbackPlay();
          }
        } else {
          this.fallbackPlay();
        }
      }, 800);
    }
  }

  public pause() {
    this.isPlaying = false;
    this.isBuffering = false;
    this.stopTimeTracking();
    this.emit();

    if (this.isYtReady && this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      try {
        this.ytPlayer.pauseVideo();
      } catch {
        // ignore
      }
    }
    this.stopFallback();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public setTrack(trackId: string) {
    this.currentTrackId = trackId;
    this.currentTime = 0;
    this.duration = 0;
    this.sessionElapsedSeconds = 0;
    saveActiveSongId(trackId);
    this.isBuffering = true;
    this.emit();

    if (this.isYtReady && this.ytPlayer && typeof this.ytPlayer.loadVideoById === 'function') {
      try {
        if (this.isPlaying) {
          this.ytPlayer.loadVideoById(trackId);
        } else {
          this.ytPlayer.cueVideoById(trackId);
        }
      } catch {
        // Reload player if cue failed
      }
    }
  }

  private startTimeTracking() {
    this.stopTimeTracking();
    this.updateTime();
    this.timeTrackingTimer = setInterval(() => {
      this.updateTime();
    }, 500);
  }

  private stopTimeTracking() {
    if (this.timeTrackingTimer) {
      clearInterval(this.timeTrackingTimer);
      this.timeTrackingTimer = null;
    }
  }

  private updateTime() {
    let changed = false;
    const currentTrack = findTrackById(this.currentTrackId);
    const isCustom = Boolean(currentTrack?.isCustom);

    if (this.isYtReady && this.ytPlayer) {
      try {
        if (typeof this.ytPlayer.getCurrentTime === 'function') {
          const ct = this.ytPlayer.getCurrentTime() || 0;
          if (isCustom) {
            // For external user videos/links, use actual video timestamp
            if (ct >= 0 && ct < 86400 * 7 && Math.abs(ct - this.currentTime) > 0.4) {
              this.currentTime = ct;
              changed = true;
            }
          } else {
            // For radio streams/presets, keep active playing timer
            if (this.isPlaying) {
              this.sessionElapsedSeconds += 0.5;
              const effectiveTime = ct > 0 && ct < 86400 * 7 ? ct : Math.floor(this.sessionElapsedSeconds);
              if (Math.abs(effectiveTime - this.currentTime) >= 0.5) {
                this.currentTime = effectiveTime;
                changed = true;
              }
            }
          }
        }
        if (typeof this.ytPlayer.getDuration === 'function') {
          const dur = this.ytPlayer.getDuration() || 0;
          if (dur !== this.duration) {
            this.duration = dur;
            changed = true;
          }
        }
      } catch {
        // ignore
      }
    } else if (this.fallbackAudio) {
      const ct = this.fallbackAudio.currentTime || 0;
      const dur = this.fallbackAudio.duration || 0;
      if (Math.abs(ct - this.currentTime) > 0.4 || dur !== this.duration) {
        this.currentTime = ct;
        this.duration = dur;
        changed = true;
      }
    } else if (this.isPlaying) {
      this.sessionElapsedSeconds += 0.5;
      const effectiveTime = Math.floor(this.sessionElapsedSeconds);
      if (effectiveTime !== this.currentTime) {
        this.currentTime = effectiveTime;
        changed = true;
      }
    }

    if (changed) {
      this.emit();
    }
  }

  public seekTo(seconds: number) {
    const currentTrack = findTrackById(this.currentTrackId);
    // If it's a live stream without duration (duration <= 0) and not custom, ignore seek
    if (this.duration <= 0 && !currentTrack?.isCustom) {
      return;
    }

    const maxDur = this.duration > 0 ? this.duration : 86400;
    const target = Math.max(0, Math.min(maxDur, seconds));
    this.currentTime = target;

    if (this.isYtReady && this.ytPlayer && typeof this.ytPlayer.seekTo === 'function') {
      try {
        this.ytPlayer.seekTo(target, true);
      } catch {
        // ignore
      }
    } else if (this.fallbackAudio) {
      try {
        this.fallbackAudio.currentTime = target;
      } catch {
        // ignore
      }
    }

    this.emit();
  }

  public seekBy(deltaSeconds: number) {
    const newTime = Math.max(0, this.currentTime + deltaSeconds);
    this.seekTo(newTime);
  }

  public playExternalUrl(urlOrId: string, customTitle?: string, customArtist?: string): boolean {
    const videoId = extractYouTubeId(urlOrId);
    if (!videoId) return false;

    const newTrack: LofiTrack = {
      id: videoId,
      title: customTitle?.trim() || `YouTube (${videoId})`,
      artist: customArtist?.trim() || 'Link Externo',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      isCustom: true,
    };

    addCustomSong(newTrack);
    this.currentTime = 0;
    this.duration = 0;
    this.setTrack(videoId);
    this.play();
    return true;
  }

  public nextTrack() {
    const all = getAllTracks();
    const currentIndex = all.findIndex((t) => t.id === this.currentTrackId);
    const nextIndex = (currentIndex + 1) % all.length;
    this.setTrack(all[nextIndex].id);
    if (this.isPlaying) {
      this.play();
    }
  }

  public prevTrack() {
    const all = getAllTracks();
    const currentIndex = all.findIndex((t) => t.id === this.currentTrackId);
    const prevIndex = (currentIndex - 1 + all.length) % all.length;
    this.setTrack(all[prevIndex].id);
    if (this.isPlaying) {
      this.play();
    }
  }

  public setVolume(val: number) {
    const clamped = Math.max(0, Math.min(1, val));
    this.volume = clamped;
    saveLofiVolume(clamped);

    if (this.isYtReady && this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
      try {
        this.ytPlayer.setVolume(Math.round(clamped * 100));
        if (clamped === 0) {
          this.ytPlayer.mute();
          this.isMuted = true;
        } else {
          this.ytPlayer.unMute();
          this.isMuted = false;
        }
      } catch {
        // ignore
      }
    }

    if (this.fallbackAudio) {
      this.fallbackAudio.volume = clamped;
    }

    this.emit();
  }

  public toggleMute() {
    if (this.isMuted) {
      this.setVolume(this.volume > 0 ? this.volume : 0.6);
      this.isMuted = false;
    } else {
      if (this.isYtReady && this.ytPlayer && typeof this.ytPlayer.mute === 'function') {
        try {
          this.ytPlayer.mute();
        } catch {
          // ignore
        }
      }
      this.isMuted = true;
      this.emit();
    }
  }
}

export const lofiPlayer = new LofiPlayerService();
