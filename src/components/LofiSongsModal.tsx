import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  Star,
  Search,
  Plus,
  ExternalLink,
  Radio,
  Music,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  LofiTrack,
  getAllTracks,
  getStarredSongIds,
  toggleStarSongId,
  addCustomSong,
  extractYouTubeId,
} from '../utils/lofiFmSongs';
import { lofiPlayer, LofiPlayerState } from '../services/lofiPlayer';

interface LofiSongsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerState: LofiPlayerState;
  colorTheme: string;
}

export const LofiSongsModal: React.FC<LofiSongsModalProps> = ({
  isOpen,
  onClose,
  playerState,
  colorTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'starred' | 'add'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [starredIds, setStarredIds] = useState<string[]>(() => getStarredSongIds());
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customArtist, setCustomArtist] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);
  const [addError, setAddError] = useState('');

  if (!isOpen) return null;

  const allTracks = getAllTracks();

  const handleToggleStar = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStarSongId(trackId);
    setStarredIds(getStarredSongIds());
  };

  const handleSelectTrack = (track: LofiTrack) => {
    lofiPlayer.setTrack(track.id);
    lofiPlayer.play();
  };

  const handleAddCustomSong = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess(false);

    const videoId = extractYouTubeId(customUrl);
    if (!videoId) {
      setAddError('URL ou ID do YouTube inválido. Exemplo: https://youtube.com/watch?v=...');
      return;
    }

    const newTrack: LofiTrack = {
      id: videoId,
      title: customTitle.trim() || `YouTube Track (${videoId})`,
      artist: customArtist.trim() || 'Personalizado',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      isCustom: true,
    };

    addCustomSong(newTrack);
    setStarredIds(getStarredSongIds());
    setAddSuccess(true);
    setCustomUrl('');
    setCustomTitle('');
    setCustomArtist('');

    // Automatically select and play the new song
    lofiPlayer.setTrack(newTrack.id);
    lofiPlayer.play();

    setTimeout(() => {
      setActiveTab('all');
      setAddSuccess(false);
    }, 1200);
  };

  const filteredTracks = allTracks.filter((track) => {
    if (activeTab === 'starred' && !starredIds.includes(track.id)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return track.title.toLowerCase().includes(q) || track.artist.toLowerCase().includes(q);
    }
    return true;
  });

  const isDark = colorTheme !== 'paper';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-[#141414] border-[#262626] text-white'
            : 'bg-white border-[#E0E0E0] text-black'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-[#262626]' : 'border-neutral-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold tracking-tight">LoFi FM Estações</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400">
                  Live
                </span>
              </div>
              <p className="text-[11px] opacity-60">
                Músicas relaxantes com curadoria de LoFi FM
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={`px-4 pt-3 pb-2 border-b flex items-center justify-between gap-2 text-xs ${
          isDark ? 'border-[#222222]' : 'border-neutral-100'
        }`}>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? isDark
                    ? 'bg-neutral-800 text-white font-bold'
                    : 'bg-neutral-100 text-black font-bold'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              Todas ({allTracks.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('starred')}
              className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'starred'
                  ? isDark
                    ? 'bg-neutral-800 text-white font-bold'
                    : 'bg-neutral-100 text-black font-bold'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              Favoritas ({starredIds.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('add')}
              className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'add'
                  ? isDark
                    ? 'bg-neutral-800 text-white font-bold'
                    : 'bg-neutral-100 text-black font-bold'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Plus className="w-3 h-3" />
              Adicionar Link
            </button>
          </div>
        </div>

        {/* Search Bar for Songs */}
        {activeTab !== 'add' && (
          <div className="px-4 py-2.5">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${
                isDark ? 'bg-[#1C1C1C] border-[#2A2A2A]' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <Search className="w-3.5 h-3.5 opacity-50" />
              <input
                type="text"
                placeholder="Buscar por música ou artista..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent focus:outline-none placeholder:opacity-50 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="opacity-50 hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 max-h-[46vh]">
          {activeTab === 'add' ? (
            <form onSubmit={handleAddCustomSong} className="py-2 space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
                <p className="font-medium">
                  Adicione qualquer vídeo ou rádio lo-fi do YouTube à sua lista de reprodução, como no lofi-fm!
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold opacity-70 mb-1">
                  Link ou ID do YouTube *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none text-xs font-mono ${
                    isDark ? 'bg-[#1C1C1C] border-[#2F2F2F]' : 'bg-neutral-50 border-neutral-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold opacity-70 mb-1">
                  Nome da Música / Estação (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Chill Lofi Beats 24/7"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none text-xs ${
                    isDark ? 'bg-[#1C1C1C] border-[#2F2F2F]' : 'bg-neutral-50 border-neutral-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold opacity-70 mb-1">
                  Artista / Canal (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Lofi Records"
                  value={customArtist}
                  onChange={(e) => setCustomArtist(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none text-xs ${
                    isDark ? 'bg-[#1C1C1C] border-[#2F2F2F]' : 'bg-neutral-50 border-neutral-300'
                  }`}
                />
              </div>

              {addError && (
                <div className="flex items-center gap-1.5 text-rose-400 text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              {addSuccess && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Música adicionada com sucesso! Iniciando reprodução...</span>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                  isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                Salvar e Tocar Agora
              </button>
            </form>
          ) : filteredTracks.length === 0 ? (
            <div className="py-12 text-center opacity-50 text-xs">
              <Music className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Nenhuma música encontrada.</p>
            </div>
          ) : (
            filteredTracks.map((track) => {
              const isActive = playerState.currentTrack.id === track.id;
              const isPlaying = isActive && playerState.isPlaying;
              const isStarred = starredIds.includes(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => handleSelectTrack(track)}
                  className={`w-full p-2.5 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer group ${
                    isActive
                      ? isDark
                        ? 'bg-neutral-800/80 border-purple-500/40 shadow-sm'
                        : 'bg-neutral-100 border-purple-500/40 shadow-sm'
                      : isDark
                      ? 'bg-[#181818] border-[#242424] hover:bg-[#202020]'
                      : 'bg-white border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-neutral-900 border border-white/10">
                      <img
                        src={track.thumbnailUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback if image fails
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        {isPlaying ? (
                          <div className="flex items-center gap-0.5">
                            <span className="w-1 h-3.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1 h-2.5 bg-white rounded-full animate-bounce" />
                          </div>
                        ) : (
                          <Play className="w-4 h-4 text-white fill-white opacity-80 group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                    </div>

                    {/* Track info */}
                    <div className="min-w-0 text-left">
                      <h4
                        className={`text-xs font-semibold truncate leading-tight ${
                          isActive ? 'text-purple-400 font-bold' : ''
                        }`}
                      >
                        {track.title}
                      </h4>
                      <p className="text-[11px] opacity-60 truncate mt-0.5">{track.artist}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleToggleStar(track.id, e)}
                      title={isStarred ? 'Remover dos favoritos' : 'Favoritar'}
                      className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isStarred ? 'fill-amber-400 text-amber-400 opacity-100' : ''
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isActive) {
                          lofiPlayer.togglePlay();
                        } else {
                          handleSelectTrack(track);
                        }
                      }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${
                        isActive && playerState.isPlaying
                          ? isDark
                            ? 'bg-purple-500 text-white'
                            : 'bg-purple-600 text-white'
                          : isDark
                          ? 'bg-neutral-700 text-white'
                          : 'bg-neutral-200 text-black'
                      }`}
                    >
                      {isActive && playerState.isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with credit */}
        <div
          className={`p-3 border-t flex items-center justify-between text-[11px] opacity-60 ${
            isDark ? 'border-[#222222] bg-[#121212]' : 'border-neutral-100 bg-neutral-50'
          }`}
        >
          <span>Estações originais de LoFi FM</span>
          <a
            href="https://lofi-fm.kiranv.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:opacity-100 underline decoration-dotted"
          >
            <span>lofi-fm.kiranv.in</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
