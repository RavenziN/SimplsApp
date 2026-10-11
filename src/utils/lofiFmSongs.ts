export interface LofiTrack {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  isCustom?: boolean;
}

// 14 default songs exactly as defined in https://github.com/kiran-venugopal/lofi-fm (src/constants/songs.ts)
export const DEFAULT_LOFI_SONGS: LofiTrack[] = [
  {
    id: 'jfKfPfyJRdk',
    title: 'lofi hip hop radio 📚 beats to relax/study to',
    artist: 'Lofi Girl',
    thumbnailUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
  },
  {
    id: '5yx6BWlEVcY',
    title: 'Chillhop Radio - jazzy & lofi hip hop beats 🐾',
    artist: 'Chillhop Music',
    thumbnailUrl: 'https://img.youtube.com/vi/5yx6BWlEVcY/hqdefault.jpg',
  },
  {
    id: '7NOSDKb0HlU',
    title: 'lofi hip hop radio - beats to study/relax to 🐾',
    artist: 'Chillhop Music',
    thumbnailUrl: 'https://img.youtube.com/vi/7NOSDKb0HlU/hqdefault.jpg',
  },
  {
    id: 'OFsJen4j9VY',
    title: 'Purrple Cat 💜 Chill Lofi Sessions',
    artist: 'Purrple Cat',
    thumbnailUrl: 'https://img.youtube.com/vi/OFsJen4j9VY/hqdefault.jpg',
  },
  {
    id: 'n61ULEU7CO0',
    title: 'Best of lofi hip hop ✨ [beats to relax/study to]',
    artist: 'Lofi Girl',
    thumbnailUrl: 'https://img.youtube.com/vi/n61ULEU7CO0/hqdefault.jpg',
  },
  {
    id: '4Q9jq-tdOoE',
    title: 'Peaceful Lofi Coffee in 90s Tokyo Street 🌆 Rainy Lofi Mix',
    artist: 'Lofi on the Rooftop',
    thumbnailUrl: 'https://img.youtube.com/vi/4Q9jq-tdOoE/hqdefault.jpg',
  },
  {
    id: 'kLZ4plrttPI',
    title: 'Coffee Beach 🌊 Lofi Healing Your Soul ☕ Lofi Hip Hop',
    artist: 'Healing Me',
    thumbnailUrl: 'https://img.youtube.com/vi/kLZ4plrttPI/hqdefault.jpg',
  },
  {
    id: 'WelpRyoV0UY',
    title: 'lofi hip hop radio 🌿 chill beats to relax/study to',
    artist: 'Chill with Taiki',
    thumbnailUrl: 'https://img.youtube.com/vi/WelpRyoV0UY/hqdefault.jpg',
  },
  {
    id: 'OOCeWZm5c8U',
    title: 'lofi hiphop mix - smooth beats to relax/study to',
    artist: 'nourish.',
    thumbnailUrl: 'https://img.youtube.com/vi/OOCeWZm5c8U/hqdefault.jpg',
  },
  {
    id: 'wA0C0uRxSaE',
    title: 'Late Night Chill AF Instrumental Lofi Mix',
    artist: 'favor',
    thumbnailUrl: 'https://img.youtube.com/vi/wA0C0uRxSaE/hqdefault.jpg',
  },
  {
    id: 'vrB9wC6quaU',
    title: 'Tokyo Night Aesthetic Lofi Beats',
    artist: 'Tokyo Nights',
    thumbnailUrl: 'https://img.youtube.com/vi/vrB9wC6quaU/hqdefault.jpg',
  },
  {
    id: 'tfUPbO_vGzM',
    title: 'Cozy Rain & Warm Coffee Lofi Station',
    artist: 'Chill Beats',
    thumbnailUrl: 'https://img.youtube.com/vi/tfUPbO_vGzM/hqdefault.jpg',
  },
  {
    id: 'A6fjHQ2ZwZA',
    title: 'Sunset Chords Peaceful Lo-Fi Radio',
    artist: 'Dreamy Records',
    thumbnailUrl: 'https://img.youtube.com/vi/A6fjHQ2ZwZA/hqdefault.jpg',
  },
  {
    id: 'q0BVR5jRXxE',
    title: 'Sunday Morning Calm Chillhop Session',
    artist: 'ChilledCow Classic',
    thumbnailUrl: 'https://img.youtube.com/vi/q0BVR5jRXxE/hqdefault.jpg',
  },
];

const STORAGE_ACTIVE_SONG_KEY = 'lofifm_active_song_id';
const STORAGE_CUSTOM_SONGS_KEY = 'lofifm_custom_songs';
const STORAGE_STARRED_SONGS_KEY = 'lofifm_starred_songs';
const STORAGE_VOLUME_KEY = 'lofifm_volume';

export function getActiveSongId(): string {
  try {
    return localStorage.getItem(STORAGE_ACTIVE_SONG_KEY) || DEFAULT_LOFI_SONGS[0].id;
  } catch {
    return DEFAULT_LOFI_SONGS[0].id;
  }
}

export function saveActiveSongId(songId: string): void {
  try {
    localStorage.setItem(STORAGE_ACTIVE_SONG_KEY, songId);
  } catch {
    // ignore
  }
}

export function getCustomSongs(): LofiTrack[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_SONGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addCustomSong(song: LofiTrack): void {
  try {
    const customs = getCustomSongs().filter((s) => s.id !== song.id);
    customs.unshift(song);
    localStorage.setItem(STORAGE_CUSTOM_SONGS_KEY, JSON.stringify(customs));
  } catch {
    // ignore
  }
}

export function getStarredSongIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_STARRED_SONGS_KEY);
    return raw ? JSON.parse(raw) : [DEFAULT_LOFI_SONGS[0].id, DEFAULT_LOFI_SONGS[1].id];
  } catch {
    return [DEFAULT_LOFI_SONGS[0].id];
  }
}

export function toggleStarSongId(songId: string): boolean {
  try {
    const stars = getStarredSongIds();
    let newStars: string[];
    let isStarredNow = false;
    if (stars.includes(songId)) {
      newStars = stars.filter((id) => id !== songId);
      isStarredNow = false;
    } else {
      newStars = [...stars, songId];
      isStarredNow = true;
    }
    localStorage.setItem(STORAGE_STARRED_SONGS_KEY, JSON.stringify(newStars));
    return isStarredNow;
  } catch {
    return false;
  }
}

export function getLofiVolume(): number {
  try {
    const raw = localStorage.getItem(STORAGE_VOLUME_KEY);
    return raw ? parseFloat(raw) : 0.6;
  } catch {
    return 0.6;
  }
}

export function saveLofiVolume(volume: number): void {
  try {
    localStorage.setItem(STORAGE_VOLUME_KEY, String(volume));
  } catch {
    // ignore
  }
}

export function getAllTracks(): LofiTrack[] {
  const custom = getCustomSongs();
  return [...custom, ...DEFAULT_LOFI_SONGS];
}

export function findTrackById(id: string): LofiTrack {
  const tracks = getAllTracks();
  return (
    tracks.find((t) => t.id === id) || {
      id,
      title: 'LoFi FM Música',
      artist: 'LoFi FM',
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    }
  );
}

export function extractYouTubeId(urlOrId: string): string | null {
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtube.com')) {
      return url.searchParams.get('v');
    }
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.slice(1);
    }
  } catch {
    // Not a full URL, attempt regex
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}
